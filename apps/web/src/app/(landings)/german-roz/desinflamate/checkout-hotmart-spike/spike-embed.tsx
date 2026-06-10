'use client';

/**
 * SPIKE Fase 0 — componente de diagnóstico del embed Hotmart (THROWAWAY).
 *
 * Qué valida (los [CONFIRM] del brief):
 * - US-0.1: identificador de init real (`inlineCheckout` vs `inline`) y script.
 * - US-0.4: `sck` portando un UUID de 36 chars (candidato a purchaseEventId)
 *   + `src`/`xcod` — deben volver idénticos en data.purchase.origin del webhook.
 * - US-0.5: montaje/scroll/pago en iOS Safari (abrir esta URL en iPhone real).
 *
 * Query params opcionales: ?offer=<code> (default ymzf5qdj $67) · ?src= · ?xcod=
 */

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

const HOTMART_SCRIPT = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js';
const DEFAULT_OFFER = 'ymzf5qdj'; // Early Bird $67 USD (verificada por API 2026-06-10)
const EVENT_ID_KEY = 'hotmart_spike_event_id';

type CheckoutElementsGlobal = {
  init: (
    mode: string,
    opts: Record<string, unknown>,
  ) => { mount: (selector: string) => void; attach?: (selector: string) => void };
};

declare global {
  interface Window {
    checkoutElements?: CheckoutElementsGlobal;
  }
}

function uuid(): string {
  // crypto.randomUUID requiere secure context (https/localhost) — en una
  // prueba vía http://192.168.x.x no existe. Fallback manual v4.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getOrCreateEventId(): string {
  try {
    const existing = localStorage.getItem(EVENT_ID_KEY);
    if (existing) return existing;
    const fresh = uuid();
    localStorage.setItem(EVENT_ID_KEY, fresh);
    return fresh;
  } catch {
    return uuid();
  }
}

export function HotmartSpikeEmbed() {
  const mounted = useRef(false);
  const [scriptState, setScriptState] = useState('cargando script…');
  const [initUsed, setInitUsed] = useState<string | null>(null);
  const [mountState, setMountState] = useState('pendiente');
  const [params, setParams] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const pushError = (msg: string) =>
    setErrors((prev) => (prev.includes(msg) ? prev : [...prev, msg]));

  useEffect(() => {
    const onError = (e: ErrorEvent) => pushError(`window.onerror: ${e.message}`);
    window.addEventListener('error', onError);
    return () => window.removeEventListener('error', onError);
  }, []);

  function tryMount() {
    if (mounted.current) return; // guard doble-montaje (US-2.5 / StrictMode)
    const lib = window.checkoutElements;
    if (!lib) {
      pushError('window.checkoutElements no existe tras cargar el script');
      return;
    }
    mounted.current = true;

    const qs = new URLSearchParams(window.location.search);
    const offer = qs.get('offer') ?? DEFAULT_OFFER;
    const eventId = getOrCreateEventId(); // 36 chars — viaja en sck (US-0.4)
    const src = qs.get('src') ?? 'spike-src-test';
    const xcod = qs.get('xcod') ?? 'spike-xcod-test';
    setParams({ offer, sck: eventId, src, xcod });

    const options = {
      offer,
      // Atribución (brief §4.5/§4.6): sck en prefilledInfo; src/xcod en visibilityOptions.
      prefilledInfo: { sck: eventId },
      visibilityOptions: { src, xcod },
    };

    // US-0.1: la doc usa 'inlineCheckout' pero el ejemplo de pre-fill usa
    // 'inline' — probamos en ese orden y registramos cuál funciona.
    for (const initId of ['inlineCheckout', 'inline']) {
      try {
        // Limpia restos de un intento anterior fallido (evita doble embed).
        const container = document.getElementById('inline_checkout');
        if (container) container.innerHTML = '';
        const elements = lib.init(initId, options);
        elements.mount('#inline_checkout');
        setInitUsed(initId);
        setMountState('mount() invocado — verificar iframe abajo');
        return;
      } catch (err) {
        pushError(`init('${initId}') falló: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    setMountState('FALLÓ con ambos identificadores');
  }

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 18 }}>⚗️ SPIKE Hotmart inline checkout (página interna — no compartir)</h1>

      <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 13, lineHeight: 1.7 }}>
        <div>script: <b>{scriptState}</b></div>
        <div>init usado: <b>{initUsed ?? '—'}</b> · mount: <b>{mountState}</b></div>
        <div>offer: <b>{params.offer ?? '—'}</b></div>
        <div>sck (= purchaseEventId, debe volver en webhook origin.sck): <b>{params.sck ?? '—'}</b></div>
        <div>src: <b>{params.src ?? '—'}</b> · xcod: <b>{params.xcod ?? '—'}</b></div>
        {errors.length > 0 && (
          <div style={{ color: '#b00020', marginTop: 8 }}>
            {errors.map((e) => (
              <div key={e}>⚠ {e}</div>
            ))}
          </div>
        )}
      </div>

      <Script
        src={HOTMART_SCRIPT}
        strategy="afterInteractive"
        // onReady (no onLoad): se dispara también si el script ya estaba en el
        // DOM (navegación SPA / StrictMode remount).
        onReady={() => {
          setScriptState('cargado ✓');
          tryMount();
        }}
        onError={() => {
          setScriptState('ERROR al cargar');
          pushError(`no se pudo cargar ${HOTMART_SCRIPT}`);
        }}
      />

      <div
        id="inline_checkout"
        style={{ minHeight: 480, marginTop: 16, border: '1px dashed #999', borderRadius: 8 }}
      />
    </div>
  );
}
