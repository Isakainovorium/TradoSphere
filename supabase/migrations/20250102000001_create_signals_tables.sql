-- =============================================
-- Signals & Social Trading Tables
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SIGNALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Signal Details
  symbol VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price DECIMAL(20, 8) NOT NULL,
  stop_loss DECIMAL(20, 8),
  take_profit DECIMAL(20, 8),
  position_size DECIMAL(20, 8),

  -- Status & Performance
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
  exit_price DECIMAL(20, 8),
  pnl DECIMAL(20, 8),
  pnl_percentage DECIMAL(10, 4),

  -- Content
  title TEXT,
  description TEXT,
  tags TEXT[], -- Array of tags like ['scalping', 'breakout', 'support']
  image_url TEXT,

  -- Metadata
  timeframe VARCHAR(10), -- '1m', '5m', '15m', '1h', '4h', '1d'
  market_type VARCHAR(20), -- 'forex', 'crypto', 'stocks', 'futures', 'options'
  risk_reward_ratio DECIMAL(10, 2),

  -- Engagement
  likes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  shares_count INT NOT NULL DEFAULT 0,
  views_count INT NOT NULL DEFAULT 0,

  -- Visibility
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false, -- Premium content for subscribers only

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  -- Indexes
  CONSTRAINT valid_prices CHECK (entry_price > 0),
  CONSTRAINT valid_stop_loss CHECK (stop_loss IS NULL OR stop_loss > 0),
  CONSTRAINT valid_take_profit CHECK (take_profit IS NULL OR take_profit > 0)
);

-- Indexes for performance
CREATE INDEX idx_signals_user_id ON signals(user_id);
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_signals_symbol ON signals(symbol);
CREATE INDEX idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX idx_signals_direction ON signals(direction);
CREATE INDEX idx_signals_market_type ON signals(market_type);
CREATE INDEX idx_signals_is_public ON signals(is_public) WHERE is_public = true;
CREATE INDEX idx_signals_tags ON signals USING GIN(tags);

-- =============================================
-- SIGNAL LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS signal_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one like per user per signal
  UNIQUE(signal_id, user_id)
);

CREATE INDEX idx_signal_likes_signal_id ON signal_likes(signal_id);
CREATE INDEX idx_signal_likes_user_id ON signal_likes(user_id);

-- =============================================
-- SIGNAL COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS signal_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES signal_comments(id) ON DELETE CASCADE, -- For nested replies

  content TEXT NOT NULL,

  -- Engagement
  likes_count INT NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_content CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000)
);

CREATE INDEX idx_signal_comments_signal_id ON signal_comments(signal_id);
CREATE INDEX idx_signal_comments_user_id ON signal_comments(user_id);
CREATE INDEX idx_signal_comments_parent_id ON signal_comments(parent_id);
CREATE INDEX idx_signal_comments_created_at ON signal_comments(created_at DESC);

-- =============================================
-- COMMENT LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES signal_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- =============================================
-- USER FOLLOWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Can't follow yourself
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);

-- =============================================
-- SAVED SIGNALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS saved_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, signal_id)
);

CREATE INDEX idx_saved_signals_user_id ON saved_signals(user_id);
CREATE INDEX idx_saved_signals_signal_id ON saved_signals(signal_id);

-- =============================================
-- SIGNAL VIEWS TABLE (for analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS signal_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for anonymous views
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signal_views_signal_id ON signal_views(signal_id);
CREATE INDEX idx_signal_views_user_id ON signal_views(user_id);
CREATE INDEX idx_signal_views_created_at ON signal_views(created_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_signals_updated_at
  BEFORE UPDATE ON signals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signal_comments_updated_at
  BEFORE UPDATE ON signal_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Increment likes count on signals
CREATE OR REPLACE FUNCTION increment_signal_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE signals SET likes_count = likes_count + 1 WHERE id = NEW.signal_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER signal_like_added
  AFTER INSERT ON signal_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_signal_likes();

-- Decrement likes count on signals
CREATE OR REPLACE FUNCTION decrement_signal_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE signals SET likes_count = likes_count - 1 WHERE id = OLD.signal_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER signal_like_removed
  AFTER DELETE ON signal_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_signal_likes();

-- Increment comments count on signals
CREATE OR REPLACE FUNCTION increment_signal_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE signals SET comments_count = comments_count + 1 WHERE id = NEW.signal_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER signal_comment_added
  AFTER INSERT ON signal_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_signal_comments();

-- Decrement comments count on signals
CREATE OR REPLACE FUNCTION decrement_signal_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE signals SET comments_count = comments_count - 1 WHERE id = OLD.signal_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER signal_comment_removed
  AFTER DELETE ON signal_comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_signal_comments();

-- Increment likes count on comments
CREATE OR REPLACE FUNCTION increment_comment_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE signal_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_like_added
  AFTER INSERT ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_comment_likes();

-- Decrement likes count on comments
CREATE OR REPLACE FUNCTION decrement_comment_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE signal_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_like_removed
  AFTER DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_comment_likes();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_views ENABLE ROW LEVEL SECURITY;

-- Signals policies
CREATE POLICY "Public signals are viewable by everyone"
  ON signals FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own signals"
  ON signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signals"
  ON signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signals"
  ON signals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signals"
  ON signals FOR DELETE
  USING (auth.uid() = user_id);

-- Signal likes policies
CREATE POLICY "Anyone can view likes"
  ON signal_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can add likes"
  ON signal_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON signal_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments on public signals"
  ON signal_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM signals
      WHERE signals.id = signal_comments.signal_id
      AND signals.is_public = true
    )
  );

CREATE POLICY "Users can add comments"
  ON signal_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON signal_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON signal_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Comment likes policies
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can add comment likes"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own comment likes"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Follow policies
CREATE POLICY "Anyone can view follows"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Saved signals policies
CREATE POLICY "Users can view their saved signals"
  ON saved_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save signals"
  ON saved_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave signals"
  ON saved_signals FOR DELETE
  USING (auth.uid() = user_id);

-- Views policies
CREATE POLICY "Anyone can insert views"
  ON signal_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Signal owners can view their signal views"
  ON signal_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM signals
      WHERE signals.id = signal_views.signal_id
      AND signals.user_id = auth.uid()
    )
  );
