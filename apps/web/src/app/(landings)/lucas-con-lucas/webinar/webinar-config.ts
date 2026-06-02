import { LUCAS } from '../lucas-config';

/** Fuente de verdad: ingest, pixel Meta y calendario del webinar. */
export const LUCAS_WEBINAR = {
  source: LUCAS.sources.webinar,
  metaPixelId: LUCAS.metaPixelId,
  contentName: LUCAS.webinar.contentName,
  dateIso: '2026-06-04',
  time: '19:00',
  timezone: 'America/Santiago',
} as const;
