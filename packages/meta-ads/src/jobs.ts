import type { SupabaseClient } from '@supabase/supabase-js';

/** Accepts any schema-scoped client (avoids 'public' schema literal coupling). */
type AnySupabaseClient = SupabaseClient<any, string, string, any, any>;
import { metaGraphFetch, MetaCallError } from './client';
import { decryptToken } from './crypto';
import { pullBuInsights } from './service';
import type { JobType } from './types';

const LOCK_TTL_MINUTES = 15;

function nowIso(): string {
  return new Date().toISOString();
}

function addDays(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + delta);
  return d;
}

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Acquire a lock by inserting a row. Returns true if acquired. Prunes stale locks first. */
export async function acquireLock(supabase: AnySupabaseClient, key: string, owner: string): Promise<boolean> {
  // Prune any expired lock for this key (serverless invocations that died without cleanup).
  await supabase.from('meta_pull_locks').delete().eq('key', key).lt('expires_at', nowIso());

  const expiresAt = new Date(Date.now() + LOCK_TTL_MINUTES * 60_000).toISOString();
  const { error } = await supabase
    .from('meta_pull_locks')
    .insert({ key, locked_by: owner, expires_at: expiresAt });
  if (error) {
    // Unique violation means another invocation holds the lock.
    return false;
  }
  return true;
}

export async function releaseLock(supabase: AnySupabaseClient, key: string): Promise<void> {
  await supabase.from('meta_pull_locks').delete().eq('key', key);
}

