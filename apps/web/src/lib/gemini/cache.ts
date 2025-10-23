/**
 * Gemini Response Cache
 * Caches AI responses to reduce API costs and improve performance
 */

import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  hits: number;
}

class GeminiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly cleanupInterval: NodeJS.Timeout;

  // Cache TTL by operation type
  private readonly TTL = {
    signalParse: 300000, // 5 minutes (signals change frequently)
    tradeAnalysis: 900000, // 15 minutes
    chatSummary: 1800000, // 30 minutes
    learnQA: 3600000, // 1 hour (educational content)
    marketContext: 600000, // 10 minutes
  };

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000);
  }

  /**
   * Generate cache key from input
   */
  private generateKey(operation: string, input: any): string {
    const inputStr = JSON.stringify(input);
    const hash = crypto.createHash('sha256').update(inputStr).digest('hex');
    return `${operation}:${hash}`;
  }

  /**
   * Get cached response
   */
  get<T>(operation: keyof typeof this.TTL, input: any): T | null {
    const key = this.generateKey(operation, input);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() >= entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit counter
    entry.hits++;

    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  set<T>(operation: keyof typeof this.TTL, input: any, data: T): void {
    const key = this.generateKey(operation, input);
    const ttl = this.TTL[operation];

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      hits: 0,
    });
  }

  /**
   * Check if entry exists and is valid
   */
  has(operation: keyof typeof this.TTL, input: any): boolean {
    const key = this.generateKey(operation, input);
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() >= entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(operation: string, input: any): void {
    const key = this.generateKey(operation, input);
    this.cache.delete(key);
  }

  /**
   * Invalidate all entries for an operation
   */
  invalidateOperation(operation: string): void {
    const prefix = `${operation}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    operations: Record<string, { count: number; totalHits: number }>;
  } {
    const stats: Record<string, { count: number; totalHits: number }> = {};

    for (const [key, entry] of this.cache.entries()) {
      const operation = key.split(':')[0];
      if (!stats[operation]) {
        stats[operation] = { count: 0, totalHits: 0 };
      }
      stats[operation].count++;
      stats[operation].totalHits += entry.hits;
    }

    return {
      size: this.cache.size,
      operations: stats,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Singleton instance
export const geminiCache = new GeminiCache();

/**
 * Cache decorator for Gemini API calls
 */
export function withCache<T>(
  operation: keyof typeof geminiCache['TTL'],
  apiCall: (input: any) => Promise<T>,
) {
  return async (input: any): Promise<T> => {
    // Check cache first
    const cached = geminiCache.get<T>(operation, input);
    if (cached !== null) {
      return cached;
    }

    // Call API
    const result = await apiCall(input);

    // Cache result
    geminiCache.set(operation, input, result);

    return result;
  };
}

/**
 * Calculate cost savings from cache
 */
export function calculateCacheSavings(): {
  totalHits: number;
  estimatedSavings: string;
} {
  const stats = geminiCache.getStats();
  let totalHits = 0;

  for (const operation of Object.values(stats.operations)) {
    totalHits += operation.totalHits;
  }

  // Estimate: Gemini 2.0 Flash costs ~$0.00015 per request
  const estimatedSavings = (totalHits * 0.00015).toFixed(2);

  return {
    totalHits,
    estimatedSavings: `$${estimatedSavings}`,
  };
}
