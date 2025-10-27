-- =====================================================
-- Phase 3: MT4/MT5 Credential-Based Authentication
-- =====================================================
-- Extends broker_connections to support credential-based auth
-- for platforms that don't use OAuth (MT4, MT5)
-- =====================================================

-- Add authentication type to broker_connections
ALTER TABLE broker_connections
ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) DEFAULT 'oauth'; -- 'oauth', 'credentials'

-- =====================================================
-- BROKER CREDENTIALS (Encrypted Storage for MT4/MT5)
-- =====================================================
CREATE TABLE IF NOT EXISTS broker_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,

    -- MT4/MT5 Credentials (all encrypted)
    server_address_encrypted TEXT, -- MT4/MT5 server URL
    account_number_encrypted TEXT, -- Trading account number
    password_encrypted TEXT, -- Account password
    investor_password_encrypted TEXT, -- Read-only password (optional)

    -- API Credentials (for brokers with API keys)
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,

    -- Additional Settings
    platform_version VARCHAR(20), -- 'mt4', 'mt5'
    is_real_account BOOLEAN DEFAULT true,

    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_connection_credentials UNIQUE(connection_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_broker_credentials_connection ON broker_credentials(connection_id);

-- RLS Policy (credentials should NEVER be exposed to client)
ALTER TABLE broker_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Credentials are only accessible by server"
    ON broker_credentials FOR ALL
    USING (false); -- No direct client access

-- Update timestamp trigger
CREATE TRIGGER update_broker_credentials_timestamp
    BEFORE UPDATE ON broker_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Helper Functions for Credential Encryption
-- =====================================================

-- Function to store MT4/MT5 credentials (encrypted)
CREATE OR REPLACE FUNCTION store_mt_credentials(
    p_connection_id UUID,
    p_server_address TEXT,
    p_account_number TEXT,
    p_password TEXT,
    p_investor_password TEXT,
    p_platform_version VARCHAR(20),
    p_is_real_account BOOLEAN,
    p_encryption_key TEXT
)
RETURNS UUID AS $$
DECLARE
    v_credential_id UUID;
BEGIN
    INSERT INTO broker_credentials (
        connection_id,
        server_address_encrypted,
        account_number_encrypted,
        password_encrypted,
        investor_password_encrypted,
        platform_version,
        is_real_account
    ) VALUES (
        p_connection_id,
        encode(pgp_sym_encrypt(p_server_address, p_encryption_key), 'base64'),
        encode(pgp_sym_encrypt(p_account_number, p_encryption_key), 'base64'),
        encode(pgp_sym_encrypt(p_password, p_encryption_key), 'base64'),
        CASE
            WHEN p_investor_password IS NOT NULL
            THEN encode(pgp_sym_encrypt(p_investor_password, p_encryption_key), 'base64')
            ELSE NULL
        END,
        p_platform_version,
        p_is_real_account
    )
    ON CONFLICT (connection_id) DO UPDATE SET
        server_address_encrypted = EXCLUDED.server_address_encrypted,
        account_number_encrypted = EXCLUDED.account_number_encrypted,
        password_encrypted = EXCLUDED.password_encrypted,
        investor_password_encrypted = EXCLUDED.investor_password_encrypted,
        platform_version = EXCLUDED.platform_version,
        is_real_account = EXCLUDED.is_real_account,
        updated_at = NOW()
    RETURNING id INTO v_credential_id;

    RETURN v_credential_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to retrieve decrypted credentials (server-side only)
CREATE OR REPLACE FUNCTION get_mt_credentials(
    p_connection_id UUID,
    p_encryption_key TEXT
)
RETURNS TABLE (
    server_address TEXT,
    account_number TEXT,
    password TEXT,
    investor_password TEXT,
    platform_version VARCHAR(20),
    is_real_account BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pgp_sym_decrypt(decode(server_address_encrypted, 'base64'), p_encryption_key)::TEXT,
        pgp_sym_decrypt(decode(account_number_encrypted, 'base64'), p_encryption_key)::TEXT,
        pgp_sym_decrypt(decode(password_encrypted, 'base64'), p_encryption_key)::TEXT,
        CASE
            WHEN investor_password_encrypted IS NOT NULL
            THEN pgp_sym_decrypt(decode(investor_password_encrypted, 'base64'), p_encryption_key)::TEXT
            ELSE NULL
        END,
        broker_credentials.platform_version,
        broker_credentials.is_real_account
    FROM broker_credentials
    WHERE connection_id = p_connection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MT4/MT5 Connection Status Tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS mt_connection_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,

    -- Connection Health
    last_ping_at TIMESTAMPTZ,
    ping_latency_ms INT,
    is_connected BOOLEAN DEFAULT false,
    connection_error TEXT,

    -- Server Info
    server_time TIMESTAMPTZ,
    server_timezone VARCHAR(50),

    -- Account Health
    last_heartbeat_at TIMESTAMPTZ,
    heartbeat_interval_seconds INT DEFAULT 30,

    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_connection_health UNIQUE(connection_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mt_health_connection ON mt_connection_health(connection_id);
CREATE INDEX IF NOT EXISTS idx_mt_health_connected ON mt_connection_health(is_connected) WHERE is_connected = true;

-- RLS
ALTER TABLE mt_connection_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MT connection health"
    ON mt_connection_health FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM broker_connections bc
            WHERE bc.id = mt_connection_health.connection_id
            AND bc.user_id = auth.uid()
        )
    );

-- Update timestamp trigger
CREATE TRIGGER update_mt_health_timestamp
    BEFORE UPDATE ON mt_connection_health
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE broker_credentials IS 'Encrypted storage for credential-based broker authentication (MT4/MT5, API keys)';
COMMENT ON TABLE mt_connection_health IS 'Real-time connection health monitoring for MT4/MT5 connections';
COMMENT ON COLUMN broker_connections.auth_type IS 'Authentication method: oauth (modern brokers) or credentials (MT4/MT5)';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
