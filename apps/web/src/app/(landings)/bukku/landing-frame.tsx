'use client';

import { useEffect, useRef, useState } from 'react';

export default function LandingFrame({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(3200);

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

    let rafId = 0;
    function postParentScroll() {
      if (!ref.current || !ref.current.contentWindow) return;
      const rect = ref.current.getBoundingClientRect();
      try {
        ref.current.contentWindow.postMessage(
          {
            type: 'parent-scroll',
            scrollY: Math.max(0, -rect.top),
            viewportH: window.innerHeight,
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
