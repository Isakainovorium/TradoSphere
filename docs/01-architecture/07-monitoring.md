# TradoSphere: Monitoring & Alerting Playbook
*Production Monitoring Strategy & Incident Response*

## 🎯 Monitoring Philosophy

**Goals:**
1. **Detect issues before users do** (proactive monitoring)
2. **Fast MTTR** (Mean Time To Resolution) < 30 minutes
3. **Minimal false positives** (alert fatigue prevention)
4. **Clear actionable alerts** (what's wrong + how to fix)
5. **Historical analysis** (learn from incidents)

---

## 📊 Monitoring Stack

```yaml
Application Monitoring:
  Frontend: Vercel Analytics + Sentry
  Backend: Sentry + Custom Metrics
  
Infrastructure Monitoring:
  Uptime: UptimeRobot (5-minute checks)
  Performance: Lighthouse CI
  
Database Monitoring:
  Supabase Dashboard (built-in)
  Query Performance: pg_stat_statements
  
Real-Time Monitoring:
  WebSocket: Custom metrics
  Agora Streams: Agora Console
  
Log Aggregation:
  Backend: JSON structured logs
  Frontend: Sentry breadcrumbs
  
Alerts:
  Slack: #production-alerts
  SMS: Critical alerts (via Twilio)
  Email: Daily summaries
```

---

## 🚨 Alert Severity Levels

### Critical (P0) - Immediate Response Required

```yaml
Criteria:
  - Production completely down (5xx errors >50%)
  - Payment processing broken
  - Database connection lost
  - Data loss/corruption
  - Security breach detected

Response Time: <15 minutes
Notification: Slack + SMS + Email
Escalation: Immediately

Examples:
  - "🔴 CRITICAL: API returning 500 errors (95% failure rate)"
  - "🔴 CRITICAL: Stripe webhooks failing (payments not processing)"
  - "🔴 CRITICAL: Database connection pool exhausted"
```

### High (P1) - Urgent Attention

```yaml
Criteria:
  - Core feature broken (signals, competitions, streaming)
  - Performance degradation (p95 >2s)
  - Error rate elevated (>5%)
  - Memory/CPU spike (>80% for 5+ minutes)

Response Time: <30 minutes
Notification: Slack + Email
Escalation: If not resolved in 1 hour

Examples:
  - "🟡 HIGH: Signal creation failing (20% error rate)"
  - "🟡 HIGH: Feed page load time >3s (p95)"
  - "🟡 HIGH: Backend CPU at 85% for 10 minutes"
```

### Medium (P2) - Monitor & Plan Fix

```yaml
Criteria:
  - Non-critical feature degraded
  - Elevated warnings (not errors)
  - Performance below optimal (<target but not broken)

Response Time: <4 hours
Notification: Slack only
Escalation: Next business day if persistent

Examples:
  - "🟢 MEDIUM: Image upload slow (2s average)"
  - "🟢 MEDIUM: Redis cache hit rate dropped to 70%"
```

### Low (P3) - Informational

```yaml
Criteria:
  - Informational metrics
  - Successful deployments
  - Capacity planning alerts

Response Time: Review daily
Notification: Slack (can be batched)

Examples:
  - "ℹ️ INFO: Deployed v1.5.2 to production"
  - "ℹ️ INFO: Database size increased 10% this week"
```

---

## 📈 Key Metrics to Monitor

### Application Health

```yaml
Frontend Metrics:
  - Lighthouse Performance Score: Target >90
  - First Contentful Paint (FCP): Target <1.5s
  - Time to Interactive (TTI): Target <3s
  - Cumulative Layout Shift (CLS): Target <0.1
  - JavaScript Error Rate: Target <0.1%
  
Backend Metrics:
  - API Response Time (p50): Target <100ms
  - API Response Time (p95): Target <200ms
  - API Response Time (p99): Target <500ms
  - Error Rate: Target <0.5%
  - Request Rate: Monitor for unusual spikes
  - Database Query Time: Target <50ms average
  
Availability:
  - Uptime: Target >99.9%
  - API Health Check: Target 100% success
  - Database Connection: Target 100% success
```

### Business Metrics

```yaml
User Engagement:
  - Daily Active Users (DAU)
  - Session Duration
  - Signals Posted per Day
  - Live Streams Active
  - Competition Participation Rate
  
Revenue Metrics:
  - New Subscriptions per Day
  - Subscription Churn Rate
  - Average Revenue per User (ARPU)
  - Failed Payment Rate: Alert if >2%
  
System Usage:
  - API Calls per Minute
  - WebSocket Connections (concurrent)
  - Database Connections (active)
  - Storage Usage (GB)
```

---

## 🔍 Monitoring Dashboards

### Grafana Dashboard Structure

```yaml
Dashboard 1: Application Overview
  - Request rate (requests/second)
  - Error rate percentage
  - Response time (p50, p95, p99)
  - Active users (real-time)
  - API endpoint breakdown

Dashboard 2: Database Performance
  - Query execution time
  - Connection pool usage
  - Slow queries (>1s)
  - Table sizes
  - Index usage statistics

Dashboard 3: Business Metrics
  - DAU/MAU
  - Signals posted (24h)
  - Active competitions
  - Revenue (daily)
  - Conversion funnel

Dashboard 4: Infrastructure
  - CPU usage
  - Memory usage
  - Disk I/O
  - Network traffic
  - Container health (if using Docker)
```

---

## 🚨 Alert Configuration

### Sentry Alerts

```javascript
// sentry.config.js
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Alert Rules
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      if (error?.message?.includes('Network request failed')) {
        // Don't alert on network errors (user's internet issue)
        return null;
      }
    }
    return event;
  },
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay (for debugging)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Sentry Alert Rules (via Dashboard)

```yaml
Rule 1: High Error Rate
  Condition: Error count >10 in 1 minute
  Severity: P1
  Notify: Slack #production-alerts
  
Rule 2: New Error Type
  Condition: First seen error
  Severity: P2
  Notify: Slack #production-alerts
  
Rule 3: Performance Degradation
  Condition: Transaction duration >2s for 5+ minutes
  Severity: P1
  Notify: Slack #production-alerts
```

### Custom Backend Alerts

```typescript
// lib/monitoring/alerts.ts
import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function sendAlert(alert: {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  metric?: string;
  threshold?: string;
  currentValue?: string;
}) {
  const emoji = {
    critical: '🔴',
    high: '🟡',
    medium: '🟢',
    low: 'ℹ️',
  }[alert.severity];

  await slack.chat.postMessage({
    channel: '#production-alerts',
    text: `${emoji} ${alert.severity.toUpperCase()}: ${alert.title}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} ${alert.title}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Severity:*\n${alert.severity.toUpperCase()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date().toISOString()}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: alert.message,
        },
      },
      ...(alert.metric
        ? [
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Metric:*\n${alert.metric}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Threshold:*\n${alert.threshold}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Current Value:*\n${alert.currentValue}`,
                },
              ],
            },
          ]
        : []),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Logs',
            },
            url: 'https://sentry.io/tradosphere',
            style: 'primary',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Metrics',
            },
            url: 'https://vercel.com/analytics',
          },
        ],
      },
    ],
  });

  // For critical alerts, also send SMS
  if (alert.severity === 'critical') {
    await sendSMSAlert(alert);
  }
}

