import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mailerliteConnector } from '../connectors/mailerlite';
import { __resetRateLimiter } from '../rate-limiter';
import { PermanentDeliveryError, type IntegrationEvent, type MailerliteTargetConfig } from '../types';

const target: MailerliteTargetConfig = {
  connector: 'mailerlite',
  enabledFor: ['registro', 'compra'],
  secretRef: 'ML_TEST_TOKEN',
  registrantGroupId: 'GRP_REG',
  buyerGroupId: 'GRP_BUY',
  fieldKeys: { name: 'name', source: 'fuente', cohort: 'cohorte', tier: 'tier_compra', regDate: 'fecha_registro' },
  cohortValue: 'di21-c2',
};

const baseEvent: IntegrationEvent = {
  type: 'registro',
  orgKey: 'german-roz',
  buKey: 'main',
  dedupBase: 'lead:abc',
  email: 'buyer@test.local',
  firstName: 'Ana',
  lastName: 'Pérez',
  source: 'landing',
  registeredOn: '2026-06-10',
};

function mockFetchSequence(responses: Array<{ status: number; body?: unknown }>) {
  const fn = vi.fn();
  for (const r of responses) {
    fn.mockResolvedValueOnce({
      status: r.status,
      json: async () => r.body ?? {},
      text: async () => JSON.stringify(r.body ?? {}),
    });
  }
  vi.stubGlobal('fetch', fn);
  return fn;
}

beforeEach(() => {
  process.env.ML_TEST_TOKEN = 'tok_123';
  __resetRateLimiter();
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.ML_TEST_TOKEN;
});

describe('mailerlite connector', () => {
  it('registro: upsert al grupo Registrantes con fields (sin estado, sin tier)', async () => {
    const fetchMock = mockFetchSequence([{ status: 200, body: { data: { id: 'sub_1' } } }]);
    await mailerliteConnector.deliver(baseEvent, target);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as { body: string }).body);
    expect(body.email).toBe('buyer@test.local');
    expect(body.groups).toEqual(['GRP_REG']);
    expect(body.fields).toEqual({ name: 'Ana Pérez', fuente: 'landing', cohorte: 'di21-c2', fecha_registro: '2026-06-10' });
    expect(body.fields.estado).toBeUndefined(); // estado lo setea AUTO①
    expect(body.fields.tier_compra).toBeUndefined(); // tier solo en compra
  });

  it('compra: upsert a Compradores + tier_compra, y DELETE de Registrantes', async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: { data: { id: 'sub_9' } } }, // upsert
      { status: 204 }, // remove from group
    ]);
    await mailerliteConnector.deliver({ ...baseEvent, type: 'compra', tier: 77 }, target);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const upsertBody = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body);
    expect(upsertBody.groups).toEqual(['GRP_BUY']);
    expect(upsertBody.fields.tier_compra).toBe('77');
    const [removeUrl, removeInit] = fetchMock.mock.calls[1];
    expect(removeUrl).toContain('/subscribers/sub_9/groups/GRP_BUY'.replace('GRP_BUY', 'GRP_REG'));
    expect((removeInit as { method: string }).method).toBe('DELETE');
  });

  it('compra: DELETE 404 (no estaba en Registrantes) = éxito', async () => {
    mockFetchSequence([
      { status: 201, body: { data: { id: 'sub_x' } } },
      { status: 404 },
    ]);
    await expect(
      mailerliteConnector.deliver({ ...baseEvent, type: 'compra', tier: 67 }, target),
    ).resolves.toBeUndefined();
  });

  it('422 → PermanentDeliveryError (no reintentar)', async () => {
    mockFetchSequence([{ status: 422, body: { message: 'invalid email' } }]);
    await expect(mailerliteConnector.deliver(baseEvent, target)).rejects.toBeInstanceOf(
      PermanentDeliveryError,
    );
  });

  it('429 → Error reintentable (no permanente)', async () => {
    mockFetchSequence([{ status: 429, body: {} }]);
    await expect(mailerliteConnector.deliver(baseEvent, target)).rejects.toThrow(/429/);
    await expect(mailerliteConnector.deliver(baseEvent, target).catch((e) => e)).resolves.not.toBeInstanceOf(
      PermanentDeliveryError,
    );
  });

  it('sin token → no-op (no llama a fetch, no lanza)', async () => {
    delete process.env.ML_TEST_TOKEN;
    const fetchMock = mockFetchSequence([]);
    await expect(mailerliteConnector.deliver(baseEvent, target)).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sin email → PermanentDeliveryError', async () => {
    mockFetchSequence([]);
    await expect(
      mailerliteConnector.deliver({ ...baseEvent, email: undefined }, target),
    ).rejects.toBeInstanceOf(PermanentDeliveryError);
  });
});
