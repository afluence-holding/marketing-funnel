/**
 * Launch Ops — repository (data access).
 *
 * Reads/writes via the service-role launch_ops client. All mutations write an
 * `updated_by` actor (the DB trigger derives human vs agent + records history),
 * and task updates support optimistic concurrency via the `version` column.
 *
 * This module is the ONLY place that knows the physical row shape; the UI and
 * the agent API consume the mapped domain types from ./types.
 */
import { getSupabaseLaunchOps } from '@/lib/supabase/server';
import type {
  ContentItem,
  Kpi,
  Launch,
  LaunchOverview,
  MessageAsset,
  Phase,
  PhaseProgress,
  Resource,
  Task,
  TaskStatus,
} from './types';

type Row = Record<string, any>;

export class NotFoundError extends Error {}
export class VersionConflictError extends Error {
  constructor(public currentVersion: number) {
    super('Version conflict');
  }
}

function mapLaunch(r: Row): Launch {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    brand: r.brand ?? null,
    organizerSlug: r.organizer_slug ?? null,
    buSlug: r.bu_slug ?? null,
    status: r.status,
    startsOn: r.starts_on ?? null,
    endsOn: r.ends_on ?? null,
    config: (r.config ?? {}) as Record<string, unknown>,
  };
}

/** Resolve a launch by (organizer, bu) slug, falling back to code. */
export async function getLaunchByBu(organizerSlug: string, buSlug: string): Promise<Launch | null> {
  const db = getSupabaseLaunchOps();
  const { data, error } = await db
    .from('launch')
    .select('*')
    .eq('organizer_slug', organizerSlug)
    .eq('bu_slug', buSlug)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapLaunch(data as Row) : null;
}

export async function getLaunchByCode(code: string): Promise<Launch | null> {
  const db = getSupabaseLaunchOps();
  const { data, error } = await db.from('launch').select('*').eq('code', code).maybeSingle();
  if (error) throw error;
  return data ? mapLaunch(data as Row) : null;
}

/** Resolve a launch by code, or fall back to the single active launch. */
export async function resolveLaunch(code?: string | null): Promise<Launch | null> {
  if (code) return getLaunchByCode(code);
  const db = getSupabaseLaunchOps();
  const { data, error } = await db
    .from('launch')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapLaunch(data as Row) : null;
}

function computeProgress(tasks: Task[], phases: Phase[]): LaunchOverview['progress'] {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const byPhase: PhaseProgress[] = phases
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((p) => {
      const ph = tasks.filter((t) => t.phaseCode === p.code);
      const d = ph.filter((t) => t.status === 'done').length;
      return {
        phaseCode: p.code,
        total: ph.length,
        done: d,
        pct: ph.length ? Math.round((d / ph.length) * 100) : 0,
      };
    });
  return {
    overallPct: total ? Math.round((done / total) * 100) : 0,
    totalTasks: total,
    doneTasks: done,
    byPhase,
  };
}

