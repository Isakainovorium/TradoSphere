# Stripe MCP - Payment Integration

**Purpose:** Manage subscriptions, test webhooks, and handle payments via natural language

## Overview

Stripe MCP enables comprehensive payment system management through Claude. Essential for testing payment flows, managing subscriptions, and debugging payment issues.

## Installation

```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp-server"],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_your_key_here"
      }
    }
  }
}
```

**Note:** Use test key for development!

## Getting API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Secret key** (starts with `sk_test_`)
3. Never use production keys in development!

## TradoSphere Use Cases

### Testing Subscriptions
```
"Create test subscription for user_123 at $10/month (TS Grow)"
"Cancel subscription sub_abc123"
"Update subscription to TS Elite ($15/month)"
"Check subscription status for user_456"
```

### Webhook Testing
```
"Test webhook: checkout.session.completed"
"Simulate failed payment event"
"Send customer.subscription.deleted webhook"
"Test invoice.payment_succeeded event"
```

### Creator Payouts
```
"Check connected account status for creator_789"
"Generate Connect dashboard link for creator_789"
"Simulate payout to creator"
"List pending payouts"
```

### Payment Analysis
```
"Query failed payments last 7 days"
"Show subscription churn rate this month"
"List customers with payment method expiring soon"
"Get revenue breakdown by tier"
```

## TradoSphere Pricing Structure

```yaml
Tiers:
  TS Free: $0/month
  TS Grow: $5/month (price_grow_monthly)
  TS Elite: $10/month (price_elite_monthly)
  TS Gladiator: $15/month (price_gladiator_monthly)
  TS Legend: Earned (no payment)

Creator Subscriptions:
  price_custom_monthly: $5-50/month (set by creator)
  Platform fee: 10% of subscription

Competition Entry Fees:
  one_time_payment: $10-1000 (varies by competition)
  Platform fee: 5% of entry fee
```

## Example Operations

### Creating a Test Subscription

**Request:**
```
"Create test subscription:
- User: user_test_123
- Tier: TS Elite
- Price: $10/month
- Start immediately"
```

**Process:**
```typescript
// 1. Create customer
const customer = await stripe.customers.create({
  email: 'test@tradosphere.com',
  metadata: {
    user_id: 'user_test_123',
    tier: 'elite'
  }
});

// 2. Create test payment method
const paymentMethod = await stripe.paymentMethods.create({
  type: 'card',
  card: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  }
});

// 3. Attach payment method
await stripe.paymentMethods.attach(paymentMethod.id, {
  customer: customer.id
});

// 4. Create subscription
const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: 'price_elite_monthly' }],
  default_payment_method: paymentMethod.id,
  metadata: {
    user_id: 'user_test_123',
    tier: 'elite'
  }
});

// Result:
{
  id: 'sub_abc123',
  status: 'active',
  current_period_start: 1234567890,
  current_period_end: 1237159890
}
```

### Testing Webhook Events

**Request:**
```
"Test webhook: customer.subscription.created"
```

**Generated Webhook:**
```json
{
  "id": "evt_test_123",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_test_123",
      "customer": "cus_test_123",
      "status": "active",
      "items": {
        "data": [{
          "price": {
            "id": "price_elite_monthly",
            "unit_amount": 1000,
            "currency": "usd"
          }
        }]
      },
      "metadata": {
        "user_id": "user_123",
        "tier": "elite"
      }
    }
  }
}
```

**Sends to:** `https://yourdomain.com/api/webhooks/stripe`

### Creator Connect Onboarding

**Request:**
```
"Generate Stripe Connect onboarding link for creator_789"
```

**Process:**
```typescript
// 1. Create connected account
const account = await stripe.accounts.create({
  type: 'express',
  country: 'US',
  email: 'creator@tradosphere.com',
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true }
  },
  metadata: {
    user_id: 'creator_789',
    platform: 'tradosphere'
  }
});

// 2. Create account link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: 'https://tradosphere.com/creator/settings/payouts',
  return_url: 'https://tradosphere.com/creator/settings/payouts/complete',
  type: 'account_onboarding'
});

// Result:
{
  url: 'https://connect.stripe.com/setup/s/abc123xyz',
  expires_at: 1234567890
}
```

