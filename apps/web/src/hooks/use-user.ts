'use client';

import { useAuth } from '@/contexts/auth-context';
import type { SubscriptionTier } from '@tradosphere/types/models';

/**
 * Hook to access current user profile
 */
export function useUser() {
  const { user, profile, loading } = useAuth();

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    tier: profile?.tier || ('free' as SubscriptionTier),
    isCreator: profile?.isCreator || false,
  };
}

/**
 * Hook to check if user has required tier
 */
export function useRequireAuth(requiredTier?: SubscriptionTier) {
  const { user, profile, loading } = useAuth();

  const tierHierarchy: SubscriptionTier[] = ['free', 'tsgrow', 'elite', 'gladiator'];

  const hasAccess = () => {
    if (!requiredTier) return !!user;

    const userLevel = tierHierarchy.indexOf(profile?.tier || 'free');
    const requiredLevel = tierHierarchy.indexOf(requiredTier);

    return userLevel >= requiredLevel;
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    hasAccess: hasAccess(),
    requiredTier,
  };
}
