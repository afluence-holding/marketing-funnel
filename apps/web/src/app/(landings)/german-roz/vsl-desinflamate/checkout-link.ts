/**
 * DI21 (Reto Desinflámate) sells through the embedded Whop checkout.
 * The VSL's CTAs — which the compiled bundle still wires to the old Hotmart
 * link — are redirected here at runtime (see vsl-tracker + vsl-attribution).
 */

export const DESINFLAMATE_CHECKOUT_PATH = '/german-roz/desinflamate/checkout';

const ATTRIBUTION_PARAM_KEYS = [
  'fbclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

/**
 * Absolute embedded-checkout URL, carrying ad attribution (fbclid/UTM) from the
 * current page URL so the checkout + thank-you keep attribution intact.
 */
export function buildDesinflamateCheckoutUrl(): string {
  if (typeof window === 'undefined') return DESINFLAMATE_CHECKOUT_PATH;
  let url: URL;
  try {
    url = new URL(DESINFLAMATE_CHECKOUT_PATH, window.location.origin);
  } catch {
    return DESINFLAMATE_CHECKOUT_PATH;
  }
  const src = new URLSearchParams(window.location.search);
  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const value = src.get(key);
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

/** True when a URL points at the legacy Hotmart checkout (to be rewritten). */
export function isHotmartUrl(url: string): boolean {
  return url.toLowerCase().includes('hotmart');
}
