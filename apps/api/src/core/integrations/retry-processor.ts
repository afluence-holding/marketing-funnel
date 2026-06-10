/**
 * Procesa el outbox: reclama filas due (`pending`/`failed`) y reintenta cada una.
 * Lo corre el cron `integration-delivery-retry` cada minuto. Reconstruye el
 * IntegrationEvent desde el `payload` snapshot.
 */

import { connectorRegistry } from './connectors';
import { getIntegrationConfig } from './registry';
import {
  claimDueDeliveries,
  markDelivered,
  markFailure,
  type DeliveryRow,
} from './delivery-repository';
import {
  PermanentDeliveryError,
  type IntegrationEvent,
  type TargetConfig,
} from './types';

function rebuildEvent(row: DeliveryRow): IntegrationEvent {
  const p = row.payload as Record<string, unknown>;
  return {
    type: row.event_type,
    orgKey: row.org_key,
    buKey: row.bu_key,
    dedupBase: row.dedup_key.split(':').slice(1, -1).join(':'),
    email: p.email as string | undefined,
    phone: p.phone as string | undefined,
    firstName: p.firstName as string | undefined,
    lastName: p.lastName as string | undefined,
    name: p.name as string | undefined,
    country: p.country as string | undefined,
    cohortCode: p.cohortCode as string | undefined,
    tier: p.tier as number | undefined,
    value: p.value as number | undefined,
    currency: p.currency as string | undefined,
    orderId: p.orderId as string | undefined,
    source: p.source as string | undefined,
    utm: p.utm as Record<string, string> | undefined,
    tracking: p.tracking as IntegrationEvent['tracking'],
    registeredOn: p.registeredOn as string | undefined,
  };
}

function findTarget(row: DeliveryRow): TargetConfig | undefined {
  const cfg = getIntegrationConfig(row.org_key, row.bu_key);
  return cfg?.targets.find((t) => t.connector === row.connector);
}

export async function processIntegrationDeliveries(): Promise<void> {
  const rows = await claimDueDeliveries(50);
  if (rows.length === 0) return;

  await Promise.allSettled(
    rows.map(async (row) => {
      const target = findTarget(row);
      if (!target) {
        await markFailure(row.id, `config de ${row.connector} ya no existe`, { permanent: true });
        return;
      }
      const connector = connectorRegistry[row.connector];
      try {
        await connector.deliver(rebuildEvent(row), target);
        await markDelivered(row.id);
      } catch (error) {
        const permanent = error instanceof PermanentDeliveryError;
        await markFailure(row.id, error instanceof Error ? error.message : String(error), {
          permanent,
        });
      }
    }),
  );
}
