# Supabase MCP - Database Management

**Purpose:** Manage database schema, RLS policies, and queries via natural language

## Overview

Supabase MCP provides comprehensive database management capabilities for PostgreSQL. Essential for schema migrations, RLS policy management, and query optimization.

## Installation

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "your_service_role_key_here"
      }
    }
  }
}
```

## Getting Credentials

1. Open Supabase Dashboard: https://app.supabase.com
2. Select your TradoSphere project
3. Go to Settings → API
4. Copy:
   - **Project URL:** `SUPABASE_URL`
   - **service_role key:** `SUPABASE_SERVICE_KEY` (keep secure!)

⚠️ **Security:** Service role bypasses RLS. Never expose in client code!

## TradoSphere Use Cases

### Schema Migrations
```
"Add stealth_mode boolean to profiles table with default false"
"Create index on signals(creator_id, posted_at DESC)"
"Add legends_pool table for monthly prize distribution"
```

### RLS Policy Management
```
"Show RLS policies protecting competition data"
"Create RLS policy: Users can only update own profile"
"Add policy: Grow+ users can create signals"
```

### Query Optimization
```
"Analyze slow queries on feed page"
"Suggest indexes for leaderboard aggregation"
"Show query plan for signal listing with filters"
```

### Data Operations
```
"Count active signals per user tier"
"Find users with >10 signals but 0 subscribers"
"Export competition results to CSV"
```

## Example Operations

### Adding Stealth Mode Feature

**Request:**
```
"Add stealth mode feature:
- Boolean column on profiles table
- Default false
- Only Gladiator+ can enable
- Hides user from public leaderboards when true"
```

**Generated Migration:**
```sql
-- Add column
ALTER TABLE profiles
ADD COLUMN stealth_mode BOOLEAN DEFAULT false;

-- Create RLS policy for privacy
CREATE POLICY "Stealth mode hides from public queries"
ON competition_participants
FOR SELECT
USING (
  user_id != ALL(
    SELECT id FROM profiles WHERE stealth_mode = true
  )
);

-- Create index for stealth queries
CREATE INDEX idx_profiles_stealth
ON profiles(stealth_mode)
WHERE stealth_mode = true;

-- Update tier check
CREATE POLICY "Only Gladiator+ can enable stealth"
ON profiles
FOR UPDATE
USING (
  auth.uid() = id AND
  (SELECT tier FROM profiles WHERE id = auth.uid())
    IN ('gladiator', 'legend')
);
```

### Optimizing Feed Query

**Request:**
```
"Optimize feed query:
SELECT * FROM signals
WHERE status = 'active'
ORDER BY posted_at DESC
LIMIT 20"
```

**Analysis & Recommendations:**
```
Current Performance: ~450ms at 15K signals
Issues Detected:
1. Sequential scan on signals table
2. Missing covering index
3. Sorting overhead

Recommended Optimizations:

1. Create Covering Index:
CREATE INDEX idx_signals_feed_optimized
ON signals(posted_at DESC)
INCLUDE (creator_id, asset_symbol, status, rationale)
WHERE status = 'active';

2. Use Cursor-Based Pagination:
SELECT * FROM signals
WHERE status = 'active'
  AND posted_at < $1  -- cursor
ORDER BY posted_at DESC
LIMIT 20;

3. Add Partial Index:
CREATE INDEX idx_signals_active
ON signals(posted_at DESC)
WHERE status = 'active';

Expected Performance: <50ms
Improvement: 9x faster
```

### Managing RLS Policies

**Request:**
```
"Show all RLS policies for signals table"
```

**Output:**
```
Signals Table RLS Policies:
===========================

1. "Signals viewable by all"
   Command: SELECT
   Policy: true (no restriction)

2. "Grow+ can create signals"
   Command: INSERT
   Check: auth.uid() = creator_id AND
          (SELECT tier FROM profiles WHERE id = auth.uid())
            IN ('grow', 'elite', 'gladiator', 'legend')

3. "Creators can update own signals"
   Command: UPDATE
   Using: auth.uid() = creator_id

4. "Creators can delete own signals"
   Command: DELETE
   Using: auth.uid() = creator_id
