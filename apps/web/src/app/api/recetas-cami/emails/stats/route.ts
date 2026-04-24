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

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized export access' }, { status: 401 });
  }

  const records = await readAllRecords();
  const uniqueEmails = new Set(
    records.map((record) => String(record.email ?? '').trim().toLowerCase()).filter(Boolean),
  );

  const totalOriginal = records.length;
  const totalUnicos = uniqueEmails.size;
  const duplicadosDetectados = totalOriginal - totalUnicos;

  return NextResponse.json({
    ok: true,
    total_original: totalOriginal,
    total_unicos: totalUnicos,
    duplicados_detectados: duplicadosDetectados,
  });
}
