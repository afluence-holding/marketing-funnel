'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/tracking/events';

/**
 * Fires a Purchase event once when the thank-you page loads.
 * Waits for the Meta Pixel to be initialized before firing.
 */
export function PurchaseTracker() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;

    function fire() {
      if (fired.current) return;
      fired.current = true;
      trackEvent('Purchase', { content_name: 'german-roz-desinflamate', value: 0, currency: 'USD' });
    }

    // Wait until fbq has at least one pixel initialized
    function check() {
      if (typeof window.fbq === 'function') {
        const state = (window.fbq as any).getState?.();
        if (state?.pixels?.length > 0) {
          fire();
          return;
        }
      }
      // Retry for up to 5 seconds
      setTimeout(check, 200);
    }

    check();
  }, []);

  return null;
}
