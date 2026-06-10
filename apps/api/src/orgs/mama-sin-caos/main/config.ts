import type { OrgConfig } from '../../../core/types';

// Mamá Sin Caos — org cosmética/estructural (patrón híbrido tipo caro-fitness).
// Sus leads viven en la tabla dedicada `marketing.mama_sin_caos_leads` vía la
// ruta dedicada (`/api/mama-sin-caos/ingest`); este binding NO toca esa ingesta.
// `routing` devuelve [] (no crea pipeline). timezone es placeholder: no hay
// sequences/scheduling para esta org, así que no es load-bearing.
export const config: OrgConfig = {
  defaultLeadStatus: 'new',
  validStatuses: ['new'],
  timezone: 'America/Mexico_City',
};

export const IDS = {
  // Vacío por diseño: no se seedea `organizations` (los leads no tienen FK).
  // Solo lo leería la ruta genérica /api/orgs/.../ingest, que Mamá NO usa.
  organizationId: process.env.MAMA_SIN_CAOS_ORG_ID ?? '',
};
