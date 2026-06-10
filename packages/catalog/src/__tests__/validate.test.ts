import { describe, expect, it } from 'vitest';
import { validateCatalog, validateProduct } from '../validate';
import { CATALOG, GERMAN_ROZ_MAIN } from '../index';
import type { BusinessUnitProduct } from '../types';

function clone(): BusinessUnitProduct {
  return JSON.parse(JSON.stringify(GERMAN_ROZ_MAIN)) as BusinessUnitProduct;
}

describe('validateCatalog', () => {
  it('the live catalog is valid', () => {
    expect(validateCatalog(CATALOG)).toEqual([]);
  });
});

describe('validateProduct', () => {
  it('rejects an empty contentId', () => {
    const p = clone();
    p.cohorts[0].contentId = '  ';
    expect(validateProduct(p).join('\n')).toMatch(/empty contentId/);
  });

  it('rejects an invalid IANA timezone', () => {
    const p = clone();
    p.cohorts[0].timezone = 'America/Nowhere';
    expect(validateProduct(p).join('\n')).toMatch(/invalid IANA timezone/);
  });

  it('rejects unordered tiers', () => {
    const p = clone();
    const [t1, t2, t3] = p.cohorts[0].tiers;
    p.cohorts[0].tiers = [t2, t1, t3];
    expect(validateProduct(p).join('\n')).toMatch(/ordered by ascending "until"/);
  });

  it('rejects a non-final tier without "until"', () => {
    const p = clone();
    delete p.cohorts[0].tiers[0].until;
    expect(validateProduct(p).join('\n')).toMatch(/only the final tier may omit/);
  });

  it('rejects duplicate checkout refs (ambiguous plan→cohort resolution)', () => {
    const p = clone();
    p.cohorts.push({
      ...p.cohorts[0],
      code: 'DI21-C3',
      contentId: 'di21-c3',
      startsAt: '2026-09-01T00:00:00-05:00',
      endsAt: '2026-09-21T23:59:59-05:00',
    });
    expect(validateProduct(p).join('\n')).toMatch(/duplicate checkoutRef/);
  });

  it('rejects overlapping cohort periods in the same BU', () => {
    const p = clone();
    p.cohorts.push({
      code: 'DI21-C3',
      contentId: 'di21-c3',
      startsAt: '2026-06-20T00:00:00-05:00', // overlaps C2
      endsAt: '2026-07-10T23:59:59-05:00',
      timezone: 'America/Lima',
      tiers: [{ price: 97, checkoutRef: { provider: 'whop', planId: 'plan_other' } }],
    });
    expect(validateProduct(p).join('\n')).toMatch(/overlapping periods/);
  });

  it('rejects duplicate cohort codes', () => {
    const p = clone();
    p.cohorts.push({
      ...p.cohorts[0],
      contentId: 'di21-x',
      startsAt: '2026-09-01T00:00:00-05:00',
      endsAt: '2026-09-21T23:59:59-05:00',
      tiers: [{ price: 97, checkoutRef: { provider: 'whop', planId: 'plan_other' } }],
    });
    expect(validateProduct(p).join('\n')).toMatch(/duplicate cohort code/);
  });

  it('rejects a startsAt after endsAt', () => {
    const p = clone();
    p.cohorts[0].startsAt = '2026-07-10T00:00:00-05:00';
    expect(validateProduct(p).join('\n')).toMatch(/startsAt is after endsAt/);
  });

  it('rejects an undated cohort when the product has multiple cohorts (eclipse risk)', () => {
    const p = clone();
    p.cohorts.push({
      code: 'DI21-C3',
      contentId: 'di21-c3',
      timezone: 'America/Lima', // no startsAt/endsAt → would eclipse every edition
      tiers: [{ price: 97, checkoutRef: { provider: 'whop', planId: 'plan_other' } }],
    });
    expect(validateProduct(p).join('\n')).toMatch(/require startsAt AND endsAt/);
  });

  it('rejects cohorts declared out of chronological order', () => {
    const p = clone();
    const c3 = {
      code: 'DI21-C3',
      contentId: 'di21-c3',
      startsAt: '2026-09-01T21:00:00-05:00',
      endsAt: '2026-09-21T23:59:59-05:00',
      timezone: 'America/Lima',
      tiers: [{ price: 97, checkoutRef: { provider: 'whop' as const, planId: 'plan_c3' } }],
    };
    p.cohorts = [c3, p.cohorts[0]]; // C3 declared before C2
    expect(validateProduct(p).join('\n')).toMatch(/chronological order/);
  });

  it('rejects a checkoutRef claimed by two different products (webhook ambiguity)', () => {
    const p1 = clone();
    const p2 = clone();
    p2.productKey = 'other-product';
    p2.buKey = 'other-bu';
    p2.cohorts = [{ ...p2.cohorts[0], code: 'OTHER-C1', contentId: 'other' }];
    expect(validateCatalog([p1, p2]).join('\n')).toMatch(/claimed by both/);
  });

  it('rejects mixed providers within one cohort (a cohort sells through ONE provider)', () => {
    const p = clone();
    p.cohorts[0].tiers[2] = {
      price: 87,
      checkoutRef: { provider: 'hotmart', offerCode: 'abc123xy' },
    };
    expect(validateProduct(p).join('\n')).toMatch(/tiers mix providers/);
  });

  it('accepts a valid hotmart-only cohort', () => {
    const p = clone();
    p.cohorts.push({
      code: 'DI21-C4',
      contentId: 'di21-c4',
      startsAt: '2026-12-01T21:00:00-05:00',
      endsAt: '2026-12-21T23:59:59-05:00',
      timezone: 'America/Lima',
      tiers: [
        { price: 67, until: '2026-12-07T23:59:59-05:00', checkoutRef: { provider: 'hotmart', offerCode: 'abc123xy' } },
        { price: 87, checkoutRef: { provider: 'hotmart', offerCode: 'def456zw' } },
      ],
    });
    expect(validateProduct(p)).toEqual([]);
  });

  it('accepts a valid additive C3', () => {
    const p = clone();
    p.cohorts.push({
      code: 'DI21-C3',
      contentId: 'di21-c3',
      startsAt: '2026-09-01T21:00:00-05:00',
      endsAt: '2026-09-21T23:59:59-05:00',
      timezone: 'America/Lima',
      tiers: [
        { price: 77, until: '2026-09-07T23:59:59-05:00', checkoutRef: { provider: 'whop', planId: 'plan_c3_a' } },
        { price: 97, checkoutRef: { provider: 'whop', planId: 'plan_c3_b' } },
      ],
    });
    expect(validateProduct(p)).toEqual([]);
  });
});
