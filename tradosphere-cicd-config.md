# TradoSphere: CI/CD Configuration Guide
*Complete Pipeline Setup for Continuous Integration & Deployment*

## 🎯 CI/CD Philosophy

**Goals:**
1. **Fast Feedback**: Developers know within 10 minutes if changes break anything
2. **High Confidence**: 95%+ test passing rate before deployment
3. **Zero Downtime**: Blue-green deployments with automatic rollback
4. **Security First**: Automated security scanning in every build

**Pipeline Architecture:**
```
Code Push → Lint & Type Check → Unit Tests → Integration Tests → E2E Tests
    ↓
Build → Security Scan → Deploy to Staging → Smoke Tests → Manual Approval
    ↓
Deploy to Production → Health Checks → Rollback if needed
```

---

## 📁 CI/CD File Structure

```
.circleci/
├── config.yml                  # Main CircleCI config
└── scripts/
    ├── setup-test-db.sh       # Test database setup
    ├── run-migrations.sh      # Database migrations
    └── deploy.sh              # Deployment script

.github/
├── workflows/
│   ├── ci.yml                 # GitHub Actions (backup)
│   ├── dependabot.yml         # Dependency updates
│   └── security-scan.yml      # Security scanning
└── PULL_REQUEST_TEMPLATE.md   # PR template

docker/
├── Dockerfile.frontend        # Next.js production image
├── Dockerfile.backend         # NestJS production image
├── docker-compose.yml         # Local development
└── docker-compose.test.yml    # Testing environment

scripts/
├── deploy/
│   ├── deploy-frontend.sh
│   ├── deploy-backend.sh
│   └── rollback.sh
├── db/
│   ├── migrate.sh
│   └── seed.sh
└── test/
    ├── setup-e2e.sh
    └── cleanup.sh
```

---

## 🔄 CircleCI Configuration

### .circleci/config.yml

