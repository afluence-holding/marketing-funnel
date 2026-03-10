import type { WorkflowDef } from '../../../../core/types';
import { IDS } from '../config';

export const autoEnrollWorkflow: WorkflowDef = {
  key: 'company1-auto-enroll',
  name: 'Auto-enroll new leads into welcome sequence',
  trigger: {
    event: 'lead_created',
    conditions: {
      organizationId: IDS.organizationId,
    },
  },
  actions: [
    {
      type: 'enroll_sequence',
      sequenceKey: 'company1-welcome',
    },
  ],
};
