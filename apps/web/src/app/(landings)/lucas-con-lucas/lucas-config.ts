/** Fuente de verdad compartida: pixel Meta, ingest, CAPI y params de eventos. */
export const LUCAS = {
  /** Debe coincidir con META_PIXEL_ID_LUCAS_CON_LUCAS en el API (CAPI dedup). */
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_LUCAS_CON_LUCAS,
  currency: 'CLP',
  country: 'cl',
  sources: {
    preLaunch: 'landing-lucas-con-lucas-pre-launch',
    webinar: 'landing-lucas-con-lucas-webinar-2026-06-04',
  },
  webinar: {
    contentIds: ['webinar-lcl-jun04'],
    contentName: 'Webinar Lucas con Luca$ Jun 4',
    contentCategory: 'webinar-registration',
    value: 0,
  },
  preLaunch: {
    contentIds: ['lucas-pre-launch'],
    contentName: 'Lucas con Luca$ Lista de espera',
    contentCategory: 'waitlist',
    value: 0,
  },
  reto: {
    contentIds: ['reto-lcl-jun29'],
    contentName: 'Reto Lucas con Luca$ 15 días',
    contentCategory: 'reto-low-ticket',
    contentType: 'product',
    source: 'landing-lucas-con-lucas-reto',
    checkoutPath: '/lucas-con-lucas/reto/checkout',
    checkoutUrl: 'https://whop.com/checkout/plan_aKOjfecUWLzFo',
    planId:
      process.env.NEXT_PUBLIC_WHOP_LUCAS_RETO_PLAN_ID ?? 'plan_aKOjfecUWLzFo',
    graciasPath: '/lucas-con-lucas/reto/gracias',
    /** Tier vigente — override con NEXT_PUBLIC_LUCAS_RETO_PRICE */
    defaultPrice: 77000,
  },
} as const;

export function getLucasRetoPrice(): number {
  const raw = process.env.NEXT_PUBLIC_LUCAS_RETO_PRICE;
  if (!raw) return LUCAS.reto.defaultPrice;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : LUCAS.reto.defaultPrice;
}

export function getLucasRetoGraciasUrl(origin?: string): string {
  const base = origin ?? 'https://marketing.byafluence.com';
  return `${base.replace(/\/$/, '')}${LUCAS.reto.graciasPath}?status=success`;
}

export function getLucasRetoCheckoutPath(): string {
  return LUCAS.reto.checkoutPath;
}
