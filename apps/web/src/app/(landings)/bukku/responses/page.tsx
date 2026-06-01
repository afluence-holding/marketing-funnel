import type { Metadata } from 'next';
import BukkuResponsesView from './responses-view';

export const metadata: Metadata = {
  title: 'Bukku Education — Respuestas',
  description: 'Panel interno para revisar leads del test de inglés de Bukku Education.',
  robots: { index: false, follow: false },
};

export default function BukkuResponsesPage() {
  return <BukkuResponsesView />;
}
