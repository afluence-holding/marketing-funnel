import { trackEventForPixel } from '@/lib/tracking/events';
import {
  LUCAS,
  getLucasRetoCheckoutPath,
  getLucasRetoGraciasUrl,
  getLucasRetoPrice,
  getLucasRetoPublicBaseUrl,
} from '@/app/(landings)/lucas-con-lucas/lucas-config';
import {
  prefetchRetoCheckoutSession,
  preloadWhopCheckoutModule,
} from '@/lib/lucas/whop-checkout-session';
import { buildMetaTrackingPayload, createMetaEventId } from '@/lib/tracking/meta-capi';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const CHECKOUT_CTX_KEY = 'lucas_reto_checkout_ctx';
const PURCHASE_FIRED_PREFIX = 'lucas_reto_purchase_fired:';

function readStorage(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(key);
}

function writeStorage(key: string, value: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, value);
}

function removeStorage(key: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(key);
}

export type LucasRetoCheckoutContext = {
  purchaseEventId: string;
  fbp?: string;
  fbc?: string;
  value: number;
  currency: string;
  startedAt: number;
};

export function lucasWebinarViewContent() {
  return {
    content_ids: LUCAS.webinar.contentIds,
    content_name: LUCAS.webinar.contentName,
    content_category: LUCAS.webinar.contentCategory,
    value: LUCAS.webinar.value,
    currency: LUCAS.currency,
  };
}

export function lucasWebinarLead() {
  return {
    content_ids: LUCAS.webinar.contentIds,
    content_name: LUCAS.webinar.contentName,
    value: LUCAS.webinar.value,
    currency: LUCAS.currency,
  };
}

export function lucasWebinarCompleteRegistration() {
  return {
    content_ids: LUCAS.webinar.contentIds,
    content_name: LUCAS.webinar.contentName,
    status: 'completed',
    value: LUCAS.webinar.value,
    currency: LUCAS.currency,
  };
}

export function lucasPreLaunchViewContent() {
  return {
    content_ids: LUCAS.preLaunch.contentIds,
    content_name: LUCAS.preLaunch.contentName,
    content_category: LUCAS.preLaunch.contentCategory,
    value: LUCAS.preLaunch.value,
    currency: LUCAS.currency,
  };
}

export function lucasPreLaunchLead() {
  return {
    content_ids: LUCAS.preLaunch.contentIds,
    content_name: LUCAS.preLaunch.contentName,
    value: LUCAS.preLaunch.value,
    currency: LUCAS.currency,
  };
}

export function lucasRetoViewContent() {
  const value = getLucasRetoPrice();
  return {
    content_ids: LUCAS.reto.contentIds,
    content_name: LUCAS.reto.contentName,
    content_category: LUCAS.reto.contentCategory,
    content_type: LUCAS.reto.contentType,
    value,
    currency: LUCAS.currency,
  };
}

export function lucasRetoInitiateCheckout() {
  const value = getLucasRetoPrice();
  return {
    content_ids: LUCAS.reto.contentIds,
    content_name: LUCAS.reto.contentName,
    content_type: LUCAS.reto.contentType,
    value,
    currency: LUCAS.currency,
    num_items: 1,
  };
}

export function lucasRetoPurchase(value: number, orderId?: string) {
  return {
    content_ids: LUCAS.reto.contentIds,
    content_name: LUCAS.reto.contentName,
    content_category: LUCAS.reto.contentCategory,
    content_type: LUCAS.reto.contentType,
    value,
    currency: LUCAS.currency,
    order_id: orderId,
    num_items: 1,
  };
}

export function lucasRetoVslMilestone(milestone: number) {
  const value = getLucasRetoPrice();
  return {
    content_ids: LUCAS.reto.contentIds,
    content_name: LUCAS.reto.contentName,
    content_type: LUCAS.reto.contentType,
    content_category: LUCAS.reto.contentCategory,
    milestone,
    value,
    currency: LUCAS.currency,
  };
}

export const LUCAS_RETO_VSL_MILESTONES = [25, 50, 75, 100] as const;

export function saveRetoCheckoutContext(ctx: LucasRetoCheckoutContext): void {
  writeStorage(CHECKOUT_CTX_KEY, JSON.stringify(ctx));
}

export function readRetoCheckoutContext(): LucasRetoCheckoutContext | null {
  const raw = readStorage(CHECKOUT_CTX_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LucasRetoCheckoutContext;
  } catch {
    return null;
  }
}

export function clearRetoCheckoutContext(): void {
  removeStorage(CHECKOUT_CTX_KEY);
}

export function wasPurchaseFired(eventId: string): boolean {
  return readStorage(PURCHASE_FIRED_PREFIX + eventId) === '1';
}

