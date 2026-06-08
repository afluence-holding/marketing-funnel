#!/usr/bin/env node
/**
 * smoke-centro-isolation.mjs — admin-wide branding + Centro surface checks.
 * The whole admin is light + branded per org: every module under a BU carries
 * the org accent. The Centro keeps its distinct `.centro-theme` surface; the
 * Campañas dashboard renders (no more 404) and does NOT carry centro-theme.
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

const ACCENT = /--color-accent:\s*#ff5e2b/i; // german-roz brand orange

const launch = await get('/german-roz/di21/launch');
ok(`launch 200 (got ${launch.status})`, launch.status === 200);
ok('launch carries centro-theme surface', /centro-theme/.test(launch.html));
ok('launch is org-branded (accent injected)', ACCENT.test(launch.html));

// The 404 fix: the Campañas dashboard now resolves on the unified `di21` BU.
const campaigns = await get('/german-roz/di21');
ok(`campaigns 200 (got ${campaigns.status})`, campaigns.status === 200);
ok('campaigns is org-branded (accent injected)', ACCENT.test(campaigns.html));
ok('campaigns has no centro-theme surface', !/centro-theme/.test(campaigns.html));

// Legacy /main path 308-redirects to the unified di21 path.
const legacy = await get('/german-roz/main/launch');
ok(`legacy /main/launch redirects (got ${legacy.status})`, legacy.status === 307 || legacy.status === 308);

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
