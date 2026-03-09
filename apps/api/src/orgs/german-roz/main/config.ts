import type { OrgConfig } from '../../../core/types';

export const config: OrgConfig = {
  defaultLeadStatus: 'new',
  validStatuses: ['new'],
  timezone: 'America/Lima',
};

export const IDS = {
  organizationId: process.env.GERMAN_ROZ_ORG_ID ?? '',
};
