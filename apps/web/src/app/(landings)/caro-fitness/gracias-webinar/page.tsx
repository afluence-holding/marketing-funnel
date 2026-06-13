import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import LandingFrame from '../diagnostico/landing-frame';

export const metadata: Metadata = {
  title: 'Estás dentro · Train Like A Pro',
  description:
    'Gracias por registrarte al webinar. Entra al grupo VIP de WhatsApp para contenido exclusivo.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Estás dentro · Train Like A Pro',
    description:
      'Gracias por registrarte al webinar. Entra al grupo VIP de WhatsApp para contenido exclusivo.',
  },
};

export default function CaroFitnessGraciasWebinarPage() {
  return (
    <>
      <LandingConfig
        metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_CARO_FITNESS}
      />
      <LandingFrame
        src="/caro-fitness/gracias-webinar/raw"
        title="Estás dentro · Train Like A Pro"
      />
    </>
  );
}
