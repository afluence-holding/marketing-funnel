import type { Metadata } from 'next';
import { LandingClient } from './landing-client';

export const metadata: Metadata = {
  title: 'Afluence | Retos por WhatsApp con IA para Creadores',
  description:
    'Lanza retos por WhatsApp con tutor IA que hyper-personaliza la experiencia. 92% de finalización. 10-30% compra high-ticket al finalizar.',
  openGraph: {
    title: 'Afluence | Retos por WhatsApp con IA para Creadores',
    description:
      'Retos por WhatsApp con tutor IA. 92% finalización. Convierte seguidores en clientes high-ticket.',
  },
};

export default function ChallengesCreatorsV1() {
  return <LandingClient />;
}
