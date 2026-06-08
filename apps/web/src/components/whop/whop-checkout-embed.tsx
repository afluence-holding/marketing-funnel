'use client';

import { WhopCheckoutEmbed, type AccentColor } from '@whop/checkout/react';
import { useEffect, useRef, useState } from 'react';
import { buildMetaTrackingPayload } from '@/lib/tracking/meta-capi';
import { getWhopProduct, getWhopProductGraciasUrl } from '@/lib/whop/products';
import {
  cacheWhopSession,
  getCachedWhopSession,
  prefetchWhopCheckoutSession,
  preloadWhopCheckoutModule,
  requestWhopCheckoutSession,
  type WhopCheckoutSession,
} from '@/lib/whop/checkout-session';
import {
  getWhopPurchaseRedirectUrl,
  persistCheckoutSession,
  trackWhopInitiateCheckout,
} from '@/lib/whop/tracking';

type SessionState =
  | { status: 'loading' }
  | { status: 'ready'; session: WhopCheckoutSession }
  | { status: 'error'; message: string }
  | { status: 'unconfigured' };

type Props = {
  productKey: string;
  initialSession?: WhopCheckoutSession | null;
  /** Whop embed theme. */
  theme?: 'light' | 'dark';
  accentColor?: AccentColor;
  backHref?: string;
  backLabel?: string;
};

function toInitialState(
  productKey: string,
  initial: WhopCheckoutSession | null | undefined,
): SessionState {
  if (!getWhopProduct(productKey)) return { status: 'unconfigured' };
  if (initial?.sessionId && initial.purchaseEventId) {
    return { status: 'ready', session: initial };
  }
  return { status: 'loading' };
}

export function GenericWhopCheckoutEmbed({
  productKey,
  initialSession = null,
  theme = 'light',
  accentColor = 'orange',
  backHref,
  backLabel = '← Volver',
}: Props) {
  const product = getWhopProduct(productKey);
  const [session, setSession] = useState<SessionState>(() =>
    toInitialState(productKey, initialSession),
  );
  const activated = useRef(false);

  useEffect(() => {
    if (!product) return;
    preloadWhopCheckoutModule();
    if (initialSession?.sessionId) {
      cacheWhopSession(product.key, initialSession);
    }
  }, [product, initialSession]);

  useEffect(() => {
    if (!product) return;
    if (session.status === 'ready') {
      if (!activated.current) {
        activated.current = true;
        cacheWhopSession(product.key, session.session);
        persistCheckoutSession(product, session.session);
        trackWhopInitiateCheckout(product);
      }
      return;
    }
    if (session.status !== 'loading') return;

    let cancelled = false;

    async function bootstrap() {
      if (!product) return;
      try {
        const resolved =
          (initialSession?.sessionId && initialSession.purchaseEventId
            ? initialSession
            : getCachedWhopSession(product.key)) ??
          (await (async () => {
            const meta = buildMetaTrackingPayload(`${product.key}-checkout-bootstrap`);
            return requestWhopCheckoutSession(product.key, {
              fbp: meta.fbp,
              fbc: meta.fbc,
            });
          })());

        if (cancelled) return;
        if (!activated.current) {
          activated.current = true;
          cacheWhopSession(product.key, resolved);
          persistCheckoutSession(product, resolved);
          trackWhopInitiateCheckout(product);
        }
        setSession({ status: 'ready', session: resolved });
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
  }, [product, initialSession, session.status]);

  if (!product || session.status === 'unconfigured') {
    return (
      <div className="checkout-state checkout-state-error">
        <p>Checkout no disponible.</p>
        <p className="muted">Producto no configurado.</p>
      </div>
    );
  }

  const returnUrl = getWhopProductGraciasUrl(product);

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
            void prefetchWhopCheckoutSession(product)
              .then((resolved) => {
                activated.current = true;
                cacheWhopSession(product.key, resolved);
                persistCheckoutSession(product, resolved);
                trackWhopInitiateCheckout(product);
                setSession({ status: 'ready', session: resolved });
              })
              .catch((err) => {
                setSession({
                  status: 'error',
                  message:
                    err instanceof Error ? err.message : 'No se pudo iniciar el checkout',
                });
              });
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
    );
  }

  const { sessionId } = session.session;

  return (
    <div className="checkout-embed-wrap">
      <WhopCheckoutEmbed
        sessionId={sessionId}
        returnUrl={returnUrl}
        theme={theme}
        adaptivePricing
        skipRedirect
        themeOptions={{ accentColor }}
        fallback={
          <div className="checkout-state">
            <div className="spinner" aria-hidden />
            <p>Cargando formulario de pago…</p>
          </div>
        }
        onComplete={(_planId, receiptId) => {
          window.location.assign(getWhopPurchaseRedirectUrl(product, receiptId));
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
