/**
 * Competition Matchmaking & XP System Types
 * Types for ranked matchmaking, XP tracking, and leaderboards
 */

// =====================================================
// RANK TIERS & XP
// =====================================================

export type RankTier =
  | 'Bronze III'
  | 'Bronze II'
  | 'Bronze I'
  | 'Silver III'
  | 'Silver II'
  | 'Silver I'
  | 'Gold III'
  | 'Gold II'
  | 'Gold I'
  | 'Platinum III'
  | 'Platinum II'
  | 'Platinum I'
  | 'Diamond III'
  | 'Diamond II'
  | 'Diamond I'
  | 'Champion';

export type RankTierNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export interface RankThreshold {
  tier: RankTier;
  tierNumber: RankTierNumber;
  minXp: number;
  maxXp: number;
  emoji: string;
  color: string;
}

export const RANK_THRESHOLDS: RankThreshold[] = [
  { tier: 'Bronze III', tierNumber: 1, minXp: 0, maxXp: 199, emoji: '🥉', color: '#CD7F32' },
  { tier: 'Bronze II', tierNumber: 2, minXp: 200, maxXp: 399, emoji: '🥉', color: '#CD7F32' },
  { tier: 'Bronze I', tierNumber: 3, minXp: 400, maxXp: 599, emoji: '🥉', color: '#CD7F32' },
  { tier: 'Silver III', tierNumber: 4, minXp: 600, maxXp: 799, emoji: '🥈', color: '#C0C0C0' },
  { tier: 'Silver II', tierNumber: 5, minXp: 800, maxXp: 999, emoji: '🥈', color: '#C0C0C0' },
  { tier: 'Silver I', tierNumber: 6, minXp: 1000, maxXp: 1199, emoji: '🥈', color: '#C0C0C0' },
  { tier: 'Gold III', tierNumber: 7, minXp: 1200, maxXp: 1399, emoji: '🥇', color: '#FFD700' },
  { tier: 'Gold II', tierNumber: 8, minXp: 1400, maxXp: 1599, emoji: '🥇', color: '#FFD700' },
  { tier: 'Gold I', tierNumber: 9, minXp: 1600, maxXp: 1799, emoji: '🥇', color: '#FFD700' },
  { tier: 'Platinum III', tierNumber: 10, minXp: 1800, maxXp: 1999, emoji: '💎', color: '#E5E4E2' },
  { tier: 'Platinum II', tierNumber: 11, minXp: 2000, maxXp: 2199, emoji: '💎', color: '#E5E4E2' },
  { tier: 'Platinum I', tierNumber: 12, minXp: 2200, maxXp: 2399, emoji: '💎', color: '#E5E4E2' },
  { tier: 'Diamond III', tierNumber: 13, minXp: 2400, maxXp: 2599, emoji: '💠', color: '#B9F2FF' },
  { tier: 'Diamond II', tierNumber: 14, minXp: 2600, maxXp: 2799, emoji: '💠', color: '#B9F2FF' },
  { tier: 'Diamond I', tierNumber: 15, minXp: 2800, maxXp: 2999, emoji: '💠', color: '#B9F2FF' },
  { tier: 'Champion', tierNumber: 16, minXp: 3000, maxXp: 999999, emoji: '👑', color: '#FFD700' },
];

// =====================================================
// USER RANKING
// =====================================================

export interface UserRanking {
  id: string;
  userId: string;

  // Current standing
  currentXp: number;
  currentRank: RankTier;
  rankTier: RankTierNumber;

  // Performance metrics
  totalCompetitions: number;
  wins: number;
  losses: number;
  winRate: number;

  // Streaks
  currentWinStreak: number;
  currentLossStreak: number;
  bestWinStreak: number;

  // Peak performance
  peakXp: number;
  peakRank: RankTier;
  peakRankAchievedAt: Date | null;

  // Activity
  lastCompetitionAt: Date | null;
  daysActiveThisWeek: number;
  lastActiveDate: Date | null;

  // Season stats
  seasonId: number;
  seasonXp: number;
  seasonWins: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// XP TRANSACTIONS
// =====================================================

export type XpTransactionReason =
  | 'competition_win'
  | 'competition_loss'
  | 'streak_bonus'
  | 'daily_activity'
  | 'rank_decay'
  | 'season_reset'
  | 'manual_adjustment';

export interface XpTransaction {
  id: string;
  userId: string;
  competitionId: string | null;

  // XP change
  xpChange: number;
  xpBefore: number;
  xpAfter: number;

  // Reason
  reason: XpTransactionReason;
  reasonDetails: Record<string, any>;

  // Rank change
  rankBefore: RankTier | null;
  rankAfter: RankTier | null;
  rankUp: boolean;
  rankDown: boolean;

  // Timestamp
  createdAt: Date;
}

// =====================================================
// MATCHMAKING QUEUE
// =====================================================

export type MatchmakingFormat = '1v1' | '2v2' | '3v3' | 'battle_royal';

export type MatchmakingStatus =
  | 'searching'
  | 'match_found'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'cancelled';

export interface MatchmakingQueueEntry {
  id: string;
  userId: string;

