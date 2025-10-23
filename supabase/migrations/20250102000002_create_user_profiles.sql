-- =====================================================
-- Phase 2.3: User Profiles Database Schema
-- =====================================================
-- Tables:
-- 1. user_profiles - Extended user profile information
-- 2. user_stats - Trading statistics and performance metrics
-- 3. user_achievements - Unlockable achievements
-- 4. profile_views - Profile view tracking
-- =====================================================

-- =====================================================
-- 1. USER PROFILES (Extended)
-- =====================================================
-- Add columns to existing users table via ALTER
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(50),
ADD COLUMN IF NOT EXISTS discord_handle VARCHAR(50),
ADD COLUMN IF NOT EXISTS telegram_handle VARCHAR(50),
ADD COLUMN IF NOT EXISTS trading_style VARCHAR(50), -- 'day_trader', 'swing_trader', 'scalper', 'position_trader'
ADD COLUMN IF NOT EXISTS favorite_markets TEXT[], -- ['forex', 'crypto', 'stocks', 'futures']
ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_premium_creator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscriber_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS signal_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_views INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for profile lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_creator ON users(is_creator) WHERE is_creator = true;
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. USER STATS (Trading Performance)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Signal Statistics
    total_signals INT DEFAULT 0,
    active_signals INT DEFAULT 0,
    closed_signals INT DEFAULT 0,

    -- Win/Loss Statistics
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0.00, -- Percentage (0-100)

    -- Profit/Loss
    total_pnl DECIMAL(20, 2) DEFAULT 0.00,
    total_profit DECIMAL(20, 2) DEFAULT 0.00,
    total_loss DECIMAL(20, 2) DEFAULT 0.00,
    average_pnl DECIMAL(20, 2) DEFAULT 0.00,
    best_trade DECIMAL(20, 2) DEFAULT 0.00,
    worst_trade DECIMAL(20, 2) DEFAULT 0.00,

    -- Risk Metrics
    average_rr_ratio DECIMAL(10, 2) DEFAULT 0.00, -- Average Risk/Reward
    total_risk_taken DECIMAL(20, 2) DEFAULT 0.00,

    -- Streak Statistics
    current_win_streak INT DEFAULT 0,
    current_loss_streak INT DEFAULT 0,
    longest_win_streak INT DEFAULT 0,
    longest_loss_streak INT DEFAULT 0,

    -- Engagement Statistics
    total_likes_received INT DEFAULT 0,
    total_comments_received INT DEFAULT 0,
    total_shares INT DEFAULT 0,

    -- Competition Statistics (link to ranked system)
    ranked_wins INT DEFAULT 0,
    ranked_losses INT DEFAULT 0,
    ranked_draws INT DEFAULT 0,
    current_rank VARCHAR(50) DEFAULT 'bronze',
    current_xp INT DEFAULT 0,
    highest_rank_achieved VARCHAR(50) DEFAULT 'bronze',

    -- Time-based Stats
    best_trading_day_pnl DECIMAL(20, 2) DEFAULT 0.00,
    worst_trading_day_pnl DECIMAL(20, 2) DEFAULT 0.00,

    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_stats UNIQUE(user_id)
);

