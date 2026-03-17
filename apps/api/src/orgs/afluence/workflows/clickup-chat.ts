import type { WorkflowDef } from '../../../core/types';
import { afluenceOrganizationId } from '../config';

const workflow: WorkflowDef = {
  key: 'afluence-clickup-chat-on-lead-created',
  name: 'Notify Afluence ClickUp channel on lead created',
  trigger: {
    event: 'lead_created',
    conditions: {
      organizationId: afluenceOrganizationId,
    },
  },
  actions: [
    {
      type: 'notify_clickup_channel',
    },
  ],
};

export const clickupChatLeadCreatedWorkflows: Record<string, WorkflowDef> =
  afluenceOrganizationId ? { [workflow.key]: workflow } : {};
