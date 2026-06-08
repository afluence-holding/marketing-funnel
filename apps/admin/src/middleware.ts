import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieSet = { name: string; value: string; options?: CookieOptions };

// '/api/agent' authenticates with its own Bearer token (NOT the session).
const PUBLIC_PATHS = ['/login', '/api/cron', '/api/agent', '/_next', '/favicon'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p));
}

// Legacy BU slug aliases: `/<from>` (and sub-paths) → `/<to>`. german-roz was
// split across `main` (launch) and `di21` (campaigns); it's now unified on
// `di21`, so old `/german-roz/main*` bookmarks redirect to keep working.
const LEGACY_BU_REDIRECTS: Array<{ from: string; to: string }> = [
  { from: '/german-roz/main', to: '/german-roz/di21' },
];

function legacyRedirect(pathname: string): string | null {
  for (const { from, to } of LEGACY_BU_REDIRECTS) {
    if (pathname === from || pathname.startsWith(from + '/')) {
      return to + pathname.slice(from.length);
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const aliased = legacyRedirect(pathname);
  if (aliased) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = aliased;
    return NextResponse.redirect(redirect, 308);
  }

  if (isPublic(pathname)) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isApi = pathname.startsWith('/api/');

  if (!url || !anonKey) {
    if (isApi) {
      return NextResponse.json({ error: 'misconfigured' }, { status: 500 });
    }
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/login';
    redirect.searchParams.set('err', 'misconfig');
    return NextResponse.redirect(redirect);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet: CookieSet[]) {
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    if (isApi) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/login';
    redirect.searchParams.set('next', pathname);
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
