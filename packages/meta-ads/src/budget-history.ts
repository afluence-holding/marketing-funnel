/**
 * Backfill `meta_ops.ad_set_budget_history` from Meta's Activity Log.
 *
 * The forward-going pull diff (in service.ts → upsertAdSetsRich) only catches
 * changes that happen after deploy. To populate the dashboard with the last
 * 30 days of bumps, we hit `/{ad_set_id}/activities` once per ACTIVE ad set
 * and translate the raw events into history rows.
 *
 * Meta's Activity Log returns events like:
 *   {
 *     "event_type": "update_ad_set_daily_budget",
 *     "event_time": "2026-04-22T19:14:55+0000",
 *     "extra_data": "{\"old_value\":\"5000\",\"new_value\":\"10000\"}",
 *     "object_id":  "<ad_set_id>",
 *     "id":         "<event_id>"
 *   }
 *
 * `old_value` / `new_value` are currency minor units (cents) — same convention
 * as `daily_budget` everywhere else in the rich pulls.
 *
 * Idempotency
 * -----------
 * Two layers of dedup:
 *
 *   1. The unique index `(ad_set_id, changed_at, new_budget)` collapses the
 *      same logical bump captured by both the forward-pull and this backfill.
 *      For that to work `changed_at` must be truncated to minute resolution
 *      in BOTH writers — see `truncateToMinute` (re-exported from service.ts).
 *
 *   2. A partial unique on `source_event_id` (where not null) ensures
 *      re-running the backfill never duplicates events even if the minute
 *      truncation contract is somehow violated.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { metaGraphFetchPaginated, MetaCallError } from './client';
import { minorToMajor, truncateToMinute } from './service';

type AnySupabaseClient = SupabaseClient<any, string, string, any, any>;

const RELEVANT_EVENT_TYPES = new Set(['update_ad_set_daily_budget']);

interface RawActivity {
  id?: string;
  event_type?: string;
  event_time?: string;
  extra_data?: string;
  object_id?: string;
}

interface BackfillRow {
  ad_set_id: string;
  business_unit_id: string;
  prev_budget: number | null;
  new_budget: number;
  delta_pct: number | null;
  direction: 'UP' | 'DOWN' | 'INITIAL';
  changed_at: string;
  detected_via: 'backfill';
  source_event_id: string | null;
}

export interface BackfillResult {
  ad_sets_scanned: number;
  events_fetched: number;
  /**
   * Sum of row counts in every chunk the backfill *successfully sent* to
   * Supabase via upsert. Two important caveats:
   *
   *   1. Upserts use `ignoreDuplicates: true`, so the actual number of newly
   *      inserted rows is `rows_attempted - rows_already_in_db`. This counter
   *      doesn't tell you that delta on its own.
   *   2. If a chunk's upsert fails, those rows are NOT counted (they go into
   *      `errors`), so a partial outage will under-report.
   *
   * Use this number as a "did we make it through the data we collected?"
   * sanity check, not as a ground-truth "new rows tonight" stat.
   */
  rows_attempted: number;
  /**
   * Number of ad sets where pagination hit the maxPages cap and Meta still
   * had more data. Operators should re-run with a smaller `daysBack` window
   * for these BUs or raise `maxPages` to capture the long tail.
   */
  truncated_ad_sets: number;
  errors: Array<{ ad_set_id: string; message: string }>;
}

// `minorToMajor` is imported from `./service` so the live pull and this
// backfill produce identical major-unit values for the same minor-unit input.
// See the long comment on `minorToMajor` in service.ts — divergence between
// the two implementations broke the (ad_set_id, changed_at, new_budget)
// unique index for non-integer cents.

/**
 * Sleep for `ms` milliseconds. Used by the rate-limit backoff.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Detect Meta error codes that mean "stop trying for this token". A 190 means
 * the token is dead (expired/revoked); continuing the loop just burns budget
 * and floods the error log. Code 463 = session expired.
 */
function isFatalTokenError(err: unknown): boolean {
  if (!(err instanceof MetaCallError)) return false;
  return err.code === 190 || err.code === 102 || err.code === 463;
}

/**
 * Either Meta said "rate-limited" (codes 4/17/32/613) or the platform 5xx'd.
 * In both cases an exponential backoff retry is the right thing to do — the
 * earlier draft only retried on rate-limit and bailed on 503/504.
 */
