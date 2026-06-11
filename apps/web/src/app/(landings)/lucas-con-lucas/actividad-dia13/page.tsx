import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import { withLandingTracking } from '@/lib/tracking/landing-html';
import { LUCAS } from '../lucas-config';

export const metadata: Metadata = {
  title: 'Test Día 13 — Lucas con Luca$',
  description:
    'Día 13 del Reto: pon a prueba lo aprendido sobre inversión inmobiliaria con el quiz interactivo de Lucas con Luca$.',
  openGraph: {
    title: 'Test Día 13 — Lucas con Luca$',
    description:
      'Día 13 del Reto: pon a prueba lo aprendido sobre inversión inmobiliaria con el quiz interactivo de Lucas con Luca$.',
  },
};

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/lucas-con-lucas/actividad-dia13/landing.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export default async function LucasConLucasActividadDia13Landing() {
  const html = withLandingTracking(await loadHtml());

  return (
    <>
      <LandingConfig metaPixelId={LUCAS.metaPixelId} />
      <iframe
        srcDoc={html}
        title="Test Día 13 — Lucas con Luca$"
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
