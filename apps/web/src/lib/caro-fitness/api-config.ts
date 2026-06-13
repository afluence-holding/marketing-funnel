const PRODUCTION_API_URL = 'https://marketing-funnelapi-production.up.railway.app';

/**
 * Backend base URL for Caro Fitness server routes (ingest, progress).
 * Defaults to production so `npm run dev:web` works without a local API.
 * Override with API_URL or NEXT_PUBLIC_API_URL (e.g. http://localhost:3000).
 */
export function getCaroFitnessBackendBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    PRODUCTION_API_URL
  );
}

export const CARO_FITNESS_INGEST_PATH = '/api/orgs/caro-fitness/bus/main/ingest';
export const CARO_FITNESS_PROGRESS_API_PATH = '/api/caro-fitness/progress';

/** Token explicitly provided by the client (URL or header). */
export function getCaroFitnessUserViewToken(request: Request): string {
  const url = new URL(request.url);
  return url.searchParams.get('token') ?? request.headers.get('x-view-token') ?? '';
}

/** Token to authenticate with the API — user token first, then server env. */
export function resolveCaroFitnessApiViewToken(request: Request): string {
  return getCaroFitnessUserViewToken(request) || process.env.CARO_FITNESS_VIEW_TOKEN || '';
}
