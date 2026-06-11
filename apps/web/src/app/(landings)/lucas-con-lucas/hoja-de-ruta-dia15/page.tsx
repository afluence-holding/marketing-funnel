import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import { withLandingTracking } from '@/lib/tracking/landing-html';
import { LUCAS } from '../lucas-config';

export const metadata: Metadata = {
  title: 'Tu Hoja de Ruta — Lucas con Luca$',
  description:
    'Día 15 del Reto: construye tu hoja de ruta personal de inversión inmobiliaria con Lucas con Luca$.',
  openGraph: {
    title: 'Tu Hoja de Ruta — Lucas con Luca$',
    description:
      'Día 15 del Reto: construye tu hoja de ruta personal de inversión inmobiliaria con Lucas con Luca$.',
  },
};

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/lucas-con-lucas/hoja-de-ruta-dia15/landing.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export default async function LucasConLucasHojaDeRutaDia15Landing() {
  const html = withLandingTracking(await loadHtml());

  return (
    <>
      <LandingConfig metaPixelId={LUCAS.metaPixelId} />
      <iframe
        srcDoc={html}
        title="Tu Hoja de Ruta — Lucas con Luca$"
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
