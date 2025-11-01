# TradoSphere: Development Scope & Sprint Planning
*18-Month Solo Developer Roadmap with Sprint-by-Sprint Breakdown*

## 🎯 Strategic Overview

**Total Project Duration**: 18 months (72 weeks)
**Sprint Duration**: 2 weeks (26 sprints)
**Work Capacity**: 40 hours/week sustainable pace
**Total Development Hours**: ~2,880 hours

---

## 📊 Phase Distribution

```yaml
Phase 1 - Foundation & Core Features: Months 1-6 (12 sprints, 960 hours)
  Focus: Authentication, Feed, Signals, Basic Portfolio
  Outcome: Functional social trading feed with AI parsing
  
Phase 2 - Social & Streaming: Months 7-11 (10 sprints, 800 hours)
  Focus: Live streaming, Profile system, Social features
  Outcome: Live trading streams with real-time interaction
  
Phase 3 - Monetization & Competitions: Months 12-15 (8 sprints, 640 hours)
  Focus: Stripe integration, Competition engine, Payouts
  Outcome: Full creator economy + competitive trading
  
Phase 4 - Polish & Advanced Features: Months 16-18 (6 sprints, 480 hours)
  Focus: Creator dashboard, Learning Hub, Gamification
  Outcome: Production-ready platform with all features
```

---

## 🚀 Phase 1: Foundation & Core Features (Months 1-6)

### Sprint 1-2: Project Setup & Authentication (80 hours)

**Sprint 1 (Weeks 1-2): Infrastructure**
```yaml
Tasks:
  - Monorepo setup (Turborepo/pnpm)
  - Next.js 14 frontend initialization
  - NestJS backend initialization
  - Supabase project setup
  - Database schema design (core tables)
  - CI/CD pipeline (CircleCI)
  - Development environment config
  
Deliverables:
  ✅ Repository structure
  ✅ Local development working
  ✅ CI/CD auto-deploy to staging
  ✅ Database migrations framework
  
Story Points: 21
```

**Sprint 2 (Weeks 3-4): Authentication System**
```yaml
Tasks:
  - Supabase Auth integration
  - Login/Signup pages
  - Email verification flow
  - Password reset flow
  - Session management
  - Auth middleware (Next.js)
  - Protected route guards
  
Deliverables:
  ✅ Working authentication flow
  ✅ User can register and login
  ✅ Email verification required
  ✅ Password reset functional
  
Story Points: 18
Tests: 10 E2E scenarios
```

---

### Sprint 3-4: Database Schema & Signal Foundation (80 hours)

**Sprint 3 (Weeks 5-6): Core Data Models**
```yaml
Tasks:
  - Profiles table + RLS policies
  - Signals table + relationships
  - Follows table
  - Signal engagement table
  - TypeScript type generation
  - Seed data creation
  - Query optimization (indexes)
  
Deliverables:
  ✅ Complete database schema
  ✅ RLS policies tested
  ✅ Seed data for 100 signals
  ✅ Generated TypeScript types
  
Story Points: 16
```

**Sprint 4 (Weeks 7-8): Signal API & State Management**
```yaml
Tasks:
  - NestJS signals service
  - Signal CRUD endpoints
  - Feed algorithm (chronological MVP)
  - Jotai atoms setup
  - React Query integration
  - Win streak calculation logic
  - Hit/miss status updates
  
Deliverables:
  ✅ REST API for signals
  ✅ State management configured
  ✅ Signal status tracking works
  ✅ API documentation
  
Story Points: 20
Tests: 15 unit + 5 integration
```

---

### Sprint 5-7: Feed Page & Signal Cards (120 hours)

**Sprint 5 (Weeks 9-10): TradingView Integration**
```yaml
Tasks:
  - TradingView Lightweight Charts setup
  - Chart component wrapper
  - Real-time price data integration
  - Chart configuration (themes, layouts)
  - Responsive chart sizing
  - Performance optimization
  
Deliverables:
  ✅ Working chart component
  ✅ Real-time price updates
  ✅ Mobile-responsive charts
  ✅ Multiple timeframes supported
  
Story Points: 18
Cost: TradingView license ($499/month)
```

**Sprint 6 (Weeks 11-12): Signal Card Component**
```yaml
Tasks:
  - Signal card UI/UX
  - Hit/miss badge component
  - Win streak badge + animation
  - Chart embed in card
  - Signal actions (like, bookmark)
  - Creator info section
  - Status glow effects (profit/loss)
  
Deliverables:
  ✅ Polished signal card
  ✅ All interactions working
  ✅ Animations smooth
  ✅ Accessible (keyboard nav)
  
Story Points: 17
```

