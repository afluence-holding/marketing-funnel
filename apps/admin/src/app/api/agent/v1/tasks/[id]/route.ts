import type { NextRequest } from 'next/server';
import { authenticateAgent, requireScope } from '@/lib/agent/guard';
import { errorJson, getIdempotent, json, parseIfMatch, storeIdempotent, writeAudit } from '@/lib/agent/runtime';
import {
  NotFoundError,
  VersionConflictError,
  getLaunchOverview,
  resolveLaunch,
  updateTaskStatus,
} from '@/lib/launch-ops/repository';
import type { TaskStatus } from '@/lib/launch-ops/types';

export const dynamic = 'force-dynamic';

const VALID_STATUS: TaskStatus[] = ['todo', 'doing', 'blocked', 'done'];

async function findTask(taskId: string) {
  // resolve across launches the simple way: scan the active launch first.
  const launch = await resolveLaunch();
  if (!launch) return null;
  const overview = await getLaunchOverview(launch.id);
  return overview.tasks.find((t) => t.id === taskId) ?? null;
}

// GET /api/agent/v1/tasks/:id
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateAgent(req);
  if (!auth.ok) return errorJson(auth.status, auth.error);
  if (!requireScope(auth.identity, 'tasks:read')) return errorJson(403, 'insufficient_scope', { need: 'tasks:read' });

  const { id } = await ctx.params;
  const task = await findTask(id);
  if (!task) return errorJson(404, 'task_not_found');
  return json({ task }, { headers: { ETag: `"${task.version}"` } });
}

// PATCH /api/agent/v1/tasks/:id  { status?, progressPct?, note? }
// Headers: If-Match: "<version>" (optimistic lock), Idempotency-Key: <key>
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateAgent(req);
  if (!auth.ok) return errorJson(auth.status, auth.error);
  if (!requireScope(auth.identity, 'status:write')) return errorJson(403, 'insufficient_scope', { need: 'status:write' });

  const { id } = await ctx.params;
  const idemKey = req.headers.get('idempotency-key');

  const cached = await getIdempotent(idemKey);
  if (cached) return json(cached as object, { headers: { 'Idempotency-Replayed': 'true' } });

  let body: { status?: string; progressPct?: number; note?: string };
  try {
    body = await req.json();
  } catch {
    return errorJson(400, 'invalid_json');
  }

  if (body.status != null && !VALID_STATUS.includes(body.status as TaskStatus)) {
    return errorJson(422, 'invalid_status', { allowed: VALID_STATUS });
  }
  if (body.progressPct != null && (typeof body.progressPct !== 'number' || body.progressPct < 0 || body.progressPct > 100)) {
    return errorJson(422, 'invalid_progress');
  }
  if (body.status == null && body.progressPct == null && !body.note) {
    return errorJson(422, 'empty_update');
  }

  const expectedVersion = parseIfMatch(req);

  try {
    const task = await updateTaskStatus(id, {
      status: body.status as TaskStatus | undefined,
      progressPct: body.progressPct,
      note: body.note,
      actor: auth.identity.slug,
      expectedVersion: expectedVersion ?? undefined,
    });
    await writeAudit({
      actor: auth.identity.slug,
      action: 'task.status.update',
      entity: 'task',
      entityId: id,
      idempotencyKey: idemKey,
      request: body,
    });
    const payload = { task };
    await storeIdempotent(idemKey, 'task.status.update', payload);
    return json(payload, { headers: { ETag: `"${task.version}"` } });
  } catch (e) {
    if (e instanceof VersionConflictError) {
      return errorJson(409, 'version_conflict', { currentVersion: e.currentVersion });
    }
    if (e instanceof NotFoundError) return errorJson(404, 'task_not_found');
    return errorJson(500, 'internal');
  }
}
