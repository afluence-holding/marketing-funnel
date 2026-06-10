/**
 * Validación del registry de integraciones al boot: un error de config falla
 * temprano y claro (mismo criterio que la validación del catalog). NO valida
 * que el env exista con valor (eso degrada en runtime), pero sí que el mapeo
 * esté completo y los connectors sean conocidos.
 */

import type { BuIntegrationConfig, ConnectorId } from './types';

const KNOWN_CONNECTORS: ConnectorId[] = ['mailerlite', 'hyros', 'meta-capi'];

export function validateIntegrationConfigs(configs: BuIntegrationConfig[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const cfg of configs) {
    const where = `${cfg.orgKey}/${cfg.buKey}`;
    if (!cfg.orgKey || !cfg.buKey) errors.push(`config sin orgKey/buKey`);
    if (seen.has(where)) errors.push(`config duplicada para ${where}`);
    seen.add(where);
    if (cfg.targets.length === 0) errors.push(`${where}: sin destinos`);

    for (const t of cfg.targets) {
      if (!KNOWN_CONNECTORS.includes(t.connector)) {
        errors.push(`${where}: connector desconocido "${(t as { connector: string }).connector}"`);
        continue;
      }
      if (!t.enabledFor || t.enabledFor.length === 0) {
        errors.push(`${where}/${t.connector}: enabledFor vacío`);
      }
      if (t.connector === 'mailerlite') {
        if (!t.secretRef) errors.push(`${where}/mailerlite: falta secretRef`);
        if (!t.registrantGroupId || !t.buyerGroupId) {
          errors.push(`${where}/mailerlite: faltan registrantGroupId/buyerGroupId`);
        }
        if (!t.cohortValue) errors.push(`${where}/mailerlite: falta cohortValue`);
      }
      if (t.connector === 'hyros') {
        if (!t.secretRef) errors.push(`${where}/hyros: falta secretRef`);
      }
      if (t.connector === 'meta-capi') {
        if (!t.pixelRef || !t.tokenRef) {
          errors.push(`${where}/meta-capi: faltan pixelRef/tokenRef`);
        }
        if (!t.eventNames?.registro || !t.eventNames?.compra) {
          errors.push(`${where}/meta-capi: faltan eventNames {registro, compra}`);
        }
      }
    }
  }
  return errors;
}