// Example usage in API monitoring
export async function monitorAPIHealth() {
  const errorRate = await calculateErrorRate();
  
  if (errorRate > 5) {
    await sendAlert({
      severity: 'high',
      title: 'Elevated API Error Rate',
      message: 'API error rate has exceeded threshold',
      metric: 'Error Rate',
      threshold: '5%',
      currentValue: `${errorRate.toFixed(2)}%`,
    });
  }
}
```

---

## 🔧 Monitoring Implementation

### Health Check Endpoints

```typescript
// apps/api/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database'),
      
      // Custom checks
      () => this.checkRedis(),
      () => this.checkStripe(),
      () => this.checkGemini(),
    ]);
  }

  async checkRedis() {
    try {
      await redis.ping();
      return { redis: { status: 'up' } };
    } catch (error) {
      return { redis: { status: 'down', error: error.message } };
    }
  }

  async checkStripe() {
    try {
      await stripe.balance.retrieve();
      return { stripe: { status: 'up' } };
    } catch (error) {
      return { stripe: { status: 'down', error: error.message } };
    }
  }

  async checkGemini() {
    try {
      // Simple test request
      await gemini.generateContent('health check');
      return { gemini: { status: 'up' } };
    } catch (error) {
      return { gemini: { status: 'down', error: error.message } };
    }
  }
}
```

### UptimeRobot Configuration

```yaml
Monitor 1: Frontend Health
  URL: https://tradosphere.com
  Type: HTTP(S)
  Interval: 5 minutes
  Alert: Email + Slack webhook
  
Monitor 2: API Health
  URL: https://api.tradosphere.com/health
  Type: HTTP(S) - Keyword
  Keyword: "\"status\":\"ok\""
  Interval: 1 minute
  Alert: Email + Slack webhook
  
Monitor 3: Database Connectivity
  URL: https://api.tradosphere.com/health
  Type: HTTP(S) - Keyword
  Keyword: "\"database\":{\"status\":\"up\"}"
  Interval: 2 minutes
  Alert: Email + Slack webhook
```

---

## 🔎 Log Analysis

### Structured Logging Format

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'tradosphere-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Usage
logger.info('Signal created', {
  userId: '123',
  signalId: '456',
  asset: 'BTC/USD',
  direction: 'LONG',
});

logger.error('Gemini API failed', {
  error: error.message,
  stack: error.stack,
  userId: '123',
  requestId: 'abc-123',
});
```

### Log Queries (Common Patterns)

