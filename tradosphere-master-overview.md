# TradoSphere: Master Technical Overview
*Complete Consolidated Engineering Reference*

## 🎯 Executive Summary

**TradoSphere** is a full-stack social trading platform built with Next.js 14, NestJS, and powered by AI (Gemini 2.0 Flash). It democratizes trading education through validated mentorship, competitive tournaments, and a creator economy.

**Scope**: 88 distinct features across 50+ routes
**Timeline**: 18 months (solo developer)
**Architecture**: Monorepo with microservices-ready backend
**Target Users**: 100K+ MAU by Year 2

---

## 🏗️ Technical Stack (Finalized)

### Frontend Architecture

```typescript
{
  "framework": "Next.js 14.2.x (App Router)",
  "language": "TypeScript 5.3+",
  "styling": "Tailwind CSS 3.4 + shadcn/ui",
  "stateManagement": {
    "client": "Jotai 2.6+ (atomic state)",
    "server": "@tanstack/react-query 5.x",
    "rationale": "Jotai provides granular re-renders for complex /live page (12+ synchronized UI elements)"
  },
  "charts": {
    "interactive": "TradingView Charting Library Advanced API",
    "static": "TradingView Lightweight Charts (free)",
    "analytics": "Recharts 2.10",
    "cost": "$499/month (required for drawing tools + multi-chart)"
  },
  "realtime": {
    "video": "Agora.io SDK 4.20+",
    "data": "Socket.io-client 4.6 + Supabase Realtime",
    "architecture": "Hybrid (video via Agora, data via Socket.io + Postgres CDC)"
  },
  "animation": "Framer Motion 11.x",
  "forms": "React Hook Form 7.x + Zod 3.22"
}
```

### Backend Architecture

```typescript
{
  "framework": "NestJS 10.x",
  "architecture": "Modular monolith → microservices evolution",
  "database": {
    "primary": "PostgreSQL 15 (Supabase hosted)",
    "extensions": ["TimescaleDB (portfolio analytics)", "pg_vector (future AI features)"],
    "cache": "Redis 7 (Upstash hosted)",
    "search": "PostgreSQL Full-Text Search (defer Elasticsearch to Phase 2)"
  },
  "authentication": {
    "provider": "Supabase Auth",
    "strategy": "JWT + Refresh tokens",
    "2FA": "TOTP (OTP Auth)",
    "oauth": ["Google", "Twitter/X"]
  },
  "jobQueue": {
    "phase1": "BullMQ (Redis-based)",
    "phase2": "RabbitMQ (complex routing)",
    "useCases": ["Competition scoring", "Prize distribution", "Email notifications"]
  },
  "apiGateway": "NestJS Gateway (WebSocket + REST)"
}
```

### AI Integration (Gemini 2.0 Flash)

```typescript
{
  "model": "gemini-2.0-flash-exp",
  "provider": "Google Generative AI",
  "costOptimization": {
    "inputTokens": "$0.075 per 1M (vs $1.25 for 1.5 Pro)",
    "estimatedMonthlyCost": "$75 at 1M API calls",
    "savings": "94% vs Gemini 1.5 Pro"
  },
  "capabilities": {
    "structuredOutput": "JSON schema enforcement",
    "searchGrounding": "Google Search integration",
    "contextWindow": "1M tokens",
    "outputTokens": "8,192 max"
  },
  "useCases": [
    {
      "feature": "Signal Level Parsing",
      "prompt": "Extract entry/target/stop from natural language",
      "output": "JSON with prices + confidence score"
    },
    {
      "feature": "Trade Analysis",
      "prompt": "Analyze position with real-time market data",
      "output": "News summary + technical outlook + risk assessment"
    },
    {
      "feature": "Chat Summarization",
      "prompt": "Summarize live stream chat conversation",
      "output": "Bullet points of main topics + sentiment"
    },
    {
      "feature": "Learning Hub Q&A",
      "prompt": "Explain trading concept without financial advice",
      "output": "Educational markdown content"
    }
  ],
  "rateLimiting": {
    "free": "5 requests/hour",
    "grow": "20 requests/hour",
    "elite": "50 requests/hour",
    "gladiator": "100 requests/hour",
    "legend": "200 requests/hour",
    "implementation": "Upstash Ratelimit (Redis sliding window)"
  }
}
```

### Real-Time Architecture

