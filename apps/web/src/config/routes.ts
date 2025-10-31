/**
 * TradoSphere App Routes Configuration
 * Complete route structure for all 237+ features
 */

export const APP_ROUTES = {
  // ==========================================
  // PUBLIC ROUTES (Marketing)
  // ==========================================
  PUBLIC: {
    HOME: '/',
    PRICING: '/pricing',
    FEATURES: '/features',
    ABOUT: '/about',
    CONTACT: '/contact',
    BLOG: '/blog',
    CAREERS: '/careers',
    LEGAL: {
      TERMS: '/legal/terms',
      PRIVACY: '/legal/privacy',
      COOKIES: '/legal/cookies',
    },
  },

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    OAUTH_CALLBACK: '/auth/callback',
  },

  // ==========================================
  // DASHBOARD (Main Hub)
  // ==========================================
  DASHBOARD: '/dashboard',

  // ==========================================
  // SIGNALS (Social Trading)
  // ==========================================
  SIGNALS: {
    FEED: '/signals',
    CREATE: '/signals/create',
    MY_SIGNALS: '/signals/mine',
    SAVED: '/signals/saved',
    TRENDING: '/signals/trending',
    DETAIL: (id: string) => `/signals/${id}`,
  },

  // ==========================================
  // COMPETITIONS (Battle System)
  // ==========================================
  COMPETITIONS: {
    OVERVIEW: '/competitions',
    LEADERBOARD: '/competitions/leaderboard',
    MY_COMPETITIONS: '/competitions/mine',
    HISTORY: '/competitions/history',

    // Competition Types
    RANKED: {
      FIND_MATCH: '/competitions/ranked/find-match',
      QUEUE: '/competitions/ranked/queue',
    },

    CUSTOM: {
      CREATE: '/competitions/custom/create',
      BROWSE: '/competitions/custom/browse',
      JOIN: (id: string) => `/competitions/custom/${id}/join`,
    },

    // Competition Formats
    ONE_V_ONE: '/competitions/1v1',
    TEAM_VS_TEAM: '/competitions/team',
    BATTLE_ROYAL: '/competitions/battle-royal',
    MENTOR_CLAN: '/competitions/mentor-clan',
    MENTOR_VS_MENTOR: '/competitions/mentor-vs-mentor',

    // Competition Details
    DETAIL: (id: string) => `/competitions/${id}`,
    ACTIVE: (id: string) => `/competitions/${id}/active`,
    RESULTS: (id: string) => `/competitions/${id}/results`,
  },

  // ==========================================
  // JOURNAL (Trading Journal)
  // ==========================================
  JOURNAL: {
    OVERVIEW: '/journal',
    CALENDAR: '/journal/calendar',
    ANALYTICS: '/journal/analytics',
    TRADES: '/journal/trades',
    ADD_TRADE: '/journal/trades/add',
    EDIT_TRADE: (id: string) => `/journal/trades/${id}/edit`,
    TRADE_DETAIL: (id: string) => `/journal/trades/${id}`,

    // Automated Journal
    AUTO_SYNC: '/journal/auto-sync',
    IMPORT: '/journal/import',
    EXPORT: '/journal/export',
  },

  // ==========================================
  // BROKERS (API Integrations)
  // ==========================================
  BROKERS: {
    OVERVIEW: '/brokers',
    CONNECTED: '/brokers/connected',

    // Individual Brokers
    TRADOVATE: '/brokers/tradovate',
    BINANCE: '/brokers/binance',
    NINJATRADER: '/brokers/ninjatrader',
    RHYTHMIC: '/brokers/rhythmic',
    PROJECTX: '/brokers/projectx',
    QUANTOWER: '/brokers/quantower',
    MT4: '/brokers/mt4',
    MT5: '/brokers/mt5',
    TRADELOCKER: '/brokers/tradelocker',
    MEXC: '/brokers/mexc',
    BYBIT: '/brokers/bybit',

    // Broker Actions
    CONNECT: (broker: string) => `/brokers/${broker}/connect`,
    SETTINGS: (broker: string) => `/brokers/${broker}/settings`,
  },

  // ==========================================
  // STREAMING (Live Streams)
  // ==========================================
  STREAMING: {
    BROWSE: '/streaming',
    LIVE: '/streaming/live',
    MY_STREAMS: '/streaming/mine',
    SCHEDULE: '/streaming/schedule',
    ANALYTICS: '/streaming/analytics',

    // Stream Actions
    GO_LIVE: '/streaming/go-live',
    WATCH: (id: string) => `/streaming/watch/${id}`,
    REPLAY: (id: string) => `/streaming/replay/${id}`,
  },

  // ==========================================
  // AI MENTOR (Mentor Connector)
  // ==========================================
  AI_MENTOR: {
    OVERVIEW: '/ai-mentor',
    FIND_MENTOR: '/ai-mentor/find',
    MY_MENTORS: '/ai-mentor/mentors',
    INSIGHTS: '/ai-mentor/insights',
    COMPATIBILITY: '/ai-mentor/compatibility',

    // Mentor Actions
    MENTOR_PROFILE: (id: string) => `/ai-mentor/mentor/${id}`,
    REQUEST_MENTORSHIP: (id: string) => `/ai-mentor/mentor/${id}/request`,
  },

  // ==========================================
  // LEARNING HUB (Education)
  // ==========================================
  LEARNING: {
    OVERVIEW: '/learning',
    COURSES: '/learning/courses',
    MY_COURSES: '/learning/my-courses',
    CERTIFICATES: '/learning/certificates',

    // Course Navigation
    COURSE_DETAIL: (id: string) => `/learning/courses/${id}`,
    LESSON: (courseId: string, lessonId: string) => `/learning/courses/${courseId}/lessons/${lessonId}`,
    QUIZ: (courseId: string, quizId: string) => `/learning/courses/${courseId}/quiz/${quizId}`,

    // AI Q&A
    ASK_AI: '/learning/ask-ai',
  },

  // ==========================================
  // PROFILES (User Profiles)
  // ==========================================
  PROFILES: {
    MY_PROFILE: '/profile',
    USER_PROFILE: (username: string) => `/profile/${username}`,
    EDIT: '/profile/edit',

    // Profile Sections
    STATS: (username: string) => `/profile/${username}/stats`,
    SIGNALS: (username: string) => `/profile/${username}/signals`,
    COMPETITIONS: (username: string) => `/profile/${username}/competitions`,
    FOLLOWERS: (username: string) => `/profile/${username}/followers`,
    FOLLOWING: (username: string) => `/profile/${username}/following`,
  },

  // ==========================================
  // CREATOR (Creator Tools)
  // ==========================================
  CREATOR: {
    DASHBOARD: '/creator',
    ANALYTICS: '/creator/analytics',
    SUBSCRIBERS: '/creator/subscribers',
    EARNINGS: '/creator/earnings',
    CONTENT: '/creator/content',

    // Creator Management
    CREATE_SIGNAL: '/creator/signals/create',
    SCHEDULE_STREAM: '/creator/streams/schedule',
    CREATE_COURSE: '/creator/courses/create',

    // Creator Settings
    APPLY: '/creator/apply',
    SETTINGS: '/creator/settings',
  },

  // ==========================================
  // COMMUNITY (Social Features)
  // ==========================================
  COMMUNITY: {
    FEED: '/community',
    CLANS: '/community/clans',
    MY_CLAN: '/community/clans/mine',
    CREATE_CLAN: '/community/clans/create',
    CLAN_DETAIL: (id: string) => `/community/clans/${id}`,

    // Social
    CHAT: '/community/chat',
    ROOMS: '/community/rooms',
    ROOM: (id: string) => `/community/rooms/${id}`,
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  NOTIFICATIONS: {
    ALL: '/notifications',
    UNREAD: '/notifications/unread',
    SETTINGS: '/notifications/settings',
  },

  // ==========================================
  // SETTINGS (User Settings)
  // ==========================================
  SETTINGS: {
    PROFILE: '/settings/profile',
    ACCOUNT: '/settings/account',
    SECURITY: '/settings/security',
    NOTIFICATIONS: '/settings/notifications',
    BILLING: '/settings/billing',
    SUBSCRIPTION: '/settings/subscription',
    BROKERS: '/settings/brokers',
    PREFERENCES: '/settings/preferences',
    API_KEYS: '/settings/api-keys',
    DANGER_ZONE: '/settings/danger-zone',
  },

  // ==========================================
  // BILLING & SUBSCRIPTION
  // ==========================================
  BILLING: {
    OVERVIEW: '/billing',
    PLANS: '/billing/plans',
    UPGRADE: '/billing/upgrade',
    INVOICES: '/billing/invoices',
    PAYMENT_METHODS: '/billing/payment-methods',

    // Subscription Management
    MANAGE: '/billing/manage',
    CANCEL: '/billing/cancel',
  },

  // ==========================================
  // ADMIN (Admin Panel)
  // ==========================================
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    COMPETITIONS: '/admin/competitions',
    SIGNALS: '/admin/signals',
    MODERATION: '/admin/moderation',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',

    // Admin Actions
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    BAN_USER: (id: string) => `/admin/users/${id}/ban`,
  },

  // ==========================================
  // SEARCH & DISCOVERY
  // ==========================================
  SEARCH: {
    GLOBAL: '/search',
    USERS: '/search/users',
    SIGNALS: '/search/signals',
    COURSES: '/search/courses',
    MENTORS: '/search/mentors',
  },

  // ==========================================
  // ANALYTICS (Personal Analytics)
  // ==========================================
  ANALYTICS: {
    OVERVIEW: '/analytics',
    PERFORMANCE: '/analytics/performance',
    RISK: '/analytics/risk',
    COMPARISON: '/analytics/comparison',
    REPORTS: '/analytics/reports',
  },
} as const;

