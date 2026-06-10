/**
 * Config de integraciones de German Roz · Desinflámate (DI21-C2).
 * MAPEO code-first (group IDs, field keys — verificados en vivo por MCP, cuenta
 * 2219743); los TOKENS van por env (secretRef), nunca acá.
 *
 * NOTA (anti-doble-fire): German YA dispara Meta CAPI inline — Lead en la ruta
 * de ingesta (`ingestion.routes.ts`) y Purchase en los webhooks. Por eso el
 * connector `meta-capi` NO se habilita acá (duplicaría el Purchase con otro
 * event_id). El connector existe en la capa para creadores nuevos que NO tengan
 * CAPI inline. German usa el fan-out para lo genuinamente nuevo: MailerLite (+
 * Hyros cuando se confirme su contrato).
 */

import type { BuIntegrationConfig } from '../../../core/integrations/types';

export const GERMAN_ROZ_MAIN_INTEGRATIONS: BuIntegrationConfig = {
  orgKey: 'german-roz',
  buKey: 'main',
  targets: [
    {
      connector: 'mailerlite',
      enabledFor: ['registro', 'compra'],
      secretRef: 'MAILERLITE_TOKEN_GERMAN_ROZ',
      registrantGroupId: '189628566065907406', // DI21-C2-Registrantes-Jun2026
      buyerGroupId: '189880387420292276', // DI21-C2-Compradores
      fieldKeys: {
        name: 'name',
        source: 'fuente',
        cohort: 'cohorte',
        tier: 'tier_compra',
        regDate: 'fecha_registro',
      },
      cohortValue: 'di21-c2',
    },
    {
      connector: 'hyros',
      enabledFor: ['registro', 'compra'],
      secretRef: 'HYROS_API_KEY_GERMAN_ROZ',
    },
  ],
};
