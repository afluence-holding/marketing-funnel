import type { Metadata } from 'next';

const TITLE = 'Cami · Lista de espera — Libérate del "¿qué cocino hoy?"';
const DESCRIPTION =
  'Sé de las primeras 100 en recibir la guía mensual de recetas de Cami. Acceso anticipado, precio especial de lanzamiento y Cuchi, tu IA de cocina, en beta.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
  },
};

export default function RecetasCamiWaitlistPage() {
  return (
    <iframe
      src="/recetas-cami/waitlist/raw"
      title={TITLE}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
