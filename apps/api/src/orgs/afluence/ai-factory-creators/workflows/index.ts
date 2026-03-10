import type { WorkflowDef } from '../../../../core/types';
import {
  autoEnrollAgendarLlamarWorkflow,
  autoEnrollLlamadaAgendadaWorkflow,
} from './auto-enroll';
import {
  createClickupTaskOnPipelineEntryWorkflow,
  updateClickupStatusOnStageEnteredWorkflow,
} from './clickup-sync';

export const workflows: Record<string, WorkflowDef> = {
  [autoEnrollAgendarLlamarWorkflow.key]: autoEnrollAgendarLlamarWorkflow,
  [autoEnrollLlamadaAgendadaWorkflow.key]: autoEnrollLlamadaAgendadaWorkflow,
  [createClickupTaskOnPipelineEntryWorkflow.key]: createClickupTaskOnPipelineEntryWorkflow,
  [updateClickupStatusOnStageEnteredWorkflow.key]: updateClickupStatusOnStageEnteredWorkflow,
};
