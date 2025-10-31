import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  MatchmakingQueueEntry,
  MatchmakingFormat,
  MatchmakingStatus,
  FindRankedMatchDto,
} from '@tradosphere/types/competitions';

/**
 * Matchmaking Queue Service
 * Manages the matchmaking queue for ranked competitions
 */
@Injectable()
export class MatchmakingQueueService {
  private readonly logger = new Logger(MatchmakingQueueService.name);

  // Search range expansion (in seconds)
  private readonly EXPAND_AFTER_SECONDS = [30, 60, 120];
  private readonly XP_RANGE_EXPANSION = [100, 200, 300, 500];

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Add user to matchmaking queue
   */
  async joinQueue(params: {
    userId: string;
    userXp: number;
    userRank: string;
    dto: FindRankedMatchDto;
  }): Promise<MatchmakingQueueEntry> {
    const { userId, userXp, userRank, dto } = params;

    // Check if user already in queue
    const existing = await this.getUserQueueEntry(userId);
    if (existing && existing.status === 'searching') {
      this.logger.warn(`User ${userId} already in queue`);
      return existing;
    }

    // Initial search range: ±100 XP
    const initialRange = this.XP_RANGE_EXPANSION[0];

    const { data, error } = await this.supabase
      .from('matchmaking_queue')
      .insert({
        user_id: userId,
        format: dto.format,
        duration_hours: dto.durationHours || 72,
        current_xp: userXp,
        current_rank: userRank,
        xp_range_min: Math.max(0, userXp - initialRange),
        xp_range_max: userXp + initialRange,
        status: 'searching',
        search_started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error joining queue:', error);
      throw new Error('Failed to join matchmaking queue');
    }

    this.logger.log(`User ${userId} joined ${dto.format} queue (XP: ${userXp})`);

    return this.mapToQueueEntry(data);
  }

  /**
   * Leave matchmaking queue
   */
  async leaveQueue(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('matchmaking_queue')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('status', 'searching');

    if (error) {
      this.logger.error('Error leaving queue:', error);
      throw new Error('Failed to leave queue');
    }

    this.logger.log(`User ${userId} left queue`);
  }

  /**
   * Get user's queue entry
   */
  async getUserQueueEntry(userId: string): Promise<MatchmakingQueueEntry | null> {
    const { data, error } = await this.supabase
      .from('matchmaking_queue')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['searching', 'match_found'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToQueueEntry(data);
  }

  /**
   * Expand search range for entry
   */
  async expandSearchRange(entryId: string): Promise<MatchmakingQueueEntry> {
    // Get current entry
    const { data: current, error: fetchError } = await this.supabase
      .from('matchmaking_queue')
      .select('*')
      .eq('id', entryId)
      .single();

    if (fetchError || !current) {
      throw new Error('Queue entry not found');
    }

    const searchElapsedSeconds = Math.floor(
      (Date.now() - new Date(current.search_started_at).getTime()) / 1000,
    );

    // Determine new expansion level
    let newExpansionLevel = current.search_expanded_count;
    for (let i = 0; i < this.EXPAND_AFTER_SECONDS.length; i++) {
      if (searchElapsedSeconds >= this.EXPAND_AFTER_SECONDS[i] && newExpansionLevel === i) {
        newExpansionLevel = i + 1;
        break;
      }
    }

    if (newExpansionLevel === current.search_expanded_count) {
      // No expansion needed
      return this.mapToQueueEntry(current);
    }

    // Calculate new range
    const expansionAmount = this.XP_RANGE_EXPANSION[newExpansionLevel];
    const newMin = Math.max(0, current.current_xp - expansionAmount);
    const newMax = current.current_xp + expansionAmount;

    // Update entry
    const { data: updated, error: updateError } = await this.supabase
      .from('matchmaking_queue')
      .update({
        xp_range_min: newMin,
        xp_range_max: newMax,
        search_expanded_count: newExpansionLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single();

    if (updateError) {
      throw new Error('Failed to expand search range');
    }

    this.logger.log(
      `Expanded search for entry ${entryId}: ±${expansionAmount} XP (level ${newExpansionLevel})`,
    );

    return this.mapToQueueEntry(updated);
  }

  /**
   * Mark match as found
   */
  async markMatchFound(params: {
    entryIds: string[];
    competitionId: string;
  }): Promise<void> {
    const { entryIds, competitionId } = params;

    const { error } = await this.supabase
      .from('matchmaking_queue')
      .update({
        status: 'match_found',
        match_found_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', entryIds);

    if (error) {
      this.logger.error('Error marking match found:', error);
      throw new Error('Failed to mark match found');
    }

    this.logger.log(`Match found for entries: ${entryIds.join(', ')}`);
  }

  /**
   * Accept match
   */
  async acceptMatch(userId: string, queueId: string): Promise<void> {
    const { error } = await this.supabase
      .from('matchmaking_queue')
      .update({
        status: 'accepted',
        match_accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', queueId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error('Error accepting match:', error);
      throw new Error('Failed to accept match');
    }

    this.logger.log(`User ${userId} accepted match ${queueId}`);
  }

  /**
   * Decline match
   */
  async declineMatch(userId: string, queueId: string): Promise<void> {
    const { error } = await this.supabase
      .from('matchmaking_queue')
      .update({
        status: 'declined',
        updated_at: new Date().toISOString(),
      })
      .eq('id', queueId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error('Error declining match:', error);
      throw new Error('Failed to decline match');
    }

    this.logger.log(`User ${userId} declined match ${queueId}`);
  }

  /**
   * Clean expired queue entries
   */
  async cleanExpiredEntries(): Promise<number> {
    const { data, error } = await this.supabase
      .from('matchmaking_queue')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('status', 'searching')
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      this.logger.error('Error cleaning expired entries:', error);
      return 0;
    }

    const count = data?.length || 0;
    if (count > 0) {
      this.logger.log(`Cleaned ${count} expired queue entries`);
    }

    return count;
  }

  /**
   * Get all searching entries for a format
   */
  async getSearchingEntries(format: MatchmakingFormat): Promise<MatchmakingQueueEntry[]> {
    const { data, error } = await this.supabase
      .from('matchmaking_queue')
      .select('*')
      .eq('format', format)
      .eq('status', 'searching')
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error('Error fetching searching entries:', error);
      return [];
    }

    return data.map(this.mapToQueueEntry);
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private mapToQueueEntry(data: any): MatchmakingQueueEntry {
    return {
      id: data.id,
      userId: data.user_id,
      format: data.format,
      durationHours: data.duration_hours,
      currentXp: data.current_xp,
      currentRank: data.current_rank,
      xpRangeMin: data.xp_range_min,
      xpRangeMax: data.xp_range_max,
      searchStartedAt: new Date(data.search_started_at),
      searchExpandedCount: data.search_expanded_count,
      status: data.status,
      matchedWith: data.matched_with,
      matchFoundAt: data.match_found_at ? new Date(data.match_found_at) : null,
      matchAcceptedAt: data.match_accepted_at ? new Date(data.match_accepted_at) : null,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
