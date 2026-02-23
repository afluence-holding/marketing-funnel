import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import type { Database } from '../db/types';

/**
 * Public client — uses anon key, respects RLS policies.
 * Use for operations where the caller is an end-user or external source.
 */
export const supabase = createClient<Database, 'marketing'>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  db: { schema: 'marketing' },
});

/**
 * Admin client — uses service_role key, bypasses RLS.
 * Use for server-side operations (ingestion, routing, workflows).
 */
export const supabaseAdmin = createClient<Database, 'marketing'>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'marketing' },
  auth: { autoRefreshToken: false, persistSession: false },
});
