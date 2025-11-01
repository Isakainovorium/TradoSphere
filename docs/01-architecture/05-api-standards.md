# TradoSphere: API Documentation Standards
*Complete API Reference with OpenAPI Specification*

## 🎯 API Design Principles

**RESTful Conventions:**
1. Use HTTP methods correctly (GET, POST, PATCH, DELETE)
2. Plural nouns for resources (`/signals`, not `/signal`)
3. Nested resources for relationships (`/competitions/:id/participants`)
4. Query params for filtering (`?status=active&limit=20`)
5. Consistent error responses
6. Versioning in URL (`/api/v1/signals`)

---

## 📚 API Structure

### Base URL

```
Development: http://localhost:4000/api/v1
Staging:     https://api-staging.tradosphere.com/api/v1
Production:  https://api.tradosphere.com/api/v1
```

### Authentication

```http
Authorization: Bearer <jwt_token>
```

All authenticated endpoints require JWT token in Authorization header.

---

## 📖 Endpoint Documentation Template

### Standard Format

```markdown
## [HTTP_METHOD] /resource/:id

**Description**: Brief description of what this endpoint does

**Authentication**: Required | Optional | None

**Permissions**: Free | Grow+ | Elite+ | Gladiator+ | Legend

**Rate Limit**: 100 requests/minute

### Request

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Resource identifier |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | No | 20 | Number of results |
| offset | integer | No | 0 | Pagination offset |

**Request Body:**
```json
{
  "field1": "string",
  "field2": 123
}
```

### Response

**Success Response (200 OK):**
```json
{
  "data": { },
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Description of error",
    "field": "fieldName"
  }
}
```

### Examples

**cURL:**
```bash
curl -X GET "https://api.tradosphere.com/api/v1/resource/123" \
  -H "Authorization: Bearer token"
```

**TypeScript:**
```typescript
const response = await fetch('/api/v1/resource/123', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
```
```

---

## 🔍 Complete API Reference

### Signals API

#### GET /signals

List trading signals with filtering and pagination.

**Authentication**: Optional (shows public signals only if not authenticated)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | No | 20 | Results per page (max 100) |
| offset | integer | No | 0 | Pagination offset |
| status | enum | No | all | Filter by: `active`, `hit`, `miss`, `cancelled` |
| creator_id | UUID | No | - | Filter by creator |
| asset_type | enum | No | - | Filter by: `crypto`, `stocks`, `futures`, `forex` |
| direction | enum | No | - | Filter by: `LONG`, `SHORT` |

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "creator": {
        "id": "...",
        "username": "trader123",
        "avatar_url": "...",
        "tier": "elite"
      },
      "asset_symbol": "BTC/USD",
      "asset_type": "crypto",
      "direction": "LONG",
      "entry_price": 50000.00,
      "target_price": 52000.00,
      "stop_loss": 48500.00,
      "status": "active",
      "rationale": "Strong support at 50k...",
      "risk_reward_ratio": 3.0,
      "ai_parsed": true,
      "ai_confidence": "high",
      "view_count": 1245,
      "like_count": 89,
      "posted_at": "2025-01-20T10:30:00Z"
    }
  ],
  "meta": {
    "total": 1523,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

---

#### POST /signals

Create a new trading signal.

**Authentication**: Required

**Permissions**: TS Grow+ (with weekly limit), TS Elite+ (unlimited)

**Rate Limit**: 
- TS Grow: 1 signal/week
- TS Elite+: 50 signals/day

**Request Body:**
```json
{
  "asset_symbol": "BTC/USD",
  "asset_type": "crypto",
  "direction": "LONG",
  "entry_price": 50000.00,
  "target_price": 52000.00,
  "stop_loss": 48500.00,
  "rationale": "Strong support at 50k level. RSI oversold on 4H timeframe.",
  "timeframe": "4H",
  "position_size": 1.0
}
```

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "creator_id": "...",
    "asset_symbol": "BTC/USD",
    "status": "active",
    "ai_parsed": true,
    "ai_confidence": "high",
    "posted_at": "2025-01-20T10:30:00Z"
  }
}
```

**Error Responses:**

**403 Forbidden** (Tier restriction):
```json
{
  "error": {
    "code": "INSUFFICIENT_TIER",
    "message": "This feature requires TS Grow or higher",
    "required_tier": "grow"
  }
}
```

**429 Too Many Requests** (Rate limit):
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Weekly signal limit reached. Upgrade to TS Elite for unlimited signals.",
    "limit": 1,
    "reset_at": "2025-01-27T00:00:00Z"
  }
}
```

---

#### PATCH /signals/:id

Update signal status (hit/miss/cancelled).

**Authentication**: Required

**Permissions**: Signal creator only

