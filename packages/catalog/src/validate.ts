/**
 * Catalog integrity validation. Runs in tests/CI so a config mistake fails the
 * build, never production. Plain TS (no zod) to keep the package dependency-free
 * and client-safe.
 */

import type { BusinessUnitProduct, CheckoutRef } from './types';

function checkoutRefId(ref: CheckoutRef): string {
  return ref.provider === 'whop' ? `whop:${ref.planId}` : `hotmart:${ref.offerCode}`;
}

function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function parseMs(iso: string | undefined): number | null {
  if (iso === undefined) return null;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : NaN;
}

/** Returns a list of human-readable errors; empty list = valid. */
export function validateProduct(product: BusinessUnitProduct): string[] {
  const errors: string[] = [];
  const where = `${product.orgKey}/${product.buKey} (${product.productKey})`;

  if (!product.productKey.trim()) errors.push(`product without productKey`);
  if (!product.orgKey.trim() || !product.buKey.trim()) {
    errors.push(`${where}: missing orgKey/buKey`);
  }
  if (!/^[A-Z]{3}$/.test(product.currency)) {
    errors.push(`${where}: currency must be a 3-letter uppercase ISO code, got "${product.currency}"`);
  }
  if (product.cohorts.length === 0) {
    errors.push(`${where}: product must define at least one cohort`);
    return errors;
  }

  const seenCodes = new Set<string>();
  const seenRefs = new Set<string>();
  const periods: Array<{ code: string; start: number; end: number }> = [];
  const declaredStarts: number[] = [];

  for (const cohort of product.cohorts) {
    const cWhere = `${where} cohort "${cohort.code}"`;

    // With multiple cohorts, an undated cohort is "always active" and would
    // eclipse every other edition — require full periods from the 2nd cohort on.
    if (product.cohorts.length > 1 && (!cohort.startsAt || !cohort.endsAt)) {
      errors.push(
        `${cWhere}: products with multiple cohorts require startsAt AND endsAt on every cohort`,
      );
    }

    if (!cohort.code.trim()) errors.push(`${where}: cohort with empty code`);
    if (seenCodes.has(cohort.code)) errors.push(`${where}: duplicate cohort code "${cohort.code}"`);
    seenCodes.add(cohort.code);

    if (!cohort.contentId.trim()) errors.push(`${cWhere}: empty contentId`);
    if (!isValidTimezone(cohort.timezone)) {
      errors.push(`${cWhere}: invalid IANA timezone "${cohort.timezone}"`);
    }

    const start = parseMs(cohort.startsAt);
    const end = parseMs(cohort.endsAt);
    if (start !== null && Number.isNaN(start)) errors.push(`${cWhere}: unparseable startsAt "${cohort.startsAt}"`);
    if (end !== null && Number.isNaN(end)) errors.push(`${cWhere}: unparseable endsAt "${cohort.endsAt}"`);
    if (start !== null && end !== null && !Number.isNaN(start) && !Number.isNaN(end)) {
      if (start > end) errors.push(`${cWhere}: startsAt is after endsAt`);
      periods.push({ code: cohort.code, start, end });
    }
    if (start !== null && !Number.isNaN(start)) declaredStarts.push(start);

    if (cohort.tiers.length === 0) {
      errors.push(`${cWhere}: cohort must define at least one tier`);
      continue;
    }

    let prevUntil = -Infinity;
    cohort.tiers.forEach((tier, i) => {
      const tWhere = `${cWhere} tier[${i}]`;
      const isLast = i === cohort.tiers.length - 1;

      if (!(tier.price > 0)) errors.push(`${tWhere}: price must be > 0`);

      const refId = checkoutRefId(tier.checkoutRef);
      const refValue = tier.checkoutRef.provider === 'whop'
        ? tier.checkoutRef.planId
        : tier.checkoutRef.offerCode;
      if (!refValue.trim()) errors.push(`${tWhere}: empty checkoutRef id`);
      if (seenRefs.has(refId)) {
        errors.push(`${where}: duplicate checkoutRef ${refId} — plan/offer→cohort resolution would be ambiguous`);
      }
      seenRefs.add(refId);

      if (tier.until === undefined) {
        if (!isLast) errors.push(`${tWhere}: only the final tier may omit "until"`);
        return;
      }
      const until = parseMs(tier.until);
      if (until === null || Number.isNaN(until)) {
        errors.push(`${tWhere}: unparseable until "${tier.until}"`);
        return;
      }
      if (until <= prevUntil) {
        errors.push(`${cWhere}: tiers must be ordered by ascending "until"`);
      }
      prevUntil = until;
    });
  }

  // Overlapping cohort periods within the same BU → ambiguous active cohort.
  periods.sort((a, b) => a.start - b.start);
  for (let i = 1; i < periods.length; i += 1) {
    if (periods[i].start <= periods[i - 1].end) {
      errors.push(
        `${where}: cohorts "${periods[i - 1].code}" and "${periods[i].code}" have overlapping periods`,
      );
    }
  }

  // Cohorts must be DECLARED in chronological order (readability contract —
  // the resolver itself is order-independent).
  for (let i = 1; i < declaredStarts.length; i += 1) {
    if (declaredStarts[i] < declaredStarts[i - 1]) {
      errors.push(`${where}: cohorts must be declared in chronological order (by startsAt)`);
      break;
    }
  }

  return errors;
}

/** Validate the whole catalog; also rejects duplicate productKey / org+bu pairs. */
export function validateCatalog(products: BusinessUnitProduct[]): string[] {
  const errors: string[] = [];
  const seenKeys = new Set<string>();
  const seenBus = new Set<string>();
  const seenRefsGlobal = new Map<string, string>();
  const seenCohortCodesGlobal = new Map<string, string>();
  for (const product of products) {
    if (seenKeys.has(product.productKey)) {
      errors.push(`duplicate productKey "${product.productKey}"`);
    }
    seenKeys.add(product.productKey);
    const buId = `${product.orgKey}/${product.buKey}`;
    if (seenBus.has(buId)) errors.push(`duplicate BU "${buId}"`);
    seenBus.add(buId);
    errors.push(...validateProduct(product));

    // A plan/offer id must belong to exactly ONE product across the whole
    // catalog (the webhook resolves product by plan id), and a cohort code
    // must be globally unique (marketing.cohorts.code is UNIQUE — a reused
    // code would silently steal the mirror row across BUs).
    for (const cohort of product.cohorts) {
      const codeOwner = seenCohortCodesGlobal.get(cohort.code);
      if (codeOwner && codeOwner !== product.productKey) {
        errors.push(
          `cohort code "${cohort.code}" is claimed by both "${codeOwner}" and "${product.productKey}"`,
        );
      }
      seenCohortCodesGlobal.set(cohort.code, product.productKey);
      for (const tier of cohort.tiers) {
        const refId = checkoutRefId(tier.checkoutRef);
        const owner = seenRefsGlobal.get(refId);
        if (owner && owner !== product.productKey) {
          errors.push(
            `checkoutRef ${refId} is claimed by both "${owner}" and "${product.productKey}"`,
          );
        }
        seenRefsGlobal.set(refId, product.productKey);
      }
    }
  }
  return errors;
}
