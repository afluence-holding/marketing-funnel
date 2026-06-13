import fs from 'node:fs/promises';
import path from 'node:path';
import { landingHtmlResponse } from '@/lib/tracking/landing-html';

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/caro-fitness/gracias-webinar/landing.html',
  );
  let html = await fs.readFile(filePath, 'utf-8');
  html = html.replace(
    /__WHATSAPP_GROUP_URL__/g,
    process.env.NEXT_PUBLIC_CARO_FITNESS_WHATSAPP_URL ?? '#',
  );
  return html;
}

export async function GET() {
  const html = await loadHtml();
  return landingHtmlResponse(html);
}
