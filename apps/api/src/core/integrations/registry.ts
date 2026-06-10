/**
 * Registro de configs de integración por creador (code-first), agregado igual
 * que `sequenceRegistry`/`whatsappGroupPoolRegistry`. Agregar un creador =
 * un archivo `orgs/<org>/<bu>/integrations.ts` + una entrada acá.
 */

import type { BuIntegrationConfig } from './types';
import { GERMAN_ROZ_MAIN_INTEGRATIONS } from '../../orgs/german-roz/main/integrations';

const CONFIGS: BuIntegrationConfig[] = [GERMAN_ROZ_MAIN_INTEGRATIONS];

const registry: Record<string, BuIntegrationConfig> = Object.fromEntries(
  CONFIGS.map((c) => [`${c.orgKey}/${c.buKey}`, c]),
);

export function getIntegrationConfig(
  orgKey: string,
  buKey: string,
): BuIntegrationConfig | undefined {
  return registry[`${orgKey}/${buKey}`];
}

export function allIntegrationConfigs(): BuIntegrationConfig[] {
  return CONFIGS;
}
