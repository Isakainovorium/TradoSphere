import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  MatchmakingQueueEntry,
  MatchmakingFormat,
  Competition,
} from '@tradosphere/types/competitions';
import { MatchmakingQueueService } from './matchmaking-queue.service';

/**
 * Matchmaking Algorithm Service
 * Core algorithm for finding compatible opponents
 */
@Injectable()
export class MatchmakingAlgorithmService {
  private readonly logger = new Logger(MatchmakingAlgorithmService.name);

  // Prevent immediate rematches (hours)
  private readonly REMATCH_COOLDOWN_HOURS = 24;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly queueService: MatchmakingQueueService,
  ) {}

  /**
   * Find matches for all searching entries
   * Called periodically by a background job
   */
  async findMatches(format: MatchmakingFormat): Promise<Competition[]> {
    const searchingEntries = await this.queueService.getSearchingEntries(format);

    if (searchingEntries.length < 2) {
      // Not enough players
      return [];
    }

    this.logger.debug(`Finding matches for ${searchingEntries.length} ${format} entries`);

    const matches: Competition[] = [];

    // Sort by search time (longest waiting first - fairness)
    const sortedEntries = [...searchingEntries].sort(
      (a, b) => a.searchStartedAt.getTime() - b.searchStartedAt.getTime(),
    );

    const matched = new Set<string>();

    for (const entry of sortedEntries) {
      if (matched.has(entry.id)) {
        continue; // Already matched
      }

      // Find compatible opponent
      const opponent = await this.findCompatibleOpponent(entry, sortedEntries, matched);

      if (opponent) {
        // Create match
        const competition = await this.createRankedCompetition(entry, opponent);
        matches.push(competition);

        // Mark as matched
        matched.add(entry.id);
        matched.add(opponent.id);

        // Update queue entries
        await this.queueService.markMatchFound({
          entryIds: [entry.id, opponent.id],
          competitionId: competition.id,
        });

        this.logger.log(
          `Match created: ${entry.userId} vs ${opponent.userId} (XP: ${entry.currentXp} vs ${opponent.currentXp})`,
        );
      } else {
        // No match found, expand search range if needed
        await this.queueService.expandSearchRange(entry.id);
      }
    }

    return matches;
  }

  /**
   * Find a compatible opponent for an entry
   */
  private async findCompatibleOpponent(
    entry: MatchmakingQueueEntry,
    allEntries: MatchmakingQueueEntry[],
    alreadyMatched: Set<string>,
  ): Promise<MatchmakingQueueEntry | null> {
    // Filter candidates
    const candidates = allEntries.filter((candidate) => {
      // Skip self
      if (candidate.id === entry.id) return false;

      // Skip already matched
      if (alreadyMatched.has(candidate.id)) return false;

      // Must be same format
      if (candidate.format !== entry.format) return false;

      // Check XP range overlap
      if (
        candidate.currentXp < entry.xpRangeMin ||
        candidate.currentXp > entry.xpRangeMax
      ) {
        return false;
      }

      // Reverse check: entry must be in candidate's range
      if (
        entry.currentXp < candidate.xpRangeMin ||
        entry.currentXp > candidate.xpRangeMax
      ) {
        return false;
      }

      return true;
    });

    if (candidates.length === 0) {
      return null;
    }

    // Check for recent matchups (prevent rematches)
    const candidatesWithoutRecentMatch = await this.filterRecentMatchups(
      entry.userId,
      candidates,
    );

    if (candidatesWithoutRecentMatch.length === 0) {
      // No candidates without recent match, allow rematch as last resort
      return this.selectBestCandidate(entry, candidates);
    }

    // Select best candidate
    return this.selectBestCandidate(entry, candidatesWithoutRecentMatch);
  }

  /**
   * Filter out candidates with recent matchups
   */
  private async filterRecentMatchups(
    userId: string,
    candidates: MatchmakingQueueEntry[],
  ): Promise<MatchmakingQueueEntry[]> {
    const cutoffTime = new Date(
      Date.now() - this.REMATCH_COOLDOWN_HOURS * 60 * 60 * 1000,
    );

    const { data: recentMatchups, error } = await this.supabase
      .from('matchmaking_history')
      .select('opponent_id')
      .eq('user_id', userId)
      .gte('matched_at', cutoffTime.toISOString());

    if (error || !recentMatchups) {
      return candidates;
    }

    const recentOpponentIds = new Set(recentMatchups.map((m) => m.opponent_id));

    return candidates.filter((c) => !recentOpponentIds.has(c.userId));
  }

  /**
   * Select best candidate from filtered list
   * Prioritizes: 1) Closest XP, 2) Longest wait time
   */
  private selectBestCandidate(
    entry: MatchmakingQueueEntry,
    candidates: MatchmakingQueueEntry[],
  ): MatchmakingQueueEntry | null {
    if (candidates.length === 0) {
      return null;
    }

    // Score each candidate
    const scored = candidates.map((candidate) => {
      const xpDiff = Math.abs(entry.currentXp - candidate.currentXp);
      const waitTime =
        Date.now() - candidate.searchStartedAt.getTime();

      // Lower score = better match
      // Prioritize XP difference (70%), wait time (30%)
      const score = xpDiff * 0.7 + waitTime * 0.0003; // 0.0003 = normalize wait time

      return { candidate, score };
    });

    // Sort by score (lowest first)
    scored.sort((a, b) => a.score - b.score);

    return scored[0].candidate;
  }

  /**
   * Create ranked competition for matched players
   */
  private async createRankedCompetition(
    entry1: MatchmakingQueueEntry,
    entry2: MatchmakingQueueEntry,
  ): Promise<Competition> {
    const avgXp = Math.round((entry1.currentXp + entry2.currentXp) / 2);
    const xpRangeMin = Math.min(entry1.currentXp, entry2.currentXp);
    const xpRangeMax = Math.max(entry1.currentXp, entry2.currentXp);

    const { data, error } = await this.supabase
      .from('competitions')
      .insert({
        competition_type: entry1.format,
        is_ranked: true,
        is_custom: false,
        creator_id: null,
        name: `Ranked ${entry1.format.toUpperCase()} Match`,
        description: `Algorithmic matchmaking: ${entry1.currentRank} vs ${entry2.currentRank}`,
        duration_hours: entry1.durationHours,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + entry1.durationHours * 60 * 60 * 1000).toISOString(),
        entry_fee: 0,
        max_participants: 2,
        current_participants: 0,
        prize_pool: 0,
        prize_distribution: {},
        status: 'pending',
        avg_xp: avgXp,
        xp_range_min: xpRangeMin,
        xp_range_max: xpRangeMax,
        auto_generated: true,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating ranked competition:', error);
      throw new Error('Failed to create ranked competition');
    }

    // Add participants
    await this.addParticipants(data.id, [entry1.userId, entry2.userId], [
      entry1.currentXp,
      entry2.currentXp,
    ]);

    // Record matchmaking history
    await this.recordMatchHistory(entry1.userId, entry2.userId, data.id, entry1.format, avgXp);

    return this.mapToCompetition(data);
  }

  /**
   * Add participants to competition
   */
  private async addParticipants(
    competitionId: string,
    userIds: string[],
    xpValues: number[],
  ): Promise<void> {
    const participants = userIds.map((userId, index) => ({
      competition_id: competitionId,
      user_id: userId,
      xp_before: xpValues[index],
    }));

    const { error } = await this.supabase
      .from('competition_participants')
      .insert(participants);

    if (error) {
      this.logger.error('Error adding participants:', error);
      throw new Error('Failed to add participants');
    }

    // Update competition participant count
    await this.supabase
      .from('competitions')
      .update({ current_participants: userIds.length })
      .eq('id', competitionId);
  }

  /**
   * Record matchmaking history to prevent rematches
   */
  private async recordMatchHistory(
    userId1: string,
    userId2: string,
    competitionId: string,
    format: MatchmakingFormat,
    xpDiff: number,
  ): Promise<void> {
    const records = [
      {
        user_id: userId1,
        opponent_id: userId2,
        competition_id: competitionId,
        format,
        xp_diff: xpDiff,
      },
      {
        user_id: userId2,
        opponent_id: userId1,
        competition_id: competitionId,
        format,
        xp_diff: xpDiff,
      },
    ];

    await this.supabase.from('matchmaking_history').insert(records);
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private mapToCompetition(data: any): Competition {
    return {
      id: data.id,
      competitionType: data.competition_type,
      isRanked: data.is_ranked,
      isCustom: data.is_custom,
      creatorId: data.creator_id,
      name: data.name,
      description: data.description,
      durationHours: data.duration_hours,
      startTime: data.start_time ? new Date(data.start_time) : null,
      endTime: data.end_time ? new Date(data.end_time) : null,
      entryFee: parseFloat(data.entry_fee),
      maxParticipants: data.max_participants,
      currentParticipants: data.current_participants,
      allowedSymbols: data.allowed_symbols,
      minRank: data.min_rank,
      maxRank: data.max_rank,
      prizePool: parseFloat(data.prize_pool),
      prizeDistribution: data.prize_distribution,
      status: data.status,
      avgXp: data.avg_xp,
      xpRangeMin: data.xp_range_min,
      xpRangeMax: data.xp_range_max,
      autoGenerated: data.auto_generated,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
