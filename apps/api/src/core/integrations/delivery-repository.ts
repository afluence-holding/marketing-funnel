/**
 * Outbox de entregas (`marketing.integration_deliveries`). Mismo estilo que
 * `purchase-persistence.service.ts`: `pg.Client` por operación, timeouts cortos,
 * NUNCA lanza hacia el webhook (degrada). Idempotencia por UNIQUE(connector,
 * dedup_key); first-payload-wins (ON CONFLICT DO NOTHING).
 */

import { Client } from 'pg';
import { env } from '@marketing-funnel/config';
import type { ConnectorId, IntegrationEventType } from './types';

const DB_CONNECT_TIMEOUT_MS = 4_000;
const DB_QUERY_TIMEOUT_MS = 5_000;

/** Ventana de gracia: el cron no toma una fila recién insertada mientras el
 * intento inline la está procesando. */
export const INLINE_GRACE_MS = 60_000;

function createClient(): Client {
  return new Client({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: DB_CONNECT_TIMEOUT_MS,
    query_timeout: DB_QUERY_TIMEOUT_MS,
  });
}

export interface DeliveryRow {
  id: string;
  org_key: string;
  bu_key: string;
  connector: ConnectorId;
  event_type: IntegrationEventType;
  dedup_key: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed' | 'dead';
  attempts: number;
  max_attempts: number;
}

export interface EnqueueInput {
  orgKey: string;
  buKey: string;
  connector: ConnectorId;
  eventType: IntegrationEventType;
  dedupKey: string;
  payload: Record<string, unknown>;
}

export interface EnqueueResult {
  /** id de la fila (nueva o existente) si se pudo resolver. */
  id: string | null;
  /** true si esta llamada insertó la fila (primera vez). */
  inserted: boolean;
  /** true si la DB no estuvo disponible (degradación). */
  unavailable: boolean;
}

/**
 * Inserta una fila pending (o no-op si ya existe). `next_attempt_at` arranca con
 * una ventana de gracia para que el cron no curse la fila mientras el inline va.
 * Nunca lanza.
 */
export async function enqueueDelivery(input: EnqueueInput): Promise<EnqueueResult> {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query(
      `INSERT INTO marketing.integration_deliveries
         (org_key, bu_key, connector, event_type, dedup_key, payload, next_attempt_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, now() + ($7 || ' milliseconds')::interval)
       ON CONFLICT (connector, dedup_key) DO NOTHING
       RETURNING id`,
      [
        input.orgKey,
        input.buKey,
        input.connector,
        input.eventType,
        input.dedupKey,
        JSON.stringify(input.payload),
        String(INLINE_GRACE_MS),
      ],
    );
    if ((result.rowCount ?? 0) === 1) {
      return { id: result.rows[0].id as string, inserted: true, unavailable: false };
    }
    // Ya existía (first-payload-wins): recupero su id.
    const existing = await client.query(
      `SELECT id FROM marketing.integration_deliveries WHERE connector = $1 AND dedup_key = $2`,
      [input.connector, input.dedupKey],
    );
    return {
      id: (existing.rows[0]?.id as string) ?? null,
      inserted: false,
      unavailable: false,
    };
  } catch (error) {
    console.warn('[integrations] enqueue failed (degraded)', {
      connector: input.connector,
      dedupKey: input.dedupKey,
      error: error instanceof Error ? error.message : String(error),
    });
    return { id: null, inserted: false, unavailable: true };
  } finally {
    void client.end().catch(() => {});
  }
}

/** Marca una entrega como delivered. Best-effort. */
export async function markDelivered(id: string): Promise<void> {
  await runUpdate(
    `UPDATE marketing.integration_deliveries
        SET status='delivered', delivered_at=now(), updated_at=now()
      WHERE id=$1`,
    [id],
  );
}

/**
 * Marca un fallo. Reintentable → status='failed' + backoff exponencial;
 * permanente → status='dead'. Best-effort.
 */
export async function markFailure(
  id: string,
  errorMessage: string,
  opts: { permanent: boolean } = { permanent: false },
): Promise<void> {
  if (opts.permanent) {
    await runUpdate(
      `UPDATE marketing.integration_deliveries
          SET status='dead', attempts=attempts+1, last_error=$2, updated_at=now()
        WHERE id=$1`,
      [id, errorMessage.slice(0, 2000)],
    );
    return;
  }
  // Backoff exponencial: 2^attempts minutos, cap 60m. A max_attempts → dead.
  await runUpdate(
    `UPDATE marketing.integration_deliveries
        SET attempts = attempts + 1,
            last_error = $2,
            status = CASE WHEN attempts + 1 >= max_attempts THEN 'dead' ELSE 'failed' END,
            next_attempt_at = now() + (LEAST(power(2, attempts)::int, 60) || ' minutes')::interval,
            updated_at = now()
      WHERE id=$1`,
    [id, errorMessage.slice(0, 2000)],
  );
}

/** Lease que se aplica al reclamar una fila: si el run muere, se reintenta tras esto. */
const CLAIM_LEASE_MINUTES = 5;

/**
 * Reclama atómicamente hasta `limit` filas due (`pending`/`failed`,
 * `next_attempt_at<=now()`) para reintentar. Hace un UPDATE..RETURNING que
 * **arrastra `next_attempt_at` al futuro (lease)** en la misma sentencia, así un
 * tick solapado del cron (o una 2ª instancia) NO re-reclama las mismas filas —
 * el `SKIP LOCKED` por sí solo no bastaba porque el lock se suelta al cerrar la
 * conexión. Si el run procesa OK → markDelivered; si falla → markFailure pone el
 * backoff real; si el proceso muere → el lease vence y la fila reintenta.
 */
export async function claimDueDeliveries(limit = 50): Promise<DeliveryRow[]> {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query(
      `UPDATE marketing.integration_deliveries d
          SET next_attempt_at = now() + ($2 || ' minutes')::interval, updated_at = now()
        WHERE d.id IN (
          SELECT id FROM marketing.integration_deliveries
           WHERE status IN ('pending','failed') AND next_attempt_at <= now()
           ORDER BY next_attempt_at ASC
           LIMIT $1
           FOR UPDATE SKIP LOCKED
        )
        RETURNING d.id, d.org_key, d.bu_key, d.connector, d.event_type, d.dedup_key,
                  d.payload, d.status, d.attempts, d.max_attempts`,
      [limit, String(CLAIM_LEASE_MINUTES)],
    );
    return result.rows as DeliveryRow[];
  } catch (error) {
    console.warn('[integrations] claimDue failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  } finally {
    void client.end().catch(() => {});
  }
}

/** Purga filas `delivered` más viejas que `days` (retención de PII). */
export async function purgeDeliveredOlderThan(days: number): Promise<number> {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query(
      `DELETE FROM marketing.integration_deliveries
        WHERE status='delivered' AND delivered_at < now() - ($1 || ' days')::interval`,
      [String(days)],
    );
    return result.rowCount ?? 0;
  } catch (error) {
    console.warn('[integrations] purge failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  } finally {
    void client.end().catch(() => {});
  }
}

async function runUpdate(sql: string, params: unknown[]): Promise<void> {
  const client = createClient();
  try {
    await client.connect();
    await client.query(sql, params);
  } catch (error) {
    console.warn('[integrations] delivery update failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    void client.end().catch(() => {});
  }
}
