/**
 * Whop purchase product registry (API side) — THIN WRAPPER over the shared
 * catalog. The price ladder, plan ids and contentIds are defined ONCE in
 * `@marketing-funnel/catalog`; this module only adds API-specific concerns
 * (CAPI env var names, thank-you URL) and adapts the catalog to the shape the
 * webhook/CAPI services consume. Lucas keeps its own dedicated path and is
 * intentionally NOT in the catalog.
 *
 * Do NOT inline tiers/planIds/contentIds here — CI fails the build if you do.
 */

import {
  CATALOG,
  getCohortByCheckoutId,
  getWhopPlanIds,
  resolveActiveCohort,
  type BusinessUnitProduct,
  type Cohort,
} from '@marketing-funnel/catalog';

export type WhopPurchaseProduct = {
  productKey: string;
  orgKey: string;
  buKey: string;
  source: string;
  contentIds: string[];
  contentName: string;
  contentCategory: string;
  contentType: string;
  currency: string;
  /** 2-letter country code for Meta CAPI user data. */
  country: string;
  /** Env var holding the Meta Pixel id for this org. */
  pixelEnv: string;
  /** Env var holding the Meta CAPI access token for this org. */
  tokenEnv: string;
  /** Public thank-you URL used as event_source_url. */
  graciasUrl: string;
  /** Cohort the purchase was attributed to (code = launch_ops.launch.code). */
  cohortCode: string;
};

/** API-only settings per product (secrets/env naming + public URLs stay out of the catalog). */
const API_PRODUCT_SETTINGS: Record<
  string,
  { pixelEnv: string; tokenEnv: string; graciasUrl: string }
> = {
  'german-desinflamate': {
    pixelEnv: 'META_PIXEL_ID_GERMAN_ROZ',
    tokenEnv: 'META_CAPI_TOKEN_GERMAN_ROZ',
    graciasUrl: 'https://nutricion.germanroz.com/german-roz/desinflamate/gracias?status=success',
  },
};

function toPurchaseProduct(
  product: BusinessUnitProduct,
  cohort: Cohort,
): WhopPurchaseProduct | null {
  const settings = API_PRODUCT_SETTINGS[product.productKey];
  if (!settings) return null;
  return {
    productKey: product.productKey,
    orgKey: product.orgKey,
    buKey: product.buKey,
    source: product.source,
    contentIds: [cohort.contentId],
    contentName: product.contentName,
    contentCategory: product.contentCategory,
    contentType: product.contentType,
    currency: product.currency,
    country: product.country,
    cohortCode: cohort.code,
    ...settings,
  };
}

export type ResolvedWhopPurchaseProduct = {
  product: WhopPurchaseProduct;
  /** Configured base price for the matched plan (CAPI value fallback). */
  price: number;
};

/**
 * Resolve the product (and configured price) for an incoming Whop plan id.
 * The contentId/cohortCode come from the cohort that OWNS the plan — so a C2
 * plan keeps attributing to C2 even after C3 launches.
 */
export function resolveWhopPurchaseProduct(
  planId: string | undefined,
): ResolvedWhopPurchaseProduct | null {
  if (!planId) return null;
  for (const catalogProduct of CATALOG) {
    const hit = getCohortByCheckoutId(catalogProduct, planId);
    if (!hit) continue;
    const product = toPurchaseProduct(catalogProduct, hit.cohort);
    if (!product) continue;
    return { product, price: hit.tier.price };
  }
  return null;
}

/**
 * Resolve a purchase product by explicit cohort code from the session metadata
 * (webhook attribution priority 1) — falls back to the date-resolved cohort.
 */
export function resolveWhopPurchaseProductByCohort(
  productKey: string,
  cohortCode: string | undefined,
  paidAt: Date = new Date(),
): WhopPurchaseProduct | null {
  const catalogProduct = CATALOG.find((p) => p.productKey === productKey) ?? null;
  if (!catalogProduct) return null;
  const byCode = cohortCode
    ? catalogProduct.cohorts.find((c) => c.code === cohortCode) ?? null
    : null;
  const cohort = byCode ?? resolveActiveCohort(catalogProduct, paidAt).cohort;
  return toPurchaseProduct(catalogProduct, cohort);
}

/** All plan ids tracked by the generic registry (for diagnostics/QA). */
export function getAllWhopPurchasePlanIds(): string[] {
  return CATALOG.flatMap((product) => getWhopPlanIds(product));
}
