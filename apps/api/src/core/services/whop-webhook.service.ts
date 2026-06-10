import crypto from 'crypto';
import { z } from 'zod';
import {
  resolveLucasRetoPurchaseValue,
  sendLucasRetoPurchaseCapi,
} from './lucas-reto-purchase.service';
import { LUCAS_CAPI } from '../../orgs/lucas-con-lucas/main/tracking';
import {
  resolveWhopPurchaseProduct,
  resolveWhopPurchaseProductByCohort,
} from './whop-products';
import {
  resolveWhopPurchaseValue,
  sendWhopPurchaseCapi,
} from './whop-purchase.service';
import { markPurchaseCapiSent, persistPurchase } from './purchase-persistence.service';
import { dispatchIntegrationEvent } from '../integrations/dispatcher';

const LUCAS_RETO_SOURCE = 'landing-lucas-con-lucas-reto';
const DEFAULT_LUCAS_RETO_PLAN_ID = 'plan_aKOjfecUWLzFo';

const whopEnvelopeSchema = z.object({
  type: z.string(),
  data: z.unknown(),
});

const whopPaymentSchema = z
  .object({
    id: z.string().min(1),
    plan_id: z.string().optional(),
    plan: z.object({ id: z.string() }).optional(),
    amount: z.union([z.number(), z.string()]).optional(),
    total: z.union([z.number(), z.string()]).optional(),
    subtotal: z.union([z.number(), z.string()]).optional(),
    currency: z.string().optional(),
    email: z.string().email().optional(),
    user: z
      .object({
        email: z.string().email().optional(),
        name: z.string().optional(),
      })
      .optional(),
    member: z
      .object({
        email: z.string().email().optional(),
      })
      .optional(),
    customer: z
      .object({
        email: z.string().email().optional(),
      })
      .optional(),
    billing: z
      .object({
        name: z.string().optional(),
      })
      .optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

/** In-process dedup for Whop at-least-once delivery (Meta also dedupes by event_id). */
const processedPaymentIds = new Set<string>();
const MAX_PROCESSED = 10_000;

export class WhopWebhookError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = 'WhopWebhookError';
  }
}

function getLucasRetoPlanIds(): Set<string> {
  const raw = process.env.WHOP_LUCAS_RETO_PLAN_IDS ?? DEFAULT_LUCAS_RETO_PLAN_ID;
  return new Set(
    raw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

function getWebhookSecret(): string {
  const secret = process.env.WHOP_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new WhopWebhookError('WHOP_WEBHOOK_SECRET is not configured', 503);
  }
  return secret;
}

/**
 * Standard Webhooks verification (Whop spec).
 * @see https://docs.whop.com/developer/guides/webhooks
 */
export function verifyWhopWebhookSignature(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>,
): void {
  const webhookId = headerValue(headers, 'webhook-id');
  const webhookTimestamp = headerValue(headers, 'webhook-timestamp');
  const webhookSignature = headerValue(headers, 'webhook-signature');

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    throw new WhopWebhookError('Missing Standard Webhooks headers', 401);
  }

  const timestamp = Number(webhookTimestamp);
  if (!Number.isFinite(timestamp)) {
    throw new WhopWebhookError('Invalid webhook timestamp', 401);
  }

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (ageSeconds > 300) {
    throw new WhopWebhookError('Webhook timestamp outside tolerance window', 401);
  }

  const secret = getWebhookSecret();
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const key = decodeWhopWebhookSecret(secret);
  const expected = crypto.createHmac('sha256', key).update(signedContent).digest('base64');

  const signatures = webhookSignature.split(' ');
  const valid = signatures.some((entry) => {
    const [version, provided] = entry.split(',');
    if (version !== 'v1' || !provided) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
    } catch {
      return false;
    }
  });

  if (!valid) {
    throw new WhopWebhookError('Invalid webhook signature', 401);
  }
}

function decodeWhopWebhookSecret(secret: string): Buffer {
  // Whop SDK passes btoa(plainSecret) into Standard Webhooks, which decodes to UTF-8 bytes.
  return Buffer.from(secret, 'utf8');
}

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function extractEmail(data: z.infer<typeof whopPaymentSchema>): string | undefined {
  return (
    data.email ??
    data.user?.email ??
    data.member?.email ??
    data.customer?.email
  );
}

