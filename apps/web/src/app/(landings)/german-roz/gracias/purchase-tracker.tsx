'use client';

import { useEffect, useRef } from 'react';

/**
 * Fires a Purchase event once when the thank-you page loads.
 * Calls fbq directly to ensure it queues even before pixel init.
 */
export function PurchaseTracker() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // fbq has an internal queue — calls before init are held and replayed.
    // Call fbq directly instead of going through trackEvent to avoid
    // the typeof check that might fail during SSR hydration.
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        content_name: 'german-roz-desinflamate',
        value: 0,
        currency: 'USD',
      });
    }
  }, []);

  return null;
}
