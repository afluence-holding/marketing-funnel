import type { Metadata } from 'next';
import LandingFrame from './landing-frame';

export const metadata: Metadata = {
  title: 'Se viene algo · Mamá Sin Caos',
  description:
    'Estoy preparando algo nuevo. Déjame tu correo y vas a ser de las primeras en saberlo.',
  openGraph: {
    title: 'Se viene algo… · Mamá Sin Caos',
    description: 'Estoy preparando algo nuevo. Sé de las primeras en enterarte.',
  },
};

export default function MamaSinCaosListaSecretaPage() {
  return (
    <LandingFrame
      src="/afluence/mama-sin-caos/lista-secreta/raw"
      title="Se viene algo · Mamá Sin Caos"
    />
  );
}
