import { hyrosPh, injectHyrosIntoHtml } from '@/lib/config/pixels';

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
};

/** Inject Hyros into static HTML before serving (iframes, raw routes). */
export function withLandingTracking(html: string): string {
  return injectHyrosIntoHtml(html, hyrosPh);
}

/** Build a tracked HTML Response for raw landing route handlers. */
export function landingHtmlResponse(
  html: string,
  init?: { headers?: Record<string, string>; status?: number },
): Response {
  return new Response(withLandingTracking(html), {
    status: init?.status ?? 200,
    headers: { ...DEFAULT_HEADERS, ...init?.headers },
  });
}
