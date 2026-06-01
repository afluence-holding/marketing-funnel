import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import LandingFrame from './landing-frame';

export const metadata: Metadata = {
  title: 'Bukku Education — Test de Inglés',
  description:
    'Cuéntanos sobre tu camino con el inglés y descubre tu nivel con nuestro test personalizado.',
  openGraph: {
    title: 'Bukku Education — Test de Inglés',
    description:
      'Cuéntanos sobre tu camino con el inglés y descubre tu nivel con nuestro test personalizado.',
  },
};

export default function BukkuTestLandingPage() {
  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_BUKKU} />
      <LandingFrame
        src="/bukku/raw"
        title="Bukku Education — Test de Inglés"
      />
    </>
  );
}
