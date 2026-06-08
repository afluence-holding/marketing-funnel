#!/usr/bin/env node
/**
 * smoke-responses-nav.mjs — verifies the Responses module got the modular
 * sidebar (cross-org "Creadores" nav) and that the Centro sidebar surfaces a
 * "Respuestas" section linking to every creator.
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
const get = async (p) => { const r = await fetch(`${BASE}${p}`, { headers: { cookie }, redirect: 'manual' }); return { status: r.status, html: await r.text() }; };

let fail = 0;
const ok = (l, c) => { console.log(`${c ? 'PASS' : 'FAIL'} ${l}`); if (!c) fail++; };

// --- Responses page gets the modular sidebar ---
const r = await get('/bukku/main/responses');
ok(`responses 200 (got ${r.status})`, r.status === 200);
ok('responses uses centro surface', /centro-theme/.test(r.html));
ok('responses has launch-shell + sidebar', /launch-shell/.test(r.html) && /launch-sidebar/.test(r.html));
ok('responses "Creadores" section', r.html.includes('Creadores'));
ok('responses mobile toggle (☰ Creadores)', /launch-sb-toggle/.test(r.html) && /Creadores/.test(r.html));
for (const [label, href] of [['Bukku Education', '/bukku/main/responses'], ['Mamá Sin Caos', '/mama-sin-caos/main/responses'], ['Caro Fitness', '/caro-fitness/main/responses']]) {
  ok(`responses links creator "${label}"`, r.html.includes(label) && r.html.includes(`href="${href}"`));
}
ok('bukku is current (active navitem)', /launch-navitem active/.test(r.html));

// --- Centro sidebar surfaces a "Respuestas" section ---
const c = await get('/german-roz/di21/launch');
ok(`centro 200 (got ${c.status})`, c.status === 200);
ok('centro "Respuestas" section', c.html.includes('Respuestas'));
for (const href of ['/bukku/main/responses', '/mama-sin-caos/main/responses', '/caro-fitness/main/responses']) {
  ok(`centro links ${href}`, c.html.includes(`href="${href}"`));
}

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
