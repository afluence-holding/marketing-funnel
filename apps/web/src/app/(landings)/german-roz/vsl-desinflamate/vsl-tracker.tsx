'use client';

import { useEffect } from 'react';
import { trackCustomEvent, trackEvent } from '@/lib/tracking/events';
import { buildMetaTrackingPayload, createMetaEventId } from '@/lib/tracking/meta-capi';

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
 * Listens for postMessage events from the srcDoc iframe:
 * - `vsl-milestone`: fires custom VSL_25/50/75/100 events
 *
 * Also intercepts CTA clicks inside the iframe to fire InitiateCheckout
 * before navigating to Hotmart. srcDoc iframes are same-origin so we
 * can attach listeners directly to the iframe's document.
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

      iframeDoc.addEventListener('click', (e: MouseEvent) => {
        if (ctaFired) return;
        const target = e.target as HTMLElement;
        // Check if click target or any ancestor has an onclick that opens Hotmart
        // The CTA buttons use onClick: () => window.open(hotmartUrl, "_top")
        // so we check for buttons/anchors near the click
        const btn = target.closest('button, a, [role="button"]');
        if (!btn) return;

        // Check the element's text or nearby context for Hotmart indicators
        const text = btn.textContent?.toLowerCase() ?? '';
        const href = (btn as HTMLAnchorElement).href ?? '';
        const isCTA =
          HOTMART_PATTERN.test(href) ||
          text.includes('quiero') ||
          text.includes('unirme') ||
          text.includes('reto') ||
          text.includes('reserv') ||
          text.includes('compr') ||
          text.includes('inscrib');

        if (isCTA) {
          ctaFired = true;
          trackEvent('InitiateCheckout', { content_name: CONTENT_NAME });
        }
      }, true);
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
