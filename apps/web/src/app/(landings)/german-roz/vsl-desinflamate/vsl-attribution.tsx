'use client';

import { useEffect } from 'react';
import { buildDesinflamateCheckoutUrl, isHotmartUrl } from './checkout-link';

const FBC_MAX_AGE_SEC = 7776000; // 90 días

/**
 * VSL attribution + CTA redirect.
 *
 * 1. Captures `fbclid` from the URL and writes the Meta `_fbc` cookie so the
 *    embedded checkout + Purchase CAPI can attribute the conversion.
 * 2. The compiled VSL bundle still wires its CTAs to the legacy Hotmart link.
 *    DI21 now sells via the embedded Whop checkout, so we rewrite any Hotmart
 *    navigation inside the srcDoc iframe to /german-roz/desinflamate/checkout.
 *    This is defense-in-depth alongside the click handler in vsl-tracker.
 */

function readFbclid(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const search = window.location.search;
  if (!search || search.length <= 1) return undefined;
  const value = new URLSearchParams(search).get('fbclid');
  return value || undefined;
}

function setFbcCookie(fbclid: string): void {
  if (typeof document === 'undefined') return;
  const value = `fb.1.${Date.now()}.${fbclid}`;
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

const IFRAME_PATCH_KEY = '__germanRozCheckoutRedirectPatched' as const;

/** El primer `iframe` del documento es el de GTM (layout); la VSL usa solo `srcDoc`. */
const VSL_IFRAME_SELECTOR = 'iframe[srcDoc]';

function rewriteAnchors(doc: Document): void {
  const anchors = doc.querySelectorAll<HTMLAnchorElement>('a[href*="hotmart"]');
  anchors.forEach((a) => {
    try {
      a.setAttribute('href', buildDesinflamateCheckoutUrl());
      a.setAttribute('target', '_top');
    } catch {
      /* ignore */
    }
  });
}

function patchIframeWindow(win: Window): void {
  const marked = win as Window & { [IFRAME_PATCH_KEY]?: boolean };
  if (marked[IFRAME_PATCH_KEY]) return;
  marked[IFRAME_PATCH_KEY] = true;

  const origOpen = win.open.bind(win);
  win.open = (
    url?: string | URL,
    target?: string,
    features?: string,
  ): Window | null => {
    const href = typeof url === 'string' ? url : url instanceof URL ? url.href : '';
    if (href && isHotmartUrl(href)) {
      return origOpen(buildDesinflamateCheckoutUrl(), '_top', features);
    }
    return origOpen(url as string | URL, target, features);
  };

  rewriteAnchors(win.document);
}

export function VslAttribution() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fbclid = readFbclid();
    if (fbclid) setFbcCookie(fbclid);

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
        patchIframeWindow(iframe.contentWindow);
        window.clearInterval(interval);
      } catch {
        if (attempts >= maxAttempts) window.clearInterval(interval);
      }
    }, 150);

    return () => window.clearInterval(interval);
  }, []);

  return null;
}
