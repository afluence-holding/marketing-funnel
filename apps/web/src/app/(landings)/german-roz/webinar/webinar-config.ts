/** Ajusta fecha/hora del webinar aquí (una sola fuente de verdad). */
export const GERMAN_WEBINAR = {
  source: 'landing-german-roz-webinar-2026-06-10',
  dateLabel: '10 de junio de 2026',
  dateShort: 'Mié 10 de junio',
  timeLabel: '8:00 PM Perú',
  timeShort: '20:00',
  dateIso: '2026-06-10',
  time: '20:00',
  timezone: 'America/Lima',
  /** 20:00 Lima (UTC-5) → 01:00 UTC del 11 jun */
  calendarDates: '20260611T010000Z/20260611T020000Z',
  calendarTitle: 'Masterclass Germán Roz — Nutrición y cocina',
  calendarDetails:
    'Masterclass en vivo con Germán Roz. Link de acceso por correo y WhatsApp.',
} as const;
