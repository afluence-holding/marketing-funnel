import type { Metadata } from 'next';
import LandingFrame from './landing-frame';

export const metadata: Metadata = {
  title: 'Liberate del "que cocino hoy?" - Guia mensual',
  description:
    'Una guia mensual que te libera del estres diario de decidir que cocinar. Se la primera en saber cuando sale.',
  openGraph: {
    title: 'Liberate del "que cocino hoy?" - Guia mensual',
    description:
      'Una guia mensual que te libera del estres diario de decidir que cocinar. Se la primera en saber cuando sale.',
  },
};

export default function RecetasCamiGuiaLandingPage() {
  return (
    <LandingFrame
      src="/recetas-cami/guia/raw"
      title='Liberate del "que cocino hoy?" - Guia mensual'
    />
  );
}
