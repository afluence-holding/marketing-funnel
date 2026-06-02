import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

const TARGET_EXPORT_PATH = '/api/orgs/bukku/bus/main/export';

function isAuthorized(request: Request) {
  const token = process.env.BUKKU_VIEW_TOKEN ?? '';
  if (!token) return true;

  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get('token') ?? '';
  const tokenFromHeader = request.headers.get('x-view-token') ?? '';

  return tokenFromQuery === token || tokenFromHeader === token;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const token = url.searchParams.get('token') ?? '';
    const backendUrl = new URL(`${BACKEND_BASE_URL}${TARGET_EXPORT_PATH}`);
    backendUrl.searchParams.set('format', 'json');
    if (token) backendUrl.searchParams.set('token', token);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'x-export-token': request.headers.get('x-view-token') ?? '',
      },
    });

    const bodyText = await response.text();
    const contentType = response.headers.get('content-type') ?? '';
    const isJsonResponse = contentType.includes('application/json');

    if (isJsonResponse) {
      const body = bodyText ? JSON.parse(bodyText) : {};
      return NextResponse.json(
        {
          ...body,
          storage: 'supabase',
        },
        { status: response.status },
      );
    }

    return new NextResponse(bodyText, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load bukku leads',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 },
    );
  }
}