// ==========================================
// ROUTE METADATA
// ==========================================

export interface RouteMetadata {
  title: string;
  description?: string;
  requiresAuth?: boolean;
  requiredTier?: 'free' | 'tsgrow' | 'elite' | 'gladiator';
  icon?: string;
  badge?: string;
  category?: string;
}

export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  // Dashboard
  '/dashboard': {
    title: 'Dashboard',
    description: 'Your trading command center',
    requiresAuth: true,
    icon: 'LayoutDashboard',
    category: 'main',
  },

  // Signals
  '/signals': {
    title: 'Signal Feed',
    description: 'Latest trading signals from the community',
    requiresAuth: true,
    icon: 'TrendingUp',
    category: 'trading',
  },
  '/signals/create': {
    title: 'Create Signal',
    requiresAuth: true,
    icon: 'Plus',
  },

  // Competitions
  '/competitions': {
    title: 'Competitions',
    description: 'Compete and climb the ranks',
    requiresAuth: true,
    icon: 'Trophy',
    badge: 'Hot',
    category: 'compete',
  },
  '/competitions/leaderboard': {
    title: 'Global Leaderboard',
    requiresAuth: true,
    icon: 'Award',
  },

  // Journal
  '/journal': {
    title: 'Trading Journal',
    description: 'Track and analyze your trades',
    requiresAuth: true,
    icon: 'BookOpen',
    category: 'trading',
  },

  // Brokers
  '/brokers': {
    title: 'Broker Connections',
    description: 'Connect your trading accounts',
    requiresAuth: true,
    requiredTier: 'elite',
    icon: 'Link',
    badge: 'Elite',
    category: 'integrations',
  },

  // Streaming
  '/streaming': {
    title: 'Live Streams',
    description: 'Watch and broadcast live trading',
    requiresAuth: true,
    requiredTier: 'elite',
    icon: 'Video',
    badge: 'Elite',
    category: 'community',
  },

  // AI Mentor
  '/ai-mentor': {
    title: 'AI Mentor Connector',
    description: 'Find your perfect trading mentor',
    requiresAuth: true,
    icon: 'Brain',
    badge: 'AI',
    category: 'learning',
  },

  // Learning Hub
  '/learning': {
    title: 'Learning Hub',
    description: 'Courses and educational content',
    requiresAuth: true,
    icon: 'GraduationCap',
    category: 'learning',
  },

  // Profile
  '/profile': {
    title: 'My Profile',
    requiresAuth: true,
    icon: 'User',
    category: 'account',
  },

  // Creator Dashboard
  '/creator': {
    title: 'Creator Dashboard',
    description: 'Manage your content and earnings',
    requiresAuth: true,
    icon: 'Sparkles',
    badge: 'Creator',
    category: 'creator',
  },

  // Community
  '/community': {
    title: 'Community',
    description: 'Connect with traders',
    requiresAuth: true,
    icon: 'Users',
    category: 'community',
  },

  // Analytics
  '/analytics': {
    title: 'Analytics',
    description: 'Deep dive into your performance',
    requiresAuth: true,
    requiredTier: 'elite',
    icon: 'BarChart3',
    badge: 'Elite',
    category: 'trading',
  },

  // Settings
  '/settings/profile': {
    title: 'Profile Settings',
    requiresAuth: true,
    icon: 'Settings',
    category: 'account',
  },
};