**Request Body:**
```json
{
  "status": "hit",
  "outcome_price": 52100.00
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "hit",
    "outcome_price": 52100.00,
    "hit_at": "2025-01-20T15:45:00Z"
  }
}
```

---

### Gemini AI API

#### POST /gemini/parse

Parse signal text to extract price levels using AI.

**Authentication**: Required

**Permissions**: TS Grow+

**Rate Limit**: Tier-based (see rate limits table)

**Request Body:**
```json
{
  "text": "Long BTC at entry $50,000, targeting $52,000 with stop at $48,500"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "entry": 50000.00,
    "target": 52000.00,
    "stopLoss": 48500.00,
    "confidence": "high",
    "reasoning": "Clear price levels mentioned with explicit labels"
  }
}
```

---

#### POST /gemini/analyze

Analyze a trading position with AI (includes Google Search grounding).

**Authentication**: Required

**Permissions**: TS Elite+

**Request Body:**
```json
{
  "position": {
    "symbol": "BTC/USD",
    "entry_price": 50000.00,
    "current_price": 51500.00,
    "pnl": 3.0
  }
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "analysis": "**News Summary (Last 24h):**\n- Bitcoin breaks $51k resistance...\n\n**Technical Outlook:** Bullish\n- Price above 50 EMA\n- RSI: 62 (neutral)\n\n**Risk Assessment:** Medium\n- Consider taking partial profits at $52k\n- Trailing stop recommended",
    "sentiment": "bullish",
    "risk_level": "medium"
  }
}
```

---

### Competitions API

#### GET /competitions

List all competitions.

**Authentication**: Optional

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | enum | `upcoming`, `active`, `completed` |
| type | enum | `1v1`, `team`, `free_for_all` |

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "name": "Weekly Crypto Challenge",
      "type": "free_for_all",
      "entry_fee": 10.00,
      "prize_pool": 500.00,
      "status": "active",
      "participant_count": 45,
      "max_participants": 100,
      "starts_at": "2025-01-20T00:00:00Z",
      "ends_at": "2025-01-27T00:00:00Z"
    }
  ]
}
```

---

#### POST /competitions/:id/join

Join a competition.

**Authentication**: Required

**Permissions**: Free (for free competitions), TS Grow+ (for paid competitions)

**Request Body:**
```json
{
  "accept_rules": true
}
```

**Success Response (201 Created):**
```json
{
  "data": {
    "participant_id": "...",
    "competition_id": "...",
    "joined_at": "2025-01-20T10:30:00Z",
    "rank": 46
  }
}
```

---

#### GET /competitions/:id/leaderboard

Get real-time leaderboard.

**Authentication**: Optional

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 50 | Number of entries |

**Response:**
```json
{
  "data": [
    {
      "rank": 1,
      "user": {
        "id": "...",
        "username": "trader_pro",
        "avatar_url": "..."
      },
      "score": 95.7,
      "total_pnl": 1250.00,
      "win_rate": 75.0,
      "trade_count": 12
    }
  ],
  "meta": {
    "updated_at": "2025-01-20T10:30:15Z",
    "total_participants": 45
  }
}
```

---

### Streaming API

#### POST /streaming/token

Generate Agora token for streaming.

**Authentication**: Required

**Permissions**: TS Elite+ (to host), All tiers (to view)

**Request Body:**
```json
{
  "stream_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "host"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "token": "006abcd1234...",
    "channel_id": "stream_550e8400",
    "uid": 12345,
    "expires_at": "2025-01-20T14:30:00Z"
  }
}
```

---

#### POST /streaming/start

Start a new live stream.

**Authentication**: Required

**Permissions**: TS Elite+

**Request Body:**
```json
{
  "title": "BTC Analysis Session",
  "description": "Morning market analysis",
  "category": "ts_journal"
}
```

**Success Response (201 Created):**
```json
{
  "data": {
    "stream_id": "...",
    "agora_channel_id": "stream_...",
    "status": "live",
    "started_at": "2025-01-20T10:30:00Z"
  }
}
```

---

## 🔒 Error Response Standards

### Error Format

All errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "field": "fieldName",
    "details": {}
  }
}
```

### Standard Error Codes

```yaml
Authentication Errors:
  INVALID_TOKEN: JWT token is invalid or expired
  MISSING_TOKEN: Authorization header missing
  INSUFFICIENT_PERMISSIONS: User doesn't have required permissions

Validation Errors:
  INVALID_INPUT: Request validation failed
  MISSING_FIELD: Required field missing
  INVALID_FORMAT: Field format invalid

Resource Errors:
  NOT_FOUND: Resource doesn't exist
  ALREADY_EXISTS: Resource already exists
  CONFLICT: Resource state conflict

Rate Limiting:
  RATE_LIMIT_EXCEEDED: Too many requests
  QUOTA_EXCEEDED: API quota exceeded

Tier Restrictions:
  INSUFFICIENT_TIER: Feature requires higher tier
  TIER_LIMIT_REACHED: Tier-specific limit reached

Server Errors:
  INTERNAL_ERROR: Unexpected server error
  SERVICE_UNAVAILABLE: External service down
  DATABASE_ERROR: Database operation failed
```