```yaml
Video Streaming (Agora.io):
  Purpose: Live trading streams
  Latency: <3 seconds
  Mode: Live broadcast (host + audience)
  Recording: Agora Cloud Recording
  Cost: ~$500/month (1000 viewer-hours)
  
Data Sync (Socket.io):
  Purpose: Live positions, chat, emoji reactions
  Latency: <1 second
  Server: NestJS WebSocket Gateway
  Events:
    - stream:position:update
    - chat:message
    - emoji:reaction
    - competition:leaderboard:update
    
Database Changes (Supabase Realtime):
  Purpose: Signal status updates, profile changes
  Latency: <5 seconds (eventual consistency OK)
  Technology: PostgreSQL Change Data Capture (CDC)
  Subscriptions:
    - signals table (status updates)
    - profiles table (tier changes)
    - competitions table (live updates)
```

---

## 📊 Database Schema Overview

### Core Tables (17 tables)

```sql
-- Authentication (Supabase managed)
auth.users

-- User Profiles
profiles (id, username, tier, avatar_url, bio, trading_style, created_at)
follows (follower_id, following_id)
user_achievements (user_id, achievement_id, earned_at)

-- Trading Signals
signals (id, creator_id, asset_symbol, direction, entry_price, target_price, 
         stop_loss, status, rationale, posted_at)
signal_engagement (signal_id, user_id, reaction_type)

-- Portfolio Management
trades (id, user_id, asset, direction, entry_price, exit_price, pnl, 
        opened_at, closed_at)
broker_connections (user_id, broker_name, api_key_encrypted, status)

-- Live Streaming
streams (id, creator_id, title, status, started_at, ended_at)
stream_sessions (stream_id, viewer_id, joined_at, left_at)

-- Competitions
competitions (id, creator_id, type, prize_pool, entry_fee, rules, 
              started_at, ended_at)
competition_participants (competition_id, user_id, score, rank)
leaderboards (competition_id, participant_id, score, metrics)

-- Monetization
subscriptions (subscriber_id, creator_id, stripe_subscription_id, 
               status, price_monthly)
payouts (creator_id, amount, stripe_payout_id, status, paid_at)
legends_pool (month, total_pool, distributed_at)

-- Social Features
messages (sender_id, recipient_id, content, sent_at)
clans (id, owner_id, name, badge_url)
watchlists (id, name, created_by)
watchlist_members (watchlist_id, user_id, role)
```

### Key Indexes for Performance

```sql
-- Feed query optimization
CREATE INDEX idx_signals_feed ON signals(posted_at DESC) WHERE status = 'active';
CREATE INDEX idx_signals_creator ON signals(creator_id, posted_at DESC);

-- Leaderboard queries
CREATE INDEX idx_leaderboard_rank ON competition_participants(competition_id, rank);

-- User lookup
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_tier ON profiles(tier);
```

---

## 🛣️ API Architecture

### REST Endpoints (28 routes)

```yaml
Authentication:
  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/refresh
  POST /api/auth/reset-password
  
Signals:
  GET /api/signals (list with filters)
  POST /api/signals (create)
  GET /api/signals/:id
  PATCH /api/signals/:id (update status)
  DELETE /api/signals/:id
  
Gemini AI:
  POST /api/gemini/parse (signal level extraction)
  POST /api/gemini/analyze (trade analysis)
  POST /api/gemini/summarize (chat summary)
  POST /api/gemini/learn (learning hub Q&A)
  
Competitions:
  GET /api/competitions
  POST /api/competitions (create)
  GET /api/competitions/:id
  POST /api/competitions/:id/join
  GET /api/competitions/:id/leaderboard
  
Streaming:
  POST /api/streaming/token (Agora token)
  POST /api/streaming/start
  POST /api/streaming/end
  
Payments:
  POST /api/payments/create-subscription
  POST /api/payments/create-checkout
  POST /api/payments/connect-account
  
Webhooks:
  POST /api/webhooks/stripe
  POST /api/webhooks/supabase
```

### WebSocket Events

```typescript
// Socket.io event schema
interface WebSocketEvents {
  // Live streaming events
  'stream:join': { streamId: string; userId: string };
  'stream:leave': { streamId: string; userId: string };
  'stream:position:update': { streamId: string; position: Position };
  
  // Chat events
  'chat:message': { streamId: string; message: Message };
  'chat:reaction': { streamId: string; emoji: string };
  
  // Competition events
  'competition:score:update': { competitionId: string; scores: Score[] };
  'competition:leaderboard': { competitionId: string; rankings: Ranking[] };
  
  // Notification events
  'notification:new': { userId: string; notification: Notification };
}
```

