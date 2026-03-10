import type { ClickUpPipelineConfig, OrgConfig } from '../../../core/types';

export const config: OrgConfig = {
  defaultLeadStatus: 'new',
  validStatuses: ['new', 'contacted', 'engaged', 'qualified', 'converted'],
  timezone: 'America/Lima',
};

/**
 * These IDs are populated by the seed script.
 * After running `npm run seed`, copy the real UUIDs here.
 */
export const IDS = {
  organizationId: process.env.PROJECT1_ORG_ID ?? '',
  pipelineId: process.env.PROJECT1_PIPELINE_ID ?? '',
  stages: {
    new_lead: process.env.PROJECT1_STAGE_NEW_LEAD ?? '',
    contacted: process.env.PROJECT1_STAGE_CONTACTED ?? '',
    qualified: process.env.PROJECT1_STAGE_QUALIFIED ?? '',
    converted: process.env.PROJECT1_STAGE_CONVERTED ?? '',
  },
};

export const clickupConfig: ClickUpPipelineConfig = {
  enabled: (process.env.PROJECT1_CLICKUP_ENABLED ?? 'false') === 'true',
  apiToken: process.env.PROJECT1_CLICKUP_API_TOKEN ?? '',
  listId: process.env.PROJECT1_CLICKUP_LIST_ID ?? '',
  stageToStatusMap: {
    [IDS.stages.new_lead]: process.env.PROJECT1_CLICKUP_STATUS_NEW_LEAD ?? '',
    [IDS.stages.contacted]: process.env.PROJECT1_CLICKUP_STATUS_CONTACTED ?? '',
    [IDS.stages.qualified]: process.env.PROJECT1_CLICKUP_STATUS_QUALIFIED ?? '',
    [IDS.stages.converted]: process.env.PROJECT1_CLICKUP_STATUS_CONVERTED ?? '',
  },
};
