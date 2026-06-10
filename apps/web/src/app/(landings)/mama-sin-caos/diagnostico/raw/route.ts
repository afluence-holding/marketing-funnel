import fs from 'node:fs/promises';
import path from 'node:path';
import { landingHtmlResponse } from '@/lib/tracking/landing-html';

// Sirve el HTML de Mamá Sin Caos (quiz de arquetipos) + inyecta Hyros.
// El branding/contenido viven en landing.html; la integración (ingesta genérica
// + WhatsApp assign + UTM/Meta) está cableada en su <script>.
async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/mama-sin-caos/diagnostico/landing.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export async function GET() {
  const html = await loadHtml();
  return landingHtmlResponse(html);
}
