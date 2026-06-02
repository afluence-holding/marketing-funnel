import type { OrgConfig } from '../../../core/types';

export const config: OrgConfig = {
  defaultLeadStatus: 'new',
  validStatuses: ['new', 'contacted', 'qualified', 'sold', 'lost'],
  timezone: 'America/Santiago',
};

export const IDS = {
  organizationId: process.env.BUKKU_ORG_ID ?? '',
  pipelineId: process.env.BUKKU_PIPELINE_ID ?? '',
  stages: {
    new_lead: process.env.BUKKU_STAGE_NEW_LEAD ?? '',
    contacted: process.env.BUKKU_STAGE_CONTACTED ?? '',
    qualified: process.env.BUKKU_STAGE_QUALIFIED ?? '',
    sold: process.env.BUKKU_STAGE_SOLD ?? '',
    lost: process.env.BUKKU_STAGE_LOST ?? '',
  },
};
