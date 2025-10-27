-- =====================================================
-- Zero-Cost Architecture Support
-- Caching and Webhook Infrastructure
-- =====================================================

-- =====================================================
-- 1. BROKER CACHE (Reduce API Calls)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_cache (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cache_expires ON broker_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_key_expires ON broker_cache(key, expires_at);

-- Auto-cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM broker_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS (cache is internal, no client access needed)
ALTER TABLE broker_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cache is server-side only"
    ON broker_cache FOR ALL
    USING (false);

COMMENT ON TABLE broker_cache IS 'Response cache for broker API calls to minimize rate limit usage and stay within free tiers';

-- =====================================================
-- 2. WEBHOOK EVENTS (Free Real-time Updates)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,

    -- Event Info
    broker_name VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'order.filled', 'position.opened', 'balance.updated', etc.
    event_data JSONB NOT NULL,

    -- Webhook Metadata
    webhook_id VARCHAR(255), -- ID from broker's webhook system
    signature VARCHAR(255), -- Webhook signature for verification
    is_verified BOOLEAN DEFAULT false,

    -- Processing
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    error_message TEXT,

    -- Meta
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhook_connection ON broker_webhook_events(connection_id);
CREATE INDEX IF NOT EXISTS idx_webhook_type ON broker_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_processed ON broker_webhook_events(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_webhook_received ON broker_webhook_events(received_at DESC);

-- RLS
ALTER TABLE broker_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their webhook events"
    ON broker_webhook_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM broker_connections bc
            WHERE bc.id = broker_webhook_events.connection_id
            AND bc.user_id = auth.uid()
        )
    );

COMMENT ON TABLE broker_webhook_events IS 'Stores webhook events from brokers for free real-time updates (no polling needed)';

-- =====================================================
-- 3. WEBHOOK REGISTRATIONS (Track Active Webhooks)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_webhook_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,

    -- Registration Info
    broker_name VARCHAR(50) NOT NULL,
    webhook_url TEXT NOT NULL,
    webhook_id VARCHAR(255), -- ID from broker
    webhook_secret TEXT, -- Encrypted webhook secret for signature verification

    -- Events Subscribed
    subscribed_events TEXT[], -- ['order.filled', 'position.opened', etc.]

    -- Status
    is_active BOOLEAN DEFAULT true,
    registration_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'failed', 'revoked'
    last_event_at TIMESTAMPTZ,
    error_message TEXT,

    -- Meta
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_connection_webhook UNIQUE(connection_id, broker_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhook_reg_connection ON broker_webhook_registrations(connection_id);
CREATE INDEX IF NOT EXISTS idx_webhook_reg_broker ON broker_webhook_registrations(broker_name);
CREATE INDEX IF NOT EXISTS idx_webhook_reg_active ON broker_webhook_registrations(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE broker_webhook_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their webhook registrations"
    ON broker_webhook_registrations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM broker_connections bc
            WHERE bc.id = broker_webhook_registrations.connection_id
            AND bc.user_id = auth.uid()
        )
    );

-- Update timestamp trigger
CREATE TRIGGER update_webhook_reg_timestamp
    BEFORE UPDATE ON broker_webhook_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. RATE LIMITING (Stay Within Free Tiers)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_rate_limits (
    key TEXT PRIMARY KEY, -- e.g., 'user:123:tradovate' or 'global:binance'
    request_count INT DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_duration_seconds INT DEFAULT 60, -- 1 minute windows
    max_requests INT DEFAULT 100,

    -- Meta
    last_request_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_key ON api_rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON api_rate_limits(window_start);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_key TEXT,
    p_max_requests INT DEFAULT 100,
    p_window_seconds INT DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_count INT;
    v_window_start TIMESTAMPTZ;
BEGIN
    -- Get or create rate limit record
    SELECT request_count, window_start INTO v_current_count, v_window_start
    FROM api_rate_limits
    WHERE key = p_key;

    -- If record doesn't exist or window expired, reset
    IF NOT FOUND OR (NOW() - v_window_start) > (p_window_seconds || ' seconds')::INTERVAL THEN
        INSERT INTO api_rate_limits (key, request_count, window_start, window_duration_seconds, max_requests)
        VALUES (p_key, 1, NOW(), p_window_seconds, p_max_requests)
        ON CONFLICT (key) DO UPDATE SET
            request_count = 1,
            window_start = NOW(),
            last_request_at = NOW();

        RETURN true;
    END IF;

    -- Check if under limit
    IF v_current_count < p_max_requests THEN
        UPDATE api_rate_limits
        SET request_count = request_count + 1,
            last_request_at = NOW()
        WHERE key = p_key;

        RETURN true;
    END IF;

    -- Rate limit exceeded
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rate limits are server-side only"
    ON api_rate_limits FOR ALL
    USING (false);

COMMENT ON TABLE api_rate_limits IS 'Simple rate limiting to prevent abuse and stay within broker API limits (free tier optimization)';

-- =====================================================
-- 5. SYNC STRATEGIES (On-Demand vs Real-time)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_sync_config (
    connection_id UUID PRIMARY KEY REFERENCES broker_connections(id) ON DELETE CASCADE,

    -- Sync Strategy
    sync_strategy VARCHAR(20) DEFAULT 'on_demand', -- 'on_demand', 'webhook', 'polling'
    polling_interval_seconds INT DEFAULT 60, -- Only used if strategy is 'polling'

    -- What to Sync
    sync_accounts BOOLEAN DEFAULT true,
    sync_positions BOOLEAN DEFAULT true,
    sync_orders BOOLEAN DEFAULT true,
    sync_balances BOOLEAN DEFAULT true,

    -- Last Sync Times
    last_account_sync TIMESTAMPTZ,
    last_position_sync TIMESTAMPTZ,
    last_order_sync TIMESTAMPTZ,
    last_balance_sync TIMESTAMPTZ,

    -- User Preferences
    auto_sync_on_dashboard_open BOOLEAN DEFAULT true,
    stop_sync_on_dashboard_close BOOLEAN DEFAULT true,

    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE broker_sync_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sync config"
    ON broker_sync_config FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM broker_connections bc
            WHERE bc.id = broker_sync_config.connection_id
            AND bc.user_id = auth.uid()
        )
    );

-- Update timestamp trigger
CREATE TRIGGER update_sync_config_timestamp
    BEFORE UPDATE ON broker_sync_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Initialize sync config when connection is created
CREATE OR REPLACE FUNCTION initialize_sync_config()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO broker_sync_config (connection_id, sync_strategy)
    VALUES (
        NEW.id,
        CASE
            WHEN NEW.broker_name IN ('tradovate', 'binance', 'tradelocker') THEN 'webhook'
            WHEN NEW.broker_name IN ('mt4', 'mt5') THEN 'on_demand'
            ELSE 'on_demand'
        END
    )
    ON CONFLICT (connection_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_sync_config_on_connection
    AFTER INSERT ON broker_connections
    FOR EACH ROW
    EXECUTE FUNCTION initialize_sync_config();

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE broker_sync_config IS 'Configures sync strategy per connection to optimize for zero-cost operation (on-demand syncing when possible)';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
