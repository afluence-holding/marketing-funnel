/**
 * Connector Meta CAPI — thin wrapper sobre `meta-capi.service.ts` (no reescribe
 * atribución). Lead en registro, Purchase en compra, con Pixel/token del creador
 * (por env) y `event_id` compartido con el Pixel (del tracking del request) para
 * dedupe. Sin credenciales → no-op (el servicio ya retorna silencioso, pero acá
 * lo cortamos antes para no marcar delivered de algo no enviado... ver dispatcher).
 */

import { sendMetaCapiEvent, buildMetaCapiUserData } from '../../services/meta-capi.service';
import { resolveSecret } from '../secrets';
import {
  type IntegrationConnector,
  type IntegrationEvent,
  type MetaCapiTargetConfig,
} from '../types';

/** ¿Están las credenciales Meta del creador configuradas? */
export function metaCapiConfigured(target: MetaCapiTargetConfig): boolean {
  return Boolean(resolveSecret(target.pixelRef) && resolveSecret(target.tokenRef));
}

function eventIdFor(event: IntegrationEvent, target: MetaCapiTargetConfig): string {
  // Prioridad: el event_id del Pixel (dedupe). Fallback determinístico.
  if (event.tracking?.eventId) return event.tracking.eventId;
  const name = target.eventNames[event.type];
  return `${event.orgKey}-${event.buKey}-${name}-${event.dedupBase}`;
}

export const metaCapiConnector: IntegrationConnector<MetaCapiTargetConfig> = {
  id: 'meta-capi',
  async deliver(event, target) {
    const pixelId = resolveSecret(target.pixelRef);
    const accessToken = resolveSecret(target.tokenRef);
    if (!pixelId || !accessToken) {
      console.warn('[integrations:meta-capi] credenciales ausentes — no-op', {
        pixelRef: target.pixelRef,
        tokenRef: target.tokenRef,
      });
      return; // no-op: el cron lo recupera cuando se configuren
    }

    const eventName = target.eventNames[event.type];
    const customData: Record<string, unknown> = {
      ...(target.contentIds ? { content_ids: target.contentIds } : {}),
      ...(target.contentName ? { content_name: target.contentName } : {}),
    };
    if (event.type === 'compra') {
      if (typeof event.value === 'number') customData.value = event.value;
      if (event.currency) customData.currency = event.currency;
      if (event.orderId) customData.order_id = event.orderId;
      customData.num_items = 1;
    }

    await sendMetaCapiEvent({
      eventName,
      eventId: eventIdFor(event, target),
      eventSourceUrl: target.eventSourceUrl,
      pixelId,
      accessToken,
      userData: buildMetaCapiUserData({
        email: event.email,
        phone: event.phone,
        firstName: event.firstName,
        lastName: event.lastName,
        country: event.country ?? target.defaultCountry,
        fbp: event.tracking?.fbp,
        fbc: event.tracking?.fbc,
        clientIpAddress: event.tracking?.clientIpAddress,
        clientUserAgent: event.tracking?.clientUserAgent,
      }),
      customData: Object.keys(customData).length > 0 ? customData : undefined,
    });
  },
};
