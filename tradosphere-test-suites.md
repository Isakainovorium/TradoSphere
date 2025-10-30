# TradoSphere: Complete Test Suite Documentation
*Comprehensive Testing Strategy for Production-Ready Quality*

## 🎯 Testing Philosophy

**Test Pyramid Strategy:**
```
        /\
       /  \     E2E Tests (10%)
      /    \    - Critical user flows
     /------\   - 50+ scenarios
    /        \  
   / Integration \ (30%)
  /    Tests      \  - API endpoints
 /----------------\  - Database operations
/                  \ - External services
/   Unit Tests     \ (60%)
/    (Foundation)   \ - Business logic
--------------------  - Utility functions
                      - 200+ tests
```

**Coverage Targets:**
- Unit Tests: 80% code coverage
- Integration Tests: 70% API coverage
- E2E Tests: 100% critical path coverage

---

## 📁 Test Suite Structure

```
tests/
├── unit/                       # Jest/Vitest unit tests
│   ├── utils/
│   │   ├── calculations.test.ts
│   │   ├── formatters.test.ts
│   │   └── validators.test.ts
│   ├── components/
│   │   ├── signal-card.test.tsx
│   │   ├── trading-chart.test.tsx
│   │   └── leaderboard-row.test.tsx
│   ├── hooks/
│   │   ├── use-signals.test.ts
│   │   ├── use-stream.test.ts
│   │   └── use-realtime.test.ts
│   └── services/
│       ├── signals.service.test.ts
│       ├── competition.service.test.ts
│       └── gemini.service.test.ts
│
├── integration/                # API integration tests
│   ├── auth/
│   │   ├── login.test.ts
│   │   ├── registration.test.ts
│   │   └── password-reset.test.ts
│   ├── signals/
│   │   ├── crud.test.ts
│   │   ├── parsing.test.ts
│   │   └── realtime.test.ts
│   ├── competitions/
│   │   ├── creation.test.ts
│   │   ├── joining.test.ts
│   │   ├── scoring.test.ts
│   │   └── leaderboard.test.ts
│   ├── payments/
│   │   ├── subscription.test.ts
│   │   ├── webhooks.test.ts
│   │   └── payouts.test.ts
│   └── streaming/
│       ├── token-generation.test.ts
│       └── session-management.test.ts
│
├── e2e/                        # Playwright E2E tests
│   ├── critical-paths/
│   │   ├── user-onboarding.spec.ts
│   │   ├── signal-lifecycle.spec.ts
│   │   ├── subscription-flow.spec.ts
│   │   └── competition-participation.spec.ts
│   ├── features/
│   │   ├── feed.spec.ts
│   │   ├── live-streaming.spec.ts
│   │   ├── portfolio.spec.ts
│   │   ├── profile.spec.ts
│   │   └── creator-dashboard.spec.ts
│   ├── tier-restrictions/
│   │   ├── free-tier.spec.ts
│   │   ├── grow-tier.spec.ts
│   │   ├── elite-tier.spec.ts
│   │   └── gladiator-tier.spec.ts
│   └── real-time/
│       ├── chat.spec.ts
│       ├── leaderboard-updates.spec.ts
│       └── signal-updates.spec.ts
│
├── performance/                # Load & performance tests
│   ├── api/
│   │   ├── feed-endpoint.perf.ts
│   │   ├── leaderboard-query.perf.ts
│   │   └── signal-creation.perf.ts
│   └── frontend/
│       ├── lighthouse-audit.ts
│       └── bundle-size.test.ts
│
├── security/                   # Security tests
│   ├── sql-injection.test.ts
│   ├── xss-prevention.test.ts
│   ├── auth-bypass.test.ts
│   └── rate-limiting.test.ts
│
└── fixtures/                   # Test data
    ├── users.ts
    ├── signals.ts
    ├── competitions.ts
    └── mock-responses.ts
```

---

## 🧪 Unit Tests

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Example Unit Tests

#### 1. Trading Calculations

