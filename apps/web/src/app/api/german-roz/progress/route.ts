import { NextResponse } from 'next/server';
import {
  GERMAN_ROZ_PROGRESS_API_PATH,
  getGermanRozBackendBaseUrl,
  getGermanRozUserViewToken,
  resolveGermanRozApiViewToken,
} from '@/lib/german-roz/api-config';

const PROGRESS_PATH = GERMAN_ROZ_PROGRESS_API_PATH;

function parseJsonSafe(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function isAuthorized(request: Request) {
  const required = process.env.GERMAN_ROZ_VIEW_TOKEN ?? '';
  if (!required) return true;
  return getGermanRozUserViewToken(request) === required;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiToken = resolveGermanRozApiViewToken(request);
    const backendUrl = new URL(`${getGermanRozBackendBaseUrl()}${PROGRESS_PATH}`);
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
        error: 'Failed to load german-roz progress',
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

    const backendUrl = `${getGermanRozBackendBaseUrl()}${PROGRESS_PATH}`;
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
