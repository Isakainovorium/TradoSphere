-- =====================================================
-- Phase 3: Premium Features - Broker Integrations
-- OAuth 2.0 Based Architecture with Encrypted Tokens
-- =====================================================
-- Tables:
-- 1. broker_connections - OAuth-based broker connections
-- 2. broker_oauth_tokens - Encrypted access/refresh tokens
-- 3. broker_accounts - Trading accounts linked to connections
-- 4. broker_positions - Real-time position tracking
-- 5. broker_orders - Order history and tracking
-- 6. broker_sync_logs - Sync history and error tracking
-- =====================================================

-- =====================================================
-- 1. BROKER CONNECTIONS (OAuth-based)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Broker Info
    broker_name VARCHAR(50) NOT NULL, -- 'tradovate', 'binance', 'ninjatrader', etc.
    connection_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'connected', 'disconnected', 'error', 'expired'

    -- OAuth State
    oauth_state VARCHAR(255), -- CSRF protection state
    oauth_code_verifier VARCHAR(128), -- PKCE code verifier

    -- Account Identifiers (from broker)
    broker_user_id VARCHAR(255), -- User ID from broker
    broker_account_id VARCHAR(255), -- Primary account ID
    broker_account_name VARCHAR(255), -- Account display name

    -- Connection Metadata
    scopes TEXT[], -- OAuth scopes granted
    is_paper_trading BOOLEAN DEFAULT false,
    is_primary_broker BOOLEAN DEFAULT false,

    -- Status Tracking
    connected_at TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- OAuth token expiration
    error_message TEXT,
    retry_count INT DEFAULT 0,

    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_broker UNIQUE(user_id, broker_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_broker_connections_user_id ON broker_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_connections_status ON broker_connections(connection_status);
CREATE INDEX IF NOT EXISTS idx_broker_connections_expires ON broker_connections(expires_at) WHERE connection_status = 'connected';

-- =====================================================
-- 2. BROKER OAUTH TOKENS (Encrypted Storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,

    -- Encrypted Tokens (Use pgcrypto extension for encryption)
    access_token_encrypted TEXT NOT NULL, -- Encrypted OAuth access token
    refresh_token_encrypted TEXT, -- Encrypted OAuth refresh token
    token_type VARCHAR(50) DEFAULT 'Bearer',

    -- Token Metadata
    access_token_expires_at TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,
    scopes TEXT[],

    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_connection_token UNIQUE(connection_id)
);

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_connection ON broker_oauth_tokens(connection_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires ON broker_oauth_tokens(access_token_expires_at);

-- =====================================================
-- 3. BROKER ACCOUNTS (Trading Accounts)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,

    -- Account Info
    broker_account_id VARCHAR(255) NOT NULL, -- Account ID from broker
    account_name VARCHAR(255),
    account_type VARCHAR(50), -- 'futures', 'crypto', 'forex', 'stocks', 'options'
    currency VARCHAR(10) DEFAULT 'USD',

    -- Account Balances
    balance DECIMAL(20, 2) DEFAULT 0.00,
    available_balance DECIMAL(20, 2) DEFAULT 0.00,
    margin_used DECIMAL(20, 2) DEFAULT 0.00,
    unrealized_pnl DECIMAL(20, 2) DEFAULT 0.00,
    realized_pnl DECIMAL(20, 2) DEFAULT 0.00,

    -- Account Status
    is_active BOOLEAN DEFAULT true,
    is_paper BOOLEAN DEFAULT false,

    -- Meta
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_broker_account UNIQUE(connection_id, broker_account_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_broker_accounts_connection ON broker_accounts(connection_id);
CREATE INDEX IF NOT EXISTS idx_broker_accounts_active ON broker_accounts(is_active) WHERE is_active = true;

-- =====================================================
-- 4. BROKER POSITIONS (Real-time Positions)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES broker_accounts(id) ON DELETE CASCADE,

    -- Position Info
    broker_position_id VARCHAR(255), -- Position ID from broker
    symbol VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- 'long', 'short'

    -- Position Details
    quantity DECIMAL(20, 8) NOT NULL,
    entry_price DECIMAL(20, 8) NOT NULL,
    current_price DECIMAL(20, 8),

    -- P&L
    unrealized_pnl DECIMAL(20, 2) DEFAULT 0.00,
    realized_pnl DECIMAL(20, 2) DEFAULT 0.00,

    -- Risk Management
    stop_loss DECIMAL(20, 8),
    take_profit DECIMAL(20, 8),

    -- Status
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'

    -- Meta
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_positions_account ON broker_positions(account_id);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON broker_positions(symbol);
CREATE INDEX IF NOT EXISTS idx_positions_status ON broker_positions(status);

-- =====================================================
-- 5. BROKER ORDERS (Order History)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES broker_accounts(id) ON DELETE CASCADE,

    -- Order Info
    broker_order_id VARCHAR(255) NOT NULL, -- Order ID from broker
    symbol VARCHAR(50) NOT NULL,
    order_type VARCHAR(20) NOT NULL, -- 'market', 'limit', 'stop', 'stop_limit'
    side VARCHAR(10) NOT NULL, -- 'buy', 'sell'

    -- Order Details
    quantity DECIMAL(20, 8) NOT NULL,
    filled_quantity DECIMAL(20, 8) DEFAULT 0.00,
    price DECIMAL(20, 8), -- Limit price
    stop_price DECIMAL(20, 8), -- Stop price
    average_fill_price DECIMAL(20, 8), -- Actual fill price

    -- Order Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'filled', 'partially_filled', 'cancelled', 'rejected'
    time_in_force VARCHAR(20) DEFAULT 'GTC', -- 'GTC', 'IOC', 'FOK', 'DAY'

    -- Meta
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    filled_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_broker_order UNIQUE(account_id, broker_order_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_account ON broker_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_orders_symbol ON broker_orders(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_status ON broker_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON broker_orders(placed_at DESC);

-- =====================================================
-- 6. BROKER SYNC LOGS (Sync History & Errors)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,

    -- Sync Info
    sync_type VARCHAR(50) NOT NULL, -- 'accounts', 'positions', 'orders', 'balances', 'full'
    sync_status VARCHAR(20) NOT NULL, -- 'success', 'partial', 'failed'

    -- Sync Results
    items_synced INT DEFAULT 0,
    items_failed INT DEFAULT 0,
    error_message TEXT,
    error_details JSONB,

    -- Performance
    duration_ms INT, -- Sync duration in milliseconds

    -- Meta
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sync_logs_connection ON broker_sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON broker_sync_logs(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started ON broker_sync_logs(started_at DESC);

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Broker Connections RLS
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own broker connections"
    ON broker_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own broker connections"
    ON broker_connections FOR ALL
    USING (auth.uid() = user_id);

-- OAuth Tokens RLS (Most restrictive - tokens should NEVER be exposed to client)
ALTER TABLE broker_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "OAuth tokens are only accessible by server"
    ON broker_oauth_tokens FOR ALL
    USING (false); -- No direct client access

-- Broker Accounts RLS
ALTER TABLE broker_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own broker accounts"
    ON broker_accounts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM broker_connections bc
            WHERE bc.id = broker_accounts.connection_id
            AND bc.user_id = auth.uid()
        )
    );

-- Positions RLS
ALTER TABLE broker_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own positions"
    ON broker_positions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM broker_accounts ba
            JOIN broker_connections bc ON bc.id = ba.connection_id
            WHERE ba.id = broker_positions.account_id
            AND bc.user_id = auth.uid()
        )
    );

-- Orders RLS
ALTER TABLE broker_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
    ON broker_orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM broker_accounts ba
            JOIN broker_connections bc ON bc.id = ba.connection_id
            WHERE ba.id = broker_orders.account_id
            AND bc.user_id = auth.uid()
        )
    );

