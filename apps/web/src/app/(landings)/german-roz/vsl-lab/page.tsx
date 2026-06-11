import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import { VslLabFrame } from './vsl-lab-frame';

// SPIKE / LAB — evaluación de checkout embebido + franja de testimonios.
// Reusa el MISMO bundle del VSL en vivo (no lo duplica). No indexable.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'VSL Lab — Desinflámate (spike)',
  robots: { index: false, follow: false },
};

async function loadVslHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/german-roz/vsl-desinflamate/vsl-desinflamate.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export default async function GermanRozVslLabPage() {
  const html = await loadVslHtml();
  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ} />
      <VslLabFrame html={html} />
    </>
  );
}
