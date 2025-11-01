# Playwright MCP - E2E Test Automation

**Purpose:** Generate and run end-to-end tests via natural language

## Overview

Playwright MCP enables automatic E2E test generation and execution through Claude. Essential for maintaining high test coverage without manual test writing.

## Installation

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

**Note:** No API keys required. Works with local Playwright installation.

## Prerequisites

Install Playwright in your project:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

## TradoSphere Use Cases

### Feature Testing
```
"Generate Playwright test for signal posting flow:
- TS Elite user logs in
- Creates signal with AI parsing
- Levels render as chart annotations
- Signal appears in feed with 'active' status"
```

### User Journey Testing
```
"Create E2E test for competition participation:
- User discovers competition
- Joins with entry fee payment
- Submits trades
- Views real-time leaderboard
- Receives prize payout"
```

### Critical Path Testing
```
"Test subscription upgrade flow:
- Free user browses features
- Clicks upgrade to TS Grow
- Completes Stripe checkout
- Gains access to signal posting
- Posts first signal successfully"
```

## Example Generated Tests

### Signal Posting with AI Parsing

**Request:**
```
"Create Playwright test for TS Elite user posting signal with AI parsing"
```

**Generated Test:**
```typescript
import { test, expect } from '@playwright/test';

test('TS Elite user posts signal with AI parsing', async ({ page }) => {
  // Login as Elite user
  await page.goto('/login');
  await page.fill('[name="email"]', 'elite@test.com');
  await page.fill('[name="password"]', 'testpass');
  await page.click('button[type="submit"]');

  // Navigate to feed
  await page.goto('/feed');
  await expect(page).toHaveURL('/feed');

  // Open signal composer
  await page.click('[data-testid="create-signal"]');

  // Enter signal rationale
  await page.fill('[name="rationale"]',
    'Long BTC at $50k, target $52k, stop $48k'
  );

  // Submit signal
  await page.click('button[type="submit"]');

  // Wait for AI parsing
  await page.waitForSelector('[data-testid="signal-card"]', {
    timeout: 5000
  });

  // Verify levels rendered
  await expect(page.locator('[data-testid="entry-line"]'))
    .toHaveAttribute('data-price', '50000');
  await expect(page.locator('[data-testid="target-line"]'))
    .toHaveAttribute('data-price', '52000');
  await expect(page.locator('[data-testid="stop-line"]'))
    .toHaveAttribute('data-price', '48000');

  // Verify signal in feed
  const signal = page.locator('[data-testid="signal-card"]').first();
  await expect(signal).toContainText('BTC');
  await expect(signal).toContainText('LONG');
  await expect(signal.locator('[data-status="active"]')).toBeVisible();
});
```

### Live Streaming Flow

**Request:**
```
"Test live streaming feature: start stream, viewer joins, chat message"
```

**Generated Test:**
```typescript
test('Live streaming with viewer and chat', async ({ browser }) => {
  // Create two contexts: streamer and viewer
  const streamerContext = await browser.newContext();
  const viewerContext = await browser.newContext();

  const streamerPage = await streamerContext.newPage();
  const viewerPage = await viewerContext.newPage();

  // Streamer starts stream
  await streamerPage.goto('/live/start');
  await streamerPage.fill('[name="title"]', 'BTC Analysis');
  await streamerPage.click('[data-testid="start-stream"]');

  // Get stream URL
  const streamUrl = await streamerPage.url();

  // Viewer joins stream
  await viewerPage.goto(streamUrl);
  await expect(viewerPage.locator('[data-testid="stream-player"]'))
    .toBeVisible();

  // Viewer sends chat message
  await viewerPage.fill('[data-testid="chat-input"]', 'Great analysis!');
  await viewerPage.press('[data-testid="chat-input"]', 'Enter');

  // Verify message appears for both
  await expect(streamerPage.locator('[data-testid="chat-message"]').last())
    .toContainText('Great analysis!');
  await expect(viewerPage.locator('[data-testid="chat-message"]').last())
    .toContainText('Great analysis!');

  // Cleanup
  await streamerContext.close();
  await viewerContext.close();
});
```

