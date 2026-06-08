#!/usr/bin/env node
/**
 * smoke-centro-sidebar.mjs — authenticated SSR check for the sectioned sidebar.
 * Asserts the Centro de Operaciones launch view renders the new module sidebar
 * (6 section headers, nav items w/ icons, mobile toggle + backdrop, shell grid)
 * and that it stays role-aware (admin sees every section).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServerClient } from '@supabase/ssr';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const BASE = process.argv[2] || 'http://localhost:3010';
const PATHN = process.argv[3] || '/german-roz/main/launch';
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
// branded light theme scope (org colors injected inline)
ok('centro-theme scope present', /centro-theme/.test(html));
ok('org accent injected (german-roz orange)', /--color-accent:\s*#ff5e2b/i.test(html));
// shell + sidebar containers
ok('launch-shell grid present', /launch-shell/.test(html));
ok('launch-sidebar present', /launch-sidebar/.test(html));
ok('launch-navitem present', /launch-navitem/.test(html));
ok('mobile toggle (☰ Módulos)', /Módulos/.test(html) && /launch-sb-toggle/.test(html));
ok('backdrop element present', /launch-sb-backdrop/.test(html));
// the 6 section headers (admin sees all)
for (const sec of ['Vista general', 'Estadísticas', 'Project Management', 'Marketing', 'Operaciones', 'Administración']) {
  ok(`section "${sec}"`, html.includes(sec));
}
// nav item labels (all 9 for super role)
for (const label of ['Resumen', 'KPIs', 'Tareas', 'Gantt', 'Calendario', 'Mensajes', 'Enlaces', 'Usuarios', 'Configuración']) {
  ok(`nav item "${label}"`, html.includes(label));
}
// BU admin modules surfaced in the sidebar (Campañas as a module link)
ok('Módulos section present', html.includes('Módulos'));
ok('Campañas module link', html.includes('Campañas'));
ok('Campañas links to campaigns route', /href="\/german-roz\/main"/.test(html));
// role selector moved into sidebar
ok('Ver como rol selector in sidebar', /launch-sb-role/.test(html) && /Ver como rol/.test(html));
// active item synced (resumen default)
ok('active nav item present', /launch-navitem active/.test(html));
// the old flat tab strip is gone (no leftover full-width <nav> tabs)
ok('default pane (Resumen) rendered', /Compradores/.test(html));

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
