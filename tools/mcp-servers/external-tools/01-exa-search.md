# Exa Search MCP - Technical Research Agent

**Purpose:** Real-time pattern discovery from production codebases

## Overview

Exa Search provides AI-powered search across the web to find real-world implementation patterns, code examples, and technical solutions. Essential for researching how other production systems solve similar problems.

## Installation

```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "@exa/mcp-server"],
      "env": {
        "EXA_API_KEY": "your_exa_api_key_here"
      }
    }
  }
}
```

## Getting API Key

1. Visit https://exa.ai/
2. Sign up for an account
3. Navigate to API settings
4. Generate an API key
5. Copy the key and add to your config

## TradoSphere Use Cases

### Before Coding
```
"Find Next.js 14 + WebSocket state management patterns"
"Search TradingView Charting Library TypeScript examples"
"Locate NestJS microservices architectures for fintech"
```

### During Debugging
```
"Find solutions for Socket.io connection drops in Next.js 14"
"Search for Agora.io + React hooks implementation patterns"
"Locate Supabase Realtime + Jotai state sync examples"
```

### Architecture Research
```
"Find real-time leaderboard implementations with <1s latency"
"Search for competition scoring algorithms in trading platforms"
"Locate multi-timeframe chart sync patterns"
```

## Example Queries

### Signal Parsing Research
```
Query: "Find AI-powered trading signal parsing implementations"
Result: Examples of GPT/Claude parsing trade ideas from text
Use: Reference implementation patterns for Gemini integration
```

### Live Streaming Architecture
```
Query: "Production Next.js + Agora.io integration examples"
Result: Real-world implementations with state management
Use: Validate architecture decisions for /live page
```

### Competition Engine
```
Query: "Real-time scoring systems with Redis + PostgreSQL"
Result: Leaderboard update patterns with caching strategies
Use: Design competition scoring with <1s latency requirement
```

## Best Practices

1. **Be Specific** - Include technologies and frameworks
2. **Focus on Production** - Look for real-world examples
3. **Validate Decisions** - Use before major architectural choices
4. **Learn Patterns** - Study how others solve similar problems

## Performance

- **Search Time:** ~2-5 seconds
- **Results Quality:** High (AI-curated)
- **Cost:** Pay per search (check Exa pricing)
- **Cache Results:** Save useful patterns to Memory MCP

## Troubleshooting

### No Results Found
- Make query more specific with exact technology names
- Try alternative search terms
- Search for individual components separately

### Poor Quality Results
- Add more context to query
- Specify production/enterprise focus
- Filter by date range (recent implementations)

### API Key Issues
- Verify key is correct in config
- Check Exa account is active
- Ensure proper environment variable format

## Integration with Other Tools

- **Sequential Thinking:** Research before decomposing features
- **Memory MCP:** Save useful patterns for future reference
- **GitHub MCP:** Reference examples when reviewing PRs

## Cost Optimization

- Cache frequently searched patterns
- Use for critical decisions only
- Share findings in Memory MCP to avoid re-searching
- Consider team subscription for higher limits

---

**Priority:** HIGH
**When to Install:** Week 1 (Core Development)
**Velocity Impact:** 3x faster research
