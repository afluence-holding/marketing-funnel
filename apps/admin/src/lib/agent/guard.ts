/**
 * Agent authentication + authorization guard.
 *
 * The Launch Ops agent (e.g. Claude) authenticates with a Bearer token. The
 * token is NEVER the Supabase service_role. Two resolution strategies:
 *
 *   1. Env bootstrap: LAUNCH_OPS_AGENT_TOKEN (+ LAUNCH_OPS_AGENT_SCOPES csv).
 *   2. DB-backed: sha256(token) matched against backoffice.service_identity
 *      (active row), reading its scopes + tenant. Preferred for rotation.
 *
 * Scope enforcement is explicit (requireScope) so a leaked token can only do
 * what its scopes allow. No delete scope is ever granted.
 */
import crypto from 'node:crypto';
import { getSupabaseBackoffice } from '@/lib/supabase/server';

export type AgentScope =
  | 'tasks:read'
  | 'status:write'
  | 'notes:write'
  | 'progress:read';

export interface AgentIdentity {
  slug: string;
  scopes: AgentScope[];
  tenantId: string | null;
}

export type AuthResult =
  | { ok: true; identity: AgentIdentity }
  | { ok: false; status: number; error: string };

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function bearer(req: Request): string | null {
  const h = req.headers.get('authorization') ?? '';
  if (!h.startsWith('Bearer ')) return null;
  const t = h.slice('Bearer '.length).trim();
  return t.length ? t : null;
}

export async function authenticateAgent(req: Request): Promise<AuthResult> {
  const token = bearer(req);
  if (!token) return { ok: false, status: 401, error: 'missing_bearer' };

  // Strategy 1: env bootstrap token
  const envToken = process.env.LAUNCH_OPS_AGENT_TOKEN;
  if (envToken && safeEqual(token, envToken)) {
    const scopes = (process.env.LAUNCH_OPS_AGENT_SCOPES ?? 'tasks:read,status:write,notes:write,progress:read')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean) as AgentScope[];
    return {
      ok: true,
      identity: { slug: process.env.LAUNCH_OPS_AGENT_SLUG ?? 'claude:launch-ops-agent', scopes, tenantId: null },
    };
  }

  // Strategy 2: DB-backed service_identity (hashed)
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  try {
    const db = getSupabaseBackoffice();
    const { data } = await db
      .from('service_identity')
      .select('slug, scopes, tenant_id, active')
      .eq('token_hash', hash)
      .eq('active', true)
      .maybeSingle();
    if (data) {
      // best-effort last_used_at touch (ignore failures)
      void db.from('service_identity').update({ last_used_at: new Date().toISOString() }).eq('token_hash', hash);
      return {
        ok: true,
        identity: {
          slug: (data as any).slug,
          scopes: ((data as any).scopes ?? []) as AgentScope[],
          tenantId: (data as any).tenant_id ?? null,
        },
      };
    }
  } catch {
    // fall through to unauthorized
  }

  return { ok: false, status: 401, error: 'invalid_token' };
}

export function requireScope(identity: AgentIdentity, scope: AgentScope): boolean {
  return identity.scopes.includes(scope);
}
