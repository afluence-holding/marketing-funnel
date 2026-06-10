import crypto from 'crypto';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';
import { resolveHotmartPurchaseProduct } from './whop-products';
import {
  markPurchaseCapiSent,
  persistPurchase,
  updatePurchaseStatus,
} from './purchase-persistence.service';
import { hasCapiCredentials, sendWhopPurchaseCapi } from './whop-purchase.service';

/**
 * Hotmart webhook (Postback v2.0.0) — Fase 3 (producción).
 *
 * Contrato validado por el spike (compra real HP0999901990 + suite de eventos
 * del panel, payloads en marketing.hotmart_webhook_events):
 *
 * - `PURCHASE_APPROVED`/`PURCHASE_COMPLETE` → resolver cohort por `offer.code`
 *   (catálogo) → persistir en marketing.purchases (idempotencia durable
 *   UNIQUE(provider, external_id) + capi_sent_at) → Meta CAPI Purchase con
 *   `event_id` = `origin.sck` (la web manda ahí su purchaseEventId, validado
 *   round-trip). Purchase es CAPI-only: el embed no redirige post-compra, así
 *   que no hay pixel que dedupear (el sck queda como dedup si eso cambia).
 * - `PURCHASE_REFUNDED`/`CHARGEBACK`/`CANCELED` → UPDATE de status en la fila
 *   existente (nunca INSERT) + log para el equipo.
 * - Todo evento se captura crudo en hotmart_webhook_events (auditoría).
 * - La entrega de acceso NO es de este webhook (sistema independiente).
 */

const DB_CONNECT_TIMEOUT_MS = 4_000;
const DB_QUERY_TIMEOUT_MS = 5_000;

export class HotmartWebhookError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = 'HotmartWebhookError';
  }
}

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Validate the account hottok (simple shared token, per Hotmart docs §5.2). */
export function verifyHotmartHottok(
  headers: Record<string, string | string[] | undefined>,
): void {
  const expected = process.env.HOTMART_HOTTOK_GERMAN_ROZ?.trim();
  if (!expected) {
    throw new HotmartWebhookError('HOTMART_HOTTOK_GERMAN_ROZ is not configured', 503);
  }
  const provided = headerValue(headers, 'x-hotmart-hottok')?.trim();
  if (!provided) {
    throw new HotmartWebhookError('Missing X-HOTMART-HOTTOK header', 401);
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new HotmartWebhookError('Invalid X-HOTMART-HOTTOK token', 401);
  }
}

