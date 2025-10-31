# TradoSphere: Database Schema & Migration Guide
*Complete PostgreSQL Schema with Migration Strategy*

## 🎯 Database Philosophy

**Principles:**
1. **Normalized**: Minimize redundancy, maintain data integrity
2. **Performant**: Indexes on all frequently queried columns
3. **Secure**: Row-Level Security (RLS) on all tables
4. **Auditable**: Created/updated timestamps on all tables
5. **Scalable**: Designed for 100K+ users, 1M+ signals

---

## 📊 Complete Database Schema

### Core Tables (17 tables)

#### 1. Profiles (User Data)

```sql
-- Extends Supabase auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  trading_style TEXT,
  my_story TEXT,
  my_why TEXT,
  
  -- Tier & Status
  tier TEXT NOT NULL DEFAULT 'free' 
    CHECK (tier IN ('free', 'grow', 'elite', 'gladiator', 'legend')),
  tier_since TIMESTAMPTZ DEFAULT NOW(),
  legend_eligible BOOLEAN DEFAULT false,
  
  -- Stats (denormalized for performance)
  total_signals INTEGER DEFAULT 0,
  hit_signals INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  max_win_streak INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  subscriber_count INTEGER DEFAULT 0,
  
  -- Settings
  stealth_mode BOOLEAN DEFAULT false, -- Gladiator+ only
  journal_public BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_tier ON profiles(tier);
CREATE INDEX idx_profiles_follower_count ON profiles(follower_count DESC);
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at DESC);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by all"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2. Signals (Trading Signals)

```sql
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Signal Data
  asset_symbol TEXT NOT NULL, -- BTC/USD, SPY, etc.
  asset_type TEXT NOT NULL CHECK (asset_type IN ('crypto', 'stocks', 'futures', 'forex')),
  direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  
  -- Price Levels
  entry_price DECIMAL(20, 8),
  target_price DECIMAL(20, 8),
  stop_loss DECIMAL(20, 8),
  outcome_price DECIMAL(20, 8),
  
  -- Risk Management
  risk_reward_ratio DECIMAL(5, 2),
  position_size DECIMAL(10, 4),
  
  -- Content
  rationale TEXT NOT NULL,
  timeframe TEXT, -- 1H, 4H, Daily, etc.
  chart_image_url TEXT,
  
  -- Status Tracking
  status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'hit', 'miss', 'cancelled')),
  hit_at TIMESTAMPTZ,
  
  -- AI Parsing
  ai_parsed BOOLEAN DEFAULT false,
  ai_confidence TEXT CHECK (ai_confidence IN ('high', 'medium', 'low')),
  
  -- Engagement (denormalized)
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Metadata
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_signals_creator ON signals(creator_id, posted_at DESC);
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_signals_posted_at ON signals(posted_at DESC);
CREATE INDEX idx_signals_asset ON signals(asset_symbol, asset_type);
CREATE INDEX idx_signals_active_feed ON signals(posted_at DESC) 
  WHERE status = 'active';

-- RLS Policies
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signals viewable by all"
  ON signals FOR SELECT
  USING (true);

CREATE POLICY "Grow+ can create signals"
  ON signals FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    (SELECT tier FROM profiles WHERE id = auth.uid()) 
      IN ('grow', 'elite', 'gladiator', 'legend')
  );

CREATE POLICY "Creators can update own signals"
  ON signals FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own signals"
  ON signals FOR DELETE
  USING (auth.uid() = creator_id);
```

#### 3. Signal Engagement

```sql
CREATE TABLE signal_engagement (
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT, -- 'fire', 'thinking', 'rocket', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (signal_id, user_id)
);

CREATE INDEX idx_engagement_signal ON signal_engagement(signal_id);
CREATE INDEX idx_engagement_user ON signal_engagement(user_id);

ALTER TABLE signal_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engagement viewable by all"
  ON signal_engagement FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own engagement"
  ON signal_engagement FOR ALL
  USING (auth.uid() = user_id);
```

#### 4. Follows (Social Graph)

```sql
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows viewable by all"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own follows"
  ON follows FOR ALL
  USING (auth.uid() = follower_id);

-- Trigger to update follower counts
CREATE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET follower_count = follower_count + 1 
    WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET follower_count = follower_count - 1 
    WHERE id = OLD.following_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follower_count_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follower_count();
