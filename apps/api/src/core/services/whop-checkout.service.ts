import crypto from 'crypto';
import { getLucasRetoPriceFromEnv } from '../../orgs/lucas-con-lucas/main/tracking';

const WHOP_API_BASE = 'https://api.whop.com/api/v1';

export class WhopCheckoutError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = 'WhopCheckoutError';
  }
}

export function createLucasRetoPurchaseEventId(): string {
  return `lucas-reto-purchase.${Date.now()}.${crypto.randomUUID()}`;
}

function getWhopCredentials(): { apiKey: string; planId: string } {
  const apiKey = process.env.WHOP_API_KEY?.trim();
  const planId =
    process.env.WHOP_LUCAS_RETO_PLAN_ID?.trim() ?? 'plan_aKOjfecUWLzFo';

  if (!apiKey) {
    throw new WhopCheckoutError('WHOP_API_KEY must be configured', 503);
  }

  return { apiKey, planId };
}

export function getLucasRetoWhopRedirectUrl(): string {
  const base =
    process.env.LUCAS_RETO_PUBLIC_URL?.trim() ??
    'https://marketing.byafluence.com';
  return `${base.replace(/\/$/, '')}/lucas-con-lucas/reto/gracias?status=success`;
}

export type CreateLucasRetoWhopSessionInput = {
  purchaseEventId: string;
  fbp?: string;
  fbc?: string;
};

export type CreateLucasRetoWhopSessionResult = {
  sessionId: string;
  planId: string;
  purchaseEventId: string;
};

export async function createLucasRetoWhopCheckoutSession(
  input: CreateLucasRetoWhopSessionInput,
): Promise<CreateLucasRetoWhopSessionResult> {
  const { apiKey, planId } = getWhopCredentials();
  const value = getLucasRetoPriceFromEnv();

  const body = {
    plan_id: planId,
    mode: 'payment',
    redirect_url: getLucasRetoWhopRedirectUrl(),
    metadata: {
      meta_event_id: input.purchaseEventId,
      fbp: input.fbp ?? null,
      fbc: input.fbc ?? null,
      value: String(value),
      currency: 'CLP',
      source: 'landing-lucas-con-lucas-reto',
    },
  };

  const response = await fetch(`${WHOP_API_BASE}/checkout_configurations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let payload: { id?: string; message?: string; error?: string } | null = null;
  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.id) {
    const detail =
      payload?.message ??
      (typeof payload?.error === 'string'
        ? payload.error
        : payload?.error && typeof payload.error === 'object' && 'message' in payload.error
          ? String((payload.error as { message?: string }).message)
          : rawText);
    throw new WhopCheckoutError(
      `Whop checkout session failed (${response.status}): ${detail}`,
      response.status >= 500 ? 502 : 400,
    );
  }

  return {
    sessionId: payload.id,
    planId,
    purchaseEventId: input.purchaseEventId,
  };
}
