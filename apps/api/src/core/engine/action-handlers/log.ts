import { logActivity } from '../../services/activity-log.service';
import type { ActionHandler } from '../../types';

export const logAction: ActionHandler = async (action, event) => {
  const message = (action.message as string) ?? 'workflow_action_log';

  await logActivity(
    event.organizationId,
    event.leadId,
    message,
    { workflowEvent: event.type, ...event.metadata },
    event.pipelineEntryId,
  );
};
