/**
 * CLI: executes a full Meta pull for one BU — insights + frequency + rich entities.
 *
 * Usage:
 *   META_MASTER_KEY=<base64> \
 *   node packages/meta-ads/dist/scripts/pull-bu.js \
 *     --organizer-slug german-roz \
 *     --bu-slug di21 \
 *     [--since 2026-04-22] [--until 2026-04-22] \
 *     [--no-rich]
 *
 * Defaults to since=until=today (UTC).
 *
 * WARNING: this writes to meta_ops. Running against a BU whose dashboard is
 * currently backed by a fixture will overwrite the fixture rows for the given
 * date range and for all operator-independent columns of campaigns/ad_sets/
 * ads/creatives/audiences.
 */
import { supabaseAdminForSchema } from '@marketing-funnel/db';
import { pullBuInsights } from '../service';

interface Args {
  organizerSlug: string;
  buSlug: string;
  since?: string;
  until?: string;
  includeRich: boolean;
}

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> & { includeRich: boolean } = { includeRich: true };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--organizer-slug') out.organizerSlug = argv[++i];
    else if (arg === '--bu-slug') out.buSlug = argv[++i];
    else if (arg === '--since') out.since = argv[++i];
    else if (arg === '--until') out.until = argv[++i];
    else if (arg === '--no-rich') out.includeRich = false;
  }
  if (!out.organizerSlug || !out.buSlug) {
    throw new Error('Usage: pull-bu --organizer-slug <slug> --bu-slug <slug> [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--no-rich]');
  }
  return out as Args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const masterKey = process.env.META_MASTER_KEY;
  if (!masterKey) throw new Error('META_MASTER_KEY env var is required');

  const today = toYmd(new Date());
  const since = args.since ?? today;
  const until = args.until ?? today;

  const supabase = supabaseAdminForSchema('meta_ops');

  console.log(`[pull-bu] organizer=${args.organizerSlug} bu=${args.buSlug} range=${since}..${until} includeRich=${args.includeRich}`);

  const startedAt = Date.now();
  const result = await pullBuInsights(supabase, {
    organizerSlug: args.organizerSlug,
    buSlug: args.buSlug,
    masterKey,
    since,
    until,
    includeRich: args.includeRich,
  });
  const elapsedMs = Date.now() - startedAt;

  console.log(`[pull-bu] done in ${elapsedMs}ms`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