```typescript
// tests/unit/utils/calculations.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculatePnL,
  calculateRiskReward,
  calculateSharpeRatio,
  calculateWinRate,
  calculateMaxDrawdown,
} from '@/lib/utils/calculations';

describe('Trading Calculations', () => {
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
      expect(result.roi).toBeCloseTo(0.04, 2);
    });

    it('calculates loss correctly for long position', () => {
      const result = calculatePnL({
        direction: 'LONG',
        entryPrice: 50000,
        exitPrice: 48000,
        size: 1,
      });
      
      expect(result.pnl).toBe(-2000);
      expect(result.percentage).toBe(-4);
    });

    it('calculates profit correctly for short position', () => {
      const result = calculatePnL({
        direction: 'SHORT',
        entryPrice: 50000,
        exitPrice: 48000,
        size: 1,
      });
      
      expect(result.pnl).toBe(2000);
      expect(result.percentage).toBe(4);
    });

    it('handles zero position size', () => {
      const result = calculatePnL({
        direction: 'LONG',
        entryPrice: 50000,
        exitPrice: 52000,
        size: 0,
      });
      
      expect(result.pnl).toBe(0);
    });
  });

  describe('calculateRiskReward', () => {
    it('calculates correct R:R ratio', () => {
      const ratio = calculateRiskReward({
        entry: 50000,
        target: 52000,
        stopLoss: 49000,
      });
      
      expect(ratio).toBe(2); // 2000 reward / 1000 risk = 2:1
    });

    it('returns null for invalid inputs', () => {
      const ratio = calculateRiskReward({
        entry: 50000,
        target: 48000, // Target below entry for long
        stopLoss: 49000,
      });
      
      expect(ratio).toBeNull();
    });
  });

  describe('calculateSharpeRatio', () => {
    it('calculates Sharpe ratio correctly', () => {
      const returns = [0.05, 0.03, -0.02, 0.04, 0.06];
      const riskFreeRate = 0.02;
      
      const sharpe = calculateSharpeRatio(returns, riskFreeRate);
      
      expect(sharpe).toBeGreaterThan(0);
      expect(sharpe).toBeLessThan(3); // Reasonable range
    });

    it('handles negative Sharpe ratio', () => {
      const returns = [-0.05, -0.03, -0.02, -0.04, -0.06];
      const riskFreeRate = 0.02;
      
      const sharpe = calculateSharpeRatio(returns, riskFreeRate);
      
      expect(sharpe).toBeLessThan(0);
    });
  });

  describe('calculateWinRate', () => {
    it('calculates win rate from trade history', () => {
      const trades = [
        { pnl: 100 },
        { pnl: -50 },
        { pnl: 200 },
        { pnl: 150 },
        { pnl: -75 },
      ];
      
      const winRate = calculateWinRate(trades);
      
      expect(winRate).toBe(60); // 3 wins out of 5
    });

    it('returns 0 for no trades', () => {
      const winRate = calculateWinRate([]);
      expect(winRate).toBe(0);
    });

    it('handles all winning trades', () => {
      const trades = [
        { pnl: 100 },
        { pnl: 200 },
        { pnl: 150 },
      ];
      
      const winRate = calculateWinRate(trades);
      expect(winRate).toBe(100);
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('identifies maximum drawdown', () => {
      const equityCurve = [1000, 1100, 1050, 950, 900, 1000, 1200];
      
      const drawdown = calculateMaxDrawdown(equityCurve);
      
      expect(drawdown.percentage).toBeCloseTo(-18.18, 2); // -200 from peak 1100
      expect(drawdown.peak).toBe(1100);
      expect(drawdown.trough).toBe(900);
    });
  });
});
```

#### 2. React Components

