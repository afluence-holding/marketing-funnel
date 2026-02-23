import { createClient } from '@supabase/supabase-js';
import { env } from '@marketing-funnel/config';
import type { Database } from './types';

/**
 * Public client — uses anon key, respects RLS policies.
 */
export const supabase = createClient<Database, 'marketing'>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  db: { schema: 'marketing' },
});

/**
 * Admin client — uses service_role key, bypasses RLS.
 */
export const supabaseAdmin = createClient<Database, 'marketing'>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'marketing' },
  auth: { autoRefreshToken: false, persistSession: false },
});