function extractName(data: z.infer<typeof whopPaymentSchema>): string | undefined {
  return data.billing?.name ?? data.user?.name;
}

function splitName(fullName?: string): { firstName?: string; lastName?: string } {
  if (!fullName) return {};
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function extractPlanId(data: z.infer<typeof whopPaymentSchema>): string | undefined {
  return data.plan_id ?? data.plan?.id;
}

function extractAmount(data: z.infer<typeof whopPaymentSchema>): unknown {
  return data.amount ?? data.total ?? data.subtotal;
}

function rememberProcessedPayment(paymentId: string): boolean {
  if (processedPaymentIds.has(paymentId)) return false;
  processedPaymentIds.add(paymentId);
  if (processedPaymentIds.size > MAX_PROCESSED) {
    processedPaymentIds.clear();
    processedPaymentIds.add(paymentId);
  }
  return true;
}

export async function handleWhopWebhookEvent(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>,
): Promise<{ handled: boolean; type?: string; paymentId?: string }> {
  verifyWhopWebhookSignature(rawBody, headers);

  let envelope: z.infer<typeof whopEnvelopeSchema>;
  try {
    envelope = whopEnvelopeSchema.parse(JSON.parse(rawBody));
  } catch {
    throw new WhopWebhookError('Invalid webhook JSON payload', 400);
  }

  if (envelope.type !== 'payment.succeeded') {
    return { handled: false, type: envelope.type };
  }

  let payment: z.infer<typeof whopPaymentSchema>;
  try {
    payment = whopPaymentSchema.parse(envelope.data);
  } catch (err) {
    console.error('[whop-webhook] payment.succeeded parse failed', err);
    throw new WhopWebhookError('Unrecognized payment.succeeded payload', 400);
  }

  const planId = extractPlanId(payment);
  const lucasPlans = getLucasRetoPlanIds();
  const isLucasPlan = Boolean(planId && lucasPlans.has(planId));
  const genericProduct = isLucasPlan ? null : resolveWhopPurchaseProduct(planId);

  if (!isLucasPlan && !genericProduct) {
    console.info('[whop-webhook] payment.succeeded ignored (plan not tracked)', {
      paymentId: payment.id,
      planId,
    });
    return { handled: false, type: envelope.type, paymentId: payment.id };
  }

  if (!rememberProcessedPayment(payment.id)) {
    console.info('[whop-webhook] duplicate payment.succeeded skipped', {
      paymentId: payment.id,
    });
    return { handled: true, type: envelope.type, paymentId: payment.id };
  }

  const metadata = payment.metadata ?? {};
  const metaEventId = readString(metadata.meta_event_id);
  const metaFbp = readString(metadata.fbp);
  const metaFbc = readString(metadata.fbc);
  const email = extractEmail(payment);
  const { firstName, lastName } = splitName(extractName(payment));

  // ── Lucas reto: dedicated path (unchanged) ──────────────────────────────
  if (isLucasPlan) {
    const eventId = metaEventId ?? `lucas-reto-purchase.${payment.id}`;
    const currency = (payment.currency ?? LUCAS_CAPI.currency).toUpperCase();
    const value = resolveLucasRetoPurchaseValue(extractAmount(payment), currency);

    await sendLucasRetoPurchaseCapi({
      eventId,
      orderId: payment.id,
      email,
      firstName,
      lastName,
      value,
      currency,
      fbp: metaFbp,
      fbc: metaFbc,
      source: `${LUCAS_RETO_SOURCE}-whop-webhook`,
    });

    console.info('[whop-webhook] Lucas reto Purchase CAPI sent', {
      paymentId: payment.id,
      planId,
      eventId,
      value,
      currency,
      hasEmail: Boolean(email),
    });

    return { handled: true, type: envelope.type, paymentId: payment.id };
  }

  // ── Generic catalog products (German DI21, etc.) ────────────────────────
  // Cohort attribution priority: 1) session metadata cohort_code, 2) the
  // cohort that owns the plan id, 3) payment date. The plan-derived price is
  // always the value fallback (it is what was actually charged).
  const planResolved = genericProduct!;
  let product = planResolved.product;
  let cohortResolutionSource: 'metadata' | 'plan_id' = 'plan_id';

  const metadataCohortCode = readString(metadata.cohort_code);
  if (metadataCohortCode && metadataCohortCode !== product.cohortCode) {
    const byCohort = resolveWhopPurchaseProductByCohort(
      product.productKey,
      metadataCohortCode,
    );
    if (byCohort && byCohort.cohortCode === metadataCohortCode) {
      product = byCohort;
      cohortResolutionSource = 'metadata';
    } else {
      console.warn('[whop-webhook] metadata cohort_code not in catalog — using plan cohort', {
        paymentId: payment.id,
        metadataCohortCode,
        planCohortCode: planResolved.product.cohortCode,
      });
    }
  } else if (metadataCohortCode) {
    cohortResolutionSource = 'metadata';
  }

  const eventId = metaEventId ?? `${product.productKey}-purchase.${payment.id}`;
  const currency = (payment.currency ?? product.currency).toUpperCase();
  const value = resolveWhopPurchaseValue(extractAmount(payment), planResolved.price);

  // Durable idempotency + purchase record. INSERT wins exactly once across
  // retries/restarts. A duplicate is only skipped when its CAPI was CONFIRMED
  // sent (capi_sent_at) — a crash between insert and send re-emits on retry
  // with the same deterministic event_id (Meta dedupes). 'unavailable' (DB
  // down / table missing) degrades to the in-memory Set that already gated
  // above — the CAPI emission is never blocked by the DB.
  const persisted = await persistPurchase({
    provider: 'whop',
    externalId: payment.id,
    productKey: product.productKey,
    orgKey: product.orgKey,
    buKey: product.buKey,
    cohortCode: product.cohortCode,
    planOrOfferId: planId,
    amount: value,
    currency,
    contentId: product.contentIds[0],
    email,
    metadata: { event_id: eventId, cohort_resolution: cohortResolutionSource },
  });
  if (persisted.outcome === 'duplicate' && persisted.capiSent) {
    console.info('[whop-webhook] duplicate payment (durable dedup) skipped', {
      paymentId: payment.id,
      cohortCode: product.cohortCode,
    });
    return { handled: true, type: envelope.type, paymentId: payment.id };
  }

  try {
    await sendWhopPurchaseCapi({
      product,
      eventId,
      orderId: payment.id,
      email,
      firstName,
      lastName,
      value,
      currency,
      fbp: metaFbp,
      fbc: metaFbc,
    });
  } catch (error) {
    // Free the in-memory guard so Whop's retry can re-attempt the send — the
    // durable row stays capi_sent_at NULL, so the retry re-emits with the
    // same deterministic event_id (Meta dedupes if this send half-landed).
    processedPaymentIds.delete(payment.id);
    throw error;
  }

  if (persisted.outcome !== 'unavailable') {
    await markPurchaseCapiSent('whop', payment.id);
  }

  // --- Fan-out de integraciones (compra) — imperativo, no bloquea. MailerLite
  // (compradores + supresión + tier) + Hyros. Meta CAPI NO va por acá para
  // German (ya se disparó arriba) para no doble-contar. ---
  void dispatchIntegrationEvent({
    type: 'compra',
    orgKey: product.orgKey,
    buKey: product.buKey,
    dedupBase: `whop:${payment.id}`,
    email,
    firstName,
    lastName,
    cohortCode: product.cohortCode,
    tier: planResolved.price,
    value,
    currency,
    orderId: payment.id,
    occurredAt: new Date(),
  }).catch((error) => {
    console.warn('[integrations] dispatch compra failed (non-blocking)', {
      paymentId: payment.id,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  console.info('[whop-webhook] Purchase CAPI sent', {
    paymentId: payment.id,
    productKey: product.productKey,
    orgKey: product.orgKey,
    planId,
    cohortCode: product.cohortCode,
    cohortResolutionSource,
    contentIds: product.contentIds,
    eventId,
    value,
    currency,
    hasEmail: Boolean(email),
  });

  return { handled: true, type: envelope.type, paymentId: payment.id };
}
