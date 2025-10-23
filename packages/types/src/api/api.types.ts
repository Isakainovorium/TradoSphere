/**
 * API Request/Response Types
 * Type definitions for all API endpoints
 */

// =====================================================
// COMMON TYPES
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode: number;
  details?: any;
}

// =====================================================
// AUTH API
// =====================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

export interface SignupResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  message: string;
}

// =====================================================
// SIGNAL API
// =====================================================

export interface CreateSignalRequest {
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  positionSize?: number;
  timeframe?: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateSignalRequest {
  status?: 'active' | 'closed' | 'cancelled';
  exitPrice?: number;
  pnl?: number;
  description?: string;
}

export interface SignalResponse {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  positionSize: number | null;
  timeframe: string | null;
  description: string | null;
  imageUrl: string | null;
  status: 'active' | 'closed' | 'cancelled';
  exitPrice: number | null;
  pnl: number | null;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParseSignalRequest {
  text: string;
}

export interface ParseSignalResponse {
  signal: {
    symbol: string;
    direction: 'long' | 'short';
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    confidence: number;
  };
  rawText: string;
}

// =====================================================
// COMPETITION API
// =====================================================

export interface CreateCustomCompetitionRequest {
  competitionType: '1v1' | 'team' | 'battle_royal' | 'mentor_clan' | 'mentor_vs_mentor';
  name: string;
  description?: string;
  durationHours: number;
  entryFee?: number;
  maxParticipants: number;
  allowedSymbols?: string[];
  minRank?: string;
  maxRank?: string;
  prizeDistribution?: Record<number, number>;
  inviteUserIds?: string[];
  isPublic?: boolean;
}

export interface JoinCompetitionRequest {
  competitionId: string;
  teamId?: string;
}

export interface FindRankedMatchRequest {
  format: '1v1' | '2v2' | '3v3' | 'battle_royal';
  durationHours?: number;
}

export interface FindRankedMatchResponse {
  queueId: string;
  status: 'searching' | 'match_found';
  searchingFor: string;
  yourRank: string;
  yourXp: number;
  xpRange: {
    min: number;
    max: number;
  };
  expiresAt: string;
}

export interface MatchFoundResponse {
  queueId: string;
  competitionId: string;
  format: string;
  opponent: {
    userId: string;
    username: string;
    currentRank: string;
    currentXp: number;
    winRate: number;
    totalCompetitions: number;
  };
  xpAtStake: {
    onWin: number;
    onLoss: number;
  };
  acceptDeadline: string;
}

export interface LeaderboardResponse {
  seasonId: number;
  entries: Array<{
    rank: number;
    userId: string;
    username: string;
    avatarUrl: string | null;
    currentRank: string;
    xp: number;
    wins: number;
    totalCompetitions: number;
    winRate: number;
    winStreak: number;
  }>;
  currentUserRank: number | null;
  totalPlayers: number;
}

// =====================================================
// GEMINI API
// =====================================================

export interface AnalyzeTradeRequest {
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  userNotes?: string;
}

export interface AnalyzeTradeResponse {
  analysis: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    riskAssessment: string;
  };
  score: {
    overall: number;
    execution: number;
    riskManagement: number;
    timing: number;
  };
}

export interface SummarizeChatRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface SummarizeChatResponse {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}

export interface LearningQARequest {
  question: string;
  context?: string;
}

export interface LearningQAResponse {
  answer: string;
  relatedTopics: string[];
  resources: Array<{
    title: string;
    type: 'video' | 'article' | 'course';
    url?: string;
  }>;
}

// =====================================================
// BROKER API
// =====================================================

export interface ConnectBrokerRequest {
  brokerName: string;
  apiKey: string;
  apiSecret?: string;
  accountId?: string;
}

export interface ConnectBrokerResponse {
  connection: {
    id: string;
    brokerName: string;
    accountId: string;
    status: 'connected' | 'disconnected' | 'error';
    balance?: number;
    equity?: number;
  };
  message: string;
}

export interface BrokerTradeResponse {
  id: string;
  brokerTradeId: string;
  symbol: string;
  direction: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  exitPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  pnl: number | null;
  commission: number | null;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt: string | null;
}

export interface BrokerBalanceResponse {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  openPositions: number;
  currency: string;
}

// =====================================================
// USER/PROFILE API
// =====================================================

export interface UpdateProfileRequest {
  username?: string;
  fullName?: string;
  bio?: string;
  website?: string;
  twitterHandle?: string;
  avatarUrl?: string;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  twitterHandle: string | null;
  // Stats
  followersCount: number;
  followingCount: number;
  signalsCount: number;
  // Ranking
  currentRank: string;
  currentXp: number;
  winRate: number;
  totalCompetitions: number;
  // Subscription
  tier: 'free' | 'tsgrow' | 'elite' | 'gladiator';
  isCreator: boolean;
  createdAt: string;
}

// =====================================================
// SUBSCRIPTION API
// =====================================================

export interface UpdateSubscriptionRequest {
  tier: 'free' | 'tsgrow' | 'elite' | 'gladiator';
  billingCycle?: 'monthly' | 'yearly';
  paymentMethodId?: string;
}

export interface SubscriptionResponse {
  subscription: {
    tier: string;
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  invoice?: {
    amount: number;
    dueDate: string;
    status: string;
  };
}

export interface CreateCreatorSubscriptionRequest {
  creatorId: string;
  tier: string;
  price: number;
}

// =====================================================
// NOTIFICATION API
// =====================================================

export interface NotificationResponse {
  id: string;
  type: 'match_found' | 'competition_ended' | 'rank_up' | 'new_follower' | 'signal_liked';
  title: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: string;
}

// =====================================================
// STREAMING API
// =====================================================

export interface CreateStreamRequest {
  title: string;
  description?: string;
  category?: string;
}

export interface StreamResponse {
  streamId: string;
  title: string;
  streamKey: string;
  agoraToken: string;
  channelName: string;
  status: 'live' | 'offline';
  viewerCount: number;
  startedAt: string | null;
}

// =====================================================
// RATE LIMIT HEADERS
// =====================================================

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
}
