import {
  LUCAS_CAPI,
  getLucasRetoPriceFromEnv,
} from '../../orgs/lucas-con-lucas/main/tracking';
import { buildMetaCapiUserData, sendMetaCapiEvent } from './meta-capi.service';

const GRACIAS_URL =
  'https://marketing.byafluence.com/lucas-con-lucas/reto/gracias?status=success';

export function getLucasCapiCredentials(): { pixelId?: string; accessToken?: string } {
  const pixelId = process.env.META_PIXEL_ID_LUCAS_CON_LUCAS;
  const accessToken = process.env.META_CAPI_TOKEN_LUCAS_CON_LUCAS;
  if (pixelId && accessToken) return { pixelId, accessToken };
  return {};
}

export type LucasRetoPurchaseCapiInput = {
  eventId: string;
  orderId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  value: number;
  currency?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  source?: string;
  eventSourceUrl?: string;
};

export async function sendLucasRetoPurchaseCapi(
  input: LucasRetoPurchaseCapiInput,
): Promise<void> {
  const reto = LUCAS_CAPI.reto;
  const capiCreds = getLucasCapiCredentials();

  await sendMetaCapiEvent({
    eventName: 'Purchase',
    eventId: input.eventId,
    eventSourceUrl: input.eventSourceUrl ?? GRACIAS_URL,
    userData: buildMetaCapiUserData({
      email: input.email,
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName,
      country: LUCAS_CAPI.country,
      fbp: input.fbp,
      fbc: input.fbc,
      clientIpAddress: input.clientIpAddress,
      clientUserAgent: input.clientUserAgent,
    }),
    customData: {
      content_ids: reto.contentIds,
      content_name: reto.contentName,
      content_category: reto.contentCategory,
      content_type: reto.contentType,
      value: input.value,
      currency: input.currency ?? LUCAS_CAPI.currency,
      order_id: input.orderId,
      num_items: 1,
      ...(input.source ? { source: input.source } : {}),
    },
    ...capiCreds,
  });
}

export function resolveLucasRetoPurchaseValue(
  amount: unknown,
  currency?: string,
): number {
  const parsed = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isFinite(parsed) && parsed > 0) {
    // Whop amounts are in major units; CLP reto is typically >= 1000.
    if ((currency ?? LUCAS_CAPI.currency).toUpperCase() === 'CLP' && parsed < 1000) {
      return getLucasRetoPriceFromEnv();
    }
    return parsed;
  }
  return getLucasRetoPriceFromEnv();
}