-- Sync Logs RLS
ALTER TABLE broker_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync logs"
    ON broker_sync_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM broker_connections bc
            WHERE bc.id = broker_sync_logs.connection_id
            AND bc.user_id = auth.uid()
        )
    );

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to encrypt token
CREATE OR REPLACE FUNCTION encrypt_token(token TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        pgp_sym_encrypt(token, encryption_key),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt token (server-side only)
CREATE OR REPLACE FUNCTION decrypt_token(encrypted_token TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(
        decode(encrypted_token, 'base64'),
        encryption_key
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if token is expired
CREATE OR REPLACE FUNCTION is_token_expired(connection_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    token_expires TIMESTAMPTZ;
BEGIN
    SELECT access_token_expires_at INTO token_expires
    FROM broker_oauth_tokens
    WHERE broker_oauth_tokens.connection_id = is_token_expired.connection_id;

    RETURN token_expires IS NULL OR token_expires < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update connection status
CREATE OR REPLACE FUNCTION update_connection_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update connection expires_at based on token expiration
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE broker_connections
        SET
            expires_at = NEW.access_token_expires_at,
            updated_at = NOW()
        WHERE id = NEW.connection_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync connection status with token
CREATE TRIGGER sync_connection_expiration
    AFTER INSERT OR UPDATE ON broker_oauth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_connection_status();

-- Function to auto-update updated_at timestamp
CREATE TRIGGER update_broker_connections_timestamp
    BEFORE UPDATE ON broker_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_broker_accounts_timestamp
    BEFORE UPDATE ON broker_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_broker_positions_timestamp
    BEFORE UPDATE ON broker_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_broker_orders_timestamp
    BEFORE UPDATE ON broker_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. BROKER OAUTH CONFIGURATIONS (Reference Data)
-- =====================================================
-- This is stored in application config, not database
-- Each broker will have:
-- - client_id (from broker developer portal)
-- - client_secret (from broker, stored in env vars)
-- - authorization_url (OAuth authorize endpoint)
-- - token_url (OAuth token endpoint)
-- - scopes (required OAuth scopes)
-- - redirect_uri (callback URL to our app)
-- =====================================================

-- =====================================================
-- END OF MIGRATION
-- =====================================================

-- Example broker configurations (application-level):
-- TRADOVATE:
--   - Authorization URL: https://api.tradovate.com/v1/auth/authorize
--   - Token URL: https://api.tradovate.com/v1/auth/accesstoken
--   - Scopes: trading, account_read, market_data
--
-- BINANCE:
--   - Authorization URL: https://accounts.binance.com/oauth/authorize
--   - Token URL: https://api.binance.com/oauth/token
--   - Scopes: spot:read, spot:trade, futures:read, futures:trade
--
-- NINJATRADER:
--   - Authorization URL: https://api.ninjatrader.com/oauth/authorize
--   - Token URL: https://api.ninjatrader.com/oauth/token
--   - Scopes: account, orders, positions
