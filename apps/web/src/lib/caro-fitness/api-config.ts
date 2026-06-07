const PRODUCTION_API_URL = 'https://marketing-funnelapi-production.up.railway.app';

export function getCaroFitnessBackendBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : 'http://localhost:3000')
  );
}

export const CARO_FITNESS_INGEST_PATH = '/api/orgs/caro-fitness/bus/main/ingest';
