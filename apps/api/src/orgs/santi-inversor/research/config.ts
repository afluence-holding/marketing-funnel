import type { OrgConfig } from '../../../core/types';

export const config: OrgConfig = {
  defaultLeadStatus: 'new',
  validStatuses: ['new', 'contacted', 'qualified', 'sold', 'lost'],
  timezone: 'America/Santiago',
};

export const IDS = {
  organizationId: process.env.SANTI_INVERSOR_ORG_ID ?? '',
  pipelineId: process.env.SANTI_INVERSOR_PIPELINE_ID ?? '',
  stages: {
    new_lead: process.env.SANTI_INVERSOR_STAGE_NEW_LEAD ?? '',
    contacted: process.env.SANTI_INVERSOR_STAGE_CONTACTED ?? '',
    qualified: process.env.SANTI_INVERSOR_STAGE_QUALIFIED ?? '',
    sold: process.env.SANTI_INVERSOR_STAGE_SOLD ?? '',
    lost: process.env.SANTI_INVERSOR_STAGE_LOST ?? '',
  },
};
