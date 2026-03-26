import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DESINFLAMATE! — Reto con German Roz',
  description:
    'Únete al reto DESINFLAMATE! con German Roz. Mira la VSL y reserva tu cupo.',
  openGraph: {
    title: 'DESINFLAMATE! — Reto con German Roz',
    description:
      'Únete al reto DESINFLAMATE! con German Roz. Mira la VSL y reserva tu cupo.',
  },
};

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/german-roz/vsl-desinflamate/vsl-desinflamate.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export default async function GermanRozVslDesinflamateLanding() {
  const html = await loadHtml();

  return (
    <iframe
      srcDoc={html}
      title="DESINFLAMATE! — VSL"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
