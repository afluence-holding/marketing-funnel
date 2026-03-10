import { createClickUpTaskForEntry } from '../../services/clickup.service';
import type { ActionHandler } from '../../types';

export const createClickupTaskAction: ActionHandler = async (_action, event) => {
  if (!event.pipelineEntryId) {
    console.warn('[action:create_clickup_task] No pipelineEntryId on event - skipping');
    return;
  }

  await createClickUpTaskForEntry({
    pipelineEntryId: event.pipelineEntryId,
    leadId: event.leadId,
  });
};
