# External MCP Tools for TradoSphere

**10 specialized MCP servers to amplify solo development velocity by 3-5x**

## Overview

This directory contains setup guides for 10 external MCP (Model Context Protocol) tools that integrate with Claude Desktop to create a comprehensive AI-powered development environment for TradoSphere.

## Quick Start

### Prerequisites

1. **Claude Desktop** installed
2. **Node.js 20+** installed
3. **API keys** for tools you want to use

### Installation

Each tool is installed via `npx` - no manual installation required. Simply add the configuration to your Claude Desktop config file and restart.

**Config Location:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/claude/claude_desktop_config.json`

## Available Tools

### Week 1: Core Development (Install First)

#### 1. [Exa Search](./01-exa-search.md) - Technical Research Agent
**What it does:** Real-time pattern discovery from production codebases

**Use when:** Researching implementation patterns before coding

**Setup:**
```json
{
  "exa": {
    "command": "npx",
    "args": ["-y", "@exa/mcp-server"],
    "env": { "EXA_API_KEY": "your_key" }
  }
}
```

**Example:** "Find Next.js 14 + WebSocket state management patterns"

---

#### 2. [Sequential Thinking](./02-sequential-thinking.md) - Architectural Decomposition
**What it does:** Breaks complex features into implementable steps

**Use when:** Planning features before implementation

**Setup:**
```json
{
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  }
}
```

**Example:** "Decompose live streaming feature into service layers"

---

#### 3. [Memory](./03-memory.md) - Project Knowledge Persistence
**What it does:** Maintains context and decisions across sessions

**Use when:** Storing architectural decisions, learnings, tech debt

**Setup:**
```json
{
  "memory": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"]
  }
}
```

**Example:** "Why did we choose Jotai over Zustand?"

---

#### 4. [GitHub](./04-github.md) - Repository Management
**What it does:** Manage branches, PRs, issues via natural language

**Use when:** Git operations, PR creation, issue tracking

**Setup:**
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token" }
  }
}
```

**Example:** "Create PR: feature/signals -> develop"

---

### Week 2: Testing & Deployment

#### 5. [Playwright](./05-playwright.md) - E2E Test Automation
**What it does:** Generates and runs end-to-end tests

**Use when:** Creating test coverage for new features

**Setup:**
```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@executeautomation/playwright-mcp-server"]
  }
}
```

**Example:** "Create E2E test for signal posting with AI parsing"

---

#### 6. [CircleCI](./07-circleci.md) - Pipeline Orchestration
**What it does:** Monitors builds, triggers deployments

**Use when:** Managing CI/CD pipelines

**Setup:**
```json
{
  "circleci": {
    "command": "npx",
    "args": ["-y", "circleci-mcp-server"],
    "env": { "CIRCLECI_API_TOKEN": "your_token" }
  }
}
```

**Example:** "Deploy feature/live-streaming to staging"

---

#### 7. [Sentry](./09-sentry.md) - Error Monitoring
**What it does:** Tracks errors and performance issues

**Use when:** Debugging production issues, monitoring

**Setup:**
```json
{
  "sentry": {
    "command": "npx",
    "args": ["-y", "@sentry/mcp-server"],
    "env": {
      "SENTRY_AUTH_TOKEN": "your_token",
      "SENTRY_ORG": "tradosphere",
      "SENTRY_PROJECT": "tradosphere-web"
    }
  }
}
```

**Example:** "Show top 5 errors last 24 hours"

---

### Week 3: Domain-Specific Tools

#### 8. [Supabase](./06-supabase.md) - Database Management
**What it does:** Schema migrations, RLS policies, query optimization

**Use when:** Database operations, performance tuning

**Setup:**
```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server"],
    "env": {
      "SUPABASE_URL": "https://your-project.supabase.co",
      "SUPABASE_SERVICE_KEY": "your_service_key"
    }
  }
}
```

**Example:** "Add stealth_mode column to profiles table"

---

#### 9. [Stripe](./08-stripe.md) - Payment Integration
**What it does:** Test webhooks, manage subscriptions

**Use when:** Payment feature development and testing

**Setup:**
```json
{
  "stripe": {
    "command": "npx",
    "args": ["-y", "@stripe/mcp-server"],
    "env": { "STRIPE_SECRET_KEY": "sk_test_your_key" }
  }
}
```

**Example:** "Create test subscription for user at $10/month"

---

#### 10. [Figma](./10-figma.md) - Design-to-Code
**What it does:** Extracts components and design tokens from Figma

**Use when:** Implementing UI components from designs

**Setup:**
```json
{
  "figma": {
    "command": "npx",
    "args": ["-y", "@figma/mcp-server"],
    "env": { "FIGMA_ACCESS_TOKEN": "your_token" }
  }
}
```

**Example:** "Generate React component from Figma: signal-card"

---

## Complete Claude Desktop Configuration

Here's a full configuration with all 10 tools:

