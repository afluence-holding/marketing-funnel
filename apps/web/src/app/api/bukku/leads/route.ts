import { NextResponse } from 'next/server';
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
