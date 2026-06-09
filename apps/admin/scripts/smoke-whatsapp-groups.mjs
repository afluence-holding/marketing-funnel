#!/usr/bin/env node
/**
 * smoke-whatsapp-groups.mjs — backend QA for the WhatsApp Groups module.
 *
 * 1. Reads the live german-roz pool and asserts the new columns (label,
 *    launch_code) + that groups are present.
 * 2. Runs a full CRUD cycle on a THROWAWAY pool (create pool → add group →
 *    update group → delete group → delete pool) and cleans up after itself.
 * 3. Validates the invite-url normalizer regex used by the repository.
 *
 * Uses the service-role client scoped to `marketing` (same as the admin repo).
 * Usage: node apps/admin/scripts/smoke-whatsapp-groups.mjs
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

const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'marketing' },
  auth: { autoRefreshToken: false, persistSession: false },
});

let fail = 0;
const ok = (label, cond) => { console.log(`  ${cond ? 'PASS' : 'FAIL'} ${label}`); if (!cond) fail++; };

// Mirror of repository.normalizeInviteUrl
function normalizeInviteUrl(raw) {
  const m = (raw ?? '').trim().match(/^https:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]{6,})/);
  if (!m) throw new Error('invalid_invite_url');
  return `https://chat.whatsapp.com/${m[1]}`;
}

async function main() {
  console.log('== invite-url normalizer ==');
  ok('strips share params', normalizeInviteUrl('https://chat.whatsapp.com/ABC123def?s=sw&p=i') === 'https://chat.whatsapp.com/ABC123def');
  let threw = false;
  try { normalizeInviteUrl('https://example.com/x'); } catch { threw = true; }
  ok('rejects non-whatsapp url', threw);

  console.log('\n== live german-roz pool (di21→main) ==');
  const { data: pools } = await db
    .from('whatsapp_group_pools')
    .select('*')
    .eq('org_key', 'german-roz')
    .eq('bu_key', 'main');
  const webinar = (pools ?? []).find((p) => p.pool_key === 'webinar-2026-06-10');
  ok('webinar pool exists', !!webinar);
  ok('pool has label', !!webinar && webinar.label === 'Webinar · 10 jun 2026');
  ok('pool linked to cohort DI21-C2', !!webinar && webinar.launch_code === 'DI21-C2');
  if (webinar) {
    const { data: groups } = await db.from('whatsapp_groups').select('*').eq('pool_id', webinar.id);
    ok('pool has >= 6 groups', (groups ?? []).length >= 6);
  }

  console.log('\n== CRUD cycle on a throwaway pool ==');
  const testKey = `smoke-test-${Date.now()}`;
  let poolId = null;
  let groupId = null;
  try {
    const { data: created, error: e1 } = await db
      .from('whatsapp_group_pools')
      .insert({ org_key: 'german-roz', bu_key: 'main', pool_key: testKey, label: 'SMOKE', launch_code: 'DI21-C2', capacity: 10, rotation_mode: 'auto_count' })
      .select('id').single();
    ok('create pool', !e1 && !!created?.id);
    poolId = created?.id;

    const { data: g, error: e2 } = await db
      .from('whatsapp_groups')
      .insert({ pool_id: poolId, label: 'Grupo 1', invite_url: normalizeInviteUrl('https://chat.whatsapp.com/SMOKE123abc'), position: 1 })
      .select('id').single();
    ok('add group', !e2 && !!g?.id);
    groupId = g?.id;

    const { error: e3 } = await db.from('whatsapp_groups').update({ is_full: true, label: 'Grupo 1 edit' }).eq('id', groupId);
    ok('update group (mark full + rename)', !e3);

    const { data: check } = await db.from('whatsapp_groups').select('is_full,label').eq('id', groupId).single();
    ok('update persisted', !!check && check.is_full === true && check.label === 'Grupo 1 edit');

    const { error: e4 } = await db.from('whatsapp_groups').delete().eq('id', groupId);
    ok('delete group', !e4);
    groupId = null;

    const { error: e5 } = await db.from('whatsapp_group_pools').delete().eq('id', poolId);
    ok('delete pool', !e5);
    poolId = null;
  } finally {
    // Best-effort cleanup if anything threw mid-cycle.
    if (groupId) await db.from('whatsapp_groups').delete().eq('id', groupId);
    if (poolId) await db.from('whatsapp_group_pools').delete().eq('id', poolId);
  }

  console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
