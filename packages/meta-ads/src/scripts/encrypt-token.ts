/**
 * One-off CLI: encrypts a Meta token and stores it on meta_ops.organizers.
 *
 * Usage:
 *   META_MASTER_KEY=<base64> \
 *   node packages/meta-ads/dist/scripts/encrypt-token.js \
 *     --organizer-slug german-roz \
 *     --token 'EAAB...' \
 *     [--expires-at 2026-07-15T00:00:00Z]
 */
import { supabaseAdminForSchema } from '@marketing-funnel/db';
import { encryptToken } from '../crypto';

interface Args {
  organizerSlug: string;
  token: string;
  expiresAt?: string;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--organizer-slug') out.organizerSlug = argv[++i];
    else if (arg === '--token') out.token = argv[++i];
    else if (arg === '--expires-at') out.expiresAt = argv[++i];
  }
  if (!out.organizerSlug || !out.token) {
    throw new Error('Usage: encrypt-token --organizer-slug <slug> --token <token> [--expires-at <iso>]');
  }
  return out as Args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const masterKey = process.env.META_MASTER_KEY;
  if (!masterKey) throw new Error('META_MASTER_KEY env var is required');

  const encrypted = encryptToken(args.token, masterKey);
  const supabase = supabaseAdminForSchema('meta_ops');

  const { data, error } = await supabase
    .from('organizers')
    .update({
      encrypted_token: encrypted,
      token_expires_at: args.expiresAt ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', args.organizerSlug)
    .select('id, slug')
    .single();

  if (error || !data) {
    throw new Error(`failed to update organizer ${args.organizerSlug}: ${error?.message ?? 'not found'}`);
  }

  console.log(`OK: encrypted token stored for organizer ${data.slug} (id=${data.id})`);
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
