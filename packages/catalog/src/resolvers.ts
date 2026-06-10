/**
 * Pure cohort/tier resolution. `now` is always injectable for tests; callers
 * in Next.js MUST live on `force-dynamic` routes (a static consumer would
 * freeze the price at build time).
 *
 * IMPORTANT: resolution NEVER blocks the sale. Outside any cohort period we
 * still return a sellable cohort/tier (parity with the live funnel, which
 * sells always) — but the fallback is explicit via `resolutionSource` so
 * attribution and logs can tell the difference.
 */

import type {
  BusinessUnitProduct,
  CheckoutRef,
  Cohort,
  ResolvedCohort,
  ResolvedTier,
  Tier,
} from './types';

function toMs(iso: string | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Resolve which cohort applies at `now`.
 *
 * - Inside a cohort's [startsAt, endsAt] (inclusive bounds) → that cohort, `active`.
 * - Before the first cohort starts → the first cohort, `fallback_upcoming`.
 * - In a gap between cohorts, or after the last one ends → the most recent
 *   past cohort, `fallback_latest`.
 *
 * Cohorts with no dates are treated as always-active (open period).
 * Throws if the product has no cohorts (catalog validation prevents this).
 */
export function resolveActiveCohort(
  product: BusinessUnitProduct,
  now: Date = new Date(),
): ResolvedCohort {
  const cohorts = product.cohorts;
  if (cohorts.length === 0) {
    throw new Error(`[catalog] product ${product.productKey} has no cohorts`);
  }
  const t = now.getTime();

  // Order-independent: validation enforces chronological declaration, but the
  // resolver never trusts array order (an unordered catalog must not change
  // attribution).
  let latestPast: { cohort: Cohort; ends: number } | null = null;
  let earliestUpcoming: { cohort: Cohort; starts: number } | null = null;
  for (const cohort of cohorts) {
    const starts = toMs(cohort.startsAt);
    const ends = toMs(cohort.endsAt);
    const afterStart = starts === null || t >= starts;
    const beforeEnd = ends === null || t <= ends;
    if (afterStart && beforeEnd) {
      return { cohort, resolutionSource: 'active' };
    }
    if (ends !== null && t > ends && (!latestPast || ends > latestPast.ends)) {
      latestPast = { cohort, ends };
    }
    if (starts !== null && t < starts && (!earliestUpcoming || starts < earliestUpcoming.starts)) {
      earliestUpcoming = { cohort, starts };
    }
  }

  if (latestPast) {
    return { cohort: latestPast.cohort, resolutionSource: 'fallback_latest' };
  }
  if (earliestUpcoming) {
    return { cohort: earliestUpcoming.cohort, resolutionSource: 'fallback_upcoming' };
  }
  return { cohort: cohorts[0], resolutionSource: 'fallback_upcoming' };
}

/**
 * Resolve the active price tier of a cohort for `now`. Returns the first tier
 * whose `until` is in the future (inclusive); if every dated tier has elapsed,
 * returns the final tier (the one without `until`, or the last in the list as
 * a safety net). Exact parity with the legacy `resolveWhopTier`.
 */
export function resolveTier(cohort: Cohort, now: Date = new Date()): Tier {
  const t = now.getTime();
  for (const tier of cohort.tiers) {
    if (!tier.until) return tier;
    const untilMs = toMs(tier.until);
    if (untilMs !== null && t <= untilMs) return tier;
  }
  return cohort.tiers[cohort.tiers.length - 1];
}

/** Resolve cohort + tier in one step (the common storefront path). */
export function resolveActiveTier(
  product: BusinessUnitProduct,
  now: Date = new Date(),
): ResolvedTier {
  const { cohort, resolutionSource } = resolveActiveCohort(product, now);
  return { tier: resolveTier(cohort, now), cohort, resolutionSource };
}

export function getCohortByCode(
  product: BusinessUnitProduct,
  code: string | undefined,
): Cohort | null {
  if (!code) return null;
  return product.cohorts.find((c) => c.code === code) ?? null;
}

function refMatchesPlanOrOffer(ref: CheckoutRef, id: string): boolean {
  return ref.provider === 'whop' ? ref.planId === id : ref.offerCode === id;
}

/** Find the cohort (and tier) that owns a provider plan/offer id. */
export function getCohortByCheckoutId(
  product: BusinessUnitProduct,
  planOrOfferId: string | undefined,
): { cohort: Cohort; tier: Tier } | null {
  if (!planOrOfferId) return null;
  for (const cohort of product.cohorts) {
    for (const tier of cohort.tiers) {
      if (refMatchesPlanOrOffer(tier.checkoutRef, planOrOfferId)) {
        return { cohort, tier };
      }
    }
  }
  return null;
}

/**
 * Webhook cohort attribution by priority:
 *   1. explicit `cohort_code` from the checkout session metadata,
 *   2. the plan/offer id of the payment,
 *   3. the payment date (`paidAt`).
 * Always resolves (never null): step 3 falls back like `resolveActiveCohort`.
 */
export function resolveCohortForPayment(
  product: BusinessUnitProduct,
  input: { cohortCode?: string; planOrOfferId?: string; paidAt?: Date },
): { cohort: Cohort; resolutionSource: 'metadata' | 'checkout_ref' | 'paid_at' } {
  const byCode = getCohortByCode(product, input.cohortCode);
  if (byCode) return { cohort: byCode, resolutionSource: 'metadata' };

  const byRef = getCohortByCheckoutId(product, input.planOrOfferId);
  if (byRef) return { cohort: byRef.cohort, resolutionSource: 'checkout_ref' };

  const { cohort } = resolveActiveCohort(product, input.paidAt ?? new Date());
  return { cohort, resolutionSource: 'paid_at' };
}

/** All Whop plan ids across every cohort of a product (webhook matching). */
export function getWhopPlanIds(product: BusinessUnitProduct): string[] {
  const ids: string[] = [];
  for (const cohort of product.cohorts) {
    for (const tier of cohort.tiers) {
      if (tier.checkoutRef.provider === 'whop') ids.push(tier.checkoutRef.planId);
    }
  }
  return ids;
}

/** Whop plan id → price map across every cohort (CAPI value fallback). */
export function getWhopPlanPrices(product: BusinessUnitProduct): Record<string, number> {
  const prices: Record<string, number> = {};
  for (const cohort of product.cohorts) {
    for (const tier of cohort.tiers) {
      if (tier.checkoutRef.provider === 'whop') {
        prices[tier.checkoutRef.planId] = tier.price;
      }
    }
  }
  return prices;
}

/** All Hotmart offer codes across every cohort of a product (webhook matching). */
export function getHotmartOfferCodes(product: BusinessUnitProduct): string[] {
  const codes: string[] = [];
  for (const cohort of product.cohorts) {
    for (const tier of cohort.tiers) {
      if (tier.checkoutRef.provider === 'hotmart') codes.push(tier.checkoutRef.offerCode);
    }
  }
  return codes;
}

/**
 * The single provider a cohort sells through (validation rejects mixed-provider
 * cohorts, so the first tier is authoritative).
 */
export function getCohortProvider(cohort: Cohort): CheckoutRef['provider'] {
  return cohort.tiers[0]?.checkoutRef.provider ?? 'whop';
}