```yaml
version: 2.1

# Orbs (reusable packages)
orbs:
  node: circleci/node@5.1.0
  docker: circleci/docker@2.2.0
  slack: circleci/slack@4.12.0

# Executors (execution environments)
executors:
  node-executor:
    docker:
      - image: cimg/node:20.11
    resource_class: large
    working_directory: ~/tradosphere

  node-with-postgres:
    docker:
      - image: cimg/node:20.11
        environment:
          NODE_ENV: test
      - image: cimg/postgres:15.5
        environment:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: tradosphere_test
      - image: redis:7-alpine
    resource_class: large

  playwright-executor:
    docker:
      - image: mcr.microsoft.com/playwright:v1.40.0-focal
    resource_class: xlarge

# Commands (reusable command sequences)
commands:
  install-dependencies:
    description: "Install npm dependencies with caching"
    steps:
      - restore_cache:
          keys:
            - v2-deps-{{ checksum "pnpm-lock.yaml" }}
            - v2-deps-
      - run:
          name: Install pnpm
          command: npm install -g pnpm@8
      - run:
          name: Install dependencies
          command: pnpm install --frozen-lockfile
      - save_cache:
          key: v2-deps-{{ checksum "pnpm-lock.yaml" }}
          paths:
            - ~/.pnpm-store
            - node_modules

  notify-slack-failure:
    steps:
      - slack/notify:
          event: fail
          template: basic_fail_1

# Jobs
jobs:
  # 1. Code Quality Checks
  lint-and-typecheck:
    executor: node-executor
    steps:
      - checkout
      - install-dependencies
      - run:
          name: ESLint
          command: pnpm lint
      - run:
          name: TypeScript Type Check
          command: pnpm type-check
      - run:
          name: Prettier Check
          command: pnpm format:check
      - notify-slack-failure

  # 2. Unit Tests
  test-unit:
    executor: node-executor
    steps:
      - checkout
      - install-dependencies
      - run:
          name: Run Unit Tests
          command: pnpm test:unit --coverage
      - run:
          name: Upload Coverage to Codecov
          command: |
            bash <(curl -s https://codecov.io/bash) \
              -f coverage/coverage-final.json \
              -F unit
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: coverage
      - notify-slack-failure

  # 3. Integration Tests
  test-integration:
    executor: node-with-postgres
    steps:
      - checkout
      - install-dependencies
      - run:
          name: Wait for PostgreSQL
          command: |
            dockerize -wait tcp://localhost:5432 -timeout 1m
      - run:
          name: Wait for Redis
          command: |
            dockerize -wait tcp://localhost:6379 -timeout 1m
      - run:
          name: Setup Test Database
          command: |
            export DATABASE_URL=postgresql://test:test@localhost:5432/tradosphere_test
            pnpm db:migrate
            pnpm db:seed:test
      - run:
          name: Run Integration Tests
          command: pnpm test:integration --coverage
      - run:
          name: Upload Coverage
          command: |
            bash <(curl -s https://codecov.io/bash) \
              -f coverage/coverage-final.json \
              -F integration
      - store_test_results:
          path: test-results
      - notify-slack-failure

  # 4. E2E Tests
  test-e2e:
    executor: playwright-executor
    parallelism: 4
    steps:
      - checkout
      - install-dependencies
      - run:
          name: Install Playwright Browsers
          command: pnpm exec playwright install chromium firefox
      - run:
          name: Start Services
          command: |
            pnpm dev > /dev/null 2>&1 &
            pnpm wait-on http://localhost:3000
          background: true
      - run:
          name: Run E2E Tests (Sharded)
          command: |
            pnpm test:e2e --shard=$((CIRCLE_NODE_INDEX + 1))/$CIRCLE_NODE_TOTAL
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: playwright-report
          destination: playwright-report
      - store_artifacts:
          path: test-results
          destination: test-results
      - notify-slack-failure

  # 5. Security Scanning
  security-scan:
    executor: node-executor
    steps:
      - checkout
      - install-dependencies
      - run:
          name: npm audit
          command: pnpm audit --audit-level=moderate
      - run:
          name: Snyk Security Scan
          command: |
            npm install -g snyk
            snyk auth $SNYK_TOKEN
            snyk test --severity-threshold=high
      - run:
          name: OWASP Dependency Check
          command: |
            wget https://github.com/jeremylong/DependencyCheck/releases/download/v8.0.2/dependency-check-8.0.2-release.zip
            unzip dependency-check-8.0.2-release.zip
            ./dependency-check/bin/dependency-check.sh \
              --project "TradoSphere" \
              --scan . \
              --format HTML \
              --out ./dependency-check-report
      - store_artifacts:
          path: dependency-check-report
      - notify-slack-failure

  # 6. Build Frontend
  build-frontend:
    executor: node-executor
    steps:
      - checkout
      - install-dependencies
      - run:
          name: Build Next.js App
          command: |
            cd apps/web
            pnpm build
      - run:
          name: Check Build Size
          command: |
            cd apps/web
            npx @next/bundle-analyzer
      - persist_to_workspace:
          root: .
          paths:
            - apps/web/.next
            - apps/web/public
      - notify-slack-failure

  # 7. Build Backend
  build-backend:
    executor: node-executor
    steps:
      - checkout
      - install-dependencies
      - run:
          name: Build NestJS App
          command: |
            cd apps/api
            pnpm build
      - persist_to_workspace:
          root: .
          paths:
            - apps/api/dist
      - notify-slack-failure

  # 8. Build Docker Images
  build-docker-images:
    executor: docker/docker
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true
      - docker/build:
          image: tradosphere/frontend
          tag: $CIRCLE_SHA1,latest
          dockerfile: docker/Dockerfile.frontend
      - docker/build:
          image: tradosphere/backend
          tag: $CIRCLE_SHA1,latest
          dockerfile: docker/Dockerfile.backend
      - docker/push:
          image: tradosphere/frontend
          tag: $CIRCLE_SHA1,latest
      - docker/push:
          image: tradosphere/backend
          tag: $CIRCLE_SHA1,latest

  # 9. Deploy to Staging
  deploy-staging:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Deploy Frontend to Vercel (Staging)
          command: |
            npm install -g vercel
            cd apps/web
            vercel deploy \
              --token=$VERCEL_TOKEN \
              --env=staging \
              --build-env NEXT_PUBLIC_API_URL=$STAGING_API_URL
      - run:
          name: Deploy Backend to Railway (Staging)
          command: |
            npm install -g @railway/cli
            cd apps/api
            railway up --environment staging
      - run:
          name: Run Database Migrations (Staging)
          command: |
            export DATABASE_URL=$STAGING_DATABASE_URL
            pnpm db:migrate
      - notify-slack-failure

  # 10. Smoke Tests (Staging)
  smoke-tests:
    executor: playwright-executor
    steps:
      - checkout
      - install-dependencies
      - run:
          name: Run Smoke Tests
          command: |
            export BASE_URL=$STAGING_URL
            pnpm test:e2e:smoke
      - notify-slack-failure

  # 11. Deploy to Production
  deploy-production:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Deploy Frontend to Vercel (Production)
          command: |
            npm install -g vercel
            cd apps/web
            vercel deploy --prod \
              --token=$VERCEL_TOKEN \
              --build-env NEXT_PUBLIC_API_URL=$PROD_API_URL
      - run:
          name: Deploy Backend to Railway (Production)
          command: |
            npm install -g @railway/cli
            cd apps/api
            railway up --environment production
      - run:
          name: Run Database Migrations (Production)
          command: |
            export DATABASE_URL=$PROD_DATABASE_URL
            pnpm db:migrate
      - slack/notify:
          event: pass
          template: success_tagged_deploy_1
      - notify-slack-failure

  # 12. Health Checks
  health-check:
    executor: node-executor
    steps:
      - run:
          name: Frontend Health Check
          command: |
            response=$(curl -s -o /dev/null -w "%{http_code}" https://tradosphere.com)
            if [ $response -ne 200 ]; then
              echo "Frontend health check failed"
              exit 1
            fi
      - run:
          name: Backend Health Check
          command: |
            response=$(curl -s -o /dev/null -w "%{http_code}" https://api.tradosphere.com/health)
            if [ $response -ne 200 ]; then
              echo "Backend health check failed"
              exit 1
            fi
      - run:
          name: Database Health Check
          command: |
            psql $PROD_DATABASE_URL -c "SELECT 1;"
      - notify-slack-failure

  # 13. Rollback (if needed)
  rollback:
    executor: node-executor
    steps:
      - checkout
      - run:
          name: Rollback to Previous Version
          command: |
            ./scripts/deploy/rollback.sh $PREVIOUS_SHA

# Workflows
workflows:
  version: 2

  # Main CI/CD Pipeline
  build-test-deploy:
    jobs:
      # Stage 1: Code Quality (Parallel)
      - lint-and-typecheck:
          filters:
            branches:
              ignore: /^dependabot.*/

      # Stage 2: Tests (Parallel)
      - test-unit:
          requires:
            - lint-and-typecheck
      - test-integration:
          requires:
            - lint-and-typecheck
      - security-scan:
          requires:
            - lint-and-typecheck

      # Stage 3: E2E Tests
      - test-e2e:
          requires:
            - test-unit
            - test-integration

      # Stage 4: Build (Parallel)
      - build-frontend:
          requires:
            - test-e2e
      - build-backend:
          requires:
            - test-e2e

      # Stage 5: Docker Images
      - build-docker-images:
          requires:
            - build-frontend
            - build-backend
          filters:
            branches:
              only:
                - develop
                - main

      # Stage 6: Deploy to Staging
      - deploy-staging:
          requires:
            - build-docker-images
            - security-scan
          filters:
            branches:
              only: develop

      # Stage 7: Smoke Tests
      - smoke-tests:
          requires:
            - deploy-staging

      # Stage 8: Manual Approval for Production
      - hold-for-approval:
          type: approval
          requires:
            - smoke-tests
          filters:
            branches:
              only: main

      # Stage 9: Deploy to Production
      - deploy-production:
          requires:
            - hold-for-approval
          filters:
            branches:
              only: main

      # Stage 10: Health Checks
      - health-check:
          requires:
            - deploy-production

  # Nightly Tests (Full Suite)
  nightly:
    triggers:
      - schedule:
          cron: "0 2 * * *" # 2 AM UTC
          filters:
            branches:
              only: main
    jobs:
      - test-unit
      - test-integration
      - test-e2e
      - security-scan

  # Weekly Dependency Updates
  dependency-update:
    triggers:
      - schedule:
          cron: "0 10 * * 1" # 10 AM UTC every Monday
          filters:
            branches:
              only: develop
    jobs:
      - run:
          name: Update Dependencies
          command: |
            pnpm update --latest
            git commit -am "chore: update dependencies"
            git push
```

