/**
 * Shared product/cohort catalog — the SINGLE source of definition for what we
 * sell (price ladder, sales dates, Meta contentId) per Business Unit.
 *
 * Domain (confirmed): Organization → Business Unit (= product) → Cohort
 * (sales period) → Tier. A BU IS the product; each BU has N cohorts.
 *
 * Pure data + types: no I/O, no server-only imports — safe to import from
 * Next.js client components, server components and the Express API alike.
 *
 * Ownership rules (see funcionalidades-por-desarrollar/modularizacion-cohorts):
 * - This package is the ONLY editable definition (PR + deploy to change it).
 * - `marketing.cohorts` in the DB is a read-only mirror synced FROM here.
 * - Checkout never reads the DB; ops/reporting never drive the checkout.
 */

/** Checkout reference for a tier — provider-specific pointer to "what to charge". */
export type CheckoutRef =
  | { provider: 'whop'; planId: string }
  | { provider: 'hotmart'; offerCode: string };

export type Tier = {
  /** Price in major units of the cohort currency (e.g. 67 for $67). */
  price: number;
  /**
   * Tier is active while `now <= until` (inclusive). ISO 8601 string WITH an
   * explicit timezone offset (e.g. `2026-06-16T23:59:59-05:00`). Omit on the
   * final tier so it acts as the fallback once every dated tier has elapsed.
   */
  until?: string;
  /** Provider-specific checkout pointer (the plan/offer that gets charged). */
  checkoutRef: CheckoutRef;
};

export type Cohort = {
  /**
   * Canonical cohort key — matches `launch_ops.launch.code` (e.g. `DI21-C2`).
   * WhatsApp pools (`launch_code`), `marketing.cohorts.code` and
   * `marketing.purchases.cohort_code` all point at this same string.
   */
  code: string;
  /** Meta `content_ids` value for this edition (pixel AND CAPI — must match). */
  contentId: string;
  /**
   * Sales period (ISO 8601 WITH tz offset). Used to resolve which edition is
   * being sold and for attribution — NEVER to block the sale or redirect
   * (business decision 2026-06-09: the funnel always sells).
   */
  startsAt?: string;
  endsAt?: string;
  /** IANA timezone the dates were authored in (documentation + mirror). */
  timezone: string;
  /** Date-driven price ladder; the last tier should omit `until` (fallback). */
  tiers: Tier[];
};

export type BusinessUnitProduct = {
  /** Unique product key used in URLs and storage namespacing. */
  productKey: string;
  orgKey: string;
  buKey: string;
  /** ISO 4217 currency code (uppercase), e.g. `USD`. */
  currency: string;
  /** 2-letter country code for Meta CAPI user data, e.g. `pe`. */
  country: string;
  /** Meta source tag for CAPI custom_data. */
  source: string;
  contentName: string;
  contentCategory: string;
  contentType: string;
  /** Sales editions, in chronological order (validated). */
  cohorts: Cohort[];
};

/** How the active cohort was resolved for a given `now`. */
export type CohortResolutionSource =
  /** `now` falls inside the cohort's [startsAt, endsAt] period. */
  | 'active'
  /** `now` is before the first cohort's start — selling the upcoming edition. */
  | 'fallback_upcoming'
  /** `now` is after the cohort's end (gap or post-close) — selling the latest past edition. */
  | 'fallback_latest';

export type ResolvedCohort = {
  cohort: Cohort;
  resolutionSource: CohortResolutionSource;
};

export type ResolvedTier = {
  tier: Tier;
  cohort: Cohort;
  resolutionSource: CohortResolutionSource;
};
