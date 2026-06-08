const PRODUCTION_API_URL = 'https://marketing-funnelapi-production.up.railway.app';

export function getGermanRozBackendBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : 'http://localhost:3000')
  );
}

export const GERMAN_ROZ_INGEST_PATH = '/api/orgs/german-roz/bus/main/ingest';
export const GERMAN_ROZ_PROGRESS_API_PATH = '/api/german-roz/progress';

/** Token explicitly provided by the client (URL or header). */
export function getGermanRozUserViewToken(request: Request): string {
  const url = new URL(request.url);
  return url.searchParams.get('token') ?? request.headers.get('x-view-token') ?? '';
}

/** Token to authenticate with the API — user token first, then server env. */
export function resolveGermanRozApiViewToken(request: Request): string {
  return getGermanRozUserViewToken(request) || process.env.GERMAN_ROZ_VIEW_TOKEN || '';
}
