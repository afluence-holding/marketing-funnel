import type { Metadata } from 'next';
import { ExactLandingClient } from './exact-landing-client';

export const metadata: Metadata = {
  title: 'Afluence | Pipeline',
  description: 'Landing original de AI Factory Creators',
  openGraph: {
    title: 'Afluence | Pipeline',
    description: 'Landing original de AI Factory Creators',
  },
};

export default function AiFactoryCreatorsV1() {
  const calendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() ||
    'https://calendly.com/pablo-byafluence/30min';
  const metaPixelId =
    process.env.NEXT_PUBLIC_META_PIXEL_AFLUENCE_FAKTORY_CREATORS?.trim() || '802420792903521';
  const debugBooking =
    process.env.NEXT_PUBLIC_DEBUG_BOOKING === '1' || process.env.NODE_ENV === 'development';
  if (debugBooking) {
    let calendlyHost: string | null = null;
    if (calendlyUrl) {
      try {
        calendlyHost = new URL(calendlyUrl).host;
      } catch {
        calendlyHost = 'invalid-url';
      }
    }
    console.info('[booking-debug][server]', {
      hasCalendlyUrl: Boolean(calendlyUrl),
      calendlyHost,
      hasMetaPixelId: Boolean(metaPixelId),
    });
  }

  return (
    <ExactLandingClient
      calendlyUrl={calendlyUrl}
      debugBooking={debugBooking}
      metaPixelId={metaPixelId}
    />
  );
}
