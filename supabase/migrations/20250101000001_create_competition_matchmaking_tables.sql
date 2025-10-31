-- Competition Matchmaking & XP System
-- Migration: Create core tables for ranked matchmaking and XP tracking

-- =====================================================
-- 1. USER RANKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Current standing
  current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
  current_rank TEXT DEFAULT 'Bronze III',
  rank_tier INTEGER DEFAULT 1 CHECK (rank_tier BETWEEN 1 AND 16),

  -- Performance metrics
  total_competitions INTEGER DEFAULT 0 CHECK (total_competitions >= 0),
  wins INTEGER DEFAULT 0 CHECK (wins >= 0),
  losses INTEGER DEFAULT 0 CHECK (losses >= 0),
  win_rate DECIMAL(5, 2) DEFAULT 0.00 CHECK (win_rate BETWEEN 0 AND 100),

  -- Streaks
  current_win_streak INTEGER DEFAULT 0 CHECK (current_win_streak >= 0),
  current_loss_streak INTEGER DEFAULT 0 CHECK (current_loss_streak >= 0),
  best_win_streak INTEGER DEFAULT 0 CHECK (best_win_streak >= 0),

  -- Peak performance
  peak_xp INTEGER DEFAULT 0 CHECK (peak_xp >= 0),
  peak_rank TEXT DEFAULT 'Bronze III',
  peak_rank_achieved_at TIMESTAMPTZ,

  -- Activity tracking
  last_competition_at TIMESTAMPTZ,
  days_active_this_week INTEGER DEFAULT 0 CHECK (days_active_this_week BETWEEN 0 AND 7),
  last_active_date DATE,

  -- Season stats (reset quarterly)
  season_id INTEGER DEFAULT 1,
  season_xp INTEGER DEFAULT 0 CHECK (season_xp >= 0),
  season_wins INTEGER DEFAULT 0 CHECK (season_wins >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user_rankings
CREATE INDEX idx_user_rankings_xp ON user_rankings(current_xp DESC);
CREATE INDEX idx_user_rankings_rank ON user_rankings(rank_tier);
CREATE INDEX idx_user_rankings_user ON user_rankings(user_id);
CREATE INDEX idx_user_rankings_season ON user_rankings(season_id, current_xp DESC);

-- =====================================================
-- 2. XP TRANSACTIONS TABLE (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,

  -- XP change details
  xp_change INTEGER NOT NULL,
  xp_before INTEGER NOT NULL CHECK (xp_before >= 0),
  xp_after INTEGER NOT NULL CHECK (xp_after >= 0),

  -- Reason for change
  reason TEXT NOT NULL CHECK (reason IN (
    'competition_win',
    'competition_loss',
    'streak_bonus',
    'daily_activity',
    'rank_decay',
    'season_reset',
    'manual_adjustment'
  )),
  reason_details JSONB DEFAULT '{}',

  -- Rank change tracking
  rank_before TEXT,
  rank_after TEXT,
  rank_up BOOLEAN DEFAULT FALSE,
  rank_down BOOLEAN DEFAULT FALSE,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for xp_transactions
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id, created_at DESC);
CREATE INDEX idx_xp_transactions_comp ON xp_transactions(competition_id);
CREATE INDEX idx_xp_transactions_reason ON xp_transactions(reason);

-- =====================================================
-- 3. MATCHMAKING QUEUE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Queue parameters
  format TEXT NOT NULL CHECK (format IN ('1v1', '2v2', '3v3', 'battle_royal')),
  duration_hours INTEGER NOT NULL DEFAULT 72 CHECK (duration_hours > 0),
  current_xp INTEGER NOT NULL CHECK (current_xp >= 0),
  current_rank TEXT NOT NULL,

  -- Search parameters (expands over time)
  xp_range_min INTEGER NOT NULL,
  xp_range_max INTEGER NOT NULL,
  search_started_at TIMESTAMPTZ DEFAULT NOW(),
  search_expanded_count INTEGER DEFAULT 0,

  -- Match status
  status TEXT DEFAULT 'searching' CHECK (status IN (
    'searching',
    'match_found',
    'accepted',
    'declined',
    'expired',
    'cancelled'
  )),
  matched_with UUID[], -- Array of matched user IDs
  match_found_at TIMESTAMPTZ,
  match_accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes'),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for matchmaking_queue
CREATE INDEX idx_matchmaking_queue_format_status ON matchmaking_queue(format, status) WHERE status = 'searching';
CREATE INDEX idx_matchmaking_queue_xp_range ON matchmaking_queue(xp_range_min, xp_range_max) WHERE status = 'searching';
CREATE INDEX idx_matchmaking_queue_user ON matchmaking_queue(user_id, status);
CREATE INDEX idx_matchmaking_queue_expires ON matchmaking_queue(expires_at) WHERE status = 'searching';

-- =====================================================
-- 4. UPDATE COMPETITIONS TABLE
-- =====================================================
-- Add ranked matchmaking fields to existing competitions table
ALTER TABLE IF EXISTS competitions
  ADD COLUMN IF NOT EXISTS is_ranked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS avg_xp INTEGER CHECK (avg_xp >= 0),
  ADD COLUMN IF NOT EXISTS xp_range_min INTEGER CHECK (xp_range_min >= 0),
  ADD COLUMN IF NOT EXISTS xp_range_max INTEGER CHECK (xp_range_max >= 0),
  ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE;

-- Add index for ranked competitions
CREATE INDEX IF NOT EXISTS idx_competitions_ranked ON competitions(is_ranked, status) WHERE is_ranked = TRUE;

-- =====================================================
-- 5. COMPETITION PARTICIPANTS TABLE (Enhanced)
-- =====================================================
-- Add XP tracking fields to competition_participants
ALTER TABLE IF EXISTS competition_participants
  ADD COLUMN IF NOT EXISTS xp_before INTEGER CHECK (xp_before >= 0),
  ADD COLUMN IF NOT EXISTS xp_after INTEGER CHECK (xp_after >= 0),
  ADD COLUMN IF NOT EXISTS xp_gained INTEGER;

-- =====================================================
-- 6. GLOBAL LEADERBOARD TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS global_leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Rankings
  global_rank INTEGER NOT NULL CHECK (global_rank > 0),
  rank_tier TEXT NOT NULL,
  xp INTEGER NOT NULL CHECK (xp >= 0),

  -- Statistics
  total_wins INTEGER DEFAULT 0 CHECK (total_wins >= 0),
  total_competitions INTEGER DEFAULT 0 CHECK (total_competitions >= 0),
  win_rate DECIMAL(5, 2) DEFAULT 0.00 CHECK (win_rate BETWEEN 0 AND 100),

  -- Season tracking
  season_id INTEGER DEFAULT 1,

  -- Snapshot metadata
  snapshot_date DATE DEFAULT CURRENT_DATE,

  -- Constraint: One entry per user per season
  UNIQUE(season_id, user_id)
);

