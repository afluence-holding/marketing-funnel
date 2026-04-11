'use client';

import { useEffect, useRef } from 'react';

/**
 * Resolves Purchase value/currency for Meta Pixel.
 * Meta requires value > 0 (browser + CAPI); sending 0 triggers Events Manager warnings.
 *
 * Priority:
 * 1. URL query (Hotmart can append params to external thank-you URL if configured):
 *    ?value=47&currency=USD  (also accepts: price, transaction_value, amount)
 * 2. NEXT_PUBLIC_GERMAN_ROZ_PURCHASE_VALUE + NEXT_PUBLIC_GERMAN_ROZ_PURCHASE_CURRENCY
 */
function resolvePurchaseParams(): { value: number; currency: string } | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const currency =
    (params.get('currency') ?? process.env.NEXT_PUBLIC_GERMAN_ROZ_PURCHASE_CURRENCY ?? 'USD')
      .trim()
      .toUpperCase() || 'USD';

  const raw =
    params.get('value') ??
    params.get('price') ??
    params.get('transaction_value') ??
    params.get('amount') ??
    params.get('transaction_value_usd');

  if (raw) {
    const normalized = raw.replace(',', '.').replace(/[^\d.]/g, '');
    const value = parseFloat(normalized);
    if (Number.isFinite(value) && value > 0) {
      return { value, currency };
    }
  }

  const envVal = process.env.NEXT_PUBLIC_GERMAN_ROZ_PURCHASE_VALUE?.trim();
  if (envVal) {
    const value = parseFloat(envVal.replace(',', '.'));
    if (Number.isFinite(value) && value > 0) {
      return { value, currency };
    }
  }

  return null;
}

/**
 * Fires a Purchase event once when the thank-you page loads.
 * Calls fbq directly to ensure it queues even before pixel init.
 */
export function PurchaseTracker() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const purchase = resolvePurchaseParams();
    if (!purchase) {
      console.warn(
        '[PurchaseTracker] Skipping Meta Purchase: no valid price. Set NEXT_PUBLIC_GERMAN_ROZ_PURCHASE_VALUE or pass ?value= in the thank-you URL.',
      );
      return;
    }

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        content_name: 'german-roz-desinflamate',
        value: purchase.value,
        currency: purchase.currency,
      });
    }
  }, []);

  return null;
}
