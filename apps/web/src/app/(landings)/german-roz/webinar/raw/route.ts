import fs from 'node:fs/promises';
import path from 'node:path';
import { landingHtmlResponse } from '@/lib/tracking/landing-html';
import { GERMAN_WEBINAR } from '../webinar-config';

const CALENDAR_URL =
  `https://calendar.google.com/calendar/render?action=TEMPLATE` +
  `&text=${encodeURIComponent(GERMAN_WEBINAR.calendarTitle)}` +
  `&dates=${GERMAN_WEBINAR.calendarDates}` +
  `&details=${encodeURIComponent(GERMAN_WEBINAR.calendarDetails)}` +
  '&location=Online';

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/german-roz/webinar/landing.html',
  );
  let html = await fs.readFile(filePath, 'utf-8');
  html = html.replace(
    /__WHATSAPP_GROUP_URL__/g,
    process.env.NEXT_PUBLIC_GERMAN_ROZ_WHATSAPP_URL ?? '#',
  );
  html = html.replace(/__CALENDAR_URL__/g, CALENDAR_URL);
  html = html.replace(
    /__WEBINAR_DATE__/g,
    `${GERMAN_WEBINAR.dateShort} · ${GERMAN_WEBINAR.timeLabel}`,
  );
  html = html.replace(/__WEBINAR_DATE_ISO__/g, GERMAN_WEBINAR.dateIso);
  html = html.replace(/__WEBINAR_TIME__/g, GERMAN_WEBINAR.time);
  html = html.replace(/__WEBINAR_TZ__/g, GERMAN_WEBINAR.timezone);
  return html;
}

export async function GET() {
  const html = await loadHtml();
  return landingHtmlResponse(html);
}
