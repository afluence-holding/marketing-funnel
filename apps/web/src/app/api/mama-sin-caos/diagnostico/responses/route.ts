import { NextResponse } from 'next/server';
import {
  MAMA_SIN_CAOS_RESPONSES_API_PATH,
  getMamaSinCaosBackendBaseUrl,
  getMamaSinCaosUserViewToken,
  resolveMamaSinCaosApiViewToken,
} from '@/lib/mama-sin-caos/api-config';

// Proxy del panel de respuestas del diagnóstico → API genérica (marketing.leads).

function parseJsonSafe(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function isAuthorized(request: Request) {
  const required = process.env.MAMA_SIN_CAOS_VIEW_TOKEN ?? '';
  if (!required) return true;
  return getMamaSinCaosUserViewToken(request) === required;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiToken = resolveMamaSinCaosApiViewToken(request);
    const backendUrl = new URL(
      `${getMamaSinCaosBackendBaseUrl()}${MAMA_SIN_CAOS_RESPONSES_API_PATH}`,
    );
    if (apiToken) backendUrl.searchParams.set('token', apiToken);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'x-view-token': apiToken,
      },
    });

    const bodyText = await response.text();
    const parsed = parseJsonSafe(bodyText);

    if (!response.ok) {
      return NextResponse.json(
        parsed ?? { ok: false, error: 'Failed to load responses' },
        { status: response.status },
      );
    }

    return NextResponse.json(parsed ?? { ok: true }, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load mama-sin-caos diagnostico responses',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 },
    );
  }
}