interface LogJobArgs {
  jobType: JobType;
  businessUnitId?: string | null;
  status: 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  rowsWritten?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

async function insertJobRow(supabase: AnySupabaseClient, args: LogJobArgs): Promise<string> {
  const { data, error } = await supabase
    .from('meta_pull_jobs')
    .insert({
      job_type: args.jobType,
      business_unit_id: args.businessUnitId ?? null,
      status: args.status,
      started_at: args.startedAt ?? nowIso(),
      completed_at: args.completedAt ?? null,
      rows_written: args.rowsWritten ?? 0,
      error: args.error ?? null,
      metadata: args.metadata ?? {},
    })
    .select('id')
    .single();
  if (error || !data) throw new Error(`failed to log pull job: ${error?.message ?? 'no id'}`);
  return data.id as string;
}

async function updateJobRow(
  supabase: AnySupabaseClient,
  jobId: string,
  patch: Partial<Omit<LogJobArgs, 'jobType' | 'businessUnitId' | 'startedAt'>>,
): Promise<void> {
  await supabase
    .from('meta_pull_jobs')
    .update({
      status: patch.status,
      completed_at: patch.completedAt ?? nowIso(),
      rows_written: patch.rowsWritten ?? 0,
      error: patch.error ?? null,
      metadata: patch.metadata ?? {},
    })
    .eq('id', jobId);
}

interface RunJobParams {
  supabase: AnySupabaseClient;
  masterKey: string;
  businessUnitFilter?: { organizerSlug: string; buSlug: string };
  /**
   * Tag for any ad_set_budget_history rows produced during the run. Defaults
   * to 'pull' (scheduled cron). The /api/refresh route should pass
   * 'manual_refresh' so operators can later distinguish bumps captured by
   * background sync vs ones surfaced because somebody hit the button.
   */
  detectedVia?: 'pull' | 'manual_refresh';
}

async function listTargetBus(
  supabase: AnySupabaseClient,
  filter?: { organizerSlug: string; buSlug: string },
): Promise<Array<{ id: string; slug: string; organizer_slug: string }>> {
  let query = supabase
    .from('business_units')
    .select('id, slug, organizers:organizer_id(slug)');

  const { data, error } = await query;
  if (error) throw new Error(`list BUs failed: ${error.message}`);

  const rows = (data ?? []).map((r) => {
    const organizers = r.organizers as unknown;
    const organizer_slug = Array.isArray(organizers)
      ? (organizers[0] as { slug?: string } | undefined)?.slug ?? ''
      : (organizers as { slug?: string } | null)?.slug ?? '';
    return { id: r.id as string, slug: r.slug as string, organizer_slug };
  });

  if (!filter) return rows;
  return rows.filter((r) => r.organizer_slug === filter.organizerSlug && r.slug === filter.buSlug);
}

/** Internal runner used by each tier-specific job. */
async function runInsightsJob(
  params: RunJobParams,
  jobType: JobType,
  since: string,
  until: string,
  includeRich: boolean,
): Promise<{ rowsWritten: number; freqRows: number; bus: number }> {
  const { supabase, masterKey, businessUnitFilter } = params;
  const lockKey = businessUnitFilter
    ? `${jobType}:${businessUnitFilter.organizerSlug}/${businessUnitFilter.buSlug}`
    : jobType;
  const owner = `meta-ads-jobs@${nowIso()}`;

  const acquired = await acquireLock(supabase, lockKey, owner);
  if (!acquired) {
    await insertJobRow(supabase, { jobType, status: 'skipped', metadata: { reason: 'lock_held' } });
    return { rowsWritten: 0, freqRows: 0, bus: 0 };
  }

  const jobId = await insertJobRow(supabase, {
    jobType,
    status: 'running',
    metadata: { since, until, includeRich },
  });

  try {
    const bus = await listTargetBus(supabase, businessUnitFilter);
    let totalRows = 0;
    let totalFreqRows = 0;
    const richTotals = { ad_account: 0, campaigns: 0, ad_sets: 0, ads: 0, creatives: 0, audiences: 0 };
    const errors: string[] = [];

    for (const bu of bus) {
      try {
        const { rowsWritten, freqRows, richCounts } = await pullBuInsights(supabase, {
          organizerSlug: bu.organizer_slug,
          buSlug: bu.slug,
          masterKey,
          since,
          until,
          includeRich,
          detectedVia: params.detectedVia ?? 'pull',
        });
        totalRows += rowsWritten;
        totalFreqRows += freqRows;
        for (const k of Object.keys(richTotals) as Array<keyof typeof richTotals>) {
          richTotals[k] += richCounts[k];
        }
      } catch (err) {
        errors.push(`${bu.organizer_slug}/${bu.slug}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    await updateJobRow(supabase, jobId, {
      status: errors.length > 0 ? 'failed' : 'completed',
      rowsWritten: totalRows,
      error: errors.length > 0 ? errors.join(' | ') : undefined,
      metadata: { since, until, bus: bus.length, freqRows: totalFreqRows, richTotals, includeRich },
    });

    return { rowsWritten: totalRows, freqRows: totalFreqRows, bus: bus.length };
  } catch (err) {
    await updateJobRow(supabase, jobId, {
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  } finally {
    await releaseLock(supabase, lockKey);
  }
}

/**
 * Pull today's insights for all BUs (or a single BU). Refreshes rich entities.
 *
 * The server runs in UTC but most BUs live in timezones behind UTC (e.g. Lima
 * UTC-5). Asking Meta for `since=until=todayUTC` near/after UTC midnight returns
 * the empty row of a day that has not started yet in Lima, making the dashboard
 * show "hoy = tomorrow $0". Widening the window to yesterdayUTC..todayUTC
 * guarantees we always have the row for the BU's local "today".
 */
export function runTodayJob(params: RunJobParams) {
  const now = new Date();
  const today = toYmd(now);
  const yesterday = toYmd(addDays(now, -1));
  return runInsightsJob(params, 'today', yesterday, today, true);
}

/** Pull last 7 days of insights for reconciliation. Refreshes rich entities. */
export function runRecentJob(params: RunJobParams) {
  const now = new Date();
  return runInsightsJob(params, 'recent', toYmd(addDays(now, -7)), toYmd(now), true);
}

/** Pull days 8..30 for mid-tier reconciliation. Skips rich entity refresh (redundant). */
export function runMidJob(params: RunJobParams) {
  const now = new Date();
  return runInsightsJob(params, 'mid', toYmd(addDays(now, -30)), toYmd(addDays(now, -8)), false);
}

/** Pull days 31..90 for historical backfill. Skips rich entity refresh (redundant). */
export function runHistoricalJob(params: RunJobParams) {
  const now = new Date();
  return runInsightsJob(params, 'historical', toYmd(addDays(now, -90)), toYmd(addDays(now, -31)), false);
}

/**
 * Probe each organizer's token: call GET /me to check validity and store a
 * health snapshot. Writes results to organizers.health_snapshot.
 */
export async function runTokenHealthJob(params: { supabase: AnySupabaseClient; masterKey: string }) {
  const { supabase, masterKey } = params;
  const lockKey: JobType = 'token-health';
  const owner = `meta-ads-jobs@${nowIso()}`;

  const acquired = await acquireLock(supabase, lockKey, owner);
  if (!acquired) {
    await insertJobRow(supabase, { jobType: lockKey, status: 'skipped', metadata: { reason: 'lock_held' } });
    return { checked: 0, failures: 0 };
  }
  const jobId = await insertJobRow(supabase, { jobType: lockKey, status: 'running' });

  try {
    const { data: organizers, error } = await supabase
      .from('organizers')
      .select('id, slug, encrypted_token');
    if (error) throw new Error(`list organizers failed: ${error.message}`);

    let checked = 0;
    let failures = 0;
    for (const o of organizers ?? []) {
      if (!o.encrypted_token) continue;
      checked++;
      const snapshot: Record<string, unknown> = { checked_at: nowIso() };
      try {
        const token = decryptToken(o.encrypted_token as string, masterKey);
        const res = await metaGraphFetch<{ id: string; name: string }>('me', { fields: 'id,name' }, token);
        snapshot.status = 'ok';
        snapshot.meta_user_id = res.data.id;
      } catch (err) {
        failures++;
        snapshot.status = 'error';
        if (err instanceof MetaCallError) {
          snapshot.error_code = err.code;
          snapshot.token_error = err.isTokenError();
        }
        snapshot.error_message = err instanceof Error ? err.message : String(err);
      }
      await supabase.from('organizers').update({ health_snapshot: snapshot }).eq('id', o.id);
    }

    await updateJobRow(supabase, jobId, {
      status: 'completed',
      rowsWritten: checked,
      metadata: { checked, failures },
    });

    return { checked, failures };
  } catch (err) {
    await updateJobRow(supabase, jobId, {
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  } finally {
    await releaseLock(supabase, lockKey);
  }
}
