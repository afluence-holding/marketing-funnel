import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liberate del "que cocino hoy?" - Lista de espera',
  description: 'Landing de lista de espera para Recetas Cami.',
  openGraph: {
    title: 'Liberate del "que cocino hoy?" - Lista de espera',
    description: 'Landing de lista de espera para Recetas Cami.',
  },
};

export default function RecetasCamiLandingPage() {
  return (
    <iframe
      src="/recetas-cami/raw"
      title='Liberate del "que cocino hoy?" - Lista de espera'
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
