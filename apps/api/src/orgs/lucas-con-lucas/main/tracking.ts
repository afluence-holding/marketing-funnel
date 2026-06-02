/** Constantes Meta CAPI alineadas al brief de campaña Lucas con Luca$. */
export const LUCAS_SOURCES = {
  preLaunch: 'landing-lucas-con-lucas-pre-launch',
  webinar: 'landing-lucas-con-lucas-webinar-2026-06-04',
} as const;

export const LUCAS_CAPI = {
  currency: 'CLP',
  country: 'cl',
  webinar: {
    contentIds: ['webinar-lcl-jun04'],
    contentName: 'Webinar Lucas con Luca$ Jun 4',
    contentCategory: 'webinar-registration',
    value: 0,
    events: ['Lead', 'CompleteRegistration'] as const,
  },
  preLaunch: {
    contentIds: ['lucas-pre-launch'],
    contentName: 'Lucas con Luca$ Lista de espera',
    contentCategory: 'waitlist',
    value: 0,
    events: ['Lead'] as const,
  },
  reto: {
    contentIds: ['reto-lcl-jun29'],
    contentName: 'Reto Lucas con Luca$ 15 días',
    contentType: 'product',
    defaultValue: 77000,
  },
} as const;

export function resolveLucasIngestCapi(source?: string) {
  if (source === LUCAS_SOURCES.webinar) return LUCAS_CAPI.webinar;
  if (source === LUCAS_SOURCES.preLaunch) return LUCAS_CAPI.preLaunch;
  return null;
}

export function getLucasRetoPriceFromEnv(): number {
  const raw = process.env.LUCAS_RETO_PRICE;
  if (!raw) return LUCAS_CAPI.reto.defaultValue;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : LUCAS_CAPI.reto.defaultValue;
}
