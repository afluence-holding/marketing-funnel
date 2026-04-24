import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const STORAGE_FILE_PATH = path.join(process.cwd(), 'data', 'recetas-cami-emails.ndjson');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_SHEETS_CSV_URL =
  process.env.GOOGLE_SHEETS_CSV_URL_RECETAS_CAMI ??
  'https://docs.google.com/spreadsheets/d/1lGsDCRZbnGKX0ey_bU1UvhipxochN4J5_qezW2TzeCY/export?format=csv&gid=0';
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

function getUniqueEmails(records: StoredRecord[]): string[] {
  return Array.from(
    new Set(records.map((record) => String(record.email ?? '').trim().toLowerCase()).filter(Boolean)),
  );
}

async function readEmailsFromGoogleSheet(): Promise<string[]> {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL, { cache: 'no-store' });
    if (!response.ok) return [];
    const csv = await response.text();
    return csv
      .split(/\r?\n/)
      .map((line) => (line.split(',')[0] ?? '').trim().replace(/^"|"$/g, '').toLowerCase())
      .filter((email) => EMAIL_REGEX.test(email));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized export access' }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = (url.searchParams.get('format') ?? 'json').toLowerCase();
  const [records, sheetEmails] = await Promise.all([readAllRecords(), readEmailsFromGoogleSheet()]);
  const localEmails = getUniqueEmails(records);
  const emails = sheetEmails.length ? Array.from(new Set(sheetEmails)) : localEmails;

  if (format === 'csv') {
    const csv = ['email', ...emails].join('\n') + '\n';
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="recetas-cami-emails-unicos.csv"',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  return NextResponse.json({
    ok: true,
    total_unicos: emails.length,
    emails,
  });
}
