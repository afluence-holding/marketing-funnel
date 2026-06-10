import { Client } from 'pg';
import { env } from '@marketing-funnel/config';
import { getBusinessUnitBinding } from '../../orgs';

export type PurchaseRecord = {
  provider: 'whop' | 'hotmart';
  /** Provider payment/transaction id — durable idempotency key with provider. */
  externalId: string;
  productKey: string;
  orgKey: string;
  buKey: string;
  cohortCode: string;
  planOrOfferId?: string;
  /** Amount actually charged (major units) — snapshot, immune to catalog edits. */
  amount: number;
  currency: string;
  contentId?: string;
  email?: string;
  metadata?: Record<string, unknown>;
};

export type PersistPurchaseResult =
  /** Row inserted — first time we see this payment. Emit CAPI, then mark sent. */
  | { outcome: 'inserted' }
  /** Row existed. `capiSent: false` means a prior attempt persisted the row but
   * died before Meta confirmed — the retry must re-emit CAPI (same event_id,
   * Meta dedupes). `capiSent: true` means fully processed: skip. */
  | { outcome: 'duplicate'; capiSent: boolean }
  /** DB unavailable / table missing — caller falls back to in-memory dedup. */
  | { outcome: 'unavailable' };

/** The DB must never hang the webhook: fail fast and degrade to in-memory dedup. */
const DB_CONNECT_TIMEOUT_MS = 4_000;
const DB_QUERY_TIMEOUT_MS = 5_000;

function createClient(): Client {
  return new Client({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: DB_CONNECT_TIMEOUT_MS,
    query_timeout: DB_QUERY_TIMEOUT_MS,
  });
}

/**
 * Durable purchase persistence + idempotency (replaces the in-memory Set as
 * the primary dedup): INSERT .. ON CONFLICT (provider, external_id) DO NOTHING.
 * Concurrent retries race on the unique index — exactly one inserts.
 *
 * Never throws: a DB failure must NOT block the Purchase CAPI (the live funnel
 * comes first), so callers degrade to the in-memory guard.
 */
export async function persistPurchase(record: PurchaseRecord): Promise<PersistPurchaseResult> {
  const binding = getBusinessUnitBinding(record.orgKey, record.buKey);
  if (!binding) {
    console.warn('[purchases] no org binding for purchase — not persisted', {
      orgKey: record.orgKey,
      buKey: record.buKey,
      externalId: record.externalId,
    });
    return { outcome: 'unavailable' };
  }

  const client = createClient();

  try {
    await client.connect();
    const result = await client.query(
      `INSERT INTO marketing.purchases
         (organization_id, cohort_id, lead_id, product_key, cohort_code, provider,
          external_id, plan_or_offer_id, amount, currency, content_id, metadata)
       VALUES (
         $1,
         (SELECT c.id FROM marketing.cohorts c WHERE c.code = $3),
         (SELECT l.id FROM marketing.leads l
           WHERE l.organization_id = $1 AND $10 <> '' AND lower(l.email) = lower($10)
           ORDER BY l.created_at ASC LIMIT 1),
         $2, $3, $4, $5, $6, $7, $8, $9, $11::jsonb
       )
       ON CONFLICT (provider, external_id) DO NOTHING
       RETURNING id`,
      [
        binding.organizationId, // $1
        record.productKey, // $2
        record.cohortCode, // $3
        record.provider, // $4
        record.externalId, // $5
        record.planOrOfferId ?? null, // $6
        record.amount, // $7
        record.currency, // $8
        record.contentId ?? null, // $9
        record.email ?? '', // $10
        JSON.stringify({ ...record.metadata, email: record.email ?? null, bu_key: record.buKey }), // $11
      ],
    );
    if (result.rowCount === 1) return { outcome: 'inserted' };

    const existing = await client.query(
      `SELECT capi_sent_at FROM marketing.purchases
        WHERE provider = $1 AND external_id = $2`,
      [record.provider, record.externalId],
    );
    const capiSent = Boolean(existing.rows[0]?.capi_sent_at);
    return { outcome: 'duplicate', capiSent };
  } catch (error) {
    console.warn('[purchases] persist failed — falling back to in-memory dedup', {
      externalId: record.externalId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { outcome: 'unavailable' };
  } finally {
    void client.end().catch(() => {});
  }
}

/**
 * Mark a purchase as refunded/charged-back/canceled (provider status events
 * UPDATE the existing row — never a new insert). Returns whether a row matched
 * so the caller can log refunds for unknown purchases. Never throws.
 */
export async function updatePurchaseStatus(
  provider: PurchaseRecord['provider'],
  externalId: string,
  status: 'refunded' | 'chargeback' | 'canceled',
): Promise<{ updated: boolean }> {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query(
      `UPDATE marketing.purchases
          SET status = $3, refunded_at = COALESCE(refunded_at, now())
        WHERE provider = $1 AND external_id = $2`,
      [provider, externalId, status],
    );
    return { updated: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.warn('[purchases] status update failed', {
      externalId,
      status,
      error: error instanceof Error ? error.message : String(error),
    });
    return { updated: false };
  } finally {
    void client.end().catch(() => {});
  }
}

/** Stamp that Meta accepted the Purchase CAPI for this payment. Best-effort:
 * a missed stamp only causes a redundant re-send (same event_id → deduped). */
export async function markPurchaseCapiSent(
  provider: PurchaseRecord['provider'],
  externalId: string,
): Promise<void> {
  const client = createClient();
  try {
    await client.connect();
    await client.query(
      `UPDATE marketing.purchases SET capi_sent_at = now()
        WHERE provider = $1 AND external_id = $2 AND capi_sent_at IS NULL`,
      [provider, externalId],
    );
  } catch (error) {
    console.warn('[purchases] capi_sent stamp failed (harmless — retry re-dedupes)', {
      externalId,
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    void client.end().catch(() => {});
  }
}