---

## 🎨 UI/UX Component Architecture

### Component Hierarchy

```
App Layout
├── Navbar (persistent)
├── Sidebar (collapsible)
└── Main Content
    ├── Feed Page
    │   ├── SignalCard
    │   │   ├── SignalHeader (creator info)
    │   │   ├── TradingChart (TradingView)
    │   │   ├── SignalMetrics (entry/target/stop)
    │   │   ├── HitMissBadge (status indicator)
    │   │   └── SignalChat (Socket.io)
    │   └── AssetScanner (sidebar widget)
    │
    ├── Live Page
    │   ├── StreamerCarousel
    │   ├── StreamPlayer (Agora)
    │   ├── MultiChartLayout (3TF)
    │   ├── LivePositionsTable (real-time)
    │   ├── EmojiOverlay (Framer Motion)
    │   └── ChatPanel (Socket.io)
    │
    ├── Portfolio Page
    │   ├── MetricsCards (P/L, win rate, etc.)
    │   ├── PerformanceCalendar
    │   ├── TradesList
    │   └── AIAssistant (Gemini)
    │
    ├── Competitions Page
    │   ├── CompetitionGrid
    │   ├── LeaderboardTable (real-time)
    │   └── CompetitionWizard (create flow)
    │
    └── Profile Page
        ├── ProfileHeader
        ├── StatCards
        ├── TrophyCase
        └── ContentTabs
```

### Design System Tokens

```typescript
// Tailwind config extensions
export const designTokens = {
  colors: {
    profit: '#00D97E',
    loss: '#FF3B30',
    primary: '#007AFF',
    background: {
      dark: '#0A0E27',
      darker: '#060818',
    },
    tier: {
      free: '#6B7280',
      grow: '#10B981',
      elite: '#8B5CF6',
      gladiator: '#F59E0B',
      legend: '#EF4444',
    },
  },
  spacing: {
    unit: 8, // 8px base unit
  },
  typography: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono', // for prices/code
  },
  animation: {
    winStreak: 'flame-flicker 1s infinite',
    profitGlow: 'profit-pulse 2s infinite',
    lossGlow: 'loss-pulse 2s infinite',
  },
};
```

---

## 🔐 Security Architecture

### Authentication & Authorization

```yaml
Authentication:
  Provider: Supabase Auth
  Tokens: JWT (access) + Refresh tokens
  Session Duration: 1 hour (access), 30 days (refresh)
  2FA: TOTP (required for creators)
  
Authorization:
  Strategy: Row-Level Security (RLS) + API guards
  Tiers: Free, Grow, Elite, Gladiator, Legend
  
Row-Level Security Policies:
  - Users can only update their own profile
  - Only Grow+ can post signals
  - Only Gladiators can create competitions
  - Stealth mode hides user from public queries
  
API Guards:
  - @TierRequired(['elite']) decorator
  - Rate limiting via Upstash
  - Input validation via Zod schemas
```

### Data Security

```yaml
Encryption:
  At Rest: AES-256 (Supabase managed)
  In Transit: TLS 1.3
  Sensitive Fields: Broker API keys encrypted via libsodium
  
PII Protection:
  Email: Hashed in analytics queries
  Payment Info: Never stored (Stripe handles)
  Trading Data: User-controlled privacy toggle
  
Compliance:
  GDPR: Data export + deletion endpoints
  CCPA: Opt-out mechanisms
  PCI DSS: Stripe handles card data
```

---

## 📈 Performance Targets

### Frontend Performance

```yaml
Lighthouse Scores (Target):
  Performance: >90
  Accessibility: >95
  Best Practices: >95
  SEO: >95
  
Core Web Vitals:
  LCP (Largest Contentful Paint): <2.5s
  FID (First Input Delay): <100ms
  CLS (Cumulative Layout Shift): <0.1
  
Route Performance:
  Feed: <2s TTFB (Server-rendered)
  Live: <500ms interaction latency
  Portfolio: <1.5s initial load
```

### Backend Performance

