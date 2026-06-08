#!/usr/bin/env node
/**
 * smoke-centro-roles.mjs — assert the refreshed role + owner taxonomy renders.
 * Authenticated SSR fetch of the launch page; checks new role labels (Config
 * matrix), new owner labels (Tareas filter) and the new staff directory.
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
const jar = {};
const supa = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
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
// new role labels (Configuración matrix + Ver como rol selector)
ok('role label Paid / Trafficker', /Paid \/ Trafficker/.test(html));
ok('role label Comunidad / WhatsApp', /Comunidad \/ WhatsApp/.test(html));
ok('role label Creator', /Creator/.test(html));
ok('role label Orgánico present', /Org[aá]nico/.test(html));
ok('retired role marketing gone', !/>Marketing<\/option>|>Marketing<\/th>/.test(html));
// staff directory split (serialized props): Mau A. (Paid) + Mau S. (Support)
ok('staff Mau A. (split)', /Mau A\./.test(html));
ok('staff Mau S. (split)', /Mau S\./.test(html));
ok('staff Nico J.', /Nico J\./.test(html));
// new owner_key tokens in serialized task owners (Tareas labels render client-side)
ok('owner key maua present', /\bmaua\b/.test(html));
ok('owner key maus present', /\bmaus\b/.test(html));
ok('retired ops_role marketing/operaciones gone', !/"ops_role":"(marketing|operaciones)"|"opsRole":"(marketing|operaciones)"/.test(html));

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
