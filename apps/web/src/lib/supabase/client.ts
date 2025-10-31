import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@tradosphere/types/database';

/**
 * Supabase client for browser/client-side usage
 * Used in client components and hooks
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
