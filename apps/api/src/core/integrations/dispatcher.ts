/**
 * Dispatcher de fan-out. Punto único de entrada: ante un IntegrationEvent
 * resuelve los destinos habilitados del creador, escribe una fila por destino en
 * el outbox (idempotente), e intenta entrega inline best-effort. NUNCA lanza
 * hacia el webhook/ingesta (degrada como `purchase-persistence`). La durabilidad
 * la da el outbox + el cron de reintentos, no este intento inline.
 */

import { getIntegrationConfig } from './registry';
import { connectorRegistry } from './connectors';
import {
  enqueueDelivery,
  markDelivered,
  markFailure,
} from './delivery-repository';
import { PermanentDeliveryError, type IntegrationEvent, type TargetConfig } from './types';

function dedupKey(event: IntegrationEvent, connector: string): string {
  return `${event.type}:${event.dedupBase}:${connector}`;
}

/** Snapshot del evento que se guarda en `payload` (incluye tracking para CAPI). */
function payloadSnapshot(event: IntegrationEvent): Record<string, unknown> {
  return {
    email: event.email,
    phone: event.phone,
    firstName: event.firstName,
    lastName: event.lastName,
    name: event.name,
    country: event.country,
    cohortCode: event.cohortCode,
    tier: event.tier,
    value: event.value,
    currency: event.currency,
    orderId: event.orderId,
    source: event.source,
    utm: event.utm,
    tracking: event.tracking,
    registeredOn: event.registeredOn,
  };
}

function targetsFor(event: IntegrationEvent): TargetConfig[] {
  const cfg = getIntegrationConfig(event.orgKey, event.buKey);
  if (!cfg) return [];
  return cfg.targets.filter((t) => t.enabledFor.includes(event.type));
}

/** Entrega un evento ya enrolado a un destino. Marca delivered/failed/dead. */
async function attemptDelivery(
  rowId: string,
  event: IntegrationEvent,
  target: TargetConfig,
): Promise<void> {
  const connector = connectorRegistry[target.connector];
  try {
    await connector.deliver(event, target);
    await markDelivered(rowId);
  } catch (error) {
    const permanent = error instanceof PermanentDeliveryError;
    const msg = error instanceof Error ? error.message : String(error);
    await markFailure(rowId, msg, { permanent });
    console.warn('[integrations] inline delivery failed', {
      connector: target.connector,
      orgKey: event.orgKey,
      buKey: event.buKey,
      dedupBase: event.dedupBase,
      permanent,
      error: msg,
    });
  }
}

/**
 * Reparte un evento a los destinos del creador. Encola en el outbox y dispara los
 * intentos inline en paralelo (aislados: un destino caído no afecta a otros).
 * No bloquea más allá del intento inline (timeouts cortos por connector).
 */
export async function dispatchIntegrationEvent(event: IntegrationEvent): Promise<void> {
  const targets = targetsFor(event);
  if (targets.length === 0) return; // creador sin integraciones para este evento

  const snapshot = payloadSnapshot(event);

  await Promise.allSettled(
    targets.map(async (target) => {
      const enq = await enqueueDelivery({
        orgKey: event.orgKey,
        buKey: event.buKey,
        connector: target.connector,
        eventType: event.type,
        dedupKey: dedupKey(event, target.connector),
        payload: snapshot,
      });
      // Solo intenta inline si ESTA llamada insertó la fila (primera vez) —
      // un reenvío del webhook no re-entrega (idempotencia). Si la DB no estuvo
      // disponible, no hay fila durable → no intentamos inline (lo correcto es
      // no entregar sin registro; el webhook degrada).
      if (enq.inserted && enq.id) {
        await attemptDelivery(enq.id, event, target);
      }
    }),
  );
}
