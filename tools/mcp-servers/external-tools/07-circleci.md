# CircleCI MCP - Pipeline Orchestration

**Purpose:** Monitor builds, trigger deployments, and manage CI/CD via natural language

## Overview

CircleCI MCP enables comprehensive CI/CD pipeline management through Claude. Essential for automating deployment workflows and monitoring build status.

## Installation

```json
{
  "mcpServers": {
    "circleci": {
      "command": "npx",
      "args": ["-y", "circleci-mcp-server"],
      "env": {
        "CIRCLECI_API_TOKEN": "your_circleci_token_here"
      }
    }
  }
}
```

## Getting API Token

1. Go to https://app.circleci.com/settings/user/tokens
2. Click "Create New Token"
3. Name it "MCP Integration"
4. Copy the token
5. Add to config (keep secure!)

## TradoSphere Pipeline Architecture

```yaml
workflows:
  main:
    jobs:
      - test-frontend:
          filters: { branches: { only: [develop, main] } }

      - test-backend:
          filters: { branches: { only: [develop, main] } }

      - e2e-tests:
          requires: [test-frontend, test-backend]

      - deploy-staging:
          requires: [e2e-tests]
          filters: { branches: { only: develop } }

      - hold-production:
          type: approval
          requires: [e2e-tests]
          filters: { branches: { only: main } }

      - deploy-production:
          requires: [hold-production]
          filters: { branches: { only: main } }
```

## Use Cases

### Monitoring Builds
```
"Show status of latest pipeline on develop"
"List failed tests from last build"
"Get build time for PR #78"
"Show all failing workflows"
```

### Triggering Deployments
```
"Deploy feature/signals-v2 to staging"
"Trigger production deployment for main"
"Re-run failed E2E tests"
"Rebuild last commit on develop"
```

### Managing Rollbacks
```
"Rollback production to commit abc123"
"Show last 5 successful production deployments"
"Deploy previous version to staging"
```

### Pipeline Analytics
```
"Show average build time last week"
"List flaky tests (failures >20%)"
"Get deployment frequency by branch"
"Show most common failure reasons"
```

## Example Operations

### Deploying a Feature

**Request:**
```
"Deploy feature/live-streaming to staging"
```

**Process:**
```
1. Check current branch status
   Branch: feature/live-streaming
   Last commit: abc123
   Status: All tests passing

2. Trigger staging deployment
   Pipeline started: #1234
   Estimated time: 5 minutes

3. Monitor deployment
   ✓ Build completed (2m 15s)
   ✓ Tests passed (1m 45s)
   ✓ Deploy to staging (1m 30s)

4. Result
   ✓ Deployed successfully
   URL: https://staging.tradosphere.com
   Commit: abc123
```

### Investigating Test Failures

**Request:**
```
"Show failed tests from last pipeline on develop"
```

**Output:**
```
Pipeline #1233 on develop
Status: FAILED
Duration: 4m 32s

Failed Tests:
===============

1. e2e-tests/signal-posting.spec.ts
   Error: Timeout waiting for AI parsing response
   Duration: 30.2s (timeout: 30s)
   Last passed: 2 builds ago

2. backend/tests/competition-scoring.test.ts
   Error: AssertionError: expected 0.95 to be close to 1.0
   Stack: lib/scoring/sharpe-ratio.ts:45
   Last passed: Never (new test)

Recommendations:
- Increase timeout for signal-posting test
- Review Sharpe ratio calculation logic
```

### Production Deployment Workflow

**Request:**
```
"I want to deploy to production"
```

**Interactive Flow:**
```
Claude: Let me check the current state...

✓ Branch: main
✓ Last commit: def456
✓ All tests passing
✓ Staging deployment successful (2 hours ago)

Pre-deployment checklist:
☐ Reviewed merged PRs since last deployment
☐ Ran E2E tests locally
☐ Checked Sentry for staging errors
☐ Notified team in #deployments

Ready to deploy?

User: Yes

Claude: Starting production deployment...

Pipeline #1235 triggered
✓ Build completed (2m 10s)
✓ Tests passed (1m 50s)
⏸️  Waiting for manual approval

[Approval button appears]

User: [Approves]

Claude: Deploying to production...
✓ Deploy completed (2m 00s)
✓ Health checks passed
✓ Deployment successful

Production URL: https://tradosphere.com
Commit: def456
Duration: 6m 00s
```