**Sprint 7 (Weeks 13-14): Feed Page Assembly**
```yaml
Tasks:
  - Feed page layout
  - Infinite scroll implementation
  - Signal composer modal
  - Asset scanner widget
  - Feed filters (following, trending)
  - Real-time signal updates (Supabase)
  - Loading skeletons
  
Deliverables:
  ✅ Complete feed page
  ✅ Users can post signals (Grow+)
  ✅ Real-time updates working
  ✅ Smooth performance (60fps)
  
Story Points: 22
Tests: 12 E2E scenarios
```

---

### Sprint 8-9: AI Signal Parsing (Gemini Integration) (80 hours)

**Sprint 8 (Weeks 15-16): Gemini Setup & Parsing**
```yaml
Tasks:
  - Gemini 2.0 Flash API integration
  - Signal text parsing prompts
  - Structured JSON output config
  - Level extraction algorithm
  - Confidence scoring
  - Rate limiting (Upstash Redis)
  - Caching strategy
  
Deliverables:
  ✅ AI parses signal levels
  ✅ Entry/target/stop extracted
  ✅ Confidence scores accurate
  ✅ Rate limits enforced
  
Story Points: 16
API Cost: ~$75/month
```

**Sprint 9 (Weeks 17-18): Chart Annotation & Drawing Tools**
```yaml
Tasks:
  - TradingView Charting Library upgrade
  - Programmatic line drawing
  - AI-parsed level rendering
  - Drawing tools UI
  - Tool state management
  - Save/load user drawings
  - Mobile touch support
  
Deliverables:
  ✅ AI levels render on chart
  ✅ Users can draw lines/shapes
  ✅ Drawings persist
  ✅ Mobile-friendly
  
Story Points: 21
Cost: TradingView Advanced ($499/month)
```

---

### Sprint 10-11: Profile System (80 hours)

**Sprint 10 (Weeks 19-20): Profile Pages**
```yaml
Tasks:
  - Profile page layout
  - Profile header component
  - Stats cards (P/L, win rate, rank)
  - Tabbed content (signals, competitions, about)
  - Video grid tab
  - Share modal (multi-platform)
  - Follow/unfollow functionality
  
Deliverables:
  ✅ Complete profile pages
  ✅ All tabs functional
  ✅ Share modal works
  ✅ SEO optimized
  
Story Points: 19
```

**Sprint 11 (Weeks 21-22): Profile Settings & Social Graph**
```yaml
Tasks:
  - Profile settings page
  - Avatar/banner upload
  - Bio/story editing
  - Follow system backend
  - Following/followers lists
  - Follow recommendations
  - Activity feed (basic)
  
Deliverables:
  ✅ Users can edit profiles
  ✅ Follow system complete
  ✅ Social graph functional
  ✅ Recommendations working
  
Story Points: 17
```

---

### Sprint 12: Portfolio Manager (Basic) (40 hours)

**Sprint 12 (Weeks 23-24): Portfolio Dashboard**
```yaml
Tasks:
  - Portfolio dashboard layout
  - Metrics cards (4-card design)
  - Recent trades table
  - Manual trade entry form
  - Trade detail view
  - P/L calculations
  - Portfolio privacy toggle
  
Deliverables:
  ✅ Basic portfolio manager
  ✅ Manual trade tracking
  ✅ P/L calculations accurate
  ✅ Privacy controls work
  
Story Points: 18
```

---

## 🎬 Phase 2: Social & Streaming (Months 7-11)

### Sprint 13-14: Live Streaming Foundation (80 hours)

**Sprint 13 (Weeks 25-26): Agora Integration**
```yaml
Tasks:
  - Agora.io SDK setup
  - Token generation service (NestJS)
  - Stream initiation flow
  - Basic stream player component
  - Audio/video configuration
  - Stream metadata (database)
  - Recording setup
  
Deliverables:
  ✅ Creators can start streams
  ✅ Viewers can join streams
  ✅ Audio/video working
  ✅ Basic recording enabled
  
Story Points: 20
Cost: Agora.io (~$500/month)
```

