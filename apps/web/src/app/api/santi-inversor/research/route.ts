import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

const TARGET_INGEST_PATH = '/api/orgs/santi-inversor/bus/research/ingest';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const email = String(payload?.email ?? '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email is required' },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_BASE_URL}${TARGET_INGEST_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const bodyText = await response.text();
    const contentType = response.headers.get('content-type') ?? '';
    const isJsonResponse = contentType.includes('application/json');

    if (isJsonResponse) {
      const body = bodyText ? JSON.parse(bodyText) : {};
      return NextResponse.json(body, { status: response.status });
    }

    return new NextResponse(bodyText, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'text/plain; charset=utf-8',
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to ingest santi-inversor lead' },
      { status: 500 },
    );
  }
}
