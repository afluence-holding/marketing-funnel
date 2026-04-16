'use client';

import { useEffect } from 'react';

const PARAM_KEYS = [
  'fbclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

const FBC_MAX_AGE_SEC = 7776000; // 90 días
const HOTMART_SUBSTR = 'hotmart.com';

type ParamMap = Partial<Record<(typeof PARAM_KEYS)[number], string>>;

function readAttributionFromUrl(): ParamMap {
  if (typeof window === 'undefined') return {};
  const out: ParamMap = {};
  const search = window.location.search;
  if (!search || search.length <= 1) return out;
  const params = new URLSearchParams(search);
  for (const key of PARAM_KEYS) {
    const v = params.get(key);
    if (v != null && v !== '') out[key] = v;
  }
  return out;
}

function appendParamsToUrl(baseUrl: string, extra: ParamMap): string {
  const entries = Object.entries(extra).filter(([, v]) => v != null && v !== '') as [
    string,
    string,
  ][];
  if (entries.length === 0) return baseUrl;

  let url: URL;
  try {
    url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'https://germanroz.com');
  } catch {
    return baseUrl;
  }

  for (const [key, value] of entries) {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

function setFbcCookie(fbclid: string): void {
  if (typeof document === 'undefined') return;
  const ts = Date.now();
  const value = `fb.1.${ts}.${fbclid}`;
  const parts = [
    `_fbc=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${FBC_MAX_AGE_SEC}`,
    'SameSite=Lax',
  ];
  if (typeof location !== 'undefined' && location.protocol === 'https:') {
    parts.push('Secure');
  }
  const host = typeof location !== 'undefined' ? location.hostname : '';
  if (host === 'germanroz.com' || host.endsWith('.germanroz.com')) {
    parts.push('domain=.germanroz.com');
  }
  document.cookie = parts.join('; ');
}

const IFRAME_PATCH_KEY = '__germanRozHotmartAttributionPatched' as const;

/** El primer `iframe` del documento es el de GTM (layout); la VSL usa solo `srcDoc`. */
const VSL_IFRAME_SELECTOR = 'iframe[srcDoc]';

function patchAnchors(doc: Document, extra: ParamMap): void {
  const anchors = doc.querySelectorAll<HTMLAnchorElement>(`a[href*="${HOTMART_SUBSTR}"]`);
  anchors.forEach((a) => {
    try {
      const next = appendParamsToUrl(a.href, extra);
      if (next !== a.href) a.setAttribute('href', next);
    } catch {
      /* ignore invalid href */
    }
  });
}

function patchIframeWindow(win: Window, extra: ParamMap): void {
  const marked = win as Window & { [IFRAME_PATCH_KEY]?: boolean };
  if (marked[IFRAME_PATCH_KEY]) return;
  marked[IFRAME_PATCH_KEY] = true;

  const origOpen = win.open.bind(win);
  win.open = (
    url?: string | URL,
    target?: string,
    features?: string,
  ): Window | null => {
    let nextUrl = url;
    if (typeof url === 'string' && url.toLowerCase().includes(HOTMART_SUBSTR)) {
      nextUrl = appendParamsToUrl(url, extra);
    } else if (url instanceof URL && url.hostname.toLowerCase().includes('hotmart')) {
      nextUrl = appendParamsToUrl(url.href, extra);
    }
    return origOpen(nextUrl as string | URL, target, features);
  };

  patchAnchors(win.document, extra);
}

/**
 * Captura fbclid / UTM desde la URL del padre, setea cookie _fbc (Meta) y
 * propaga params al checkout Hotmart (parche de window.open + href en anchors
 * dentro del iframe srcDoc).
 */
export function HotmartAttribution() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const extra = readAttributionFromUrl();
    if (extra.fbclid) {
      setFbcCookie(extra.fbclid);
    }

    let attempts = 0;
    const maxAttempts = 60;
    const interval = window.setInterval(() => {
      attempts++;
      const iframe = document.querySelector(VSL_IFRAME_SELECTOR) as HTMLIFrameElement | null;
      if (!iframe?.contentWindow || !iframe.contentDocument?.body) {
        if (attempts >= maxAttempts) window.clearInterval(interval);
        return;
      }

      try {
        patchIframeWindow(iframe.contentWindow, extra);
        window.clearInterval(interval);
      } catch {
        if (attempts >= maxAttempts) window.clearInterval(interval);
      }
    }, 150);

    return () => window.clearInterval(interval);
  }, []);

  return null;
}
