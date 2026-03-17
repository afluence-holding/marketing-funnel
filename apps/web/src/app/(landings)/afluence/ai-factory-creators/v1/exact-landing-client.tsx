'use client';

import { LandingConfig } from '@/components/landing-config';
import { LandingApp } from './landing-app';

interface ExactLandingClientProps {
  calendlyUrl: string;
  debugBooking: boolean;
  metaPixelId: string;
}

export function ExactLandingClient({ calendlyUrl, debugBooking, metaPixelId }: ExactLandingClientProps) {
  return (
    <>
      <LandingConfig
        metaPixelId={metaPixelId}
        ga4Id={process.env.NEXT_PUBLIC_GA4_AFLUENCE_FAKTORY_CREATORS}
        tiktokPixelId={process.env.NEXT_PUBLIC_TIKTOK_AFLUENCE_FAKTORY_CREATORS}
      />
      <LandingApp calendlyUrl={calendlyUrl} debugBooking={debugBooking} />
    </>
  );
}