function readPath(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function asString(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PURCHASE_EVENTS = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']);
const STATUS_EVENTS: Record<string, 'refunded' | 'chargeback' | 'canceled'> = {
  PURCHASE_REFUNDED: 'refunded',
  PURCHASE_CHARGEBACK: 'chargeback',
  PURCHASE_CANCELED: 'canceled',
};

function asNumber(v: unknown): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function captureRawEvent(
  event: string | null,
  transactionId: string | null,
  offerCode: string | null,
  body: unknown,
): Promise<void> {
  // Best effort: a DB failure must never make Hotmart retry-storm us.
  const client = new Client({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: DB_CONNECT_TIMEOUT_MS,
    query_timeout: DB_QUERY_TIMEOUT_MS,
  });
  try {
    await client.connect();
    await client.query(
      `INSERT INTO marketing.hotmart_webhook_events (event, transaction_id, offer_code, payload)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [event, transactionId, offerCode, JSON.stringify(body ?? {})],
    );
  } catch (error) {
    console.warn('[hotmart-webhook] raw capture failed (event still acked)', {
      transactionId,
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    void client.end().catch(() => {});
  }
}

export async function handleHotmartWebhookEvent(
  body: unknown,
  headers: Record<string, string | string[] | undefined>,
): Promise<{ received: boolean; event: string | null; transactionId: string | null }> {
  verifyHotmartHottok(headers);

  const event = asString(readPath(body, ['event']));
  const transactionId = asString(readPath(body, ['data', 'purchase', 'transaction']));
  const offerCode = asString(readPath(body, ['data', 'purchase', 'offer', 'code']));

  await captureRawEvent(event, transactionId, offerCode, body);

  // ── Refund / chargeback / cancel: UPDATE de la fila existente ────────────
  const statusFor = event ? STATUS_EVENTS[event] : undefined;
  if (statusFor && transactionId) {
    const { updated } = await updatePurchaseStatus('hotmart', transactionId, statusFor);
    // Aviso operativo: el sistema de entrega independiente y el equipo deben
    // enterarse (el retiro del acceso es manual/externo a este repo).
    console.warn('[hotmart-webhook] purchase status event', {
      event,
      transactionId,
      status: statusFor,
      purchaseRowUpdated: updated,
    });
    return { received: true, event, transactionId };
  }

  // ── Compra aprobada/completa: persistir + CAPI ───────────────────────────
  if (!event || !PURCHASE_EVENTS.has(event) || !transactionId) {
    return { received: true, event, transactionId };
  }

  const resolved = resolveHotmartPurchaseProduct(offerCode ?? undefined);
  if (!resolved) {
    console.info('[hotmart-webhook] purchase ignored (offer not in catalog)', {
      transactionId,
      offerCode,
    });
    return { received: true, event, transactionId };
  }
  const { product, price } = resolved;

  const sck = asString(readPath(body, ['data', 'purchase', 'origin', 'sck']));
  const src = asString(readPath(body, ['data', 'purchase', 'origin', 'src']));
  const xcod = asString(readPath(body, ['data', 'purchase', 'origin', 'xcod']));
  // event_id: el purchaseEventId que la web puso en sck (round-trip validado);
  // fallback determinístico por transaction (retries de Hotmart → mismo id).
  const eventId =
    sck && UUID_RE.test(sck) ? sck : `${product.productKey}-purchase.${transactionId}`;

  // Si full_price falta, el fallback es el precio ancla del tier — y entonces
  // la moneda DEBE ser la del producto (mezclar "67" con "PEN" sería falso).
  const paidAmount = asNumber(readPath(body, ['data', 'purchase', 'full_price', 'value']));
  const paidCurrency = asString(
    readPath(body, ['data', 'purchase', 'full_price', 'currency_value']),
  );
  const amount = paidAmount ?? price;
  const currency = (paidAmount !== null && paidCurrency ? paidCurrency : product.currency).toUpperCase();
  const email = asString(readPath(body, ['data', 'buyer', 'email'])) ?? undefined;
  const firstName = asString(readPath(body, ['data', 'buyer', 'first_name'])) ?? undefined;
  const lastName = asString(readPath(body, ['data', 'buyer', 'last_name'])) ?? undefined;
  const buyerCountryIso = asString(
    readPath(body, ['data', 'buyer', 'address', 'country_iso']),
  );

  const persisted = await persistPurchase({
    provider: 'hotmart',
    externalId: transactionId,
    productKey: product.productKey,
    orgKey: product.orgKey,
    buKey: product.buKey,
    cohortCode: product.cohortCode,
    planOrOfferId: offerCode ?? undefined,
    amount,
    currency,
    contentId: product.contentIds[0],
    email,
    metadata: {
      event_id: eventId,
      event,
      src,
      xcod,
      sck,
      amount_usd: price, // snapshot del tier ancla USD (reporting normalizado)
      buyer_country: buyerCountryIso,
    },
  });
  if (persisted.outcome === 'duplicate' && persisted.capiSent) {
    console.info('[hotmart-webhook] duplicate purchase (durable dedup) skipped', {
      transactionId,
      cohortCode: product.cohortCode,
    });
    return { received: true, event, transactionId };
  }

  // CAPI-only (no hay pixel de respaldo): si faltan credenciales Meta, NO se
  // estampa capi_sent_at — el retry de Hotmart re-emitirá cuando se configuren,
  // en vez de perder el 100% de las conversiones en silencio.
  const capiConfigured = hasCapiCredentials(product);
  if (!capiConfigured) {
    console.error('[hotmart-webhook] Meta CAPI credentials MISSING — purchase persisted, CAPI pending', {
      transactionId,
      pixelEnv: product.pixelEnv,
      tokenEnv: product.tokenEnv,
    });
    return { received: true, event, transactionId };
  }

  const buyerPhone = asString(readPath(body, ['data', 'buyer', 'checkout_phone']));
  await sendWhopPurchaseCapi({
    product,
    eventId,
    orderId: transactionId,
    email,
    firstName,
    lastName,
    phone: buyerPhone ?? undefined,
    value: amount,
    currency,
    buyerCountry: buyerCountryIso?.toLowerCase(),
    sourceSuffix: '-hotmart-webhook',
  });

  if (persisted.outcome !== 'unavailable') {
    await markPurchaseCapiSent('hotmart', transactionId);
  }

  console.info('[hotmart-webhook] Purchase CAPI sent', {
    transactionId,
    productKey: product.productKey,
    cohortCode: product.cohortCode,
    offerCode,
    eventId,
    eventIdSource: sck && UUID_RE.test(sck) ? 'sck' : 'deterministic',
    value: amount,
    currency,
    amountUsd: price,
    buyerCountryIso,
    hasEmail: Boolean(email),
  });

  return { received: true, event, transactionId };
}