---

## 📊 Rate Limiting

### Rate Limits by Tier

| Tier | Endpoint | Limit |
|------|----------|-------|
| Free | GET endpoints | 100/minute |
| Free | POST endpoints | 10/minute |
| Free | Gemini API | 0 |
| Grow | GET endpoints | 200/minute |
| Grow | POST endpoints | 20/minute |
| Grow | Gemini API | 20/hour |
| Elite+ | GET endpoints | 500/minute |
| Elite+ | POST endpoints | 100/minute |
| Elite+ | Gemini API | 50/hour |
| Gladiator+ | All endpoints | 1000/minute |
| Gladiator+ | Gemini API | 100/hour |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642687200
```

---

## 🔄 Pagination

### Cursor-Based Pagination (Recommended)

```http
GET /api/v1/signals?limit=20&cursor=eyJpZCI6IjU1MGU4NDAwIn0
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6IjY2MGU4NDAwIn0",
    "has_more": true
  }
}
```

### Offset-Based Pagination (Alternative)

```http
GET /api/v1/signals?limit=20&offset=40
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 1523,
    "limit": 20,
    "offset": 40,
    "page": 3,
    "total_pages": 77
  }
}
```

---

## 🔍 Filtering & Sorting

### Query Parameter Conventions

```http
# Filtering
GET /signals?status=active&asset_type=crypto

# Sorting (use - for descending)
GET /signals?sort=-posted_at

# Multiple sorts
GET /signals?sort=-posted_at,creator_id

# Search
GET /signals?search=bitcoin

# Date ranges
GET /signals?posted_after=2025-01-01&posted_before=2025-01-31
```

---

## 📝 OpenAPI Specification

### Generate API Documentation

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: TradoSphere API
  version: 1.0.0
  description: Social trading platform API

servers:
  - url: https://api.tradosphere.com/api/v1
    description: Production
  - url: https://api-staging.tradosphere.com/api/v1
    description: Staging

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Signal:
      type: object
      properties:
        id:
          type: string
          format: uuid
        asset_symbol:
          type: string
          example: "BTC/USD"
        direction:
          type: string
          enum: [LONG, SHORT]
        entry_price:
          type: number
          format: double
        status:
          type: string
          enum: [active, hit, miss, cancelled]

paths:
  /signals:
    get:
      summary: List trading signals
      parameters:
        - in: query
          name: limit
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Signal'
```

### Generate Documentation Site

```bash
# Install Redoc
npm install -g redoc-cli

# Generate static HTML docs
redoc-cli bundle openapi.yaml -o docs/api-reference.html

# Serve documentation locally
npx @redocly/cli preview-docs openapi.yaml
```

---

## 🧪 API Testing

### Postman Collection

```json
{
  "info": {
    "name": "TradoSphere API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Signals",
      "item": [
        {
          "name": "List Signals",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/signals?limit=20",
              "host": ["{{baseUrl}}"],
              "path": ["signals"],
              "query": [
                {
                  "key": "limit",
                  "value": "20"
                }
              ]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://api.tradosphere.com/api/v1"
    }
  ]
}
```

---

## 📚 SDK Examples

### TypeScript SDK

```typescript
// lib/api/client.ts
export class TradoSphereAPI {
  private baseURL: string;
  private token?: string;

  constructor(config: { baseURL: string; token?: string }) {
    this.baseURL = config.baseURL;
    this.token = config.token;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error);
    }

    return response.json();
  }

  // Signals
  async listSignals(params?: ListSignalsParams) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<SignalsResponse>(`/signals?${query}`);
  }

  async createSignal(data: CreateSignalData) {
    return this.request<SignalResponse>('/signals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Competitions
  async listCompetitions(params?: ListCompetitionsParams) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<CompetitionsResponse>(`/competitions?${query}`);
  }

  async joinCompetition(id: string) {
    return this.request(`/competitions/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ accept_rules: true }),
    });
  }
}

// Usage
const api = new TradoSphereAPI({
  baseURL: 'https://api.tradosphere.com/api/v1',
  token: 'your-jwt-token',
});

const signals = await api.listSignals({ limit: 20, status: 'active' });
```

---

**This API documentation ensures consistency, discoverability, and proper integration across all platforms.**