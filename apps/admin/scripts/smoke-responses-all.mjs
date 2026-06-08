#!/usr/bin/env node
/**
 * smoke-responses-all.mjs — authenticated front QA across every Responses tenant.
 *
 * For each configured tenant it asserts: 200 OK, the Centro surface (centro-theme
 * + launch-shell + launch-sidebar), the "Creadores" cross-org nav, a branded
 * accent badge (not the legacy badge-blue), no `--color-surface` leak, and the
 * presence of the records table. German additionally must expose the landing
 * facet select.
 *
 * Usage: node apps/admin/scripts/smoke-responses-all.mjs [baseUrl]
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
const cookie = Object.entries(jar).map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join('; ');

const TENANTS = [
  { path: '/bukku/main/responses', creator: 'Bukku Education' },
  { path: '/mama-sin-caos/main/responses', creator: 'Mamá Sin Caos' },
  { path: '/caro-fitness/main/responses', creator: 'Caro Fitness', status: true },
  { path: '/german-roz/di21/responses', creator: 'German Roz', facet: true },
];

let fail = 0;
const ok = (label, cond) => { console.log(`  ${cond ? 'PASS' : 'FAIL'} ${label}`); if (!cond) fail++; };

for (const t of TENANTS) {
  console.log(`\n== ${t.path} ==`);
  const res = await fetch(`${BASE}${t.path}`, { headers: { cookie }, redirect: 'manual' });
  const html = await res.text();
  ok(`HTTP 200 (got ${res.status})`, res.status === 200);
  ok('centro-theme surface', /centro-theme/.test(html));
  ok('launch-shell + sidebar', /launch-shell/.test(html) && /launch-sidebar/.test(html));
  ok('Creadores section', /Creadores/.test(html));
  ok(`creator label "${t.creator}"`, html.includes(t.creator));
  ok('records table present', /<table/.test(html));
  ok('branded accent badge (no badge-blue)', /badge-accent/.test(html) && !/badge-blue/.test(html));
  ok('no --color-surface leak', !/--color-surface/.test(html));
  if (t.status) ok('status chips (launch-chip)', /launch-chip/.test(html) && /Completados|En progreso/.test(html));
  if (t.facet) {
    ok('Campañas section + landing in sidebar', /Campa(ñ|&ntilde;|&#241;)as/.test(html) && /landing-german-roz/.test(html));
    // status-less source: stat cards break the total down by landing
    ok('landing breakdown stat cards', /Form/.test(html) && /Webinar/.test(html));
  }
  // small delay to avoid auth rate limits between fetches
  await new Promise((r) => setTimeout(r, 200));
}

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
