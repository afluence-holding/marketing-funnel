'use client';

import Script from 'next/script';
import { useEffect } from 'react';

/**
 * Loads the Meta Pixel SDK (fbevents.js). Render ONCE in the layout.
 * Does NOT init any pixel — use MetaPixelInit for that.
 */
export function MetaPixelScript() {
  return (
    <Script
      id="meta-pixel-sdk"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');`,
      }}
    />
  );
}

/**
 * Initializes a specific Meta Pixel ID and fires a PageView.
 *
 * Use this in each landing to init that landing's pixel.
 * Multiple IDs can coexist — fbq('track', ...) fires to ALL initialized pixels.
 * Use trackEventForPixel() from lib/tracking/events.ts to target a specific one.
 *
 * @example
 *   <MetaPixelInit id="123456789" />
 *   <MetaPixelInit id="987654321" />  // second pixel for a different ad account
 */
export function MetaPixelInit({ id }: { id: string | undefined }) {
  useEffect(() => {
    if (!id || typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }, [id]);

  return null;
}

/**
 * Convenience: loads SDK + inits one pixel. Use in the layout for the default pixel.
 */
export function MetaPixel({ id }: { id: string | undefined }) {
  return (
    <>
      <MetaPixelScript />
      {id && <MetaPixelInit id={id} />}
    </>
  );
}
