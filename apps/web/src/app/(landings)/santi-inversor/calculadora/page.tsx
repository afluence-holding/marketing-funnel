import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';

export const metadata: Metadata = {
  title: 'Santinversor — Calculadora',
  description:
    'Calculadora de libertad financiera para estimar en cuántos años puedes dejar de depender de tu sueldo.',
  openGraph: {
    title: 'Santinversor — Calculadora',
    description:
      'Calculadora de libertad financiera para estimar en cuántos años puedes dejar de depender de tu sueldo.',
  },
};

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/santi-inversor/calculadora/landing.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export default async function SantinversorCalculadoraLanding() {
  const html = await loadHtml();

  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_SANTI_INVERSOR} />
      <iframe
        srcDoc={html}
        title="Santinversor — Calculadora"
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
