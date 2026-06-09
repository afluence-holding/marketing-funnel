import type { WhatsAppGroupPoolSeed, WhatsAppGroupSeed } from '../../../core/types';

/**
 * WhatsApp group pool for the Germán Roz webinar (2026-06-10).
 *
 * Links come from `GERMAN_ROZ_WA_GROUP_URLS` (comma-separated invite links, in
 * rotation order). They are only seeded on first boot when the pool has no
 * groups in DB — afterwards groups are managed live in the DB or via the admin
 * endpoint, so links can be added/edited without a code deploy.
 *
 * Rotation: `auto_count` advances to the next group once `capacity` registrants
 * are assigned. Switch to `join_webhook` (and set group JIDs) once a real
 * WhatsApp connection reports actual joins.
 */
function parseGroupUrls(): WhatsAppGroupSeed[] {
  const raw =
    process.env.GERMAN_ROZ_WA_GROUP_URLS ??
    process.env.NEXT_PUBLIC_GERMAN_ROZ_WHATSAPP_URL ??
    '';
  return raw
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .map((inviteUrl, index) => ({
      label: `Grupo ${index + 1}`,
      inviteUrl,
      position: index + 1,
    }));
}

export const whatsappGroupPools: WhatsAppGroupPoolSeed[] = [
  {
    orgKey: 'german-roz',
    buKey: 'main',
    poolKey: 'webinar-2026-06-10',
    label: 'Webinar · 10 jun 2026',
    launchCode: 'DI21-C2',
    capacity: Number(process.env.GERMAN_ROZ_WA_GROUP_CAPACITY ?? 500),
    rotationMode: 'auto_count',
    groups: parseGroupUrls(),
  },
];
