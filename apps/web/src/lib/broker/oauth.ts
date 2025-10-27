/**
 * OAuth 2.0 Utilities for Broker Integrations
 * Implements OAuth 2.0 Authorization Code Flow with PKCE
 */

import crypto from 'crypto';

// =====================================================
// BROKER OAUTH CONFIGURATIONS
// =====================================================
export interface BrokerOAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
  usePKCE: boolean; // Use PKCE for enhanced security
}

export const BROKER_CONFIGS: Record<string, BrokerOAuthConfig> = {
  tradovate: {
    clientId: process.env.TRADOVATE_CLIENT_ID!,
    clientSecret: process.env.TRADOVATE_CLIENT_SECRET!,
    authorizationUrl: 'https://api.tradovate.com/v1/auth/authorize',
    tokenUrl: 'https://api.tradovate.com/v1/auth/accesstoken',
    scopes: ['trading', 'account_read', 'market_data'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/broker/callback/tradovate`,
    usePKCE: true,
  },
  binance: {
    clientId: process.env.BINANCE_CLIENT_ID!,
    clientSecret: process.env.BINANCE_CLIENT_SECRET!,
    authorizationUrl: 'https://accounts.binance.com/oauth/authorize',
    tokenUrl: 'https://api.binance.com/oauth/token',
    scopes: ['spot:read', 'spot:trade', 'futures:read', 'futures:trade'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/broker/callback/binance`,
    usePKCE: true,
  },
  ninjatrader: {
    clientId: process.env.NINJATRADER_CLIENT_ID!,
    clientSecret: process.env.NINJATRADER_CLIENT_SECRET!,
    authorizationUrl: 'https://api.ninjatrader.com/oauth/authorize',
    tokenUrl: 'https://api.ninjatrader.com/oauth/token',
    scopes: ['account', 'orders', 'positions'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/broker/callback/ninjatrader`,
    usePKCE: true,
  },
  rhythmic: {
    clientId: process.env.RHYTHMIC_CLIENT_ID!,
    clientSecret: process.env.RHYTHMIC_CLIENT_SECRET!,
    authorizationUrl: 'https://oauth.rhythmicsm.com/authorize',
    tokenUrl: 'https://oauth.rhythmicsm.com/token',
    scopes: ['trading', 'market_data'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/broker/callback/rhythmic`,
    usePKCE: true,
  },
};

// =====================================================
// PKCE (Proof Key for Code Exchange) Utilities
// =====================================================

/**
 * Generate a cryptographically secure random string for code verifier
 */
export function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(32));
}

/**
 * Generate code challenge from verifier using SHA256
 */
export function generateCodeChallenge(verifier: string): string {
  return base64URLEncode(crypto.createHash('sha256').update(verifier).digest());
}

/**
 * Generate random state for CSRF protection
 */
export function generateState(): string {
  return base64URLEncode(crypto.randomBytes(32));
}

/**
 * Base64 URL encode (RFC 4648)
 */
function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// =====================================================
// TOKEN ENCRYPTION/DECRYPTION
// =====================================================

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY!;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  console.warn('TOKEN_ENCRYPTION_KEY must be at least 32 characters long');
}

/**
 * Encrypt a token using AES-256-GCM
 */
export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    iv
  );

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a token
 */
export function decryptToken(encryptedToken: string): string {
  const parts = encryptedToken.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const [ivHex, authTagHex, encrypted] = parts;

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// =====================================================
// OAUTH FLOW FUNCTIONS
// =====================================================

/**
 * Build OAuth authorization URL with PKCE
 */
export function buildAuthorizationUrl(
  brokerName: string,
  state: string,
  codeVerifier: string
): string {
  const config = BROKER_CONFIGS[brokerName];
  if (!config) {
    throw new Error(`Unknown broker: ${brokerName}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
  });

  if (config.usePKCE) {
    const codeChallenge = generateCodeChallenge(codeVerifier);
    params.append('code_challenge', codeChallenge);
    params.append('code_challenge_method', 'S256');
  }

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  brokerName: string,
  code: string,
  codeVerifier: string
): Promise<OAuthTokenResponse> {
  const config = BROKER_CONFIGS[brokerName];
  if (!config) {
    throw new Error(`Unknown broker: ${brokerName}`);
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  if (config.usePKCE) {
    body.append('code_verifier', codeVerifier);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  brokerName: string,
  refreshToken: string
): Promise<OAuthTokenResponse> {
  const config = BROKER_CONFIGS[brokerName];
  if (!config) {
    throw new Error(`Unknown broker: ${brokerName}`);
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  return response.json();
}

/**
 * Make an authenticated API request to broker
 */
export async function makeBrokerRequest(
  brokerName: string,
  accessToken: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const config = BROKER_CONFIGS[brokerName];
  if (!config) {
    throw new Error(`Unknown broker: ${brokerName}`);
  }

  const baseUrl = getApiBaseUrl(brokerName);

  return fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Get API base URL for broker
 */
function getApiBaseUrl(brokerName: string): string {
  const urls: Record<string, string> = {
    tradovate: 'https://api.tradovate.com/v1',
    binance: 'https://api.binance.com/api/v3',
    ninjatrader: 'https://api.ninjatrader.com/v1',
    rhythmic: 'https://api.rhythmicsm.com/v1',
  };

  return urls[brokerName] || '';
}

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // Seconds until expiration
  refresh_token?: string;
  scope?: string;
}

export interface BrokerAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  isPaper: boolean;
}

export interface BrokerPosition {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
}

export interface BrokerOrder {
  id: string;
  symbol: string;
  type: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: string;
  placedAt: Date;
}

// =====================================================
// VALIDATION
// =====================================================

/**
 * Validate OAuth state to prevent CSRF attacks
 */
export function validateState(expectedState: string, receivedState: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(expectedState),
    Buffer.from(receivedState)
  );
}

/**
 * Check if access token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  // Add 5 minute buffer
  return new Date(expiresAt).getTime() - 5 * 60 * 1000 < Date.now();
}
