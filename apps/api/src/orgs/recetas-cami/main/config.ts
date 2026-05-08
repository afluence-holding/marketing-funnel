import type { OrgConfig } from '../../../core/types';

export const config: OrgConfig = {
  defaultLeadStatus: 'new',
  validStatuses: ['new'],
  timezone: 'America/Santiago',
};

export const IDS = {
  organizationId: process.env.RECETAS_CAMI_ORG_ID ?? '',
};