---

## 🐙 GitHub Actions (Backup CI)

### .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit --coverage
      - run: pnpm test:integration --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🐳 Docker Configurations

### docker/Dockerfile.frontend

```dockerfile
# Multi-stage build for Next.js
FROM node:20-alpine AS base
RUN corepack enable pnpm

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile --prod

# Builder
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build --filter=web

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "apps/web/server.js"]
```

### docker/Dockerfile.backend

```dockerfile
# Multi-stage build for NestJS
FROM node:20-alpine AS base
RUN corepack enable pnpm

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile --prod

# Builder
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build --filter=api

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/

USER nestjs
EXPOSE 4000
ENV PORT 4000

CMD ["node", "apps/api/dist/main.js"]
```

---

## 📜 Deployment Scripts

### scripts/deploy/deploy-frontend.sh

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Frontend to Vercel..."

# Check if environment is specified
if [ -z "$1" ]; then
  echo "Usage: ./deploy-frontend.sh [staging|production]"
  exit 1
fi

ENVIRONMENT=$1

cd apps/web

if [ "$ENVIRONMENT" = "production" ]; then
  echo "📦 Deploying to PRODUCTION..."
  vercel deploy --prod \
    --token="$VERCEL_TOKEN" \
    --build-env NEXT_PUBLIC_API_URL="$PROD_API_URL" \
    --build-env NEXT_PUBLIC_SUPABASE_URL="$PROD_SUPABASE_URL"
