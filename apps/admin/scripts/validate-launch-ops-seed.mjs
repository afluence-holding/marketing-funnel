#!/usr/bin/env node
/**
 * validate-launch-ops-seed.mjs
 * Deterministic integrity checks on the DI21 source doc + generated seed.
 * No DB required. Exits non-zero on any failure.
 *
 * Usage: node apps/admin/scripts/validate-launch-ops-seed.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..');
const SRC = path.join(ROOT, 'docs', 'DI21-C2-Centro-Operaciones.html');
const SEED = path.join(ROOT, 'packages', 'db', 'src', 'migrations', '20260608000200_launch_ops_seed_di21_c2.sql');

function extractArray(src, name) {
  const start = src.indexOf(`const ${name}=`);
  let i = src.indexOf('[', start);
  const begin = i;
  let depth = 0;
  let inStr = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (c === '\\') { i++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { i++; break; } }
  }
  return Function(`"use strict";return (${src.slice(begin, i)});`)();
}

const OWNERS = new Set(['nico', 'mau', 'german', 'tomas', 'elba']);
const TIPOS = new Set(['Orgánico', 'Inorgánico', 'Infra']);

const errors = [];
const warnings = [];
function check(cond, msg) { if (!cond) errors.push(msg); }

const src = fs.readFileSync(SRC, 'utf8');
const T = extractArray(src, 'T');
const M = extractArray(src, 'M');
const PH = extractArray(src, 'PH');
const phaseIds = new Set(PH.map((p) => p.id));

check(T.length === 58, `expected 58 tasks, got ${T.length}`);
check(PH.length === 6, `expected 6 phases, got ${PH.length}`);
check(M.length === T.length, `M length ${M.length} != T length ${T.length}`);

T.forEach((tk, i) => {
  const n = i + 1;
  check(phaseIds.has(tk.ph), `#${n} unknown phase '${tk.ph}'`);
  check(typeof tk.t === 'string' && tk.t.length > 0, `#${n} missing title`);
  check(typeof tk.crit === 'string' && tk.crit.length > 0, `#${n} missing definition_of_done`);
  check(Array.isArray(tk.o) && tk.o.length > 0, `#${n} has no owners`);
  (tk.o || []).forEach((o) => check(OWNERS.has(o), `#${n} unknown owner '${o}'`));
  const tipo = (M[i] || [])[1];
  check(TIPOS.has(tipo), `#${n} unknown tipo '${tipo}'`);
  // dependency refs must point to a valid source_index
  const refs = [...String(tk.dep || '').matchAll(/#(\d+)/g)].map((x) => +x[1]);
  refs.forEach((r) => check(r >= 1 && r <= T.length, `#${n} dep ref #${r} out of range`));
  if (!refs.length && tk.dep) warnings.push(`#${n} free-text dependency: "${tk.dep}"`);
});

// phase distribution
const byPhase = {};
T.forEach((tk) => { byPhase[tk.ph] = (byPhase[tk.ph] || 0) + 1; });

// seed file sanity
const seed = fs.existsSync(SEED) ? fs.readFileSync(SEED, 'utf8') : '';
check(seed.length > 0, 'seed SQL not generated — run gen-launch-ops-seed.mjs');
if (seed) {
  const insertTasks = (seed.match(/INSERT INTO launch_ops\.task \(/g) || []).length;
  check(insertTasks === T.length, `seed has ${insertTasks} task inserts, expected ${T.length}`);
  check((seed.match(/DO \$seed\$/g) || []).length === 1, 'seed must have exactly one DO $seed$ block');
  check(seed.trim().endsWith('END $seed$;'), 'seed must close the DO block');
}

console.log('Launch Ops seed validation');
console.log('  tasks:', T.length, '| phases:', PH.length, '| by phase:', JSON.stringify(byPhase));
console.log('  warnings:', warnings.length);
warnings.forEach((w) => console.log('    -', w));
if (errors.length) {
  console.error('FAILED with', errors.length, 'error(s):');
  errors.forEach((e) => console.error('    x', e));
  process.exit(1);
}
console.log('OK — all integrity checks passed.');
