#!/usr/bin/env node
/**
 * smoke-centro-data.mjs — validates the Centro de Operaciones data path through
 * PostgREST (the exact client the admin uses), not just SQL. Confirms the new
 * launch_ops.content_item / message_asset tables and the backoffice staff embed
 * are exposed + queryable via the REST API with the service role.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const env = {};
for (const f of ['.env', '.env.local']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('Missing SUPABASE_URL / SERVICE_ROLE_KEY'); process.exit(1); }

const lo = createClient(URL, KEY, { db: { schema: 'launch_ops' }, auth: { persistSession: false } });
const bo = createClient(URL, KEY, { db: { schema: 'backoffice' }, auth: { persistSession: false } });

let fail = 0;
const ok = (label, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'} ${label}${extra ? ' — ' + extra : ''}`); if (!cond) fail++; };

const { data: launch } = await lo.from('launch').select('id').eq('code', 'DI21-C2').maybeSingle();
ok('launch DI21-C2 found', !!launch);
const launchId = launch?.id;

const [{ data: tasks }, { data: content }, { data: msgs }] = await Promise.all([
  lo.from('task').select('id').eq('launch_id', launchId),
  lo.from('content_item').select('id, kind').eq('launch_id', launchId),
  lo.from('message_asset').select('id, title, task_refs').eq('launch_id', launchId),
]);
ok('tasks = 74 (PostgREST)', (tasks?.length ?? 0) === 74, `${tasks?.length}`);
ok('content_item >= 40', (content?.length ?? 0) >= 40, `${content?.length}`);
ok('message_asset = 12', (msgs?.length ?? 0) === 12, `${msgs?.length}`);
ok('content kinds include reel+matrix_row+sequence',
  ['reel', 'matrix_row', 'sequence'].every((k) => content?.some((c) => c.kind === k)));
ok('message has task_refs', !!msgs?.some((m) => Array.isArray(m.task_refs) && m.task_refs.length));

const { data: staff, error: staffErr } = await bo
  .from('afluence_membership')
  .select('user_id, role, ops_role, profile:user_id(display_name, email)');
ok('staff embed (membership+profile) works', !staffErr && (staff?.length ?? 0) >= 1, staffErr?.message ?? `${staff?.length} rows`);
ok('staff has display_name via embed', !!staff?.[0]?.profile?.display_name);

const { data: grants } = await bo.from('role_module_grant').select('role, module_id');
ok('role_module_grant readable', (grants?.length ?? 0) >= 10, `${grants?.length}`);

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
