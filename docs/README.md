# TradoSphere Documentation Hub
*Central Navigation for All Documentation*

## 🚀 Quick Start

**New to the project?** Start here:
1. [Builder's Guide](00-quick-start/01-builders-guide.md) - Complete development manual
2. [Setup Instructions](../tools/mcp-servers/SETUP_INSTRUCTIONS.md) - Environment setup
3. [Master Technical Overview](01-architecture/01-master-overview.md) - Architecture overview

**Ready to code?**
- [Development Workflow](02-development/03-dev-workflow.md) - Git, commits, process
- [Project Structure](01-architecture/02-project-structure.md) - File organization
- [Implementation Roadmap](02-development/04-implementation-roadmap.md) - Feature phases

**Need to find something?**
- [Documentation Index](../DOC_INDEX.md) - Complete catalog with identifiers
- Use document IDs (e.g., `DOC-ARCH-001`) for quick reference

---

## 📁 Documentation Structure

### [00-quick-start/](00-quick-start/)
Getting started guides for new developers
- [01-builders-guide.md](00-quick-start/01-builders-guide.md) - Complete development manual
- Setup and onboarding instructions
- First week guide

### [01-architecture/](01-architecture/)
Technical architecture and design decisions
- [01-master-overview.md](01-architecture/01-master-overview.md) - Tech stack overview (DOC-ARCH-001)
- [02-project-structure.md](01-architecture/02-project-structure.md) - File organization (DOC-ARCH-002)
- [03-app-router.md](01-architecture/03-app-router.md) - Next.js routes (DOC-ARCH-003)
- [04-database-schema.md](01-architecture/04-database-schema.md) - Database design (DOC-ARCH-004)
- [05-api-standards.md](01-architecture/05-api-standards.md) - API documentation (DOC-ARCH-005)
- [06-mcp-architecture.md](01-architecture/06-mcp-architecture.md) - MCP setup (DOC-ARCH-006)
- [07-monitoring.md](01-architecture/07-monitoring.md) - Observability (DOC-ARCH-007)
- [08-adrs/](01-architecture/08-adrs/) - Architecture Decision Records

### [02-development/](02-development/)
Development guides and processes
- [01-dev-plan.md](02-development/01-dev-plan.md) - 18-month roadmap (DOC-DEV-001)
- [02-dev-scope.md](02-development/02-dev-scope.md) - Feature breakdown (DOC-DEV-002)
- [03-dev-workflow.md](02-development/03-dev-workflow.md) - Git workflow (DOC-DEV-003)
- [04-implementation-roadmap.md](02-development/04-implementation-roadmap.md) - Phase plan (DOC-DEV-004)
- [05-structure-audit.md](02-development/05-structure-audit.md) - Gap analysis (DOC-DEV-005)
- [06-skeleton-summary.md](02-development/06-skeleton-summary.md) - Status (DOC-DEV-006)
- [07-task-completion.md](02-development/07-task-completion.md) - Completed features (DOC-DEV-007)
- [08-cheat-sheet.md](02-development/08-cheat-sheet.md) - Quick reference

### [03-features/](03-features/)
Feature specifications and implementations
- [01-onboarding-system.md](03-features/01-onboarding-system.md) - AI onboarding (DOC-FEAT-001)
- [02-learning-hub.md](03-features/02-learning-hub.md) - Learning system (DOC-FEAT-002)
- [03-settings-hub.md](03-features/03-settings-hub.md) - Settings system (DOC-FEAT-003)
- [04-competition-matchmaking.md](03-features/04-competition-matchmaking.md) - Matchmaking (DOC-FEAT-004)
- [05-competition-implementation.md](03-features/05-competition-implementation.md) - Implementation (DOC-FEAT-005)
- [06-ai-mentor-connector.md](03-features/06-ai-mentor-connector.md) - Mentor system (DOC-FEAT-006)
- [07-ai-mentor-cloning.md](03-features/07-ai-mentor-cloning.md) - AI cloning (DOC-FEAT-007)

### [04-business/](04-business/)
Business strategy and monetization
- [01-account-tiers.md](04-business/01-account-tiers.md) - Tier system (DOC-BIZ-001)
- [02-pricing-strategy.md](04-business/02-pricing-strategy.md) - Pricing analysis (DOC-BIZ-002)
- [03-premium-tier.md](04-business/03-premium-tier.md) - Premium features (DOC-BIZ-003)
- [04-zero-cost-arch.md](04-business/04-zero-cost-arch.md) - Cost optimization (DOC-BIZ-004)
- [05-strategic-growth.md](04-business/05-strategic-growth.md) - Growth strategy (DOC-BIZ-005)

### [05-testing/](05-testing/)
Testing documentation
- [01-test-suites.md](05-testing/01-test-suites.md) - Complete test strategy (DOC-TEST-001)

### [06-config/](06-config/)
Configuration and setup guides
- [01-cicd.md](06-config/01-cicd.md) - CI/CD pipeline (DOC-CONFIG-001)
- [02-claude-desktop.md](06-config/02-claude-desktop.md) - AI assistant setup (DOC-CONFIG-002)

### [07-reference/](07-reference/)
Reference materials and resources
- [01-external-resources.md](07-reference/01-external-resources.md) - Official docs (DOC-REF-001)
- [04-ui-specs.txt](07-reference/04-ui-specs.txt) - UI specifications (DOC-REF-003)
- [05-core-context.md](07-reference/05-core-context.md) - AI context
- [06-pages-checkpoint.md](07-reference/06-pages-checkpoint.md) - Page status

### [08-tools/](08-tools/)
Tool-specific documentation
- [01-mcp-setup.md](08-tools/01-mcp-setup.md) - MCP setup (DOC-TOOLS-002)
- [02-context-engine.md](08-tools/02-context-engine.md) - Context engine (DOC-TOOLS-001)
- [03-claude-prompts.md](08-tools/03-claude-prompts.md) - Prompt templates (DOC-TOOLS-003)
- [04-external-tools/](08-tools/04-external-tools/) - External tool guides
  - Exa Search, Sequential Thinking, Memory
  - GitHub, Playwright, Supabase
  - CircleCI, Stripe, Sentry, Figma

---

## 🔍 Finding Documents

### By Document ID

All documents have unique identifiers:
- `DOC-ARCH-001` = Master Technical Overview
- `DOC-DEV-003` = Development Workflow
- `DOC-FEAT-004` = Competition Matchmaking
- See [Documentation Index](../DOC_INDEX.md) for full list

### By Topic

**Architecture?** → `01-architecture/`  
**Development?** → `02-development/`  
**Feature Specs?** → `03-features/`  
**Business Logic?** → `04-business/`  
**Testing?** → `05-testing/`  
**Configuration?** → `06-config/`  
**Reference?** → `07-reference/`  
**Tools?** → `08-tools/`

---

## 📚 Most Commonly Used Documents

1. **Builder's Guide** - `00-quick-start/01-builders-guide.md`
2. **Master Overview** - `01-architecture/01-master-overview.md`
3. **Development Workflow** - `02-development/03-dev-workflow.md`
4. **Project Structure** - `01-architecture/02-project-structure.md`
5. **Database Schema** - `01-architecture/04-database-schema.md`
6. **API Standards** - `01-architecture/05-api-standards.md`
7. **Implementation Roadmap** - `02-development/04-implementation-roadmap.md`

---

## 🔄 Documentation Maintenance

**When adding new docs:**
1. Place in appropriate numbered category
2. Use consistent naming (lowercase, hyphens)
3. Add to [DOC_INDEX.md](../DOC_INDEX.md)
4. Update this README if needed

**When updating docs:**
1. Update "Last Updated" date
2. Keep document IDs consistent
3. Maintain cross-references

---

**Last Updated:** 2025-01-22  
**Total Documents:** 82+  
**Structure Version:** 1.0

