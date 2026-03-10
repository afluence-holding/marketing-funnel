import type { WorkflowDef } from '../../../../core/types';
import { IDS } from '../config';

export const createClickupTaskOnPipelineEntryWorkflow: WorkflowDef = {
  key: 'ai-factory-creators-clickup-create-task',
  name: 'Create ClickUp task when pipeline entry is created (inbound only)',
  trigger: {
    event: 'pipeline_entry_created',
    conditions: {
      organizationId: IDS.organizationId,
      channel: 'inbound',
    },
  },
  actions: [
    {
      type: 'create_clickup_task',
    },
  ],
};

export const updateClickupStatusOnStageEnteredWorkflow: WorkflowDef = {
  key: 'ai-factory-creators-clickup-update-status',
  name: 'Update ClickUp status when stage changes',
  trigger: {
    event: 'stage_entered',
    conditions: {
      organizationId: IDS.organizationId,
    },
  },
  actions: [
    {
      type: 'update_clickup_status',
    },
  ],
};
