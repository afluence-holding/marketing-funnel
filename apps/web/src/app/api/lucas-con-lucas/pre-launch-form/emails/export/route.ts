import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

const TARGET_EXPORT_PATH = '/api/orgs/lucas-con-lucas/bus/main/export';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = (url.searchParams.get('format') ?? '').toLowerCase();
    const token = url.searchParams.get('token') ?? '';
    const all = (url.searchParams.get('all') ?? '').toLowerCase();
    const backendUrl = new URL(`${BACKEND_BASE_URL}${TARGET_EXPORT_PATH}`);

    if (format) backendUrl.searchParams.set('format', format);
    if (token) backendUrl.searchParams.set('token', token);
    if (all) backendUrl.searchParams.set('all', all);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'x-export-token': request.headers.get('x-export-token') ?? '',
      },
    });

    const bodyText = await response.text();
    const contentType = response.headers.get('content-type') ?? '';
    const disposition = response.headers.get('content-disposition') ?? '';
    const isJsonResponse = contentType.includes('application/json');

    if (isJsonResponse) {
      const body = bodyText ? JSON.parse(bodyText) : {};
      return NextResponse.json(body, { status: response.status });
    }

    return new NextResponse(bodyText, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'text/plain; charset=utf-8',
        ...(disposition ? { 'Content-Disposition': disposition } : {}),
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to export lucas-con-lucas data' },
      { status: 500 },
    );
  }
}
