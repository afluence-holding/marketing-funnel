/**
 * ============================================================================
 * GLOBAL REGISTRY — All sequences and workflows from all BUs
 * ============================================================================
 *
 * HOW TO ADD A NEW BU:
 *
 * 1. Import its sequences and workflows:
 *    import { sequences as myBuSequences } from './my-company/my-bu/sequences';
 *    import { workflows as myBuWorkflows } from './my-company/my-bu/workflows';
 *
 * 2. Spread them into the registries below:
 *    export const sequenceRegistry = { ...existing, ...myBuSequences };
 *    export const workflowRegistry = { ...existing, ...myBuWorkflows };
 *
 * That's it. The engine picks them up automatically on next startup.
 */

import type { SequenceDef, WorkflowDef } from '../core/types';

// -- Afluence / Company-1 -----------------------------------------------------
import { sequences as company1Sequences } from './afluence/company-1/sequences';
import { workflows as company1Workflows } from './afluence/company-1/workflows';

// -- Add new BUs here ---------------------------------------------------------
// import { sequences as myBuSequences } from './my-company/my-bu/sequences';
// import { workflows as myBuWorkflows } from './my-company/my-bu/workflows';

export const sequenceRegistry: Record<string, SequenceDef> = {
  ...company1Sequences,
  // ...myBuSequences,
};

export const workflowRegistry: Record<string, WorkflowDef> = {
  ...company1Workflows,
  // ...myBuWorkflows,
};
