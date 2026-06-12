/**
 * Audit Mamá Sin Caos diagnóstico leads registered before the WhatsApp assign fix.
 * Compares lead capture vs pool assignment; notes we cannot verify actual WA group joins.
 */
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(import.meta.dirname, '..');
dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env'), override: true });

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'marketing' },
});

const SOURCE = 'landing-mama-sin-caos-diagnostico';
const POOL_KEY = 'webinar-2026-06-23';
/** Deploy verificado en prod ~11 jun 2026 17:00 UTC (commit fix rotación WA). */
const FIX_AT = '2026-06-11T17:00:00.000Z';
const ASSIGN_LAG_OK_MIN = 2;

function digits(p) {
  return String(p ?? '').replace(/\D/g, '');
}

function hasPhone(p) {
  return digits(p).length > 0;
}

const { data: pool, error: poolErr } = await db
  .from('whatsapp_group_pools')
  .select('id')
  .eq('org_key', 'mama-sin-caos')
  .eq('bu_key', 'main')
  .eq('pool_key', POOL_KEY)
  .single();
if (poolErr) throw poolErr;

const [{ data: leads }, { data: assignments }] = await Promise.all([
  db
    .from('leads')
    .select('id, email, first_name, phone, created_at, source')
    .eq('source', SOURCE)
    .order('created_at', { ascending: true }),
  db
    .from('whatsapp_group_assignments')
    .select('id, lead_id, phone, assigned_at, joined_at, group_id')
    .eq('pool_id', pool.id),
]);

const assignByLead = new Map();
const assignByPhone = new Map();
for (const a of assignments ?? []) {
  if (a.lead_id) assignByLead.set(a.lead_id, a);
  const p = digits(a.phone);
  if (p) assignByPhone.set(p, a);
}

function getAssign(lead) {
  return assignByLead.get(lead.id) ?? assignByPhone.get(digits(lead.phone)) ?? null;
}

function isQa(lead) {
  const email = String(lead.email ?? '').toLowerCase();
  return email.includes('example.com') || email.includes('byafluence.com') || email.includes('qa-');
}

function analyzeSegment(label, rows) {
  const real = rows.filter((l) => !isQa(l));
  const qa = rows.filter((l) => isQa(l));

  function classify(list) {
    const withPhone = list.filter((l) => hasPhone(l.phone));
    const noPhone = list.filter((l) => !hasPhone(l.phone));
    const neverAssigned = [];
    const assignedLate = [];
    const assignedOnTime = [];
    const assignedUnknownJoin = [];

    for (const lead of withPhone) {
      const a = getAssign(lead);
      if (!a) {
        neverAssigned.push(lead);
        continue;
      }
      const lagMin = (new Date(a.assigned_at).getTime() - new Date(lead.created_at).getTime()) / 60000;
      const row = { lead, assign: a, lagMin };
      if (a.joined_at) {
        assignedOnTime.push(row);
      } else if (lagMin <= ASSIGN_LAG_OK_MIN) {
        assignedOnTime.push(row);
      } else {
        assignedLate.push(row);
      }
      if (!a.joined_at) assignedUnknownJoin.push(row);
    }

    return { total: list.length, withPhone, noPhone, neverAssigned, assignedLate, assignedOnTime, assignedUnknownJoin };
  }

  return { label, real: classify(real), qa: classify(qa) };
}

const preFix = (leads ?? []).filter((l) => l.created_at < FIX_AT);
const postFix = (leads ?? []).filter((l) => l.created_at >= FIX_AT);

const pre = analyzeSegment('pre-fix', preFix);
const post = analyzeSegment('post-fix', postFix);

function printSegment(seg) {
  console.log(`\n## ${seg.label.toUpperCase()} (corte ${FIX_AT})\n`);
  for (const kind of ['real', 'qa']) {
    const b = seg[kind];
    const tag = kind === 'real' ? 'Usuarios reales' : 'QA / pruebas';
    console.log(`### ${tag}`);
    console.log(`  Registros: ${b.total}`);
    console.log(`  Con teléfono: ${b.withPhone.length} | Sin teléfono: ${b.noPhone.length}`);
    console.log(`  Sin asignación (no recibieron link): ${b.neverAssigned.length}`);
    console.log(`  Asignación tardía (> ${ASSIGN_LAG_OK_MIN} min, no vieron link en el quiz): ${b.assignedLate.length}`);
    console.log(`  Asignación al registrarse (≤ ${ASSIGN_LAG_OK_MIN} min): ${b.assignedOnTime.length}`);
    console.log(`  Con asignación pero join WA no confirmado (joined_at vacío): ${b.assignedUnknownJoin.length}`);
  }
}

function printList(title, rows, extra = (x) => '') {
  if (!rows.length) return;
  console.log(`\n### ${title} (${rows.length})`);
  for (const item of rows) {
    const lead = item.lead ?? item;
    const assign = item.assign;
    const lag = item.lagMin != null ? ` | lag ${Math.round(item.lagMin)}min` : '';
    const joined = assign ? ` | assigned ${assign.assigned_at}` : '';
    console.log(
      `- ${lead.created_at} | ${lead.first_name ?? ''} | ${lead.email} | ${lead.phone ?? '(sin tel)'}${joined}${lag}${extra(item)}`,
    );
  }
}

console.log('=== Auditoría pre-fix · Mamá Sin Caos diagnóstico ===');
console.log(`Total leads diagnóstico: ${leads?.length ?? 0}`);
console.log(`Asignaciones en pool: ${assignments?.length ?? 0}`);
console.log('Nota: joined_at no se usa (modo auto_count). No podemos saber quién entró de verdad al grupo WA.');

printSegment(pre);
printSegment(post);

printList('PRE-FIX reales · sin teléfono (imposible asignar)', pre.real.noPhone);
printList('PRE-FIX reales · con teléfono sin asignación', pre.real.neverAssigned);
printList('PRE-FIX reales · asignación tardía (link no en pantalla de resultado)', pre.real.assignedLate);
printList('PRE-FIX reales · asignación al registrarse (join WA desconocido)', pre.real.assignedOnTime);

console.log('\n=== CONCLUSIÓN PRE-FIX (usuarios reales) ===');
const r = pre.real;
const noLink = r.neverAssigned.length + r.noPhone.length;
const linkButUnknownJoin = r.assignedOnTime.length + r.assignedLate.length;
console.log(`Sin link de grupo en el flujo: ${noLink} (${r.noPhone.length} sin tel + ${r.neverAssigned.length} con tel sin assign)`);
console.log(`Recibieron link (assign existe): ${linkButUnknownJoin}`);
console.log(`Confirmados dentro del grupo WA: 0 (sistema no lo mide)`);
