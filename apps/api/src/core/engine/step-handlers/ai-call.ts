import { callLead } from '../../services/call.service';
import type { StepHandler, AiCallStep } from '../../types';

export const aiCallHandler: StepHandler = async (step, lead, enrollment) => {
  if (step.type !== 'ai_call') return {};

  const s = step as AiCallStep;
  await callLead(lead.id, {
    orgId: lead.organizationId,
    pipelineEntryId: enrollment.pipelineEntryId,
    agentId: s.agentId,
    firstMessage: s.firstMessage,
    dynamicVariables: s.dynamicVariables,
  });

  console.log(`[ai_call] Initiated call for lead ${lead.id}`);
  return {};
};
