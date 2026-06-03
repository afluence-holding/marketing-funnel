'use client';

import { useEffect, useRef, useState } from 'react';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { LUCAS, getLucasRetoGraciasUrl } from '../../lucas-config';
import { buildMetaTrackingPayload } from '@/lib/tracking/meta-capi';
import {
  getLucasRetoGraciasRedirectUrl,
  persistRetoCheckoutSession,
  trackLucasRetoInitiateCheckout,
} from '@/lib/tracking/lucas-meta';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type SessionState =
  | { status: 'loading' }
  | { status: 'ready'; sessionId: string; planId: string }
  | { status: 'error'; message: string };

export function LucasRetoCheckoutEmbed() {
  const [session, setSession] = useState<SessionState>({ status: 'loading' });
  const initiateFired = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const meta = buildMetaTrackingPayload('lucas-reto-checkout-bootstrap');
        const response = await fetch(
          `${API_URL}/api/orgs/lucas-con-lucas/bus/main/whop-checkout-session`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tracking: { meta: { fbp: meta.fbp, fbc: meta.fbc } },
            }),
          },
        );

        const data = (await response.json()) as {
          ok?: boolean;
          sessionId?: string;
          planId?: string;
          purchaseEventId?: string;
          error?: string;
        };

        if (!response.ok || !data.sessionId || !data.purchaseEventId) {
          throw new Error(data.error ?? `Checkout session failed (${response.status})`);
        }

        if (cancelled) return;

        persistRetoCheckoutSession(data.purchaseEventId);

        if (!initiateFired.current) {
          initiateFired.current = true;
          trackLucasRetoInitiateCheckout();
        }

        setSession({
          status: 'ready',
          sessionId: data.sessionId,
          planId: data.planId ?? LUCAS.reto.planId,
        });
      } catch (err) {
        if (cancelled) return;
        setSession({
          status: 'error',
          message: err instanceof Error ? err.message : 'No se pudo iniciar el checkout',
        });
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const returnUrl = getLucasRetoGraciasUrl(
    typeof window !== 'undefined' ? window.location.origin : undefined,
  );

  if (session.status === 'loading') {
    return (
      <div className="checkout-state">
        <div className="spinner" aria-hidden />
        <p>Preparando checkout seguro…</p>
      </div>
    );
  }

  if (session.status === 'error') {
    return (
      <div className="checkout-state checkout-state-error">
        <p>No pudimos cargar el checkout.</p>
        <p className="muted">{session.message}</p>
        <a href="/lucas-con-lucas/reto" className="back-link">
          ← Volver al reto
        </a>
      </div>
    );
  }

  return (
    <div className="checkout-embed-wrap">
      <WhopCheckoutEmbed
        planId={session.planId}
        sessionId={session.sessionId}
        returnUrl={returnUrl}
        theme="dark"
        fallback={
          <div className="checkout-state">
            <div className="spinner" aria-hidden />
            <p>Cargando formulario de pago…</p>
          </div>
        }
        onComplete={(_planId, receiptId) => {
          window.location.assign(getLucasRetoGraciasRedirectUrl(receiptId));
        }}
        styles={{ container: { paddingX: 0, paddingY: 16 } }}
      />
    </div>
  );
}
