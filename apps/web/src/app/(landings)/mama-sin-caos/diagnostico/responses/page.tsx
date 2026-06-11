import type { Metadata } from 'next';
import MamaSinCaosResponsesView from './responses-view';

export const metadata: Metadata = {
  title: 'Mamá Sin Caos — Registros diagnóstico',
  description: 'Panel interno para revisar registros del diagnóstico de Mamá Sin Caos.',
  robots: { index: false, follow: false },
};

export default function MamaSinCaosResponsesPage() {
  return <MamaSinCaosResponsesView />;
}
