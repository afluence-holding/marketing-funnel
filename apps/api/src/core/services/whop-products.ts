/**
 * Generic Whop purchase product registry (API side).
 *
 * Maps Whop `plan_id`s to the org/pixel/content metadata needed to emit a
 * Purchase CAPI event from the webhook. Add a product here to support its
 * embedded checkout's server-side Purchase tracking — Lucas keeps its own
 * dedicated path and is intentionally NOT in this registry.
 */

export type WhopPurchaseProduct = {
  productKey: string;
  orgKey: string;
  source: string;
  contentIds: string[];
  contentName: string;
  contentCategory: string;
  contentType: string;
  currency: string;
  /** 2-letter country code for Meta CAPI user data. */
  country: string;
  /** Price per plan id (major units) — fallback when the webhook amount is absent. */
  planPrices: Record<string, number>;
  /** Env var holding the Meta Pixel id for this org. */
  pixelEnv: string;
  /** Env var holding the Meta CAPI access token for this org. */
  tokenEnv: string;
  /** Public thank-you URL used as event_source_url. */
  graciasUrl: string;
};

const GERMAN_DESINFLAMATE: WhopPurchaseProduct = {
  productKey: 'german-desinflamate',
  orgKey: 'german-roz',
  source: 'landing-german-roz-desinflamate',
  contentIds: ['di21-desinflamate'],
  contentName: 'Reto Desinflámate 21 días',
  contentCategory: 'reto-low-ticket',
  contentType: 'product',
  currency: 'USD',
  country: 'pe',
  planPrices: {
    plan_9hbxfopJ53A1q: 67,
    plan_H5qC30Wqrkuac: 77,
    plan_wFhRjp54MsvJm: 87,
  },
  pixelEnv: 'META_PIXEL_ID_GERMAN_ROZ',
  tokenEnv: 'META_CAPI_TOKEN_GERMAN_ROZ',
  graciasUrl: 'https://nutricion.germanroz.com/german-roz/desinflamate/gracias?status=success',
};

const WHOP_PURCHASE_PRODUCTS: WhopPurchaseProduct[] = [GERMAN_DESINFLAMATE];

export type ResolvedWhopPurchaseProduct = {
  product: WhopPurchaseProduct;
  /** Configured base price for the matched plan. */
  price: number;
};

/** Resolve the product (and configured price) for an incoming Whop plan id. */
export function resolveWhopPurchaseProduct(
  planId: string | undefined,
): ResolvedWhopPurchaseProduct | null {
  if (!planId) return null;
  for (const product of WHOP_PURCHASE_PRODUCTS) {
    const price = product.planPrices[planId];
    if (typeof price === 'number') return { product, price };
  }
  return null;
}

/** All plan ids tracked by the generic registry (for diagnostics/QA). */
export function getAllWhopPurchasePlanIds(): string[] {
  return WHOP_PURCHASE_PRODUCTS.flatMap((p) => Object.keys(p.planPrices));
}
