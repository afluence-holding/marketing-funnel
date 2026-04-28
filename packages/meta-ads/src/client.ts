export const GRAPH_API_VERSION = 'v21.0';
export const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface MetaBucUsage {
  call_count: number | null;
  total_cputime: number | null;
  total_time: number | null;
  estimated_time_to_regain_access_sec: number | null;
}

export interface MetaFetchResult<T> {
  data: T;
  buc?: MetaBucUsage;
}

/**
 * Thrown on non-2xx Meta Graph responses. Classifies the error for downstream
 * retry/alerting decisions.
 */
export class MetaCallError extends Error {
  readonly status: number;
  readonly code: number | null;
  readonly subcode: number | null;
  readonly fbtraceId: string | null;
  readonly raw: unknown;

  constructor(params: {
    message: string;
    status: number;
    code: number | null;
    subcode: number | null;
    fbtraceId: string | null;
    raw: unknown;
  }) {
    super(params.message);
    this.name = 'MetaCallError';
    this.status = params.status;
    this.code = params.code;
    this.subcode = params.subcode;
    this.fbtraceId = params.fbtraceId;
    this.raw = params.raw;
  }

  /** Token expired / invalid (code 190) or insufficient permissions (code 102). */
  isTokenError(): boolean {
    return this.code === 190 || this.code === 102;
  }

  /** App/user/ad-account rate limit (codes 4, 17, 32, 613). */
  isRateLimited(): boolean {
    return this.code === 4 || this.code === 17 || this.code === 32 || this.code === 613;
  }

  /** Transient server-side (5xx) or temporary rate-limited reply. */
  isTransient(): boolean {
    return this.status >= 500 || this.isRateLimited();
  }
}

function toInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  return null;
}

/**
 * Parse the `x-business-use-case-usage` header. The header is a JSON object
 * mapping ad_account_id -> [{ type, call_count, total_cputime, total_time, ... }].
 * We flatten to the worst (highest-usage) entry across all types.
 */
export function parseBucHeader(headerValue: string | null, adAccountId: string): MetaBucUsage | undefined {
  if (!headerValue) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(headerValue);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== 'object') return undefined;
  const entries = (parsed as Record<string, unknown>)[adAccountId];
  if (!Array.isArray(entries) || entries.length === 0) return undefined;

  const worst: MetaBucUsage = {
    call_count: null,
    total_cputime: null,
    total_time: null,
    estimated_time_to_regain_access_sec: null,
  };
  for (const e of entries) {
    if (!e || typeof e !== 'object') continue;
    const rec = e as Record<string, unknown>;
    const cc = toInt(rec.call_count);
    const tc = toInt(rec.total_cputime);
    const tt = toInt(rec.total_time);
    const re = toInt(rec.estimated_time_to_regain_access);
    if (cc !== null && (worst.call_count === null || cc > worst.call_count)) worst.call_count = cc;
    if (tc !== null && (worst.total_cputime === null || tc > worst.total_cputime)) worst.total_cputime = tc;
    if (tt !== null && (worst.total_time === null || tt > worst.total_time)) worst.total_time = tt;
    if (re !== null && (worst.estimated_time_to_regain_access_sec === null || re > worst.estimated_time_to_regain_access_sec)) {
      worst.estimated_time_to_regain_access_sec = re;
    }
  }
  return worst;
}

/** Fetch a single Graph API endpoint. Throws MetaCallError on non-2xx. */
export async function metaGraphFetch<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  accessToken: string,
  opts: { adAccountId?: string } = {},
): Promise<MetaFetchResult<T>> {
  const url = new URL(path.startsWith('http') ? path : `${GRAPH_BASE_URL}/${path.replace(/^\//, '')}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  url.searchParams.set('access_token', accessToken);

  const res = await fetch(url.toString(), { method: 'GET' });
  const bucHeader = res.headers.get('x-business-use-case-usage');
  const buc = opts.adAccountId ? parseBucHeader(bucHeader, opts.adAccountId) : undefined;

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const errObj = (body as { error?: Record<string, unknown> } | null)?.error ?? {};
    throw new MetaCallError({
      message: String(errObj.message ?? `Meta Graph ${res.status}`),
      status: res.status,
      code: toInt(errObj.code),
      subcode: toInt(errObj.error_subcode),
      fbtraceId: typeof errObj.fbtrace_id === 'string' ? errObj.fbtrace_id : null,
      raw: body,
    });
  }

  return { data: body as T, buc };
}

/**
 * Result returned by `metaGraphFetchPaginated`. Adds two diagnostic fields
 * on top of the standard `MetaFetchResult` so callers can tell *why* the
 * pagination loop stopped:
 *
 *   - `pagesFetched`  — how many pages were actually pulled
 *   - `truncatedByMaxPages` — true iff we stopped because we hit the
 *     `maxPages` ceiling AND Meta still had a `paging.next` cursor. Callers
 *     using this to surface "we may have lost data" warnings should rely on
 *     this boolean instead of guessing from `data.length`.
 */
export interface MetaPaginatedResult<T> extends MetaFetchResult<T[]> {
  pagesFetched: number;
  truncatedByMaxPages: boolean;
}

/**
 * Fetch a paginated Graph API endpoint, following `paging.next` until empty
 * or until `maxPages` is reached. Returns the concatenated `data` array
 * along with diagnostic fields. See `MetaPaginatedResult`.
 */
export async function metaGraphFetchPaginated<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  accessToken: string,
  opts: { adAccountId?: string; maxPages?: number } = {},
): Promise<MetaPaginatedResult<T>> {
  const out: T[] = [];
  let lastBuc: MetaBucUsage | undefined;
  let nextUrl: string | null = null;
  let pagesFetched = 0;
  const maxPages = opts.maxPages ?? 100;
  let truncatedByMaxPages = false;

  while (pagesFetched < maxPages) {
    const result: MetaFetchResult<{ data: T[]; paging?: { next?: string } }> = nextUrl
      ? await metaGraphFetch(nextUrl, {}, accessToken, opts)
      : await metaGraphFetch(path, params, accessToken, opts);
    if (result.buc) lastBuc = result.buc;
    out.push(...(result.data.data ?? []));
    nextUrl = result.data.paging?.next ?? null;
    pagesFetched++;
    if (!nextUrl) break;
  }
  // We left the loop with a non-null nextUrl iff we hit maxPages while Meta
  // still had more — that's exactly the truncation condition operators care
  // about. The earlier "data.length >= maxPages * pageSize" heuristic could
  // produce both false positives (50 full pages exactly + no next) and
  // false negatives (last page with <pageSize but next still set).
  if (nextUrl) truncatedByMaxPages = true;

  return { data: out, buc: lastBuc, pagesFetched, truncatedByMaxPages };
}
