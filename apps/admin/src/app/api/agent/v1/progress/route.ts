import type { NextRequest } from 'next/server';
import { authenticateAgent, requireScope } from '@/lib/agent/guard';
import { errorJson, json } from '@/lib/agent/runtime';
import { getLaunchOverview, resolveLaunch } from '@/lib/launch-ops/repository';

export const dynamic = 'force-dynamic';

// GET /api/agent/v1/progress?launch=DI21-C2
export async function GET(req: NextRequest) {
  const auth = await authenticateAgent(req);
  if (!auth.ok) return errorJson(auth.status, auth.error);
  if (!requireScope(auth.identity, 'progress:read')) return errorJson(403, 'insufficient_scope', { need: 'progress:read' });

  const launch = await resolveLaunch(req.nextUrl.searchParams.get('launch'));
  if (!launch) return errorJson(404, 'launch_not_found');

  const overview = await getLaunchOverview(launch.id);
  return json({
    launch: { id: launch.id, code: launch.code, name: launch.name },
    progress: overview.progress,
    kpis: overview.kpis.map((k) => ({ key: k.key, label: k.label, value: k.value, target: k.targetLabel })),
  });
}
