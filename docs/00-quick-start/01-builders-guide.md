# TradoSphere Builder's Guide
*Complete Development Manual for Building the Platform*

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Architecture Guide](#architecture-guide)
4. [Development Workflow](#development-workflow)
5. [Feature Implementation](#feature-implementation)
6. [Testing Guide](#testing-guide)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20 LTS
- pnpm 8+
- PostgreSQL 15+ (or Supabase account)
- Redis 7+ (or Upstash account)
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/Isakainovorium/TradoSphere.git
cd TradoSphere

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run database migrations
pnpm db:migrate

# Start development
pnpm dev
```

### Key Commands

```bash
pnpm dev          # Start all services
pnpm dev:web      # Frontend only
pnpm dev:api      # Backend only
pnpm test         # Run all tests
pnpm build        # Build for production
```

---

## 📖 Project Overview

### What is TradoSphere?

TradoSphere is a **full-stack social trading platform** combining:
- **Trading Infrastructure**: Direct broker integrations, trade execution
- **Social Learning**: Signal sharing, live streaming, mentorship
- **Verified Competition**: Automated tournaments with real broker trades
- **AI-Powered Tools**: Gemini 2.0 Flash for signal parsing and analysis
- **Creator Economy**: Monetization through subscriptions and competitions

### Core Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript 5.3+
- Tailwind CSS + shadcn/ui
- Jotai (state management)
- TradingView Charting Library

**Backend:**
- NestJS 10.x (modular monolith)
- PostgreSQL 15 (Supabase)
- Redis 7 (Upstash)
- Socket.io (WebSockets)
- BullMQ (job queues)

**AI & External:**
- Gemini 2.0 Flash API
- Agora.io (live streaming)
- Stripe (payments)
- Alpha Vantage (market data)

### Project Structure

```
tradosphere/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI components
├── supabase/
│   └── migrations/   # Database migrations
├── docs/             # Documentation (see DOC_INDEX.md)
└── tools/            # Development tools
```

---

## 🏗️ Architecture Guide

### Monorepo Architecture

TradoSphere uses a **pnpm workspace monorepo**:
- **apps/web**: Next.js 14 frontend application
- **apps/api**: NestJS backend services
- **packages/types**: Shared TypeScript definitions
- **packages/ui**: Shared React components (future)

### Frontend Architecture

**App Router Structure:**
- `app/(auth)/` - Authentication routes (login, signup)
- `app/(platform)/` - Main platform routes (feed, portfolio, competitions)
- `app/(marketing)/` - Public marketing pages
- `app/api/` - API routes (Next.js route handlers)

**Key Patterns:**
- **Server Components by default** - Use client components only when needed
- **Co-location** - Keep related files together
- **Route groups** - Use `()` for logical grouping without affecting URLs

### Backend Architecture

**Modular Monolith:**
- Each feature is a **module** (auth, signals, competitions, etc.)
- Modules can be extracted to microservices later
- Shared utilities in `common/` directory

**Service Pattern:**
```typescript
// Each module follows this structure:
module/
├── module.ts          # NestJS module definition
├── service.ts         # Business logic
├── controller.ts      # HTTP endpoints
├── entities/          # Database entities
├── dto/               # Data transfer objects
└── jobs/              # Background jobs (if needed)
```

### Database Architecture

**PostgreSQL with Supabase:**
- 17 core tables (profiles, signals, competitions, etc.)
- Row-Level Security (RLS) on all tables
- TimescaleDB for time-series data (portfolio analytics)
- Full-text search for signals/search

**Migration Strategy:**
- All migrations in `supabase/migrations/`
- Sequential numbering: `YYYYMMDDHHMMSS_description.sql`
- Always test migrations on staging first

---

## 🔄 Development Workflow

### Git Workflow

**Branch Strategy:**
```
main              # Production (always deployable)
├── develop      # Integration branch
│   ├── feature/*  # New features
│   ├── fix/*      # Bug fixes
│   └── refactor/* # Code improvements
└── hotfix/*     # Emergency fixes
```

**Commit Convention:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Example:**
```bash
git commit -m "feat(signals): add AI level parsing with Gemini"
git commit -m "fix(competitions): resolve leaderboard race condition"
```

### Feature Development Process

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/signal-ai-parsing
   ```

2. **Implement feature**
   - Follow architecture patterns
   - Write tests
   - Update documentation if needed

3. **Test locally**
   ```bash
   pnpm test
   pnpm build
   ```

4. **Create Pull Request**
   - Use PR template
   - Link related issues
   - Request review

5. **Merge after approval**
   - Squash commits if needed
   - Delete feature branch

### Code Standards

**TypeScript:**
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Export types/interfaces explicitly
- Use meaningful names

**React:**
- Use Server Components by default
- Extract to Client Components only when needed
- Use `use client` directive at top of file
- Keep components small and focused

**NestJS:**
- Follow dependency injection patterns
- Use DTOs for all inputs/outputs
- Validate with class-validator
- Use guards for authorization

---

## 🎯 Feature Implementation

### Implementing a New Feature

**Step 1: Understand the Requirement**
- Read feature spec in `docs/features/`
- Review similar existing features
- Check ADRs for relevant decisions

**Step 2: Design the Solution**
- Database schema changes (if needed)
- API endpoints (REST or WebSocket)
- Frontend components and pages
- Background jobs (if needed)

**Step 3: Database (if needed)**
- Create migration file
- Add to `supabase/migrations/`
- Test migration locally

**Step 4: Backend Implementation**
- Create NestJS module
- Implement service logic
- Add controller endpoints
- Write unit tests

**Step 5: Frontend Implementation**
- Create Next.js pages/components
- Add API route handlers (if needed)
- Implement UI with shadcn/ui
- Add client-side state (Jotai if needed)

**Step 6: Integration**
- Connect frontend to backend
- Test end-to-end flow
- Handle errors gracefully

**Step 7: Testing**
- Unit tests for business logic
- Integration tests for APIs
- E2E tests for critical flows

### Common Patterns

**API Route Handler:**
```typescript
// app/api/signals/route.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Implementation
  const signals = await fetchSignals(user.id);
  
  return NextResponse.json({ data: signals });
}
```

**NestJS Controller:**
```typescript
// apps/api/src/signals/signals.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SignalsService } from './signals.service';

@Controller('signals')
@UseGuards(JwtAuthGuard)
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}
  
  @Get()
  async findAll() {
    return this.signalsService.findAll();
  }
}
```

**Server Component:**
```typescript
// app/(platform)/feed/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { SignalCard } from '@/components/signals/signal-card';

export default async function FeedPage() {
  const supabase = createServerClient();
  const { data: signals } = await supabase
    .from('signals')
    .select('*')
    .order('posted_at', { ascending: false })
    .limit(20);
  
  return (
    <div>
      {signals?.map(signal => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  );
}
```

---

## 🧪 Testing Guide

### Test Structure

```
tests/
├── unit/           # Unit tests (Jest/Vitest)
├── integration/    # API integration tests
└── e2e/            # End-to-end tests (Playwright)
```

### Writing Tests

**Unit Test Example:**
```typescript
// tests/unit/utils/calculations.test.ts
import { calculatePnL } from '@/lib/utils/calculations';

describe('calculatePnL', () => {
  it('calculates profit for long position', () => {
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
```

**E2E Test Example:**
```typescript
// tests/e2e/signals/signal-posting.spec.ts
import { test, expect } from '@playwright/test';

test('TS Elite user posts signal', async ({ page }) => {
  await page.goto('/login');
  await loginAsEliteUser(page);
  
  await page.goto('/feed');
  await page.click('[data-testid="create-signal"]');
  await page.fill('[name="rationale"]', 'Long BTC at $50k');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.signal-card')).toBeVisible();
});
```

### Running Tests

```bash
pnpm test              # All tests
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration tests
pnpm test:e2e          # E2E tests
```

---

## 🚢 Deployment Guide

### Environment Setup

**Required Environment Variables:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Gemini
GEMINI_API_KEY=

# Agora
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Deployment Steps

**Frontend (Vercel):**
1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `pnpm build`
4. Set output directory: `.next`
5. Deploy automatically on push to `main`

**Backend (Railway):**
1. Connect GitHub repository
2. Set Node.js version: 20
3. Configure environment variables
4. Set start command: `pnpm start:api`
5. Deploy automatically

**Database (Supabase):**
1. Run migrations in order
2. Verify RLS policies
3. Set up database functions
4. Configure backups

---

## 🔧 Troubleshooting

### Common Issues

**TypeScript Errors:**
- Run `pnpm type-check` to see all errors
- Ensure types are generated from Supabase
- Check `tsconfig.json` paths

**Database Connection:**
- Verify Supabase credentials
- Check network connectivity
- Review RLS policies

**Build Failures:**
- Clear `.next` and `node_modules`
- Run `pnpm install --frozen-lockfile`
- Check for dependency conflicts

**API Errors:**
- Check backend logs
- Verify authentication tokens
- Review rate limits

### Getting Help

1. Check documentation in `docs/`
2. Review ADRs for architectural decisions
3. Search existing issues on GitHub
4. Ask in team chat (if applicable)

---

## 📚 Additional Resources

- **Master Technical Overview**: `docs/architecture/01_master-technical-overview.md`
- **API Documentation**: `docs/reference/02_api-reference.md`
- **Database Schema**: `docs/architecture/04_database-schema-guide.md`
- **External Resources**: `docs/reference/01_external-resources-citations.md`

---

## ✅ Checklist for New Developers

- [ ] Read Master Technical Overview
- [ ] Set up development environment
- [ ] Run `pnpm dev` successfully
- [ ] Create a test feature branch
- [ ] Make first commit following conventions
- [ ] Write first unit test
- [ ] Review code standards document
- [ ] Understand git workflow
- [ ] Read relevant feature specs
- [ ] Set up IDE with recommended extensions

---

**Last Updated**: 2025-01-22  
**Version**: 1.0  
**Maintainer**: Development Team