function isRetryableTransient(err: unknown): boolean {
  if (!(err instanceof MetaCallError)) return false;
  return err.isTransient();
}

/**
 * Coerce a Meta `event_time` (e.g. "2026-04-22T19:14:55+0000") into a valid
 * ISO-8601 string, or `null` if Meta sends garbage. Done up front so we never
 * call `.toISOString()` on a `Date` whose `getTime()` is `NaN` — that throws
 * `RangeError` and was previously aborting the entire ad set's loop, dropping
 * every legitimate event after the first bad one.
 *
 * Also rejects timestamps outside a reasonable window (year 2000..2100). JS's
 * `new Date('0000-00-00')` is sometimes valid in V8, and an event from the
 * year 0001 (or 99999) silently passing through would corrupt `changed_at`
 * for the row and could fool the dashboard's 30-day cutoff.
 */
const MIN_EVENT_YEAR = 2000;
const MAX_EVENT_YEAR = 2100;
function coerceEventTime(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  if (y < MIN_EVENT_YEAR || y > MAX_EVENT_YEAR) return null;
  return d.toISOString();
}

/**
 * Backfill budget history for one BU. Iterates every ACTIVE ad set in
 * `meta_ops.ad_sets` for the BU, calls Meta's Activity Log, and inserts the
 * relevant `update_ad_set_daily_budget` events into history.
 *
 * @param supabase    Supabase client scoped to the `meta_ops` schema
 * @param accessToken Decrypted Meta long-lived token
 * @param businessUnitId BU UUID
 * @param adAccountId Meta ad account id (act_…) for BUC tracking
 * @param daysBack    How many days of history to import (default 30)
 */
