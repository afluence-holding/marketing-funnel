const PRODUCTION_API_URL = 'https://marketing-funnelapi-production.up.railway.app';

/** Resolve the Express API base URL (server-side route handlers). */
export function getApiBackendBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : 'http://localhost:3000')
  );
}

export function buildWhatsAppGroupAssignPath(orgKey: string, buKey: string) {
  return `/api/orgs/${encodeURIComponent(orgKey)}/bus/${encodeURIComponent(buKey)}/whatsapp-group/assign`;
}