/** Load the full launch overview in a handful of batched queries. */
export async function getLaunchOverview(launchId: string): Promise<LaunchOverview> {
  const db = getSupabaseLaunchOps();

  const [launchRes, phaseRes, taskRes, kpiRes, resRes, contentRes, msgRes] = await Promise.all([
    db.from('launch').select('*').eq('id', launchId).maybeSingle(),
    db.from('phase').select('*').eq('launch_id', launchId).order('position'),
    db.from('task').select('*').eq('launch_id', launchId).order('position'),
    db.from('kpi').select('*').eq('launch_id', launchId).order('position'),
    db.from('resource').select('*').eq('launch_id', launchId).order('position'),
    db.from('content_item').select('*').eq('launch_id', launchId).order('position'),
    db.from('message_asset').select('*').eq('launch_id', launchId).order('position'),
  ]);

  for (const r of [launchRes, phaseRes, taskRes, kpiRes, resRes, contentRes, msgRes]) {
    if (r.error) throw r.error;
  }
  if (!launchRes.data) throw new NotFoundError('Launch not found');

  const phasesRaw = (phaseRes.data ?? []) as Row[];
  const tasksRaw = (taskRes.data ?? []) as Row[];
  const taskIds = tasksRaw.map((t) => t.id);
  const phaseCodeById = new Map(phasesRaw.map((p) => [p.id, p.code]));
  const sourceIndexById = new Map(tasksRaw.map((t) => [t.id, t.source_index]));

  const [stepRes, ownerRes, depRes] = await Promise.all([
    taskIds.length ? db.from('task_step').select('*').in('task_id', taskIds).order('position') : emptyData(),
    taskIds.length ? db.from('task_owner').select('*').in('task_id', taskIds) : emptyData(),
    taskIds.length ? db.from('dependency').select('*').in('task_id', taskIds) : emptyData(),
  ]);
  for (const r of [stepRes, ownerRes, depRes]) {
    if (r.error) throw r.error;
  }

  const stepsByTask = groupBy((stepRes.data ?? []) as Row[], 'task_id');
  const ownersByTask = groupBy((ownerRes.data ?? []) as Row[], 'task_id');
  const depsByTask = groupBy((depRes.data ?? []) as Row[], 'task_id');

  const phases: Phase[] = phasesRaw.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    position: p.position,
  }));

  const tasks: Task[] = tasksRaw.map((t) => ({
    id: t.id,
    launchId: t.launch_id,
    phaseId: t.phase_id,
    phaseCode: phaseCodeById.get(t.phase_id) ?? '',
    sourceIndex: t.source_index ?? null,
    title: t.title,
    objective: t.objective ?? null,
    definitionOfDone: t.definition_of_done ?? null,
    channel: t.channel ?? null,
    workstream: t.workstream ?? null,
    dueLabel: t.due_label ?? null,
    dueStart: t.due_start ?? null,
    dueEnd: t.due_end ?? null,
    status: t.status as TaskStatus,
    progressPct: t.progress_pct ?? 0,
    position: t.position ?? 0,
    version: t.version ?? 1,
    updatedBy: t.updated_by ?? null,
    updatedAt: t.updated_at,
    owners: (ownersByTask.get(t.id) ?? []).map((o) => ({
      ownerKey: o.owner_key,
      profileId: o.profile_id ?? null,
    })),
    steps: (stepsByTask.get(t.id) ?? [])
      .sort((a, b) => a.position - b.position)
      .map((s) => ({ id: s.id, position: s.position, body: s.body, done: !!s.done })),
    dependencies: (depsByTask.get(t.id) ?? []).map((d) => ({
      id: d.id,
      dependsOnTaskId: d.depends_on_task_id ?? null,
      dependsOnSourceIndex: d.depends_on_task_id ? sourceIndexById.get(d.depends_on_task_id) ?? null : null,
      note: d.note ?? null,
    })),
  }));

  const kpis: Kpi[] = ((kpiRes.data ?? []) as Row[]).map((k) => ({
    id: k.id,
    key: k.key,
    label: k.label,
    targetLabel: k.target_label ?? null,
    value: k.value ?? null,
    unit: k.unit ?? null,
    isComputed: !!k.is_computed,
    formula: k.formula ?? null,
    position: k.position ?? 0,
  }));

  const resources: Resource[] = ((resRes.data ?? []) as Row[]).map((r) => ({
    id: r.id,
    category: r.category,
    key: r.key,
    label: r.label,
    ownerKey: r.owner_key ?? null,
    url: r.url ?? null,
    status: r.status,
    position: r.position ?? 0,
  }));

  const content: ContentItem[] = ((contentRes.data ?? []) as Row[]).map((c) => ({
    id: c.id,
    kind: c.kind,
    channel: c.channel ?? null,
    day: c.day ?? null,
    dayLabel: c.day_label ?? null,
    stageLabel: c.stage_label ?? null,
    title: c.title,
    body: c.body ?? null,
    status: c.status,
    position: c.position ?? 0,
  }));

  const messages: MessageAsset[] = ((msgRes.data ?? []) as Row[]).map((m) => ({
    id: m.id,
    key: m.key,
    title: m.title,
    channel: m.channel ?? null,
    status: m.status,
    filePath: m.file_path ?? null,
    summary: m.summary ?? null,
    taskRefs: (m.task_refs ?? []) as number[],
    position: m.position ?? 0,
  }));

  return {
    launch: mapLaunch(launchRes.data as Row),
    phases,
    tasks,
    kpis,
    resources,
    content,
    messages,
    progress: computeProgress(tasks, phases),
  };
}

