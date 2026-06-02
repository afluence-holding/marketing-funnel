'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackEventForPixel } from '@/lib/tracking/events';
import { LUCAS, getLucasRetoPrice } from '../../lucas-config';
import {
  clearRetoCheckoutContext,
  lucasRetoPurchase,
  markPurchaseFired,
  readRetoCheckoutContext,
  wasPurchaseFired,
} from '@/lib/tracking/lucas-meta';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function PurchaseTrackerInner() {
  const params = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;

    const status = params.get('status');
    if (status === 'error') return;
    if (status !== 'success') return;

    const ctx = readRetoCheckoutContext();
    const receiptId =
      params.get('receipt_id') ??
      params.get('payment_id') ??
      params.get('order_id') ??
      undefined;
    const eventId = receiptId ?? ctx?.purchaseEventId;
    if (!eventId) return;
    if (wasPurchaseFired(eventId)) return;

    fired.current = true;
    markPurchaseFired(eventId);

    const valueParam = params.get('value');
    const parsedValue = valueParam ? Number(valueParam) : NaN;
    const value =
      Number.isFinite(parsedValue) && parsedValue > 0
        ? parsedValue
        : ctx?.value ?? getLucasRetoPrice();

    const email = params.get('email') ?? undefined;
    const firstName = params.get('first_name') ?? params.get('name') ?? undefined;
    const lastName = params.get('last_name') ?? undefined;

    const pixelId = LUCAS.metaPixelId;
    if (pixelId) {
      trackEventForPixel(pixelId, 'Purchase', lucasRetoPurchase(value, eventId), {
        eventId,
      });
    }

    void fetch(`${API_URL}/api/orgs/lucas-con-lucas/bus/main/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        orderId: eventId,
        email,
        firstName,
        lastName,
        value,
        currency: LUCAS.currency,
        tracking: {
          meta: {
            fbp: ctx?.fbp,
            fbc: ctx?.fbc,
          },
        },
      }),
    }).catch((err) => {
      console.warn('[lucas-purchase] CAPI sync failed', err);
    });

    clearRetoCheckoutContext();
  }, [params]);

  return null;
}

export function PurchaseTracker() {
  return (
    <Suspense fallback={null}>
      <PurchaseTrackerInner />
    </Suspense>
  );
}
