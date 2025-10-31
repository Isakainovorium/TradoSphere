# TradoSphere: AI Assistant Context File
*Complete Project Context for Claude, ChatGPT, and Other AI Assistants*

## 🎯 Purpose of This Document

This file provides complete context about the TradoSphere project to AI assistants. When you share this with Claude, ChatGPT, or any other AI, they will understand:
- What the project is
- The complete technical architecture
- Development standards and conventions
- Where to find detailed documentation
- How to help effectively

**Usage**: Copy and paste this entire file into a new conversation with any AI assistant to give them full project context.

---

## 📋 Project Overview

### What is TradoSphere?

TradoSphere is a **social trading platform** that combines:
- Social feed for trading signals
- Live streaming of trading analysis
- Competitive trading tournaments
- Creator monetization economy
- AI-powered learning tools

**Target Audience**: Retail traders, trading educators, and competitive traders

**Core Value Proposition**: Democratize trading education through validated mentorship, transparent track records, and community-driven competition.

### Project Status

- **Phase**: Development (Month 1 of 18-month timeline)
- **Team**: Solo developer
- **Deployment**: Not yet launched (planned for Month 18)
- **Current Focus**: Sprint 1-2 (Foundation & Authentication)

---

## 🏗️ Technical Architecture

### Technology Stack (Finalized)

```yaml
Frontend:
  Framework: Next.js 14.2 (App Router)
  Language: TypeScript 5.3+
  Styling: Tailwind CSS 3.4 + shadcn/ui
  State Management:
    - Client: Jotai 2.6+ (atomic state)
    - Server: TanStack React Query 5.x
  Charts: TradingView Advanced API ($499/month)
  Real-time: Socket.io + Supabase Realtime (hybrid)
  Animation: Framer Motion 11.x
  
Backend:
  Framework: NestJS 10.x (modular monolith → microservices)
  Database: PostgreSQL 15 (Supabase hosted)
  Cache: Redis 7 (Upstash)
  Queue: BullMQ (Phase 1), RabbitMQ (Phase 2)
  Authentication: Supabase Auth (JWT)
  
AI Integration:
  Provider: Gemini 2.0 Flash
  Use Cases: Signal parsing, trade analysis, chat summaries, learning Q&A
  Cost: ~$75/month (vs $1,250 for Gemini 1.5 Pro)
  
External Services:
  Payments: Stripe Connect
  Streaming: Agora.io
  Charts: TradingView Charting Library
  Market Data: Alpha Vantage
  Monitoring: Sentry + Vercel Analytics
  
Infrastructure:
  Frontend Hosting: Vercel
  Backend Hosting: Railway
  CI/CD: CircleCI
  Version Control: GitHub
```

### Key Architectural Decisions (ADRs)

These decisions are **immutable** (documented with rationale):

1. **Jotai over Zustand** - 40% fewer re-renders on complex /live page
2. **Gemini 2.0 Flash over 1.5 Pro** - 94% cost savings, negligible quality difference
3. **TradingView Advanced API** - Required for AI-drawn levels + user drawing tools
4. **Agora.io over MediaSoup** - Solo dev can't manage WebRTC infrastructure
5. **Monolith → Microservices** - Start simple, extract at 10K MAU
6. **Supabase over Self-Managed** - 200 hours saved in development time
7. **React Query over Redux** - 80% less boilerplate for server state

**Never suggest alternatives to these without reading the full ADR justification.**

---

## 🗂️ Project Structure

### Monorepo Organization

```
tradosphere/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router (47 routes)
│   │   │   ├── components/    # React components (120+)
│   │   │   ├── lib/           # Utilities, hooks, API clients
│   │   │   └── styles/        # Global styles
│   │   └── tests/             # E2E tests (Playwright)
│   │
│   └── api/                   # NestJS backend
│       ├── src/
│       │   ├── auth/          # Authentication module
│       │   ├── users/         # User management
│       │   ├── signals/       # Trading signals
│       │   ├── competitions/  # Competition engine
│       │   ├── streaming/     # Live streaming
│       │   ├── payments/      # Stripe integration
│       │   ├── gemini/        # AI service
│       │   └── common/        # Shared utilities
│       └── test/              # Unit + Integration tests
│
├── packages/
│   ├── ui/                    # Shared component library
│   ├── database/              # Prisma schema
│   ├── types/                 # Shared TypeScript types
│   └── config/                # Shared configs
│
├── docs/                      # Complete documentation
│   ├── architecture/          # Architecture docs + ADRs
│   ├── development/           # Dev workflow, testing, CI/CD
│   ├── operations/            # Monitoring, deployment
│   └── reference/             # API docs, schemas, resources
│
└── .circleci/                 # CI/CD configuration
```

