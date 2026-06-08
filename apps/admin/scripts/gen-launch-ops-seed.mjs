#!/usr/bin/env node
/**
 * gen-launch-ops-seed.mjs
 * -----------------------------------------------------------------------------
 * Parses docs/DI21-C2-Centro-Operaciones.html and emits an idempotent SQL seed
 * migration for the launch_ops schema.
 *
 * It extracts the embedded JS arrays (T, M, PH) and the OWN map, normalizes:
 *   - source_index   : 1-based array index (stable ref used by dependencies)
 *   - dependencies   : "#n" refs -> depends_on_task_id; free text -> note
 *   - due_label/start/end : best-effort date parse (year 2026)
 *   - workstream     : Orgánico/Inorgánico/Infra -> organico/inorganico/infra
 *   - channel        : M[i][0]
 *
 * Output is wrapped in a single DO $seed$ block that:
 *   - upserts launch + phases
 *   - seeds tasks/steps/owners/deps ONLY if the launch has no tasks yet
 *     (so re-running never clobbers live status/progress)
 *   - upserts kpis + resources with ON CONFLICT DO NOTHING
 *
 * Usage:  node apps/admin/scripts/gen-launch-ops-seed.mjs
 * Output: packages/db/src/migrations/20260608000200_launch_ops_seed_di21_c2.sql
 * -----------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..');
const SRC = path.join(ROOT, 'docs', 'DI21-C2-Centro-Operaciones.html');
const OUT = path.join(ROOT, 'packages', 'db', 'src', 'migrations', '20260608000200_launch_ops_seed_di21_c2.sql');

const LAUNCH_CODE = 'DI21-C2';

// ---- helpers ---------------------------------------------------------------

/** Extract a JS array literal assigned to `const <name>=` using a bracket scanner. */
function extractArray(src, name) {
  const marker = `const ${name}=`;
  const start = src.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${marker}`);
  let i = src.indexOf('[', start);
  if (i === -1) throw new Error(`No [ after ${marker}`);
  const begin = i;
  let depth = 0;
  let inStr = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { i++; break; } }
  }
  const literal = src.slice(begin, i);
  // eslint-disable-next-line no-new-func
  return Function(`"use strict";return (${literal});`)();
}

function sql(s) {
  if (s === null || s === undefined) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

const MONTHS = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12 };
function iso(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Best-effort parse of human due labels into {start,end}. Year 2026. */
function parseDue(raw) {
  const label = raw;
  const s = String(raw).toLowerCase().replace(/–|—/g, '-').replace(/\s+/g, '');
  const y = 2026;
  const monthRe = /(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/;
  const mMatch = s.match(monthRe);
  if (!mMatch) return { label, start: null, end: null }; // "hoy", "diariocarrito", etc.
  const mo = MONTHS[mMatch[1]];

  // range "a-bMMM"  e.g. 7-9jun, 17-21jul, 10-30jun
  let m = s.match(/(\d{1,2})-(\d{1,2})(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/);
  if (m) return { label, start: iso(y, mo, +m[1]), end: iso(y, mo, +m[2]) };

  // "<=NNmmm" e.g. ≤29jun, ≤1jul  -> end only
  m = s.match(/≤?<?=?(\d{1,2})(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/);
  if (/≤|<=/.test(s) && m) return { label, start: null, end: iso(y, mo, +m[1]) };

  // single "NNmmm" e.g. 10jun, 30jun, 14jul
  m = s.match(/(\d{1,2})(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/);
  if (m) {
    const d = +m[1];
    return { label, start: iso(y, mo, d), end: iso(y, mo, d) };
  }
  return { label, start: null, end: null };
}

/** Parse dependency free text -> {refs:number[], note:string|null}. */
function parseDep(dep) {
  if (!dep) return { refs: [], note: null };
  const refs = [...dep.matchAll(/#(\d+)/g)].map((x) => +x[1]);
  if (refs.length) return { refs, note: null };
  return { refs: [], note: dep };
}

const WS = { 'Orgánico': 'organico', 'Inorgánico': 'inorganico', 'Infra': 'infra' };

// ---- static resource catalog (from the Enlaces section) --------------------
const RESOURCES = [
  ['landings', 'l_reg', 'Landing registro + diagnóstico', 'nico'],
  ['landings', 'l_vsl', 'VSL / página de venta', 'mau'],
  ['landings', 'l_ty', 'Thank-you page', 'nico'],
  ['landings', 'l_checkout', 'Checkout Whop (producto $87)', 'mau'],
  ['landings', 'l_coupons', 'Cupones de precio ($67 / $77)', 'mau'],
  ['comms', 'l_wa1', 'Grupo WhatsApp — activo', 'mau'],
  ['comms', 'l_wa2', 'Grupo WhatsApp — reserva', 'mau'],
  ['comms', 'l_bot', 'Bot WhatsApp (panel/challenges)', 'nico'],
  ['comms', 'l_manychat', 'ManyChat (flow RETO)', 'nico'],
  ['comms', 'l_webinar', 'Sala del webinar (link en vivo)', 'nico'],
  ['comms', 'l_replay', 'Replay del webinar', 'german'],
  ['tracking', 'l_hyros', 'Hyros (dashboard)', 'nico'],
  ['tracking', 'l_meta', 'Meta Ads Manager', 'tomas'],
  ['tracking', 'l_ml', 'MailerLite', 'tomas'],
  ['tracking', 'l_whop', 'Whop (dashboard)', 'mau'],
  ['tracking', 'l_ig', 'Instagram de Germán', 'german'],
  ['assets', 'l_drive', 'Drive de creativos', 'tomas'],
  ['assets', 'l_recetario', 'Recetario (entrega)', 'german'],
  ['assets', 'l_quiz', 'Diagnóstico / Quiz', 'nico'],
  ['docs', 'l_d1', 'Brief AISLADO (maestro)', null],
  ['docs', 'l_d2', 'Secuencias de Email (16)', null],
  ['docs', 'l_d3', 'Estructura de Grabación', null],
  ['docs', 'l_d4', 'Matriz de Permutaciones', null],
  ['docs', 'l_d5', 'Checklist de Tracking (Hyros)', null],
  ['docs', 'l_d6', 'Dev-brief del tracker', null],
  ['docs', 'l_d7', 'Análisis playbooks', null],
];

const KPIS = [
  ['registros', 'Registros', '~7–8K', '#', false, null],
  ['show_up', 'Show-up %', '25–40%', '%', false, null],
  ['compradores', 'Compradores reto', '800', '#', false, null],
  ['conv_ht', '% Conversión a HT', '6%', '%', false, null],
  ['roas', 'ROAS real (Hyros)', 'source of truth', 'x', false, null],
  ['revenue', 'Revenue estimado C2', '~$90K', '$', true, 'compradores*76 + compradores*(conv_ht/100)*580'],
];

const LAUNCH_CONFIG = {
  thesis_target_usd: 90000,
  price_ladder: ['$67', '$77', '$87'],
  avg_price_usd: 76,
  upsell_ht_usd: 580,
  dates: {
    announce: '2026-06-06',
    webinar: '2026-06-10',
    cart: ['2026-06-10', '2026-06-30'],
    reto_start: '2026-07-01',
    upsell_ht: ['2026-07-17', '2026-07-21'],
  },
};

// ---- main ------------------------------------------------------------------
const src = fs.readFileSync(SRC, 'utf8');
const T = extractArray(src, 'T');
const M = extractArray(src, 'M');
const PH = extractArray(src, 'PH');

if (M.length !== T.length) {
  console.warn(`WARN: M length (${M.length}) != T length (${T.length})`);
}

const lines = [];
lines.push('-- ============================================================================');
lines.push(`-- Migration: launch_ops seed — ${LAUNCH_CODE} (GENERATED — do not edit by hand)`);
lines.push('-- ----------------------------------------------------------------------------');
lines.push('-- Source: docs/DI21-C2-Centro-Operaciones.html');
lines.push('-- Generator: apps/admin/scripts/gen-launch-ops-seed.mjs');
lines.push('-- Idempotent: upserts launch/phases/kpis/resources; seeds tasks only when');
lines.push('-- the launch has zero tasks (never clobbers live status/progress on re-run).');
lines.push('-- ============================================================================');
lines.push('');
lines.push('DO $seed$');
lines.push('DECLARE');
lines.push('  v_launch uuid;');
lines.push('  v_phase  jsonb := \'{}\'::jsonb;');
lines.push('  v_tasks  jsonb := \'{}\'::jsonb;');
lines.push('  v_id     uuid;');
lines.push('BEGIN');
lines.push('  -- launch -------------------------------------------------------------------');
lines.push(`  INSERT INTO launch_ops.launch (code, name, brand, organizer_slug, bu_slug, status, starts_on, ends_on, config)`);
lines.push(`  VALUES (${sql(LAUNCH_CODE)}, ${sql('Desinflámate 21 · Cohort 2')}, ${sql('german-roz')}, ${sql('german-roz')}, ${sql('main')}, 'active', '2026-06-06', '2026-07-21', ${sql(JSON.stringify(LAUNCH_CONFIG))}::jsonb)`);
lines.push(`  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, config = EXCLUDED.config, updated_at = now()`);
lines.push('  RETURNING id INTO v_launch;');
lines.push('');
lines.push('  -- phases -------------------------------------------------------------------');
PH.forEach((p, idx) => {
  lines.push(`  INSERT INTO launch_ops.phase (launch_id, code, name, position) VALUES (v_launch, ${sql(p.id)}, ${sql(p.n)}, ${idx})`);
  lines.push(`  ON CONFLICT (launch_id, code) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position RETURNING id INTO v_id;`);
  lines.push(`  v_phase := jsonb_set(v_phase, ARRAY[${sql(p.id)}], to_jsonb(v_id::text));`);
});
lines.push('');
lines.push('  -- guard: only seed tasks if none exist for this launch ---------------------');
lines.push('  IF (SELECT count(*) FROM launch_ops.task WHERE launch_id = v_launch) = 0 THEN');
lines.push('');

T.forEach((tk, i) => {
  const srcIdx = i + 1;
  const meta = M[i] || ['', 'Infra'];
  const channel = meta[0];
  const ws = WS[meta[1]] || null;
  const due = parseDue(tk.d);
  const phaseExpr = `(v_phase->>${sql(tk.ph)})::uuid`;
  lines.push(`    -- #${srcIdx} [${tk.ph}] ${tk.t.slice(0, 60).replace(/\n/g, ' ')}`);
  lines.push(`    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)`);
  lines.push(`    VALUES (v_launch, ${phaseExpr}, ${srcIdx}, ${sql(tk.t)}, ${sql(tk.obj)}, ${sql(tk.crit)}, ${sql(channel)}, ${ws ? sql(ws) : 'NULL'}, ${sql(due.label)}, ${due.start ? sql(due.start) : 'NULL'}, ${due.end ? sql(due.end) : 'NULL'}, ${srcIdx})`);
  lines.push(`    RETURNING id INTO v_id;`);
  lines.push(`    v_tasks := jsonb_set(v_tasks, ARRAY['${srcIdx}'], to_jsonb(v_id::text));`);
  // steps
  (tk.steps || []).forEach((st, si) => {
    lines.push(`    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, ${si}, ${sql(st)});`);
  });
  // owners
  (tk.o || []).forEach((o) => {
    lines.push(`    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, ${sql(o)}) ON CONFLICT DO NOTHING;`);
  });
  lines.push('');
});