```

### Database Analytics

**Request:**
```
"Show signal statistics by tier"
```

**Query:**
```sql
SELECT
  p.tier,
  COUNT(s.id) as total_signals,
  COUNT(CASE WHEN s.status = 'hit' THEN 1 END) as hits,
  COUNT(CASE WHEN s.status = 'miss' THEN 1 END) as misses,
  ROUND(
    100.0 * COUNT(CASE WHEN s.status = 'hit' THEN 1 END) /
    NULLIF(COUNT(CASE WHEN s.status IN ('hit', 'miss') THEN 1 END), 0),
    2
  ) as win_rate
FROM profiles p
LEFT JOIN signals s ON s.creator_id = p.id
GROUP BY p.tier
ORDER BY total_signals DESC;
```

## TradoSphere Database Operations

### Schema Additions

```
1. Add Column:
   "Add 'email_notifications' boolean to profiles with default true"

2. Create Table:
   "Create notifications table with user_id, type, title, content, read_at"

3. Modify Column:
   "Change max_win_streak from INTEGER to BIGINT on profiles"

4. Add Constraint:
   "Add CHECK constraint: entry_price > 0 on signals table"
```

### Index Management

```
1. Create Index:
   "Create index on trades(user_id, opened_at DESC)"

2. Drop Index:
   "Drop index idx_old_signals"

3. Analyze Usage:
   "Show unused indexes on competition tables"

4. Suggest Indexes:
   "Recommend indexes for improving leaderboard query performance"
```

### RLS Policy Patterns

```typescript
// Pattern 1: Public read, own data write
CREATE POLICY "Public read" ON table_name
FOR SELECT USING (true);

CREATE POLICY "Own data" ON table_name
FOR ALL USING (auth.uid() = user_id);

// Pattern 2: Tier-restricted actions
CREATE POLICY "Tier access" ON signals
FOR INSERT
WITH CHECK (
  (SELECT tier FROM profiles WHERE id = auth.uid())
    IN ('grow', 'elite', 'gladiator', 'legend')
);

// Pattern 3: Privacy controls
CREATE POLICY "Respect stealth mode" ON leaderboards
FOR SELECT
USING (
  user_id NOT IN (
    SELECT id FROM profiles WHERE stealth_mode = true
  )
);
```

## Performance Monitoring

### Query Analysis
```
"Show slowest queries in last 24 hours"
"Analyze table bloat on signals table"
"Check connection pool usage"
```

### Index Recommendations
```
"Suggest indexes for queries taking >100ms"
"Find missing foreign key indexes"
"Identify unused indexes consuming space"
```

## Best Practices

1. **Always Use Transactions** - For multi-step migrations
2. **Test Migrations on Staging** - Never run untested SQL on production
3. **Backup Before Major Changes** - Use Supabase's backup feature
4. **Monitor Query Performance** - Track slow queries
5. **Review RLS Policies Regularly** - Ensure security is maintained

## Common Tasks

### Adding a New Feature

```
1. "Design table schema for [feature]"
2. "Create migration SQL"
3. "Add RLS policies for [feature]"
4. "Create indexes for common queries"
5. "Test migration on staging"
6. "Apply to production"
```

### Fixing Performance Issues

```
1. "Analyze slow query: [query]"
2. "Show EXPLAIN plan"
3. "Suggest optimizations"
4. "Create recommended indexes"
5. "Verify improvement"
```

### Security Audit

```
1. "List all RLS policies by table"
2. "Find tables without RLS enabled"
3. "Check for public write access"
4. "Verify tier restrictions working"
```

## Troubleshooting

### Migration Failed
- Check SQL syntax
- Verify table/column exists
- Review foreign key constraints
- Check RLS policy conflicts

### Slow Queries
- Run EXPLAIN ANALYZE
- Check for missing indexes
- Verify table statistics are current
- Consider materialized views

### RLS Policy Issues
- Verify policy logic with test cases
- Check auth.uid() is available
- Test with different user roles
- Review policy ordering

## Integration with Development Flow

```
Design Feature → Schema Design (Supabase) →
Create Migration → Test Locally →
Apply to Staging → Verify → Apply to Production
```

---

**Priority:** HIGH
**When to Install:** Week 3 (Domain Tools)
**Velocity Impact:** 3x faster database operations
**Quality Impact:** Fewer schema errors, better performance
**Security Impact:** Easier RLS policy management