**Sprint 14 (Weeks 27-28): Live Page UI**
```yaml
Tasks:
  - Live page layout
  - Streamer carousel
  - Stream grid view
  - Search/filter bar
  - Stream detail page
  - Collapsible sidebar
  - Fullscreen mode
  
Deliverables:
  ✅ Complete live page
  ✅ Stream discovery works
  ✅ Fullscreen mode smooth
  ✅ Mobile-optimized
  
Story Points: 19
```

---

### Sprint 15-17: Multi-Chart & Real-Time Features (120 hours)

**Sprint 15 (Weeks 29-30): Multi-Chart Layout**
```yaml
Tasks:
  - 3-timeframe chart sync
  - Layout switcher (3TF vs single)
  - Chart state management (Jotai)
  - Symbol synchronization
  - Layout presets (save/load)
  - Responsive layout logic
  
Deliverables:
  ✅ Multi-chart layout working
  ✅ Charts stay synchronized
  ✅ Layout presets save/load
  ✅ Smooth switching
  
Story Points: 21
```

**Sprint 16 (Weeks 31-32): Live Positions Table**
```yaml
Tasks:
  - Positions table component
  - Socket.io setup (backend)
  - Real-time position updates
  - P/L calculation (live)
  - Position actions (analyze, close)
  - Table sorting/filtering
  - Mobile-responsive table
  
Deliverables:
  ✅ Real-time positions table
  ✅ Updates <1s latency
  ✅ P/L accurate
  ✅ Mobile-friendly
  
Story Points: 18
```

**Sprint 17 (Weeks 33-34): Chat & Emoji Reactions**
```yaml
Tasks:
  - Live chat component
  - Socket.io chat events
  - Chat message persistence
  - Emoji reaction overlay
  - Framer Motion animations
  - Chat moderation (basic)
  - AI chat summary feature
  
Deliverables:
  ✅ Live chat working
  ✅ Emoji reactions animate
  ✅ AI summary functional
  ✅ Moderation tools present
  
Story Points: 17
```

---

### Sprint 18-19: AI Trade Analysis & Market Data (80 hours)

**Sprint 18 (Weeks 35-36): Gemini Trade Analysis**
```yaml
Tasks:
  - Trade analysis prompts
  - Google Search grounding setup
  - Analysis modal UI
  - News aggregation
  - Technical analysis generation
  - Risk assessment logic
  - Response formatting
  
Deliverables:
  ✅ AI analyzes positions
  ✅ Search grounding works
  ✅ Analysis helpful + accurate
  ✅ Mobile-optimized modal
  
Story Points: 16
```

**Sprint 19 (Weeks 37-38): Market Data & Ticker**
```yaml
Tasks:
  - Alpha Vantage API integration
  - WebSocket price streaming
  - Market ticker component
  - Asset scanner widget (full)
  - Sparkline charts (Recharts)
  - Price update optimization
  - Data caching strategy
  
Deliverables:
  ✅ Real-time market data
  ✅ Ticker scrolls smoothly
  ✅ Asset scanner functional
  ✅ Sparklines animate
  
Story Points: 18
API Cost: Alpha Vantage ($50/month)
```

---

### Sprint 20-21: Buddies & Social Features (80 hours)

**Sprint 20 (Weeks 39-40): Direct Messaging**
```yaml
Tasks:
  - DM database schema
  - Message inbox page
  - Conversation thread UI
  - Socket.io messaging
  - Message persistence
  - Unread indicators
  - Push notifications (basic)
  
Deliverables:
  ✅ DM system functional
  ✅ Real-time messaging
  ✅ Notifications working
  ✅ Mobile-optimized
  
Story Points: 19
```

**Sprint 21 (Weeks 41-42): Clans & Watchlists**
```yaml
Tasks:
  - Clan database schema
  - Clan creation/management
  - Clan badge uploader
  - Shared watchlist schema
  - Watchlist collaborative editing
  - Watchlist mini-chat
  - Real-time sync (Supabase)
  
Deliverables:
  ✅ Clans functional
  ✅ Shared watchlists work
  ✅ Real-time collaboration
  ✅ Badge customization
  
Story Points: 17
```

---

### Sprint 22: Notifications System (40 hours)

**Sprint 22 (Weeks 43-44): Notification Infrastructure**
```yaml
Tasks:
  - Notification schema
  - In-app notifications
  - Email notifications (Resend)
  - Push notifications (OneSignal)
  - Notification preferences
  - Notification bell UI
  - Batch notification job
  
Deliverables:
  ✅ Multi-channel notifications
  ✅ User preferences respected
  ✅ Notification bell works
  ✅ Email templates polished
  
Story Points: 18
Cost: OneSignal (free tier), Resend ($20/month)
```

