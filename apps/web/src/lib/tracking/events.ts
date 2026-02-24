/**
 * Unified tracking helpers.
 *
 * Fires events to both Meta Pixel (fbq) and GA4 (gtag) simultaneously.
 * Safe to call even if the pixel scripts haven't loaded — guards with typeof checks.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
  }
}

interface TrackEventOptions {
  value?: number;
  currency?: string;
  [key: string]: unknown;
}

/**
 * Track a conversion event across all configured pixels.
 *
 * @example
 *   trackEvent('Lead');
 *   trackEvent('Purchase', { value: 99.99, currency: 'USD' });
 */
export function trackEvent(eventName: string, options: TrackEventOptions = {}) {
  if (typeof window === 'undefined') return;

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', eventName, options);
  }

  // GA4
  if (typeof window.gtag === 'function') {
    const ga4Name = metaToGa4EventName(eventName);
    window.gtag('event', ga4Name, options);
  }
}

/**
 * Track a custom (non-standard) event.
 */
export function trackCustomEvent(eventName: string, data: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, data);
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, data);
  }
}

/**
 * Map common Meta Pixel standard event names to GA4 equivalents.
 */
function metaToGa4EventName(metaEvent: string): string {
  const map: Record<string, string> = {
    Lead: 'generate_lead',
    Purchase: 'purchase',
    AddToCart: 'add_to_cart',
    CompleteRegistration: 'sign_up',
    ViewContent: 'view_item',
    InitiateCheckout: 'begin_checkout',
    Subscribe: 'subscribe',
  };
  return map[metaEvent] ?? metaEvent;
}
