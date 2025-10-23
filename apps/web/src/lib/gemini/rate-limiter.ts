/**
 * Gemini API Rate Limiter
 * CRITICAL: Prevents API abuse and manages costs
 *
 * Free tier users: 5 requests/day
 * TSGrow users: Use own API key (unlimited)
 * Elite+ users: Unlimited platform requests
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class GeminiRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly cleanupInterval: NodeJS.Timeout;

  // Rate limits by tier
  private readonly TIER_LIMITS = {
    free: { requests: 5, window: 86400000 }, // 5 per day
    tsgrow: { requests: 0, window: 0 }, // Own key
    elite: { requests: 1000, window: 86400000 }, // 1000 per day
    gladiator: { requests: 10000, window: 86400000 }, // Unlimited (10k cap for safety)
  };

  constructor() {
    // Clean up expired entries every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 3600000);
  }

  /**
   * Check if user can make a request
   */
  async checkLimit(
    userId: string,
    userTier: 'free' | 'tsgrow' | 'elite' | 'gladiator' = 'free',
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
    message?: string;
  }> {
    // TSGrow uses own key
    if (userTier === 'tsgrow') {
      return {
        allowed: false,
        remaining: 0,
        resetAt: 0,
        message: 'Please use your own Gemini API key',
      };
    }

    const limit = this.TIER_LIMITS[userTier];
    const key = `${userId}:${userTier}`;
    const now = Date.now();

    let entry = this.limits.get(key);

    // Create or reset entry if expired
    if (!entry || now >= entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + limit.window,
      };
      this.limits.set(key, entry);
    }

    // Check if under limit
    if (entry.count < limit.requests) {
      entry.count++;
      const remaining = limit.requests - entry.count;

      return {
        allowed: true,
        remaining,
        resetAt: entry.resetAt,
      };
    }

    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      message: `Rate limit exceeded. ${this.getResetMessage(entry.resetAt)}`,
    };
  }

  /**
   * Get current usage for user
   */
  getUsage(
    userId: string,
    userTier: 'free' | 'tsgrow' | 'elite' | 'gladiator',
  ): {
    used: number;
    limit: number;
    remaining: number;
    resetAt: number;
  } {
    const limit = this.TIER_LIMITS[userTier];
    const key = `${userId}:${userTier}`;
    const entry = this.limits.get(key);

    if (!entry || Date.now() >= entry.resetAt) {
      return {
        used: 0,
        limit: limit.requests,
        remaining: limit.requests,
        resetAt: Date.now() + limit.window,
      };
    }

    return {
      used: entry.count,
      limit: limit.requests,
      remaining: Math.max(0, limit.requests - entry.count),
      resetAt: entry.resetAt,
    };
  }

  /**
   * Reset rate limit for a user (admin only)
   */
  reset(userId: string, userTier: string): void {
    const key = `${userId}:${userTier}`;
    this.limits.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetAt) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Get human-readable reset message
   */
  private getResetMessage(resetAt: number): string {
    const hoursLeft = Math.ceil((resetAt - Date.now()) / 3600000);
    if (hoursLeft === 1) {
      return 'Resets in 1 hour';
    }
    if (hoursLeft < 24) {
      return `Resets in ${hoursLeft} hours`;
    }
    return 'Resets tomorrow';
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Singleton instance
export const geminiRateLimiter = new GeminiRateLimiter();

/**
 * Middleware helper for API routes
 */
export async function checkGeminiRateLimit(
  userId: string,
  userTier: 'free' | 'tsgrow' | 'elite' | 'gladiator',
): Promise<{
  allowed: boolean;
  status?: number;
  error?: string;
  headers?: Record<string, string>;
}> {
  const result = await geminiRateLimiter.checkLimit(userId, userTier);

  if (!result.allowed) {
    return {
      allowed: false,
      status: 429,
      error: result.message || 'Rate limit exceeded',
      headers: {
        'X-RateLimit-Limit': geminiRateLimiter.getUsage(userId, userTier).limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toString(),
      },
    };
  }

  return {
    allowed: true,
    headers: {
      'X-RateLimit-Limit': geminiRateLimiter.getUsage(userId, userTier).limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetAt.toString(),
    },
  };
}
