import { GoogleTagManager } from '@/components/tracking/gtm';
import { MetaPixel } from '@/components/tracking/meta-pixel';
import { GoogleAnalytics } from '@/components/tracking/google-analytics';
import { Clarity } from '@/components/tracking/clarity';
import { gtmId, clarityId } from '@/lib/config/pixels';

/**
 * Shared layout for all landing pages.
 *
 * Injects tracking scripts (GTM, Meta Pixel, GA4, Clarity) so every
 * landing under (landings)/ gets them automatically — zero config per page.
 *
 * Per-BU pixels (Meta, GA4) can be passed via page-level metadata or
 * by the landing itself. The global GTM and Clarity are always loaded.
 *
 * NOTE: BU-specific Meta Pixel and GA4 are injected at the page level
 * when needed (see LeadForm or individual pages). This layout handles
 * the org-wide / deployment-wide scripts.
 */
export default function LandingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleTagManager id={gtmId} />
      <Clarity id={clarityId} />

      {/*
        Default Meta Pixel and GA4 from env vars.
        Individual landings can add BU-specific pixels via their own components.
      */}
      <MetaPixel id={process.env.NEXT_PUBLIC_META_PIXEL_DEFAULT} />
      <GoogleAnalytics id={process.env.NEXT_PUBLIC_GA4_DEFAULT} />

      {children}
    </>
  );
}
