#!/usr/bin/env node
/** Quick admin-wide theme check: login is light; a responses tenant renders
 * 200 and is branded with its org accent (proves the BU layout brands every
 * module, not just the Centro). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServerClient } from '@supabase/ssr';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const BASE = process.argv[2] || 'http://localhost:3010';
const EMAIL = process.env.SMOKE_EMAIL || 'nicolas@byafluence.com';
const PASSWORD = process.env.SMOKE_PASSWORD || 'adm123';
const env = {};
for (const f of ['.env', '.env.local']) {
  const p = path.join(ROOT, f); if (!fs.existsSync(p)) continue;
  for (const l of fs.readFileSync(p, 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
}
const jar = {};
const supa = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  cookies: { getAll: () => Object.entries(jar).map(([name, value]) => ({ name, value })), setAll: (arr) => arr.forEach(({ name, value }) => { jar[name] = value; }) },
});
const { error } = await supa.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (error) { console.error('login failed:', error.message); process.exit(1); }
const cookie = Object.entries(jar).map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join('; ');
const get = async (p, auth = true) => { const r = await fetch(`${BASE}${p}`, { headers: auth ? { cookie } : {}, redirect: 'manual' }); return { status: r.status, html: await r.text() }; };

let fail = 0;
const ok = (l, c) => { console.log(`${c ? 'PASS' : 'FAIL'} ${l}`); if (!c) fail++; };

const login = await get('/login', false);
ok(`login 200 (got ${login.status})`, login.status === 200);
ok('login uses light card (no dark zinc bg)', !/bg-zinc-900/.test(login.html));

const resp = await get('/bukku/main/responses');
ok(`responses 200 (got ${resp.status})`, resp.status === 200);
ok('responses is org-branded (accent injected)', /--color-accent:/.test(resp.html));

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
