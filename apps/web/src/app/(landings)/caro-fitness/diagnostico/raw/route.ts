import fs from 'node:fs/promises';
import path from 'node:path';

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/caro-fitness/diagnostico/landing.html',
  );
  let html = await fs.readFile(filePath, 'utf-8');
  html = html.replace(
    /__WEBINAR_URL__/g,
    process.env.NEXT_PUBLIC_CARO_FITNESS_WEBINAR_URL ?? '#',
  );
  html = html.replace(
    /__WHATSAPP_GROUP_URL__/g,
    process.env.NEXT_PUBLIC_CARO_FITNESS_WHATSAPP_URL ?? '#',
  );
  html = html.replace(
    /__WEBINAR_DATE__/g,
    process.env.NEXT_PUBLIC_CARO_FITNESS_WEBINAR_DATE ?? '14 de Junio · [HORA]',
  );
  return html;
}

export async function GET() {
  const html = await loadHtml();

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
    },
  });
}
