export interface MetaTrackingPayload {
  eventId: string;
  fbp?: string;
  fbc?: string;
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const cookie = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`));
  if (!cookie) return undefined;
  return decodeURIComponent(cookie.slice(name.length + 1));
}

export function createMetaEventId(prefix: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  return `${prefix}.${Date.now()}.${randomPart}`;
}

export function buildMetaTrackingPayload(eventId: string): MetaTrackingPayload {
  return {
    eventId,
    fbp: getCookie('_fbp'),
    fbc: getCookie('_fbc'),
  };
}
