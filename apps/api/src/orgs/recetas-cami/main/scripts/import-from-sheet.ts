/**
 * Bulk import histórico de leads de Recetas Cami desde el Google Sheet legacy.
 *
 * Por qué un script separado en lugar de pegarle al endpoint /ingest:
 *  - El endpoint hace `INSERT` sin `created_at`, así que perderíamos el
 *    timestamp original (`submittedAt` del sheet) — el dato más valioso del
 *    histórico. Acá usamos `supabaseAdmin` directo para preservarlo.
 *  - El endpoint también dispara routing, workflows y CAPI: nada de eso
 *    aplica a un backfill silencioso.
 *
 * Idempotencia:
 *  - `marketing.leads` ya NO tiene UNIQUE(organization_id, email) (la
 *    migración 20260316213000_allow_duplicate_leads_per_org.sql lo eliminó),
 *    así que ON CONFLICT no nos sirve. Hacemos SELECT antes de cada INSERT
 *    y saltamos si el email ya existe para esta org.
 *  - Re-correr el script no duplica datos.
 *
 * Cómo correr:
 *   npm run import:recetas-cami -w @marketing-funnel/api
 *
 * Asume `RECETAS_CAMI_ORG_ID` ya está cargado (corre `seed:recetas-cami`
 * primero si todavía no existe).
 */
import { supabaseAdmin } from '@marketing-funnel/db';
import { IDS } from '../config';

// Misma URL que usa apps/web/src/app/api/recetas-cami/emails/unique/route.ts
// como fallback. Cambiar via env var si hay que apuntar a otro sheet.
const SHEET_CSV_URL =
  process.env.GOOGLE_SHEETS_CSV_URL_RECETAS_CAMI ??
  'https://docs.google.com/spreadsheets/d/1lGsDCRZbnGKX0ey_bU1UvhipxochN4J5_qezW2TzeCY/export?format=csv&gid=0';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BATCH_SIZE = 200;

interface SheetRow {
  email: string;
  source: string;
  path: string;
  submittedAt: string;
  storedAt: string;
  ip: string;
  userAgent: string;
}

/**
 * CSV parser mínimo que respeta comillas dobles y escapes "" dentro de campos.
 * Suficiente para el formato que produce Google Sheets export.
 */
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char === '\r') {
      // Skip — handled by '\n'
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function normalizeRow(headers: string[], cells: string[]): SheetRow | null {
  const get = (key: string) => {
    const idx = headers.indexOf(key);
    return idx >= 0 ? (cells[idx] ?? '').trim() : '';
  };

  const email = get('email').toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) return null;

  return {
    email,
    source: get('source') || 'unknown',
    path: get('path'),
    submittedAt: get('submittedAt'),
    storedAt: get('storedAt'),
    ip: get('ip'),
    userAgent: get('userAgent'),
  };
}

function normalizeTimestamp(raw: string, fallback: string): string {
  if (!raw) return fallback;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : fallback;
}

async function fetchExistingEmails(orgId: string): Promise<Set<string>> {
  const existing = new Set<string>();
  const pageSize = 1000;
  let from = 0;

  for (;;) {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('email')
      .eq('organization_id', orgId)
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to read existing leads: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const row of data) {
      if (row.email) existing.add(row.email.toLowerCase());
    }

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return existing;
}

async function importBatch(rows: SheetRow[], orgId: string) {
  const nowIso = new Date().toISOString();
  const payload = rows.map((row) => {
    const createdAt = normalizeTimestamp(row.submittedAt, nowIso);
    const updatedAt = normalizeTimestamp(row.storedAt, createdAt);
    return {
      organization_id: orgId,
      email: row.email,
      // Enriquecemos `source` con el valor legacy ("form-submit", "bulk-import",
      // etc.) para no perder de qué tipo de captura vino cada lead. Suficiente
      // sin tener que crear custom_field_definitions para el MVP.
      source: `recetas-cami-${row.source}`,
      status: 'new',
      created_at: createdAt,
      updated_at: updatedAt,
    };
  });

  const { error } = await supabaseAdmin.from('leads').insert(payload);
  if (error) throw new Error(`Insert failed: ${error.message}`);
}

async function main() {
  if (!IDS.organizationId) {
    throw new Error(
      'RECETAS_CAMI_ORG_ID is not set. Run `npm run seed:recetas-cami -w @marketing-funnel/api` first, then add the printed UUID to .env.local.',
    );
  }

  console.log(`Importing legacy emails into org ${IDS.organizationId}...`);
  console.log(`Source: ${SHEET_CSV_URL}\n`);

  const response = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet CSV: ${response.status} ${response.statusText}`);
  }
  const csv = await response.text();
  const rows = parseCsv(csv);

  if (rows.length < 2) {
    throw new Error('Sheet appears to be empty (no header + data rows).');
  }

  const headers = rows[0].map((h) => h.trim());
  console.log(`Sheet columns detected: ${headers.join(', ')}\n`);

  const parsed: SheetRow[] = [];
  let invalid = 0;
  for (const cells of rows.slice(1)) {
    const normalized = normalizeRow(headers, cells);
    if (normalized) parsed.push(normalized);
    else invalid++;
  }

  // Deduplicar dentro del propio sheet (último gana — el sheet se appendea
  // append-only así que la última submission para un email es la "más fresca").
  const dedupedMap = new Map<string, SheetRow>();
  for (const row of parsed) {
    dedupedMap.set(row.email, row);
  }
  const deduped = Array.from(dedupedMap.values());

  console.log(`Sheet rows total:   ${rows.length - 1}`);
  console.log(`Valid emails:       ${parsed.length}`);
  console.log(`Invalid/skipped:    ${invalid}`);
  console.log(`Unique by email:    ${deduped.length}\n`);

  console.log('Reading existing leads from Supabase to avoid duplicates...');
  const existingEmails = await fetchExistingEmails(IDS.organizationId);
  console.log(`Already in DB:      ${existingEmails.size}\n`);

  const toInsert = deduped.filter((row) => !existingEmails.has(row.email));
  console.log(`To import:          ${toInsert.length}\n`);

  if (toInsert.length === 0) {
    console.log('Nothing to import. Done.');
    return;
  }

  let imported = 0;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    await importBatch(batch, IDS.organizationId);
    imported += batch.length;
    process.stdout.write(`  Imported ${imported} / ${toInsert.length}\r`);
  }

  console.log(`\n\nDone. Inserted ${imported} new leads.`);
  console.log(`Final total in org: ${existingEmails.size + imported}`);
}

main().catch((err) => {
  console.error('\nImport failed:', err);
  process.exit(1);
});
