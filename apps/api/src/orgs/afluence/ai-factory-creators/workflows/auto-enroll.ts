import type { WorkflowDef } from '../../../../core/types';
import { IDS } from '../config';

export const autoEnrollAgendarLlamarWorkflow: WorkflowDef = {
  key: 'ai-factory-creators-auto-enroll-agendar-llamar',
  name: 'Auto-enroll on pre-qualified lead stage',
  trigger: {
    event: 'stage_entered',
    conditions: {
      organizationId: IDS.organizationId,
      stageId: IDS.stages.pre_qualified_lead,
    },
  },
  actions: [
    {
      type: 'enroll_sequence',
      sequenceKey: 'ai-factory-creators-agendar-llamar',
    },
  ],
};

export const autoEnrollLlamadaAgendadaWorkflow: WorkflowDef = {
  key: 'ai-factory-creators-auto-enroll-llamada-agendada',
  name: 'Auto-enroll on meeting schedule stage',
  trigger: {
    event: 'stage_entered',
    conditions: {
      organizationId: IDS.organizationId,
      stageId: IDS.stages.meeting_schedule,
    },
  },
  actions: [
    {
      type: 'enroll_sequence',
      sequenceKey: 'ai-factory-creators-llamada-agendada',
    },
  ],
};
