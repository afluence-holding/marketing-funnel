import type { WhatsAppGroupPoolSeed, WhatsAppGroupSeed } from '../../../core/types';

/**
 * Pool VIP de WhatsApp para Train Like A Pro (gracias webinar).
 * Links desde `CARO_FITNESS_WA_GROUP_URLS` (coma-separados). Solo se seedean
 * cuando el pool está vacío; después se gestionan en admin (Grupos WhatsApp).
 */
const DEFAULT_GROUP_URLS = [
  'https://chat.whatsapp.com/IUSBYJHsbUEKR4kjNmKyXN',
  'https://chat.whatsapp.com/G7WZbqbVVTWGT6IKFVJAsa',
  'https://chat.whatsapp.com/EuJRy9u7Kft796BTs7FD00',
  'https://chat.whatsapp.com/Hr5AhrS0USHGgAm9iLb077',
  'https://chat.whatsapp.com/FidGSKqCmMPDwCvymjLrqc',
  'https://chat.whatsapp.com/EERUsmwmxCuF0W6PGAhfMw',
];

function normalizeInviteUrl(raw: string): string {
  const url = raw.trim();
  const m = url.match(/^https:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
  return m ? `https://chat.whatsapp.com/${m[1]}` : url;
}

function parseGroupUrls(): WhatsAppGroupSeed[] {
  const raw =
    process.env.CARO_FITNESS_WA_GROUP_URLS ??
    process.env.NEXT_PUBLIC_CARO_FITNESS_WHATSAPP_URL ??
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
    orgKey: 'caro-fitness',
    buKey: 'main',
    poolKey: 'webinar-vip',
    label: 'Webinar VIP · Train Like A Pro',
    capacity: Number(process.env.CARO_FITNESS_WA_GROUP_CAPACITY ?? 1000),
    rotationMode: 'auto_count',
    groups: parseGroupUrls(),
  },
];
