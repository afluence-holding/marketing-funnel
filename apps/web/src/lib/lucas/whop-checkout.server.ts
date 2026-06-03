import crypto from 'crypto';
import {
  getLucasRetoPublicBaseUrl,
  getLucasRetoPrice,
  LUCAS,
} from '@/app/(landings)/lucas-con-lucas/lucas-config';
import type { WhopCheckoutSession } from '@/lib/lucas/whop-checkout-session';

const WHOP_API_BASE = 'https://api.whop.com/api/v1';

function createPurchaseEventId(): string {
  return `lucas-reto-purchase.${Date.now()}.${crypto.randomUUID()}`;
}

function getWhopPlanId(): string {
  return (
    process.env.WHOP_LUCAS_RETO_PLAN_ID?.trim() ??
    process.env.NEXT_PUBLIC_WHOP_LUCAS_RETO_PLAN_ID?.trim() ??
    LUCAS.reto.planId
  );
}

export async function createWhopCheckoutSessionServer(meta?: {
  fbp?: string;
  fbc?: string;
}): Promise<WhopCheckoutSession | null> {
  const apiKey = process.env.WHOP_API_KEY?.trim();
  if (!apiKey) return null;

  const purchaseEventId = createPurchaseEventId();
  const planId = getWhopPlanId();
  const value = getLucasRetoPrice();
  const redirectUrl = `${getLucasRetoPublicBaseUrl()}${LUCAS.reto.graciasPath}?status=success`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(`${WHOP_API_BASE}/checkout_configurations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        mode: 'payment',
        redirect_url: redirectUrl,
        metadata: {
          meta_event_id: purchaseEventId,
          fbp: meta?.fbp ?? null,
          fbc: meta?.fbc ?? null,
          value: String(value),
          currency: LUCAS.currency,
          source: LUCAS.reto.source,
        },
      }),
      cache: 'no-store',
      signal: controller.signal,
    });

    const payload = (await response.json()) as {
      id?: string;
      message?: string;
      error?: string | { message?: string };
    };

    if (!response.ok || !payload.id) {
      const detail =
        payload.message ??
        (typeof payload.error === 'string'
          ? payload.error
          : payload.error?.message);
      console.error('[whop-checkout.server] session failed', response.status, detail);
      return null;
    }

    return {
      sessionId: payload.id,
      planId,
      purchaseEventId,
    };
  } catch (err) {
    console.error('[whop-checkout.server] session error', err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
