import type { NextRequest } from 'next/server';
import { authenticateAgent, requireScope } from '@/lib/agent/guard';
import { errorJson, json, writeAudit } from '@/lib/agent/runtime';
import { NotFoundError, addComment } from '@/lib/launch-ops/repository';

export const dynamic = 'force-dynamic';

// POST /api/agent/v1/tasks/:id/comments  { body, kind? }
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateAgent(req);
  if (!auth.ok) return errorJson(auth.status, auth.error);
  if (!requireScope(auth.identity, 'notes:write')) return errorJson(403, 'insufficient_scope', { need: 'notes:write' });

  const { id } = await ctx.params;
  let body: { body?: string; kind?: string };
  try {
    body = await req.json();
  } catch {
    return errorJson(400, 'invalid_json');
  }
  if (!body.body || !body.body.trim()) return errorJson(422, 'empty_comment');

  try {
    await addComment(id, body.body.trim(), auth.identity.slug, body.kind ?? 'note');
    await writeAudit({ actor: auth.identity.slug, action: 'task.comment.add', entity: 'task', entityId: id, request: body });
    return json({ ok: true });
  } catch (e) {
    if (e instanceof NotFoundError) return errorJson(404, 'task_not_found');
    return errorJson(500, 'internal');
  }
}