// ==========================================
// NAVIGATION STRUCTURE
// ==========================================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  requiredTier?: 'free' | 'tsgrow' | 'elite' | 'gladiator';
  children?: NavItem[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  {
    label: 'Dashboard',
    href: APP_ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    label: 'Signals',
    href: APP_ROUTES.SIGNALS.FEED,
    icon: 'TrendingUp',
    children: [
      { label: 'Feed', href: APP_ROUTES.SIGNALS.FEED, icon: 'List' },
      { label: 'Create Signal', href: APP_ROUTES.SIGNALS.CREATE, icon: 'Plus' },
      { label: 'My Signals', href: APP_ROUTES.SIGNALS.MY_SIGNALS, icon: 'User' },
      { label: 'Saved', href: APP_ROUTES.SIGNALS.SAVED, icon: 'Bookmark' },
      { label: 'Trending', href: APP_ROUTES.SIGNALS.TRENDING, icon: 'Flame' },
    ],
  },
  {
    label: 'Competitions',
    href: APP_ROUTES.COMPETITIONS.OVERVIEW,
    icon: 'Trophy',
    badge: 'Hot',
    children: [
      { label: 'Overview', href: APP_ROUTES.COMPETITIONS.OVERVIEW, icon: 'Trophy' },
      { label: 'Find Ranked Match', href: APP_ROUTES.COMPETITIONS.RANKED.FIND_MATCH, icon: 'Swords' },
      { label: 'Leaderboard', href: APP_ROUTES.COMPETITIONS.LEADERBOARD, icon: 'Award' },
      { label: 'My Competitions', href: APP_ROUTES.COMPETITIONS.MY_COMPETITIONS, icon: 'User' },
      { label: 'Create Custom', href: APP_ROUTES.COMPETITIONS.CUSTOM.CREATE, icon: 'Plus' },
    ],
  },
  {
    label: 'Journal',
    href: APP_ROUTES.JOURNAL.OVERVIEW,
    icon: 'BookOpen',
    children: [
      { label: 'Overview', href: APP_ROUTES.JOURNAL.OVERVIEW, icon: 'Home' },
      { label: 'Trades', href: APP_ROUTES.JOURNAL.TRADES, icon: 'List' },
      { label: 'Calendar', href: APP_ROUTES.JOURNAL.CALENDAR, icon: 'Calendar' },
      { label: 'Analytics', href: APP_ROUTES.JOURNAL.ANALYTICS, icon: 'BarChart' },
      { label: 'Auto-Sync', href: APP_ROUTES.JOURNAL.AUTO_SYNC, icon: 'RefreshCw', badge: 'Elite' },
    ],
  },
  {
    label: 'Brokers',
    href: APP_ROUTES.BROKERS.OVERVIEW,
    icon: 'Link',
    badge: 'Elite',
    requiredTier: 'elite',
  },
  {
    label: 'Streaming',
    href: APP_ROUTES.STREAMING.BROWSE,
    icon: 'Video',
    badge: 'Elite',
    requiredTier: 'elite',
    children: [
      { label: 'Browse', href: APP_ROUTES.STREAMING.BROWSE, icon: 'Tv' },
      { label: 'Go Live', href: APP_ROUTES.STREAMING.GO_LIVE, icon: 'Radio' },
      { label: 'My Streams', href: APP_ROUTES.STREAMING.MY_STREAMS, icon: 'User' },
      { label: 'Schedule', href: APP_ROUTES.STREAMING.SCHEDULE, icon: 'Calendar' },
    ],
  },
  {
    label: 'AI Mentor',
    href: APP_ROUTES.AI_MENTOR.OVERVIEW,
    icon: 'Brain',
    badge: 'AI',
    children: [
      { label: 'Overview', href: APP_ROUTES.AI_MENTOR.OVERVIEW, icon: 'Home' },
      { label: 'Find Mentor', href: APP_ROUTES.AI_MENTOR.FIND_MENTOR, icon: 'Search' },
      { label: 'My Mentors', href: APP_ROUTES.AI_MENTOR.MY_MENTORS, icon: 'Users' },
      { label: 'AI Insights', href: APP_ROUTES.AI_MENTOR.INSIGHTS, icon: 'Sparkles' },
    ],
  },
  {
    label: 'Learning',
    href: APP_ROUTES.LEARNING.OVERVIEW,
    icon: 'GraduationCap',
    children: [
      { label: 'Courses', href: APP_ROUTES.LEARNING.COURSES, icon: 'BookOpen' },
      { label: 'My Courses', href: APP_ROUTES.LEARNING.MY_COURSES, icon: 'User' },
      { label: 'Certificates', href: APP_ROUTES.LEARNING.CERTIFICATES, icon: 'Award' },
      { label: 'Ask AI', href: APP_ROUTES.LEARNING.ASK_AI, icon: 'MessageCircle' },
    ],
  },
  {
    label: 'Community',
    href: APP_ROUTES.COMMUNITY.FEED,
    icon: 'Users',
    children: [
      { label: 'Feed', href: APP_ROUTES.COMMUNITY.FEED, icon: 'Home' },
      { label: 'Clans', href: APP_ROUTES.COMMUNITY.CLANS, icon: 'Shield' },
      { label: 'Chat', href: APP_ROUTES.COMMUNITY.CHAT, icon: 'MessageSquare' },
    ],
  },
  {
    label: 'Analytics',
    href: APP_ROUTES.ANALYTICS.OVERVIEW,
    icon: 'BarChart3',
    badge: 'Elite',
    requiredTier: 'elite',
  },
];

