#!/usr/bin/env node
/**
 * gen-launch-ops-seed.mjs
 * -----------------------------------------------------------------------------
 * Parses the DI21-C2 "Centro de Operaciones" HTML and emits an idempotent SQL
 * seed migration for the launch_ops schema (tasks + calendar + messages).
 *
 * Extracts:
 *   T, M, PH (embedded JS arrays)  -> tasks / channel+type meta / phases
 *   Calendario pane                -> content_item (IG day-by-day, master
 *                                     matrix, channel narratives, story seqs)
 *   Mensajes pane                  -> message_asset (copy assets + status +
 *                                     file path + linked task source_index refs)
 *
 * Idempotency / safety:
 *   - launch/phases     : upsert (ON CONFLICT)
 *   - tasks             : upsert by (launch_id, source_index); only STATIC fields
 *                         are refreshed — status/progress/version are NEVER
 *                         clobbered. Steps are inserted only for newly created
 *                         tasks (xmax=0 trick). Owners are seed-derived metadata
 *                         and are ALWAYS rebuilt (delete+reinsert) so the doc's
 *                         owner reassignments propagate to existing tasks too.
 *   - dependencies      : inserted only for newly created tasks.
 *   - kpis/resources    : ON CONFLICT DO NOTHING.
 *   - content_item      : seed-owned + read-first -> delete+reinsert per launch.
 *   - message_asset     : upsert by (launch_id, key) on static fields.
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
// Source doc (present in repo). Falls back to the non-copy name if it exists.
const SRC_CANDIDATES = [
  path.join(ROOT, 'docs', 'DI21-C2-Centro-Operaciones.html'),
  path.join(ROOT, 'docs', 'DI21-C2-Centro-Operaciones copy.html'),
];
const SRC = SRC_CANDIDATES.find((p) => fs.existsSync(p)) || SRC_CANDIDATES[0];
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

function stripTags(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Slice the inner HTML of <section ... id="pane-<id>"> ... </section>. */
function sliceSection(src, id) {
  const marker = `id="pane-${id}"`;
  const start = src.indexOf(marker);
  if (start === -1) return '';
  const open = src.indexOf('>', start) + 1;
  const end = src.indexOf('</section>', open);
  return src.slice(open, end === -1 ? src.length : end);
}

/** First <table>...</table> appearing after a given header text. */
function tableAfter(src, headerText) {
  const h = src.indexOf(headerText);
  if (h === -1) return '';
  const ts = src.indexOf('<table', h);
  if (ts === -1) return '';
  const te = src.indexOf('</table>', ts);
  return src.slice(ts, te === -1 ? src.length : te + 8);
}

