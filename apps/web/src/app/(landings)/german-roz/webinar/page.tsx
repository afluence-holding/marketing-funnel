import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import LandingFrame from './landing-frame';

export const metadata: Metadata = {
  title: 'Diagnóstico de Inflamación · Germán Roz',
  description:
    'Un diagnóstico rápido que cruza tus síntomas, tu energía y tu forma de comer para detectar qué te está inflamando — y apártate el lugar en mi clase en vivo gratis del 10 de junio.',
  openGraph: {
    title: 'Diagnóstico de Inflamación · Germán Roz',
    description:
      'Descubre qué está inflamando tu cuerpo y apártate el lugar en la masterclass en vivo gratis con Germán Roz.',
  },
};

export default function GermanRozWebinarPage() {
  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ} />
      <LandingFrame
        src="/german-roz/webinar/raw"
        title="Diagnóstico de Inflamación · Germán Roz"
      />
    </>
  );
}