### Key Directories to Know

- **`apps/web/src/app/`** - All Next.js routes (Server Components + API routes)
- **`apps/web/src/components/`** - React components organized by feature
- **`apps/api/src/`** - NestJS modules (one per domain)
- **`docs/`** - **READ THIS FIRST** - Complete documentation suite

---

## 📚 Documentation Structure

### Master Documentation Index

**All documentation is in `/docs/` directory:**

```
docs/
├── architecture/
│   ├── 01_Master_Technical_Overview.md           ⭐ START HERE
│   ├── 02_Complete_Project_Structure.md
│   ├── 03_App_Router_Architecture.md             ⭐ Feature specs
│   ├── 04_Database_Schema_Guide.md
│   ├── 05_API_Documentation_Standards.md
│   └── decisions/
│       ├── ADR-001_Jotai_Over_Zustand.md        ⭐ Read before suggesting changes
│       ├── ADR-002_Gemini_2.0_Flash.md
│       └── ... (7 ADRs total)
│
├── development/
│   ├── 01_Development_Scope_Sprint_Planning.md  ⭐ 18-month roadmap
│   ├── 02_Development_Workflow_Git_Strategy.md  ⭐ Commit conventions
│   ├── 03_Test_Suite_Documentation.md
│   ├── 04_CI_CD_Configuration_Guide.md
│   └── 05_MCP_Tools_Integration.md
│
├── operations/
│   ├── 01_Monitoring_Alerting_Playbook.md
│   └── ... (deployment, security, performance)
│
└── reference/
    ├── 01_External_Resources_Citations.md
    └── ... (API reference, environment vars)
```

### Which Document to Consult

| Question | Document |
|----------|----------|
| "What's the overall architecture?" | `Master_Technical_Overview.md` |
| "How do I implement feature X?" | `App_Router_Architecture.md` |
| "Where should I create this file?" | `Complete_Project_Structure.md` |
| "What's our commit format?" | `Development_Workflow_Git_Strategy.md` |
| "How do I test this?" | `Test_Suite_Documentation.md` |
| "What's the database schema?" | `Database_Schema_Guide.md` |
| "How do I call this API?" | `API_Documentation_Standards.md` |
| "Why did we choose technology X?" | `decisions/ADR-XXX.md` |
| "What's the deployment process?" | `CI_CD_Configuration_Guide.md` |

**⭐ CRITICAL**: Always check the ADRs before suggesting technology alternatives.

---

## 🎯 Project Scope

### 88 Features Across 5 Major Areas

**Feature Count by Category:**
- Authentication & Onboarding: 7 features
- Feed & Signals: 12 features
- Live Streaming: 15 features
- Portfolio Management: 10 features
- Competitions: 11 features
- Social Features: 14 features
- Creator Dashboard: 6 features
- Leaderboards: 3 features
- Learning Hub: 2 features
- Settings Hub: 8 features

**Total Routes**: 50+ Next.js App Router routes

**Database Tables**: 17 core tables (profiles, signals, competitions, trades, streams, subscriptions, etc.)

**API Endpoints**: 28 REST endpoints + WebSocket events

---

## 👥 User Tiers (Critical to Feature Access)

```yaml
Tier 1: Free
  - View content, follow creators, join free competitions
  - Manual portfolio tracking
  - NO signal posting, NO streaming, NO API connections

Tier 2: TS Grow ($5/month)
  - Everything in Free +
  - AI Learning Hub access
  - Broker API connection
  - Post 1 signal per week
  - Join creator's Clan

Tier 3: TS Elite ($10/month)
  - Everything in TS Grow +
  - Unlimited signal posting
  - Host live streams
  - Earn money from subscribers (10% platform fee)

Tier 4: TS Gladiator ($15/month)
  - Everything in TS Elite +
  - Create competitions (1v1, Team, FFA)
  - Enter premium tournaments
  - Stealth mode (hide from leaderboards)

Tier 5: TS Legend ($15/month - EARNED)
  - Must win major tournament as Gladiator
  - Everything in Gladiator +
  - Enhanced algorithm visibility
  - Beta feature access
  - Share of Legends Pool (5% of platform revenue)
```