/** Parse a table into rows of cell inner-HTML (handles th + td). */
function parseRows(tableHtml) {
  const rows = [];
  for (const tr of tableHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    const cells = [...tr[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((m) => m[1]);
    if (cells.length) rows.push(cells);
  }
  return rows;
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
  if (!mMatch) return { label, start: null, end: null };
  const mo = MONTHS[mMatch[1]];
  let m = s.match(/(\d{1,2})-(\d{1,2})(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/);
  if (m) return { label, start: iso(y, mo, +m[1]), end: iso(y, mo, +m[2]) };
  m = s.match(/≤?<?=?(\d{1,2})(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/);
  if (/≤|<=/.test(s) && m) return { label, start: null, end: iso(y, mo, +m[1]) };
  m = s.match(/(\d{1,2})(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/);
  if (m) { const d = +m[1]; return { label, start: iso(y, mo, d), end: iso(y, mo, d) }; }
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

// ---- static catalogs (Enlaces / KPIs / config) ----------------------------
const RESOURCES = [
  ['landings', 'l_reg', 'Landing registro + diagnóstico', 'nico'],
  ['landings', 'l_vsl', 'VSL / página de venta', 'nico'],
  ['landings', 'l_ty', 'Thank-you page', 'nico'],
  ['landings', 'l_checkout', 'Checkout Whop (producto $87)', 'maus'],
  ['landings', 'l_coupons', 'Cupones de precio ($67 / $77)', 'maus'],
  ['comms', 'l_wa1', 'Grupo WhatsApp — activo', 'elba'],
  ['comms', 'l_wa2', 'Grupo WhatsApp — reserva', 'elba'],
  ['comms', 'l_bot', 'Bot WhatsApp (panel/challenges)', 'nico'],
  ['comms', 'l_manychat', 'ManyChat (flow RETO)', 'nico'],
  ['comms', 'l_webinar', 'Sala del webinar (link en vivo)', 'nico'],
  ['comms', 'l_replay', 'Replay del webinar', 'german'],
  ['tracking', 'l_hyros', 'Hyros (dashboard)', 'nico'],
  ['tracking', 'l_meta', 'Meta Ads Manager', 'tomas'],
  ['tracking', 'l_ml', 'MailerLite', 'tomas'],
  ['tracking', 'l_whop', 'Whop (dashboard)', 'maus'],
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

// ---- parse Calendario -> content_item --------------------------------------
function buildContent(src) {
  const content = [];
  let pos = 0;
  const cal = sliceSection(src, 'calendario');

  // 1) Master channel matrix
  const matrix = tableAfter(cal, 'Vista maestra por canal');
  if (matrix) {
    const rows = parseRows(matrix);
    const headers = (rows[0] || []).map(stripTags); // [Canal, Pre, Webinar, ...]
    rows.slice(1).forEach((cells) => {
      const channel = stripTags(cells[0]);
      const body = cells.slice(1)
        .map((c, i) => `${headers[i + 1] || ''}: ${stripTags(c)}`)
        .join(' · ');
      content.push({ kind: 'matrix_row', channel, day_label: null, day: null, stage_label: null, title: channel, body, position: pos++ });
    });
  }

  // 2) IG day-by-day reels + stories
  const ig = tableAfter(cal, 'IG orgánico');
  if (ig) {
    const rows = parseRows(ig);
    rows.slice(1).forEach((cells) => {
      if (cells.length < 4) return;
      const dayLabel = stripTags(cells[0]);
      const stage = stripTags(cells[1]);
      const reel = stripTags(cells[2]);
      const stories = stripTags(cells[3]);
      const dm = dayLabel.match(/(\d{1,2})/);
      const day = dm ? iso(2026, 6, +dm[1]) : null;
      content.push({ kind: 'reel', channel: 'IG Orgánico', day_label: dayLabel, day, stage_label: stage, title: reel, body: stories, position: pos++ });
    });
  }

  // 3) channel narratives + story sequences (.seq blocks, tracking the section h2)
  const tokens = [...cal.matchAll(/<h2 class="sec">([\s\S]*?)<\/h2>|<div class="seq">/g)];
  let currentH2 = '';
  for (let i = 0; i < tokens.length; i++) {
    const tk = tokens[i];
    const next = tokens[i + 1];
    if (tk[1] !== undefined) { currentH2 = stripTags(tk[1]); continue; }
    const chunk = cal.slice(tk.index, next ? next.index : cal.length);
    const h4m = chunk.match(/<h4>([\s\S]*?)<\/h4>/);
    const h4 = h4m ? stripTags(h4m[1]) : '';
    const ps = [...chunk.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => stripTags(m[1]));
    const o = (chunk.match(/<div class="o">([\s\S]*?)<\/div>/) || [, ''])[1];
    const body = [stripTags(o), ...ps].filter(Boolean).join(' — ');
    const isSeq = /^\([a-z]\)/i.test(h4);
    const title = h4 || currentH2;
    content.push({
      kind: isSeq ? 'sequence' : 'message',
      channel: currentH2,
      day_label: null, day: null, stage_label: null,
      title, body, position: pos++,
    });
  }
  return content;
}

// ---- parse Mensajes -> message_asset ---------------------------------------
function buildMessages(src) {
  const out = [];
  const pane = sliceSection(src, 'mensajes');
  const tokens = [...pane.matchAll(/<div class="seq">/g)];
  tokens.forEach((tk, idx) => {
    const next = tokens[idx + 1];
    const chunk = pane.slice(tk.index, next ? next.index : pane.length);
    const h4raw = (chunk.match(/<h4>([\s\S]*?)<\/h4>/) || [, ''])[1];
    const oRaw = (chunk.match(/<div class="o">([\s\S]*?)<\/div>/) || [, ''])[1];
    const ps = [...chunk.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => stripTags(m[1]));
    const status = /listo/i.test(h4raw) ? 'ready' : 'todo';
    const title = stripTags(h4raw.replace(/<span[\s\S]*?<\/span>/g, ''));
    const code = (oRaw.match(/<code>([\s\S]*?)<\/code>/) || [, null])[1];
    const filePath = code ? stripTags(code) : null;
    const taskRefs = [...oRaw.matchAll(/#(\d+)/g)].map((m) => +m[1]);
    const summary = ps.join(' ');
    const key = `m_${idx + 1}`;
    out.push({ key, title, channel: stripTags(oRaw).slice(0, 0) || null, status, file_path: filePath, summary, task_refs: taskRefs, position: idx });
  });
  return out;
}

// ---- main ------------------------------------------------------------------
const src = fs.readFileSync(SRC, 'utf8');
const T = extractArray(src, 'T');
const M = extractArray(src, 'M');
const PH = extractArray(src, 'PH');
const CONTENT = buildContent(src);
const MESSAGES = buildMessages(src);

if (M.length !== T.length) {
  console.warn(`WARN: M length (${M.length}) != T length (${T.length})`);
}

const lines = [];
lines.push('-- ============================================================================');
lines.push(`-- Migration: launch_ops seed — ${LAUNCH_CODE} (GENERATED — do not edit by hand)`);
lines.push('-- ----------------------------------------------------------------------------');
lines.push(`-- Source: ${path.relative(ROOT, SRC)}`);
lines.push('-- Generator: apps/admin/scripts/gen-launch-ops-seed.mjs');
lines.push('-- Idempotent: upserts launch/phases/kpis/resources; tasks upserted by');
lines.push('-- (launch_id, source_index) refreshing only STATIC fields (never status/');
lines.push('-- progress/version); steps/owners/deps inserted only for new tasks.');
lines.push('-- content_item delete+reinsert (seed-owned); message_asset upsert by key.');
lines.push('-- ============================================================================');
lines.push('');
lines.push('DO $seed$');
lines.push('DECLARE');
lines.push('  v_launch uuid;');
lines.push('  v_phase  jsonb := \'{}\'::jsonb;');
lines.push('  v_tasks  jsonb := \'{}\'::jsonb;');
lines.push('  v_new    jsonb := \'{}\'::jsonb;');
lines.push('  v_id     uuid;');
lines.push('  v_isnew  boolean;');
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
lines.push('  -- tasks (upsert by source_index; new-ness via xmax=0) ----------------------');

T.forEach((tk, i) => {
  const srcIdx = i + 1;
  const meta = M[i] || ['', 'Infra'];
  const channel = meta[0];
  const ws = WS[meta[1]] || null;
  const due = parseDue(tk.d);
  const phaseExpr = `(v_phase->>${sql(tk.ph)})::uuid`;
  lines.push(`  -- #${srcIdx} [${tk.ph}] ${tk.t.slice(0, 56).replace(/\n/g, ' ')}`);
  lines.push(`  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)`);
  lines.push(`  VALUES (v_launch, ${phaseExpr}, ${srcIdx}, ${sql(tk.t)}, ${sql(tk.obj)}, ${sql(tk.crit)}, ${sql(channel)}, ${ws ? sql(ws) : 'NULL'}, ${sql(due.label)}, ${due.start ? sql(due.start) : 'NULL'}, ${due.end ? sql(due.end) : 'NULL'}, ${srcIdx})`);
  lines.push(`  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET`);
  lines.push(`    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,`);
  lines.push(`    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,`);
  lines.push(`    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,`);
  lines.push(`    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position`);
  lines.push(`  RETURNING id, (xmax = 0) INTO v_id, v_isnew;`);
  lines.push(`  v_tasks := jsonb_set(v_tasks, ARRAY['${srcIdx}'], to_jsonb(v_id::text));`);
  lines.push(`  v_new  := jsonb_set(v_new,  ARRAY['${srcIdx}'], to_jsonb(v_isnew));`);
  lines.push(`  IF v_isnew THEN`);
  (tk.steps || []).forEach((st, si) => {
    lines.push(`    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, ${si}, ${sql(st)});`);
  });
  lines.push(`  END IF;`);
  // Owners are seed-derived metadata (not runtime state): always rebuild so the
  // doc's owner reassignments propagate to existing tasks without clobbering
  // status/progress/version.
  lines.push(`  DELETE FROM launch_ops.task_owner WHERE task_id = v_id;`);
  (tk.o || []).forEach((o) => {
    lines.push(`  INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, ${sql(o)}) ON CONFLICT DO NOTHING;`);
  });
  lines.push('');
});

lines.push('  -- dependencies (only for newly created tasks) ------------------------------');
T.forEach((tk, i) => {
  const srcIdx = i + 1;
  const dep = parseDep(tk.dep);
  if (dep.refs.length) {
    dep.refs.forEach((r) => {
      lines.push(`  IF (v_new->>'${srcIdx}')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'${srcIdx}')::uuid, (v_tasks->>'${r}')::uuid); END IF;`);
    });
  } else if (dep.note) {
    lines.push(`  IF (v_new->>'${srcIdx}')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'${srcIdx}')::uuid, ${sql(dep.note)}); END IF;`);
  }
});
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
  lines.push(`  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, ${sql(category)}, ${sql(key)}, ${sql(label)}, ${owner ? sql(owner) : 'NULL'}, ${idx}) ON CONFLICT (launch_id, key) DO UPDATE SET category = EXCLUDED.category, label = EXCLUDED.label, owner_key = EXCLUDED.owner_key, position = EXCLUDED.position;`);
});
lines.push('');
lines.push('  -- content_item (Calendario): seed-owned, read-first -> delete + reinsert ----');
lines.push('  DELETE FROM launch_ops.content_item WHERE launch_id = v_launch;');
CONTENT.forEach((c) => {
  lines.push(`  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, ${sql(c.kind)}, ${sql(c.channel)}, ${c.day ? sql(c.day) : 'NULL'}, ${sql(c.day_label)}, ${sql(c.stage_label)}, ${sql(c.title)}, ${sql(c.body)}, ${c.position});`);
});
lines.push('');
lines.push('  -- message_asset (Mensajes): upsert by key on static fields ------------------');
MESSAGES.forEach((m) => {
  const refs = m.task_refs.length ? `'{${m.task_refs.join(',')}}'` : `'{}'`;
  lines.push(`  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, ${sql(m.key)}, ${sql(m.title)}, ${sql(m.channel)}, ${sql(m.status)}, ${sql(m.file_path)}, ${sql(m.summary)}, ${refs}, ${m.position}) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;`);
});
lines.push('');
lines.push('END $seed$;');
lines.push('');

fs.writeFileSync(OUT, lines.join('\n'));
console.log(`Wrote ${OUT}`);
console.log(`Source: ${path.relative(ROOT, SRC)}`);
console.log(`Tasks: ${T.length} | Phases: ${PH.length} | KPIs: ${KPIS.length} | Resources: ${RESOURCES.length}`);
console.log(`Content items: ${CONTENT.length} | Messages: ${MESSAGES.length}`);
