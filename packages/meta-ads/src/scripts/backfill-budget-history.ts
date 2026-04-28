/**
 * CLI: backfill `meta_ops.ad_set_budget_history` from Meta's Activity Log.
 *
 * Usage:
 *   META_MASTER_KEY=<base64> \
 *   node packages/meta-ads/dist/scripts/backfill-budget-history.js \
 *     --organizer-slug german-roz \
 *     --bu-slug di21 \
 *     [--days 30]
 *
 * Idempotent: re-running the script (or running it after the forward-pull
 * diff has already produced rows) never duplicates events. Targets only
 * ACTIVE ad sets — the dashboard shows ACTIVE bumps only.
 */
import { supabaseAdminForSchema } from '@marketing-funnel/db';
import { loadBuAndToken } from '../service';
import { backfillAdSetBudgetHistory } from '../budget-history';

interface Args {
  organizerSlug: string;
  buSlug: string;
  days: number;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> & { days: number } = { days: 30 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--organizer-slug') out.organizerSlug = argv[++i];
    else if (arg === '--bu-slug') out.buSlug = argv[++i];
    else if (arg === '--days') out.days = Number(argv[++i]);
  }
  if (!out.organizerSlug || !out.buSlug) {
    throw new Error(
      'Usage: backfill-budget-history --organizer-slug <slug> --bu-slug <slug> [--days N]',
    );
  }
  if (!Number.isFinite(out.days) || out.days <= 0) {
    throw new Error('--days must be a positive number');
  }
  return out as Args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const masterKey = process.env.META_MASTER_KEY;
  if (!masterKey) throw new Error('META_MASTER_KEY env var is required');

  const supabase = supabaseAdminForSchema('meta_ops');
  const { bu, organizer, accessToken } = await loadBuAndToken(
    supabase,
    args.organizerSlug,
    args.buSlug,
    masterKey,
  );

  console.log(
    `[backfill] organizer=${args.organizerSlug} bu=${args.buSlug} days=${args.days}`,
  );

  const startedAt = Date.now();
  const result = await backfillAdSetBudgetHistory(
    supabase,
    accessToken,
    bu.id,
    organizer.ad_account_id,
    args.days,
  );
  const elapsedMs = Date.now() - startedAt;

  console.log(`[backfill] done in ${elapsedMs}ms`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