```yaml
API Response Times (p95):
  GET endpoints: <200ms
  POST endpoints: <500ms
  Gemini AI calls: <2s (includes API latency)
  
WebSocket Latency:
  Message send: <100ms
  Position update: <1s
  Leaderboard update: <1s
  
Database Query Performance:
  Feed query: <150ms (indexed)
  Leaderboard query: <300ms (cached)
  Profile lookup: <50ms (indexed)
```

---

## 🚀 Deployment Architecture

### Infrastructure

```yaml
Frontend:
  Platform: Vercel
  Region: Auto (global CDN)
  Build: Automatic on git push
  Environment: Production + Staging
  
Backend:
  Platform: Railway.app
  Regions: US East (primary)
  Scaling: Horizontal auto-scaling
  Database: Supabase (managed Postgres)
  Cache: Upstash Redis (managed)
  
CI/CD:
  Tool: CircleCI
  Pipeline:
    - Lint + Type check
    - Unit tests
    - Integration tests
    - E2E tests (Playwright)
    - Build
    - Deploy to staging
    - Manual approval
    - Deploy to production
```

### Monitoring & Observability

```yaml
Error Tracking:
  Tool: Sentry
  Coverage: Frontend + Backend
  Alerts: Slack integration
  
Performance Monitoring:
  Frontend: Vercel Analytics
  Backend: Custom metrics (Prometheus-ready)
  Database: Supabase Dashboard
  
Logging:
  Backend: Structured JSON logs
  Retention: 30 days
  Analysis: CloudWatch / Datadog (future)
  
Uptime Monitoring:
  Tool: UptimeRobot (free tier)
  Checks: Every 5 minutes
  Alerts: Email + SMS
```

---

## 💰 Cost Breakdown

### Monthly Operating Costs

```yaml
Development Infrastructure:
  GitHub: $4/month (Pro)
  Vercel: $20/month (Pro)
  Railway: $50/month (Backend hosting)
  Supabase: $25/month (Pro plan)
  CircleCI: $30/month (Performance plan)
  
Third-Party APIs:
  TradingView: $499/month (Advanced Charting)
  Agora.io: $500/month (est. 1000 viewer-hours)
  Gemini API: $75/month (est. 1M calls)
  Alpha Vantage: $50/month (market data)
  
Infrastructure:
  Upstash Redis: $20/month
  Stripe: 2.9% + $0.30 per transaction
  OneSignal: Free tier (push notifications)
  Resend: $20/month (email)
  
Monitoring & Security:
  Sentry: $26/month (Team plan)
  UptimeRobot: Free tier
  SSL Certificates: Included (Vercel/Railway)
  
Total Monthly: ~$1,319/month
Total Annual: ~$15,828/year
```

### Revenue Projections (Year 1)

```yaml
Subscription Revenue:
  Free users: 10,000 (0% conversion)
  Grow ($5/mo): 500 users = $2,500/mo
  Elite ($10/mo): 100 users = $1,000/mo
  Gladiator ($15/mo): 50 users = $750/mo
  Legend ($15/mo): 10 users = $150/mo
  Total Subscription: $4,400/mo
  
Platform Fees (10%):
  Creator subscriptions: ~$1,000/mo (estimated)
  Competition entry fees: ~$500/mo (estimated)
  Total Fees: $1,500/mo
  
Monthly Revenue: $5,900/mo
Annual Revenue: $70,800/year

Break-even: Month 3-4 (after initial costs)
```

---

## 🧪 Testing Strategy

### Test Coverage

```yaml
Unit Tests:
  Framework: Vitest
  Coverage Target: 80%
  Focus: Utility functions, calculations, business logic
  
Integration Tests:
  Framework: Jest
  Coverage Target: 70%
  Focus: API endpoints, database operations
  
E2E Tests:
  Framework: Playwright
  Coverage: Critical user flows
  Tests:
    - User registration + email verification
    - Signal posting with AI parsing
    - Live streaming (start/join/chat)
    - Competition creation + joining
    - Subscription purchase flow
    - Creator monetization flow
```

### Test Examples

