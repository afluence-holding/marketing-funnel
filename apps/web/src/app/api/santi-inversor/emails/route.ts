import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

const TARGET_INGEST_PATH = '/api/orgs/santi-inversor/bus/research/ingest';
const TARGET_STATS_PATH = '/api/orgs/santi-inversor/bus/research/stats';
const TARGET_EXPORT_PATH = '/api/orgs/santi-inversor/bus/research/export';
const DEFAULT_SOURCE = 'landing-santi-inversor-research-home';

function parseJsonSafe(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

async function proxyRequest(targetUrl: URL, options: RequestInit = {}) {
  const response = await fetch(targetUrl.toString(), {
    cache: 'no-store',
    ...options,
  });

  const bodyText = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  const parsedJson = contentType.includes('application/json')
    ? parseJsonSafe(bodyText)
    : null;

  if (parsedJson !== null) {
    return NextResponse.json(parsedJson, { status: response.status });
  }

  return new NextResponse(bodyText, {
    status: response.status,
    headers: {
      'Content-Type': contentType || 'text/plain; charset=utf-8',
    },
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = (url.searchParams.get('format') ?? '').trim().toLowerCase();
    const token = url.searchParams.get('token') ?? '';

    if (format === 'csv' || format === 'json') {
      const exportUrl = new URL(`${BACKEND_BASE_URL}${TARGET_EXPORT_PATH}`);
      exportUrl.searchParams.set('format', format);
      if (token) exportUrl.searchParams.set('token', token);

      return proxyRequest(exportUrl, {
        method: 'GET',
        headers: {
          'x-export-token': request.headers.get('x-export-token') ?? '',
        },
      });
    }

    const statsUrl = new URL(`${BACKEND_BASE_URL}${TARGET_STATS_PATH}`);
    const response = await fetch(statsUrl.toString(), { cache: 'no-store' });
    const payload = (await response.json()) as {
      ok?: boolean;
      total_submissions?: number;
      unique_emails?: number;
      error?: string;
    };

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json({
      ok: true,
      total: Number(payload.total_submissions ?? 0),
      total_unicos: Number(payload.unique_emails ?? 0),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch santi-inversor emails' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const email = String(payload?.email ?? '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    const normalizedPayload = {
      ...payload,
      email,
      source: String(payload?.source ?? DEFAULT_SOURCE),
    };

    const ingestUrl = new URL(`${BACKEND_BASE_URL}${TARGET_INGEST_PATH}`);
    return proxyRequest(ingestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedPayload),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to store santi-inversor email',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 },
    );
  }
}
