const PRODUCTION_API_URL = 'https://marketing-funnelapi-production.up.railway.app';

export function getMamaSinCaosBackendBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : 'http://localhost:3000')
  );
}

export const MAMA_SIN_CAOS_LEADS_API_PATH = '/api/mama-sin-caos/leads';
