# Sequential Thinking MCP - Architectural Decomposition

**Purpose:** Break complex features into implementable steps with precise sequencing

## Overview

Sequential Thinking MCP helps decompose complex features into clear, sequential implementation steps. Essential for planning multi-component features and ensuring nothing is missed.

## Installation

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**Note:** This is a standard MCP tool that doesn't require API keys.

## TradoSphere Use Cases

### Feature Decomposition
```
"Design competition scoring state machine with <1s latency"
"Decompose live streaming feature into service layers"
"Map signal parsing algorithm from input to chart annotation"
```

### Architecture Planning
```
"Break down real-time leaderboard updates into sequential steps"
"Decompose multi-timeframe chart synchronization feature"
"Plan AI-powered trade analysis with Google Search grounding"
```

### Implementation Strategy
```
"Sequence database migration for adding stealth mode"
"Plan Stripe Connect onboarding flow step-by-step"
"Decompose WebSocket event handling for live positions"
```

## Example Decompositions

### Signal Posting Feature
```
Input: "Decompose signal posting with AI level parsing"

Output:
1. Define inputs/outputs
   - Input: User text rationale
   - Output: Signal with parsed entry/target/stop levels

2. Map state transitions
   - Draft → Parsing → Active → Hit/Miss
   - Error states: Parse failed, Invalid levels

3. Identify edge cases
   - Ambiguous text (multiple price mentions)
   - Missing levels (only entry, no target)
   - Invalid price ranges (stop > entry for long)

4. Design error handling
   - Fallback to manual entry if parsing fails
   - Validation before database insert
   - User feedback for parse confidence

5. Plan testing strategy
   - Unit: parseSignalLevels() with various inputs
   - Integration: API route with Gemini mock
   - E2E: Full signal creation flow in browser
```

### Live Streaming Architecture
```
Input: "Sequence live streaming implementation"

Output:
1. Token Generation Service (NestJS)
   - Generate Agora RTC tokens
   - Validate user tier permissions
   - Track active streams

2. Stream Initiation (Agora SDK)
   - Initialize AgoraRTC client
   - Create channel with unique ID
   - Configure video/audio settings

3. Viewer Join Flow
   - Request stream token from API
   - Join Agora channel as audience
   - Subscribe to host video/audio

4. Position Updates (Socket.io)
   - Emit position changes from streamer
   - Broadcast to all viewers in real-time
   - Update UI with <1s latency

5. Chat Synchronization
   - WebSocket connection per viewer
   - Message broadcast to stream room
   - Emoji reaction animations
```

### Competition Scoring System
```
Input: "Design competition scoring with <1s leaderboard updates"

Output:
1. Score Calculation
   - Calculate P/L, win rate, Sharpe ratio
   - Weighted scoring based on competition rules
   - Cache results in Redis for fast reads

2. Leaderboard Aggregation
   - Query top N participants from cache
   - Fallback to PostgreSQL if cache miss
   - Update cache on score changes

3. Real-time Updates
   - Emit score changes via Socket.io
   - Broadcast leaderboard updates every 5s
   - Throttle updates to prevent spam

4. Conflict Resolution
   - Handle concurrent score updates
   - Use optimistic locking on database
   - Resolve with timestamp ordering

5. Performance Optimization
   - Index on (competition_id, score DESC)
   - Materialized view for complex aggregations
   - Cache warm-up on competition start
```

## Best Practices

1. **Start with Inputs/Outputs** - Define clearly before sequencing
2. **Map All States** - Include success, error, and edge cases
3. **Identify Dependencies** - Note what must happen before what
4. **Plan for Failure** - Design error handling for each step
5. **Think About Testing** - Know how each step will be validated

## Integration with Development Flow

```
Research (Exa) → Decompose (Sequential) → Implement → Test (Playwright)
```

**Before Coding:**
- Use Sequential Thinking to break down feature
- Create checklist from decomposition
- Estimate time for each step

**During Implementation:**
- Follow sequence strictly
- Mark steps complete as you go
- Adjust if discovering new requirements

**After Implementation:**
- Review if all steps were completed
- Document deviations from plan
- Store learnings in Memory MCP

## Example Workflow

```
User: "I need to implement the live streaming feature"

1. Ask Sequential Thinking: "Decompose live streaming feature"
2. Get step-by-step implementation plan
3. Create GitHub issues for each major step
4. Use plan to estimate sprint points
5. Implement following the sequence
6. Test each step before moving to next
```

## Performance

- **Planning Time:** 2-5 minutes
- **Time Saved:** 1-2 hours of ad-hoc figuring out
- **Completeness:** Catches 90% of edge cases upfront
- **Quality:** Higher code quality from proper planning

## Troubleshooting

### Vague Decomposition
- Provide more context about feature requirements
- Specify technical constraints (latency, scale, etc.)
- Mention specific technologies to use

### Missing Steps
- Ask to "add error handling steps"
- Request "include testing strategy"
- Specify "add performance optimization steps"

### Too High-Level
- Request "break down step X into substeps"
- Ask for "implementation details for step Y"
- Specify "include database/API/UI layers"

## Integration with Other Tools

- **Memory MCP:** Store successful decompositions as templates
- **GitHub MCP:** Create issues from decomposition steps
- **Playwright MCP:** Generate tests matching each step

---

**Priority:** HIGH
**When to Install:** Week 1 (Core Development)
**Velocity Impact:** 2x better planning, fewer missed requirements
