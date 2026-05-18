import type { Metadata } from 'next';
import LandingFrame from './landing-frame';

export const metadata: Metadata = {
  title: 'Plan 90 Pro — Germán Roz | Chef Nutricionista',
  description:
    'El único programa premium de 90 días con acceso directo a Germán Roz, nutricionista personal, menús a medida e IA 24/7.',
  openGraph: {
    title: 'Plan 90 Pro — Germán Roz | Chef Nutricionista',
    description:
      'El único programa premium de 90 días con acceso directo a Germán Roz, nutricionista personal, menús a medida e IA 24/7.',
  },
};

export default function GermanRozPlan90ProLandingPage() {
  return (
    <LandingFrame
      src="/german-roz/plan-90-pro/raw"
      title="Plan 90 Pro — Germán Roz"
    />
  );
}
