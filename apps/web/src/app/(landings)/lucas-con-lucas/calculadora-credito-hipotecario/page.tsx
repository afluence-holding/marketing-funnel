import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';

export const metadata: Metadata = {
  title: 'Calculadora de Crédito Hipotecario — Lucas con Luca$',
  description:
    'Simula tu crédito hipotecario en Chile: pie, dividendo, flujo neto y rentabilidad de inversión con UF actualizada.',
  openGraph: {
    title: 'Calculadora de Crédito Hipotecario — Lucas con Luca$',
    description:
      'Simula tu crédito hipotecario en Chile: pie, dividendo, flujo neto y rentabilidad de inversión con UF actualizada.',
  },
};

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/lucas-con-lucas/calculadora-credito-hipotecario/landing.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export default async function LucasConLucasCalculadoraCreditoHipotecarioLanding() {
  const html = await loadHtml();

  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_LUCAS_CON_LUCAS} />
      <iframe
        srcDoc={html}
        title="Calculadora de Crédito Hipotecario — Lucas con Luca$"
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
