# TradoSphere Quick Reference Card
*Keep This Handy While Coding*

## 🚀 Essential Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm build               # Build for production
pnpm test                # Run all tests
pnpm test:watch          # Run tests in watch mode
pnpm lint                # Run ESLint
pnpm type-check          # TypeScript check

# Database
pnpm db:migrate          # Run migrations
pnpm db:seed             # Seed database
pnpm db:types:generate   # Generate TypeScript types
pnpm db:studio           # Open Prisma Studio

# Testing
pnpm test:unit           # Unit tests only
pnpm test:integration    # Integration tests only
pnpm test:e2e            # E2E tests (Playwright)
pnpm test:e2e:ui         # E2E with UI (debug mode)

# Git
git checkout -b feature/name     # New feature branch
git commit -m "feat(scope): ..." # Commit with convention
git push origin feature/name     # Push branch
```

---

## 📁 File Organization (Where Things Go)

```
apps/web/src/
├── app/                          # Routes (Server Components)
│   ├── (auth)/login/page.tsx    # Auth pages
│   ├── (platform)/feed/page.tsx # Main app pages
│   └── api/signals/route.ts     # API endpoints
├── components/
│   ├── ui/                       # shadcn components
│   ├── signals/                  # Signal-specific
│   ├── layout/                   # Nav, sidebar, footer
│   └── common/                   # Shared components
├── lib/
│   ├── supabase/                 # Database client
│   ├── gemini/                   # AI integration
│   ├── hooks/                    # React hooks
│   ├── store/                    # Jotai atoms
│   └── utils/                    # Helper functions

apps/api/src/
├── auth/                         # Auth module
├── signals/                      # Signals module
├── competitions/                 # Competitions module
└── common/                       # Shared code
```

---

## 🎨 Code Templates

### Server Component (Next.js)
```typescript
// app/(platform)/feed/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function FeedPage() {
  const supabase = createServerClient();
  const { data } = await supabase.from('signals').select('*');
  
  return <div>{/* UI */}</div>;
}
```

### Client Component
```typescript
// components/signals/signal-card.tsx
'use client';
import { useState } from 'react';

export function SignalCard({ signal }: Props) {
  const [liked, setLiked] = useState(false);
  return <div>{/* UI */}</div>;
}
```

### API Route (Next.js)
```typescript
// app/api/signals/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const signals = await db.signals.findMany();
  return NextResponse.json({ data: signals });
}
```

### NestJS Controller
```typescript
// apps/api/src/signals/signals.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('signals')
export class SignalsController {
  @Get()
  findAll() { return this.signalsService.findAll(); }
  
  @Post()
  create(@Body() dto: CreateSignalDto) {
    return this.signalsService.create(dto);
  }
}
```

---

## ✍️ Commit Message Examples

```bash
# Features
feat(signals): add AI-powered level parsing
feat(competitions): implement real-time leaderboard
feat(streaming): add emoji reaction overlay

# Fixes
fix(auth): resolve session refresh race condition
fix(leaderboard): correct score calculation for ties
fix(feed): prevent duplicate signal rendering

# Docs
docs(api): add Gemini endpoint examples
docs(readme): update environment setup instructions

# Tests
test(signals): add E2E test for signal creation
test(competitions): add unit tests for scoring engine

# Refactor
refactor(feed): extract signal card into component
refactor(db): optimize feed query with indexes

# Chore
chore(deps): upgrade Next.js to 14.2.1
chore(ci): add Playwright to CircleCI pipeline
```

---

## 🔐 Environment Variables (Required)

```bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Supabase
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# AI
GEMINI_API_KEY=...

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Streaming
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...

# Monitoring
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...

# URLs
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 👥 User Tiers (Feature Access)

| Tier | Price | Key Features |
|------|-------|--------------|
| Free | $0 | View, follow, free competitions |
| TS Grow 🌱 | $5 | AI Hub, 1 signal/week, broker API |
| TS Elite ✨ | $10 | Unlimited signals, streaming, earn money |
| TS Gladiator ⚔️ | $15 | Create competitions, stealth mode |
| TS Legend 🏆 | $15* | Enhanced visibility, Legends Pool |

*Must win major tournament to qualify

**Always check tier requirements when implementing features!**

---

## 📊 Database Quick Reference

