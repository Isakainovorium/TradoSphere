# Week 1 Essential MCP Tools - Setup Guide

This guide will walk you through setting up the 5 essential MCP tools for TradoSphere development with **2.25x velocity boost**.

## 🎯 Week 1 Tools Overview

| Tool | Purpose | API Key Required | Impact |
|------|---------|------------------|--------|
| **TradoSphere Context** | Search 346 indexed docs, features, routes | ❌ No | Instant codebase knowledge |
| **Memory** | Store architectural decisions & learnings | ❌ No | Context across sessions |
| **GitHub** | Manage branches, PRs, issues naturally | ✅ Yes | Streamlined git workflow |
| **Exa** | Find production code patterns | ✅ Yes | Research velocity |
| **Sequential Thinking** | Decompose complex features | ❌ No | Clear implementation plans |

**3 tools** work instantly, **2 tools** need API keys (free tiers available).

---

## 📋 Step 1: Locate Claude Desktop Config

### macOS
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Windows
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

### Linux
```bash
~/.config/Claude/claude_desktop_config.json
```

**If the file doesn't exist**, create it manually.

---

## 📝 Step 2: Copy Configuration

Copy the contents from:
```
/home/user/TradoSphere/tools/mcp-servers/claude_desktop_config.json
```

To your Claude Desktop config location above.

**⚠️ Important:** Update the `cwd` path for `tradosphere-context` to match your actual project location:

```json
"tradosphere-context": {
  "command": "node",
  "args": ["./dist/mcp/server.js"],
  "cwd": "/YOUR/ACTUAL/PATH/TO/TradoSphere/tools/mcp-servers/tradosphere-context"
}
```

---

## 🔑 Step 3: Get API Keys (2 Required)

### GitHub Personal Access Token

1. **Visit:** https://github.com/settings/tokens
2. **Click:** "Generate new token (classic)"
3. **Select scopes:**
   - ✅ `repo` - Full control of private repositories
   - ✅ `read:org` - Read org and team membership
   - ✅ `workflow` - Update GitHub Action workflows
4. **Generate** and copy the token (starts with `ghp_`)
5. **Update config:**
   ```json
   "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_actual_token_here"
   ```

**Security:** Never commit this token to git. Store securely.

---

### Exa API Key

1. **Visit:** https://exa.ai/
2. **Sign up** for an account (free tier available)
3. **Navigate to** API settings
4. **Generate** an API key
5. **Copy** and update config:
   ```json
   "EXA_API_KEY": "your_actual_exa_key_here"
   ```

**Free Tier:** Check Exa pricing for search limits (typically 100-1000 searches/month on free tier).

---

## 🚀 Step 4: Restart Claude Desktop

1. **Quit** Claude Desktop completely
2. **Relaunch** the application
3. MCP servers will initialize on startup

**Look for:** Tool icons or MCP status indicator showing 5 connected servers.

---

## ✅ Step 5: Verify Installation

### Test Each Tool

#### 1. TradoSphere Context (Codebase Search)
```
"Search docs for authentication flow"
"Find route for leaderboard feature"
"Get stats on indexed documents"
"List all features related to competitions"
```

**Expected:** Returns results from 346 indexed TradoSphere documents.

---

#### 2. Memory (Knowledge Persistence)
```
"Store this architectural decision: We're using Jotai for state management
because it provides atomic updates needed for the /live page with 12+
synchronized UI elements. Benchmarks showed 40% fewer re-renders vs Zustand."
```

Then later:
```
"What was our decision about state management and why?"
```

**Expected:** Returns stored context accurately.

---

#### 3. GitHub (Repository Management)
```
"Show me the current branch and status"
"List all open PRs"
"Show recent commits on main branch"
```

**Expected:** Returns actual GitHub data from your TradoSphere repository.

**Note:** First use may prompt for GitHub authentication.

---

#### 4. Exa (Technical Research)
```
"Find Next.js 14 + WebSocket state management patterns"
"Search for Agora.io + React hooks implementation examples"
"Locate real-time leaderboard implementations with low latency"
```

**Expected:** Returns relevant code examples and articles from the web.

**Note:** Each search counts against your Exa API quota.

---

#### 5. Sequential Thinking (Feature Decomposition)
```
"Decompose the live streaming feature into sequential implementation steps"
"Break down signal posting with AI parsing into a step-by-step plan"
```

**Expected:** Returns numbered, sequential steps with clear dependencies.

---

## 🎨 Development Workflow Examples

### Starting a New Feature

```
1. Use Sequential Thinking:
   "Decompose competition scoring system with <1s latency into steps"

2. Use Exa for Research:
   "Find production real-time scoring implementations with Redis"

3. Use TradoSphere Context:
   "Find all routes and components related to competitions"

4. Use GitHub:
   "Create branch feature/competition-scoring from develop"

5. Use Memory (after implementation):
   "Store learnings: Competition scoring uses Redis for real-time updates,
   PostgreSQL for persistence. Key gotcha: race conditions on concurrent
   updates - solved with Lua scripts in Redis."
```

