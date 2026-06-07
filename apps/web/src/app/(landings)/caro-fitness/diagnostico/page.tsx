import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import LandingFrame from './landing-frame';

export const metadata: Metadata = {
  title: 'Diagnóstico de Rendimiento · Caro Manrique',
  description:
    'Un diagnóstico rápido que cruza tu objetivo, entrenamiento y alimentación para detectar qué te está frenando.',
  openGraph: {
    title: 'Diagnóstico de Rendimiento · Caro Manrique',
    description:
      'Un diagnóstico rápido que cruza tu objetivo, entrenamiento y alimentación para detectar qué te está frenando.',
  },
};

export default function CaroFitnessDiagnosticoPage() {
  return (
    <>
      <LandingConfig
        metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_CARO_FITNESS}
      />
      <LandingFrame
        src="/caro-fitness/diagnostico/raw"
        title="Diagnóstico de Rendimiento · Caro Manrique"
      />
    </>
  );
}