```typescript
// tests/unit/components/signal-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignalCard } from '@/components/signals/signal-card';
import { createMockSignal } from '../../fixtures/signals';

describe('SignalCard', () => {
  it('renders signal information correctly', () => {
    const signal = createMockSignal({
      asset_symbol: 'BTC/USD',
      direction: 'LONG',
      entry_price: 50000,
      target_price: 52000,
      status: 'active',
    });

    render(<SignalCard signal={signal} />);

    expect(screen.getByText('BTC/USD')).toBeInTheDocument();
    expect(screen.getByText('LONG')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });

  it('displays hit badge when signal hits target', () => {
    const signal = createMockSignal({
      status: 'hit',
      outcome_price: 52000,
    });

    render(<SignalCard signal={signal} />);

    const badge = screen.getByTestId('hit-miss-badge');
    expect(badge).toHaveClass('status-hit');
    expect(screen.getByText('HIT')).toBeInTheDocument();
  });

  it('displays win streak for consecutive hits', () => {
    const signal = createMockSignal({
      status: 'hit',
    });
    
    const creator = {
      ...signal.creator,
      win_streak: 5,
    };

    render(<SignalCard signal={{ ...signal, creator }} />);

    expect(screen.getByTestId('win-streak-badge')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByTestId('flame-icon')).toBeInTheDocument();
  });

  it('applies profit glow for profitable signals', () => {
    const signal = createMockSignal({
      status: 'hit',
      entry_price: 50000,
      outcome_price: 52000,
    });

    const { container } = render(<SignalCard signal={signal} />);
    
    const card = container.querySelector('.signal-card');
    expect(card).toHaveClass('profit-glow');
  });

  it('handles signal like action', async () => {
    const signal = createMockSignal();
    const onLike = vi.fn();

    render(<SignalCard signal={signal} onLike={onLike} />);

    const likeButton = screen.getByTestId('like-button');
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(onLike).toHaveBeenCalledWith(signal.id);
    });
  });

  it('shows tier restriction for free users', () => {
    const signal = createMockSignal();
    const currentUser = { tier: 'free' };

    render(<SignalCard signal={signal} currentUser={currentUser} />);

    const actionButton = screen.getByTestId('signal-action');
    expect(actionButton).toBeDisabled();
    expect(screen.getByText(/Upgrade to TS Grow/i)).toBeInTheDocument();
  });
});
```

#### 3. Custom Hooks

```typescript
// tests/unit/hooks/use-signals.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSignals } from '@/lib/hooks/use-signals';
import { createMockSignal } from '../../fixtures/signals';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useSignals', () => {
  it('fetches signals successfully', async () => {
    const mockSignals = [
      createMockSignal({ id: '1' }),
      createMockSignal({ id: '2' }),
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSignals),
      } as Response)
    );

    const { result } = renderHook(() => useSignals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSignals);
    expect(result.current.data).toHaveLength(2);
  });

  it('handles fetch error', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() => useSignals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('refetches on interval', async () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => useSignals({ refetchInterval: 5000 }), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    vi.useRealTimers();
  });
});
```

---

## 🔗 Integration Tests

### Configuration

```typescript
// tests/integration/setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test database connection
const supabase = createClient(
  process.env.SUPABASE_TEST_URL!,
  process.env.SUPABASE_TEST_KEY!
);

beforeAll(async () => {
  // Run migrations
  console.log('Setting up test database...');
});

beforeEach(async () => {
  // Clean database between tests
  await supabase.from('signals').delete().neq('id', '0');
  await supabase.from('profiles').delete().neq('id', '0');
  await supabase.from('competitions').delete().neq('id', '0');
});

afterAll(async () => {
  console.log('Cleaning up test database...');
});
```

### Example Integration Tests

#### 1. Signal API

```typescript
// tests/integration/signals/crud.test.ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createTestUser, generateAuthToken } from '../../fixtures/users';

const supabase = createClient(
  process.env.SUPABASE_TEST_URL!,
  process.env.SUPABASE_TEST_KEY!
);

describe('Signal CRUD Operations', () => {
  it('creates signal successfully for TS Grow user', async () => {
    const user = await createTestUser({ tier: 'grow' });
    const token = generateAuthToken(user);

    const response = await fetch('http://localhost:3000/api/signals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        asset_symbol: 'BTC/USD',
        direction: 'LONG',
        entry_price: 50000,
        target_price: 52000,
        stop_loss: 48000,
        rationale: 'Strong support at 50k',
      }),
    });

    expect(response.status).toBe(201);
    
    const signal = await response.json();
    expect(signal.asset_symbol).toBe('BTC/USD');
    expect(signal.creator_id).toBe(user.id);
    expect(signal.status).toBe('active');
  });

  it('rejects signal creation for free tier user', async () => {
    const user = await createTestUser({ tier: 'free' });
    const token = generateAuthToken(user);

    const response = await fetch('http://localhost:3000/api/signals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        asset_symbol: 'BTC/USD',
        direction: 'LONG',
        entry_price: 50000,
      }),
    });

    expect(response.status).toBe(403);
    
    const error = await response.json();
    expect(error.message).toContain('TS Grow');
  });

  it('updates signal status to hit', async () => {
    const user = await createTestUser({ tier: 'elite' });
    const signal = await createTestSignal({ creator_id: user.id });
    const token = generateAuthToken(user);

    const response = await fetch(`http://localhost:3000/api/signals/${signal.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'hit',
        outcome_price: 52000,
      }),
    });

    expect(response.status).toBe(200);
    
    const updated = await response.json();
    expect(updated.status).toBe('hit');
    expect(updated.outcome_price).toBe(52000);
  });

  it('enforces weekly limit for TS Grow users', async () => {
    const user = await createTestUser({ tier: 'grow' });
    const token = generateAuthToken(user);

    // Create first signal (should succeed)
    const response1 = await fetch('http://localhost:3000/api/signals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        asset_symbol: 'BTC/USD',
        direction: 'LONG',
        entry_price: 50000,
      }),
    });

    expect(response1.status).toBe(201);

    // Create second signal (should fail)
    const response2 = await fetch('http://localhost:3000/api/signals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        asset_symbol: 'ETH/USD',
        direction: 'SHORT',
        entry_price: 3000,
      }),
    });

    expect(response2.status).toBe(429);
    
    const error = await response2.json();
    expect(error.message).toContain('weekly limit');
  });
});
```

#### 2. Competition Scoring

```typescript
// tests/integration/competitions/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { CompetitionService } from '@/api/competitions/competitions.service';
import { createTestCompetition, createTestParticipant } from '../../fixtures/competitions';