### Debugging an Issue

```
1. Use TradoSphere Context:
   "Search for leaderboard query implementation"

2. Use Exa:
   "Find solutions for PostgreSQL slow aggregation queries"

3. Use GitHub:
   "Create issue: P1 - Optimize leaderboard query (>2s at 1000 participants)"

4. Use Memory:
   "Store performance benchmark: Leaderboard baseline 2.3s,
   target <200ms, solution: composite index + Redis cache"
```

---

## 🔧 Troubleshooting

### Tools Not Showing Up

**Problem:** Claude Desktop doesn't show MCP tools after restart.

**Solutions:**
1. Check config file syntax (valid JSON)
2. Verify file is in correct location
3. Check Claude Desktop logs:
   - **macOS:** `~/Library/Logs/Claude/`
   - **Windows:** `%APPDATA%\Claude\logs\`
   - **Linux:** `~/.config/Claude/logs/`

---

### TradoSphere Context Not Working

**Problem:** "Cannot find module" or "Server failed to start"

**Solutions:**
1. Verify `cwd` path is absolute and correct
2. Check `node_modules` exists in context engine directory:
   ```bash
   ls /path/to/TradoSphere/tools/mcp-servers/tradosphere-context/node_modules
   ```
3. Verify `dist/mcp/server.js` exists:
   ```bash
   ls /path/to/TradoSphere/tools/mcp-servers/tradosphere-context/dist/mcp/server.js
   ```

---

### GitHub Tool Authentication Failed

**Problem:** "Authentication required" or "Invalid token"

**Solutions:**
1. Regenerate GitHub token with correct scopes
2. Ensure token has no extra spaces in config
3. Token format should start with `ghp_`
4. Check token hasn't expired (tokens can have expiration dates)

---

### Exa Search Returns Errors

**Problem:** "API key invalid" or "Quota exceeded"

**Solutions:**
1. Verify API key is correct (no spaces)
2. Check Exa account status at https://exa.ai/
3. Confirm you haven't exceeded free tier limits
4. Try regenerating the API key

---

### NPX Commands Slow to Start

**Problem:** First use of Exa/GitHub takes 5-10 seconds

**Explanation:** `npx` downloads packages on first use, then caches them.

**Solution:** This is normal. Subsequent uses will be instant.

---

## 📊 Expected Performance

| Tool | Startup Time | Response Time | Notes |
|------|--------------|---------------|-------|
| TradoSphere Context | <100ms | <50ms | Instant after first index |
| Memory | <100ms | <50ms | Local storage |
| GitHub | 1-2s first use | 200-500ms | Network dependent |
| Exa | 2-5s first use | 2-5s | API call + search |
| Sequential Thinking | <100ms | 1-3s | AI processing |

---

## 🎯 Success Metrics

After Week 1 setup, you should experience:

- ✅ **Instant codebase knowledge** - No more grepping through 346 docs
- ✅ **Persistent context** - Remember decisions across sessions
- ✅ **Natural git workflow** - Manage GitHub without leaving Claude
- ✅ **Fast research** - Find solutions in seconds, not hours
- ✅ **Clear implementation plans** - No more feature overwhelm

**Target:** 2.25x faster feature development (18h → 8h per feature)

---

## 📅 Next Steps

**Week 2 Setup (Optional - Add Later):**
- Playwright (E2E testing)
- Supabase (Database management)
- CircleCI (CI/CD pipeline)

**Week 3 Setup (Optional - Add Later):**
- Stripe (Payment testing)
- Sentry (Error monitoring)
- Figma (Design-to-code)

**For now:** Master the Week 1 essentials. Each tool compounds your velocity.

---

## 🆘 Need Help?

**Common Questions:**

**Q: Can I skip some tools?**
A: Yes! Start with TradoSphere Context + Memory minimum. Add others as needed.

**Q: Do these tools see my code?**
A: TradoSphere Context indexes docs locally. Memory stores locally. GitHub/Exa make API calls only when you use them.

**Q: What about API costs?**
A: Memory/Sequential Thinking are free. GitHub is free. Exa has free tier (~100 searches/month).

**Q: Can I add more tools later?**
A: Absolutely! Just add to config and restart Claude Desktop.

---

## 🎉 You're Ready!

With these 5 tools configured, you now have:

- 🔍 **Instant codebase search** across all TradoSphere docs
- 🧠 **Persistent knowledge** that remembers architectural decisions
- 🐙 **GitHub automation** for branches, PRs, and issues
- 🌐 **Research superpowers** to find production patterns
- 🗺️ **Feature decomposition** for complex implementations

**Start building TradoSphere at 2.25x velocity!**

---

**Last Updated:** 2025-10-21
**Version:** 1.2.3
**Tools Configured:** 5/11 available
