#!/usr/bin/env node
/**
 * create-users.mjs — provision Centro de Operaciones staff accounts.
 *
 * For each user: creates the Supabase auth user (email-confirmed), then upserts
 * the backoffice.profile (id == auth user id) and backoffice.afluence_membership
 * (internal staff role + ops_role). Idempotent: re-running updates the password
 * and re-links profile/membership for already-existing emails.
 *
 * Usage: node apps/admin/scripts/create-users.mjs
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
if (!URL || !KEY) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const admin = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const bo = createClient(URL, KEY, { db: { schema: 'backoffice' }, auth: { persistSession: false } });

const PASSWORD = 'admin123';
const USERS = [
  { email: 'Mauricioalcantara93@gmail.com', name: 'Mau A.',  handle: 'maua'  },
  { email: 'mauricio@byafluence.com',       name: 'Mau S.',  handle: 'maus'  },
  { email: 'tomas@byafluence.com',          name: 'Tomás H.', handle: 'tomas' },
  { email: 'pablo@byafluence.com',          name: 'Pablo',    handle: 'pablo' },
];

async function findUserByEmail(email) {
  // listUsers is paginated; scan until found (small user base).
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => (u.email ?? '').toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

let failed = 0;
for (const u of USERS) {
  try {
    let userId;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: u.name },
    });
    if (createErr) {
      // Likely already registered — find and reset password.
      const existing = await findUserByEmail(u.email);
      if (!existing) throw createErr;
      userId = existing.id;
      const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
        password: PASSWORD,
        email_confirm: true,
      });
      if (updErr) throw updErr;
      console.log(`~ ${u.email} already existed → password reset (${userId})`);
    } else {
      userId = created.user.id;
      console.log(`+ ${u.email} created (${userId})`);
    }

    // Decide which staff role to apply, preserving any prior intent:
    //  1) this auth user's existing membership (don't clobber on re-run)
    //  2) a placeholder profile sharing the same handle (designed role)
    //  3) default to admin for brand-new staff
    let role = 'admin';
    let opsRole = 'admin';
    const { data: selfMem } = await bo
      .from('afluence_membership').select('role, ops_role').eq('user_id', userId).maybeSingle();

    const { data: byHandle } = await bo
      .from('profile').select('id').eq('handle', u.handle).maybeSingle();
    if (byHandle && byHandle.id !== userId) {
      const { data: phMem } = await bo
        .from('afluence_membership').select('role, ops_role').eq('user_id', byHandle.id).maybeSingle();
      if (phMem) { role = phMem.role; opsRole = phMem.ops_role ?? opsRole; }
      // Drop the orphan placeholder (no auth login) so the handle frees up.
      const { error: delErr } = await bo.from('profile').delete().eq('id', byHandle.id);
      if (delErr) throw delErr;
      console.log(`  reassigned handle "${u.handle}" from placeholder ${byHandle.id}`);
    }
    if (selfMem) { role = selfMem.role; opsRole = selfMem.ops_role ?? opsRole; }

    const { error: profErr } = await bo.from('profile').upsert(
      { id: userId, user_kind: 'afluence', display_name: u.name, handle: u.handle, email: u.email },
      { onConflict: 'id' },
    );
    if (profErr) throw profErr;

    const { error: memErr } = await bo.from('afluence_membership').upsert(
      { user_id: userId, role, ops_role: opsRole },
      { onConflict: 'user_id' },
    );
    if (memErr) throw memErr;

    console.log(`  profile + afluence_membership(${role}/${opsRole}) linked for ${u.name}`);
  } catch (e) {
    failed++;
    console.error(`FAIL ${u.email}:`, e.message ?? e);
  }
}

console.log(failed === 0 ? '\nALL DONE' : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
