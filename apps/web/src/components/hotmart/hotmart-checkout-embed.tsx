'use client';

/**
 * Hotmart inline checkout embed (Fase 2 de hotmart-embedded-checkout).
 *
 * Diseño validado por el spike de Fase 0 (compra real HP0999901990):
 * - init con fallback 'inlineCheckout' → 'inline' (la lib acepta el primero).
 * - `sck` porta el purchaseEventId (UUID 36 chars) — vuelve IDÉNTICO en
 *   `data.purchase.origin.sck` del webhook, que lo usa como event_id del
 *   Purchase CAPI. No hay redirect post-compra (confirmación inline de
 *   Hotmart) → el Purchase es CAPI-only; no se persiste ctx para gracias.
 * - `src`/`xcod` se leen del query string (atribución de paid media) y
 *   vuelven en origin para reporting.
 * - Cupón OCULTO (US-2.6/C1: el campo visible manda gente a cazar descuentos).
 *
 * El InitiateCheckout (pixel + CAPI) reusa el tracking genérico existente.
 */

import Script from 'next/script';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getWhopProduct, resolveWhopTier } from '@/lib/whop/products';
import { trackWhopInitiateCheckout } from '@/lib/whop/tracking';

const HOTMART_SCRIPT = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js';

type CheckoutElementsLib = {
  init: (
    mode: string,
    opts: Record<string, unknown>,
  ) => { mount: (selector: string) => void };
};

// La página spike ya declara Window.checkoutElements globalmente — aquí
// casteamos local para no duplicar la declaración (se elimina con el spike).
function getCheckoutElements(): CheckoutElementsLib | undefined {
  return (window as unknown as { checkoutElements?: CheckoutElementsLib }).checkoutElements;
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Stable purchase event id per visitor+cohort (survives reloads → mismo
 * event_id si paga en otra visita dentro de la misma edición). */
function getOrCreatePurchaseEventId(productKey: string, cohortCode: string): string {
  const key = `hotmart_purchase_event_id:${productKey}:${cohortCode}`;
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const fresh = uuid();
    localStorage.setItem(key, fresh);
    return fresh;
  } catch {
    return uuid();
  }
}

type Props = {
  productKey: string;
  backHref?: string;
  backLabel?: string;
  /** QA-ONLY: fuerza un offer code, saltando la resolución de tier del
   * catálogo. Usado por la página de preview para ver el embed Hotmart antes
   * de que exista un cohort Hotmart activo. NUNCA pasar en producción real. */
  previewOffer?: string;
};

export function HotmartCheckoutEmbed({
  productKey,
  backHref,
  backLabel = '← Volver',
  previewOffer,
}: Props) {
  const mounted = useRef(false);
  const tracked = useRef(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const product = useMemo(() => getWhopProduct(productKey), [productKey]);

  function tryMount() {
    if (mounted.current || !product) return;
    const lib = getCheckoutElements();
    if (!lib) {
      console.error('[hotmart-embed] checkoutElements global missing after script load');
      setState('error');
      return;
    }

    const tier = resolveWhopTier(product);
    let offerCode: string;
    if (previewOffer) {
      offerCode = previewOffer;
    } else if (tier.checkoutRef.provider === 'hotmart') {
      offerCode = tier.checkoutRef.offerCode;
    } else {
      console.error('[hotmart-embed] active tier is not a hotmart offer', {
        productKey,
        cohortCode: product.cohortCode,
      });
      setState('error');
      return;
    }
    mounted.current = true;

    const qs = new URLSearchParams(window.location.search);
    const purchaseEventId = getOrCreatePurchaseEventId(product.key, product.cohortCode);
    const src = qs.get('src') ?? qs.get('utm_source') ?? 'web-checkout';
    const xcod = qs.get('xcod') ?? qs.get('utm_campaign') ?? product.cohortCode;

    const options = {
      offer: offerCode,
      prefilledInfo: { sck: purchaseEventId },
      // Checkout minimalista (decisión de Negocio 2026-06-10): SOLO el
      // formulario de tarjeta — se ocultan todos los métodos alternativos.
      // Los CAMPOS del comprador (documento/dirección) se configuran en el
      // panel de Hotmart, no aquí (Elements no los controla).
      visibilityOptions: {
        src,
        xcod,
        hideCouponOption: '1',
        hidePayPal: '1',
        hidePix: '1',
        hideBillet: '1',
        hideTransf: '1',
        hidewallet: '1',
        hideMultipleCards: '1',
      },
    };

    for (const initId of ['inlineCheckout', 'inline']) {
      try {
        const container = document.getElementById('inline_checkout');
        if (container) container.innerHTML = '';
        lib.init(initId, options).mount('#inline_checkout');
        console.info('[hotmart-embed] mounted', {
          initId,
          offer: offerCode,
          cohortCode: product.cohortCode,
          purchaseEventId,
          preview: Boolean(previewOffer),
        });
        setState('ready');
        if (!tracked.current) {
          tracked.current = true;
          trackWhopInitiateCheckout(product);
        }
        return;
      } catch (err) {
        console.warn(`[hotmart-embed] init('${initId}') failed`, err);
      }
    }
    // Permite reintentar (botón) sin recargar la página.
    mounted.current = false;
    setState('error');
  }

  // Si el componente se monta con el script ya presente (navegación SPA),
  // onReady cubre el caso; este efecto cubre StrictMode remounts tardíos.
  useEffect(() => {
    if (getCheckoutElements() && !mounted.current) tryMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!product) {
    return (
      <div className="checkout-state checkout-state-error">
        <p>Checkout no disponible.</p>
        <p className="muted">Producto no configurado.</p>
      </div>
    );
  }

  return (
    <div className="checkout-embed-wrap">
      <Script
        src={HOTMART_SCRIPT}
        strategy="afterInteractive"
        onReady={tryMount}
        onError={() => {
          console.error('[hotmart-embed] failed to load checkout-elements script');
          setState('error');
        }}
      />
      {state === 'loading' && (
        <div className="checkout-state">
          <div className="spinner" aria-hidden />
          <p>Preparando formulario de pago…</p>
        </div>
      )}
      {state === 'error' && (
        <div className="checkout-state checkout-state-error">
          <p>No pudimos cargar el checkout.</p>
          <button
            type="button"
            className="retry-btn"
            onClick={() => {
              setState('loading');
              tryMount();
            }}
          >
            Reintentar
          </button>
          {backHref && (
            <a href={backHref} className="back-link">
              {backLabel}
            </a>
          )}
        </div>
      )}
      <div id="inline_checkout" style={{ minHeight: state === 'ready' ? 480 : 0 }} />
    </div>
  );
}
