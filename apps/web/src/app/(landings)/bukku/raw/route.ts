import fs from 'node:fs/promises';
import path from 'node:path';
import { landingHtmlResponse } from '@/lib/tracking/landing-html';

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/bukku/landing.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export async function GET() {
  const html = await loadHtml();
  return landingHtmlResponse(html);
}