---

## 💰 Phase 3: Monetization & Competitions (Months 12-15)

### Sprint 23-24: Stripe Integration (80 hours)

**Sprint 23 (Weeks 45-46): Subscription System**
```yaml
Tasks:
  - Stripe SDK integration
  - Subscription creation flow
  - Tier selection UI
  - Checkout sessions
  - Webhook handlers
  - Subscription management
  - Payment history
  
Deliverables:
  ✅ Users can subscribe
  ✅ Tier upgrades work
  ✅ Webhooks handle events
  ✅ Payment history visible
  
Story Points: 20
```

**Sprint 24 (Weeks 47-48): Stripe Connect (Creators)**
```yaml
Tasks:
  - Stripe Connect setup
  - Creator onboarding flow
  - Subscription price setting
  - Payout scheduling
  - Revenue dashboard
  - Connected account management
  - 10% platform fee logic
  
Deliverables:
  ✅ Creators can monetize
  ✅ Onboarding smooth
  ✅ Payouts automated
  ✅ Revenue tracking accurate
  
Story Points: 19
```

---

### Sprint 25-28: Competition Engine (160 hours)

**Sprint 25 (Weeks 49-50): Competition Database & API**
```yaml
Tasks:
  - Competition schema (all types)
  - Participant schema
  - Leaderboard schema
  - Competition CRUD API
  - Join competition logic
  - Prize pool calculations
  - Entry fee processing
  
Deliverables:
  ✅ Competition data models
  ✅ API endpoints working
  ✅ Join flow functional
  ✅ Prize pool calculates
  
Story Points: 21
```

**Sprint 26 (Weeks 51-52): Scoring Engine**
```yaml
Tasks:
  - Scoring algorithm design
  - Risk-adjusted return calc
  - Sharpe ratio implementation
  - Max drawdown tracking
  - Consistency scoring
  - Real-time score updates (job)
  - Leaderboard cache (Redis)
  
Deliverables:
  ✅ Scoring algorithm accurate
  ✅ Real-time updates <1s
  ✅ Leaderboard cached
  ✅ Performance optimized
  
Story Points: 22
```

**Sprint 27 (Weeks 53-54): Competition UI**
```yaml
Tasks:
  - Competition hub page
  - Competition detail page
  - Leaderboard UI (real-time)
  - Competition card component
  - Prize breakdown display
  - Competition chat
  - Join/leave actions
  
Deliverables:
  ✅ Complete competition UX
  ✅ Leaderboard real-time
  ✅ Chat functional
  ✅ Mobile-optimized
  
Story Points: 19
```

**Sprint 28 (Weeks 55-56): Competition Creation Flow**
```yaml
Tasks:
  - Create competition wizard
  - Type selection (1v1/Team/FFA)
  - Configuration form
  - Rules builder
  - Preview screen
  - Share modal (post-create)
  - Competition validation
  
Deliverables:
  ✅ Gladiators can create
  ✅ Wizard smooth
  ✅ Validation robust
  ✅ Share functionality
  
Story Points: 18
```

---

### Sprint 29-30: Prize Distribution & Legends Pool (80 hours)

**Sprint 29 (Weeks 57-58): Automated Prize Distribution**
```yaml
Tasks:
  - Prize distribution job
  - Stripe payout API
  - Winner notification
  - Transaction logging
  - Tax reporting prep
  - Dispute resolution tools
  
Deliverables:
  ✅ Prizes auto-distribute
  ✅ Payouts processed
  ✅ Winners notified
  ✅ Transaction logs complete
  
Story Points: 17
```

**Sprint 30 (Weeks 59-60): Legends Pool**
```yaml
Tasks:
  - Legends Pool schema
  - 5% contribution logic
  - Monthly calculation job
  - Eligibility checking (3 wins)
  - Pool distribution
  - Legends Pool dashboard
  - Historical pool data
  
Deliverables:
  ✅ Legends Pool functional
  ✅ Contributions automated
  ✅ Distribution accurate
  ✅ Dashboard informative
  
Story Points: 16
```

---

## ✨ Phase 4: Polish & Advanced Features (Months 16-18)

### Sprint 31-32: Creator Dashboard (80 hours)

