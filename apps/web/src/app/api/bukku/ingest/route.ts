import { NextResponse } from 'next/server';
import { BUKKU_LEADS_API_PATH, getBukkuBackendBaseUrl } from '@/lib/bukku/api-config';
import { upsertBukkuLead } from '@/lib/bukku/leads-store';

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

    const backendUrl = `${getBukkuBackendBaseUrl()}${BUKKU_LEADS_API_PATH}`;
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (response.ok) {
      const bodyText = await response.text();
      const parsedJson = parseJsonSafe(bodyText);
      if (parsedJson !== null) {
        return NextResponse.json(parsedJson, { status: response.status });
      }
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
        message: 'Lead saved locally (API fallback)',
        storage: 'local-file',
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
