'use client';

import { useEffect } from 'react';
import { trackCustomEvent, trackEvent } from '@/lib/tracking/events';
import { buildMetaTrackingPayload, createMetaEventId } from '@/lib/tracking/meta-capi';
import { buildDesinflamateCheckoutUrl } from './checkout-link';

const MILESTONES = [25, 50, 75, 100] as const;
const HOTMART_PATTERN = /hotmart/i;
/** GTM pone el primer iframe del DOM; la VSL usa `srcDoc`. */
const VSL_IFRAME_SELECTOR = 'iframe[srcDoc]';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const ORG_KEY = 'german-roz';
const BU_KEY = 'main';
const CONTENT_NAME = 'german-roz-vsl-desinflamate';
const SOURCE = 'landing-german-roz-vsl-desinflamate';

/**
 * Lleva al usuario a la sección de oferta (urgencia + desglose de valor +
 * precio + botón de compra) dentro del iframe `srcDoc`. Se ancla por el texto
 * estable "La oferta termina en:" (el elemento más interno que lo contiene)
 * para NO depender de las clases del bundle minificado; si no aparece, cae al
 * botón de compra centrado.
 */
function scrollToOffer(doc: Document): void {
  const matches = Array.from(doc.querySelectorAll('p, h1, h2, h3, span, div')).filter(
    (el) => (el.textContent ?? '').includes('La oferta termina en'),
  );
  // El match más corto es el elemento más interno (la etiqueta, no un ancestro).
  const offerStart = matches.sort(
    (a, b) => (a.textContent?.length ?? 0) - (b.textContent?.length ?? 0),
  )[0];
  if (offerStart) {
    offerStart.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const checkoutBtn = Array.from(doc.querySelectorAll('button, a')).find((b) =>
    (b.textContent ?? '').toLowerCase().includes('desinflamarme'),
  );
  checkoutBtn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Listens for postMessage events from the srcDoc iframe:
 * - `vsl-milestone`: fires custom VSL_25/50/75/100 events
 *
 * Also intercepts CTA clicks inside the iframe (capture phase, so it overrides
 * the bundle's native onClick). Two behaviors:
 * - El botón de compra final ("UNIRME A DESINFLAMARME EN 21 DÍAS") → checkout
 *   embebido (/german-roz/desinflamate/checkout) + InitiateCheckout.
 * - Los CTAs de "unirse al reto" ("UNIRME AL RETO", "SÍ, QUIERO EMPEZAR…") →
 *   scroll a la sección de oferta (precio + qué incluye), NO al checkout.
 * srcDoc iframes are same-origin so we can attach listeners directly to the
 * iframe's document.
 */
export function VslTracker() {
  useEffect(() => {
    const fired = new Set<number>();
    let ctaFired = false;

    async function sendMilestoneToCapi(eventName: string, eventId: string, milestone: number) {
      try {
        await fetch(
          `${API_URL}/api/orgs/${encodeURIComponent(ORG_KEY)}/bus/${encodeURIComponent(BU_KEY)}/video-events`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventName,
              source: SOURCE,
              contentName: CONTENT_NAME,
              milestone,
              tracking: {
                meta: buildMetaTrackingPayload(eventId),
              },
            }),
          },
        );
      } catch (error) {
        console.warn('[vsl-tracker] milestone capi sync failed', {
          eventName,
          milestone,
          error: error instanceof Error ? error.message : 'unknown',
        });
      }
    }

    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'vsl-milestone') {
        const m = e.data.milestone as number;
        if (!MILESTONES.includes(m as (typeof MILESTONES)[number]) || fired.has(m)) return;
        fired.add(m);
        const eventName = `VSL_${m}`;
        const eventId = createMetaEventId(`vsl_${m}`);
        trackCustomEvent(eventName, { content_name: CONTENT_NAME, milestone: m }, { eventId });
        void sendMilestoneToCapi(eventName, eventId, m);
      }
    }

    // Attach click listener inside the srcDoc iframe to catch Hotmart CTA clicks
    function attachIframeListener() {
      const iframe = document.querySelector(VSL_IFRAME_SELECTOR) as HTMLIFrameElement | null;
      if (!iframe) return;

      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) return;

      iframeDoc.addEventListener(
        'click',
        (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const btn = target.closest('button, a, [role="button"]');
          if (!btn) return;

          const text = btn.textContent?.toLowerCase() ?? '';
          const href = (btn as HTMLAnchorElement).href ?? '';

          // SOLO el botón de compra final ("UNIRME A DESINFLAMARME EN 21 DÍAS",
          // o cualquier enlace Hotmart heredado del bundle) abre el checkout.
          const isCheckout = HOTMART_PATTERN.test(href) || text.includes('desinflamarme');
          // Los CTAs de "unirse al reto" (incl. "SÍ, QUIERO EMPEZAR…") NO compran:
          // bajan a la oferta para que el lead vea precio + qué incluye antes de
          // decidir. Se usan frases exactas para no atrapar preguntas del FAQ que
          // contengan "reto".
          const isScrollCta =
            !isCheckout &&
            (text.includes('unirme al reto') ||
              text.includes('unirse al reto') ||
              text.includes('quiero empezar'));

          if (!isCheckout && !isScrollCta) return;

          e.preventDefault();
          e.stopPropagation();

          if (isCheckout) {
            if (!ctaFired) {
              ctaFired = true;
              trackEvent('InitiateCheckout', { content_name: CONTENT_NAME });
            }
            window.open(buildDesinflamateCheckoutUrl(), '_top');
          } else {
            scrollToOffer(iframeDoc);
          }
        },
        true,
      );
    }

    // The iframe content loads async, retry until it's ready
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const iframe = document.querySelector(VSL_IFRAME_SELECTOR) as HTMLIFrameElement | null;
      if (iframe?.contentDocument?.body || attempts > 50) {
        clearInterval(interval);
        if (iframe?.contentDocument?.body) attachIframeListener();
      }
    }, 200);

    window.addEventListener('message', onMessage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return null;
}
