import { NextResponse } from 'next/server';
import {
  BUKKU_LEADS_API_PATH,
  getBukkuBackendBaseUrl,
  getBukkuUserViewToken,
  resolveBukkuApiViewToken,
} from '@/lib/bukku/api-config';
import { listBukkuLeadsForTable } from '@/lib/bukku/leads-store';

function isAuthorized(request: Request) {
  const required = process.env.BUKKU_VIEW_TOKEN ?? '';
  if (!required) return true;
  return getBukkuUserViewToken(request) === required;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiToken = resolveBukkuApiViewToken(request);
    const backendUrl = new URL(`${getBukkuBackendBaseUrl()}${BUKKU_LEADS_API_PATH}`);
    if (apiToken) backendUrl.searchParams.set('token', apiToken);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'x-view-token': apiToken,
      },
    });

    if (response.ok) {
      const body = await response.json();
      return NextResponse.json(body, { status: response.status });
    }

    const errorText = await response.text().catch(() => '');

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to load leads from persistent storage',
          details: `API ${response.status}: ${errorText.slice(0, 200)}`,
        },
        { status: response.status >= 400 ? response.status : 503 },
      );
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
