import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import { LUCAS } from '../../lucas-config';
import { LucasRetoGraciasContent } from './gracias-content';
import { PurchaseTracker } from './purchase-tracker';

export const metadata: Metadata = {
  title: '¡Gracias! — Reto Lucas con Luca$',
  description: 'Tu compra del Reto Lucas con Luca$ está confirmada.',
  robots: { index: false, follow: false },
};

export default function LucasRetoGraciasPage() {
  return (
    <>
      <LandingConfig metaPixelId={LUCAS.metaPixelId} />
      <PurchaseTracker />
      <LucasRetoGraciasContent />
    </>
  );
}
