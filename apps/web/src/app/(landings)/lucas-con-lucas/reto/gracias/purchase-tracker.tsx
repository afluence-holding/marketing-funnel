'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackEventForPixel } from '@/lib/tracking/events';
import { LUCAS } from '../../lucas-config';
import {
  clearRetoCheckoutContext,
  lucasRetoPurchase,
  markPurchaseFired,
  resolveRetoPurchaseTracking,
  wasPurchaseFired,
} from '@/lib/tracking/lucas-meta';

/**
 * Thank-you page: Purchase pixel only.
 * CAPI Purchase lo envía el webhook Whop (metadata.meta_event_id + email).
 */
function PurchaseTrackerInner() {
  const params = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;

    const purchase = resolveRetoPurchaseTracking(params);
    if (!purchase) return;
    if (wasPurchaseFired(purchase.eventId)) return;

    fired.current = true;
    markPurchaseFired(purchase.eventId);

    const { eventId, orderId, value } = purchase;

    const pixelId = LUCAS.metaPixelId;
    if (pixelId) {
      trackEventForPixel(pixelId, 'Purchase', lucasRetoPurchase(value, orderId), {
        eventId,
      });
    }

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
