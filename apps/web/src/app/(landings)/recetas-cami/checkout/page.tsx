import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recetas Cami — Checkout',
  description:
    'Finaliza tu compra de la guía mensual de Recetas Cami. Pago seguro procesado por dLocal.',
  robots: 'noindex,nofollow',
  openGraph: {
    title: 'Recetas Cami — Checkout',
    description:
      'Finaliza tu compra de la guía mensual de Recetas Cami. Pago seguro procesado por dLocal.',
  },
};

export default function RecetasCamiCheckoutPage() {
  return (
    <iframe
      src="/recetas-cami/checkout/raw"
      title="Recetas Cami — Checkout"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
