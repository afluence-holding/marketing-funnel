/**
 * Tracking pixel IDs per org/BU.
 *
 * Each BU can have its own Meta Pixel, GA4 property, and TikTok Pixel
 * (different ad accounts per business unit).
 *
 * GTM and Clarity are shared per deployment.
 *
 * All values come from NEXT_PUBLIC_* env vars so they're available client-side.
 */

export interface BuPixels {
  metaPixelId?: string;
  ga4MeasurementId?: string;
  tiktokPixelId?: string;
}

export const pixelConfig: Record<string, Record<string, BuPixels>> = {
  afluence: {
    'faktory-creators': {
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_AFLUENCE_FAKTORY_CREATORS,
      ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_AFLUENCE_FAKTORY_CREATORS,
      tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_AFLUENCE_FAKTORY_CREATORS,
    },
    'faktory-companies': {
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_AFLUENCE_FAKTORY_COMPANIES,
      ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_AFLUENCE_FAKTORY_COMPANIES,
      tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_AFLUENCE_FAKTORY_COMPANIES,
    },
  },
  'german-roz': {
    main: {
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ,
    },
  },
  'lucas-con-lucas': {
    main: {
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_LUCAS_CON_LUCAS,
    },
  },
};

export const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
export const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * Look up pixel IDs for a given org + BU.
 * Returns undefined values if not configured — tracking components gracefully skip when undefined.
 */
export function getPixels(org: string, bu: string): BuPixels {
  return pixelConfig[org]?.[bu] ?? {};
}
