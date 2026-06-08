/**
 * Generic Whop product registry + date-driven price ladder resolver.
 *
 * Shared by client and server (no server-only imports). `process.env.NEXT_PUBLIC_*`
 * values are inlined at build time, so this module is safe to import from both
 * the embed (client) and the checkout session creator (server).
 *
 * Each product maps to one or more Whop plans (one plan per price tier). The
 * active tier is resolved purely from the current date — a plan per tier means
 * the `plan_id` we send IS the price that gets charged (no coupon-application
 * risk).
 */

export type WhopTier = {
  /** Whop plan id (plan_xxx). */
  planId: string;
  /** Base price in the product currency (major units, e.g. 67 for $67 USD). */
  price: number;
  /**
   * Tier is active while `now <= until` (inclusive). ISO 8601 string WITH
   * timezone offset (e.g. `2026-06-16T23:59:59-05:00` for America/Lima).
   * Omit on the final tier so it acts as the fallback once every dated tier
   * has elapsed.
   */
  until?: string;
};

export type WhopProductConfig = {
  /** Unique product key used in URLs and storage namespacing. */
  key: string;
  orgKey: string;
  buKey: string;
  /** ISO 4217 currency code (uppercase), e.g. `USD`. */
  currency: string;
  /** 2-letter country code for Meta CAPI user data, e.g. `pe`. */
  country: string;
  /** IANA timezone of the price ladder, e.g. `America/Lima`. */
  timezone: string;
  /** Meta source tag for CAPI custom_data. */
  source: string;
  contentIds: string[];
  contentName: string;
  contentCategory: string;
  contentType: string;
  /** Client-side Meta Pixel id (NEXT_PUBLIC). */
  metaPixelId?: string;
  /** Absolute public origin used for the post-payment redirect (no trailing slash). */
  publicBaseUrl: string;
  /** App route to the embedded checkout page. */
  checkoutPath: string;
  /** App route to the thank-you page. */
  graciasPath: string;
  /** Short product title for the checkout card. */
  title: string;
  /** One-line headline for the checkout card. */
  headline: string;
  /** Date-driven price ladder; the last tier should omit `until` (fallback). */
  tiers: WhopTier[];
};

const GERMAN_PUBLIC_URL = (
  process.env.NEXT_PUBLIC_WHOP_GERMAN_PUBLIC_URL?.trim() ??
  'https://nutricion.germanroz.com'
).replace(/\/$/, '');

/**
 * Registry of all embeddable Whop products. Add a new entry to expose an
 * embedded checkout for another org/BU — no other code changes required.
 */
export const WHOP_PRODUCTS: Record<string, WhopProductConfig> = {
  'german-desinflamate': {
    key: 'german-desinflamate',
    orgKey: 'german-roz',
    buKey: 'main',
    currency: 'USD',
    country: 'pe',
    timezone: 'America/Lima',
    source: 'landing-german-roz-desinflamate',
    contentIds: ['di21-desinflamate'],
    contentName: 'Reto Desinflámate 21 días',
    contentCategory: 'reto-low-ticket',
    contentType: 'product',
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ,
    publicBaseUrl: GERMAN_PUBLIC_URL,
    checkoutPath: '/german-roz/desinflamate/checkout',
    graciasPath: '/german-roz/desinflamate/gracias',
    title: 'Reto Desinflámate · 21 días',
    headline: 'COMIDA REAL, SIN DIETAS RESTRICTIVAS — 21 DÍAS CON GERMÁN ROZ.',
    // Price ladder (America/Lima): 10–16 jun $67 · 17–23 jun $77 · 24–30 jun $87
    tiers: [
      { planId: 'plan_9hbxfopJ53A1q', price: 67, until: '2026-06-16T23:59:59-05:00' },
      { planId: 'plan_H5qC30Wqrkuac', price: 77, until: '2026-06-23T23:59:59-05:00' },
      { planId: 'plan_wFhRjp54MsvJm', price: 87 },
    ],
  },
};

export function getWhopProduct(key: string): WhopProductConfig | null {
  return WHOP_PRODUCTS[key] ?? null;
}

/** Every plan id across all tiers — used for webhook plan matching. */
export function getWhopProductPlanIds(product: WhopProductConfig): string[] {
  return product.tiers.map((tier) => tier.planId);
}

/**
 * Resolve the active price tier for `now`. Returns the first tier whose `until`
 * is in the future; if every dated tier has elapsed, returns the final tier
 * (the one without `until`, or the last in the list as a safety net).
 */
export function resolveWhopTier(
  product: WhopProductConfig,
  now: Date = new Date(),
): WhopTier {
  const nowMs = now.getTime();
  for (const tier of product.tiers) {
    if (!tier.until) return tier;
    const untilMs = new Date(tier.until).getTime();
    if (Number.isFinite(untilMs) && nowMs <= untilMs) return tier;
  }
  return product.tiers[product.tiers.length - 1];
}

export function getWhopProductRedirectUrl(product: WhopProductConfig): string {
  return `${product.publicBaseUrl}${product.graciasPath}?status=success`;
}

export function getWhopProductGraciasUrl(product: WhopProductConfig): string {
  return getWhopProductRedirectUrl(product);
}

/** Same-origin proxy path the client calls to create a Whop session. */
export function getWhopSessionPath(productKey: string): string {
  return `/api/whop/${encodeURIComponent(productKey)}/session`;
}

export function formatWhopPrice(product: WhopProductConfig, value: number): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `$${value}`;
  }
}