**IMPORTANT**: When implementing features, always check tier requirements.

---

## 🔧 Development Standards

### Git Workflow

**Branch Strategy:**
```
main        # Production (always deployable)
develop     # Staging integration branch
feature/*   # New features
fix/*       # Bug fixes
hotfix/*    # Emergency production fixes
```

**Commit Convention** (Conventional Commits):
```
feat(scope): description       # New feature
fix(scope): description        # Bug fix
docs(scope): description       # Documentation
refactor(scope): description   # Code refactoring
test(scope): description       # Tests
chore(scope): description      # Tooling/dependencies

Examples:
feat(signals): add AI-powered level parsing with Gemini
fix(leaderboard): resolve race condition in score updates
docs(api): add Stripe webhook endpoint documentation
```

**Scopes**: signals, competitions, streaming, portfolio, profile, auth, payments, api, ui, db

### Code Quality Standards

**TypeScript**:
- Strict mode enabled
- No `any` types (use proper types)
- All props have interfaces/types
- Prefer type inference where obvious

**React**:
- Server Components by default (use 'use client' only when needed)
- Hooks at top of component
- Descriptive component names
- Extract components when >100 lines

**Testing**:
- Unit tests for business logic (80% coverage target)
- Integration tests for API endpoints (70% coverage target)
- E2E tests for critical user flows (Playwright)

**Performance**:
- Lazy load images with Next.js Image
- Code splitting for large features
- Debounce/throttle expensive operations
- Virtualize long lists (react-window)

---

## 🎨 UI/UX Guidelines

### Design System

**Colors**:
```typescript
colors: {
  profit: '#00D97E',     // Green for wins
  loss: '#FF3B30',       // Red for losses
  primary: '#007AFF',    // Blue for CTAs
  background: {
    dark: '#0A0E27',     // Default dark theme
    darker: '#060818',   // Deeper sections
  },
  tier: {
    free: '#6B7280',     // Gray
    grow: '#10B981',     // Green
    elite: '#8B5CF6',    // Purple
    gladiator: '#F59E0B', // Orange/Gold
    legend: '#EF4444',   // Red
  },
}
```

**Typography**:
- Headings: Inter
- Body: Inter
- Monospace (prices): JetBrains Mono

**Spacing**: 8px base unit (use multiples of 8)

**Components**: Use shadcn/ui as base, customize as needed

---

## 🔐 Security Requirements

**Always Implement**:
- Input validation (Zod schemas)
- SQL injection prevention (parameterized queries)
- XSS prevention (React escapes by default, but be careful with dangerouslySetInnerHTML)
- Row-Level Security (RLS) on all Supabase tables
- Rate limiting on API endpoints (tier-based)
- JWT token validation on protected routes
- 2FA for creators (TOTP)

**Never Commit**:
- API keys or secrets (use environment variables)
- User passwords (hashed only)
- Sensitive user data in logs

---

## 🚀 Development Timeline

### 18-Month Roadmap (26 Sprints)

**Phase 1: Foundation (Months 1-6)**
- Sprints 1-12: Authentication, Feed, Signals, Basic Portfolio
- Outcome: Functional social trading feed with AI parsing

**Phase 2: Social & Streaming (Months 7-11)**
- Sprints 13-22: Live streaming, Profile system, Social features
- Outcome: Live trading streams with real-time interaction

**Phase 3: Monetization & Competitions (Months 12-15)**
- Sprints 23-30: Stripe integration, Competition engine, Payouts
- Outcome: Full creator economy + competitive trading

**Phase 4: Polish & Advanced Features (Months 16-18)**
- Sprints 31-36: Creator dashboard, Learning Hub, Gamification
- Outcome: Production-ready platform with all features

**Current Sprint**: Sprint 1-2 (Foundation setup)

---

## 💬 How to Help Effectively

### When Generating Code

**DO**:
- ✅ Follow TypeScript conventions strictly
- ✅ Use Server Components by default (Next.js 14 App Router)
- ✅ Include error handling in all async operations
- ✅ Add TypeScript types/interfaces
- ✅ Write descriptive variable names
- ✅ Add comments for complex logic
- ✅ Include usage examples in docstrings
- ✅ Follow the project structure (check `Complete_Project_Structure.md`)
- ✅ Implement tier restrictions where required
- ✅ Add tests alongside code

