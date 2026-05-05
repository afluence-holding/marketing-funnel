import type { OrgConfig } from '../../../core/types';

export const config: OrgConfig = {
  defaultLeadStatus: 'new',
  validStatuses: ['new'],
  timezone: 'America/Mexico_City',
};

export const IDS = {
  // Filled in after running `npm run seed:recetas-cami -w @marketing-funnel/api`.
  // Read from env so the API works in every environment without code edits.
  organizationId: process.env.RECETAS_CAMI_ORG_ID ?? '',
};
