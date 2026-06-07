import { NextResponse } from 'next/server';
import {
  CARO_FITNESS_INGEST_PATH,
  getCaroFitnessBackendBaseUrl,
} from '@/lib/caro-fitness/api-config';

function parseJsonSafe(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const email = String(payload?.email ?? '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email is required' },
        { status: 400 },
      );
    }

    const backendUrl = `${getCaroFitnessBackendBaseUrl()}${CARO_FITNESS_INGEST_PATH}`;
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
        parsed ?? { ok: false, error: 'Failed to save lead' },
        { status: response.status },
      );
    }

    return NextResponse.json(parsed ?? { ok: true }, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to save lead',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 },
    );
  }
}