else
  echo "📦 Deploying to STAGING..."
  vercel deploy \
    --token="$VERCEL_TOKEN" \
    --env=staging \
    --build-env NEXT_PUBLIC_API_URL="$STAGING_API_URL" \
    --build-env NEXT_PUBLIC_SUPABASE_URL="$STAGING_SUPABASE_URL"
fi

echo "✅ Frontend deployed successfully!"
```

### scripts/deploy/rollback.sh

```bash
#!/bin/bash
set -e

echo "⏮️  Rolling back to previous version..."

if [ -z "$1" ]; then
  echo "Usage: ./rollback.sh [commit-sha]"
  exit 1
fi

PREVIOUS_SHA=$1

# Rollback frontend (Vercel)
echo "Rolling back frontend..."
vercel rollback "$PREVIOUS_SHA" --token="$VERCEL_TOKEN"

# Rollback backend (Railway)
echo "Rolling back backend..."
railway rollback --version="$PREVIOUS_SHA"

echo "✅ Rollback complete!"
```

---

## 🔐 Environment Variables

### .env.example (Template)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tradosphere
REDIS_URL=redis://localhost:6379

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# External Services
GEMINI_API_KEY=your-gemini-key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=your-sentry-token

# CI/CD
VERCEL_TOKEN=your-vercel-token
RAILWAY_TOKEN=your-railway-token
SNYK_TOKEN=your-snyk-token
```

---

## 📊 Monitoring & Alerts

### CircleCI Insights Dashboard

```yaml
# Monitor pipeline performance
Key Metrics:
  - Average build time: Target <15 minutes
  - Test success rate: Target >95%
  - Deployment frequency: Daily (staging), Weekly (production)
  - Mean time to recovery: Target <30 minutes
```

### Slack Notifications

```yaml
Channels:
  #deployments: Production deployments only
  #ci-failures: Failed builds/tests
  #security-alerts: Security scan findings

Notification Triggers:
  - Build failure (any branch)
  - Security vulnerability (high/critical)
  - Production deployment
  - Health check failure
```

---

## 🚨 Failure Handling

### Automatic Rollback Triggers

```yaml
Health Check Failures:
  - Frontend returning 5xx errors >5% of requests
  - Backend API response time >2s (p95)
  - Database connection errors

Rollback Process:
  1. Health check detects issue
  2. Automatic rollback triggered
  3. Slack alert sent to #deployments
  4. Post-mortem issue created in GitHub
```

---

## 📈 CI/CD Metrics & Goals

```yaml
Build Times:
  Lint & Type Check: <2 minutes
  Unit Tests: <3 minutes
  Integration Tests: <5 minutes
  E2E Tests: <10 minutes (sharded)
  Total Pipeline: <15 minutes

Deployment Times:
  Staging: <5 minutes
  Production: <8 minutes (includes approval wait)

Success Rates:
  Build Success: >95%
  Test Pass Rate: >98%
  Deployment Success: >99%
```

---

**This CI/CD configuration ensures fast, reliable, and secure deployments with comprehensive testing at every stage.**