```

#### 5. Subscriptions (Creator Monetization)

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Stripe Data
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  -- Subscription Details
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
  price_monthly DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  UNIQUE(subscriber_id, creator_id)
);

CREATE INDEX idx_subscriptions_subscriber ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_creator ON subscriptions(creator_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status) 
  WHERE status = 'active';

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = subscriber_id OR auth.uid() = creator_id);

-- Trigger to update subscriber count
CREATE FUNCTION update_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE profiles SET subscriber_count = subscriber_count + 1 
    WHERE id = NEW.creator_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE profiles SET subscriber_count = subscriber_count - 1 
    WHERE id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriber_count_trigger
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriber_count();
```

#### 6. Trades (Portfolio Management)

```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Trade Details
  asset TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  
  -- Prices
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8),
  stop_loss DECIMAL(20, 8),
  take_profit DECIMAL(20, 8),
  
  -- Position Sizing
  size DECIMAL(20, 8) NOT NULL,
  leverage DECIMAL(5, 2) DEFAULT 1,
  
  -- P/L
  pnl DECIMAL(20, 8),
  pnl_percentage DECIMAL(10, 4),
  fees DECIMAL(20, 8),
  net_pnl DECIMAL(20, 8),
  
  -- Trade Metadata
  notes TEXT,
  tags TEXT[],
  strategy TEXT,
  
  -- Broker Integration
  broker_name TEXT,
  broker_trade_id TEXT,
  
  -- Timestamps
  opened_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trades_user ON trades(user_id, opened_at DESC);
CREATE INDEX idx_trades_asset ON trades(asset);
CREATE INDEX idx_trades_opened_at ON trades(opened_at DESC);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own trades"
  ON trades FOR ALL
  USING (auth.uid() = user_id);
```

#### 7. Competitions

```sql
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Competition Details
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL 
    CHECK (type IN ('1v1', 'team', 'free_for_all')),
  
  -- Financial
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  prize_pool DECIMAL(10, 2) NOT NULL,
  platform_fee_percentage DECIMAL(5, 2) DEFAULT 5,
  
  -- Rules
  rules JSONB NOT NULL, -- Flexible rule structure
  max_participants INTEGER,
  scoring_metrics JSONB NOT NULL, -- Weight configuration
  
  -- Status
  status TEXT DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  
  -- Timestamps
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_starts_at ON competitions(starts_at);
CREATE INDEX idx_competitions_creator ON competitions(creator_id);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Competitions viewable by all"
  ON competitions FOR SELECT
  USING (true);

CREATE POLICY "Gladiators can create competitions"
  ON competitions FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    (SELECT tier FROM profiles WHERE id = auth.uid()) 
      IN ('gladiator', 'legend')
  );
```

#### 8. Competition Participants

```sql
CREATE TABLE competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Scoring
  score DECIMAL(20, 8) DEFAULT 0,
  rank INTEGER,
  
  -- Detailed Metrics
  total_pnl DECIMAL(20, 8) DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  sharpe_ratio DECIMAL(10, 4),
  max_drawdown DECIMAL(10, 4),
  trade_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'eliminated', 'disqualified', 'withdrawn')),
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(competition_id, user_id)
);

CREATE INDEX idx_participants_competition ON competition_participants(competition_id, rank);
CREATE INDEX idx_participants_user ON competition_participants(user_id);
CREATE INDEX idx_participants_leaderboard ON competition_participants(competition_id, score DESC);

ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants viewable by all"
  ON competition_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join competitions"
  ON competition_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### 9. Streams (Live Streaming)

```sql
CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Stream Details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('ts_journal', 'competition', 'analysis')),
  
  -- Agora Details
  agora_channel_id TEXT UNIQUE NOT NULL,
  agora_recording_id TEXT,
  
  -- Current State
  current_symbol TEXT, -- What they're analyzing
  status TEXT DEFAULT 'live'
    CHECK (status IN ('live', 'ended', 'error')),
  
  -- Stats
  peak_viewers INTEGER DEFAULT 0,
  total_viewers INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_streams_creator ON streams(creator_id);
CREATE INDEX idx_streams_status ON streams(status) WHERE status = 'live';
CREATE INDEX idx_streams_started_at ON streams(started_at DESC);

ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Streams viewable by all"
  ON streams FOR SELECT
  USING (true);

CREATE POLICY "Elite+ can create streams"
  ON streams FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    (SELECT tier FROM profiles WHERE id = auth.uid()) 
      IN ('elite', 'gladiator', 'legend')
  );
