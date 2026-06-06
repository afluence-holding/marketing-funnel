const PRODUCTION_API_URL = 'https://marketing-funnelapi-production.up.railway.app';

export function getBukkuBackendBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : 'http://localhost:3000')
  );
}

export const BUKKU_LEADS_API_PATH = '/api/bukku/leads';

/** Token explicitly provided by the client (URL or header). */
export function getBukkuUserViewToken(request: Request): string {
  const url = new URL(request.url);
  return url.searchParams.get('token') ?? request.headers.get('x-view-token') ?? '';
}

/** Token to authenticate with the API — user token first, then server env. */
export function resolveBukkuApiViewToken(request: Request): string {
  return getBukkuUserViewToken(request) || process.env.BUKKU_VIEW_TOKEN || '';
}
