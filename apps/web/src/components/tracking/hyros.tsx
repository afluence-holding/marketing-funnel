'use client';

import Script from 'next/script';
import { getHyrosScriptInline, hyrosPh } from '@/lib/config/pixels';

export function HyrosScript() {
  if (!hyrosPh) return null;

  return (
    <Script
      id="hyros"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: getHyrosScriptInline(hyrosPh),
      }}
    />
  );
}
