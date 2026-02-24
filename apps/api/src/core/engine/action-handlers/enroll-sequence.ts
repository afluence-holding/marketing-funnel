import { enrollLead } from '../../services/enrollment.service';
import type { ActionHandler } from '../../types';

export const enrollSequenceAction: ActionHandler = async (action, event) => {
  const sequenceKey = action.sequenceKey as string;
  if (!sequenceKey) {
    console.error('[action:enroll_sequence] Missing sequenceKey in action config');
    return;
  }

  await enrollLead(
    sequenceKey,
    event.leadId,
    event.organizationId,
    event.pipelineEntryId,
  );
};
