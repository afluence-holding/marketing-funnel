import { NextResponse } from 'next/server';
import {
  getMamaSinCaosBackendBaseUrl,
  MAMA_SIN_CAOS_LEADS_API_PATH,
} from '@/lib/mama-sin-caos/api-config';
import { listMamaSinCaosLeadsForTable } from '@/lib/mama-sin-caos/leads-store';

function isAuthorized(request: Request) {
  const token = process.env.MAMA_SIN_CAOS_VIEW_TOKEN ?? '';
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
    const backendUrl = new URL(`${getMamaSinCaosBackendBaseUrl()}${MAMA_SIN_CAOS_LEADS_API_PATH}`);
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

    if (process.env.NODE_ENV === 'production') {
      const errorText = await response.text().catch(() => '');
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to load leads from persistent storage',
          details: `API ${response.status}: ${errorText.slice(0, 200)}`,
        },
        { status: response.status >= 400 ? response.status : 503 },
      );
    }

    const payload = await listMamaSinCaosLeadsForTable();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load mama sin caos leads',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 },
    );
  }
}
