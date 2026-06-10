import crypto from 'crypto';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

/**
 * Hotmart webhook (Postback v2.0.0) — SPIKE Fase 0.
 *
 * Alcance actual: validar `X-HOTMART-HOTTOK` y CAPTURAR el payload crudo en
 * `marketing.hotmart_webhook_events` para verificar el contrato real
 * (transaction, offer.code, full_price, origin.{src,sck,xcod}) contra el brief.
 *
 * NO hace todavía (Fase 3): idempotencia de negocio, persistApurchase, CAPI,
 * manejo de refunds. La entrega de acceso NUNCA será de este webhook (decisión
 * de Negocio: la hace un sistema independiente).
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

export async function handleHotmartWebhookEvent(
  body: unknown,
  headers: Record<string, string | string[] | undefined>,
): Promise<{ received: boolean; event: string | null; transactionId: string | null }> {
  verifyHotmartHottok(headers);

  const event = asString(readPath(body, ['event']));
  const transactionId = asString(readPath(body, ['data', 'purchase', 'transaction']));
  const offerCode = asString(readPath(body, ['data', 'purchase', 'offer', 'code']));

  console.info('[hotmart-webhook] event received', {
    event,
    transactionId,
    offerCode,
    sck: asString(readPath(body, ['data', 'purchase', 'origin', 'sck'])),
    src: asString(readPath(body, ['data', 'purchase', 'origin', 'src'])),
    xcod: asString(readPath(body, ['data', 'purchase', 'origin', 'xcod'])),
    priceValue: readPath(body, ['data', 'purchase', 'full_price', 'value']),
    priceCurrency: readPath(body, ['data', 'purchase', 'full_price', 'currency_value']),
  });

  // Raw capture — best effort: a DB failure must never make Hotmart retry-storm us.
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

  return { received: true, event, transactionId };
}
