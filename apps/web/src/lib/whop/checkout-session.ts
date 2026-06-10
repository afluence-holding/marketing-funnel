import { buildMetaTrackingPayload } from '@/lib/tracking/meta-capi';
import {
  getWhopProduct,
  getWhopSessionPath,
  type WhopProductConfig,
} from './products';
import { persistCheckoutSession } from './tracking';

export type WhopCheckoutSession = {
  sessionId: string;
  planId: string;
  purchaseEventId: string;
  value: number;
  currency: string;
  /** Cohort (sales edition) the session was created for. */
  cohortCode?: string;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const SESSION_FETCH_TIMEOUT_MS = 15_000;

type CachedWhopSession = WhopCheckoutSession & { cachedAt: number };

const inflightByProduct = new Map<string, Promise<WhopCheckoutSession>>();

function cacheKey(productKey: string): string {
  return `whop_session:${productKey}`;
}

export async function requestWhopCheckoutSession(
  productKey: string,
  meta?: { fbp?: string; fbc?: string },
): Promise<WhopCheckoutSession> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SESSION_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(getWhopSessionPath(productKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tracking: { meta: { fbp: meta?.fbp, fbc: meta?.fbc } },
      }),
      signal: controller.signal,
    });

    const data = (await response.json()) as Partial<WhopCheckoutSession> & {
      error?: string;
    };

    if (!response.ok || !data.sessionId || !data.purchaseEventId) {
      throw new Error(data.error ?? `Checkout session failed (${response.status})`);
    }

    return {
      sessionId: data.sessionId,
      planId: data.planId ?? '',
      purchaseEventId: data.purchaseEventId,
      value: data.value ?? 0,
      currency: data.currency ?? '',
      cohortCode: data.cohortCode,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function getCachedWhopSession(product: WhopProductConfig): WhopCheckoutSession | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(product.key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWhopSession;
    if (!parsed.sessionId || !parsed.purchaseEventId) return null;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(cacheKey(product.key));
      return null;
    }
    // A session created for another cohort (sales edition) must never be
    // reused: its plan_id/price/eventId belong to the old edition. Entries
    // without cohortCode predate this deploy — same-edition by definition
    // (10-minute TTL), so they stay valid and in-flight checkouts keep their
    // purchaseEventId (pixel/CAPI dedup survives the deploy).
    if (parsed.cohortCode && parsed.cohortCode !== product.cohortCode) {
      sessionStorage.removeItem(cacheKey(product.key));
      return null;
    }
    return {
      sessionId: parsed.sessionId,
      planId: parsed.planId,
      purchaseEventId: parsed.purchaseEventId,
      value: parsed.value,
      currency: parsed.currency,
      cohortCode: parsed.cohortCode,
    };
  } catch {
    return null;
  }
}

export function cacheWhopSession(
  product: WhopProductConfig,
  session: WhopCheckoutSession,
): void {
  if (typeof sessionStorage === 'undefined') return;
  const payload: CachedWhopSession = {
    ...session,
    cohortCode: session.cohortCode ?? product.cohortCode,
    cachedAt: Date.now(),
  };
  sessionStorage.setItem(cacheKey(product.key), JSON.stringify(payload));
}

export async function prefetchWhopCheckoutSession(
  product: WhopProductConfig,
): Promise<WhopCheckoutSession> {
  const cached = getCachedWhopSession(product);
  if (cached) return cached;

  const existing = inflightByProduct.get(product.key);
  if (existing) return existing;

  const promise = (async () => {
    const meta = buildMetaTrackingPayload(`${product.key}-checkout-prefetch`);
    const session = await requestWhopCheckoutSession(product.key, {
      fbp: meta.fbp,
      fbc: meta.fbc,
    });
    cacheWhopSession(product, session);
    persistCheckoutSession(product, session);
    return session;
  })().finally(() => {
    inflightByProduct.delete(product.key);
  });

  inflightByProduct.set(product.key, promise);
  return promise;
}

/** Preloads the Whop embed bundle in parallel with session creation. */
export function preloadWhopCheckoutModule(): void {
  if (typeof window === 'undefined') return;
  void import('@whop/checkout/react');
}

/** Warm the embed bundle + a checkout session while the user is still on a landing. */
export function warmWhopCheckoutSession(productKey: string): void {
  if (typeof window === 'undefined') return;
  const product = getWhopProduct(productKey);
  if (!product) return;
  preloadWhopCheckoutModule();
  void prefetchWhopCheckoutSession(product).catch(() => {
    /* checkout page retries */
  });
}
