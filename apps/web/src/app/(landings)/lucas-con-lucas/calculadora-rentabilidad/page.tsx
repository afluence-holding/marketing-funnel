import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import { withLandingTracking } from '@/lib/tracking/landing-html';
import { LUCAS } from '../lucas-config';

export const metadata: Metadata = {
  title: 'Calculadora de Rentabilidad — Flipeame',
  description:
    'Proyecta tu inversión en segundos. Calcula tu capital futuro, retiros y rentabilidad con la calculadora de Flipeame.',
  openGraph: {
    title: 'Calculadora de Rentabilidad — Flipeame',
    description:
      'Proyecta tu inversión en segundos. Calcula tu capital futuro, retiros y rentabilidad con la calculadora de Flipeame.',
  },
};

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/lucas-con-lucas/calculadora-rentabilidad/landing.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export default async function LucasConLucasCalculadoraRentabilidadLanding() {
  const html = withLandingTracking(await loadHtml());

  return (
    <>
      <LandingConfig metaPixelId={LUCAS.metaPixelId} />
      <iframe
        srcDoc={html}
        title="Calculadora de Rentabilidad — Flipeame"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          display: 'block',
        }}
      />
    </>
  );
}