```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "@exa/mcp-server"],
      "env": { "EXA_API_KEY": "your_exa_key" }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token" }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "circleci": {
      "command": "npx",
      "args": ["-y", "circleci-mcp-server"],
      "env": { "CIRCLECI_API_TOKEN": "your_token" }
    },
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server"],
      "env": {
        "SENTRY_AUTH_TOKEN": "your_token",
        "SENTRY_ORG": "tradosphere",
        "SENTRY_PROJECT": "tradosphere-web"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "your_service_key"
      }
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp-server"],
      "env": { "STRIPE_SECRET_KEY": "sk_test_your_key" }
    },
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp-server"],
      "env": { "FIGMA_ACCESS_TOKEN": "your_token" }
    }
  }
}
```

## Installation Priority

### Essential (Week 1)
Install these first - they provide the foundation:
1. **Memory** - Context persistence
2. **GitHub** - Repository management
3. **Exa** - Research capabilities
4. **Sequential Thinking** - Feature planning

### Important (Week 2)
Add testing and deployment automation:
5. **Playwright** - E2E testing
6. **CircleCI** - CI/CD automation
7. **Sentry** - Error monitoring

### Optional (Week 3)
Domain-specific tools for specific features:
8. **Supabase** - Database operations
9. **Stripe** - Payment features
10. **Figma** - Design implementation

## Getting API Keys

### Free (No Keys Required)
- Sequential Thinking ✓
- Memory ✓
- Playwright ✓

### Requires Account
- **Exa:** https://exa.ai/
- **GitHub:** https://github.com/settings/tokens
- **CircleCI:** https://app.circleci.com/settings/user/tokens
- **Sentry:** https://sentry.io/settings/account/api/auth-tokens/
- **Supabase:** https://app.supabase.com (Settings → API)
- **Stripe:** https://dashboard.stripe.com/test/apikeys
- **Figma:** https://www.figma.com/settings (Personal Access Tokens)

## Verification

After adding tools to config:

1. **Restart Claude Desktop**
2. **Open a new conversation**
3. **Look for tools icon (🔧)** in the input area
4. **Verify tools are listed**

Test with:
```
"List all available MCP tools"
"Test memory by storing: favorite color is blue"
"Search GitHub for my repositories"
```

## Development Workflow Example

### Implementing a New Feature

```
1. Research (Exa)
   "Find Next.js 14 + Agora.io integration examples"

2. Plan (Sequential Thinking)
   "Decompose live streaming feature"

3. Create Branch (GitHub)
   "Create branch: feature/live-streaming"

4. Design Schema (Supabase)
   "Create tables for streams and sessions"

5. Implement Code
   [Write code]

6. Generate Tests (Playwright)
   "Create E2E test for stream lifecycle"

7. Deploy (CircleCI)
   "Deploy to staging"

8. Monitor (Sentry)
   "Track stream latency metric"

9. Document (Memory)
   "Store: Live streaming uses Agora for lower DevOps burden"
```

## Velocity Impact

**Without MCP Tools:**
- Research: 2 hours
- Planning: 3 hours
- Implementation: 8 hours
- Testing: 3 hours
- Deployment: 1 hour
- Monitoring: 1 hour
**Total: 18 hours per feature**

**With MCP Tools:**
- Research (Exa): 20 min
- Planning (Sequential): 30 min
- Implementation: 6 hours
- Testing (Playwright): 30 min
- Deployment (CircleCI): 15 min
- Monitoring (Sentry): 10 min
**Total: 8 hours per feature**

**Result: 2.25x faster with higher quality**

## Troubleshooting

### Tools Not Appearing
1. Check JSON syntax in config
2. Verify file location is correct
3. Restart Claude Desktop completely
4. Check Node.js is in PATH

### API Key Errors
1. Verify keys are correct (no spaces)
2. Check key hasn't expired
3. Ensure proper permissions/scopes
4. Test key independently

### Tool Not Working
1. Check tool-specific requirements
2. Review error messages
3. Consult tool's README
4. Check MCP server logs

## Security Best Practices

1. **Never Commit API Keys** - Use environment variables
2. **Use Test Keys** - When available (Stripe)
3. **Rotate Keys Regularly** - Especially if shared
4. **Minimum Scopes** - Only grant required permissions
5. **Monitor Usage** - Watch for unusual activity

## Support

- **MCP Documentation:** https://modelcontextprotocol.io
- **TradoSphere Context Engine:** See `../tradosphere-context/README.md`
- **Individual Tool Guides:** See files in this directory

## Contributing

Found a better way to use these tools? Document it:
```
"Store in Memory: [Tool] tip - [your discovery]"
```

---

**Version:** 1.0.0
**Last Updated:** 2025-10-21
**Tools Count:** 10 external + 1 custom (TradoSphere Context)
**Total Velocity Gain:** 3-5x faster development

---

**This is how a solo developer builds an MIT-level platform in 18 months instead of 5 years.**
