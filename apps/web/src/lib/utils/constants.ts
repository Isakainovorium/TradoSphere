/**
 * Application Constants
 * Centralized constants to avoid magic strings
 */

// =====================================================
// APP INFO
// =====================================================

export const APP_NAME = 'TradoSphere';
export const APP_DESCRIPTION = 'The ultimate social trading platform for competitive traders';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// =====================================================
// SUBSCRIPTION TIERS
// =====================================================

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  TSGROW: 'tsgrow',
  ELITE: 'elite',
  GLADIATOR: 'gladiator',
} as const;

export const TIER_PRICES = {
  [SUBSCRIPTION_TIERS.FREE]: 0,
  [SUBSCRIPTION_TIERS.TSGROW]: 9.99,
  [SUBSCRIPTION_TIERS.ELITE]: 35.0,
  [SUBSCRIPTION_TIERS.GLADIATOR]: 50.0,
} as const;

export const TIER_FEATURES = {
  [SUBSCRIPTION_TIERS.FREE]: {
    name: 'Free',
    price: 0,
    aiRequests: 5,
    brokerConnections: 0,
    liveStreaming: false,
    competitions: false,
    autoJournal: false,
  },
  [SUBSCRIPTION_TIERS.TSGROW]: {
    name: 'TSGrow',
    price: 9.99,
    aiRequests: 'own_key',
    brokerConnections: 1,
    liveStreaming: false,
    competitions: false,
    autoJournal: true,
  },
  [SUBSCRIPTION_TIERS.ELITE]: {
    name: 'TS Elite',
    price: 35.0,
    aiRequests: 1000,
    brokerConnections: 3,
    liveStreaming: true,
    competitions: true,
    autoJournal: true,
  },
  [SUBSCRIPTION_TIERS.GLADIATOR]: {
    name: 'TS Gladiator',
    price: 50.0,
    aiRequests: 10000,
    brokerConnections: 11,
    liveStreaming: true,
    competitions: true,
    autoJournal: true,
  },
} as const;

// =====================================================
// RANK TIERS
// =====================================================

export const RANK_TIERS = [
  'Bronze III',
  'Bronze II',
  'Bronze I',
  'Silver III',
  'Silver II',
  'Silver I',
  'Gold III',
  'Gold II',
  'Gold I',
  'Platinum III',
  'Platinum II',
  'Platinum I',
  'Diamond III',
  'Diamond II',
  'Diamond I',
  'Champion',
] as const;

export const XP_PER_RANK = {
  'Bronze III': 0,
  'Bronze II': 200,
  'Bronze I': 400,
  'Silver III': 600,
  'Silver II': 800,
  'Silver I': 1000,
  'Gold III': 1200,
  'Gold II': 1400,
  'Gold I': 1600,
  'Platinum III': 1800,
  'Platinum II': 2000,
  'Platinum I': 2200,
  'Diamond III': 2400,
  'Diamond II': 2600,
  'Diamond I': 2800,
  Champion: 3000,
} as const;

// =====================================================
// COMPETITION TYPES
// =====================================================

export const COMPETITION_TYPES = {
  ONE_V_ONE: '1v1',
  TEAM: 'team',
  BATTLE_ROYAL: 'battle_royal',
  MENTOR_CLAN: 'mentor_clan',
  MENTOR_VS_MENTOR: 'mentor_vs_mentor',
  RANKED_MATCH: 'ranked_match',
} as const;

export const COMPETITION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// =====================================================
// BROKER NAMES
// =====================================================

export const SUPPORTED_BROKERS = [
  'tradovate',
  'binance',
  'ninjatrader',
  'rhythmic',
  'quantower',
  'mt4',
  'mt5',
  'tradelocker',
  'mexc',
  'bybit',
  'projectx',
] as const;

export const BROKER_DISPLAY_NAMES = {
  tradovate: 'Tradovate',
  binance: 'Binance',
  ninjatrader: 'NinjaTrader',
  rhythmic: 'Rhythmic',
  quantower: 'Quantower',
  mt4: 'MetaTrader 4',
  mt5: 'MetaTrader 5',
  tradelocker: 'TradeLocker',
  mexc: 'MEXC',
  bybit: 'Bybit',
  projectx: 'ProjectX',
} as const;

// =====================================================
// TIMEFRAMES
// =====================================================

export const TIMEFRAMES = [
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
  '1d',
  '1w',
] as const;

// =====================================================
// SIGNAL STATUS
// =====================================================

export const SIGNAL_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;

// =====================================================
// PAGINATION
// =====================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// =====================================================
// VALIDATION LIMITS
// =====================================================

export const LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  BIO_MAX: 200,
  SIGNAL_DESCRIPTION_MAX: 500,
  COMPETITION_NAME_MAX: 50,
  COMPETITION_DESCRIPTION_MAX: 500,
  MAX_COMPETITION_PARTICIPANTS: 100,
  MAX_COMPETITION_DURATION_HOURS: 720, // 30 days
  MAX_ENTRY_FEE: 1000,
  MAX_CREATOR_SUBSCRIPTION_PRICE: 99.99,
  MIN_CREATOR_SUBSCRIPTION_PRICE: 4.99,
} as const;

// =====================================================
// PLATFORM FEES
// =====================================================

export const PLATFORM_FEES = {
  CREATOR_SUBSCRIPTION: 0.1, // 10%
  COMPETITION_ENTRY: 0.15, // 15%
} as const;

// =====================================================
// CACHE TTL (milliseconds)
// =====================================================

export const CACHE_TTL = {
  SIGNAL_FEED: 60000, // 1 minute
  USER_PROFILE: 300000, // 5 minutes
  LEADERBOARD: 600000, // 10 minutes
  COMPETITION_LIST: 300000, // 5 minutes
  BROKER_BALANCE: 30000, // 30 seconds
} as const;

// =====================================================
// ROUTES
// =====================================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FEED: '/feed',
  LIVE: '/live',
  PORTFOLIO: '/portfolio',
  COMPETITIONS: '/competitions',
  LEADERBOARD: '/competitions/leaderboard',
  RANKED_MATCH: '/competitions/ranked',
  PROFILE: (username: string) => `/profile/${username}`,
  SETTINGS: '/settings',
} as const;

// =====================================================
// API ENDPOINTS
// =====================================================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',

  // Signals
  SIGNALS: '/api/signals',
  SIGNAL_PARSE: '/api/signals/parse',

  // Competitions
  COMPETITIONS: '/api/competitions',
  RANKED_QUEUE: '/api/competitions/ranked/queue',
  LEADERBOARD: '/api/competitions/leaderboard',

  // Gemini
  GEMINI_ANALYZE: '/api/gemini/analyze',
  GEMINI_SUMMARIZE: '/api/gemini/summarize',
  GEMINI_LEARN: '/api/gemini/learn',

  // Brokers
  BROKERS: '/api/brokers',
  BROKER_CONNECT: '/api/brokers/connect',
  BROKER_TRADES: '/api/brokers/trades',
} as const;