// --- mutations --------------------------------------------------------------

export interface UpdateStatusInput {
  status?: TaskStatus;
  progressPct?: number;
  note?: string;
  actor: string;
  expectedVersion?: number;
}

/**
 * Update a task's status/progress with optimistic concurrency.
 * Throws NotFoundError or VersionConflictError as appropriate.
 */
export async function updateTaskStatus(taskId: string, input: UpdateStatusInput): Promise<Task> {
  const db = getSupabaseLaunchOps();

  const { data: current, error: readErr } = await db
    .from('task')
    .select('id, version, launch_id')
    .eq('id', taskId)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!current) throw new NotFoundError('Task not found');

  if (input.expectedVersion != null && input.expectedVersion !== (current as Row).version) {
    throw new VersionConflictError((current as Row).version);
  }

  const patch: Row = { updated_by: input.actor };
  if (input.status != null) patch.status = input.status;
  if (input.progressPct != null) patch.progress_pct = clampPct(input.progressPct);

  let q = db.from('task').update(patch).eq('id', taskId);
  if (input.expectedVersion != null) q = q.eq('version', input.expectedVersion);
  const { data: updated, error: updErr } = await q.select('*').maybeSingle();
  if (updErr) throw updErr;
  if (!updated) throw new VersionConflictError((current as Row).version);

  if (input.note) {
    await addComment(taskId, input.note, input.actor, 'note');
  }

  // Re-load the single task with its relations for a consistent return value.
  const overview = await getLaunchOverview((updated as Row).launch_id);
  const t = overview.tasks.find((x) => x.id === taskId);
  if (!t) throw new NotFoundError('Task not found after update');
  return t;
}

export async function addComment(
  taskId: string,
  body: string,
  actor: string,
  kind = 'note',
): Promise<void> {
  const db = getSupabaseLaunchOps();
  const actorType = actor.startsWith('claude:') || actor.endsWith(':agent') ? 'agent' : 'human';
  const { error } = await db.from('comment').insert({ task_id: taskId, body, kind, actor, actor_type: actorType });
  if (error) throw error;
}

export async function updateKpiValue(launchId: string, key: string, value: number | null): Promise<void> {
  const db = getSupabaseLaunchOps();
  const { error } = await db.from('kpi').update({ value }).eq('launch_id', launchId).eq('key', key);
  if (error) throw error;
}

export async function updateResource(
  launchId: string,
  key: string,
  patch: { url?: string | null; status?: 'pending' | 'ready' },
): Promise<void> {
  const db = getSupabaseLaunchOps();
  const update: Row = {};
  if (patch.url !== undefined) update.url = patch.url;
  if (patch.status !== undefined) update.status = patch.status;
  if (Object.keys(update).length === 0) return;
  const { error } = await db.from('resource').update(update).eq('launch_id', launchId).eq('key', key);
  if (error) throw error;
}

// --- helpers ----------------------------------------------------------------

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function groupBy(rows: Row[], key: string): Map<string, Row[]> {
  const m = new Map<string, Row[]>();
  for (const r of rows) {
    const k = r[key];
    const arr = m.get(k);
    if (arr) arr.push(r);
    else m.set(k, [r]);
  }
  return m;
}

function emptyData(): Promise<{ data: Row[]; error: null }> {
  return Promise.resolve({ data: [], error: null });
}