  // Queue parameters
  format: MatchmakingFormat;
  durationHours: number;
  currentXp: number;
  currentRank: RankTier;

  // Search parameters
  xpRangeMin: number;
  xpRangeMax: number;
  searchStartedAt: Date;
  searchExpandedCount: number;

  // Match status
  status: MatchmakingStatus;
  matchedWith: string[] | null;
  matchFoundAt: Date | null;
  matchAcceptedAt: Date | null;
  expiresAt: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// COMPETITION (Extended)
// =====================================================

export type CompetitionType =
  | '1v1'
  | 'team'
  | 'battle_royal'
  | 'mentor_clan'
  | 'mentor_vs_mentor'
  | 'ranked_match';

export type CompetitionStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Competition {
  id: string;

  // Type and mode
  competitionType: CompetitionType;
  isRanked: boolean;
  isCustom: boolean;

  // Creator (null for auto-generated ranked)
  creatorId: string | null;

  // Rules
  name: string;
  description: string | null;
  durationHours: number;
  startTime: Date | null;
  endTime: Date | null;

  // Entry
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;

  // Restrictions
  allowedSymbols: string[] | null;
  minRank: RankTier | null;
  maxRank: RankTier | null;

  // Prize pool
  prizePool: number;
  prizeDistribution: Record<number, number>;

  // Status
  status: CompetitionStatus;

  // Matchmaking details (for ranked)
  avgXp: number | null;
  xpRangeMin: number | null;
  xpRangeMax: number | null;
  autoGenerated: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// COMPETITION PARTICIPANT (Extended)
// =====================================================

export interface CompetitionParticipant {
  id: string;
  competitionId: string;
  userId: string;
  teamId: string | null;

  // Entry
  joinedAt: Date;
  entryFeePaid: number;

  // Performance
  totalTrades: number;
  winningTrades: number;
  totalPnl: number;

  // Ranking
  currentRank: number | null;
  finalRank: number | null;

  // Prizes
  prizeAmount: number;
  prizePaid: boolean;

  // XP changes (for ranked)
  xpBefore: number | null;
  xpAfter: number | null;
  xpGained: number | null;
}

// =====================================================
// GLOBAL LEADERBOARD
// =====================================================

export interface GlobalLeaderboardEntry {
  id: string;
  userId: string;

  // Rankings
  globalRank: number;
  rankTier: RankTier;
  xp: number;

  // Statistics
  totalWins: number;
  totalCompetitions: number;
  winRate: number;

  // Season
  seasonId: number;

  // Metadata
  snapshotDate: Date;
}

// =====================================================
// MATCHMAKING HISTORY
// =====================================================

export interface MatchmakingHistory {
  id: string;
  userId: string;
  opponentId: string;
  competitionId: string | null;

  // Match details
  format: MatchmakingFormat;
  xpDiff: number | null;

  // Timestamp
  matchedAt: Date;
}

// =====================================================
// DTOs (Data Transfer Objects)
// =====================================================

export interface FindRankedMatchDto {
  format: MatchmakingFormat;
  durationHours?: number; // Default: 72 (3 days)
}

export interface AcceptMatchDto {
  queueId: string;
}

export interface DeclineMatchDto {
  queueId: string;
  reason?: string;
}

export interface UpdateXpDto {
  userId: string;
  xpChange: number;
  reason: XpTransactionReason;
  competitionId?: string;
  reasonDetails?: Record<string, any>;
}

export interface CreateCustomCompetitionDto {
  competitionType: CompetitionType;
  name: string;
  description?: string;
  durationHours: number;
  entryFee?: number;
  maxParticipants: number;
  allowedSymbols?: string[];
  minRank?: RankTier;
  maxRank?: RankTier;
  prizeDistribution?: Record<number, number>;
  inviteUserIds?: string[];
  isPublic?: boolean;
}

export interface JoinCompetitionDto {
  competitionId: string;
  teamId?: string;
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface MatchFoundResponse {
  queueId: string;
  competitionId: string;
  format: MatchmakingFormat;
  opponent: {
    userId: string;
    username: string;
    currentRank: RankTier;
    currentXp: number;
    winRate: number;
    totalCompetitions: number;
  };
  xpAtStake: {
    onWin: number;
    onLoss: number;
  };
  acceptDeadline: Date;
}

export interface LeaderboardResponse {
  seasonId: number;
  entries: (GlobalLeaderboardEntry & {
    username: string;
    avatarUrl: string | null;
  })[];
  currentUserRank: number | null;
  totalPlayers: number;
}

export interface RankProgressResponse {
  currentRank: RankTier;
  currentXp: number;
  nextRank: RankTier | null;
  xpToNextRank: number | null;
  progressPercentage: number;
  recentXpChanges: XpTransaction[];
}

// =====================================================
// HELPER FUNCTIONS (Types)
// =====================================================

export interface XpCalculationResult {
  baseXp: number;
  performanceMultiplier: number;
  streakBonus: number;
  consistencyBonus: number;
  totalXp: number;
}

export interface MatchmakingSearchParams {
  format: MatchmakingFormat;
  userXp: number;
  searchStartTime: Date;
  expandedCount: number;
}

export interface XpRangeParams {
  min: number;
  max: number;
}
