import type { BusinessUnitProduct } from '../types';

/**
 * German Roz · Desinflámate (BU `main`). One cohort per sales edition.
 *
 * C2 mirrors the EXACT live values previously inlined in
 * `apps/web/src/lib/whop/products.ts` and `apps/api/src/core/services/whop-products.ts`
 * (price ladder $67/$77/$87 with America/Lima cutoffs, contentId `di21-c2`).
 *
 * Launching C3 = appending a new cohort here (+ its `launch_ops.launch` row).
 * NEVER edit a closed cohort — past editions stay queryable forever.
 */
export const GERMAN_ROZ_MAIN: BusinessUnitProduct = {
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
      // C2 sales period (America/Lima): opens when the 10-jun webinar closes,
      // cart closes 30-jun 23:59. Dates drive edition/price resolution and
      // attribution only — the funnel sells always (no redirects).
      startsAt: '2026-06-10T21:00:00-05:00',
      endsAt: '2026-06-30T23:59:59-05:00',
      timezone: 'America/Lima',
      // Price ladder: 10–16 jun $67 · 17–23 jun $77 · 24–30 jun $87
      tiers: [
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
      ],
    },
  ],
};
