import type { ClickUpPipelineConfig, OrgConfig } from '../../../core/types';

const clickupCustomItemIdRaw = process.env.PROJECT2_CLICKUP_CUSTOM_ITEM_ID ?? '1009';
const clickupCustomItemId = Number.parseInt(clickupCustomItemIdRaw, 10);

export const config: OrgConfig = {
  defaultLeadStatus: 'prospecting',
  validStatuses: [
    'prospecting',
    'pre_qualified_lead',
    'meeting_schedule',
    'opportunity',
    'prd',
    'quote',
  ],
  timezone: 'America/Lima',
};

export const IDS = {
  organizationId: process.env.PROJECT2_ORG_ID ?? '',
  pipelineId: process.env.PROJECT2_PIPELINE_ID ?? '',
  stages: {
    prospecting: process.env.PROJECT2_STAGE_PROSPECTING ?? '',
    pre_qualified_lead: process.env.PROJECT2_STAGE_PRE_QUALIFIED_LEAD ?? '',
    meeting_schedule: process.env.PROJECT2_STAGE_MEETING_SCHEDULE ?? '',
    opportunity: process.env.PROJECT2_STAGE_OPPORTUNITY ?? '',
    prd: process.env.PROJECT2_STAGE_PRD ?? '',
    quote: process.env.PROJECT2_STAGE_QUOTE ?? '',
  },
};

export const clickupConfig: ClickUpPipelineConfig = {
  enabled: (process.env.PROJECT2_CLICKUP_ENABLED ?? 'false') === 'true',
  apiToken: process.env.PROJECT2_CLICKUP_API_TOKEN ?? '',
  listId: process.env.PROJECT2_CLICKUP_LIST_ID ?? '',
  customItemId: Number.isFinite(clickupCustomItemId) ? clickupCustomItemId : 1009,
  stageToStatusMap: {
    [IDS.stages.prospecting]: 'PROSPECTING',
    [IDS.stages.pre_qualified_lead]: 'PRE-QUALIFIED LEAD',
    [IDS.stages.meeting_schedule]: 'MEETING SCHEDULE',
    [IDS.stages.opportunity]: 'OPPORTUNITY',
    [IDS.stages.prd]: 'PRD',
    [IDS.stages.quote]: 'QUOTE',
  },
};
