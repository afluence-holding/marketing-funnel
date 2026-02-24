import { moveStage } from '../../services/lead-pipeline.service';
import type { ActionHandler } from '../../types';

export const moveStageAction: ActionHandler = async (action, event) => {
  const stageId = action.stageId as string;
  if (!stageId) {
    console.error('[action:move_stage] Missing stageId in action config');
    return;
  }

  if (!event.pipelineEntryId) {
    console.warn('[action:move_stage] No pipelineEntryId on event — skipping');
    return;
  }

  await moveStage(event.pipelineEntryId, stageId, event.organizationId);
  console.log(`[action:move_stage] Moved entry ${event.pipelineEntryId} to stage ${stageId}`);
};
