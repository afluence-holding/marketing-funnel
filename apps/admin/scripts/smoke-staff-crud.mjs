#!/usr/bin/env node
/**
 * smoke-staff-crud.mjs — end-to-end lifecycle test for the Usuarios CRUD,
 * exercising the exact Supabase operations the repository performs:
 * create (auth + profile + membership) -> update (email/role/handle/password)
 * -> login with new password -> delete (auth + profile cascade). Uses a
 * throwaway email so it never touches real staff.
 */
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
const URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(URL, KEY, { auth: { persistSession: false } });
const bo = createClient(URL, KEY, { db: { schema: 'backoffice' }, auth: { persistSession: false } });

const stamp = Date.now();
const EMAIL = `qa-crud-${stamp}@byafluence.com`;
const EMAIL2 = `qa-crud-${stamp}-edited@byafluence.com`;
const HANDLE = `qacrud${stamp}`;

let fail = 0;
const ok = (label, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${label}`); if (!cond) fail++; };
let userId;

try {
  // CREATE
  const { data: c, error: ce } = await admin.auth.admin.createUser({ email: EMAIL, password: 'first123', email_confirm: true });
  ok('create auth user', !ce && !!c?.user?.id);
  userId = c.user.id;
  await bo.from('profile').upsert({ id: userId, user_kind: 'afluence', display_name: 'QA Crud', handle: HANDLE, email: EMAIL }, { onConflict: 'id' });
  await bo.from('afluence_membership').upsert({ user_id: userId, role: 'member', ops_role: 'viewer' }, { onConflict: 'user_id' });
  const { data: prof1 } = await bo.from('profile').select('handle, email').eq('id', userId).maybeSingle();
  ok('profile linked', prof1?.handle === HANDLE);
  const { data: mem1 } = await bo.from('afluence_membership').select('role, ops_role').eq('user_id', userId).maybeSingle();
  ok('membership member/viewer', mem1?.role === 'member' && mem1?.ops_role === 'viewer');

  // UPDATE: email + password (auth), role + ops_role + email (db)
  const { error: ue } = await admin.auth.admin.updateUserById(userId, { email: EMAIL2, password: 'second123' });
  ok('auth update (email+password)', !ue);
  await bo.from('profile').update({ email: EMAIL2, display_name: 'QA Crud Edited' }).eq('id', userId);
  await bo.from('afluence_membership').upsert({ user_id: userId, role: 'admin', ops_role: 'paid' }, { onConflict: 'user_id' });
  const { data: mem2 } = await bo.from('afluence_membership').select('role, ops_role').eq('user_id', userId).maybeSingle();
  ok('membership updated admin/paid', mem2?.role === 'admin' && mem2?.ops_role === 'paid');

  // LOGIN with new password
  const c2 = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data: li, error: le } = await c2.auth.signInWithPassword({ email: EMAIL2, password: 'second123' });
  ok('login with new email+password', !le && !!li?.session);

  // DELETE: auth + profile (cascade membership)
  const { error: de } = await admin.auth.admin.deleteUser(userId);
  ok('auth delete', !de);
  await bo.from('profile').delete().eq('id', userId);
  const { data: prof2 } = await bo.from('profile').select('id').eq('id', userId).maybeSingle();
  ok('profile removed', !prof2);
  const { data: mem3 } = await bo.from('afluence_membership').select('user_id').eq('user_id', userId).maybeSingle();
  ok('membership cascaded', !mem3);
  userId = null;
} catch (e) {
  console.error('ERROR', e.message ?? e); fail++;
} finally {
  if (userId) { try { await admin.auth.admin.deleteUser(userId); await bo.from('profile').delete().eq('id', userId); } catch {} }
}

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
