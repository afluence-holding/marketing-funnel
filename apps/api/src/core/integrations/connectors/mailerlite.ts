/**
 * Connector MailerLite (verificado en vivo por MCP). Modela ESTADO DESEADO:
 * - registro → subscriber en grupo Registrantes con fields.
 * - compra   → subscriber en grupo Compradores Y fuera de Registrantes (idempotente
 *              ante orden invertido). Resuelve subscriber_id por la respuesta del
 *              upsert o GET-by-email; 404 al quitar de grupo = éxito.
 * Rate-limit por token (compartido inline↔cron). Upsert por email = idempotente.
 * Sin token configurado → no-op (no lanza), como el guard de CAPI.
 */

import { acquireRateToken } from '../rate-limiter';
import { resolveSecret } from '../secrets';
import {
  PermanentDeliveryError,
  type IntegrationConnector,
  type IntegrationEvent,
  type MailerliteTargetConfig,
} from '../types';

const BASE = 'https://connect.mailerlite.com/api';
const TIMEOUT_MS = 12_000;

async function mlFetch(
  token: string,
  path: string,
  init: { method: string; body?: unknown },
): Promise<{ status: number; json: unknown }> {
  await acquireRateToken(token);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  } finally {
    clearTimeout(timer);
  }
}

function buildFields(
  event: IntegrationEvent,
  target: MailerliteTargetConfig,
): Record<string, string> {
  const fk = target.fieldKeys;
  const fields: Record<string, string> = {};
  const name = event.name ?? [event.firstName, event.lastName].filter(Boolean).join(' ').trim();
  if (fk.name && name) fields[fk.name] = name;
  if (fk.source && event.source) fields[fk.source] = event.source;
  if (fk.cohort) fields[fk.cohort] = target.cohortValue;
  if (fk.regDate && event.registeredOn) fields[fk.regDate] = event.registeredOn;
  // tier_compra solo en compra
  if (event.type === 'compra' && fk.tier && typeof event.tier === 'number') {
    fields[fk.tier] = String(event.tier);
  }
  // NO se manda `estado` (lo setea AUTO① al unirse al grupo).
  return fields;
}

/** Upsert por email; devuelve el subscriber_id. Lanza en errores de API. */
async function upsertSubscriber(
  token: string,
  email: string,
  groupId: string,
  fields: Record<string, string>,
): Promise<string> {
  const { status, json } = await mlFetch(token, '/subscribers', {
    method: 'POST',
    body: { email, fields, groups: [groupId] },
  });
  if (status === 200 || status === 201) {
    const id = (json as { data?: { id?: string } })?.data?.id;
    if (!id) throw new Error('mailerlite upsert ok pero sin subscriber id');
    return id;
  }
  if (status === 422) {
    throw new PermanentDeliveryError(
      `mailerlite 422 (email/field inválido): ${JSON.stringify(json).slice(0, 300)}`,
    );
  }
  // 401/404/429/5xx → reintentable
  throw new Error(`mailerlite upsert ${status}: ${JSON.stringify(json).slice(0, 300)}`);
}

/** Quita al subscriber de un grupo. 404 (no estaba) = éxito. */
async function removeFromGroup(
  token: string,
  subscriberId: string,
  groupId: string,
): Promise<void> {
  const { status, json } = await mlFetch(
    token,
    `/subscribers/${encodeURIComponent(subscriberId)}/groups/${encodeURIComponent(groupId)}`,
    { method: 'DELETE' },
  );
  if (status === 200 || status === 204 || status === 404) return;
  throw new Error(`mailerlite remove-group ${status}: ${JSON.stringify(json).slice(0, 300)}`);
}

export const mailerliteConnector: IntegrationConnector<MailerliteTargetConfig> = {
  id: 'mailerlite',
  async deliver(event, target) {
    const token = resolveSecret(target.secretRef);
    if (!token) {
      console.warn('[integrations:mailerlite] token ausente — no-op', {
        secretRef: target.secretRef,
        orgKey: event.orgKey,
      });
      return; // no-op intencional (como el guard de CAPI)
    }
    if (!event.email) {
      throw new PermanentDeliveryError('mailerlite: evento sin email');
    }
    const fields = buildFields(event, target);

    if (event.type === 'registro') {
      await upsertSubscriber(token, event.email, target.registrantGroupId, fields);
      return;
    }

    // compra: estado deseado = en Compradores, NO en Registrantes.
    const subscriberId = await upsertSubscriber(
      token,
      event.email,
      target.buyerGroupId,
      fields,
    );
    await removeFromGroup(token, subscriberId, target.registrantGroupId);
  },
};
