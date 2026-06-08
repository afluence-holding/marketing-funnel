import type { NextRequest } from 'next/server';
import { authenticateAgent, requireScope } from '@/lib/agent/guard';
import { errorJson, json } from '@/lib/agent/runtime';
import { getLaunchOverview, resolveLaunch } from '@/lib/launch-ops/repository';

export const dynamic = 'force-dynamic';

// GET /api/agent/v1/tasks?launch=DI21-C2&phase=F0&status=todo&owner=nico&channel=Email&blocked=1&q=hyros&limit=50
export async function GET(req: NextRequest) {
  const auth = await authenticateAgent(req);
  if (!auth.ok) return errorJson(auth.status, auth.error);
  if (!requireScope(auth.identity, 'tasks:read')) return errorJson(403, 'insufficient_scope', { need: 'tasks:read' });

  const sp = req.nextUrl.searchParams;
  const launch = await resolveLaunch(sp.get('launch'));
  if (!launch) return errorJson(404, 'launch_not_found');

  const overview = await getLaunchOverview(launch.id);
  let tasks = overview.tasks;

  const phase = sp.get('phase');
  const status = sp.get('status');
  const owner = sp.get('owner');
  const channel = sp.get('channel');
  const blocked = sp.get('blocked');
  const q = sp.get('q');
  const limit = Number(sp.get('limit') ?? '0');

  if (phase) tasks = tasks.filter((t) => t.phaseCode === phase);
  if (status) tasks = tasks.filter((t) => t.status === status);
  if (owner) tasks = tasks.filter((t) => t.owners.some((o) => o.ownerKey === owner));
  if (channel) tasks = tasks.filter((t) => t.channel === channel);
  if (blocked === '1' || blocked === 'true') tasks = tasks.filter((t) => t.status === 'blocked');
  if (q) {
    const needle = q.toLowerCase();
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(needle) || (t.objective ?? '').toLowerCase().includes(needle));
  }
  if (limit > 0) tasks = tasks.slice(0, limit);

  return json({ launch: { id: launch.id, code: launch.code }, count: tasks.length, tasks });
}
