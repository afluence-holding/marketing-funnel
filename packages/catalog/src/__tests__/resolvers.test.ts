import { describe, expect, it } from 'vitest';
import {
  getCohortByCheckoutId,
  getCohortProvider,
  getHotmartOfferCodes,
  getWhopPlanIds,
  getWhopPlanPrices,
  resolveActiveCohort,
  resolveActiveTier,
  resolveCohortForPayment,
  resolveTier,
} from '../resolvers';
import { GERMAN_ROZ_MAIN } from '../products/german-roz-main';
import type { BusinessUnitProduct, Cohort } from '../types';

const at = (iso: string) => new Date(iso);

// Single-cohort Whop fixture for PURE RESOLVER LOGIC tests — decoupled from the
// live catalog (which after the 2026-06-10 Hotmart switch sells C2 via Hotmart).
// Mirrors the original C2 Whop edition (10–30 jun, $67/$77/$87).
const C2_WHOP: BusinessUnitProduct = {
  productKey: 'german-desinflamate',
  orgKey: 'german-roz',
  buKey: 'main',
  currency: 'USD',
  country: 'pe',
  source: 'landing-german-roz-desinflamate',
  contentName: 'Reto Desinflámate 21 días',
  contentCategory: 'reto-low-ticket',
  contentType: 'product',
  cohorts: [
    {
      code: 'DI21-C2',
      contentId: 'di21-c2',
      startsAt: '2026-06-10T21:00:00-05:00',
      endsAt: '2026-06-30T23:59:59-05:00',
      timezone: 'America/Lima',
      tiers: [
        { price: 67, until: '2026-06-16T23:59:59-05:00', checkoutRef: { provider: 'whop', planId: 'plan_9hbxfopJ53A1q' } },
        { price: 77, until: '2026-06-23T23:59:59-05:00', checkoutRef: { provider: 'whop', planId: 'plan_H5qC30Wqrkuac' } },
        { price: 87, checkoutRef: { provider: 'whop', planId: 'plan_wFhRjp54MsvJm' } },
      ],
    },
  ],
};

// Fictional C3 — proves launching a new cohort is purely additive (story B3):
// appending it must not change any C2 resolution below.
const C3: Cohort = {
  code: 'DI21-C3',
  contentId: 'di21-c3',
  startsAt: '2026-09-01T21:00:00-05:00',
  endsAt: '2026-09-21T23:59:59-05:00',
  timezone: 'America/Lima',
  tiers: [
    { price: 77, until: '2026-09-07T23:59:59-05:00', checkoutRef: { provider: 'whop', planId: 'plan_c3_tier1' } },
    { price: 97, checkoutRef: { provider: 'whop', planId: 'plan_c3_final' } },
  ],
};

const WITH_C3: BusinessUnitProduct = {
  ...C2_WHOP,
  cohorts: [...C2_WHOP.cohorts, C3],
};

describe('resolveActiveCohort', () => {
  it('is active inside the C2 period', () => {
    const r = resolveActiveCohort(C2_WHOP, at('2026-06-15T12:00:00-05:00'));
    expect(r.cohort.code).toBe('DI21-C2');
    expect(r.resolutionSource).toBe('active');
  });

  it('is active on the exact open/close bounds (inclusive)', () => {
    expect(
      resolveActiveCohort(C2_WHOP, at('2026-06-10T21:00:00-05:00')).resolutionSource,
    ).toBe('active');
    expect(
      resolveActiveCohort(C2_WHOP, at('2026-06-30T23:59:59-05:00')).resolutionSource,
    ).toBe('active');
  });

  it('falls back to the upcoming cohort before the first start — still sellable', () => {
    const r = resolveActiveCohort(C2_WHOP, at('2026-06-09T12:00:00-05:00'));
    expect(r.cohort.code).toBe('DI21-C2');
    expect(r.resolutionSource).toBe('fallback_upcoming');
  });

  it('falls back to the latest past cohort after close — still sellable', () => {
    const r = resolveActiveCohort(C2_WHOP, at('2026-07-15T12:00:00-05:00'));
    expect(r.cohort.code).toBe('DI21-C2');
    expect(r.resolutionSource).toBe('fallback_latest');
  });

  it('resolves the gap between C2 and C3 to the latest past cohort (C2)', () => {
    const r = resolveActiveCohort(WITH_C3, at('2026-08-01T12:00:00-05:00'));
    expect(r.cohort.code).toBe('DI21-C2');
    expect(r.resolutionSource).toBe('fallback_latest');
  });

  it('resolves C3 when inside the C3 period', () => {
    const r = resolveActiveCohort(WITH_C3, at('2026-09-05T12:00:00-05:00'));
    expect(r.cohort.code).toBe('DI21-C3');
    expect(r.resolutionSource).toBe('active');
  });

  it('adding C3 does NOT change any C2 resolution (additive launch — story B3)', () => {
    for (const iso of [
      '2026-06-09T12:00:00-05:00',
      '2026-06-15T12:00:00-05:00',
      '2026-06-20T12:00:00-05:00',
      '2026-06-28T12:00:00-05:00',
    ]) {
      const before = resolveActiveTier(C2_WHOP, at(iso));
      const after = resolveActiveTier(WITH_C3, at(iso));
      expect(after.cohort.code).toBe(before.cohort.code);
      expect(after.tier).toEqual(before.tier);
    }
  });
});

