import { NextResponse } from 'next/server';
import {
  buildWhatsAppGroupAssignPath,
  getApiBackendBaseUrl,
} from '@/lib/whatsapp-group/api-config';

function parseJsonSafe(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/**
 * Generic same-origin proxy for WhatsApp group rotation assignment.
 * Any landing can call POST /api/whatsapp-group/<orgKey>/<buKey>/assign with
 * { poolKey, phone?, leadId? } and receive the rotated invite link.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ orgKey: string; buKey: string }> },
) {
  try {
    const { orgKey, buKey } = await context.params;
    const payload = await request.json();

    const backendUrl = `${getApiBackendBaseUrl()}${buildWhatsAppGroupAssignPath(orgKey, buKey)}`;
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
        parsed ?? { ok: false, error: 'Failed to assign group' },
        { status: response.status },
      );
    }

    return NextResponse.json(parsed ?? { ok: true }, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to assign group',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 },
    );
  }
}
