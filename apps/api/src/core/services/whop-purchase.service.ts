import { buildMetaCapiUserData, sendMetaCapiEvent } from './meta-capi.service';
import type { WhopPurchaseProduct } from './whop-products';

export type WhopPurchaseCapiInput = {
  product: WhopPurchaseProduct;
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
  eventSourceUrl?: string;
};

function getProductCapiCredentials(
  product: WhopPurchaseProduct,
): { pixelId?: string; accessToken?: string } {
  const pixelId = process.env[product.pixelEnv]?.trim();
  const accessToken = process.env[product.tokenEnv]?.trim();
  if (pixelId && accessToken) return { pixelId, accessToken };
  return {};
}

/** Send a Purchase CAPI event for any registered Whop product (org-scoped pixel). */
export async function sendWhopPurchaseCapi(input: WhopPurchaseCapiInput): Promise<void> {
  const { product } = input;
  const capiCreds = getProductCapiCredentials(product);

  await sendMetaCapiEvent({
    eventName: 'Purchase',
    eventId: input.eventId,
    eventSourceUrl: input.eventSourceUrl ?? product.graciasUrl,
    userData: buildMetaCapiUserData({
      email: input.email,
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName,
      country: product.country,
      fbp: input.fbp,
      fbc: input.fbc,
      clientIpAddress: input.clientIpAddress,
      clientUserAgent: input.clientUserAgent,
    }),
    customData: {
      content_ids: product.contentIds,
      content_name: product.contentName,
      content_category: product.contentCategory,
      content_type: product.contentType,
      value: input.value,
      currency: input.currency ?? product.currency,
      order_id: input.orderId,
      num_items: 1,
      source: `${product.source}-whop-webhook`,
    },
    ...capiCreds,
  });
}

/** Resolve the Purchase value, falling back to the configured plan price. */
export function resolveWhopPurchaseValue(amount: unknown, fallbackPrice: number): number {
  const parsed = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return fallbackPrice;
}
