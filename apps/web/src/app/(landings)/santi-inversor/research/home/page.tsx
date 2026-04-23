import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';

export const metadata: Metadata = {
  title: 'Santi Inversor — Research Offer',
  description:
    'Responde esta encuesta y te armamos tu plan de inversión personalizado. Santi Jasminoy.',
  openGraph: {
    title: 'Santi Inversor — Research Offer',
    description:
      'Responde esta encuesta y te armamos tu plan de inversión personalizado. Santi Jasminoy.',
  },
};

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/santi-inversor/research/home/landing.html',
  );
  const raw = await fs.readFile(filePath, 'utf-8');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return raw.replace(/__API_URL__/g, apiUrl);
}

export default async function SantiInversorResearchHomeLanding() {
  const html = await loadHtml();

  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_SANTI_INVERSOR} />
      <iframe
        srcDoc={html}
        title="Santi Inversor — Research Offer"
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
