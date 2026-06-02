import { NextResponse } from 'next/server';
import { BUKKU_LEADS_API_PATH, getBukkuBackendBaseUrl } from '@/lib/bukku/api-config';
import { listBukkuLeadsForTable } from '@/lib/bukku/leads-store';

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
    const backendUrl = new URL(`${getBukkuBackendBaseUrl()}${BUKKU_LEADS_API_PATH}`);
    if (token) backendUrl.searchParams.set('token', token);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'x-view-token': request.headers.get('x-view-token') ?? '',
      },
    });

    if (response.ok) {
      const body = await response.json();
      return NextResponse.json(body, { status: response.status });
    }

    const payload = await listBukkuLeadsForTable();
    return NextResponse.json(payload);
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
