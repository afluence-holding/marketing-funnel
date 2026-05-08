import type { Metadata } from 'next';

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
    <iframe
      src="/recetas-cami/guia/raw"
      title='Liberate del "que cocino hoy?" - Guia mensual'
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
