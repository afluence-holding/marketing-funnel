import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const STORAGE_FILE_PATH = path.join(process.cwd(), 'data', 'recetas-cami-emails.ndjson');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPORT_TOKEN = process.env.RECETAS_CAMI_EXPORT_TOKEN ?? '';

type StoredRecord = {
  email: string;
};

async function readAllRecords(): Promise<StoredRecord[]> {
  try {
    const raw = await fs.readFile(STORAGE_FILE_PATH, 'utf-8');
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as StoredRecord);
  } catch {
    return [];
  }
}

function isAuthorized(request: Request): boolean {
  if (!EXPORT_TOKEN) return true;
  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get('token') ?? '';
  const tokenFromHeader = request.headers.get('x-export-token') ?? '';
  return tokenFromQuery === EXPORT_TOKEN || tokenFromHeader === EXPORT_TOKEN;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized export access' }, { status: 401 });
  }

  const records = await readAllRecords();
  const uniqueEmails = new Set(
    records
      .map((record) => String(record.email ?? '').trim().toLowerCase())
      .filter((email) => EMAIL_REGEX.test(email)),
  );

  return NextResponse.json({
    ok: true,
    total: uniqueEmails.size,
    note:
      'Lectura de respaldo histórico (ndjson local). El alta de leads ahora se realiza ' +
      'a través del API multi-tenant: POST /api/orgs/recetas-cami/bus/main/ingest.',
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Endpoint deprecado',
      message:
        'El alta de leads de Recetas Cami ahora se realiza a través del API multi-tenant. ' +
        'Usá POST /api/orgs/recetas-cami/bus/main/ingest con la fuente "landing-recetas-cami-waitlist".',
    },
    { status: 410 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { ok: false, error: 'Compaction disabled to prevent accidental data loss' },
    { status: 405 },
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Endpoint deprecado',
      message:
        'El bulk import vía este endpoint quedó retirado al eliminar la integración con Google Sheets.',
    },
    { status: 410 },
  );
}
