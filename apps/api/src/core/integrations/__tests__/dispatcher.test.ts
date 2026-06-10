import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock del repositorio (DB) — evita importar @marketing-funnel/config (env).
const enqueueDelivery = vi.fn();
const markDelivered = vi.fn().mockResolvedValue(undefined);
const markFailure = vi.fn().mockResolvedValue(undefined);
vi.mock('../delivery-repository', () => ({
  enqueueDelivery: (...a: unknown[]) => enqueueDelivery(...a),
  markDelivered: (...a: unknown[]) => markDelivered(...a),
  markFailure: (...a: unknown[]) => markFailure(...a),
}));

// Mock de connectors — controlamos su comportamiento por test.
const mlDeliver = vi.fn();
const hyrosDeliver = vi.fn();
vi.mock('../connectors', () => ({
  connectorRegistry: {
    mailerlite: { id: 'mailerlite', deliver: (...a: unknown[]) => mlDeliver(...a) },
    hyros: { id: 'hyros', deliver: (...a: unknown[]) => hyrosDeliver(...a) },
    'meta-capi': { id: 'meta-capi', deliver: vi.fn() },
  },
}));

import { dispatchIntegrationEvent } from '../dispatcher';
import { PermanentDeliveryError, type IntegrationEvent } from '../types';

const event: IntegrationEvent = {
  type: 'registro',
  orgKey: 'german-roz',
  buKey: 'main',
  dedupBase: 'lead:abc',
  email: 'x@test.local',
};

beforeEach(() => {
  enqueueDelivery.mockReset().mockResolvedValue({ id: 'row1', inserted: true, unavailable: false });
  markDelivered.mockClear();
  markFailure.mockClear();
  mlDeliver.mockReset().mockResolvedValue(undefined);
  hyrosDeliver.mockReset().mockResolvedValue(undefined);
});
afterEach(() => vi.clearAllMocks());

describe('dispatcher', () => {
  it('encola y entrega a cada destino habilitado de German (mailerlite + hyros)', async () => {
    await dispatchIntegrationEvent(event);
    // German tiene mailerlite + hyros habilitados para registro
    expect(enqueueDelivery).toHaveBeenCalledTimes(2);
    const connectors = enqueueDelivery.mock.calls.map((c) => c[0].connector).sort();
    expect(connectors).toEqual(['hyros', 'mailerlite']);
    expect(mlDeliver).toHaveBeenCalledTimes(1);
    expect(hyrosDeliver).toHaveBeenCalledTimes(1);
    expect(markDelivered).toHaveBeenCalledTimes(2);
  });

  it('dedup_key tiene formato tipo:base:connector', async () => {
    await dispatchIntegrationEvent(event);
    const dedupKeys = enqueueDelivery.mock.calls.map((c) => c[0].dedupKey);
    expect(dedupKeys).toContain('registro:lead:abc:mailerlite');
    expect(dedupKeys).toContain('registro:lead:abc:hyros');
  });

  it('NO re-entrega si la fila ya existía (idempotencia: inserted=false)', async () => {
    enqueueDelivery.mockResolvedValue({ id: 'row1', inserted: false, unavailable: false });
    await dispatchIntegrationEvent(event);
    expect(mlDeliver).not.toHaveBeenCalled();
    expect(markDelivered).not.toHaveBeenCalled();
  });

  it('NO intenta inline si la DB no estuvo disponible', async () => {
    enqueueDelivery.mockResolvedValue({ id: null, inserted: false, unavailable: true });
    await dispatchIntegrationEvent(event);
    expect(mlDeliver).not.toHaveBeenCalled();
  });

  it('un connector que falla no rompe a los demás (aislamiento)', async () => {
    mlDeliver.mockRejectedValue(new Error('mailerlite 500'));
    await dispatchIntegrationEvent(event);
    expect(hyrosDeliver).toHaveBeenCalledTimes(1); // hyros igual se entrega
    expect(markFailure).toHaveBeenCalledWith('row1', 'mailerlite 500', { permanent: false });
    expect(markDelivered).toHaveBeenCalledTimes(1); // hyros ok
  });

  it('PermanentDeliveryError → markFailure permanent', async () => {
    mlDeliver.mockRejectedValue(new PermanentDeliveryError('email inválido'));
    await dispatchIntegrationEvent(event);
    expect(markFailure).toHaveBeenCalledWith('row1', 'email inválido', { permanent: true });
  });

  it('org sin config → no hace nada', async () => {
    await dispatchIntegrationEvent({ ...event, orgKey: 'desconocido', buKey: 'x' });
    expect(enqueueDelivery).not.toHaveBeenCalled();
  });

  it('respeta enabledFor (compra entrega a los destinos de compra)', async () => {
    await dispatchIntegrationEvent({ ...event, type: 'compra', dedupBase: 'whop:p1', tier: 67 });
    // German habilita mailerlite + hyros para compra también
    expect(enqueueDelivery).toHaveBeenCalledTimes(2);
    expect(enqueueDelivery.mock.calls[0][0].dedupKey).toMatch(/^compra:whop:p1:/);
  });
});
