#!/usr/bin/env node
/**
 * smoke-centro-isolation.mjs — confirms the light `.centro-theme` scope does
 * NOT leak into other admin modules. The launch view must carry centro-theme;
 * the responses module must stay on the global dark theme (no centro-theme).
 */
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
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const jar = {};
const supa = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  cookies: {
    getAll: () => Object.entries(jar).map(([name, value]) => ({ name, value })),
    setAll: (arr) => arr.forEach(({ name, value }) => { jar[name] = value; }),
  },
});
const { error } = await supa.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (error) { console.error('login failed:', error.message); process.exit(1); }
const cookie = Object.entries(jar).map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join('; ');

async function get(p) {
  const res = await fetch(`${BASE}${p}`, { headers: { cookie }, redirect: 'manual' });
  return { status: res.status, html: await res.text() };
}

let fail = 0;
const ok = (label, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${label}`); if (!cond) fail++; };

const launch = await get('/german-roz/main/launch');
ok(`launch 200 (got ${launch.status})`, launch.status === 200);
ok('launch carries centro-theme', /centro-theme/.test(launch.html));

const responses = await get('/german-roz/main/responses');
ok(`responses 200 (got ${responses.status})`, responses.status === 200);
ok('responses stays dark (no centro-theme leak)', !/centro-theme/.test(responses.html));

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
