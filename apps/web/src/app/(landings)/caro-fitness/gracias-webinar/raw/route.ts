import fs from 'node:fs/promises';
import path from 'node:path';
import { landingHtmlResponse } from '@/lib/tracking/landing-html';

/** 14 jun 2026 20:00 Lima (UTC-5) → 15 jun 01:00 UTC, 1 h */
const DEFAULT_WEBINAR_LIVE_URL =
  'https://youtube.com/live/_LtOhrHDY40?feature=share';

function buildDefaultCalendarUrl(liveUrl: string) {
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' +
    encodeURIComponent('Webinar Train Like A Pro — Carolina Manrique') +
    '&dates=20260615T010000Z/20260615T020000Z' +
    '&details=' +
    encodeURIComponent(
      `Clase en vivo gratis con Carolina Manrique — domingo 14 de junio, 8 pm (hora Perú).\n\nEnlace: ${liveUrl}`,
    ) +
    '&location=' +
    encodeURIComponent(liveUrl)
  );
}

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/caro-fitness/gracias-webinar/landing.html',
  );
  let html = await fs.readFile(filePath, 'utf-8');
  const liveUrl =
    process.env.NEXT_PUBLIC_CARO_FITNESS_WEBINAR_LIVE_URL ??
    DEFAULT_WEBINAR_LIVE_URL;
  html = html.replace(
    /__WHATSAPP_GROUP_URL__/g,
    process.env.NEXT_PUBLIC_CARO_FITNESS_WHATSAPP_URL ?? '#',
  );
  html = html.replace(
    /__WEBINAR_DATE__/g,
    process.env.NEXT_PUBLIC_CARO_FITNESS_WEBINAR_DATE ??
      'domingo 14 de junio · 8 pm PE',
  );
  html = html.replace(/__WEBINAR_LIVE_URL__/g, liveUrl);
  html = html.replace(
    /__CALENDAR_URL__/g,
    process.env.NEXT_PUBLIC_CARO_FITNESS_WEBINAR_CALENDAR_URL ??
      buildDefaultCalendarUrl(liveUrl),
  );
  return html;
}

export async function GET() {
  const html = await loadHtml();
  return landingHtmlResponse(html);
}
