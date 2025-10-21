# Memory MCP - Project Knowledge Persistence

**Purpose:** Maintain context and decisions across development sessions

## Overview

Memory MCP provides persistent storage for architectural decisions, technical learnings, and project context. Essential for maintaining consistency across long-term solo development.

## Installation

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Note:** This is a standard MCP tool with no API keys required. Data is stored locally.

## TradoSphere Use Cases

### Architecture Decisions
```
Store: "Why we chose Jotai over Zustand"
Context: {
  "decision": "Jotai for state management",
  "rationale": "Atomic updates for /live page with 12+ synchronized UI elements",
  "date": "2025-01-15",
  "impact": "40% fewer re-renders in benchmarks",
  "alternatives_considered": ["Zustand", "Redux Toolkit"],
  "trade_offs": "Steeper learning curve, but better performance"
}
```

### Technical Debt Tracking
```
Store: "Feed page query optimization needed"
Context: {
  "issue": "Feed query slows at >10K signals",
  "current_performance": "~800ms at 15K signals",
  "target": "<200ms",
  "solution_ideas": [
    "Add covering index on (posted_at, creator_id, status)",
    "Implement cursor-based pagination",
    "Add Redis caching layer"
  ],
  "priority": "P1 - before 10K users"
}
```

### Feature Implementation Notes
```
Store: "Live streaming implementation learnings"
Context: {
  "feature": "Live Streaming",
  "completed": "2025-02-10",
  "key_learnings": [
    "Agora token generation must happen server-side",
    "Socket.io rooms need cleanup on stream end",
    "Position updates should throttle at 1 update/sec max",
    "Chat requires message sanitization for XSS"
  ],
  "gotchas": "Agora SDK conflicts with Next.js SSR - wrap in dynamic import",
  "resources": ["https://docs.agora.io/en/video-calling/develop/get-started-sdk"]
}
```

### Performance Benchmarks
```
Store: "Leaderboard query performance"
Context: {
  "query": "Competition leaderboard with 1000 participants",
  "baseline": "2.3s",
  "with_index": "450ms",
  "with_cache": "12ms",
  "optimization_steps": [
    "Added composite index on (competition_id, score DESC)",
    "Implemented Redis caching with 30s TTL",
    "Used materialized view for complex aggregations"
  ],
  "date": "2025-03-05"
}
```

## What to Store

### ✅ Store These

1. **Architectural Decisions**
   - Technology choices and why
   - Pattern selections
   - Trade-off analysis

2. **Technical Learnings**
   - Implementation gotchas
   - Performance optimizations
   - Bug fix insights

3. **Future Plans**
   - Feature ideas
   - Refactoring needs
   - Technical debt items

4. **External Resources**
   - Useful documentation links
   - Code examples that worked
   - Reference implementations

### ❌ Don't Store These

1. **Frequently Changing Data**
   - Current user counts
   - Daily metrics
   - Real-time stats

2. **Sensitive Information**
   - API keys
   - Passwords
   - User data

3. **Code Itself**
   - Full file contents
   - Large code blocks
   - Auto-generated code

## Example Queries

### Retrieving Decisions
```
"Why did we choose Gemini 2.0 Flash over 1.5 Pro?"
"What was the rationale for using Agora instead of MediaSoup?"
"Show me the technical debt items marked as P1"
```

### Finding Patterns
```
"What optimization patterns have worked for slow queries?"
"Show me all Agora.io implementation notes"
"What are the common gotchas with Next.js 14 App Router?"
```

### Planning Context
```
"What features are planned for Phase 2?"
"What performance benchmarks should I target?"
"What alternatives did we consider for real-time sync?"
```

## Memory Organization

### Categories

```
/architecture
  /decisions - Major architectural choices
  /patterns - Reusable design patterns
  /trade-offs - Decision analysis

/implementation
  /features - Feature implementation notes
  /optimizations - Performance improvements
  /gotchas - Things that caused issues

/technical-debt
  /p1 - Critical issues
  /p2 - Important improvements
  /p3 - Nice to have

/resources
  /documentation - Useful docs
  /examples - Code references
  /tutorials - Learning resources
```

## Best Practices

1. **Store Immediately** - Don't wait, context fades quickly
2. **Be Specific** - Include dates, metrics, specific decisions
3. **Add Context** - Explain why, not just what
4. **Link Related Items** - Reference other decisions/features
5. **Review Quarterly** - Update or archive outdated memories

## Integration with Development Flow

### Start of Sprint
```
Query: "What technical debt items are P1?"
Query: "Show me optimization patterns for database queries"
```

### During Development
```
Store: "Discovered that Socket.io rooms need manual cleanup"
Store: "TradingView widget requires specific div structure"
```

### After Feature Completion
```
Store: Feature implementation notes with learnings
Store: Performance benchmarks achieved
Store: Any technical debt created
```

### Architecture Review
```
Query: "Why did we make this decision?"
Update: "Decision still valid because..."
Archive: "No longer relevant after refactor"
```

## Example Session

```
Starting work on competition engine:

1. Query Memory: "Show competition-related decisions"
   Result: Previous notes about <1s leaderboard requirement

2. Query Memory: "What optimization patterns worked for leaderboards?"
   Result: Redis caching + composite indexes

3. Implement feature using learned patterns

4. Store Memory: "Competition scoring implementation notes"
   - Redis cache structure
   - Index configuration
   - Performance achieved (8ms queries)
```

## Performance

- **Storage:** Local filesystem
- **Query Speed:** <100ms
- **Capacity:** Unlimited (local storage)
- **Persistence:** Permanent until manually deleted

## Troubleshooting

### Can't Find Memory
- Check search terms (try variations)
- Look in different categories
- Search by date range

### Conflicting Information
- Review dates to find most recent
- Check if decision was updated
- Archive outdated information

### Too Much Noise
- Organize with clear categories
- Archive old/irrelevant items
- Use specific search terms

## Integration with Other Tools

- **Sequential Thinking:** Store successful decomposition templates
- **Exa Search:** Save useful patterns found via research
- **GitHub MCP:** Reference decisions in PR descriptions

## Backup Strategy

Memory MCP stores data locally. Back up important memories:

```bash
# Memory MCP typically stores in:
~/.mcp/memory/

# Periodic backup:
cp -r ~/.mcp/memory/ ~/Backups/mcp-memory-$(date +%Y%m%d)
```

---

**Priority:** HIGH
**When to Install:** Week 1 (Core Development)
**Velocity Impact:** Maintain consistency, avoid repeating mistakes
**Session Impact:** Seamless context across days/weeks/months
