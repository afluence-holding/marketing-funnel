import type { StepHandler, ManualTaskStep } from '../../types';

export const manualTaskHandler: StepHandler = async (step, lead, _enrollment) => {
  if (step.type !== 'manual_task') return {};

  const s = step as ManualTaskStep;
  console.log(`[manual_task] Task for lead ${lead.id}: ${s.description}${s.assignee ? ` (assigned: ${s.assignee})` : ''}`);
  return {};
};
