import type { NextRequest } from 'next/server';
import { authenticateAgent, requireScope } from '@/lib/agent/guard';
import { errorJson, getIdempotent, json, storeIdempotent, writeAudit } from '@/lib/agent/runtime';
import { NotFoundError, VersionConflictError, updateTaskStatus } from '@/lib/launch-ops/repository';
import type { TaskStatus } from '@/lib/launch-ops/types';

export const dynamic = 'force-dynamic';

const VALID_STATUS: TaskStatus[] = ['todo', 'doing', 'blocked', 'done'];
const MAX = 50;

interface Update {
  taskId: string;
  status?: TaskStatus;
  progressPct?: number;
  note?: string;
  expectedVersion?: number;
}

// POST /api/agent/v1/bulk-status  { updates: Update[] }  (max 50)
export async function POST(req: NextRequest) {
  const auth = await authenticateAgent(req);
  if (!auth.ok) return errorJson(auth.status, auth.error);
  if (!requireScope(auth.identity, 'status:write')) return errorJson(403, 'insufficient_scope', { need: 'status:write' });

  const idemKey = req.headers.get('idempotency-key');
  const cached = await getIdempotent(idemKey);
  if (cached) return json(cached as object, { headers: { 'Idempotency-Replayed': 'true' } });

  let body: { updates?: Update[] };
  try {
    body = await req.json();
  } catch {
    return errorJson(400, 'invalid_json');
  }
  const updates = body.updates ?? [];
  if (!Array.isArray(updates) || updates.length === 0) return errorJson(422, 'empty_updates');
  if (updates.length > MAX) return errorJson(422, 'too_many', { max: MAX });

  const results: Array<{ taskId: string; ok: boolean; error?: string; version?: number }> = [];
  for (const u of updates) {
    if (u.status != null && !VALID_STATUS.includes(u.status)) {
      results.push({ taskId: u.taskId, ok: false, error: 'invalid_status' });
      continue;
    }
    try {
      const task = await updateTaskStatus(u.taskId, {
        status: u.status,
        progressPct: u.progressPct,
        note: u.note,
        actor: auth.identity.slug,
        expectedVersion: u.expectedVersion,
      });
      results.push({ taskId: u.taskId, ok: true, version: task.version });
    } catch (e) {
      if (e instanceof VersionConflictError) results.push({ taskId: u.taskId, ok: false, error: 'version_conflict', version: e.currentVersion });
      else if (e instanceof NotFoundError) results.push({ taskId: u.taskId, ok: false, error: 'not_found' });
      else results.push({ taskId: u.taskId, ok: false, error: 'internal' });
    }
  }

  await writeAudit({
    actor: auth.identity.slug,
    action: 'task.status.bulk',
    entity: 'task',
    idempotencyKey: idemKey,
    request: { count: updates.length },
  });

  const payload = { count: results.length, results };
  await storeIdempotent(idemKey, 'task.status.bulk', payload);
  return json(payload);
}