### Competition Leaderboard

**Request:**
```
"Test real-time leaderboard updates during competition"
```

**Generated Test:**
```typescript
test('Competition leaderboard updates in real-time', async ({ page }) => {
  // Join competition
  await page.goto('/competitions/test-comp-123');
  await page.click('[data-testid="join-competition"]');

  // Go to leaderboard
  await page.click('[data-testid="view-leaderboard"]');

  // Record initial rank
  const initialRank = await page
    .locator('[data-testid="user-rank"]')
    .textContent();

  // Submit a winning trade (via API)
  await page.evaluate(async () => {
    await fetch('/api/competitions/test-comp-123/submit-trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: 'BTC',
        entry: 50000,
        exit: 52000,
        pnl: 2000
      })
    });
  });

  // Wait for leaderboard update (should be <1s)
  await page.waitForFunction((oldRank) => {
    const newRank = document
      .querySelector('[data-testid="user-rank"]')
      ?.textContent;
    return newRank !== oldRank;
  }, initialRank, { timeout: 2000 });

  // Verify rank improved
  const newRank = await page
    .locator('[data-testid="user-rank"]')
    .textContent();
  expect(parseInt(newRank!)).toBeLessThan(parseInt(initialRank!));
});
```

## Critical User Flows for TradoSphere

### Authentication Flow
```
- User registration with email verification
- Login with 2FA (Grow+ users)
- OAuth login (Google, Twitter)
- Password reset flow
```

### Subscription Flow
```
- Free → Grow upgrade
- Grow → Elite upgrade
- Subscription cancellation
- Payment failure handling
```

### Signal Flow
```
- Signal creation with AI parsing
- Signal update (status change)
- Signal engagement (reactions)
- Signal deletion
```

### Competition Flow
```
- Competition discovery
- Join with entry fee
- Trade submission
- Leaderboard viewing
- Prize distribution
```

### Live Streaming Flow
```
- Stream creation
- Viewer join
- Chat interaction
- Position updates
- Stream end
```

## Best Practices

1. **Test Data Isolation** - Use separate test database
2. **Cleanup After Tests** - Delete test data to avoid pollution
3. **Use Realistic Data** - Mirror production scenarios
4. **Test Critical Paths First** - Authentication, payments, core features
5. **Run Before Deploy** - Catch regressions early

## Running Tests

### Via Playwright MCP
```
"Run all E2E tests"
"Run signal posting tests only"
"Debug failed test: competition-join"
"Generate test coverage report"
```

### Via Command Line
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/signal-posting.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

## Test Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

## CI/CD Integration

Add to CircleCI:
```yaml
- run:
    name: Run E2E Tests
    command: |
      npm run build
      npm run start &
      npx wait-on http://localhost:3000
      npx playwright test
      npx playwright show-report
```

## Performance

- **Test Generation:** ~30 seconds
- **Test Execution:** 30-60s per test
- **Parallel Execution:** Supported (faster)
- **Coverage:** Aim for 80%+ of critical paths

## Troubleshooting

### Tests Timing Out
- Increase timeout in config
- Check for slow API calls
- Verify database seeding

### Flaky Tests
- Add proper wait conditions
- Use waitForSelector instead of timeout
- Check for race conditions

### Tests Pass Locally But Fail in CI
- Check environment variables
- Verify database state
- Ensure proper cleanup

## Integration with Development Flow

```
Implement Feature → Generate Test (Playwright) →
Run Tests → Fix Issues → Commit → CI Runs Tests → Deploy
```

---

**Priority:** MEDIUM
**When to Install:** Week 2 (Testing & Deployment)
**Velocity Impact:** 3x faster test creation, better coverage
**Quality Impact:** Catch 90% of regressions before production
