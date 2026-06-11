import type { WhatsAppGroupPoolSeed, WhatsAppGroupSeed } from '../../../core/types';

/**
 * Pool de grupos de WhatsApp para el webinar de Mamá Sin Caos (igual que German).
 * Los links vienen de `MAMA_SIN_CAOS_WA_GROUP_URLS` (invite links separados por
 * coma, en orden de rotación). Solo se seedean en el primer boot con pool vacío;
 * después se gestionan en el admin (módulo Grupos WhatsApp) sin deploy.
 */
const DEFAULT_GROUP_URLS = [
  'https://chat.whatsapp.com/LHSTlha7u9nATpQfDzxn4b',
  'https://chat.whatsapp.com/Hgh08Efz26yIEYB6XacwpS',
  'https://chat.whatsapp.com/GiMr5yNNgIOA3HOPeikk0b',
  'https://chat.whatsapp.com/GPCMacb3MilIvx2S5g3rzy',
  'https://chat.whatsapp.com/B4qN9M5uB7YKEKFhNZ7M9T',
  'https://chat.whatsapp.com/Fpa1KTAIIg0LYK8kBJu0SS',
];

function normalizeInviteUrl(raw: string): string {
  const url = raw.trim();
  const m = url.match(/^https:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
  return m ? `https://chat.whatsapp.com/${m[1]}` : url;
}

function parseGroupUrls(): WhatsAppGroupSeed[] {
  const raw =
    process.env.MAMA_SIN_CAOS_WA_GROUP_URLS ??
    process.env.NEXT_PUBLIC_MAMA_SIN_CAOS_WHATSAPP_URL ??
    '';
  const urls = raw
    .split(',')
    .map((url) => normalizeInviteUrl(url))
    .filter(Boolean);
  const source = urls.length ? urls : DEFAULT_GROUP_URLS;
  return source.map((inviteUrl, index) => ({
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
