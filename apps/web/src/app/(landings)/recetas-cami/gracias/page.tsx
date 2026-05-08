import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gracias por tu compra · Cami',
  description: 'Tu compra fue confirmada. En unos segundos recibis todo por WhatsApp.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Gracias por tu compra · Cami',
    description: 'Tu compra fue confirmada. En unos segundos recibis todo por WhatsApp.',
  },
};

export default function RecetasCamiGraciasPage() {
  return (
    <iframe
      src="/recetas-cami/gracias/raw"
      title="Gracias por tu compra · Cami"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
