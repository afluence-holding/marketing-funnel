import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_FILE_PATH = path.join(process.cwd(), 'data', 'recetas-cami-emails.ndjson');
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL_RECETAS_CAMI ?? '';
const EXPORT_TOKEN = process.env.RECETAS_CAMI_EXPORT_TOKEN ?? '';

type EmailPayload = {
  email?: string;
  source?: string;
  path?: string;
  submittedAt?: string;
};

type StoredRecord = {
  email: string;
  source: string;
  path: string;
  submittedAt: string;
  storedAt: string;
  ip: string;
  userAgent: string;
};

function dedupeRecordsByEmail(records: StoredRecord[]): StoredRecord[] {
  const seen = new Set<string>();
  const deduped: StoredRecord[] = [];

  for (const record of records) {
    const key = String(record.email ?? '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(record);
  }

  return deduped;
}

function escapeCsv(value: string): string {
  const normalized = String(value ?? '');
  if (normalized.includes('"') || normalized.includes(',') || normalized.includes('\n')) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function toCsv(records: StoredRecord[]): string {
  const headers = ['email', 'source', 'path', 'submittedAt', 'storedAt', 'ip', 'userAgent'];
  const lines = [
    headers.join(','),
    ...records.map((record) =>
      headers
        .map((header) => escapeCsv(String(record[header as keyof StoredRecord] ?? '')))
        .join(','),
    ),
  ];
  return `${lines.join('\n')}\n`;
}

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

async function compactStorageByEmail(): Promise<{
  before: number;
  after: number;
  removed: number;
}> {
  const records = await readAllRecords();
  const deduped = dedupeRecordsByEmail(records);
  const lines = deduped.map((record) => JSON.stringify(record));

  await fs.mkdir(path.dirname(STORAGE_FILE_PATH), { recursive: true });
  await fs.writeFile(STORAGE_FILE_PATH, lines.length ? `${lines.join('\n')}\n` : '', 'utf-8');

  return {
    before: records.length,
    after: deduped.length,
    removed: records.length - deduped.length,
  };
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

  const originalRecords = await readAllRecords();
  const records = dedupeRecordsByEmail(originalRecords);
  const totalOriginal = originalRecords.length;
  const totalUnicos = records.length;
  const duplicadosDetectados = totalOriginal - totalUnicos;
  const url = new URL(request.url);
  const format = (url.searchParams.get('format') ?? 'json').toLowerCase();

  if (format === 'csv') {
    const csv = toCsv(records);
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="recetas-cami-emails.csv"',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  return NextResponse.json({
    ok: true,
    total: totalUnicos,
    total_original: totalOriginal,
    total_unicos: totalUnicos,
    duplicados_detectados: duplicadosDetectados,
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EmailPayload;
    const email = String(payload.email ?? '').trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    const existingRecords = await readAllRecords();
    const alreadyExists = existingRecords.some((item) => item.email === email);
    if (alreadyExists) {
      return NextResponse.json({
        ok: true,
        deduped: true,
        syncedToGoogleSheets: false,
        hasGoogleSheetsWebhook: Boolean(GOOGLE_SHEETS_WEBHOOK_URL),
      });
    }

    const record: StoredRecord = {
      email,
      source: String(payload.source ?? ''),
      path: String(payload.path ?? ''),
      submittedAt: String(payload.submittedAt ?? new Date().toISOString()),
      storedAt: new Date().toISOString(),
      ip:
        request.headers.get('x-forwarded-for') ??
        request.headers.get('x-real-ip') ??
        'unknown',
      userAgent: request.headers.get('user-agent') ?? '',
    };

    let syncedToGoogleSheets = false;
    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const webhookResponse = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
          cache: 'no-store',
        });
        syncedToGoogleSheets = webhookResponse.ok;
      } catch {
        syncedToGoogleSheets = false;
      }
    }

    await fs.mkdir(path.dirname(STORAGE_FILE_PATH), { recursive: true });
    await fs.appendFile(STORAGE_FILE_PATH, `${JSON.stringify(record)}\n`, 'utf-8');

    return NextResponse.json({
      ok: true,
      syncedToGoogleSheets,
      hasGoogleSheetsWebhook: Boolean(GOOGLE_SHEETS_WEBHOOK_URL),
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to store email' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized export access' }, { status: 401 });
  }

  try {
    const result = await compactStorageByEmail();
    return NextResponse.json({
      ok: true,
      compacted: true,
      ...result,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to compact records' }, { status: 500 });
  }
}
