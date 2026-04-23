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
    total: records.length,
    records,
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EmailPayload;
    const email = String(payload.email ?? '').trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    const record = {
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
