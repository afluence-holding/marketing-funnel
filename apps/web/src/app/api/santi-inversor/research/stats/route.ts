import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

const TARGET_STATS_PATH = '/api/orgs/santi-inversor/bus/research/stats';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}${TARGET_STATS_PATH}`, {
      method: 'GET',
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
      { ok: false, error: 'Failed to fetch santi-inversor stats' },
      { status: 500 },
    );
  }
}
