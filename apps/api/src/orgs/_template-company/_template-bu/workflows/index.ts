/**
 * ============================================================================
 * WORKFLOW REGISTRY — Export all workflows for this BU
 * ============================================================================
 *
 * Every workflow you create in this folder must be imported here and
 * added to the `workflows` map. The key MUST match the workflow's `key` field.
 *
 * This file is imported by orgs/index.ts which feeds the global registry.
 *
 * EXAMPLE:
 *   import { autoEnrollOnCreate } from './auto-enroll';
 *   import { onCallCompleted } from './post-call';
 *
 *   export const workflows: Record<string, WorkflowDef> = {
 *     [autoEnrollOnCreate.key]: autoEnrollOnCreate,
 *     [onCallCompleted.key]: onCallCompleted,
 *   };
 *
 * TIP: You don't have to export every workflow from _example-workflows.
 * Only export the ones you actually want active.
 */

import type { WorkflowDef } from '../../../../core/types';
import { autoEnrollOnCreate } from './_example-workflows';

export const workflows: Record<string, WorkflowDef> = {
  [autoEnrollOnCreate.key]: autoEnrollOnCreate,
};
