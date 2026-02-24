'use client';

import { MetaPixelInit } from '@/components/tracking/meta-pixel';
import { GoogleAnalytics } from '@/components/tracking/google-analytics';
import { TikTokPixel } from '@/components/tracking/tiktok-pixel';

export interface LandingPixels {
  /** BU-specific Meta Pixel ID (additional to the default one in layout). */
  metaPixelId?: string;
  /** BU-specific GA4 measurement ID (additional to the default). */
  ga4Id?: string;
  /** BU-specific TikTok Pixel ID (additional to the default). */
  tiktokPixelId?: string;
}

/**
 * Drop-in component to configure per-landing tracking pixels.
 *
 * Place this once at the top of any landing page to init BU-specific pixels.
 * These pixels are ADDITIONAL to the org-wide defaults loaded by the layout.
 *
 * @example
 *   // In your landing page.tsx:
 *   <LandingConfig
 *     metaPixelId="123456789"        // creator's ad account pixel
 *     ga4Id="G-XXXXXXXXXX"           // BU-specific GA4 property
 *     tiktokPixelId="XXXXXXXXXX"     // BU-specific TikTok pixel
 *   />
 */
export function LandingConfig({ metaPixelId, ga4Id, tiktokPixelId }: LandingPixels) {
  return (
    <>
      {metaPixelId && <MetaPixelInit id={metaPixelId} />}
      {ga4Id && <GoogleAnalytics id={ga4Id} />}
      {tiktokPixelId && <TikTokPixel id={tiktokPixelId} />}
    </>
  );
}