-- Indexes for user stats
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_win_rate ON user_stats(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_pnl ON user_stats(total_pnl DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_ranked_xp ON user_stats(current_xp DESC);

-- Update timestamp trigger
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user stats
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create stats when user is created
CREATE TRIGGER create_user_stats_on_signup
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_stats();

-- =====================================================
-- 3. USER ACHIEVEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    achievement_type VARCHAR(50) NOT NULL, -- 'first_signal', 'ten_wins', 'profitable_month', etc.
    achievement_name VARCHAR(100) NOT NULL,
    achievement_description TEXT,
    achievement_icon VARCHAR(50), -- Emoji or icon name
    achievement_tier VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'

    progress INT DEFAULT 0,
    target INT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_achievement UNIQUE(user_id, achievement_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_completed ON user_achievements(user_id, is_completed);

-- =====================================================
-- 4. PROFILE VIEWS TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Profile being viewed
    viewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be null for anonymous views
    viewer_ip VARCHAR(45), -- IPv4 or IPv6

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_user ON profile_views(profile_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_user_id) WHERE viewer_user_id IS NOT NULL;

-- Function to increment profile view count
CREATE OR REPLACE FUNCTION increment_profile_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET profile_views = profile_views + 1
    WHERE id = NEW.profile_user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment profile views
CREATE TRIGGER increment_profile_views_trigger
    AFTER INSERT ON profile_views
    FOR EACH ROW
    EXECUTE FUNCTION increment_profile_views();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- User Stats RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User stats are viewable by everyone"
    ON user_stats FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own stats"
    ON user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- User Achievements RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
    ON user_achievements FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR ALL
    USING (auth.uid() = user_id);

-- Profile Views RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile owners can view their analytics"
    ON profile_views FOR SELECT
    USING (auth.uid() = profile_user_id);

CREATE POLICY "Anyone can insert profile views"
    ON profile_views FOR INSERT
    WITH CHECK (true);

-- Users table RLS for profile updates
CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate and update user stats from signals
CREATE OR REPLACE FUNCTION recalculate_user_stats(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_stats RECORD;
BEGIN
    -- Calculate stats from signals
    SELECT
        COUNT(*) as total_signals,
        COUNT(*) FILTER (WHERE status = 'active') as active_signals,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_signals,
        COUNT(*) FILTER (WHERE status = 'closed' AND pnl > 0) as total_wins,
        COUNT(*) FILTER (WHERE status = 'closed' AND pnl < 0) as total_losses,
        COALESCE(SUM(pnl), 0) as total_pnl,
        COALESCE(SUM(pnl) FILTER (WHERE pnl > 0), 0) as total_profit,
        COALESCE(ABS(SUM(pnl)) FILTER (WHERE pnl < 0), 0) as total_loss,
        COALESCE(AVG(pnl) FILTER (WHERE status = 'closed'), 0) as average_pnl,
        COALESCE(MAX(pnl), 0) as best_trade,
        COALESCE(MIN(pnl), 0) as worst_trade,
        COALESCE(AVG(risk_reward_ratio), 0) as average_rr_ratio,
        COALESCE(SUM(likes_count), 0) as total_likes_received,
        COALESCE(SUM(comments_count), 0) as total_comments_received
    INTO v_stats
    FROM signals
    WHERE user_id = p_user_id;

    -- Calculate win rate
    DECLARE
        v_win_rate DECIMAL(5, 2);
    BEGIN
        IF (v_stats.total_wins + v_stats.total_losses) > 0 THEN
            v_win_rate := (v_stats.total_wins::DECIMAL / (v_stats.total_wins + v_stats.total_losses)) * 100;
        ELSE
            v_win_rate := 0;
        END IF;

        -- Update user_stats
        UPDATE user_stats SET
            total_signals = v_stats.total_signals,
            active_signals = v_stats.active_signals,
            closed_signals = v_stats.closed_signals,
            total_wins = v_stats.total_wins,
            total_losses = v_stats.total_losses,
            win_rate = v_win_rate,
            total_pnl = v_stats.total_pnl,
            total_profit = v_stats.total_profit,
            total_loss = v_stats.total_loss,
            average_pnl = v_stats.average_pnl,
            best_trade = v_stats.best_trade,
            worst_trade = v_stats.worst_trade,
            average_rr_ratio = v_stats.average_rr_ratio,
            total_likes_received = v_stats.total_likes_received,
            total_comments_received = v_stats.total_comments_received,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment follower count for the user being followed
        UPDATE users SET followers_count = followers_count + 1
        WHERE id = NEW.following_id;

        -- Increment following count for the follower
        UPDATE users SET following_count = following_count + 1
        WHERE id = NEW.follower_id;

    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement follower count
        UPDATE users SET followers_count = GREATEST(0, followers_count - 1)
        WHERE id = OLD.following_id;

        -- Decrement following count
        UPDATE users SET following_count = GREATEST(0, following_count - 1)
        WHERE id = OLD.follower_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update follow counts
CREATE TRIGGER update_follow_counts_trigger
    AFTER INSERT OR DELETE ON user_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follow_counts();

-- Function to update signal count
CREATE OR REPLACE FUNCTION update_signal_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET signal_count = signal_count + 1
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET signal_count = GREATEST(0, signal_count - 1)
        WHERE id = OLD.user_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update signal count
CREATE TRIGGER update_signal_count_trigger
    AFTER INSERT OR DELETE ON signals
    FOR EACH ROW
    EXECUTE FUNCTION update_signal_count();

-- =====================================================
-- 7. SEED DEFAULT ACHIEVEMENTS
-- =====================================================
-- Note: These will be created per user via application logic
-- Sample achievement types:
-- - 'first_signal': First trading signal posted
-- - 'first_win': First profitable trade
-- - 'ten_wins': 10 winning trades
-- - 'hundred_wins': 100 winning trades
-- - 'first_follower': First follower gained
-- - 'hundred_followers': 100 followers
-- - 'profitable_week': Positive P&L for a week
-- - 'profitable_month': Positive P&L for a month
-- - 'win_streak_5': 5 wins in a row
-- - 'ranked_bronze': Reached Bronze rank
-- - 'creator_verified': Became verified creator

-- =====================================================
-- END OF MIGRATION
-- =====================================================
