import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import LandingFrame from './landing-frame';

export const metadata: Metadata = {
  title: 'Reto Lucas con Luca$ · 15 días de inversión inmobiliaria en Chile',
  description:
    'Reto de 15 días por WhatsApp. De cero a inversor inmobiliario en Chile con Lucas, fundador de Flipeame. +150 propiedades flipeadas.',
  openGraph: {
    title: 'Reto Lucas con Luca$ · Inversión inmobiliaria en Chile',
    description:
      '15 días, video diario por WhatsApp. Aprende lo necesario para invertir en propiedades en Chile.',
  },
};

export default function LucasConLucasRetoLandingPage() {
  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_LUCAS_CON_LUCAS} />
      <LandingFrame
        src="/lucas-con-lucas/reto/raw"
        title="Reto Lucas con Luca$ — Inversión inmobiliaria"
      />
    </>
  );
}
