import type { StepHandler, WaitStep } from '../../types';

export const waitHandler: StepHandler = async (step, _lead, _enrollment) => {
  if (step.type !== 'wait') return {};

  const s = step as WaitStep;
  const hours = s.hours ?? 0;
  const minutes = s.minutes ?? 0;
  const delayMs = (hours * 3600 + minutes * 60) * 1000;

  console.log(`[wait] Scheduling ${hours}h ${minutes}m delay`);
  return { delayMs };
};