## TradoSphere CI/CD Commands

### Development Workflow
```
"Show my active PRs with build status"
"Run tests for current branch"
"Check if branch is deployable"
```

### Deployment Commands
```
"Deploy to staging"
"Deploy to production" (requires approval)
"Rollback last deployment"
"Deploy specific commit to staging"
```

### Monitoring Commands
```
"Show recent failed builds"
"List slow tests (>30s)"
"Get deployment history"
"Show pipeline metrics for last week"
```

### Debugging Commands
```
"Show logs for failed job"
"Re-run failed tests only"
"Compare build times with last successful"
"Show environment variables for job"
```

## Pipeline Configuration

### Test Jobs

```yaml
test-frontend:
  docker:
    - image: cimg/node:20.10
  steps:
    - checkout
    - restore_cache:
        keys:
          - v1-deps-{{ checksum "package-lock.json" }}
    - run: npm install
    - run: npm run lint
    - run: npm run type-check
    - run: npm test
    - save_cache:
        key: v1-deps-{{ checksum "package-lock.json" }}
        paths:
          - node_modules
```

### E2E Test Job

```yaml
e2e-tests:
  docker:
    - image: mcr.microsoft.com/playwright:v1.40.0-focal
  steps:
    - checkout
    - run: npm install
    - run: npm run build
    - run:
        name: Start App
        command: npm start
        background: true
    - run: npx wait-on http://localhost:3000
    - run: npx playwright test
    - store_test_results:
        path: test-results
    - store_artifacts:
        path: playwright-report
```

### Deployment Job

```yaml
deploy-staging:
  docker:
    - image: cimg/node:20.10
  steps:
    - checkout
    - run:
        name: Deploy to Vercel
        command: |
          npm install -g vercel
          vercel --token $VERCEL_TOKEN \
                 --prod \
                 --env NEXT_PUBLIC_ENV=staging
    - run:
        name: Deploy Backend to Railway
        command: |
          railway up --environment staging
```

## Best Practices

1. **Run Tests Locally First** - Don't rely solely on CI
2. **Monitor Build Times** - Optimize slow jobs
3. **Cache Dependencies** - Faster builds
4. **Fail Fast** - Run quick tests first
5. **Deploy Frequently** - Small, incremental changes

## Performance Optimization

### Caching Strategy
```yaml
- restore_cache:
    keys:
      - v1-deps-{{ checksum "package-lock.json" }}
      - v1-deps-  # Fallback

- save_cache:
    key: v1-deps-{{ checksum "package-lock.json" }}
    paths:
      - node_modules
      - ~/.npm
      - .next/cache
```

### Parallelization
```yaml
parallelism: 4

steps:
  - run: |
      TESTFILES=$(circleci tests glob "tests/**/*.spec.ts" | \
        circleci tests split --split-by=timings)
      npx playwright test $TESTFILES
```

### Resource Classes
```yaml
resource_class: large  # 4 vCPUs, 8GB RAM
# Options: small, medium, large, xlarge
```

## Troubleshooting

### Build Timeout
- Increase timeout in config
- Optimize slow tests
- Use larger resource class

### Flaky Tests
- Run tests multiple times locally
- Add proper wait conditions
- Check for race conditions

### Deployment Failed
- Check environment variables
- Verify deployment token
- Review error logs

### Cache Issues
- Clear cache and rebuild
- Update cache key
- Verify cache paths

## Integration with Development Flow

```
Push to Branch → CI Runs Tests →
Tests Pass → Deploy to Staging (develop) →
Manual Review → Approve → Deploy to Production (main)
```

## Monitoring and Alerts

### Set Up Alerts
```
"Alert me on Slack if:
- Any build fails on main
- E2E tests fail 3 times in a row
- Build time exceeds 10 minutes
- Deployment to production fails"
```

### Daily Summary
```
"Send daily summary of:
- All deployments
- Failed builds
- Flaky tests
- Average build time"
```

---

**Priority:** MEDIUM
**When to Install:** Week 2 (Testing & Deployment)
**Velocity Impact:** 2x faster deployments, better monitoring
**Quality Impact:** Catch issues before production
**Automation:** 80% of deployment tasks automated
