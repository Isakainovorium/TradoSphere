/**
 * General Helper Utilities
 * Miscellaneous helper functions used across the application
 */

import type { RankTier } from '@tradosphere/types/competitions';
import type { SubscriptionTier, TradeDirection, SignalStatus } from '@tradosphere/types/models';
import { RANK_THRESHOLDS } from '@tradosphere/types/competitions';

// =====================================================
// DATE & TIME HELPERS
// =====================================================

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

/**
 * Format duration in hours to readable text
 */
export function formatDuration(hours: number): string {
  if (hours < 1) return `${hours * 60} minutes`;
  if (hours === 1) return '1 hour';
  if (hours < 24) return `${hours} hours`;
  if (hours === 24) return '1 day';
  if (hours < 168) return `${Math.floor(hours / 24)} days`;
  return `${Math.floor(hours / 168)} weeks`;
}

/**
 * Format date range for competition display
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sameDay =
    startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

// =====================================================
// NUMBER FORMATTING
// =====================================================

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

/**
 * Format percentage with sign and color class
 */
export function formatPercentage(
  value: number,
  decimals: number = 2,
): { text: string; className: string } {
  const sign = value >= 0 ? '+' : '';
  const text = `${sign}${value.toFixed(decimals)}%`;
  const className = value > 0 ? 'text-profit' : value < 0 ? 'text-loss' : 'text-neutral';

  return { text, className };
}

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return (wins / total) * 100;
}

// =====================================================
// RANKING & XP HELPERS
// =====================================================

/**
 * Get rank info from XP amount
 */
export function getRankFromXp(xp: number): {
  rank: RankTier;
  tierNumber: number;
  emoji: string;
  color: string;
  progress: number;
  xpToNext: number;
} {
  const rankInfo = RANK_THRESHOLDS.find(
    (threshold) => xp >= threshold.minXp && xp <= threshold.maxXp,
  ) || RANK_THRESHOLDS[0];

  const xpInRank = xp - rankInfo.minXp;
  const xpRangeInRank = rankInfo.maxXp - rankInfo.minXp;
  const progress = (xpInRank / xpRangeInRank) * 100;
  const xpToNext = rankInfo.maxXp - xp;

  return {
    rank: rankInfo.tier,
    tierNumber: rankInfo.tierNumber,
    emoji: rankInfo.emoji,
    color: rankInfo.color,
    progress: Math.min(progress, 100),
    xpToNext: Math.max(xpToNext, 0),
  };
}

/**
 * Get XP change color class
 */
export function getXpChangeClass(xpChange: number): string {
  if (xpChange > 0) return 'text-profit';
  if (xpChange < 0) return 'text-loss';
  return 'text-neutral';
}

// =====================================================
// SUBSCRIPTION TIER HELPERS
// =====================================================

/**
 * Check if tier has feature access
 */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier,
): boolean {
  const tierHierarchy: SubscriptionTier[] = ['free', 'tsgrow', 'elite', 'gladiator'];
  const userLevel = tierHierarchy.indexOf(userTier);
  const requiredLevel = tierHierarchy.indexOf(requiredTier);

  return userLevel >= requiredLevel;
}

/**
 * Get tier badge color
 */
export function getTierBadgeColor(tier: SubscriptionTier): string {
  const colors = {
    free: 'bg-gray-500',
    tsgrow: 'bg-blue-500',
    elite: 'bg-purple-500',
    gladiator: 'bg-yellow-500',
  };

  return colors[tier] || colors.free;
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const names = {
    free: 'Free',
    tsgrow: 'TS Grow',
    elite: 'TS Elite',
    gladiator: 'TS Gladiator',
  };

  return names[tier] || 'Free';
}

// =====================================================
// SIGNAL HELPERS
// =====================================================

/**
 * Calculate P&L from entry/exit prices
 */
export function calculatePnL(
  direction: TradeDirection,
  entryPrice: number,
  exitPrice: number,
  positionSize: number = 1,
): number {
  if (direction === 'long') {
    return (exitPrice - entryPrice) * positionSize;
  } else {
    return (entryPrice - exitPrice) * positionSize;
  }
}

/**
 * Calculate R:R ratio
 */
export function calculateRiskReward(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);

  if (risk === 0) return 0;
  return reward / risk;
}

/**
 * Get signal status badge color
 */
export function getSignalStatusColor(status: SignalStatus): string {
  const colors = {
    active: 'bg-blue-500',
    closed: 'bg-green-500',
    cancelled: 'bg-gray-500',
  };

  return colors[status] || colors.active;
}

/**
 * Get direction badge color
 */
export function getDirectionColor(direction: TradeDirection): string {
  return direction === 'long' ? 'text-profit' : 'text-loss';
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate trading symbol format
 */
export function isValidSymbol(symbol: string): boolean {
  // Basic validation: 2-10 uppercase letters/numbers
  return /^[A-Z0-9]{2,10}$/.test(symbol);
}

/**
 * Validate price (must be positive)
 */
export function isValidPrice(price: number): boolean {
  return price > 0 && isFinite(price);
}

/**
 * Validate stop loss placement
 */
export function isValidStopLoss(
  direction: TradeDirection,
  entryPrice: number,
  stopLoss: number,
): boolean {
  if (!isValidPrice(stopLoss)) return false;

  if (direction === 'long') {
    return stopLoss < entryPrice; // SL must be below entry for longs
  } else {
    return stopLoss > entryPrice; // SL must be above entry for shorts
  }
}

/**
 * Validate take profit placement
 */
export function isValidTakeProfit(
  direction: TradeDirection,
  entryPrice: number,
  takeProfit: number,
): boolean {
  if (!isValidPrice(takeProfit)) return false;

  if (direction === 'long') {
    return takeProfit > entryPrice; // TP must be above entry for longs
  } else {
    return takeProfit < entryPrice; // TP must be below entry for shorts
  }
}

// =====================================================
// STRING HELPERS
// =====================================================

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Generate random ID (for client-side temporary IDs)
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
}

// =====================================================
// ARRAY HELPERS
// =====================================================

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Sort by multiple fields
 */
export function multiSort<T>(
  array: T[],
  sortFns: Array<(a: T, b: T) => number>,
): T[] {
  return array.sort((a, b) => {
    for (const fn of sortFns) {
      const result = fn(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

// =====================================================
// ERROR HANDLING
// =====================================================

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

// =====================================================
// DEBOUNCE & THROTTLE
// =====================================================

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
