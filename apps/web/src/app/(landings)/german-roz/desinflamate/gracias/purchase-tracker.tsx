'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getWhopProduct } from '@/lib/whop/products';
import {
  clearCheckoutContext,
  markPurchaseFired,
  resolveWhopPurchaseTracking,
  trackWhopPurchase,
  wasPurchaseFired,
} from '@/lib/whop/tracking';

const PRODUCT_KEY = 'german-desinflamate';

/**
 * Thank-you page: fires the browser Purchase pixel once.
 * CAPI Purchase is sent server-side by the Whop webhook (metadata.meta_event_id
 * + email), so both share the same event_id and Meta dedupes.
 */
function PurchaseTrackerInner() {
  const params = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    const product = getWhopProduct(PRODUCT_KEY);
    if (!product) return;

    const purchase = resolveWhopPurchaseTracking(product, params);
    if (!purchase) return;
    if (wasPurchaseFired(product.key, purchase.eventId)) return;

    fired.current = true;
    markPurchaseFired(product.key, purchase.eventId);
    trackWhopPurchase(product, purchase);
    clearCheckoutContext(product.key);
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
