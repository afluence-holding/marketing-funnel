import type { WorkflowDef } from '../../../core/types';
import { clickupChatLeadCreatedWorkflows } from './clickup-chat';

export const workflows: Record<string, WorkflowDef> = {
  ...clickupChatLeadCreatedWorkflows,
};
