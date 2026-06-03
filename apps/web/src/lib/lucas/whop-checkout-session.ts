import { buildMetaTrackingPayload } from '@/lib/tracking/meta-capi';
import { persistRetoCheckoutSession } from '@/lib/tracking/lucas-meta';

export type WhopCheckoutSession = {
  sessionId: string;
  planId: string;
  purchaseEventId: string;
};

export const WHOP_CHECKOUT_SESSION_PATH =
  '/api/lucas-con-lucas/whop-checkout-session';

const CACHE_KEY = 'lucas_reto_whop_session';
const CACHE_TTL_MS = 10 * 60 * 1000;
const SESSION_FETCH_TIMEOUT_MS = 15_000;

type CachedWhopSession = WhopCheckoutSession & { cachedAt: number };

let inflightSession: Promise<WhopCheckoutSession> | null = null;

export async function requestWhopCheckoutSession(meta?: {
  fbp?: string;
  fbc?: string;
}): Promise<WhopCheckoutSession> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SESSION_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(WHOP_CHECKOUT_SESSION_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tracking: { meta: { fbp: meta?.fbp, fbc: meta?.fbc } },
      }),
      signal: controller.signal,
    });

    const data = (await response.json()) as {
      sessionId?: string;
      planId?: string;
      purchaseEventId?: string;
      error?: string;
    };

    if (!response.ok || !data.sessionId || !data.purchaseEventId) {
      throw new Error(data.error ?? `Checkout session failed (${response.status})`);
    }

    return {
      sessionId: data.sessionId,
      planId: data.planId ?? '',
      purchaseEventId: data.purchaseEventId,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function getCachedWhopSession(): WhopCheckoutSession | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWhopSession;
    if (!parsed.sessionId || !parsed.purchaseEventId) return null;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return {
      sessionId: parsed.sessionId,
      planId: parsed.planId,
      purchaseEventId: parsed.purchaseEventId,
    };
  } catch {
    return null;
  }
}

export function cacheWhopSession(session: WhopCheckoutSession): void {
  if (typeof sessionStorage === 'undefined') return;
  const payload: CachedWhopSession = { ...session, cachedAt: Date.now() };
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export async function prefetchRetoCheckoutSession(): Promise<WhopCheckoutSession> {
  const cached = getCachedWhopSession();
  if (cached) return cached;

  if (inflightSession) return inflightSession;

  inflightSession = (async () => {
    const meta = buildMetaTrackingPayload('lucas-reto-checkout-prefetch');
    const session = await requestWhopCheckoutSession({
      fbp: meta.fbp,
      fbc: meta.fbc,
    });
    cacheWhopSession(session);
    persistRetoCheckoutSession(session.purchaseEventId);
    return session;
  })().finally(() => {
    inflightSession = null;
  });

  return inflightSession;
}

/** Precarga el bundle de Whop en paralelo (landing + checkout). */
export function preloadWhopCheckoutModule(): void {
  if (typeof window === 'undefined') return;
  void import('@whop/checkout/react');
}
