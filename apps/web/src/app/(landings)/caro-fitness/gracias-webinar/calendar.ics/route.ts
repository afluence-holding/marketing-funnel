const DEFAULT_LIVE_URL =
  'https://youtube.com/live/_LtOhrHDY40?feature=share';

/** 14 jun 2026 20:00 Lima (UTC-5) → 15 jun 01:00 UTC, 1 h */
const ICS_START = '20260615T010000Z';
const ICS_END = '20260615T020000Z';
const ICS_TITLE = 'Webinar Train Like A Pro — Carolina Manrique';

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function buildIcs(liveUrl: string) {
  const description = escapeIcsText(
    `Clase en vivo gratis con Carolina Manrique — domingo 14 de junio, 8 pm (hora Perú).\n\nEnlace: ${liveUrl}`,
  );
  const location = escapeIcsText(liveUrl);
  const title = escapeIcsText(ICS_TITLE);
  const uid = 'caro-fitness-webinar-2026-06-14@byafluence.com';
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Train Like A Pro//Webinar//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${ICS_START}`,
    `DTEND:${ICS_END}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `URL:${liveUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

export async function GET() {
  const liveUrl =
    process.env.NEXT_PUBLIC_CARO_FITNESS_WEBINAR_LIVE_URL ?? DEFAULT_LIVE_URL;

  return new Response(buildIcs(liveUrl), {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition':
        'inline; filename="webinar-train-like-a-pro.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
