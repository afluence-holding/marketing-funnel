import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import { LUCAS } from '../lucas-config';
import { PreLaunchForm } from './pre-launch-form';

export const metadata: Metadata = {
  title: 'Lucas con Luca$ — Lista de espera',
  description:
    'Construye tu patrimonio inmobiliario. Regístrate en la lista de espera y sé de los primeros.',
  openGraph: {
    title: 'Lucas con Luca$ — Lista de espera',
    description: 'Construye tu patrimonio inmobiliario.',
  },
};

export default function LucasConLucasPreLunchFormPage() {
  return (
    <>
      <LandingConfig metaPixelId={LUCAS.metaPixelId} />
      <PreLaunchForm />
    </>
  );
}
