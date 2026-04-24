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

    const payload = (await response.json()) as {
      ok?: boolean;
      total_submissions?: number;
      unique_emails?: number;
      error?: string;
    };

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    const totalOriginal = Number(payload.total_submissions ?? 0);
    const totalUnicos = Number(payload.unique_emails ?? 0);

    return NextResponse.json({
      ok: true,
      total_original: totalOriginal,
      total_unicos: totalUnicos,
      duplicados_detectados: Math.max(0, totalOriginal - totalUnicos),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch santi-inversor email stats' },
      { status: 500 },
    );
  }
}
