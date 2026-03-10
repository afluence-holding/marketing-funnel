import { updateClickUpTaskStatusForEntry } from '../../services/clickup.service';
import type { ActionHandler } from '../../types';

export const updateClickupStatusAction: ActionHandler = async (_action, event) => {
  if (!event.pipelineEntryId) {
    console.warn('[action:update_clickup_status] No pipelineEntryId on event - skipping');
    return;
  }

  await updateClickUpTaskStatusForEntry({
    pipelineEntryId: event.pipelineEntryId,
    stageId: event.metadata?.stageId as string | undefined,
  });
};
