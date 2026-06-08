/**
 * Agent runtime helpers: idempotency store, audit log, JSON responses.
 * Backed by launch_ops.idempotency_key + launch_ops.audit_log via service role.
 */
import { NextResponse } from 'next/server';
import { getSupabaseLaunchOps } from '@/lib/supabase/server';

export function json(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
  return NextResponse.json(body, { status: init?.status ?? 200, headers: init?.headers });
}

export function errorJson(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

/** Returns a previously stored response for an idempotency key, or null. */
export async function getIdempotent(key: string | null): Promise<unknown | null> {
  if (!key) return null;
  const db = getSupabaseLaunchOps();
  const { data } = await db.from('idempotency_key').select('response').eq('key', key).maybeSingle();
  return data ? (data as any).response : null;
}

export async function storeIdempotent(key: string | null, scope: string, response: unknown): Promise<void> {
  if (!key) return;
  const db = getSupabaseLaunchOps();
  await db.from('idempotency_key').upsert({ key, scope, response }, { onConflict: 'key' });
}

export async function writeAudit(input: {
  actor: string;
  action: string;
  entity?: string;
  entityId?: string;
  idempotencyKey?: string | null;
  request?: unknown;
}): Promise<void> {
  const db = getSupabaseLaunchOps();
  await db.from('audit_log').insert({
    actor: input.actor,
    actor_type: input.actor.startsWith('claude:') || input.actor.endsWith(':agent') ? 'agent' : 'human',
    action: input.action,
    entity: input.entity ?? null,
    entity_id: input.entityId ?? null,
    idempotency_key: input.idempotencyKey ?? null,
    request: input.request ?? null,
  });
}

/** Parse an If-Match header value into an integer version (or null). */
export function parseIfMatch(req: Request): number | null {
  const v = req.headers.get('if-match');
  if (!v) return null;
  const n = Number(v.replace(/"/g, '').trim());
  return Number.isInteger(n) ? n : null;
}
