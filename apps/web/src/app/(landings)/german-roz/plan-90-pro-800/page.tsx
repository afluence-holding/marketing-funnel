import type { Metadata } from 'next';
import LandingFrame from '../plan-90-pro/landing-frame';

export const metadata: Metadata = {
  title: 'Plan 90 Pro 800 — Germán Roz | Chef Nutricionista',
  description:
    'Versión local del Plan 90 Pro con precio de 800 USD para pruebas.',
  openGraph: {
    title: 'Plan 90 Pro 800 — Germán Roz | Chef Nutricionista',
    description:
      'Versión local del Plan 90 Pro con precio de 800 USD para pruebas.',
  },
};

export default function GermanRozPlan90Pro800LandingPage() {
  return (
    <LandingFrame
      src="/german-roz/plan-90-pro-800/raw"
      title="Plan 90 Pro 800 — Germán Roz"
    />
  );
}
