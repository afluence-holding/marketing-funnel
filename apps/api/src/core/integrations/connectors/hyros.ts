/**
 * Connector Hyros — SCAFFOLD. El endpoint/schema exacto es [CONFIRM] (depende
 * del panel del creador). Guard: sin `HYROS_API_KEY_*` o sin endpoint configurado
 * (`HYROS_ENDPOINT_*` análogo), hace no-op (no lanza) → el cron lo recupera
 * cuando se complete el contrato. Cuando se confirme el endpoint, se rellena el
 * `fetch` con el schema real (lead vs purchase).
 */

import { resolveSecret } from '../secrets';
import {
  type IntegrationConnector,
  type HyrosTargetConfig,
  type IntegrationEvent,
} from '../types';

/** El endpoint vive en un env paralelo al token (p.ej. HYROS_ENDPOINT_GERMAN_ROZ). */
function endpointRef(secretRef: string): string {
  return secretRef.replace(/^HYROS_API_KEY/, 'HYROS_ENDPOINT');
}

export const hyrosConnector: IntegrationConnector<HyrosTargetConfig> = {
  id: 'hyros',
  async deliver(event: IntegrationEvent, target) {
    const apiKey = resolveSecret(target.secretRef);
    const endpoint = resolveSecret(endpointRef(target.secretRef));
    if (!apiKey || !endpoint) {
      console.warn('[integrations:hyros] API key/endpoint ausente ([CONFIRM]) — no-op', {
        secretRef: target.secretRef,
        eventType: event.type,
      });
      return; // no-op hasta confirmar el contrato del panel del creador
    }

    // [CONFIRM] schema real de Hyros (lead vs order). Estructura conservadora:
    const body =
      event.type === 'compra'
        ? {
            email: event.email,
            order_id: event.orderId,
            value: event.value,
            currency: event.currency,
          }
        : { email: event.email, source: event.source };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`hyros ${res.status}: ${text.slice(0, 300)}`);
    }
  },
};