### Handling Failed Payments

**Request:**
```
"Show failed payments last 7 days"
```

**Query:**
```typescript
const charges = await stripe.charges.list({
  created: {
    gte: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60
  },
  limit: 100
});

const failed = charges.data.filter(c => c.status === 'failed');

// Analysis:
{
  total_failed: 12,
  reasons: {
    'card_declined': 7,
    'insufficient_funds': 3,
    'expired_card': 2
  },
  actions_taken: [
    'Email sent to update payment method',
    'Subscription marked as past_due',
    'Grace period started (3 days)'
  ]
}
```

## Test Cards

### Success Scenarios
```
4242 4242 4242 4242  - Always succeeds
4000 0025 0000 3155  - Requires 3D Secure
```

### Failure Scenarios
```
4000 0000 0000 0002  - Card declined
4000 0000 0000 9995  - Insufficient funds
4000 0000 0000 0069  - Expired card
4000 0000 0000 0127  - Incorrect CVC
```

## Webhook Events to Handle

```typescript
// Subscription lifecycle
'customer.subscription.created'
'customer.subscription.updated'
'customer.subscription.deleted'

// Payment events
'invoice.payment_succeeded'
'invoice.payment_failed'
'charge.succeeded'
'charge.failed'

// Checkout events
'checkout.session.completed'
'checkout.session.expired'

// Connect events
'account.updated'
'payout.paid'
'payout.failed'
```

## Best Practices

1. **Always Use Test Mode** - Never test with real cards
2. **Handle All Webhook Events** - Payment failures, cancellations
3. **Implement Idempotency** - Use idempotency keys
4. **Validate Webhooks** - Verify webhook signatures
5. **Log Everything** - Track all payment events

## Subscription Management

### Upgrade Flow
```typescript
// User upgrades Free → Grow
const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: 'price_grow_monthly' }],
  trial_period_days: 0,
  proration_behavior: 'create_prorations'
});
```

### Downgrade Flow
```typescript
// User downgrades Elite → Grow
const subscription = await stripe.subscriptions.update(
  subscription.id,
  {
    items: [{
      id: subscription.items.data[0].id,
      price: 'price_grow_monthly'
    }],
    proration_behavior: 'create_prorations'
  }
);
```

### Cancellation Flow
```typescript
// Cancel at period end (keep access until then)
const subscription = await stripe.subscriptions.update(
  subscription.id,
  {
    cancel_at_period_end: true
  }
);
```

## Creator Monetization

### Subscription Pricing
```typescript
// Creator sets $25/month subscription
const price = await stripe.prices.create({
  unit_amount: 2500,
  currency: 'usd',
  recurring: { interval: 'month' },
  product: creator_product_id,
  metadata: {
    creator_id: 'creator_789',
    type: 'subscription'
  }
});
```

### Application Fee (10%)
```typescript
// Subscriber pays $25, creator gets $22.50
const subscription = await stripe.subscriptions.create({
  customer: subscriber_id,
  items: [{ price: creator_price_id }],
  application_fee_percent: 10,
  transfer_data: {
    destination: creator_account_id
  }
});
```

## Troubleshooting

### Webhook Not Received
- Check webhook endpoint is publicly accessible
- Verify webhook signature validation
- Check Stripe dashboard for delivery attempts

### Payment Failed
- Validate payment method
- Check for card-specific issues
- Review error codes
- Implement retry logic

### Subscription Not Created
- Verify price ID exists
- Check customer has payment method
- Review error response
- Check API version compatibility

## Integration with Development Flow

```
Implement Payment → Test Locally (Stripe MCP) →
Test Webhooks → Deploy to Staging →
Test with Test Cards → Deploy to Production
```

---

**Priority:** MEDIUM
**When to Install:** Week 3 (Domain Tools)
**Velocity Impact:** 3x faster payment testing
**Quality Impact:** Catch payment issues before production
**Revenue Impact:** Better subscription management = less churn
