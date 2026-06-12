/**
 * Backfill WhatsApp group assignments for Mamá Sin Caos diagnóstico leads
 * that have a phone but no row in whatsapp_group_assignments for the webinar pool.
 */
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(import.meta.dirname, '..');
dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env'), override: true });

const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://marketing-funnelapi-production.up.railway.app';

const POOL_KEY = 'webinar-2026-06-23';
const SOURCE = 'landing-mama-sin-caos-diagnostico';
const ASSIGN_PATH = `/api/orgs/mama-sin-caos/bus/main/whatsapp-group/assign`;

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

function formatPhoneForAssign(raw) {
  const digits = normPhone(raw);
  if (!digits) return '';
  // Match landing format (+CC space local) when we can infer country code.
  if (digits.startsWith('56') && digits.length >= 11) {
    return `+56 ${digits.slice(2)}`;
  }
  if (digits.startsWith('54') && digits.length >= 12) {
    return `+54 ${digits.slice(2)}`;
  }
  if (digits.startsWith('57') && digits.length >= 12) {
    return `+57 ${digits.slice(2)}`;
  }
  if (digits.startsWith('52') && digits.length >= 12) {
    return `+52 ${digits.slice(2)}`;
  }
  if (digits.startsWith('591') && digits.length >= 11) {
    return `+591 ${digits.slice(3)}`;
  }
  if (digits.startsWith('34') && digits.length >= 11) {
    return `+34 ${digits.slice(2)}`;
  }
  if (digits.startsWith('1') && digits.length >= 11) {
    return `+1 ${digits.slice(1)}`;
  }
  return raw.trim() || `+${digits}`;
}

async function loadUnassigned() {
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
      .select('id, email, first_name, phone, created_at')
      .eq('source', SOURCE)
      .order('created_at', { ascending: true }),
    db.from('whatsapp_group_assignments').select('lead_id, phone').eq('pool_id', pool.id),
  ]);

  const byPhone = new Set((assignments ?? []).map((a) => normPhone(a.phone)).filter(Boolean));
  const byLeadId = new Set((assignments ?? []).map((a) => a.lead_id).filter(Boolean));

  return (leads ?? []).filter((l) => {
    const phone = normPhone(l.phone);
    if (!phone) return false;
    return !byLeadId.has(l.id) && !byPhone.has(phone);
  });
}

async function assignLead(lead) {
  const phone = formatPhoneForAssign(lead.phone);
  const res = await fetch(`${API_BASE}${ASSIGN_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      poolKey: POOL_KEY,
      leadId: lead.id,
      phone,
    }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok && body.ok, status: res.status, body, phone };
}

const unassigned = await loadUnassigned();
console.log(`Encontrados ${unassigned.length} lead(s) con teléfono sin asignación.\n`);

if (!unassigned.length) {
  console.log('Nada que backfillear.');
  process.exit(0);
}

let ok = 0;
let fail = 0;

for (const lead of unassigned) {
  const result = await assignLead(lead);
  if (result.ok) {
    ok++;
    console.log(
      `OK  ${lead.first_name ?? ''} | ${lead.email} | ${result.phone} -> ${result.body.inviteUrl}`,
    );
  } else {
    fail++;
    console.log(
      `FAIL ${lead.first_name ?? ''} | ${lead.email} | ${result.phone} | HTTP ${result.status} | ${JSON.stringify(result.body)}`,
    );
  }
}

console.log(`\nResumen: ${ok} asignados, ${fail} fallidos.`);

const remaining = await loadUnassigned();
console.log(`Pendientes tras backfill: ${remaining.length}`);
if (remaining.length) {
  for (const l of remaining) {
    console.log(`  - ${l.first_name} | ${l.email} | ${l.phone}`);
  }
  process.exit(1);
}
