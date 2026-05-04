import type { OrgConfig } from '../../../core/types';

export const config: OrgConfig = {
  defaultLeadStatus: 'new',
  validStatuses: ['new'],
  timezone: 'America/Mexico_City',
};

export const IDS = {
  // Filled in after running `npm run seed:carla-zaplana -w @marketing-funnel/api`.
  // Read from env so the API works in every environment without code edits.
  organizationId: process.env.CARLA_ZAPLANA_ORG_ID ?? '',
};