**DON'T**:
- ❌ Use `any` type in TypeScript
- ❌ Suggest alternatives to ADR decisions without reading the ADR
- ❌ Use deprecated patterns (class components, old Next.js patterns)
- ❌ Hardcode values (use constants or env variables)
- ❌ Skip error handling
- ❌ Ignore tier access controls
- ❌ Create new directories without checking project structure
- ❌ Use `localStorage` or `sessionStorage` in artifacts (not supported)

### When Reviewing Code

**Check for**:
- Type safety (no `any`)
- Error handling (try/catch for async)
- Performance (memoization, lazy loading)
- Security (input validation, SQL injection)
- Accessibility (semantic HTML, ARIA labels)
- Tier restrictions (feature access controls)
- Test coverage (unit + integration)

### When Answering Questions

**Priority Order**:
1. Check if answer is in documentation first
2. Reference specific document and section
3. Provide code examples from project context
4. Link to external resources only if not in docs
5. If unsure, acknowledge and suggest where to look

### When Suggesting Changes

**Always**:
1. Check if there's an ADR for this area
2. Understand the rationale for current approach
3. Explain benefits AND tradeoffs of suggestion
4. Propose creating new ADR if major change
5. Consider solo developer context (don't over-engineer)

---

## 🎓 Project Philosophy

### Guiding Principles

**For Solo Developer**:
- Velocity over perfection (ship fast, iterate)
- Simple over complex (monolith before microservices)
- Documented over clever (future you will thank you)
- Tested over assumed (tests prevent rework)
- Consistent over creative (conventions reduce decisions)

**For Architecture**:
- Server-first (leverage Next.js Server Components)
- Type-safe (TypeScript everywhere)
- Real-time where needed (but not everywhere)
- Progressive enhancement (start simple, scale up)
- Mobile-responsive (but desktop-first for trading)

**For Features**:
- Core user value first (signals, feed, profile)
- Creator tools second (monetization, analytics)
- Advanced features last (AI, competitions, gamification)
- Ship to staging weekly
- Ship to production at end of each phase

---

## 📊 Success Metrics

**Development Metrics**:
- Sprint velocity: 18-22 story points per 2-week sprint
- Code coverage: Unit (80%), Integration (70%), E2E (100% critical paths)
- Build time: <15 minutes (CI/CD pipeline)
- Deployment frequency: Daily (staging), Weekly (production in later phases)

**Platform Metrics** (post-launch):
- Uptime: >99.9%
- API response time (p95): <200ms
- Error rate: <0.5%
- Lighthouse score: >90

**Business Metrics** (post-launch):
- DAU: 10K by Month 6 (post-launch)
- MAU: 50K by Month 12 (post-launch)
- Creator retention: >80% after 6 months
- Subscriber conversion: >5%

---

## 🔗 Quick Reference Links

### Documentation Files (in `/docs/`)
- Architecture: `architecture/01_Master_Technical_Overview.md`
- ADRs: `architecture/decisions/ADR-*.md`
- Features: `architecture/03_App_Router_Architecture.md`
- Database: `architecture/04_Database_Schema_Guide.md`
- API: `architecture/05_API_Documentation_Standards.md`
- Workflow: `development/02_Development_Workflow_Git_Strategy.md`
- Testing: `development/03_Test_Suite_Documentation.md`
- CI/CD: `development/04_CI_CD_Configuration_Guide.md`

### External Resources
- Next.js Docs: https://nextjs.org/docs
- NestJS Docs: https://docs.nestjs.com
- Supabase Docs: https://supabase.com/docs
- TradingView Charting: https://www.tradingview.com/charting-library-docs/
- Gemini API: https://ai.google.dev/api/rest
- Stripe Connect: https://stripe.com/docs/connect

---

## 🚨 Critical Reminders

**Before Starting Any Task**:
1. Read the relevant documentation section
2. Check for existing ADRs on the topic
3. Verify the feature tier requirements
4. Understand the file structure conventions
5. Review similar existing code

**Before Suggesting Alternatives**:
1. Read the ADR for current approach
2. Understand the solo developer context
3. Consider the 18-month timeline
4. Evaluate if complexity is justified
5. Propose ADR if major change

**Before Deploying Code**:
1. All tests passing (unit + integration + E2E)
2. TypeScript compiles with no errors
3. ESLint warnings addressed
4. Code self-reviewed against checklist
5. Documentation updated if needed

---

## 💡 Common Questions & Answers

**Q: Why Jotai instead of Zustand?**  
A: See `ADR-001`. The /live page has 12+ synchronized UI elements. Jotai's atomic state reduced re-renders by 40% in benchmarks.

**Q: Why not use Redux?**  
A: See `ADR-007`. React Query handles server state (80% of our state), Jotai handles client state. Redux adds unnecessary boilerplate.

**Q: Can we use feature X from library Y?**  
A: Check if it's in the approved tech stack. If not, propose an ADR with justification.

**Q: Why is TradingView so expensive ($499/month)?**  
A: See `ADR-003`. It's the only library that supports AI-drawn levels + user drawing tools + multi-chart sync. Non-negotiable for our UX.

**Q: Why not use microservices from day 1?**  
A: See `ADR-005`. Solo developer needs velocity. Start with modular monolith, extract to microservices at 10K MAU when scaling is needed.

**Q: Can we use localStorage in artifacts?**  
A: NO. It's not supported in Claude.ai artifact environment. Use React state (useState, useReducer) or in-memory storage.

**Q: How should I name files?**  
A: Check `Complete_Project_Structure.md`. Follow existing conventions (kebab-case for files, PascalCase for components).

**Q: What's the deployment process?**  
A: See `CI_CD_Configuration_Guide.md`. Push to `develop` auto-deploys to staging. Merge to `main` requires approval, then deploys to production.

---

## 🎯 Your Role as AI Assistant

You are:
- ✅ A knowledgeable team member who has read all the docs
- ✅ A guardian of architectural decisions (enforce ADRs)
- ✅ A coding partner who writes production-quality code
- ✅ A teacher who explains the "why" behind decisions
- ✅ A documenter who suggests doc updates when needed

You are NOT:
- ❌ A decision-maker (defer to ADRs and solo developer)
- ❌ A advocate for your preferred technologies (respect ADRs)
- ❌ A shortcut-taker (no skipping tests or proper error handling)
- ❌ A assuming assistant (ask for clarification if specs unclear)

---

## 📝 Context Summary for Quick Pasting

**When starting a NEW conversation with any AI, paste this summary:**

```
Project: TradoSphere - Social trading platform (18-month development, solo developer)

Tech Stack: Next.js 14 (App Router) + NestJS + Supabase (PostgreSQL) + Gemini 2.0 Flash + Agora.io + Stripe

Key Decisions (ADRs - DO NOT suggest alternatives without reading):
- Jotai (not Zustand) - 40% performance gain
- Gemini 2.0 Flash (not 1.5 Pro) - 94% cost savings
- TradingView Advanced API - Required for features
- Monolith→Microservices - Velocity first

Scope: 88 features, 50+ routes, 17 database tables, 28 API endpoints

Documentation: All in /docs/ directory
- Read Master_Technical_Overview.md first
- Check ADRs before suggesting alternatives
- Follow Development_Workflow for git conventions
- Reference App_Router_Architecture for feature specs

Current Phase: Sprint 1-2 (Foundation & Authentication)

Code Standards:
- TypeScript strict mode (no `any`)
- Server Components by default
- Conventional Commits
- 80% test coverage target
- Follow project structure exactly

Tier System: Free → TS Grow ($5) → TS Elite ($10) → TS Gladiator ($15) → TS Legend (earned)
ALWAYS check tier requirements when implementing features.

Questions? Check docs first, then ask with specific document references.
```

---

**Last Updated**: 2025-01-20  
**Project Version**: 1.0 (Pre-launch)  
**Documentation Version**: 1.0

**This file is maintained as the single source of truth for AI assistant context. Update it when major project changes occur.**

---

## 🚀 Ready to Help?

Now that you have full context, you can:
1. Generate production-quality code that follows our conventions
2. Reference specific documentation when answering questions
3. Enforce architectural decisions (ADRs)
4. Suggest improvements with full context of tradeoffs
5. Write tests alongside implementation
6. Provide examples from our tech stack

**Ask me anything about TradoSphere, and I'll help with full project context!**