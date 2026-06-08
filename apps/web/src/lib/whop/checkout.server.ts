import crypto from 'crypto';
import {
  getWhopProduct,
  getWhopProductRedirectUrl,
  resolveWhopTier,
  type WhopProductConfig,
} from './products';

const WHOP_API_BASE = 'https://api.whop.com/api/v1';
const SESSION_TIMEOUT_MS = 12_000;

export type WhopServerSession = {
  sessionId: string;
  planId: string;
  purchaseEventId: string;
  value: number;
  currency: string;
};

function createPurchaseEventId(productKey: string): string {
  return `${productKey}-purchase.${Date.now()}.${crypto.randomUUID()}`;
}

/**
 * Create a Whop checkout session for a product, resolving the active price tier
 * by date. Returns `null` (instead of throwing) when the API key is missing or
 * Whop rejects the request, so callers can fall back to a client retry.
 */
export async function createWhopCheckoutSessionServer(
  productKey: string,
  meta?: { fbp?: string; fbc?: string },
): Promise<WhopServerSession | null> {
  const product = getWhopProduct(productKey);
  if (!product) {
    console.error('[whop-checkout.server] unknown product', productKey);
    return null;
  }

  const apiKey = process.env.WHOP_API_KEY?.trim();
  if (!apiKey) return null;

  const tier = resolveWhopTier(product);
  const purchaseEventId = createPurchaseEventId(product.key);
  const redirectUrl = getWhopProductRedirectUrl(product);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SESSION_TIMEOUT_MS);

  try {
    const response = await fetch(`${WHOP_API_BASE}/checkout_configurations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: tier.planId,
        mode: 'payment',
        redirect_url: redirectUrl,
        metadata: buildSessionMetadata(product, tier.planId, tier.price, purchaseEventId, meta),
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
        (typeof payload.error === 'string' ? payload.error : payload.error?.message);
      console.error('[whop-checkout.server] session failed', response.status, detail);
      return null;
    }

    return {
      sessionId: payload.id,
      planId: tier.planId,
      purchaseEventId,
      value: tier.price,
      currency: product.currency,
    };
  } catch (err) {
    console.error('[whop-checkout.server] session error', err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function buildSessionMetadata(
  product: WhopProductConfig,
  planId: string,
  value: number,
  purchaseEventId: string,
  meta?: { fbp?: string; fbc?: string },
): Record<string, string | null> {
  return {
    meta_event_id: purchaseEventId,
    fbp: meta?.fbp ?? null,
    fbc: meta?.fbc ?? null,
    value: String(value),
    currency: product.currency,
    source: product.source,
    product_key: product.key,
    plan_id: planId,
  };
}
