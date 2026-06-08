#!/usr/bin/env node
/**
 * smoke-centro-render.mjs — authenticated SSR render check.
 * Uses the real @supabase/ssr client to produce valid session cookies, then
 * fetches the launch page and asserts the new Centro de Operaciones content is
 * present (tabs, sensitivity matrix, a calendar reel, a message asset, Usuarios).
 *
 * Usage: node apps/admin/scripts/smoke-centro-render.mjs [baseUrl] [path]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServerClient } from '@supabase/ssr';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const BASE = process.argv[2] || 'http://localhost:3010';
const PATHN = process.argv[3] || '/german-roz/di21/launch';
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
const URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const jar = {};
const supa = createServerClient(URL, ANON, {
  cookies: {
    getAll: () => Object.entries(jar).map(([name, value]) => ({ name, value })),
    setAll: (arr) => arr.forEach(({ name, value }) => { jar[name] = value; }),
  },
});
const { error } = await supa.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (error) { console.error('login failed:', error.message); process.exit(1); }
const cookieHeader = Object.entries(jar).map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join('; ');

const res = await fetch(`${BASE}${PATHN}`, { headers: { cookie: cookieHeader }, redirect: 'manual' });
const html = await res.text();

let fail = 0;
const ok = (label, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${label}`); if (!cond) fail++; };
ok(`HTTP 200 (got ${res.status})`, res.status === 200);
ok('tab Calendario present', /Calendario/.test(html));
ok('tab Mensajes present', /Mensajes/.test(html));
ok('tab Usuarios present', /Usuarios/.test(html));
ok('tab Configuración present', /Configuraci/.test(html));
ok('sensitivity matrix header', /Compradores/.test(html));
ok('Ver como rol selector', /Ver como rol/.test(html));
ok('launch name rendered', /Desinfl/.test(html));

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
