import { describe, expect, it } from 'vitest';
import { validateIntegrationConfigs } from '../validate';
import { allIntegrationConfigs } from '../registry';
import type { BuIntegrationConfig } from '../types';

describe('validateIntegrationConfigs', () => {
  it('el registry real (German) es válido', () => {
    expect(validateIntegrationConfigs(allIntegrationConfigs())).toEqual([]);
  });

  it('rechaza connector desconocido', () => {
    const cfg = {
      orgKey: 'x',
      buKey: 'y',
      targets: [{ connector: 'klaviyo', enabledFor: ['registro'] }],
    } as unknown as BuIntegrationConfig;
    expect(validateIntegrationConfigs([cfg]).join('\n')).toMatch(/connector desconocido/);
  });

  it('rechaza mailerlite sin groupIds / secretRef / cohortValue', () => {
    const cfg: BuIntegrationConfig = {
      orgKey: 'x',
      buKey: 'y',
      targets: [
        {
          connector: 'mailerlite',
          enabledFor: ['registro'],
          secretRef: '',
          registrantGroupId: '',
          buyerGroupId: '',
          fieldKeys: {},
          cohortValue: '',
        },
      ],
    };
    const out = validateIntegrationConfigs([cfg]).join('\n');
    expect(out).toMatch(/falta secretRef/);
    expect(out).toMatch(/registrantGroupId\/buyerGroupId/);
    expect(out).toMatch(/falta cohortValue/);
  });

  it('rechaza meta-capi sin pixel/token o eventNames', () => {
    const cfg = {
      orgKey: 'x',
      buKey: 'y',
      targets: [{ connector: 'meta-capi', enabledFor: ['compra'] }],
    } as unknown as BuIntegrationConfig;
    const out = validateIntegrationConfigs([cfg]).join('\n');
    expect(out).toMatch(/pixelRef\/tokenRef/);
    expect(out).toMatch(/eventNames/);
  });

  it('rechaza enabledFor vacío y config duplicada', () => {
    const base: BuIntegrationConfig = {
      orgKey: 'x',
      buKey: 'y',
      targets: [{ connector: 'hyros', enabledFor: [], secretRef: 'H' }],
    };
    const out = validateIntegrationConfigs([base, base]).join('\n');
    expect(out).toMatch(/enabledFor vacío/);
    expect(out).toMatch(/config duplicada/);
  });
});
