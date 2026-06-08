import type { Metadata } from 'next';
import CaroFitnessResponsesView from './responses-view';

export const metadata: Metadata = {
  title: 'Caro Manrique — Registros diagnóstico',
  description: 'Panel interno para revisar registros del diagnóstico de Caro Fitness.',
  robots: { index: false, follow: false },
};

export default function CaroFitnessResponsesPage() {
  return <CaroFitnessResponsesView />;
}
