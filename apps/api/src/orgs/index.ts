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

import type { ClickUpPipelineConfig, SequenceDef, WorkflowDef } from '../core/types';

// -- Afluence / Company-1 -----------------------------------------------------
import { sequences as company1Sequences } from './afluence/business-unit-1/sequences';
import { workflows as company1Workflows } from './afluence/business-unit-1/workflows';
import { IDS as company1Ids, clickupConfig as company1ClickupConfig } from './afluence/business-unit-1/config';
import { sequences as aiFactoryCreatorsSequences } from './afluence/ai-factory-creators/sequences';
import { workflows as aiFactoryCreatorsWorkflows } from './afluence/ai-factory-creators/workflows';
import { IDS as aiFactoryCreatorsIds, clickupConfig as aiFactoryCreatorsClickupConfig } from './afluence/ai-factory-creators/config';

// -- Add new BUs here ---------------------------------------------------------
// import { sequences as myBuSequences } from './my-company/my-bu/sequences';
// import { workflows as myBuWorkflows } from './my-company/my-bu/workflows';

export const sequenceRegistry: Record<string, SequenceDef> = {
  ...company1Sequences,
  ...aiFactoryCreatorsSequences,
  // ...myBuSequences,
};

export const workflowRegistry: Record<string, WorkflowDef> = {
  ...company1Workflows,
  ...aiFactoryCreatorsWorkflows,
  // ...myBuWorkflows,
};

export const clickupRegistryByPipelineId: Record<string, ClickUpPipelineConfig> = {
  ...(company1Ids.pipelineId ? { [company1Ids.pipelineId]: company1ClickupConfig } : {}),
  ...(aiFactoryCreatorsIds.pipelineId ? { [aiFactoryCreatorsIds.pipelineId]: aiFactoryCreatorsClickupConfig } : {}),
};