export function markPurchaseFired(eventId: string): void {
  writeStorage(PURCHASE_FIRED_PREFIX + eventId, '1');
}

export type LucasRetoPurchasePayload = {
  eventId: string;
  orderId: string;
  value: number;
  currency: string;
  fbp?: string;
  fbc?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

/** Resuelve datos Purchase desde URL (Whop redirect) + localStorage del checkout. */
export function resolveRetoPurchaseTracking(
  params: Pick<URLSearchParams, 'get'>,
): LucasRetoPurchasePayload | null {
  const status = params.get('status');
  if (status === 'error') return null;
  if (status !== 'success') return null;

  const ctx = readRetoCheckoutContext();
  const receiptId =
    params.get('receipt_id') ??
    params.get('payment_id') ??
    params.get('order_id') ??
    undefined;

  const eventId =
    ctx?.purchaseEventId ??
    (receiptId ? `lucas-reto-purchase.${receiptId}` : createMetaEventId('lucas-reto-purchase'));

  const orderId = receiptId ?? ctx?.purchaseEventId ?? eventId;

  const valueParam =
    params.get('value') ?? params.get('amount') ?? params.get('price') ?? undefined;
  const parsedValue = valueParam ? Number(valueParam) : NaN;
  const value =
    Number.isFinite(parsedValue) && parsedValue > 0
      ? parsedValue
      : ctx?.value ?? getLucasRetoPrice();

  const currencyParam = params.get('currency') ?? undefined;
  const currency =
    currencyParam && currencyParam.length === 3
      ? currencyParam.toUpperCase()
      : ctx?.currency ?? LUCAS.currency;

  const meta = buildMetaTrackingPayload(eventId);

  return {
    eventId,
    orderId,
    value,
    currency,
    fbp: ctx?.fbp ?? meta.fbp,
    fbc: ctx?.fbc ?? meta.fbc,
    email: params.get('email') ?? undefined,
    firstName: params.get('first_name') ?? params.get('name') ?? undefined,
    lastName: params.get('last_name') ?? undefined,
    phone: params.get('phone') ?? params.get('phone_number') ?? undefined,
  };
}

function saveRetoCheckoutSession(ctx: LucasRetoCheckoutContext): void {
  saveRetoCheckoutContext(ctx);
}

/** Persiste contexto Meta al crear sesión Whop (mismo purchaseEventId en webhook + gracias). */
export function persistRetoCheckoutSession(purchaseEventId: string): void {
  const meta = buildMetaTrackingPayload(purchaseEventId);
  saveRetoCheckoutSession({
    purchaseEventId,
    fbp: meta.fbp,
    fbc: meta.fbc,
    value: getLucasRetoPrice(),
    currency: LUCAS.currency,
    startedAt: Date.now(),
  });
}

/** InitiateCheckout al entrar a la página de checkout embebido. */
export function trackLucasRetoInitiateCheckout(): void {
  const pixelId = LUCAS.metaPixelId;
  const checkoutEventId = createMetaEventId('lucas-reto-checkout');

  if (pixelId) {
    trackEventForPixel(
      pixelId,
      'InitiateCheckout',
      lucasRetoInitiateCheckout(),
      { eventId: checkoutEventId },
    );
  }

  void fetch(`${API_URL}/api/orgs/lucas-con-lucas/bus/main/video-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'InitiateCheckout',
      source: LUCAS.reto.source,
      contentName: LUCAS.reto.contentName,
      tracking: { meta: buildMetaTrackingPayload(checkoutEventId) },
    }),
  }).catch((err) => {
    console.warn('[lucas-reto] InitiateCheckout CAPI sync failed', err);
  });
}

/** Prefetch Whop session en background mientras el usuario está en la landing. */
export function warmRetoCheckoutSession(): void {
  if (typeof window === 'undefined') return;
  preloadWhopCheckoutModule();
  void prefetchRetoCheckoutSession().catch(() => {
    /* checkout page reintenta */
  });
}

export function navigateToRetoCheckout(): void {
  if (typeof window === 'undefined') return;
  preloadWhopCheckoutModule();
  void prefetchRetoCheckoutSession();
  window.location.assign(getLucasRetoCheckoutPath());
}

export function getLucasRetoGraciasRedirectUrl(receiptId?: string): string {
  const base = getLucasRetoGraciasUrl();
  if (!receiptId) return base;
  const url = new URL(base, getLucasRetoPublicBaseUrl());
  url.searchParams.set('receipt_id', receiptId);
  return url.pathname + url.search;
}

export function trackLucasRetoViewContent(): void {
  const pixelId = LUCAS.metaPixelId;
  if (!pixelId) return;
  trackEventForPixel(pixelId, 'ViewContent', lucasRetoViewContent());
}
