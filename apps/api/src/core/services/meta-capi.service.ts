import crypto from 'crypto';

type MetaCapiEventName = 'Lead' | 'CompleteRegistration' | 'Schedule';

interface MetaCapiUserData {
  email?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}

interface SendMetaCapiEventInput {
  eventName: MetaCapiEventName;
  eventId: string;
  eventSourceUrl?: string;
  userData?: MetaCapiUserData;
  customData?: Record<string, unknown>;
  /** Override the pixel ID (defaults to META_PIXEL_ID env var). */
  pixelId?: string;
  /** Override the access token (defaults to META_CAPI_TOKEN env var). */
  accessToken?: string;
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  return normalized || undefined;
}

function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const normalized = phone.replace(/\D/g, '');
  return normalized || undefined;
}

export async function sendMetaCapiEvent(input: SendMetaCapiEventInput): Promise<void> {
  const token = (input.accessToken ?? process.env.META_CAPI_TOKEN)?.trim();
  const pixelId = (input.pixelId ?? process.env.META_PIXEL_ID)?.trim();

  if (!token || !pixelId) return;

  const apiVersion = process.env.META_CAPI_API_VERSION?.trim() || 'v21.0';
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim();

  const normalizedEmail = normalizeEmail(input.userData?.email);
  const normalizedPhone = normalizePhone(input.userData?.phone);

  const payload = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: 'website',
        ...(input.eventSourceUrl ? { event_source_url: input.eventSourceUrl } : {}),
        user_data: {
          ...(normalizedEmail ? { em: [sha256(normalizedEmail)] } : {}),
          ...(normalizedPhone ? { ph: [sha256(normalizedPhone)] } : {}),
          ...(input.userData?.fbp ? { fbp: input.userData.fbp } : {}),
          ...(input.userData?.fbc ? { fbc: input.userData.fbc } : {}),
          ...(input.userData?.clientIpAddress
            ? { client_ip_address: input.userData.clientIpAddress }
            : {}),
          ...(input.userData?.clientUserAgent
            ? { client_user_agent: input.userData.clientUserAgent }
            : {}),
        },
        ...(input.customData ? { custom_data: input.customData } : {}),
      },
    ],
    access_token: token,
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${pixelId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseBody = await response.text().catch(() => '');
    throw new Error(`Meta CAPI request failed (${response.status}): ${responseBody}`);
  }
}
