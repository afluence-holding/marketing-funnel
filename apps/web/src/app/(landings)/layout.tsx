import { GoogleTagManager } from '@/components/tracking/gtm';
import { MetaPixel } from '@/components/tracking/meta-pixel';
import { GoogleAnalytics } from '@/components/tracking/google-analytics';
import { Clarity } from '@/components/tracking/clarity';
import { TikTokPixel } from '@/components/tracking/tiktok-pixel';
import { gtmId, clarityId } from '@/lib/config/pixels';

/**
 * Shared layout for all landing pages.
 *
 * Loads org-wide tracking scripts so every landing gets them for free:
 * - GTM (Google Tag Manager) — manages all tags
 * - Clarity (Microsoft) — free heatmaps + session recordings
 * - Default Meta Pixel — org-wide pixel (if configured)
 * - Default GA4 — org-wide analytics (if configured)
 * - Default TikTok Pixel — org-wide TikTok tracking (if configured)
 *
 * Individual landings add BU-specific pixels via <MetaPixelInit>, <GoogleAnalytics>, etc.
 */
export default function LandingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleTagManager id={gtmId} />
      <Clarity id={clarityId} />
      <MetaPixel id={process.env.NEXT_PUBLIC_META_PIXEL_DEFAULT} />
      <GoogleAnalytics id={process.env.NEXT_PUBLIC_GA4_DEFAULT} />
      <TikTokPixel id={process.env.NEXT_PUBLIC_TIKTOK_PIXEL_DEFAULT} />
      {children}
    </>
  );
}