```typescript
// Unit Test: P/L Calculation
describe('calculatePnL', () => {
  it('calculates profit correctly for long position', () => {
    const result = calculatePnL({
      direction: 'LONG',
      entryPrice: 50000,
      exitPrice: 52000,
      size: 1,
    });
    expect(result.pnl).toBe(2000);
    expect(result.percentage).toBe(4);
  });
});

// E2E Test: Signal Posting
test('TS Elite user posts signal with AI parsing', async ({ page }) => {
  await page.goto('/login');
  await loginAsEliteUser(page);
  
  await page.goto('/feed');
  await page.click('[data-testid="create-signal"]');
  await page.fill('[name="rationale"]', 
    'Long BTC at $50k, target $52k, stop $48k'
  );
  await page.click('button[type="submit"]');
  
  // Verify AI parsed levels render
  await expect(page.locator('[data-testid="entry-line"]'))
    .toHaveAttribute('data-price', '50000');
});
```

---

## 📚 Documentation Structure

```
docs/
├── architecture/
│   ├── system-design.md
│   ├── database-schema.md
│   ├── api-reference.md
│   └── real-time-architecture.md
│
├── development/
│   ├── getting-started.md
│   ├── coding-standards.md
│   ├── git-workflow.md
│   └── testing-guide.md
│
├── deployment/
│   ├── infrastructure-setup.md
│   ├── cicd-pipeline.md
│   └── monitoring-setup.md
│
└── features/
    ├── signal-posting.md
    ├── live-streaming.md
    ├── competitions.md
    └── ai-integration.md
```

---

## 🎯 Success Metrics (KPIs)

### User Engagement

```yaml
Daily Active Users (DAU): Target 10K by Month 6
Monthly Active Users (MAU): Target 50K by Month 12
Average Session Duration: >15 minutes
Signals Posted Daily: >500
Live Streams Daily: >20
```

### Creator Economy

```yaml
Active Creators: Target 500 by Month 12
Average Revenue per Creator: >$50/month
Creator Retention (6mo): >80%
Subscriber Conversion Rate: >5%
```

### Platform Health

```yaml
API Error Rate: <0.1%
P95 Response Time: <200ms
Uptime: >99.9%
User Satisfaction (NPS): >50
```

---

## 🚦 Launch Checklist

```yaml
Pre-Launch (Month 17):
  ✅ All 88 features implemented
  ✅ E2E tests passing (>95%)
  ✅ Security audit completed
  ✅ Load testing (10K concurrent users)
  ✅ Payment flow tested (Stripe test mode)
  ✅ Legal pages (Terms, Privacy, Disclaimer)
  ✅ Customer support system (Intercom)
  
Beta Launch (Month 18 Week 1):
  ✅ Invite 50-100 beta users
  ✅ Monitor error rates hourly
  ✅ Gather user feedback (surveys)
  ✅ Fix critical bugs within 24h
  
Public Launch (Month 18 Week 4):
  ✅ Marketing site live
  ✅ Social media announcement
  ✅ PR outreach (TechCrunch, etc.)
  ✅ Referral program activated
  ✅ 24/7 monitoring enabled
```

---

## 🎓 Technical Decisions & Trade-offs

### Key Architectural Choices

**1. Jotai vs Zustand for State Management**
- **Decision**: Jotai
- **Rationale**: Atomic state enables granular re-renders on complex /live page
- **Trade-off**: Steeper learning curve, but 40% fewer re-renders in benchmarks

**2. Gemini 2.0 Flash vs Gemini 1.5 Pro**
- **Decision**: Gemini 2.0 Flash
- **Rationale**: 94% cost savings, 2x faster, quality difference negligible for use cases
- **Trade-off**: Slightly lower benchmark scores (85.4% vs 85.9% MMLU) - acceptable

**3. Agora.io vs Self-Hosted MediaSoup**
- **Decision**: Agora.io
- **Rationale**: Lower DevOps burden for solo dev, better mobile SDK support
- **Trade-off**: $500/month cost vs infrastructure complexity

**4. Monorepo vs Separate Repositories**
- **Decision**: Monorepo (Turborepo)
- **Rationale**: Easier code sharing, atomic commits across frontend/backend
- **Trade-off**: Larger repo size, but manageable with sparse checkout

**5. NestJS Monolith vs Microservices from Day 1**
- **Decision**: Start as modular monolith, extract services in Phase 2
- **Rationale**: Faster initial development, microservices add complexity
- **Trade-off**: Some refactoring needed later, but validated architecture first

---

**This document serves as the single source of truth for TradoSphere's technical architecture.**

**Next Document: External Resources & Technical Citations**