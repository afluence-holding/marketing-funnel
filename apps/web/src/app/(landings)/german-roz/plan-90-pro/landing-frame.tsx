'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Iframe wrapper that auto-resizes to its content height and relays
 * anchor-link scrolls to the parent document.
 *
 * Also renders the floating WhatsApp button at the parent level so it
 * stays fixed to the browser viewport (a `position: fixed` element inside
 * an auto-resized iframe would be positioned relative to the iframe's
 * own ICB, not the browser viewport — i.e. it would not stick on scroll).
 *
 * Mirrors `apps/web/src/app/(landings)/recetas-cami/guia/landing-frame.tsx`.
 */

const WHATSAPP_HREF =
  'https://wa.me/525586773483?text=Hola%2C%20quiero%20hablar%20con%20un%20profesional%20sobre%20el%20Plan%2090%20Pro';

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
    <>
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
      <FloatingWhatsApp />
    </>
  );
}

function FloatingWhatsApp() {
  return (
    <>
      <style>{floatingWhatsAppCss}</style>
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener"
        className="wa-float"
        aria-label="Hablar con un profesional por WhatsApp"
      >
        <span className="wa-icon-wrap">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
          </svg>
        </span>
        <span className="wa-text">Resolver dudas :)</span>
      </a>
    </>
  );
}

const floatingWhatsAppCss = `
.wa-float {
  position: fixed;
  bottom: 96px;
  right: 26px;
  background: #25D366;
  color: white;
  text-decoration: none;
  padding: 14px 22px 14px 14px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.01em;
  box-shadow: 0 10px 30px -6px rgba(37,211,102,0.5), 0 4px 12px rgba(0,0,0,0.15);
  z-index: 2147483000;
  transition: transform 0.25s, box-shadow 0.25s, background 0.25s;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}
.wa-float:hover {
  background: #1ebe57;
  transform: translateY(-2px);
  box-shadow: 0 14px 36px -6px rgba(37,211,102,0.6), 0 6px 18px rgba(0,0,0,0.18);
}
.wa-float .wa-icon-wrap {
  width: 34px;
  height: 34px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: waFloatPulse 2.4s infinite;
}
.wa-float .wa-icon-wrap svg {
  width: 20px;
  height: 20px;
  color: white;
}
@keyframes waFloatPulse {
  0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.5); }
  70% { box-shadow: 0 0 0 12px rgba(255,255,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
}
@media (max-width: 900px) {
  .wa-float {
    bottom: calc(92px + env(safe-area-inset-bottom, 0px));
    right: 16px;
    padding: 11px 16px 11px 11px;
    font-size: 13px;
  }
  .wa-float .wa-icon-wrap { width: 30px; height: 30px; }
  .wa-float .wa-icon-wrap svg { width: 17px; height: 17px; }
}
`;
