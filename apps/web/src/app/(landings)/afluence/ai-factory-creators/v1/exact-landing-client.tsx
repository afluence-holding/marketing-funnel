'use client';

import { LandingConfig } from '@/components/landing-config';
import App from '../../../../../../../../docs/Landing page para Afluence/src/app/App';

export function ExactLandingClient() {
  return (
    <>
      <LandingConfig
        metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_AFLUENCE_FAKTORY_CREATORS}
        ga4Id={process.env.NEXT_PUBLIC_GA4_AFLUENCE_FAKTORY_CREATORS}
        tiktokPixelId={process.env.NEXT_PUBLIC_TIKTOK_AFLUENCE_FAKTORY_CREATORS}
      />
      <App />
    </>
  );
}