describe('resolveActiveCohort — edge cases (auditor findings)', () => {
  it('throws on a product with zero cohorts (validation prevents this in CI)', () => {
    expect(() =>
      resolveActiveCohort({ ...GERMAN_ROZ_MAIN, cohorts: [] }, at('2026-06-15T12:00:00-05:00')),
    ).toThrow(/has no cohorts/);
  });

  it('treats a single undated cohort as always-active', () => {
    const undated: BusinessUnitProduct = {
      ...GERMAN_ROZ_MAIN,
      cohorts: [{ ...GERMAN_ROZ_MAIN.cohorts[0], startsAt: undefined, endsAt: undefined }],
    };
    const r = resolveActiveCohort(undated, at('2030-01-01T00:00:00Z'));
    expect(r.cohort.code).toBe('DI21-C2');
    expect(r.resolutionSource).toBe('active');
  });

  it('is order-independent: a mis-ordered catalog resolves identically', () => {
    const reversed: BusinessUnitProduct = {
      ...WITH_C3,
      cohorts: [...WITH_C3.cohorts].reverse(),
    };
    for (const iso of [
      '2026-06-09T12:00:00-05:00', // before C2 → upcoming C2
      '2026-06-15T12:00:00-05:00', // inside C2
      '2026-08-01T12:00:00-05:00', // gap → latest past C2
      '2026-09-05T12:00:00-05:00', // inside C3
      '2026-10-01T12:00:00-05:00', // after C3 → latest past C3
    ]) {
      const a = resolveActiveCohort(WITH_C3, at(iso));
      const b = resolveActiveCohort(reversed, at(iso));
      expect(b.cohort.code).toBe(a.cohort.code);
      expect(b.resolutionSource).toBe(a.resolutionSource);
    }
  });

  it('after the LAST cohort ends, attributes to the latest by endsAt (not array order)', () => {
    const r = resolveActiveCohort(WITH_C3, at('2026-10-01T12:00:00-05:00'));
    expect(r.cohort.code).toBe('DI21-C3');
    expect(r.resolutionSource).toBe('fallback_latest');
  });
});

describe('resolveTier (parity with legacy resolveWhopTier)', () => {
  it('skips an unparseable "until" and falls through (legacy parity)', () => {
    const cohort: Cohort = {
      code: 'BAD-UNTIL',
      contentId: 'x',
      timezone: 'America/Lima',
      tiers: [
        { price: 10, until: 'not-a-date', checkoutRef: { provider: 'whop', planId: 'p1' } },
        { price: 20, checkoutRef: { provider: 'whop', planId: 'p2' } },
      ],
    };
    expect(resolveTier(cohort, at('2026-06-15T12:00:00-05:00')).price).toBe(20);
  });

  const c2 = GERMAN_ROZ_MAIN.cohorts[0];

  it('tier 1 ($67) until 16-jun 23:59:59 Lima inclusive', () => {
    expect(resolveTier(c2, at('2026-06-16T23:59:59-05:00')).price).toBe(67);
  });

  it('tier 2 ($77) from 17-jun 00:00:00 Lima', () => {
    expect(resolveTier(c2, at('2026-06-17T00:00:00-05:00')).price).toBe(77);
  });

  it('tier 2 ($77) until 23-jun 23:59:59 Lima inclusive', () => {
    expect(resolveTier(c2, at('2026-06-23T23:59:59-05:00')).price).toBe(77);
  });

  it('final tier ($87) from 24-jun and beyond (no until = fallback)', () => {
    expect(resolveTier(c2, at('2026-06-24T00:00:00-05:00')).price).toBe(87);
    expect(resolveTier(c2, at('2026-12-01T00:00:00-05:00')).price).toBe(87);
  });

  it('handles a DST-observing timezone boundary (future creators)', () => {
    // Europe/Madrid switches CET(+01)→CEST(+02) on 2026-03-29 02:00.
    const cohort: Cohort = {
      code: 'DST-TEST',
      contentId: 'dst-test',
      timezone: 'Europe/Madrid',
      tiers: [
        { price: 10, until: '2026-03-29T01:59:59+01:00', checkoutRef: { provider: 'whop', planId: 'p1' } },
        { price: 20, checkoutRef: { provider: 'whop', planId: 'p2' } },
      ],
    };
    expect(resolveTier(cohort, at('2026-03-29T00:59:59Z')).price).toBe(10); // 01:59:59+01:00
    expect(resolveTier(cohort, at('2026-03-29T01:00:00Z')).price).toBe(20); // 03:00:00+02:00
  });
});

