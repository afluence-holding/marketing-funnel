import { trackEventForPixel } from '@/lib/tracking/events';
import {
  LUCAS,
  getLucasRetoPrice,
} from '@/app/(landings)/lucas-con-lucas/lucas-config';
import { buildMetaTrackingPayload, createMetaEventId } from '@/lib/tracking/meta-capi';

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
    content_type: LUCAS.reto.contentType,
    value,
    currency: LUCAS.currency,
    order_id: orderId,
    num_items: 1,
  };
}

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

/** InitiateCheckout + guarda fbp/fbc para la thank-you page. */
export function handleRetoCheckoutClick(href: string): void {
  const pixelId = LUCAS.metaPixelId;
  const purchaseEventId = createMetaEventId('lucas-reto-purchase');
  const checkoutEventId = createMetaEventId('lucas-reto-checkout');
  const meta = buildMetaTrackingPayload(purchaseEventId);

  saveRetoCheckoutContext({
    purchaseEventId,
    fbp: meta.fbp,
    fbc: meta.fbc,
    value: getLucasRetoPrice(),
    currency: LUCAS.currency,
    startedAt: Date.now(),
  });

  if (pixelId) {
    trackEventForPixel(
      pixelId,
      'InitiateCheckout',
      lucasRetoInitiateCheckout(),
      { eventId: checkoutEventId },
    );
  }

  window.open(href, '_blank', 'noopener');
}

export function trackLucasRetoViewContent(): void {
  const pixelId = LUCAS.metaPixelId;
  if (!pixelId) return;
  trackEventForPixel(pixelId, 'ViewContent', lucasRetoViewContent());
}
