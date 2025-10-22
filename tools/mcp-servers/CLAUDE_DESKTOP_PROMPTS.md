# Claude Desktop Context Prompts

**Purpose:** Use these prompts in Claude Desktop when Claude Code requests additional context

---

## 🔍 When Claude Code Says: "I need context about [topic]"

### **Research Prompt Template**
```
Search TradoSphere docs for information about [topic].

Then help me understand:
1. How is [topic] currently implemented in the codebase?
2. What patterns or conventions are already established?
3. Are there similar features I should reference?
4. What architectural decisions were made related to this?

Provide specific file paths, code examples, and rationale.
```

---

## 🎨 When Claude Code Says: "Let's plan this feature in Desktop first"

### **Feature Planning Prompt Template**
```
I'm about to implement [feature name] in TradoSphere.

Tech stack context:
- Frontend: Next.js 14, TypeScript, Tailwind, Jotai, React Query
- Backend: NestJS, PostgreSQL (Supabase), Redis (Upstash)
- AI: Gemini 2.0 Flash
- Real-time: Socket.io, Supabase Realtime

Please help me:

1. Search TradoSphere docs for related features or patterns

2. Decompose this feature into implementation steps

3. Identify integration points with existing systems

4. Flag potential challenges or edge cases

5. Recommend an implementation approach with rationale

Provide a structured plan I can take back to Claude Code for implementation.
```

---

## 🔌 When Claude Code Says: "Research integration patterns for [service]"

### **Integration Research Prompt Template**
```
I need to integrate [service name] into TradoSphere.

First, search TradoSphere docs for existing [service] usage or similar integrations.

Then, use Exa to find:
1. Production examples of [service] + [our tech stack]
2. Common gotchas and solutions
3. Best practices for error handling
4. Rate limiting and performance considerations

Synthesize findings into integration recommendations.
```

---

## 🗄️ When Claude Code Says: "Plan database changes for [feature]"

### **Database Planning Prompt Template**
```
I need to plan database changes for [feature description].

Current TradoSphere schema context:
- 17 tables with RLS policies
- Supabase PostgreSQL
- Performance target: <200ms for queries

Please help me:

1. Search TradoSphere docs for current schema and conventions

2. Design schema changes needed:
   - New tables or columns?
   - Indexes required?
   - RLS policies needed?

3. Consider:
   - Migration safety (rollback plan)
   - Performance impact
   - Data integrity

4. Identify relationships with existing tables

Provide SQL migration snippets and rationale.
```

---

## ⚡ When Claude Code Says: "Validate performance approach for [feature]"

### **Performance Validation Prompt Template**
```
I'm implementing [feature] and need performance validation.

Context:
- Expected scale: [number of users/records/requests]
- Performance target: [latency requirement]
- Current approach: [brief description]

Please:

1. Search TradoSphere docs for similar performance-critical features

2. Use Exa to find optimization patterns for [specific scenario]

3. Evaluate the approach:
   - Will it scale to [target scale]?
   - What are bottleneck risks?
   - What indexes/caching needed?

4. Recommend optimizations

Provide specific technical recommendations.
```

---

## 🔒 When Claude Code Says: "Security review needed for [feature]"

### **Security Review Prompt Template**
```
I need security validation for [feature description].

Security concerns:
- [e.g., user authentication, payment handling, data access]

Please:

1. Search TradoSphere docs for security patterns and RLS policies

2. Review for vulnerabilities:
   - Authentication/authorization gaps?
   - Injection risks (SQL, XSS, CSRF)?
   - Data exposure risks?
   - Rate limiting needed?

3. Check against OWASP Top 10

4. Recommend security measures

Provide specific security requirements.
```

---

## 🧠 When Claude Code Says: "What was our decision about [topic]?"

### **Memory Retrieval Prompt Template**
```
Search Memory for our previous decision about [topic].

If found, provide:
- The decision we made
- Rationale behind it
- Alternatives we considered
- Any constraints or trade-offs

If not found in Memory, search TradoSphere docs for related architectural decisions.
```

---

## 📝 When Claude Code Says: "Store this learning in Memory"

### **Memory Storage Prompt Template**
```
Store this learning in Memory:

Feature: [feature name]
Date: [date]
Decision/Learning: [what we learned or decided]

Details:
- What worked well: [successes]
- Gotchas encountered: [issues and solutions]
- Performance notes: [benchmarks or optimizations]
- Would do differently: [improvements for next time]

Context: TradoSphere development, [phase/month]
```

---

## 🎯 When Claude Code Says: "Decompose [complex task] step-by-step"

### **Sequential Thinking Prompt Template**
```
Use Sequential Thinking to decompose this task:

Task: [description]

Context:
- TradoSphere tech stack: Next.js 14, NestJS, Supabase, Gemini 2.0
- Related systems: [list integrations]
- Constraints: [timeline, performance, etc.]

Break down into:
1. Ordered implementation steps
2. Dependencies between steps
3. Validation points
4. Testing strategy
5. Edge cases to handle

Provide a step-by-step implementation plan.
```

---

## 🔄 Quick Reference: When to Use Each Prompt

| Claude Code Says | Use This Prompt | Tool Used |
|------------------|-----------------|-----------|
| "Search docs for..." | Research Template | Context Engine |
| "Let's plan this feature..." | Feature Planning Template | Context + Sequential Thinking |
| "Research integration for..." | Integration Research Template | Context + Exa |
| "Plan database changes..." | Database Planning Template | Context Engine |
| "Validate performance..." | Performance Validation Template | Context + Exa |
| "Security review needed..." | Security Review Template | Context Engine |
| "What was our decision..." | Memory Retrieval Template | Memory |
| "Store this learning..." | Memory Storage Template | Memory |
| "Decompose this task..." | Sequential Thinking Template | Sequential Thinking |

---

## 💡 Pro Tips

**Copy-Paste Ready:**
- These prompts are designed to copy directly into Claude Desktop
- Fill in the bracketed [placeholders] with your specific context

**Combine Prompts:**
- For complex features, use multiple prompts in sequence
- Example: Feature Planning → Integration Research → Database Planning

**Iterate:**
- If Desktop's response needs clarification, ask follow-up questions
- Example: "Can you elaborate on step 3 of the integration?"

**Bring Context Back:**
- Copy Desktop's response
- Paste into Claude Code with: "Here's the plan from Desktop: [paste]"

---

## 🚀 Workflow Summary

```
1. Building in Claude Code
   ↓
2. Claude Code: "I need context about [X]"
   ↓
3. You: Switch to Claude Desktop
   ↓
4. You: Use appropriate prompt template above
   ↓
5. Desktop: Provides context/plan using MCP tools
   ↓
6. You: Copy response
   ↓
7. You: Switch back to Claude Code
   ↓
8. You: Paste Desktop's response
   ↓
9. Claude Code: Implements with full context
   ↓
10. Continue building with high accuracy
```

---

**Remember:** I'll tell you exactly when and why I need Desktop context. Just grab the appropriate prompt from this guide, fill in the placeholders, and bring back the response!

**Let's build! 🎉**