```bash
# Find errors in last hour
grep "\"level\":\"error\"" logs/combined.log | grep "$(date -u +%Y-%m-%dT%H)" | jq

# Count errors by type
grep "\"level\":\"error\"" logs/combined.log | jq -r '.message' | sort | uniq -c | sort -rn

# Find slow API requests (>1s)
grep "\"responseTime\"" logs/combined.log | jq 'select(.responseTime > 1000)'

# Find failed Stripe webhooks
grep "stripe.webhook.failed" logs/combined.log | jq
```

---

## 📱 Incident Response Playbook

### Incident Response Steps

```yaml
Step 1: Acknowledge (< 5 minutes)
  - Respond to alert in Slack with 👀 emoji
  - Create incident channel: #incident-2025-01-20
  - Begin investigation

Step 2: Assess Severity (< 10 minutes)
  - Check Sentry for error details
  - Check Vercel Analytics for affected users
  - Determine if P0, P1, or P2
  - Update #incident channel with assessment

Step 3: Communicate (< 15 minutes)
  - Post status update in #general if user-facing
  - Create status page entry (status.tradosphere.com)
  - Notify affected users if P0

Step 4: Mitigate (< 30 minutes)
  - Implement quick fix or workaround
  - Rollback if recent deployment
  - Scale resources if capacity issue
  - Document actions taken

Step 5: Resolve (< 2 hours for P0)
  - Deploy permanent fix
  - Verify resolution
  - Update status page
  - Close incident channel

Step 6: Post-Mortem (< 24 hours)
  - Write incident report
  - Document root cause
  - List action items
  - Schedule follow-up
```

### Common Incidents & Solutions

#### Incident 1: High Error Rate

```yaml
Symptoms:
  - Sentry alert: Error rate >5%
  - API health check failures
  
Investigation:
  1. Check Sentry for recent errors
  2. Check deployment timeline (recent deploy?)
  3. Check external service status (Stripe, Gemini, Agora)
  4. Check database connections
  
Quick Fix:
  - If recent deployment: Rollback
  - If database: Restart connection pool
  - If external service: Implement fallback/retry
  
Permanent Fix:
  - Fix underlying bug
  - Add better error handling
  - Increase rate limits if needed
```

#### Incident 2: Slow Performance

```yaml
Symptoms:
  - Vercel Analytics: p95 >2s
  - User reports of slow load times
  
Investigation:
  1. Check Lighthouse scores
  2. Check database query performance
  3. Check Redis cache hit rate
  4. Check API response times by endpoint
  
Quick Fix:
  - Increase cache TTL
  - Add database indexes
  - Enable CDN for static assets
  - Implement query result caching
  
Permanent Fix:
  - Optimize slow queries
  - Add database read replicas
  - Implement lazy loading
  - Code splitting for large bundles
```

#### Incident 3: Payment Processing Failure

```yaml
Symptoms:
  - Stripe webhook failures
  - Users report failed payments
  
Investigation:
  1. Check Stripe Dashboard for errors
  2. Check webhook endpoint logs
  3. Verify webhook signature validation
  4. Check database for subscription records
  
Quick Fix:
  - Retry failed webhooks manually
  - Update affected subscriptions in database
  
Permanent Fix:
  - Fix webhook handler bugs
  - Add idempotency checks
  - Implement webhook retry queue
  - Add monitoring for webhook health
```

---

## 📊 Weekly/Monthly Reviews

### Weekly Health Check (Every Monday)

```yaml
Review Metrics:
  - [ ] Uptime last 7 days (target >99.9%)
  - [ ] Error rate trend
  - [ ] Performance metrics (Lighthouse scores)
  - [ ] Database query performance
  - [ ] API response times
  
Review Alerts:
  - [ ] Total alerts triggered
  - [ ] False positive rate
  - [ ] Alert response times
  - [ ] Unresolved alerts
  
Action Items:
  - Document any recurring issues
  - Update alert thresholds if needed
  - Schedule infrastructure improvements
```

### Monthly Capacity Planning

```yaml
Review Growth:
  - [ ] User growth rate
  - [ ] Database size growth
  - [ ] API request volume growth
  - [ ] Storage usage growth
  
Forecast Needs:
  - [ ] When will we hit database limits?
  - [ ] When do we need more API capacity?
  - [ ] When do we need CDN scaling?
  
Plan Upgrades:
  - Schedule infrastructure scaling
  - Budget for increased costs
  - Test scaling procedures
```

---

## 🎯 Key Performance Indicators (KPIs)

### Platform Health KPIs

```yaml
Availability: 99.95% (Q1 2025 Target)
MTTR: <30 minutes
MTTD: <5 minutes (Mean Time To Detect)
Error Rate: <0.5%
p95 Response Time: <200ms
```

### Monitoring Effectiveness

```yaml
Alert Noise: <10% false positives
Alert Response Rate: >95% acknowledged <5 min
Incident Resolution: >90% resolved <2 hours (P0/P1)
Uptime Monitoring Coverage: 100% critical paths
```

---

**This monitoring strategy ensures production reliability while maintaining solo developer sanity. Start simple, add complexity as needed.**