describe('Competition Scoring Engine', () => {
  const service = new CompetitionService();

  it('calculates score correctly for profitable trade', async () => {
    const competition = await createTestCompetition({
      scoring_metrics: {
        profitWeight: 0.4,
        riskAdjustedReturn: 0.3,
        consistency: 0.2,
        drawdown: 0.1,
      },
    });

    const participant = await createTestParticipant({
      competition_id: competition.id,
    });

    // Submit trade
    await service.submitTrade(participant.id, {
      asset: 'BTC/USD',
      direction: 'LONG',
      entry_price: 50000,
      exit_price: 52000,
      size: 1,
    });

    // Calculate score
    const score = await service.calculateScore(participant.id);

    expect(score.totalScore).toBeGreaterThan(0);
    expect(score.profitScore).toBeGreaterThan(0);
    expect(score.riskScore).toBeDefined();
    expect(score.consistencyScore).toBeDefined();
  });

  it('updates leaderboard in real-time', async () => {
    const competition = await createTestCompetition();
    const participant1 = await createTestParticipant({
      competition_id: competition.id,
    });
    const participant2 = await createTestParticipant({
      competition_id: competition.id,
    });

    // Participant 1 makes profitable trade
    await service.submitTrade(participant1.id, {
      asset: 'BTC/USD',
      direction: 'LONG',
      entry_price: 50000,
      exit_price: 52000,
      size: 1,
    });

    await service.updateLeaderboard(competition.id);

    const leaderboard = await service.getLeaderboard(competition.id);

    expect(leaderboard[0].participant_id).toBe(participant1.id);
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[1].participant_id).toBe(participant2.id);
    expect(leaderboard[1].rank).toBe(2);
  });

  it('handles concurrent score updates', async () => {
    const competition = await createTestCompetition();
    const participant = await createTestParticipant({
      competition_id: competition.id,
    });

    // Submit 10 trades concurrently
    const promises = Array(10).fill(null).map((_, i) =>
      service.submitTrade(participant.id, {
        asset: 'BTC/USD',
        direction: 'LONG',
        entry_price: 50000 + i * 100,
        exit_price: 51000 + i * 100,
        size: 1,
      })
    );

    await Promise.all(promises);

    const score = await service.calculateScore(participant.id);
    
    // Verify no data corruption
    expect(score.tradesCount).toBe(10);
    expect(score.totalScore).toBeGreaterThan(0);
  });
});
```

---

## 🎭 E2E Tests (Playwright)

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Critical Path E2E Tests

#### 1. User Onboarding

```typescript
// tests/e2e/critical-paths/user-onboarding.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Onboarding Flow', () => {
  test('complete registration and onboarding', async ({ page }) => {
    await page.goto('/signup');

    // Step 1: Registration
    await page.fill('[name="email"]', 'newuser@test.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="username"]', 'testtrader');
    await page.click('button[type="submit"]');

    // Step 2: Email verification (mock)
    await expect(page).toHaveURL(/\/verify-email/);
    await page.evaluate(() => {
      localStorage.setItem('email_verified', 'true');
    });

    // Step 3: Welcome modal
    await expect(page.locator('text=Welcome to TradoSphere')).toBeVisible();
    await page.click('text=Start Tour');

    // Step 4: Onboarding tour (Sphirie)
    await expect(page.locator('[data-testid="sphirie-dialog"]')).toBeVisible();
    await page.click('text=Next');
    
    // Tour the feed
    await expect(page.locator('text=This is your Feed')).toBeVisible();
    await page.click('text=Next');
    
    // Tour the live page
    await expect(page.locator('text=Welcome to the command center')).toBeVisible();
    await page.click('text=Next');
    
    // Tour portfolio
    await expect(page.locator('text=your personal Portfolio Manager')).toBeVisible();
    await page.click('text=Next');
    
    // Upsell modal
    await expect(page.locator('text=Unlock Your AI Journal')).toBeVisible();
    await page.click('text=Maybe Later');

    // Step 5: Redirected to feed
    await expect(page).toHaveURL('/feed');
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
  });

  test('displays tier restrictions for free users', async ({ page }) => {
    await loginAsUser(page, { tier: 'free' });
    
    await page.goto('/feed');
    await page.click('[data-testid="create-signal-btn"]');

    await expect(page.locator('text=Upgrade to TS Grow')).toBeVisible();
    await expect(page.locator('[data-testid="signal-composer"]')).toBeHidden();
  });
});
```

#### 2. Signal Lifecycle

```typescript
// tests/e2e/critical-paths/signal-lifecycle.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Signal Lifecycle', () => {
  test('TS Elite user posts signal with AI parsing', async ({ page }) => {
    await loginAsUser(page, { tier: 'elite' });
    
    await page.goto('/feed');
    
    // Open signal composer
    await page.click('[data-testid="create-signal-btn"]');
    await expect(page.locator('[data-testid="signal-composer"]')).toBeVisible();

    // Fill signal details
    await page.selectOption('[name="asset_symbol"]', 'BTC/USD');
    await page.selectOption('[name="direction"]', 'LONG');
    await page.fill('[name="rationale"]', 
      'Long BTC at entry $50,000, targeting $52,000 with stop at $48,500. Strong support level.'
    );

    // Submit signal
    await page.click('button[type="submit"]');

    // Wait for AI parsing
    await expect(page.locator('text=Parsing levels...')).toBeVisible();
    
    // Verify signal appears in feed
    await expect(page.locator('text=BTC/USD')).toBeVisible();
    
    // Verify AI-parsed levels render on chart
    await expect(page.locator('[data-testid="entry-line"]'))
      .toHaveAttribute('data-price', '50000');
    await expect(page.locator('[data-testid="target-line"]'))
      .toHaveAttribute('data-price', '52000');
    await expect(page.locator('[data-testid="stop-line"]'))
      .toHaveAttribute('data-price', '48500');

    // Verify signal status
    await expect(page.locator('[data-testid="signal-status"]'))
      .toHaveText('ACTIVE');
  });

  test('signal updates to HIT status in real-time', async ({ page }) => {
    await loginAsUser(page, { tier: 'elite' });
    
    // Create signal
    const signalId = await createTestSignal(page, {
      asset_symbol: 'BTC/USD',
      entry_price: 50000,
      target_price: 50500,
      current_price: 50000,
    });

    await page.goto('/feed');
    
    // Simulate price hitting target (backend job)
    await simulatePriceUpdate('BTC/USD', 50500);

    // Verify signal updates to HIT in real-time
    await expect(page.locator(`[data-signal-id="${signalId}"] [data-testid="hit-miss-badge"]`))
      .toHaveText('HIT', { timeout: 5000 });

    // Verify profit glow applied
    await expect(page.locator(`[data-signal-id="${signalId}"]`))
      .toHaveClass(/profit-glow/);

    // Verify win streak increments
    const winStreak = page.locator('[data-testid="win-streak-badge"]');
    await expect(winStreak).toBeVisible();
  });

  test('followers receive notification when signal hits', async ({ page, context }) => {
    // Creator posts signal
    const creatorPage = await context.newPage();
    await loginAsUser(creatorPage, { tier: 'elite', username: 'creator123' });
    
    const signalId = await createTestSignal(creatorPage, {
      asset_symbol: 'ETH/USD',
      target_price: 3100,
    });

    // Follower views signal
    await loginAsUser(page, { tier: 'grow' });
    await page.goto(`/profile/creator123`);
    await page.click('button:has-text("Follow")');
    
    await page.goto('/feed');

    // Simulate signal hitting target
    await simulatePriceUpdate('ETH/USD', 3100);

    // Verify notification appears
    await expect(page.locator('[data-testid="notification-bell"]'))
      .toHaveClass(/has-notification/, { timeout: 5000 });

    await page.click('[data-testid="notification-bell"]');
    await expect(page.locator('text=creator123\'s signal hit target'))
      .toBeVisible();
  });
});
```

#### 3. Subscription Flow

```typescript
// tests/e2e/critical-paths/subscription-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Subscription Purchase Flow', () => {
  test('user upgrades from Free to TS Grow', async ({ page }) => {
    await loginAsUser(page, { tier: 'free' });
    
    // Navigate to pricing page
    await page.goto('/pricing');
    
    // Select TS Grow tier
    await page.click('[data-tier="grow"] button:has-text("Get Started")');

    // Stripe checkout page
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
    
    // Fill Stripe test card
    await page.frameLocator('iframe').locator('[placeholder="Card number"]')
      .fill('4242424242424242');
    await page.frameLocator('iframe').locator('[placeholder="MM / YY"]')
      .fill('12/34');
    await page.frameLocator('iframe').locator('[placeholder="CVC"]')
      .fill('123');
    await page.frameLocator('iframe').locator('[placeholder="ZIP"]')
      .fill('12345');

    // Submit payment
    await page.click('button:has-text("Subscribe")');

    // Verify redirect to success page
    await expect(page).toHaveURL('/settings/subscription?success=true', {
      timeout: 10000,
    });

    // Verify tier badge updated
    await page.goto('/profile/me');
    await expect(page.locator('[data-testid="tier-badge"]'))
      .toHaveText('TS Grow 🌱');

    // Verify new features unlocked
    await page.goto('/learning');
    await expect(page.locator('text=Ask Sphirie anything')).toBeVisible();
  });

  test('creator sets up Stripe Connect', async ({ page }) => {
    await loginAsUser(page, { tier: 'elite' });
    
    await page.goto('/settings/creator');
    
    // Click setup Stripe Connect
    await page.click('button:has-text("Connect Stripe")');

    // Stripe Connect onboarding (test mode)
    await expect(page).toHaveURL(/connect\.stripe\.com/);
    
    // Fill onboarding form (simplified for test)
    await page.fill('[name="businessName"]', 'Test Trading LLC');
    await page.fill('[name="email"]', 'creator@test.com');
    await page.click('button:has-text("Continue")');

    // Verify redirect back to platform
    await expect(page).toHaveURL('/creator/dashboard?connected=true', {
      timeout: 10000,
    });

    // Verify Stripe account connected
    await expect(page.locator('text=Stripe account connected')).toBeVisible();
  });
});
```

#### 4. Live Streaming

```typescript
// tests/e2e/features/live-streaming.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Live Streaming', () => {
  test('creator starts and ends stream', async ({ page }) => {
    await loginAsUser(page, { tier: 'elite' });
    
    await page.goto('/live');
    
    // Start stream
    await page.click('button:has-text("Go Live")');
    
    // Fill stream details
    await page.fill('[name="title"]', 'BTC Analysis Session');
    await page.selectOption('[name="category"]', 'TS Journal');
    await page.click('button:has-text("Start Stream")');

    // Verify camera/mic permissions prompt (mock)
    await page.evaluate(() => {
      (navigator.mediaDevices.getUserMedia as any) = () =>
        Promise.resolve(new MediaStream());
    });

    // Verify stream started
    await expect(page.locator('[data-testid="stream-status"]'))
      .toHaveText('LIVE', { timeout: 5000 });

    // Verify stream controls visible
    await expect(page.locator('[data-testid="end-stream-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="viewer-count"]')).toBeVisible();

    // End stream
    await page.click('[data-testid="end-stream-btn"]');
    await page.click('button:has-text("Yes, End Stream")');

    // Verify redirect to creator dashboard
    await expect(page).toHaveURL(/\/creator\/dashboard/);
  });

  test('viewer joins stream and interacts', async ({ page, context }) => {
    // Creator starts stream
    const creatorPage = await context.newPage();
    await loginAsUser(creatorPage, { tier: 'elite' });
    const streamId = await startTestStream(creatorPage);

    // Viewer joins
    await loginAsUser(page, { tier: 'free' });
    await page.goto(`/live/${streamId}`);

    // Verify stream player loads
    await expect(page.locator('[data-testid="stream-player"]'))
      .toBeVisible({ timeout: 10000 });

    // Verify viewer can see charts
    await expect(page.locator('[data-testid="trading-chart"]')).toBeVisible();

    // Verify chat is functional
    await page.fill('[data-testid="chat-input"]', 'Great analysis!');
    await page.press('[data-testid="chat-input"]', 'Enter');
    
    await expect(page.locator('text=Great analysis!'))
      .toBeVisible({ timeout: 2000 });

    // Send emoji reaction
    await page.click('[data-testid="emoji-button-fire"]');
    
    // Verify emoji animates on screen
    await expect(page.locator('[data-testid="emoji-overlay"] text=🔥'))
      .toBeVisible({ timeout: 1000 });
  });
});
```

---

## ⚡ Performance Tests

```typescript
// tests/performance/api/feed-endpoint.perf.ts
import { test, expect } from '@playwright/test';
import { performance } from 'perf_hooks';