-- Indexes for global_leaderboard
CREATE INDEX idx_global_leaderboard_rank ON global_leaderboard(season_id, global_rank);
CREATE INDEX idx_global_leaderboard_tier ON global_leaderboard(season_id, rank_tier, global_rank);
CREATE INDEX idx_global_leaderboard_user ON global_leaderboard(user_id, season_id);

-- =====================================================
-- 7. MATCHMAKING HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS matchmaking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,

  -- Match details
  format TEXT NOT NULL,
  xp_diff INTEGER, -- XP difference at time of match

  -- Timestamp
  matched_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Track each matchup
  UNIQUE(user_id, opponent_id, competition_id)
);

-- Indexes for matchmaking_history
CREATE INDEX idx_matchmaking_history_user ON matchmaking_history(user_id, matched_at DESC);
CREATE INDEX idx_matchmaking_history_opponent ON matchmaking_history(opponent_id, matched_at DESC);
CREATE INDEX idx_matchmaking_history_recent ON matchmaking_history(user_id, opponent_id, matched_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate rank from XP
CREATE OR REPLACE FUNCTION calculate_rank_from_xp(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN xp >= 3000 THEN 'Champion'
    WHEN xp >= 2800 THEN 'Diamond I'
    WHEN xp >= 2600 THEN 'Diamond II'
    WHEN xp >= 2400 THEN 'Diamond III'
    WHEN xp >= 2200 THEN 'Platinum I'
    WHEN xp >= 2000 THEN 'Platinum II'
    WHEN xp >= 1800 THEN 'Platinum III'
    WHEN xp >= 1600 THEN 'Gold I'
    WHEN xp >= 1400 THEN 'Gold II'
    WHEN xp >= 1200 THEN 'Gold III'
    WHEN xp >= 1000 THEN 'Silver I'
    WHEN xp >= 800 THEN 'Silver II'
    WHEN xp >= 600 THEN 'Silver III'
    WHEN xp >= 400 THEN 'Bronze I'
    WHEN xp >= 200 THEN 'Bronze II'
    ELSE 'Bronze III'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate rank tier from XP
CREATE OR REPLACE FUNCTION calculate_rank_tier_from_xp(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN xp >= 3000 THEN 16
    WHEN xp >= 2800 THEN 15
    WHEN xp >= 2600 THEN 14
    WHEN xp >= 2400 THEN 13
    WHEN xp >= 2200 THEN 12
    WHEN xp >= 2000 THEN 11
    WHEN xp >= 1800 THEN 10
    WHEN xp >= 1600 THEN 9
    WHEN xp >= 1400 THEN 8
    WHEN xp >= 1200 THEN 7
    WHEN xp >= 1000 THEN 6
    WHEN xp >= 800 THEN 5
    WHEN xp >= 600 THEN 4
    WHEN xp >= 400 THEN 3
    WHEN xp >= 200 THEN 2
    ELSE 1
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user ranking
CREATE OR REPLACE FUNCTION update_user_ranking()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current rank based on XP
  NEW.current_rank := calculate_rank_from_xp(NEW.current_xp);
  NEW.rank_tier := calculate_rank_tier_from_xp(NEW.current_xp);

  -- Update peak if current exceeds it
  IF NEW.current_xp > NEW.peak_xp THEN
    NEW.peak_xp := NEW.current_xp;
    NEW.peak_rank := NEW.current_rank;
    NEW.peak_rank_achieved_at := NOW();
  END IF;

  -- Calculate win rate
  IF NEW.total_competitions > 0 THEN
    NEW.win_rate := ROUND((NEW.wins::DECIMAL / NEW.total_competitions::DECIMAL) * 100, 2);
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update ranking
CREATE TRIGGER trigger_update_user_ranking
  BEFORE UPDATE ON user_rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_ranking();

-- Function to clean expired queue entries
CREATE OR REPLACE FUNCTION clean_expired_queue_entries()
RETURNS void AS $$
BEGIN
  UPDATE matchmaking_queue
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'searching'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_history ENABLE ROW LEVEL SECURITY;

-- user_rankings policies
CREATE POLICY "Users can view their own ranking"
  ON user_rankings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all rankings for leaderboard"
  ON user_rankings FOR SELECT
  USING (true);

CREATE POLICY "System can update rankings"
  ON user_rankings FOR UPDATE
  USING (auth.uid() = user_id);

-- xp_transactions policies
CREATE POLICY "Users can view their own XP transactions"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- matchmaking_queue policies
CREATE POLICY "Users can view their own queue entries"
  ON matchmaking_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own queue entries"
  ON matchmaking_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue entries"
  ON matchmaking_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queue entries"
  ON matchmaking_queue FOR DELETE
  USING (auth.uid() = user_id);

-- global_leaderboard policies
CREATE POLICY "Everyone can view leaderboard"
  ON global_leaderboard FOR SELECT
  USING (true);

-- matchmaking_history policies
CREATE POLICY "Users can view their own matchmaking history"
  ON matchmaking_history FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = opponent_id);

-- =====================================================
-- INITIAL DATA & COMMENTS
-- =====================================================

COMMENT ON TABLE user_rankings IS 'Tracks user XP, rank, streaks, and performance metrics for competition matchmaking';
COMMENT ON TABLE xp_transactions IS 'Audit trail of all XP changes with reasons and competition references';
COMMENT ON TABLE matchmaking_queue IS 'Active matchmaking queue for ranked competitions with expanding search ranges';
COMMENT ON TABLE global_leaderboard IS 'Seasonal leaderboard snapshots for global rankings';
COMMENT ON TABLE matchmaking_history IS 'Prevents immediate rematches by tracking recent opponent pairings';

COMMENT ON COLUMN user_rankings.rank_tier IS '1=Bronze III, 2=Bronze II, ... 15=Diamond I, 16=Champion';
COMMENT ON COLUMN user_rankings.season_id IS 'Season identifier, increments quarterly';
COMMENT ON COLUMN matchmaking_queue.search_expanded_count IS 'Number of times search range has been expanded (0-3)';
COMMENT ON COLUMN xp_transactions.reason IS 'competition_win, competition_loss, streak_bonus, daily_activity, rank_decay, season_reset, manual_adjustment';
