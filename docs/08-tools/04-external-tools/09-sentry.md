# Sentry MCP - Error Monitoring & Performance

**Purpose:** Monitor errors, track performance, and debug issues via natural language

## Overview

Sentry MCP provides comprehensive error monitoring and performance tracking through Claude. Essential for maintaining production quality and catching issues before they impact users.

## Installation

```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server"],
      "env": {
        "SENTRY_AUTH_TOKEN": "your_sentry_auth_token_here",
        "SENTRY_ORG": "tradosphere",
        "SENTRY_PROJECT": "tradosphere-web"
      }
    }
  }
}
```

## Getting Auth Token

1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Click "Create New Token"
3. Scopes needed:
   - `event:read`
   - `org:read`
   - `project:read`
   - `project:write` (for creating alerts)
4. Copy token
5. Add to config

## TradoSphere Use Cases

### Error Monitoring
```
"Show top 5 errors last 24 hours"
"List errors affecting TS Elite users"
"Show signal posting errors this week"
"Find errors with >100 occurrences"
```

### Performance Tracking
```
"What's p95 response time for /api/signals?"
"Show slowest database queries"
"Trace slow /feed page loads"
"List routes with >2s load time"
```

### User Impact Analysis
```
"How many users affected by error #1234?"
"Show errors by tier (Free vs Paid)"
"List high-priority issues (>1000 users impacted)"
"Find errors causing user churn"
```

### Alert Management
```
"Alert if stream latency >5s"
"Notify on Slack if error rate >1%"
"Create alert for competition scoring failures"
"Show all active alerts"
```

## Example Operations

### Investigating Top Errors

**Request:**
```
"Show top 5 errors last 24 hours"
```

**Output:**
```
Top Errors (Last 24 Hours)
==========================

1. TypeError: Cannot read property 'price' of undefined
   Location: components/signals/signal-card.tsx:145
   Occurrences: 347
   Users Affected: 89
   First Seen: 12 hours ago
   Last Seen: 2 minutes ago

   Stack Trace:
   at SignalCard.render (signal-card.tsx:145)
   at TradingChart.display (trading-chart.tsx:67)

   Suggested Fix:
   Add null check before accessing signal.entry_price

2. Error: WebSocket connection failed
   Location: lib/socket/client.ts:23
   Occurrences: 156
   Users Affected: 42
   First Seen: 6 hours ago
   Last Seen: 15 minutes ago

   Context:
   - Happens during live stream join
   - Correlates with high server load
   - Retry logic not working

3. API Error: Rate limit exceeded (429)
   Location: lib/gemini/client.ts:89
   Occurrences: 94
   Users Affected: 28 (all Free tier)
   First Seen: 18 hours ago
   Last Seen: 1 hour ago

   Pattern:
   - Only affects Free tier (5 requests/hour limit)
   - Spikes during market hours
   - User receives no feedback

Actions Recommended:
- Fix #1: Add null check (P0)
- Fix #2: Investigate Socket.io reconnection logic (P1)
- Fix #3: Add user-facing rate limit message (P2)
```

### Performance Analysis

**Request:**
```
"What's p95 response time for /api/signals?"
```

**Output:**
```
/api/signals Performance (Last 7 Days)
======================================

Response Times:
  p50: 145ms
  p75: 280ms
  p90: 450ms
  p95: 680ms ⚠️ (Target: <500ms)
  p99: 1.2s

Throughput:
  Average: 45 requests/minute
  Peak: 180 requests/minute (2pm-4pm UTC)

Slow Queries (>500ms):
  1. Database query: signals with filters (avg: 650ms)
     Query: SELECT * FROM signals WHERE creator_id IN (...)
     Recommendation: Add composite index

  2. Gemini API call: signal parsing (avg: 420ms)
     Impact: 30% of requests
     Recommendation: Add caching for common patterns

  3. Image optimization: chart screenshots (avg: 380ms)
     Impact: 15% of requests
     Recommendation: Use CDN caching

Optimization Opportunities:
  1. Add Redis caching → Expected improvement: 40%
  2. Optimize database query → Expected improvement: 25%
  3. Implement response compression → Expected improvement: 10%

Projected p95 after optimizations: 280ms ✓
```

### Transaction Tracing

**Request:**
```
"Trace slow /feed page loads"
```

