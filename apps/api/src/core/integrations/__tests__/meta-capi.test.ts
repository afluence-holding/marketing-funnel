import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sendMetaCapiEvent = vi.fn().mockResolvedValue(undefined);
vi.mock('../../services/meta-capi.service', () => ({
  sendMetaCapiEvent: (...a: unknown[]) => sendMetaCapiEvent(...a),
  buildMetaCapiUserData: (x: unknown) => x,
}));

import { metaCapiConnector } from '../connectors/meta-capi';
import type { IntegrationEvent, MetaCapiTargetConfig } from '../types';

const target: MetaCapiTargetConfig = {
  connector: 'meta-capi',
  enabledFor: ['registro', 'compra'],
  pixelRef: 'PIX_TEST',
  tokenRef: 'TOK_TEST',
  eventNames: { registro: 'Lead', compra: 'Purchase' },
  defaultCountry: 'pe',
  contentIds: ['di21-c2'],
  contentName: 'Reto',
};

const event: IntegrationEvent = {
  type: 'registro',
  orgKey: 'german-roz',
  buKey: 'main',
  dedupBase: 'lead:abc',
  email: 'x@test.local',
  tracking: { eventId: 'EVT-123', fbp: 'fbp.1', fbc: 'fbc.1' },
};

beforeEach(() => {
  process.env.PIX_TEST = '999';
  process.env.TOK_TEST = 'EAA';
  sendMetaCapiEvent.mockClear();
});
afterEach(() => {
  delete process.env.PIX_TEST;
  delete process.env.TOK_TEST;
});

describe('meta-capi connector', () => {
  it('registro → Lead con event_id del Pixel (dedupe) + fbp/fbc', async () => {
    await metaCapiConnector.deliver(event, target);
    expect(sendMetaCapiEvent).toHaveBeenCalledTimes(1);
    const arg = sendMetaCapiEvent.mock.calls[0][0];
    expect(arg.eventName).toBe('Lead');
    expect(arg.eventId).toBe('EVT-123'); // ← el del Pixel, no determinístico
    expect(arg.pixelId).toBe('999');
    expect(arg.accessToken).toBe('EAA');
    expect(arg.userData.fbp).toBe('fbp.1');
    expect(arg.userData.country).toBe('pe');
  });

  it('compra → Purchase con value/currency/order_id', async () => {
    await metaCapiConnector.deliver(
      { ...event, type: 'compra', value: 67, currency: 'USD', orderId: 'HP1' },
      target,
    );
    const arg = sendMetaCapiEvent.mock.calls[0][0];
    expect(arg.eventName).toBe('Purchase');
    expect(arg.customData.value).toBe(67);
    expect(arg.customData.currency).toBe('USD');
    expect(arg.customData.order_id).toBe('HP1');
    expect(arg.customData.content_ids).toEqual(['di21-c2']);
  });

  it('sin event_id del Pixel → fallback determinístico', async () => {
    await metaCapiConnector.deliver({ ...event, tracking: undefined }, target);
    const arg = sendMetaCapiEvent.mock.calls[0][0];
    expect(arg.eventId).toBe('german-roz-main-Lead-lead:abc');
  });

  it('sin credenciales → no-op (no llama al servicio)', async () => {
    delete process.env.PIX_TEST;
    await metaCapiConnector.deliver(event, target);
    expect(sendMetaCapiEvent).not.toHaveBeenCalled();
  });
});
