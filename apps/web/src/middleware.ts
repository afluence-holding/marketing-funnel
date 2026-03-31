import { NextResponse, type NextRequest } from 'next/server';

/**
 * Domain-to-org rewrites.
 * Maps custom client domains to their org landing directories,
 * so `nutricion.germanroz.com/vsl-desinflamate` serves `/german-roz/vsl-desinflamate`.
 */
const DOMAIN_TO_ORG: Record<string, string> = {
  'nutricion.germanroz.com': '/german-roz',
};

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const orgPrefix = DOMAIN_TO_ORG[host];

  if (orgPrefix) {
    const { pathname } = request.nextUrl;

    // Avoid rewriting if already prefixed (e.g. _next, api, static assets)
    if (
      pathname.startsWith(orgPrefix) ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/favicon')
    ) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `${orgPrefix}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
