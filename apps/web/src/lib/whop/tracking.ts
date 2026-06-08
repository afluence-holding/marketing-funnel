import { trackEventForPixel } from '@/lib/tracking/events';
import { buildMetaTrackingPayload, createMetaEventId } from '@/lib/tracking/meta-capi';
import {
  getWhopProductGraciasUrl,
  resolveWhopTier,
  type WhopProductConfig,
} from './products';
import type { WhopCheckoutSession } from './checkout-session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function ctxKey(productKey: string): string {
  return `whop_checkout_ctx:${productKey}`;
}

function purchaseFiredKey(productKey: string, eventId: string): string {
  return `whop_purchase_fired:${productKey}:${eventId}`;
}

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

export type WhopCheckoutContext = {
  purchaseEventId: string;
  fbp?: string;
  fbc?: string;
  value: number;
  currency: string;
  startedAt: number;
};

/** Persist Meta context when a Whop session is created (same eventId in webhook + gracias). */
export function persistCheckoutSession(
  product: WhopProductConfig,
  session: WhopCheckoutSession,
): void {
  const meta = buildMetaTrackingPayload(session.purchaseEventId);
  const ctx: WhopCheckoutContext = {
    purchaseEventId: session.purchaseEventId,
    fbp: meta.fbp,
    fbc: meta.fbc,
    value: session.value || resolveWhopTier(product).price,
    currency: session.currency || product.currency,
    startedAt: Date.now(),
  };
  writeStorage(ctxKey(product.key), JSON.stringify(ctx));
}

export function readCheckoutContext(productKey: string): WhopCheckoutContext | null {
  const raw = readStorage(ctxKey(productKey));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WhopCheckoutContext;
  } catch {
    return null;
  }
}

export function clearCheckoutContext(productKey: string): void {
  removeStorage(ctxKey(productKey));
}

export function wasPurchaseFired(productKey: string, eventId: string): boolean {
  return readStorage(purchaseFiredKey(productKey, eventId)) === '1';
}

export function markPurchaseFired(productKey: string, eventId: string): void {
  writeStorage(purchaseFiredKey(productKey, eventId), '1');
}

function initiateCheckoutCustomData(product: WhopProductConfig) {
  const tier = resolveWhopTier(product);
  return {
    content_ids: product.contentIds,
    content_name: product.contentName,
    content_category: product.contentCategory,
    content_type: product.contentType,
    value: tier.price,
    currency: product.currency,
    num_items: 1,
  };
}

/** InitiateCheckout — pixel (browser) + CAPI (server) with a shared eventId for dedup. */
export function trackWhopInitiateCheckout(product: WhopProductConfig): void {
  const checkoutEventId = createMetaEventId(`${product.key}-checkout`);

  if (product.metaPixelId) {
    trackEventForPixel(
      product.metaPixelId,
      'InitiateCheckout',
      initiateCheckoutCustomData(product),
      { eventId: checkoutEventId },
    );
  }

  void fetch(
    `${API_URL}/api/orgs/${encodeURIComponent(product.orgKey)}/bus/${encodeURIComponent(
      product.buKey,
    )}/video-events`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'InitiateCheckout',
        source: product.source,
        contentName: product.contentName,
        tracking: { meta: buildMetaTrackingPayload(checkoutEventId) },
      }),
    },
  ).catch((err) => {
    console.warn('[whop-tracking] InitiateCheckout CAPI sync failed', err);
  });
}

function purchaseCustomData(product: WhopProductConfig, value: number, orderId?: string) {
  return {
    content_ids: product.contentIds,
    content_name: product.contentName,
    content_category: product.contentCategory,
    content_type: product.contentType,
    value,
    currency: product.currency,
    order_id: orderId,
    num_items: 1,
  };
}

export type WhopPurchasePayload = {
  eventId: string;
  orderId: string;
  value: number;
  currency: string;
  fbp?: string;
  fbc?: string;
};

/** Resolve Purchase data from the Whop redirect URL + the persisted checkout context. */
export function resolveWhopPurchaseTracking(
  product: WhopProductConfig,
  params: Pick<URLSearchParams, 'get'>,
): WhopPurchasePayload | null {
  const status = params.get('status');
  if (status !== 'success') return null;

  const ctx = readCheckoutContext(product.key);
  const receiptId =
    params.get('receipt_id') ??
    params.get('payment_id') ??
    params.get('order_id') ??
    undefined;

  const eventId =
    ctx?.purchaseEventId ??
    (receiptId
      ? `${product.key}-purchase.${receiptId}`
      : createMetaEventId(`${product.key}-purchase`));

  const orderId = receiptId ?? ctx?.purchaseEventId ?? eventId;

  const valueParam =
    params.get('value') ?? params.get('amount') ?? params.get('price') ?? undefined;
  const parsedValue = valueParam ? Number(valueParam) : NaN;
  const value =
    Number.isFinite(parsedValue) && parsedValue > 0
      ? parsedValue
      : ctx?.value ?? resolveWhopTier(product).price;

  const currencyParam = params.get('currency') ?? undefined;
  const currency =
    currencyParam && currencyParam.length === 3
      ? currencyParam.toUpperCase()
      : ctx?.currency ?? product.currency;

  const meta = buildMetaTrackingPayload(eventId);

  return {
    eventId,
    orderId,
    value,
    currency,
    fbp: ctx?.fbp ?? meta.fbp,
    fbc: ctx?.fbc ?? meta.fbc,
  };
}

/** Fire the browser Purchase pixel once. CAPI Purchase is sent by the Whop webhook. */
export function trackWhopPurchase(
  product: WhopProductConfig,
  purchase: WhopPurchasePayload,
): void {
  if (!product.metaPixelId) return;
  trackEventForPixel(
    product.metaPixelId,
    'Purchase',
    purchaseCustomData(product, purchase.value, purchase.orderId),
    { eventId: purchase.eventId },
  );
}

export function getWhopPurchaseRedirectUrl(
  product: WhopProductConfig,
  receiptId?: string,
): string {
  const base = getWhopProductGraciasUrl(product);
  if (!receiptId) return base;
  try {
    const url = new URL(base);
    url.searchParams.set('receipt_id', receiptId);
    return url.pathname + url.search;
  } catch {
    return base;
  }
}
