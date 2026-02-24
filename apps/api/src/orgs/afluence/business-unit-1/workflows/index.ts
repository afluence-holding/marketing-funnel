import type { WorkflowDef } from '../../../../core/types';
import { autoEnrollWorkflow } from './auto-enroll';

export const workflows: Record<string, WorkflowDef> = {
  [autoEnrollWorkflow.key]: autoEnrollWorkflow,
};
