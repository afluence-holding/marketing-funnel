/**
 * Unified tracking helpers.
 *
 * Fires events to Meta Pixel, GA4, and TikTok Pixel simultaneously.
 * Safe to call even if pixel scripts haven't loaded — guards with typeof checks.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    ttq?: { track: (...args: any[]) => void; instance: (id: string) => { track: (...args: any[]) => void } };
  }
}

export interface TrackEventOptions {
  value?: number;
  currency?: string;
  content_name?: string;
  [key: string]: unknown;
}

export interface MetaTrackOptions {
  eventId?: string;
}

/**
 * Track a standard conversion event across ALL initialized pixels.
 *
 * @example
 *   trackEvent('Lead');
 *   trackEvent('Purchase', { value: 99.99, currency: 'USD' });
 *   trackEvent('CompleteRegistration', { content_name: 'landing-v1' });
 */
export function trackEvent(
  eventName: string,
  options: TrackEventOptions = {},
  meta: MetaTrackOptions = {},
) {
  if (typeof window === 'undefined') return;

  if (typeof window.fbq === 'function') {
    if (meta.eventId) {
      window.fbq('track', eventName, options, { eventID: meta.eventId });
    } else {
      window.fbq('track', eventName, options);
    }
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', metaToGa4EventName(eventName), options);
  }

  if (window.ttq?.track) {
    window.ttq.track(metaToTikTokEventName(eventName), options);
  }
}

/**
 * Track an event on a SPECIFIC Meta Pixel only (not all initialized pixels).
 * Useful when a landing has multiple pixels and you only want one to receive the event.
 *
 * @example
 *   trackEventForPixel('123456789', 'Lead', { content_name: 'creator-landing' });
 */
export function trackEventForPixel(
  pixelId: string,
  eventName: string,
  options: TrackEventOptions = {},
  meta: MetaTrackOptions = {},
) {
  if (typeof window === 'undefined') return;

  if (typeof window.fbq === 'function') {
    if (meta.eventId) {
      window.fbq('trackSingle', pixelId, eventName, options, { eventID: meta.eventId });
    } else {
      window.fbq('trackSingle', pixelId, eventName, options);
    }
  }
}

/**
 * Track a custom (non-standard) event across all pixels.
 *
 * @example
 *   trackCustomEvent('ClickedWhatsApp', { landing: 'v2' });
 */
export function trackCustomEvent(
  eventName: string,
  data: Record<string, unknown> = {},
  meta: MetaTrackOptions = {},
) {
  if (typeof window === 'undefined') return;

  if (typeof window.fbq === 'function') {
    if (meta.eventId) {
      window.fbq('trackCustom', eventName, data, { eventID: meta.eventId });
    } else {
      window.fbq('trackCustom', eventName, data);
    }
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, data);
  }

  if (window.ttq?.track) {
    window.ttq.track(eventName, data);
  }
}

/**
 * All standard Meta Pixel events for reference / autocomplete.
 */
export const META_EVENTS = {
  AddPaymentInfo: 'AddPaymentInfo',
  AddToCart: 'AddToCart',
  AddToWishlist: 'AddToWishlist',
  CompleteRegistration: 'CompleteRegistration',
  Contact: 'Contact',
  CustomizeProduct: 'CustomizeProduct',
  Donate: 'Donate',
  FindLocation: 'FindLocation',
  InitiateCheckout: 'InitiateCheckout',
  Lead: 'Lead',
  Purchase: 'Purchase',
  Schedule: 'Schedule',
  Search: 'Search',
  StartTrial: 'StartTrial',
  SubmitApplication: 'SubmitApplication',
  Subscribe: 'Subscribe',
  ViewContent: 'ViewContent',
} as const;

function metaToGa4EventName(metaEvent: string): string {
  const map: Record<string, string> = {
    Lead: 'generate_lead',
    Purchase: 'purchase',
    AddToCart: 'add_to_cart',
    CompleteRegistration: 'sign_up',
    ViewContent: 'view_item',
    InitiateCheckout: 'begin_checkout',
    Subscribe: 'subscribe',
    Contact: 'contact',
    Schedule: 'schedule',
    StartTrial: 'start_trial',
    Search: 'search',
  };
  return map[metaEvent] ?? metaEvent;
}

function metaToTikTokEventName(metaEvent: string): string {
  const map: Record<string, string> = {
    Lead: 'SubmitForm',
    Purchase: 'CompletePayment',
    AddToCart: 'AddToCart',
    CompleteRegistration: 'CompleteRegistration',
    ViewContent: 'ViewContent',
    InitiateCheckout: 'InitiateCheckout',
    Subscribe: 'Subscribe',
    Contact: 'Contact',
  };
  return map[metaEvent] ?? metaEvent;
}
