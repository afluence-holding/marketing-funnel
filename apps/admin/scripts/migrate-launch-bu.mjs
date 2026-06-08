import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const env = {};
for (const f of ['.env', '.env.local']) {
  const p = path.join(ROOT, f); if (!fs.existsSync(p)) continue;
  for (const l of fs.readFileSync(p, 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
}
const lo = createClient(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { db: { schema: 'launch_ops' }, auth: { persistSession: false } });

// Idempotent: only move the german-roz launch from the legacy `main` BU to `di21`.
const { data: before } = await lo.from('launch').select('id, code, organizer_slug, bu_slug').eq('organizer_slug', 'german-roz').eq('bu_slug', 'main');
if (!before || before.length === 0) {
  console.log('Nothing to migrate (no german-roz/main launch). Already unified?');
} else {
  const { error } = await lo.from('launch').update({ bu_slug: 'di21' }).eq('organizer_slug', 'german-roz').eq('bu_slug', 'main');
  if (error) { console.error('UPDATE FAILED:', error.message); process.exit(1); }
  console.log(`Migrated ${before.length} launch row(s): german-roz/main -> german-roz/di21`);
}
const { data: after } = await lo.from('launch').select('code, organizer_slug, bu_slug');
console.log('Launches now:', after);
