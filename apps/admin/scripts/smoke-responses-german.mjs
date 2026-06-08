#!/usr/bin/env node
/**
 * smoke-responses-german.mjs — authenticated SSR render check for German's
 * Responses module. German's intake lives in the shared CRM `marketing.leads`
 * (scoped by org id) rather than a dedicated creator table, so this verifies the
 * org-filtered source loads and renders.
 *
 * Usage: node apps/admin/scripts/smoke-responses-german.mjs [baseUrl]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServerClient } from '@supabase/ssr';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const BASE = process.argv[2] || 'http://localhost:3010';
const PATHN = '/german-roz/di21/responses';
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
ok('Respuestas header', /Respuestas/.test(html));
ok('German Roz creator label', /German Roz/.test(html));
ok('Landing column header', /Landing/.test(html));
ok('NOT the empty-state message', !/No hay fuentes de respuestas configuradas/.test(html));
ok('shows landing source value', /landing-german-roz/.test(html));
ok('Respuestas tab in module bar', /Respuestas/.test(html));

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