describe('webhook attribution: resolveCohortForPayment', () => {
  it('priority 1 — explicit cohort code from session metadata', () => {
    const r = resolveCohortForPayment(WITH_C3, {
      cohortCode: 'DI21-C2',
      planOrOfferId: 'plan_c3_final', // contradictory on purpose: metadata wins
      paidAt: at('2026-09-05T12:00:00-05:00'),
    });
    expect(r.cohort.code).toBe('DI21-C2');
    expect(r.resolutionSource).toBe('metadata');
  });

  it('priority 2 — plan id when metadata is missing', () => {
    const r = resolveCohortForPayment(WITH_C3, {
      planOrOfferId: 'plan_9hbxfopJ53A1q',
      paidAt: at('2026-09-05T12:00:00-05:00'),
    });
    expect(r.cohort.code).toBe('DI21-C2');
    expect(r.resolutionSource).toBe('checkout_ref');
  });

  it('priority 3 — payment date when neither metadata nor plan resolve', () => {
    const r = resolveCohortForPayment(WITH_C3, {
      planOrOfferId: 'plan_unknown',
      paidAt: at('2026-06-15T12:00:00-05:00'),
    });
    expect(r.cohort.code).toBe('DI21-C2');
    expect(r.resolutionSource).toBe('paid_at');
  });
});

describe('hotmart tiers (US-1.1 — adapter parity)', () => {
  // A future Hotmart-only edition: must resolve tier/price/contentId exactly
  // like a Whop cohort.
  const HOTMART_C4: Cohort = {
    code: 'DI21-C4',
    contentId: 'di21-c4',
    startsAt: '2026-12-01T21:00:00-05:00',
    endsAt: '2026-12-21T23:59:59-05:00',
    timezone: 'America/Lima',
    tiers: [
      { price: 67, until: '2026-12-07T23:59:59-05:00', checkoutRef: { provider: 'hotmart', offerCode: 'abc123xy' } },
      { price: 87, checkoutRef: { provider: 'hotmart', offerCode: 'def456zw' } },
    ],
  };
  const WITH_HOTMART: BusinessUnitProduct = {
    ...C2_WHOP,
    cohorts: [...C2_WHOP.cohorts, HOTMART_C4],
  };

  it('resolves a hotmart cohort and tier by date like a whop one', () => {
    const r = resolveActiveTier(WITH_HOTMART, at('2026-12-05T12:00:00-05:00'));
    expect(r.cohort.code).toBe('DI21-C4');
    expect(r.cohort.contentId).toBe('di21-c4');
    expect(r.tier.price).toBe(67);
    expect(r.tier.checkoutRef).toEqual({ provider: 'hotmart', offerCode: 'abc123xy' });
    expect(r.resolutionSource).toBe('active');
  });

  it('finds the owning cohort by offer code (webhook path)', () => {
    const hit = getCohortByCheckoutId(WITH_HOTMART, 'def456zw');
    expect(hit?.cohort.code).toBe('DI21-C4');
    expect(hit?.tier.price).toBe(87);
  });

  it('lists hotmart offer codes and keeps whop plan ids separate', () => {
    expect(getHotmartOfferCodes(WITH_HOTMART)).toEqual(['abc123xy', 'def456zw']);
    expect(getWhopPlanIds(WITH_HOTMART)).toEqual([
      'plan_9hbxfopJ53A1q',
      'plan_H5qC30Wqrkuac',
      'plan_wFhRjp54MsvJm',
    ]);
  });

  it('reports the cohort provider', () => {
    expect(getCohortProvider(HOTMART_C4)).toBe('hotmart');
    expect(getCohortProvider(C2_WHOP.cohorts[0])).toBe('whop');
  });

  it('adding a hotmart cohort does not change any C2 resolution (additive)', () => {
    for (const iso of ['2026-06-15T12:00:00-05:00', '2026-06-28T12:00:00-05:00']) {
      const before = resolveActiveTier(C2_WHOP, at(iso));
      const after = resolveActiveTier(WITH_HOTMART, at(iso));
      expect(after.cohort.code).toBe(before.cohort.code);
      expect(after.tier).toEqual(before.tier);
    }
  });
});

describe('plan lookups', () => {
  it('maps every C2 plan id to its price', () => {
    expect(getWhopPlanPrices(GERMAN_ROZ_MAIN)).toEqual({
      plan_9hbxfopJ53A1q: 67,
      plan_H5qC30Wqrkuac: 77,
      plan_wFhRjp54MsvJm: 87,
    });
  });

  it('lists all plan ids across cohorts', () => {
    expect(getWhopPlanIds(WITH_C3)).toEqual([
      'plan_9hbxfopJ53A1q',
      'plan_H5qC30Wqrkuac',
      'plan_wFhRjp54MsvJm',
      'plan_c3_tier1',
      'plan_c3_final',
    ]);
  });

  it('finds the owning cohort+tier of a plan id', () => {
    const hit = getCohortByCheckoutId(WITH_C3, 'plan_H5qC30Wqrkuac');
    expect(hit?.cohort.code).toBe('DI21-C2');
    expect(hit?.tier.price).toBe(77);
    expect(getCohortByCheckoutId(WITH_C3, 'plan_nope')).toBeNull();
  });
});
