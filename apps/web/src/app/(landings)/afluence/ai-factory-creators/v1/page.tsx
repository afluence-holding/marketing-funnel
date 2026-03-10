import type { Metadata } from 'next';
import { ExactLandingClient } from './exact-landing-client';

export const metadata: Metadata = {
  title: 'Afluence | Pipeline',
  description: 'Landing original de AI Factory Creators',
  openGraph: {
    title: 'Afluence | Pipeline',
    description: 'Landing original de AI Factory Creators',
  },
};

export default function AiFactoryCreatorsV1() {
  return <ExactLandingClient />;
}
