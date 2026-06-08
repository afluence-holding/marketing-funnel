import { NextResponse } from 'next/server';
import {
  CARO_FITNESS_PROGRESS_API_PATH,
  getCaroFitnessBackendBaseUrl,
  getCaroFitnessUserViewToken,
  resolveCaroFitnessApiViewToken,
} from '@/lib/caro-fitness/api-config';

const PROGRESS_PATH = CARO_FITNESS_PROGRESS_API_PATH;

function parseJsonSafe(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function isAuthorized(request: Request) {
  const required = process.env.CARO_FITNESS_VIEW_TOKEN ?? '';
  if (!required) return true;
  return getCaroFitnessUserViewToken(request) === required;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiToken = resolveCaroFitnessApiViewToken(request);
    const backendUrl = new URL(`${getCaroFitnessBackendBaseUrl()}${PROGRESS_PATH}`);
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
        parsed ?? { ok: false, error: 'Failed to load progress' },
        { status: response.status },
      );
    }

    return NextResponse.json(parsed ?? { ok: true }, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load caro-fitness progress',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const sessionId = String(payload?.sessionId ?? '').trim();

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: 'sessionId is required' },
        { status: 400 },
      );
    }

    const backendUrl = `${getCaroFitnessBackendBaseUrl()}${PROGRESS_PATH}`;
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const bodyText = await response.text();
    const parsed = parseJsonSafe(bodyText);

    if (!response.ok) {
      return NextResponse.json(
        parsed ?? { ok: false, error: 'Failed to save progress' },
        { status: response.status },
      );
    }

    return NextResponse.json(parsed ?? { ok: true }, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to save progress',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 },
    );
  }
}
