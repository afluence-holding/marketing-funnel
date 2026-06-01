import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import { WebinarRegistration } from './webinar-registration';

export const metadata: Metadata = {
  title: 'Webinar Lucas con Luca$ — Inversión inmobiliaria en Chile',
  description:
    'Webinar gratuito el 4 de junio de 2026 a las 19:00 (hora Chile). Regístrate y aprende inversión inmobiliaria con Lucas.',
  openGraph: {
    title: 'Webinar Lucas con Luca$ — 4 de junio',
    description:
      'Webinar gratuito de inversión inmobiliaria en Chile. 4 de junio · 19:00 hrs.',
  },
};

export default function LucasConLucasWebinarPage() {
  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_LUCAS_CON_LUCAS} />
      <WebinarRegistration />
    </>
  );
}
