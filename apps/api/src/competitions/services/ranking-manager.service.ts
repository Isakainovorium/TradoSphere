import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  UserRanking,
  RankTier,
  RANK_THRESHOLDS,
  XpTransactionReason,
  XpTransaction,
} from '@tradosphere/types/competitions';

/**
 * Ranking Manager Service
 * Manages user rankings, XP updates, and rank progression
 */
@Injectable()
export class RankingManagerService {
  private readonly logger = new Logger(RankingManagerService.name);

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Get or create user ranking
   */
  async getOrCreateUserRanking(userId: string): Promise<UserRanking> {
    // Try to get existing ranking
    const { data: existing, error: fetchError } = await this.supabase
      .from('user_rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing && !fetchError) {
      return this.mapToUserRanking(existing);
    }

    // Create new ranking if doesn't exist
    const { data: newRanking, error: createError } = await this.supabase
      .from('user_rankings')
      .insert({
        user_id: userId,
        current_xp: 0,
        current_rank: 'Bronze III',
        rank_tier: 1,
      })
      .select()
      .single();

    if (createError) {
      this.logger.error('Error creating user ranking:', createError);
      throw new Error('Failed to create user ranking');
    }

    return this.mapToUserRanking(newRanking);
  }

  /**
   * Update user XP
   */
  async updateUserXp(params: {
    userId: string;
    xpChange: number;
    reason: XpTransactionReason;
    competitionId?: string;
    reasonDetails?: Record<string, any>;
  }): Promise<{ ranking: UserRanking; transaction: XpTransaction }> {
    const { userId, xpChange, reason, competitionId, reasonDetails } = params;

    // Get current ranking
    const currentRanking = await this.getOrCreateUserRanking(userId);

    // Calculate new XP (cannot go below 0)
    const newXp = Math.max(0, currentRanking.currentXp + xpChange);

    // Determine new rank
    const oldRank = currentRanking.currentRank;
    const newRank = this.calculateRankFromXp(newXp);
    const rankUp = this.getRankTierNumber(newRank) > this.getRankTierNumber(oldRank);
    const rankDown = this.getRankTierNumber(newRank) < this.getRankTierNumber(oldRank);

    // Update user ranking
    const { data: updatedRanking, error: updateError } = await this.supabase
      .from('user_rankings')
      .update({
        current_xp: newXp,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      this.logger.error('Error updating user ranking:', updateError);
      throw new Error('Failed to update user ranking');
    }

    // Create XP transaction
    const { data: transaction, error: txError } = await this.supabase
      .from('xp_transactions')
      .insert({
        user_id: userId,
        competition_id: competitionId || null,
        xp_change: xpChange,
        xp_before: currentRanking.currentXp,
        xp_after: newXp,
        reason,
        reason_details: reasonDetails || {},
        rank_before: oldRank,
        rank_after: newRank,
        rank_up: rankUp,
        rank_down: rankDown,
      })
      .select()
      .single();

    if (txError) {
      this.logger.error('Error creating XP transaction:', txError);
      throw new Error('Failed to create XP transaction');
    }

    this.logger.log(`User ${userId} XP updated: ${currentRanking.currentXp} → ${newXp} (${xpChange >= 0 ? '+' : ''}${xpChange})`);

    if (rankUp) {
      this.logger.log(`🎉 User ${userId} ranked up: ${oldRank} → ${newRank}`);
    } else if (rankDown) {
      this.logger.log(`📉 User ${userId} ranked down: ${oldRank} → ${newRank}`);
    }

    return {
      ranking: this.mapToUserRanking(updatedRanking),
      transaction: this.mapToXpTransaction(transaction),
    };
  }

  /**
   * Update win/loss stats
   */
  async updateCompetitionStats(params: {
    userId: string;
    won: boolean;
  }): Promise<UserRanking> {
    const { userId, won } = params;

    const currentRanking = await this.getOrCreateUserRanking(userId);

    const updates: any = {
      total_competitions: currentRanking.totalCompetitions + 1,
      updated_at: new Date().toISOString(),
    };

    if (won) {
      updates.wins = currentRanking.wins + 1;
      updates.current_win_streak = currentRanking.currentWinStreak + 1;
      updates.current_loss_streak = 0;

      // Update best win streak if current exceeds it
      if (updates.current_win_streak > currentRanking.bestWinStreak) {
        updates.best_win_streak = updates.current_win_streak;
      }
    } else {
      updates.losses = currentRanking.losses + 1;
      updates.current_loss_streak = currentRanking.currentLossStreak + 1;
      updates.current_win_streak = 0;
    }

    const { data, error } = await this.supabase
      .from('user_rankings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating competition stats:', error);
      throw new Error('Failed to update competition stats');
    }

    return this.mapToUserRanking(data);
  }