export const CREATOR_NAVIGATION: NavItem[] = [
  {
    label: 'Creator Dashboard',
    href: APP_ROUTES.CREATOR.DASHBOARD,
    icon: 'Sparkles',
  },
  {
    label: 'Analytics',
    href: APP_ROUTES.CREATOR.ANALYTICS,
    icon: 'BarChart',
  },
  {
    label: 'Subscribers',
    href: APP_ROUTES.CREATOR.SUBSCRIBERS,
    icon: 'Users',
  },
  {
    label: 'Earnings',
    href: APP_ROUTES.CREATOR.EARNINGS,
    icon: 'DollarSign',
  },
  {
    label: 'Content',
    href: APP_ROUTES.CREATOR.CONTENT,
    icon: 'FileText',
  },
];

export const SETTINGS_NAVIGATION: NavItem[] = [
  {
    label: 'Profile',
    href: APP_ROUTES.SETTINGS.PROFILE,
    icon: 'User',
  },
  {
    label: 'Account',
    href: APP_ROUTES.SETTINGS.ACCOUNT,
    icon: 'Settings',
  },
  {
    label: 'Security',
    href: APP_ROUTES.SETTINGS.SECURITY,
    icon: 'Lock',
  },
  {
    label: 'Notifications',
    href: APP_ROUTES.SETTINGS.NOTIFICATIONS,
    icon: 'Bell',
  },
  {
    label: 'Subscription',
    href: APP_ROUTES.SETTINGS.SUBSCRIPTION,
    icon: 'CreditCard',
  },
  {
    label: 'Brokers',
    href: APP_ROUTES.SETTINGS.BROKERS,
    icon: 'Link',
  },
  {
    label: 'API Keys',
    href: APP_ROUTES.SETTINGS.API_KEYS,
    icon: 'Key',
  },
];

// Type helpers for route params
export type RouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof RouteParams<Rest>]: string }
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {};