// dependencies (resolved after all tasks inserted)
lines.push('    -- dependencies -----------------------------------------------------------');
T.forEach((tk, i) => {
  const srcIdx = i + 1;
  const dep = parseDep(tk.dep);
  if (dep.refs.length) {
    dep.refs.forEach((r) => {
      lines.push(`    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'${srcIdx}')::uuid, (v_tasks->>'${r}')::uuid);`);
    });
  } else if (dep.note) {
    lines.push(`    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'${srcIdx}')::uuid, ${sql(dep.note)});`);
  }
});

lines.push('  END IF;');
lines.push('');
lines.push('  -- kpis ----------------------------------------------------------------------');
KPIS.forEach((k, idx) => {
  const [key, label, target, unit, computed, formula] = k;
  lines.push(`  INSERT INTO launch_ops.kpi (launch_id, key, label, target_label, unit, is_computed, formula, position) VALUES (v_launch, ${sql(key)}, ${sql(label)}, ${sql(target)}, ${sql(unit)}, ${computed}, ${formula ? sql(formula) : 'NULL'}, ${idx}) ON CONFLICT (launch_id, key) DO NOTHING;`);
});
lines.push('');
lines.push('  -- resources ------------------------------------------------------------------');
RESOURCES.forEach((r, idx) => {
  const [category, key, label, owner] = r;
  lines.push(`  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, ${sql(category)}, ${sql(key)}, ${sql(label)}, ${owner ? sql(owner) : 'NULL'}, ${idx}) ON CONFLICT (launch_id, key) DO NOTHING;`);
});
lines.push('');
lines.push('END $seed$;');
lines.push('');

fs.writeFileSync(OUT, lines.join('\n'));
console.log(`Wrote ${OUT}`);
console.log(`Tasks: ${T.length} | Phases: ${PH.length} | KPIs: ${KPIS.length} | Resources: ${RESOURCES.length}`);