  /**
   * Get user's XP transaction history
   */
  async getXpHistory(userId: string, limit = 20): Promise<XpTransaction[]> {
    const { data, error } = await this.supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error('Error fetching XP history:', error);
      throw new Error('Failed to fetch XP history');
    }

    return data.map(this.mapToXpTransaction);
  }

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(params: {
    seasonId: number;
    limit?: number;
    offset?: number;
  }): Promise<UserRanking[]> {
    const { seasonId, limit = 100, offset = 0 } = params;

    const { data, error } = await this.supabase
      .from('user_rankings')
      .select('*')
      .eq('season_id', seasonId)
      .order('current_xp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard');
    }

    return data.map(this.mapToUserRanking);
  }

  /**
   * Calculate rank from XP
   */
  calculateRankFromXp(xp: number): RankTier {
    for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= RANK_THRESHOLDS[i].minXp) {
        return RANK_THRESHOLDS[i].tier;
      }
    }
    return 'Bronze III';
  }

  /**
   * Get rank tier number
   */
  getRankTierNumber(rank: RankTier): number {
    const threshold = RANK_THRESHOLDS.find((t) => t.tier === rank);
    return threshold?.tierNumber || 1;
  }

  /**
   * Get XP required for next rank
   */
  getXpToNextRank(currentXp: number): { nextRank: RankTier | null; xpNeeded: number | null } {
    const currentRank = this.calculateRankFromXp(currentXp);
    const currentTierNumber = this.getRankTierNumber(currentRank);

    if (currentTierNumber >= 16) {
      // Already at Champion
      return { nextRank: null, xpNeeded: null };
    }

    const nextThreshold = RANK_THRESHOLDS.find((t) => t.tierNumber === currentTierNumber + 1);
    if (!nextThreshold) {
      return { nextRank: null, xpNeeded: null };
    }

    return {
      nextRank: nextThreshold.tier,
      xpNeeded: nextThreshold.minXp - currentXp,
    };
  }

  /**
   * Process rank decay for inactive users
   */
  async processRankDecay(userId: string, daysSinceLastActivity: number): Promise<void> {
    let xpDecay = 0;

    if (daysSinceLastActivity >= 30) {
      xpDecay = -100;
    } else if (daysSinceLastActivity >= 14) {
      xpDecay = -50;
    }

    if (xpDecay < 0) {
      await this.updateUserXp({
        userId,
        xpChange: xpDecay,
        reason: 'rank_decay',
        reasonDetails: { daysSinceLastActivity },
      });
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private mapToUserRanking(data: any): UserRanking {
    return {
      id: data.id,
      userId: data.user_id,
      currentXp: data.current_xp,
      currentRank: data.current_rank,
      rankTier: data.rank_tier,
      totalCompetitions: data.total_competitions,
      wins: data.wins,
      losses: data.losses,
      winRate: parseFloat(data.win_rate),
      currentWinStreak: data.current_win_streak,
      currentLossStreak: data.current_loss_streak,
      bestWinStreak: data.best_win_streak,
      peakXp: data.peak_xp,
      peakRank: data.peak_rank,
      peakRankAchievedAt: data.peak_rank_achieved_at ? new Date(data.peak_rank_achieved_at) : null,
      lastCompetitionAt: data.last_competition_at ? new Date(data.last_competition_at) : null,
      daysActiveThisWeek: data.days_active_this_week,
      lastActiveDate: data.last_active_date ? new Date(data.last_active_date) : null,
      seasonId: data.season_id,
      seasonXp: data.season_xp,
      seasonWins: data.season_wins,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToXpTransaction(data: any): XpTransaction {
    return {
      id: data.id,
      userId: data.user_id,
      competitionId: data.competition_id,
      xpChange: data.xp_change,
      xpBefore: data.xp_before,
      xpAfter: data.xp_after,
      reason: data.reason,
      reasonDetails: data.reason_details,
      rankBefore: data.rank_before,
      rankAfter: data.rank_after,
      rankUp: data.rank_up,
      rankDown: data.rank_down,
      createdAt: new Date(data.created_at),
    };
  }
}
