const PRODUCTION_API_URL = 'https://marketing-funnelapi-production.up.railway.app';

export function getMamaSinCaosBackendBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : 'http://localhost:3000')
  );
}

export const MAMA_SIN_CAOS_LEADS_API_PATH = '/api/mama-sin-caos/leads';

// Ruta genérica de ingesta (org real → marketing.leads). La usa el landing de
// diagnóstico (a diferencia de `lista-secreta`, que va a la tabla dedicada).
export const MAMA_SIN_CAOS_INGEST_PATH = '/api/orgs/mama-sin-caos/bus/main/ingest';

// Panel de respuestas del diagnóstico (lee marketing.leads + custom fields).
export const MAMA_SIN_CAOS_RESPONSES_API_PATH = '/api/mama-sin-caos/diagnostico/responses';

/** Token explícito provisto por el cliente (URL o header). */
export function getMamaSinCaosUserViewToken(request: Request): string {
  const url = new URL(request.url);
  return url.searchParams.get('token') ?? request.headers.get('x-view-token') ?? '';
}

/** Token para autenticar contra la API — token del usuario primero, luego env del server. */
export function resolveMamaSinCaosApiViewToken(request: Request): string {
  return getMamaSinCaosUserViewToken(request) || process.env.MAMA_SIN_CAOS_VIEW_TOKEN || '';
}
