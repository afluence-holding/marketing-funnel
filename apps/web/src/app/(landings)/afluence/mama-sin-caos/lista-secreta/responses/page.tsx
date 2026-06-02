import type { Metadata } from 'next';
import MamaSinCaosResponsesView from './responses-view';

export const metadata: Metadata = {
  title: 'Mamá Sin Caos — Respuestas',
  description: 'Panel interno para revisar leads de la lista secreta de Mamá Sin Caos.',
  robots: { index: false, follow: false },
};

export default function MamaSinCaosResponsesPage() {
  return <MamaSinCaosResponsesView />;
}
