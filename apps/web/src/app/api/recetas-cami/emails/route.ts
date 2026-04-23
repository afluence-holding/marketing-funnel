import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_FILE_PATH = path.join(process.cwd(), 'data', 'recetas-cami-emails.ndjson');
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL_RECETAS_CAMI ?? '';

type EmailPayload = {
  email?: string;
  source?: string;
  path?: string;
  submittedAt?: string;
};

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
