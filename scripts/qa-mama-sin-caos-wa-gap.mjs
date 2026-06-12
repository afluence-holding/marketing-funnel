import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(import.meta.dirname, '..');
dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env'), override: true });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = createClient(url, key, { db: { schema: 'marketing' } });

function normPhone(p) {
  return String(p ?? '').replace(/\D/g, '');
}

function hasPhone(p) {
  return normPhone(p).length > 0;
}

const { data: pools, error: poolErr } = await db
  .from('whatsapp_group_pools')
  .select('id, pool_key, capacity')
  .eq('org_key', 'mama-sin-caos')
  .eq('bu_key', 'main')
  .eq('pool_key', 'webinar-2026-06-23')
  .limit(1);

if (poolErr) throw poolErr;
const pool = pools?.[0];
if (!pool) {
  console.error('Pool not found');
  process.exit(1);
}

const [{ data: groups }, { data: assignments }, { data: crmLeads }, { data: legacyLeads }] =
  await Promise.all([
    db.from('whatsapp_groups').select('id, label, position, assigned_count, member_count, is_full').eq('pool_id', pool.id).order('position'),
    db.from('whatsapp_group_assignments').select('id, lead_id, phone, assigned_at, joined_at, group_id').eq('pool_id', pool.id),
    db.from('leads').select('id, email, phone, first_name, created_at, source').eq('source', 'landing-mama-sin-caos-diagnostico'),
    db.from('mama_sin_caos_leads').select('id, email, phone, first_name, created_at, source'),
  ]);

const assignmentByPhone = new Set();
const assignmentByLeadId = new Set();
for (const a of assignments ?? []) {
  const phone = normPhone(a.phone);
  if (phone) assignmentByPhone.add(phone);
  if (a.lead_id) assignmentByLeadId.add(a.lead_id);
}

function isAssigned(lead) {
  return assignmentByPhone.has(normPhone(lead.phone)) || assignmentByLeadId.has(lead.id);
}

const legacyDiagnostico = (legacyLeads ?? []).filter(
  (l) =>
    l.source === 'landing-mama-sin-caos-diagnostico' ||
    String(l.source ?? '').toLowerCase().includes('diagnostico'),
);

function analyzeLeads(label, rows) {
  const total = rows.length;
  const withPhone = rows.filter((l) => hasPhone(l.phone));
  const noPhone = total - withPhone.length;
  const missingAssign = withPhone.filter((l) => !isAssigned(l));
  const assigned = withPhone.filter((l) => isAssigned(l));

  return { label, total, withPhone: withPhone.length, noPhone, assigned: assigned.length, missingAssign: missingAssign.length };
}

const crmStats = analyzeLeads('CRM (marketing.leads)', crmLeads ?? []);
const legacyStats = analyzeLeads('Legacy (mama_sin_caos_leads)', legacyDiagnostico);

const missingCrm = (crmLeads ?? [])
  .filter((l) => hasPhone(l.phone) && !isAssigned(l))
  .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

const missingLegacy = legacyDiagnostico
  .filter((l) => hasPhone(l.phone) && !isAssigned(l))
  .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

const assignedTotal = assignments?.length ?? 0;
const assignedCounter = (groups ?? []).reduce((s, g) => s + (g.assigned_count ?? 0), 0);
const memberCounter = (groups ?? []).reduce((s, g) => s + (g.member_count ?? 0), 0);

console.log('=== RESUMEN Mamá Sin Caos · pool webinar-2026-06-23 ===\n');
console.log(`Asignaciones registradas en pool: ${assignedTotal}`);
console.log(`Contador assigned_count (grupos): ${assignedCounter}`);
console.log(`Contador member_count (joins reales vía webhook): ${memberCounter}`);
console.log('');

for (const s of [crmStats, legacyStats]) {
  console.log(`--- ${s.label} ---`);
  console.log(`  Total registros: ${s.total}`);
  console.log(`  Con teléfono: ${s.withPhone}`);
  console.log(`  Sin teléfono (no pudieron asignarse): ${s.noPhone}`);
  console.log(`  Con teléfono Y asignación al pool: ${s.assigned}`);
  console.log(`  Con teléfono SIN asignación al pool: ${s.missingAssign}`);
  console.log('');
}

const uniqueMissing = new Map();
for (const l of [...missingCrm, ...missingLegacy]) {
  const key = `${normPhone(l.phone)}|${String(l.email ?? '').toLowerCase()}`;
  if (!uniqueMissing.has(key)) uniqueMissing.set(key, l);
}

console.log(`\n=== TOTAL que llenaron datos y NO tienen asignación: ${crmStats.noPhone + crmStats.missingAssign + legacyStats.noPhone + legacyStats.missingAssign} ===`);
console.log(`  (sin teléfono: ${crmStats.noPhone + legacyStats.noPhone} | con teléfono sin assign: ${crmStats.missingAssign + legacyStats.missingAssign})`);

let i = 0;
for (const l of [...uniqueMissing.values()].slice(0, 20)) {
  i++;
  console.log(`${i}. ${l.created_at} | ${l.first_name ?? ''} | ${l.email} | ${l.phone}`);
}
if (uniqueMissing.size > 20) console.log(`... y ${uniqueMissing.size - 20} más`);

console.log('\n=== Grupos ===');
for (const g of groups ?? []) {
  console.log(`  Grupo ${g.position} (${g.label}): assigned_count=${g.assigned_count}, member_count=${g.member_count}, full=${g.is_full}`);
}

console.log('\n=== Nota importante ===');
console.log('El sistema registra ASIGNACIÓN (link entregado), no join real al grupo de WhatsApp.');
console.log('joined_at solo se llena con modo join_webhook (no activo). No podemos saber cuántos entraron de verdad al WA.');
