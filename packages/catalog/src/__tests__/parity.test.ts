/**
 * Parity contract with the legacy inline registries. These are the EXACT live
 * values that apps/web/src/lib/whop/products.ts and
 * apps/api/src/core/services/whop-products.ts shipped before the catalog
 * extraction — if this test fails, the migration changed the sale.
 */
import { describe, expect, it } from 'vitest';
import { GERMAN_ROZ_MAIN, getProductByBu, getProductByKey } from '../index';

describe('legacy parity — german-desinflamate (C2)', () => {
  const c2 = GERMAN_ROZ_MAIN.cohorts[0];

  it('identity matches both legacy registries', () => {
    expect(GERMAN_ROZ_MAIN.productKey).toBe('german-desinflamate');
    expect(GERMAN_ROZ_MAIN.orgKey).toBe('german-roz');
    expect(GERMAN_ROZ_MAIN.buKey).toBe('main');
    expect(GERMAN_ROZ_MAIN.currency).toBe('USD');
    expect(GERMAN_ROZ_MAIN.country).toBe('pe');
    expect(GERMAN_ROZ_MAIN.source).toBe('landing-german-roz-desinflamate');
    expect(GERMAN_ROZ_MAIN.contentName).toBe('Reto Desinflámate 21 días');
    expect(GERMAN_ROZ_MAIN.contentCategory).toBe('reto-low-ticket');
    expect(GERMAN_ROZ_MAIN.contentType).toBe('product');
  });

  it('contentId is the unified di21-c2 (post PR #77, both sides)', () => {
    expect(c2.contentId).toBe('di21-c2');
  });

  it('price ladder matches the legacy tiers exactly', () => {
    expect(c2.tiers).toEqual([
      {
        price: 67,
        until: '2026-06-16T23:59:59-05:00',
        checkoutRef: { provider: 'whop', planId: 'plan_9hbxfopJ53A1q' },
      },
      {
        price: 77,
        until: '2026-06-23T23:59:59-05:00',
        checkoutRef: { provider: 'whop', planId: 'plan_H5qC30Wqrkuac' },
      },
      {
        price: 87,
        checkoutRef: { provider: 'whop', planId: 'plan_wFhRjp54MsvJm' },
      },
    ]);
  });

  it('sales period matches the legacy opensAt/closesAt', () => {
    expect(c2.startsAt).toBe('2026-06-10T21:00:00-05:00');
    expect(c2.endsAt).toBe('2026-06-30T23:59:59-05:00');
    expect(c2.timezone).toBe('America/Lima');
  });

  it('cohort code links to launch_ops.launch.code', () => {
    expect(c2.code).toBe('DI21-C2');
  });

  it('lookups resolve by key and by org/bu', () => {
    expect(getProductByKey('german-desinflamate')).toBe(GERMAN_ROZ_MAIN);
    expect(getProductByBu('german-roz', 'main')).toBe(GERMAN_ROZ_MAIN);
    expect(getProductByKey('lucas-reto')).toBeNull(); // Lucas intentionally absent
  });
});