**Output:**
```
Slow /feed Loads (>2s)
=====================

Transaction #1: 3.2s
User: user_abc (TS Elite)
Browser: Chrome 120
Timestamp: 2025-01-15 14:23:45

Timeline:
  [0ms]    Request started
  [120ms]  DNS lookup + connection
  [240ms]  SSR: Server component rendering
  [850ms]  ⚠️ Database query: signals feed
           SELECT * FROM signals...
           EXPLAIN: Sequential scan on 15K rows
  [1200ms] API call: /api/user/profile
  [1450ms] Client hydration start
  [2100ms] ⚠️ TradingView chart initialization (x12)
           Loading 12 charts in parallel
  [2800ms] WebSocket connection established
  [3200ms] Page interactive ✓

Bottlenecks:
  1. Database query (850ms)
     Fix: Add covering index on signals table

  2. TradingView charts (700ms)
     Fix: Lazy load charts (intersection observer)

  3. Client bundle size (480ms)
     Current: 850KB
     Fix: Code splitting + dynamic imports

Expected improvement: <1.5s total
```

### Creating Performance Alerts

**Request:**
```
"Alert if /feed page p95 exceeds 2 seconds"
```

**Alert Configuration:**
```yaml
Alert: Feed Page Performance
Type: Performance
Metric: transaction.duration
Threshold: p95 > 2000ms
Window: 5 minutes
Action:
  - Notify: #engineering channel on Slack
  - Priority: P1
  - Auto-create: Sentry issue

Conditions:
  if:
    - transaction: /feed
    - percentile: p95
    - duration: > 2000ms
    - sustained: 5 minutes
  then:
    - send_slack_alert
    - create_sentry_issue
    - tag: performance, p1
```

## TradoSphere Monitoring Strategy

### Critical Errors (P0)
```
- Payment processing failures
- Authentication system down
- Database connection lost
- WebSocket server crash
```

### High Priority (P1)
```
- Signal posting failures
- Live stream connection issues
- Competition scoring errors
- Subscription creation failures
```

### Medium Priority (P2)
```
- Chart rendering issues
- Feed pagination errors
- Profile update failures
- Notification delivery failures
```

### Low Priority (P3)
```
- UI styling issues
- Non-critical API errors
- Analytics tracking failures
```

## Performance Budgets

```yaml
Route Performance Targets:
  /feed:
    p95: <2s
    p99: <3s

  /live/[streamId]:
    p95: <500ms
    p99: <1s

  /api/signals:
    p95: <200ms
    p99: <500ms

  /api/gemini/*:
    p95: <2s (includes external API)
    p99: <4s
```

## Best Practices

1. **Set Up Source Maps** - Better stack traces
2. **Filter Test Errors** - Don't alert on dev/staging
3. **Tag by Tier** - Prioritize paid user issues
4. **Track Releases** - Correlate errors with deployments
5. **Monitor Trends** - Watch for gradual degradation

## Sentry Integration Code

### Frontend Setup

```typescript
// app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV,
  tracesSampleRate: 0.1,

  // Performance monitoring
  profilesSampleRate: 0.1,

  // Custom tags
  beforeSend(event, hint) {
    // Add user tier
    if (event.user) {
      event.user.tier = getUserTier();
    }
    return event;
  },

  ignoreErrors: [
    // Ignore common browser errors
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured'
  ]
});
```

### Backend Setup

```typescript
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,

  // Tag requests
  beforeSend(event) {
    if (event.request) {
      event.tags = {
        ...event.tags,
        endpoint: event.request.url,
        method: event.request.method
      };
    }
    return event;
  }
});
```

### Custom Error Tracking

```typescript
// Track business logic errors
try {
  await createSignal(signalData);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'signal-posting',
      tier: user.tier
    },
    contexts: {
      signal: {
        asset: signalData.asset,
        direction: signalData.direction
      }
    }
  });
  throw error;
}
```

## Troubleshooting

### Events Not Appearing
- Check DSN is correct
- Verify environment is not filtered
- Check rate limiting
- Review beforeSend filters

### Source Maps Not Working
- Verify source maps uploaded
- Check file paths match
- Review release configuration

### Too Many Alerts
- Adjust alert thresholds
- Add filters (environment, user tier)
- Group similar errors
- Implement rate limiting on alerts

## Integration with Development Flow

```
Deploy → Monitor (Sentry) → Errors Detected →
Fix → Deploy → Verify Fix → Update Alerts
```

---

**Priority:** MEDIUM
**When to Install:** Week 2 (Testing & Deployment)
**Velocity Impact:** 2x faster debugging
**Quality Impact:** Catch issues before users report them
**User Impact:** Better uptime, faster fixes