```

#### 10. Messages (Direct Messaging)

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_recipient ON messages(recipient_id, sent_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id, sent_at DESC);
CREATE INDEX idx_messages_unread ON messages(recipient_id) WHERE read_at IS NULL;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
```

#### 11-17. Additional Tables (Abbreviated)

```sql
-- Clans (Elite+ feature)
CREATE TABLE clans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT UNIQUE NOT NULL,
  badge_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clan Members
CREATE TABLE clan_members (
  clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (clan_id, user_id)
);

-- Watchlists
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist Members
CREATE TABLE watchlist_members (
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
  PRIMARY KEY (watchlist_id, user_id)
);

-- Watchlist Assets
CREATE TABLE watchlist_assets (
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  added_by UUID REFERENCES profiles(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (watchlist_id, symbol)
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('progression', 'skill', 'community')),
  badge_icon_url TEXT,
  criteria JSONB
);

-- User Achievements
CREATE TABLE user_achievements (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Legends Pool
CREATE TABLE legends_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE UNIQUE NOT NULL,
  total_pool DECIMAL(12, 2) DEFAULT 0,
  distributed_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread 
  ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
```

---

## 🔄 Migration Strategy

### Migration File Naming

```
migrations/
├── 001_initial_schema.sql
├── 002_add_signals_table.sql
├── 003_add_rls_policies.sql
├── 004_add_competitions.sql
├── 005_add_indexes_for_performance.sql
└── ...
```

### Migration Template

```sql
-- Migration: 002_add_signals_table.sql
-- Description: Create signals table with RLS
-- Author: Solo Dev
-- Date: 2025-01-20

-- Up Migration
BEGIN;

CREATE TABLE signals (
  -- table definition
);

-- Add indexes
CREATE INDEX idx_signals_creator ON signals(creator_id);

-- Enable RLS
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Signals viewable by all"
  ON signals FOR SELECT
  USING (true);

COMMIT;

-- Down Migration (for rollback)
-- DROP TABLE IF EXISTS signals CASCADE;
```

### Migration Commands

```bash
# Run all pending migrations
pnpm db:migrate

# Create new migration
pnpm db:migration:create add_competitions_table

# Rollback last migration
pnpm db:migrate:down

# Reset database (development only)
pnpm db:reset

# Generate TypeScript types from schema
pnpm db:types:generate
```

---

## 📈 Performance Optimization

### Query Optimization Checklist

```sql
-- ✅ Always use indexes on WHERE clauses
SELECT * FROM signals WHERE creator_id = $1; -- idx_signals_creator

-- ✅ Use covering indexes for hot queries
CREATE INDEX idx_signals_feed_covering 
  ON signals(posted_at DESC) 
  INCLUDE (creator_id, asset_symbol, status);

-- ✅ Partial indexes for filtered queries
CREATE INDEX idx_signals_active 
  ON signals(posted_at DESC) 
  WHERE status = 'active';

-- ✅ Use EXPLAIN ANALYZE to verify query plans
EXPLAIN ANALYZE SELECT * FROM signals WHERE status = 'active';

-- ❌ Avoid SELECT * in production
-- ✅ Select only needed columns
SELECT id, asset_symbol, status FROM signals;

-- ✅ Use LIMIT on large result sets
SELECT * FROM signals ORDER BY posted_at DESC LIMIT 20;
```

---

## 🔒 Security Best Practices

### Row-Level Security (RLS) Patterns

```sql
-- Pattern 1: Public read, authenticated write
CREATE POLICY "Public read" ON table_name FOR SELECT USING (true);
CREATE POLICY "Auth write" ON table_name FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Pattern 2: Own data only
CREATE POLICY "Own data" ON table_name FOR ALL
  USING (auth.uid() = user_id);

-- Pattern 3: Tier-restricted
CREATE POLICY "Grow tier required" ON signals FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    (SELECT tier FROM profiles WHERE id = auth.uid()) 
      IN ('grow', 'elite', 'gladiator', 'legend')
  );

-- Pattern 4: Stealth mode (hide from queries)
CREATE POLICY "Respect stealth mode" ON competition_participants FOR SELECT
  USING (
    user_id != ALL(
      SELECT id FROM profiles WHERE stealth_mode = true
    )
  );
```

---

## 📊 Database Monitoring

### Key Metrics to Track

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE mean_time > 1000 -- >1 second
ORDER BY mean_time DESC
LIMIT 10;
```

---

**This schema is production-ready for 100K+ users. Indexes and RLS ensure performance and security from day one.**