**Sprint 31 (Weeks 61-62): Analytics Dashboard**
```yaml
Tasks:
  - Creator dashboard layout
  - Subscriber growth charts
  - Engagement metrics
  - Content performance table
  - Benchmarking (anonymous)
  - Revenue charts
  - Export data functionality
  
Deliverables:
  ✅ Complete analytics suite
  ✅ Charts interactive
  ✅ Benchmarking valuable
  ✅ Data exportable
  
Story Points: 19
```

**Sprint 32 (Weeks 63-64): Content Management & Scheduling**
```yaml
Tasks:
  - Content manager page
  - Signal edit/delete
  - Content calendar
  - Schedule posts feature
  - Subscriber CRM
  - Mass communication tool
  - Spotlight feature
  
Deliverables:
  ✅ Content manager polished
  ✅ Scheduling works
  ✅ CRM helpful
  ✅ Mass comms functional
  
Story Points: 18
```

---

### Sprint 33: Learning Hub (40 hours)

**Sprint 33 (Weeks 65-66): AI Learning Hub**
```yaml
Tasks:
  - Learning Hub page
  - Q&A interface
  - Gemini education prompts
  - Save to journal feature
  - Suggested topics
  - Journal view/edit
  - Search saved concepts
  
Deliverables:
  ✅ Learning Hub functional
  ✅ Answers educational
  ✅ Journal saves/edits
  ✅ Search works
  
Story Points: 16
```

---

### Sprint 34: Gamification (40 hours)

**Sprint 34 (Weeks 67-68): Achievements & Badges**
```yaml
Tasks:
  - Achievement schema
  - Badge images/design
  - Achievement triggers
  - Badge display (profiles)
  - Achievement notifications
  - Progress tracking
  - Leaderboards (global)
  
Deliverables:
  ✅ 20+ achievements
  ✅ Badges display
  ✅ Triggers accurate
  ✅ Leaderboards working
  
Story Points: 17
```

---

### Sprint 35: Settings Hub & Advanced Features (40 hours)

**Sprint 35 (Weeks 69-70): Settings Hub**
```yaml
Tasks:
  - Settings hub layout
  - Theme customization (3 themes)
  - Notification preferences
  - Security settings (2FA)
  - Connection management
  - Layout presets (Live page)
  - Stealth mode (Gladiator+)
  
Deliverables:
  ✅ Complete settings hub
  ✅ All settings functional
  ✅ Themes switch smoothly
  ✅ 2FA working
  
Story Points: 18
```

---

### Sprint 36: Testing, Bug Fixes & Launch Prep (40 hours)

**Sprint 36 (Weeks 71-72): Production Readiness**
```yaml
Tasks:
  - Full E2E test suite (Playwright)
  - Performance optimization
  - Security audit
  - SEO optimization
  - Error monitoring (Sentry)
  - Load testing
  - Documentation completion
  - Marketing site polish
  
Deliverables:
  ✅ All E2E tests passing
  ✅ Lighthouse scores >90
  ✅ Security hardened
  ✅ Production deploy ready
  
Story Points: 20
Launch: Beta launch with 50-100 users
```

---

## 📊 Sprint Velocity Tracking

**Recommended Story Point Velocity:**
- Sprints 1-6: 15-18 points (learning phase)
- Sprints 7-20: 18-22 points (peak velocity)
- Sprints 21-30: 16-19 points (complex features)
- Sprints 31-36: 17-20 points (polish phase)

**Average Velocity Target**: 18-20 story points per sprint

---

## 💰 Monthly Operating Costs

```yaml
Development Tools:
  GitHub: $4/month (Pro)
  Vercel: $20/month (Pro)
  Railway: $50/month (Backend)
  Supabase: $25/month (Pro)
  
Third-Party Services:
  TradingView: $499/month (Advanced)
  Agora.io: $500/month (est. 1000 viewer-hours)
  Stripe: 2.9% + $0.30 per transaction
  Gemini API: ~$75/month (est.)
  Alpha Vantage: $50/month
  Upstash Redis: $20/month
  OneSignal: Free tier
  Resend: $20/month
  
Monitoring & Analytics:
  Sentry: $26/month (Team)
  Vercel Analytics: Included
  
Total Monthly: ~$1,289/month
Annual: ~$15,468/year
```

---

## 🎯 Key Milestones

```yaml
Month 3: Feed + Signals MVP deployed
Month 6: Live streaming functional (beta)
Month 9: Social features complete
Month 12: Monetization live (creators earning)
Month 15: Competition engine production-ready
Month 18: Public launch with all features
```

---

**Next Document: Master Technical Overview with Citations**