export async function backfillAdSetBudgetHistory(
  supabase: AnySupabaseClient,
  accessToken: string,
  businessUnitId: string,
  adAccountId: string | null,
  daysBack = 30,
): Promise<BackfillResult> {
  const result: BackfillResult = {
    ad_sets_scanned: 0,
    events_fetched: 0,
    rows_attempted: 0,
    truncated_ad_sets: 0,
    errors: [],
  };

  // Pull every active ad set for the BU. We deliberately scope to ACTIVE so
  // the backfill stays cheap on accounts with hundreds of paused historical
  // ad sets (the dashboard only displays ACTIVE bumps anyway).
  const { data: adSets, error: adSetsErr } = await supabase
    .from('ad_sets')
    .select('id')
    .eq('business_unit_id', businessUnitId)
    .eq('status', 'ACTIVE');

  if (adSetsErr) {
    throw new Error(`failed to load ad sets for backfill: ${adSetsErr.message}`);
  }

  result.ad_sets_scanned = adSets?.length ?? 0;
  if (result.ad_sets_scanned === 0) return result;

  const sinceUnix = Math.floor((Date.now() - daysBack * 86_400_000) / 1000);
  const fields = 'id,event_type,event_time,extra_data,object_id';

  // 50 pages × 200 events = up to 10k events per ad set. Earlier draft used 10
  // pages (2000) which silently dropped the long tail on launch days where
  // an ad set could log 50+ activity entries (CBO toggles, audience edits,
  // creative swaps, repeated daily-budget bumps). With Meta's `since` param
  // already scoping to `daysBack`, 10k is a safe ceiling and we report any
  // truncation via the paginator's `truncatedByMaxPages` flag (which checks
  // whether Meta still had a next cursor, not whether we fetched a round
  // number of rows — the previous heuristic produced false positives when
  // Meta returned exactly 10k events and no next page).
  const MAX_PAGES = 50;
  const PAGE_SIZE = 200;

  const allRows: BackfillRow[] = [];

  // Total attempts per ad set on transient errors (rate-limit + 5xx).
  // 4 tries × backoffs at [2s, 4s, 8s] tolerates up to ~14s of platform
  // hiccup before giving up on a single ad set. Earlier round-3 draft used
  // 3 tries with 1s+2s = 3s total, which was tight against typical 5xx
  // recovery windows on Meta's side.
  const MAX_ATTEMPTS = 4;

  for (const adSet of (adSets ?? []) as Array<{ id: string }>) {
    let attempt = 0;
    while (attempt < MAX_ATTEMPTS) {
      try {
        const r = await metaGraphFetchPaginated<RawActivity>(
          `${adSet.id}/activities`,
          { fields, since: sinceUnix, limit: PAGE_SIZE },
          accessToken,
          { adAccountId: adAccountId ?? undefined, maxPages: MAX_PAGES },
        );
        const activities = r.data ?? [];
        result.events_fetched += activities.length;

        // True iff we hit MAX_PAGES while Meta still had a next cursor.
        // Set by the paginator itself (`packages/meta-ads/src/client.ts`),
        // which is the only place that actually saw the residual `next`.
        if (r.truncatedByMaxPages) {
          result.truncated_ad_sets += 1;
        }

        for (const ev of activities) {
          if (!ev.event_type || !RELEVANT_EVENT_TYPES.has(ev.event_type)) continue;
          if (!ev.event_time || !ev.extra_data) continue;

          // Validate timestamp BEFORE truncating. `new Date(garbage).toISOString()`
          // throws RangeError, and previously that bubbled out of the `for`
          // loop into the `try/catch` over the whole ad set — one bad event
          // wiped every other event for the same ad set.
          const eventIso = coerceEventTime(ev.event_time);
          if (eventIso == null) continue;

          let parsed: { old_value?: string | number; new_value?: string | number };
          try {
            parsed = JSON.parse(ev.extra_data);
          } catch {
            continue;
          }
          // null when Meta omits the value — different from 0.
          const prev = minorToMajor(parsed.old_value);
          const next = minorToMajor(parsed.new_value);
          if (next == null) continue;
          if (prev != null && prev === next) continue; // noise — same value

          // INITIAL when there's no prior value (first observation in the
          // window). UP/DOWN otherwise. Without this branch every "first
          // event in window" was being labelled UP from a phantom $0 prev.
          let direction: 'UP' | 'DOWN' | 'INITIAL';
          if (prev == null) direction = 'INITIAL';
          else if (next > prev) direction = 'UP';
          else direction = 'DOWN';

          const deltaPct =
            prev == null || prev === 0
              ? null
              : Math.round(((next - prev) / prev) * 10000) / 100;

          allRows.push({
            ad_set_id: adSet.id,
            business_unit_id: businessUnitId,
            prev_budget: prev,
            new_budget: next,
            delta_pct: deltaPct,
            direction,
            // Truncate to minute so the unique on (ad_set_id, changed_at,
            // new_budget) collapses with the forward-pull writer that uses
            // updated_time on a slightly different second.
            changed_at: truncateToMinute(eventIso),
            detected_via: 'backfill',
            source_event_id: ev.id ?? null,
          });
        }
        break; // success — move to next ad set
      } catch (err) {
        if (isFatalTokenError(err)) {
          // Bail out completely: every subsequent call will fail the same way.
          result.errors.push({
            ad_set_id: adSet.id,
            message:
              err instanceof Error
                ? `fatal token error, aborting backfill: ${err.message}`
                : 'fatal token error',
          });
          // Push the in-flight rows before bailing so we don't lose work.
          await flushRows(supabase, allRows, result);
          return result;
        }
        if (isRetryableTransient(err) && attempt < MAX_ATTEMPTS - 1) {
          // Exponential backoff: 2s, 4s, 8s. Covers both Meta rate-limit
          // codes (4/17/32/613) and platform 5xx (via MetaCallError.isTransient).
          // Total max wait across retries = 2+4+8 = 14s before giving up.
          await sleep(2000 * Math.pow(2, attempt));
          attempt += 1;
          continue;
        }
        const message =
          err instanceof MetaCallError
            ? `Meta ${err.status} (code ${err.code}): ${err.message}`
            : err instanceof Error
              ? err.message
              : String(err);
        result.errors.push({ ad_set_id: adSet.id, message });
        break;
      }
    }
  }

  await flushRows(supabase, allRows, result);
  return result;
}

/**
 * Insert backfill rows in chunks. Splits to stay within Supabase's payload
 * limits on accounts with very chatty Activity Logs and reports any chunk
 * failures via the result errors array without aborting the whole run.
 */
async function flushRows(
  supabase: AnySupabaseClient,
  rows: BackfillRow[],
  result: BackfillResult,
): Promise<void> {
  if (rows.length === 0) return;
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from('ad_set_budget_history')
      .upsert(slice, {
        onConflict: 'ad_set_id,changed_at,new_budget',
        ignoreDuplicates: true,
      });
    if (error) {
      result.errors.push({ ad_set_id: '*batch*', message: error.message });
      continue;
    }
    // Best-effort upper bound — see BackfillResult.rows_attempted docstring.
    result.rows_attempted += slice.length;
  }
}
