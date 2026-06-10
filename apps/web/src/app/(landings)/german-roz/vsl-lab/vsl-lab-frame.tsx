'use client';

/**
 * SPIKE — Frame del "lab" del VSL. Combina las dos pruebas:
 *  1. Checkout embebido DENTRO del VSL: el botón de compra abre un modal con el
 *     HotmartCheckoutEmbed (no navega a /checkout). Resto de CTAs → scroll.
 *  2. Franja-carrusel de video-testimonios inyectada DENTRO del VSL, entre la
 *     sección del VSL (hero/video) y la sección de síntomas ("¿Te sientes
 *     hinchada…?"). Se inserta un slot antes de ese <section> y se renderiza la
 *     franja ahí con un portal de React (estilos inline + <style> propio viajan
 *     al iframe, que no tiene el Tailwind del parent).
 *
 * NO toca el VSL en vivo (/vsl-desinflamate). Esta ruta es solo para evaluar.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TestimonialVideoCarousel } from './testimonial-carousel';
import { VslCheckoutModal } from './checkout-modal';

const VSL_IFRAME_SELECTOR = 'iframe[data-vsl-lab]';
const CAROUSEL_SLOT_ID = 'vsl-lab-carousel-slot';
// Ancla: la sección de síntomas (PainPoints) empieza con este texto.
const SYMPTOMS_MARKER = 'Te sientes hinchada';

function scrollToOffer(doc: Document): void {
  const matches = Array.from(doc.querySelectorAll('p, h1, h2, h3, span, div')).filter((el) =>
    (el.textContent ?? '').includes('La oferta termina en'),
  );
  const offerStart = matches.sort(
    (a, b) => (a.textContent?.length ?? 0) - (b.textContent?.length ?? 0),
  )[0];
  if (offerStart) offerStart.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function VslLabFrame({ html }: { html: string }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const openRef = useRef(setCheckoutOpen);
  openRef.current = setCheckoutOpen;

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const iframe = document.querySelector(VSL_IFRAME_SELECTOR) as HTMLIFrameElement | null;
      const doc = iframe?.contentDocument;
      if (!doc?.body) {
        if (attempts > 50) clearInterval(interval);
        return;
      }
      clearInterval(interval);

      // (1) Interceptar CTAs: compra → modal; "unirme al reto" → scroll.
      doc.addEventListener(
        'click',
        (e: MouseEvent) => {
          const btn = (e.target as HTMLElement).closest('button, a, [role="button"]');
          if (!btn) return;
          const text = btn.textContent?.toLowerCase() ?? '';
          const href = (btn as HTMLAnchorElement).href ?? '';
          const isCheckout = /hotmart/i.test(href) || text.includes('desinflamarme');
          const isScrollCta =
            !isCheckout &&
            (text.includes('unirme al reto') ||
              text.includes('unirse al reto') ||
              text.includes('quiero empezar'));
          if (!isCheckout && !isScrollCta) return;
          e.preventDefault();
          e.stopPropagation();
          if (isCheckout) openRef.current(true);
          else scrollToOffer(doc);
        },
        true,
      );

      // (2) Insertar el slot de la franja antes de la sección de síntomas.
      if (!doc.getElementById(CAROUSEL_SLOT_ID)) {
        const symptoms = Array.from(doc.querySelectorAll('section')).find((s) =>
          (s.textContent ?? '').includes(SYMPTOMS_MARKER),
        );
        if (symptoms?.parentNode) {
          const slot = doc.createElement('div');
          slot.id = CAROUSEL_SLOT_ID;
          symptoms.parentNode.insertBefore(slot, symptoms);
          setPortalEl(slot);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        style={{
          background: '#111',
          color: '#fff',
          textAlign: 'center',
          padding: '10px 16px',
          fontSize: 13,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        🧪 <strong>LAB</strong> — checkout embebido en el VSL + franja de video-testimonios
        entre el VSL y la sección de síntomas. No es la VSL en vivo.
      </div>

      <iframe
        data-vsl-lab
        srcDoc={html}
        title="DESINFLAMATE! — VSL (lab)"
        style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
      />

      {/* La franja se renderiza DENTRO del iframe vía portal. */}
      {portalEl && createPortal(<TestimonialVideoCarousel />, portalEl)}

      <VslCheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