### Key Tables
```sql
profiles          -- User accounts (extends auth.users)
signals           -- Trading signals
trades            -- Portfolio trades
subscriptions     -- Creator subscriptions
competitions      -- Tournaments
streams           -- Live streams
messages          -- Direct messages
```

### Common Queries
```typescript
// Get active signals
const { data } = await supabase
  .from('signals')
  .select('*, creator:profiles(*)')
  .eq('status', 'active')
  .order('posted_at', { ascending: false })
  .limit(20);

// Check user tier
const { data: profile } = await supabase
  .from('profiles')
  .select('tier')
  .eq('id', userId)
  .single();
```

---

## 🧪 Testing Checklist

**Before Committing:**
- [ ] Unit tests written for business logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user-facing features
- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript compiles (`pnpm type-check`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Code coverage >80% (unit), >70% (integration)

**Test File Naming:**
```
feature.test.ts          # Unit tests (Vitest)
feature.spec.ts          # E2E tests (Playwright)
feature.integration.ts   # Integration tests
```

---

## 🚨 Common Mistakes to Avoid

**DON'T:**
- ❌ Use `any` type in TypeScript
- ❌ Skip error handling in async functions
- ❌ Hardcode values (use constants/env vars)
- ❌ Use `localStorage` in artifacts (not supported)
- ❌ Forget tier access controls
- ❌ Create files in wrong directories
- ❌ Commit without conventional commit message
- ❌ Push to main (always use feature branches)
- ❌ Skip writing tests
- ❌ Ignore TypeScript errors

**DO:**
- ✅ Use Server Components by default
- ✅ Add 'use client' only when needed
- ✅ Validate user input (Zod schemas)
- ✅ Use parameterized queries (prevent SQL injection)
- ✅ Implement RLS policies on all tables
- ✅ Follow project file structure
- ✅ Write descriptive commit messages
- ✅ Self-review code before pushing
- ✅ Update documentation when needed
- ✅ Check ADRs before suggesting changes

---

## 📚 Documentation Quick Links

**Read First:**
- `docs/architecture/01_Master_Technical_Overview.md`

**Daily Reference:**
- `docs/development/02_Development_Workflow_Git_Strategy.md`
- `docs/architecture/03_App_Router_Architecture.md`
- `docs/architecture/04_Database_Schema_Guide.md`

**When Implementing:**
- `docs/development/03_Test_Suite_Documentation.md`
- `docs/architecture/05_API_Documentation_Standards.md`

**Decision Making:**
- `docs/architecture/decisions/ADR-*.md`

**AI Assistant Context:**
- `Claude.md` (share with AI assistants)

---

## 🎯 Sprint Workflow (2 Weeks)

**Day 1 (Monday):**
- Sprint planning
- Create GitHub issues
- Estimate story points (target: 18-22)

**Days 2-9 (Dev Phase):**
- 4-6 hours deep work daily
- Commit at least once per day
- Open PRs early (draft mode)

**Day 10 (Friday Week 1):**
- Mid-sprint check-in
- Merge completed PRs

**Days 11-13 (Refinement):**
- Complete features
- Write tests
- Update docs

**Day 14 (Friday Week 2):**
- Sprint review
- Retrospective
- Plan next sprint

---

## 💰 Monthly Costs

```
Development: $129/month
  - GitHub Pro: $4
  - Vercel Pro: $20
  - Railway: $50
  - Supabase: $25
  - CircleCI: $30

Services: $1,190/month
  - TradingView: $499
  - Agora.io: $500
  - Gemini API: $75
  - Alpha Vantage: $50
  - Upstash Redis: $20
  - Resend: $20
  - Sentry: $26

Total: ~$1,319/month
```

---

## 🔗 Critical External Links

- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- NestJS Docs: https://docs.nestjs.com
- TradingView: https://tradingview.com/charting-library-docs
- Gemini API: https://ai.google.dev/api/rest
- shadcn/ui: https://ui.shadcn.com
- Stripe Connect: https://stripe.com/docs/connect

---

## 📞 When Stuck

**1. Check Documentation First**
   → Search `/docs/` directory

**2. Review Similar Code**
   → Find existing implementation of similar feature

**3. Check ADRs**
   → Understand why current approach was chosen

**4. Use MCP Tools**
   → Exa for research, Sequential Thinking for breakdown

**5. Share Claude.md with AI**
   → Get help with full project context

---

**Print this card and keep it visible while coding!**

**Last Updated**: 2025-01-20