import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import LandingFrame from './landing-frame';

export const metadata: Metadata = {
  title: 'Mamá Sin Caos — ¿Qué tipo de mamá eres cuando ya no das más?',
  description:
    'Un diagnóstico rápido para descubrir qué tipo de mamá eres cuando ya no das más — y aparta tu lugar en el webinar en vivo gratis.',
  openGraph: {
    title: 'Mamá Sin Caos — ¿Qué tipo de mamá eres cuando ya no das más?',
    description:
      'Descubre tu arquetipo y aparta tu lugar en el webinar en vivo gratis de Mamá Sin Caos.',
  },
};

export default function MamaSinCaosDiagnosticoPage() {
  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_MAMA_SIN_CAOS} />
      <LandingFrame
        src="/mama-sin-caos/diagnostico/raw"
        title="Mamá Sin Caos — Diagnóstico"
      />
    </>
  );
}
