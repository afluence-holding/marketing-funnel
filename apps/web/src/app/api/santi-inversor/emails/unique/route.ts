import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

const TARGET_EXPORT_PATH = '/api/orgs/santi-inversor/bus/research/export';

function escapeCsv(value: string): string {
  const normalized = String(value ?? '');
  if (
    normalized.includes('"') ||
    normalized.includes(',') ||
    normalized.includes('\n')
  ) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const format = (requestUrl.searchParams.get('format') ?? 'json').toLowerCase();
    const token = requestUrl.searchParams.get('token') ?? '';

    const exportUrl = new URL(`${BACKEND_BASE_URL}${TARGET_EXPORT_PATH}`);
    exportUrl.searchParams.set('format', 'json');
    if (token) exportUrl.searchParams.set('token', token);

    const response = await fetch(exportUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'x-export-token': request.headers.get('x-export-token') ?? '',
      },
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      data?: Array<Record<string, string>>;
      error?: string;
    };

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    const emails = Array.from(
      new Set(
        (payload.data ?? [])
          .map((row) => String(row.email ?? '').trim().toLowerCase())
          .filter(Boolean),
      ),
    );

    if (format === 'csv') {
      const csv = ['email', ...emails.map((email) => escapeCsv(email))].join('\n') + '\n';
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="santi-inversor-emails-unicos.csv"',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    return NextResponse.json({
      ok: true,
      total_unicos: emails.length,
      emails,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch unique santi-inversor emails' },
      { status: 500 },
    );
  }
}
