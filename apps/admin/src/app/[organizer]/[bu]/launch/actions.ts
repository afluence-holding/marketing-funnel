'use server';

/**
 * Server actions for the Launch Ops UI (human, session-scoped).
 * The actor is derived from the Supabase session; the agent path is separate
 * (/api/agent/v1) and never reuses these.
 */
import { getSupabaseServer } from '@/lib/supabase/server';
import {
  NotFoundError,
  VersionConflictError,
  addComment,
  updateKpiValue,
  updateResource,
  updateTaskStatus,
} from '@/lib/launch-ops/repository';
import type { TaskStatus } from '@/lib/launch-ops/types';

async function currentActor(): Promise<string> {
  try {
    const { data } = await (await getSupabaseServer()).auth.getUser();
    return data.user?.email ?? data.user?.id ?? 'staff';
  } catch {
    return 'staff';
  }
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  conflictVersion?: number;
}

export async function updateTaskStatusAction(input: {
  taskId: string;
  status?: TaskStatus;
  progressPct?: number;
  note?: string;
  expectedVersion?: number;
}): Promise<ActionResult> {
  const actor = await currentActor();
  try {
    await updateTaskStatus(input.taskId, {
      status: input.status,
      progressPct: input.progressPct,
      note: input.note,
      actor,
      expectedVersion: input.expectedVersion,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof VersionConflictError) {
      return { ok: false, error: 'version_conflict', conflictVersion: e.currentVersion };
    }
    if (e instanceof NotFoundError) return { ok: false, error: 'not_found' };
    return { ok: false, error: 'internal' };
  }
}

export async function addCommentAction(input: { taskId: string; body: string }): Promise<ActionResult> {
  const actor = await currentActor();
  try {
    await addComment(input.taskId, input.body, actor, 'note');
    return { ok: true };
  } catch {
    return { ok: false, error: 'internal' };
  }
}

export async function updateKpiAction(input: {
  launchId: string;
  key: string;
  value: number | null;
}): Promise<ActionResult> {
  try {
    await updateKpiValue(input.launchId, input.key, input.value);
    return { ok: true };
  } catch {
    return { ok: false, error: 'internal' };
  }
}

export async function updateResourceAction(input: {
  launchId: string;
  key: string;
  url?: string | null;
  status?: 'pending' | 'ready';
}): Promise<ActionResult> {
  try {
    await updateResource(input.launchId, input.key, { url: input.url, status: input.status });
    return { ok: true };
  } catch {
    return { ok: false, error: 'internal' };
  }
}