test.describe('Feed API Performance', () => {
  test('feed endpoint responds within 200ms (p95)', async ({ request }) => {
    const times: number[] = [];

    // Run 100 requests
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      
      const response = await request.get('/api/signals');
      
      const end = performance.now();
      times.push(end - start);

      expect(response.status()).toBe(200);
    }

    // Calculate p95
    times.sort((a, b) => a - b);
    const p95Index = Math.floor(times.length * 0.95);
    const p95 = times[p95Index];

    console.log(`Feed API p95: ${p95.toFixed(2)}ms`);
    expect(p95).toBeLessThan(200);
  });

  test('handles concurrent requests', async ({ request }) => {
    // 50 concurrent requests
    const promises = Array(50).fill(null).map(() =>
      request.get('/api/signals')
    );

    const start = performance.now();
    const responses = await Promise.all(promises);
    const end = performance.now();

    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });

    console.log(`50 concurrent requests completed in ${(end - start).toFixed(2)}ms`);
  });
});
```

---

## 🔒 Security Tests

```typescript
// tests/security/sql-injection.test.ts
import { test, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

test.describe('SQL Injection Prevention', () => {
  test('filters malicious input in signal search', async () => {
    const maliciousInput = "'; DROP TABLE signals; --";
    
    const response = await fetch(
      `http://localhost:3000/api/signals?search=${encodeURIComponent(maliciousInput)}`
    );

    expect(response.status).toBe(200);
    
    // Verify table still exists
    const supabase = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_KEY!
    );
    
    const { count } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true });
    
    expect(count).toBeGreaterThan(0);
  });
});
```

---

## 📊 Test Coverage Reports

### Generate Coverage

```bash
# Unit test coverage
pnpm test:unit --coverage

# Integration test coverage
pnpm test:integration --coverage

# Combined coverage report
pnpm test:coverage
```

### Coverage Targets

```yaml
Statements: 80%
Branches: 75%
Functions: 80%
Lines: 80%

Critical Paths: 100%
  - Authentication
  - Payment processing
  - Competition scoring
  - Signal creation
```

---

## 🚀 Running Tests

```bash
# Run all tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# E2E in UI mode (debug)
pnpm test:e2e:ui

# Performance tests
pnpm test:perf

# Security tests
pnpm test:security

# Watch mode (development)
pnpm test:watch

# CI mode (all tests with coverage)
pnpm test:ci
```

---

## 📝 Test Writing Guidelines

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test** (when possible)
3. **Descriptive test names**: `it('calculates P/L correctly for long position')`
4. **Use test fixtures**: Centralize mock data
5. **Clean up after tests**: Reset database, clear mocks
6. **Test edge cases**: Null values, empty arrays, error states
7. **Mock external services**: Stripe, Gemini, Agora
8. **Use data-testid**: For reliable selectors

---

**Total Test Count Target: 300+ tests**
- Unit: ~200 tests
- Integration: ~50 tests
- E2E: ~50 scenarios