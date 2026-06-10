/**
 * Whop product registry (web side) — THIN WRAPPER over the shared catalog.
 *
 * The price ladder, plan ids, sales dates and contentIds are defined ONCE in
 * `@marketing-funnel/catalog` (same source the API reads — web and API can no
 * longer diverge). This module only adds web-only presentation/config concerns
 * (NEXT_PUBLIC pixel id, public base URL, routes, copy) and adapts the catalog
 * to the shape the checkout/tracking components consume.
 *
 * Do NOT inline tiers/planIds/contentIds here — CI fails the build if you do.
 *
 * Shared by client and server (no server-only imports). `process.env.NEXT_PUBLIC_*`
 * values are inlined at build time. Every consumer resolving prices by date
 * must live on a `force-dynamic` route.
 */

import {
  getProductByKey,
  resolveActiveCohort,
  type BusinessUnitProduct,
  type Cohort,
  type CohortResolutionSource,
  type Tier,
} from '@marketing-funnel/catalog';

export type WhopTier = {
  /** Whop plan id (plan_xxx). */
  planId: string;
  /** Base price in the product currency (major units, e.g. 67 for $67 USD). */
  price: number;
  /** Tier is active while `now <= until` (inclusive). ISO 8601 with tz offset. */
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
  /** Date-driven price ladder of the resolved cohort; last tier omits `until`. */
  tiers: WhopTier[];
  /** Cohort (sales edition) this config was resolved for — `launch_ops.launch.code`. */
  cohortCode: string;
  /** How the cohort was resolved (`active` vs explicit fallback — never blocks the sale). */
  cohortResolutionSource: CohortResolutionSource;
};

const GERMAN_PUBLIC_URL = (
  process.env.NEXT_PUBLIC_WHOP_GERMAN_PUBLIC_URL?.trim() ??
  'https://nutricion.germanroz.com'
).replace(/\/$/, '');

type WebProductSettings = {
  metaPixelId?: string;
  publicBaseUrl: string;
  checkoutPath: string;
  graciasPath: string;
  title: string;
  headline: string;
};

/**
 * Web-only presentation/config per product. NEXT_PUBLIC env reads must stay
 * static property accesses so Next.js can inline them at build time.
 */
const WEB_PRODUCT_SETTINGS: Record<string, WebProductSettings> = {
  'german-desinflamate': {
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ,
    publicBaseUrl: GERMAN_PUBLIC_URL,
    checkoutPath: '/german-roz/desinflamate/checkout',
    graciasPath: '/german-roz/desinflamate/gracias',
    title: 'Reto Desinflámate · 21 días',
    headline: 'COMIDA REAL, SIN DIETAS RESTRICTIVAS — 21 DÍAS CON GERMÁN ROZ.',
  },
};

function toWhopTier(tier: Tier): WhopTier | null {
  if (tier.checkoutRef.provider !== 'whop') return null;
  return { planId: tier.checkoutRef.planId, price: tier.price, until: tier.until };
}

function toProductConfig(
  product: BusinessUnitProduct,
  cohort: Cohort,
  resolutionSource: CohortResolutionSource,
): WhopProductConfig | null {
  const settings = WEB_PRODUCT_SETTINGS[product.productKey];
  if (!settings) return null;
  const tiers = cohort.tiers
    .map(toWhopTier)
    .filter((tier): tier is WhopTier => tier !== null);
  if (tiers.length === 0) return null;
  return {
    key: product.productKey,
    orgKey: product.orgKey,
    buKey: product.buKey,
    currency: product.currency,
    country: product.country,
    timezone: cohort.timezone,
    source: product.source,
    contentIds: [cohort.contentId],
    contentName: product.contentName,
    contentCategory: product.contentCategory,
    contentType: product.contentType,
    tiers,
    cohortCode: cohort.code,
    cohortResolutionSource: resolutionSource,
    ...settings,
  };
}

/**
 * Resolve a product config for `now` — the tiers/contentId belong to the
 * cohort (sales edition) resolved by date. Resolution NEVER blocks the sale:
 * outside any cohort period it explicitly falls back to the upcoming/latest
 * edition (parity with the live behavior).
 */
export function getWhopProduct(
  key: string,
  now: Date = new Date(),
): WhopProductConfig | null {
  const product = getProductByKey(key);
  if (!product) return null;
  const { cohort, resolutionSource } = resolveActiveCohort(product, now);
  return toProductConfig(product, cohort, resolutionSource);
}

/** Every plan id of the resolved cohort — used for webhook plan matching. */
export function getWhopProductPlanIds(product: WhopProductConfig): string[] {
  return product.tiers.map((tier) => tier.planId);
}

/**
 * Resolve the active price tier for `now`. Returns the first tier whose `until`
 * is in the future (inclusive); if every dated tier has elapsed, returns the
 * final tier (the one without `until`, or the last in the list as a safety net).
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
