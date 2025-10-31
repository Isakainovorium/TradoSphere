'use client';

import Link from 'next/link';
import { useUser } from '@/hooks/use-user';

/**
 * AuthButton Component
 * Shows Login/Signup buttons for unauthenticated users
 * Shows user menu for authenticated users
 */
export function AuthButton() {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
    );
  }

  if (isAuthenticated) {
    return null; // Use UserMenu component separately
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Sign up
      </Link>
    </div>
  );
}
