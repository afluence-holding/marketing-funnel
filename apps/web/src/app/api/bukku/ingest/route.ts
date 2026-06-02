import { NextResponse } from 'next/server';
import { upsertBukkuLead } from '@/lib/bukku/leads-store';

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

    const record = await upsertBukkuLead({
      email,
      firstName: payload.firstName,
      phone: payload.phone,
      source: payload.source,
      customFields: payload.customFields,
      utmData: payload.utmData,
    });

    return NextResponse.json(
      {
        ok: true,
        message: 'Lead saved locally',
        lead: record,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to save bukku lead',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 },
    );
  }
}
