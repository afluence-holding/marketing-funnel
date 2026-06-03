'use client';

import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { useEffect, useRef, useState } from 'react';
import { getLucasRetoGraciasUrl } from '../../lucas-config';
import {
  cacheWhopSession,
  getCachedWhopSession,
  prefetchRetoCheckoutSession,
  preloadWhopCheckoutModule,
  requestWhopCheckoutSession,
  type WhopCheckoutSession,
} from '@/lib/lucas/whop-checkout-session';
import { buildMetaTrackingPayload } from '@/lib/tracking/meta-capi';
import {
  getLucasRetoGraciasRedirectUrl,
  persistRetoCheckoutSession,
  trackLucasRetoInitiateCheckout,
} from '@/lib/tracking/lucas-meta';

type SessionState =
  | { status: 'loading' }
  | { status: 'ready'; session: WhopCheckoutSession }
  | { status: 'error'; message: string };

function toInitialState(
  initial: WhopCheckoutSession | null | undefined,
): SessionState {
  if (initial?.sessionId && initial.purchaseEventId) {
    return { status: 'ready', session: initial };
  }
  return { status: 'loading' };
}

async function resolveCheckoutSession(
  initial: WhopCheckoutSession | null | undefined,
): Promise<WhopCheckoutSession> {
  if (initial?.sessionId && initial.purchaseEventId) return initial;

  const cached = getCachedWhopSession();
  if (cached) return cached;

  const meta = buildMetaTrackingPayload('lucas-reto-checkout-bootstrap');
  return requestWhopCheckoutSession({ fbp: meta.fbp, fbc: meta.fbc });
}

function activateCheckoutSession(session: WhopCheckoutSession): void {
  cacheWhopSession(session);
  persistRetoCheckoutSession(session.purchaseEventId);
  trackLucasRetoInitiateCheckout();
}

export function LucasRetoCheckoutEmbed({
  initialSession = null,
}: {
  initialSession?: WhopCheckoutSession | null;
}) {
  const [session, setSession] = useState<SessionState>(() =>
    toInitialState(initialSession),
  );
  const activated = useRef(false);

  useEffect(() => {
    preloadWhopCheckoutModule();
    if (initialSession?.sessionId) {
      cacheWhopSession(initialSession);
    }
  }, [initialSession]);

  useEffect(() => {
    if (session.status === 'ready') {
      if (!activated.current) {
        activated.current = true;
        activateCheckoutSession(session.session);
      }
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        const resolved = await resolveCheckoutSession(initialSession);
        if (cancelled) return;
        if (!activated.current) {
          activated.current = true;
          activateCheckoutSession(resolved);
        }
        setSession({ status: 'ready', session: resolved });
      } catch (err) {
        if (cancelled) return;
        setSession({
          status: 'error',
          message:
            err instanceof Error ? err.message : 'No se pudo iniciar el checkout',
        });
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [initialSession, session.status]);

  const returnUrl = getLucasRetoGraciasUrl();

  if (session.status === 'loading') {
    return (
      <div className="checkout-state">
        <div className="spinner" aria-hidden />
        <p>Preparando formulario de pago…</p>
      </div>
    );
  }

  if (session.status === 'error') {
    return (
      <div className="checkout-state checkout-state-error">
        <p>No pudimos cargar el checkout.</p>
        <p className="muted">{session.message}</p>
        <button
          type="button"
          className="retry-btn"
          onClick={() => {
            activated.current = false;
            setSession({ status: 'loading' });
            void prefetchRetoCheckoutSession()
              .then((resolved) => {
                activated.current = true;
                activateCheckoutSession(resolved);
                setSession({ status: 'ready', session: resolved });
              })
              .catch((err) => {
                setSession({
                  status: 'error',
                  message:
                    err instanceof Error
                      ? err.message
                      : 'No se pudo iniciar el checkout',
                });
              });
          }}
        >
          Reintentar
        </button>
        <a href="/lucas-con-lucas/reto" className="back-link">
          ← Volver al reto
        </a>
      </div>
    );
  }

  const { sessionId } = session.session;

  return (
    <div className="checkout-embed-wrap">
      <WhopCheckoutEmbed
        sessionId={sessionId}
        returnUrl={returnUrl}
        theme="dark"
        adaptivePricing
        skipRedirect
        themeOptions={{ accentColor: 'orange' }}
        fallback={
          <div className="checkout-state">
            <div className="spinner" aria-hidden />
            <p>Cargando formulario de pago…</p>
          </div>
        }
        onComplete={(_planId, receiptId) => {
          window.location.assign(getLucasRetoGraciasRedirectUrl(receiptId));
        }}
        styles={{
          container: {
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 0,
            paddingRight: 0,
          },
        }}
      />
    </div>
  );
}
