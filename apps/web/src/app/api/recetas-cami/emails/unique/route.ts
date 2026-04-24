import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const STORAGE_FILE_PATH = path.join(process.cwd(), 'data', 'recetas-cami-emails.ndjson');
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

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized export access' }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = (url.searchParams.get('format') ?? 'json').toLowerCase();
  const emails = getUniqueEmails(await readAllRecords());

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
