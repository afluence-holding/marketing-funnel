import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

const TARGET_STATS_PATH = '/api/orgs/lucas-con-lucas/bus/main/stats';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const all = (requestUrl.searchParams.get('all') ?? '').toLowerCase();
    const backendUrl = new URL(`${BACKEND_BASE_URL}${TARGET_STATS_PATH}`);
    if (all) backendUrl.searchParams.set('all', all);

    const response = await fetch(backendUrl.toString(), {
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
      { ok: false, error: 'Failed to fetch lucas-con-lucas email stats' },
      { status: 500 },
    );
  }
}
