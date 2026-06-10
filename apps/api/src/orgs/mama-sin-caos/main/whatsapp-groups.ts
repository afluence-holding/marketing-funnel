import type { WhatsAppGroupPoolSeed, WhatsAppGroupSeed } from '../../../core/types';

/**
 * Pool de grupos de WhatsApp para el webinar de Mamá Sin Caos (igual que German).
 * Los links vienen de `MAMA_SIN_CAOS_WA_GROUP_URLS` (invite links separados por
 * coma, en orden de rotación). Solo se seedean en el primer boot con pool vacío;
 * después se gestionan en el admin (módulo Grupos WhatsApp) sin deploy.
 */
function parseGroupUrls(): WhatsAppGroupSeed[] {
  const raw =
    process.env.MAMA_SIN_CAOS_WA_GROUP_URLS ??
    process.env.NEXT_PUBLIC_MAMA_SIN_CAOS_WHATSAPP_URL ??
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
    orgKey: 'mama-sin-caos',
    buKey: 'main',
    poolKey: 'webinar-2026-06-23',
    label: 'Webinar · 23 jun 2026',
    capacity: Number(process.env.MAMA_SIN_CAOS_WA_GROUP_CAPACITY ?? 500),
    rotationMode: 'auto_count',
    groups: parseGroupUrls(),
  },
];
