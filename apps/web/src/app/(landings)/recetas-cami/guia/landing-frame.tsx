'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Iframe wrapper that auto-resizes to its content height and relays
 * anchor-link scrolls to the parent document.
 *
 * Why: rendering a standalone HTML landing inside `<iframe height="100vh">`
 * makes the iframe scroll internally. In iOS WKWebView (Instagram /
 * Facebook in-app browsers) anchor-jump (`href="#cta"`) inside an
 * internally-scrolling iframe is broken/inconsistent — clicks on
 * "Comprar la guía" silently do nothing for many users.
 *
 * Fix:
 *  1. The iframe expands to its full content height (no internal scroll).
 *  2. The host page does the scrolling (works everywhere, including IG).
 *  3. Anchor clicks inside the iframe post `iframe-scroll-to` to the
 *     parent, which then scrolls the window to the right offset and
 *     updates the URL hash.
 */
export default function LandingFrame({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(2400);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as
        | { type?: string; height?: number; top?: number; hash?: string }
        | null
        | undefined;
      if (!data || typeof data !== 'object') return;

      if (
        data.type === 'iframe-height' &&
        typeof data.height === 'number' &&
        data.height > 0
      ) {
        setHeight((prev) =>
          Math.abs(prev - data.height!) > 1 ? data.height! : prev,
        );
        return;
      }

      if (
        data.type === 'iframe-scroll-to' &&
        typeof data.top === 'number' &&
        ref.current
      ) {
        const iframeTop =
          ref.current.getBoundingClientRect().top +
          (window.pageYOffset || document.documentElement.scrollTop || 0);
        window.scrollTo({ top: iframeTop + data.top, behavior: 'auto' });
        if (
          typeof data.hash === 'string' &&
          window.history &&
          history.replaceState
        ) {
          try {
            history.replaceState(null, '', data.hash);
          } catch {
            /* noop */
          }
        }
      }
    }

    // Relay parent scroll into the iframe so scroll-driven UI inside the
    // iframe (sticky banners, IntersectionObserver-based animations) keeps
    // working even though the iframe itself never scrolls internally.
    let rafId = 0;
    function postParentScroll() {
      if (!ref.current || !ref.current.contentWindow) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const scrollWithinIframe = Math.max(0, -rect.top);
      try {
        ref.current.contentWindow.postMessage(
          {
            type: 'parent-scroll',
            scrollY: scrollWithinIframe,
            viewportH,
            iframeTop: rect.top,
            iframeHeight: rect.height,
          },
          '*',
        );
      } catch {
        /* noop */
      }
    }
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        postParentScroll();
      });
    }

    window.addEventListener('message', onMessage);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // Send an initial value once the iframe has had a chance to register
    setTimeout(postParentScroll, 100);
    setTimeout(postParentScroll, 600);

    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      style={{
        width: '100%',
        height: `${height}px`,
        border: 'none',
        display: 'block',
      }}
    />
  );
}
