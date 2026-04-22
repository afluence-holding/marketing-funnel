import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdminForSchema } from '@marketing-funnel/db';

type CookieSet = { name: string; value: string; options?: CookieOptions };

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Supabase client bound to the current user session (via cookies).
 * Respects RLS. Use in server components and user-scoped API routes.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet: CookieSet[]) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server components can't set cookies; middleware refreshes the session.
          }
        },
      },
    },
  );
}

/** Service-role client scoped to meta_ops (bypasses RLS). Use in cron routes. */
export function getSupabaseMetaOps() {
  return supabaseAdminForSchema('meta_ops');
}

/** Service-role client scoped to marketing_ops (dashboard Fase 1 data source). */
export function getSupabaseMarketingOps() {
  return supabaseAdminForSchema('marketing_ops');
}
