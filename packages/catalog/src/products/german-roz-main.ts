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
      // C2 · Whop — PARQUEADO (switch a Hotmart 2026-06-10, decisión de Negocio).
      // Ya NO es la edición que vende: se conserva SOLO para que los plan_id de
      // Whop sigan resolviendo refunds/CAPI de cualquier compra hecha por Whop
      // (el webhook resuelve por plan_id, no por fecha). Las fechas son
      // nominales (un día pasado) para que nunca resuelva como cohort activo.
      // Rollback del switch: git revert → vuelve a vender por Whop.
      code: 'DI21-C2',
      contentId: 'di21-c2',
      startsAt: '2026-06-09T00:00:00-05:00',
      endsAt: '2026-06-09T23:59:59-05:00',
      timezone: 'America/Lima',
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
    {
      // C2 · Hotmart — LA EDICIÓN QUE VENDE (switch 2026-06-10). Misma escalera
      // y cierre 30-jun que el C2 original; contentId 'di21-c2' compartido para
      // que Meta reporte la edición unificada. cohort_code distinto (DI21-C2H)
      // separa el revenue por rail en marketing.purchases.
      // Offer codes USD verificados por API (docs/hotmart-api.md §4).
      code: 'DI21-C2H',
      contentId: 'di21-c2',
      startsAt: '2026-06-10T00:00:00-05:00',
      endsAt: '2026-06-30T23:59:59-05:00',
      timezone: 'America/Lima',
      // Price ladder: hasta 16 jun $67 · 17–23 jun $77 · 24–30 jun $87
      tiers: [
        {
          price: 67,
          until: '2026-06-16T23:59:59-05:00',
          checkoutRef: { provider: 'hotmart', offerCode: 'ymzf5qdj' },
        },
        {
          price: 77,
          until: '2026-06-23T23:59:59-05:00',
          checkoutRef: { provider: 'hotmart', offerCode: '5kh9auq4' },
        },
        {
          price: 87,
          checkoutRef: { provider: 'hotmart', offerCode: '3m2koch3' },
        },
      ],
    },
  ],
};
