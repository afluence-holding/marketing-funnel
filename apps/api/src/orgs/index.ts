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

import type { ClickUpPipelineConfig, SequenceDef, WorkflowDef, RoutingEngine } from '../core/types';

// -- Afluence / Company-1 -----------------------------------------------------
import { workflows as afluenceOrgWorkflows } from './afluence/workflows';
import { sequences as company1Sequences } from './afluence/business-unit-1/sequences';
import { workflows as company1Workflows } from './afluence/business-unit-1/workflows';
import { IDS as company1Ids, clickupConfig as company1ClickupConfig } from './afluence/business-unit-1/config';
import { sequences as aiFactoryCreatorsSequences } from './afluence/ai-factory-creators/sequences';
import { workflows as aiFactoryCreatorsWorkflows } from './afluence/ai-factory-creators/workflows';
import { IDS as aiFactoryCreatorsIds, clickupConfig as aiFactoryCreatorsClickupConfig } from './afluence/ai-factory-creators/config';
import { routingEngine as aiFactoryCreatorsRouting } from './afluence/ai-factory-creators/routing';
import { routingEngine as company1Routing } from './afluence/business-unit-1/routing';

// -- German Roz / Main --------------------------------------------------------
import { sequences as germanRozSequences } from './german-roz/main/sequences';
import { workflows as germanRozWorkflows } from './german-roz/main/workflows';
import { IDS as germanRozIDS } from './german-roz/main/config';
import { routingEngine as germanRozRouting } from './german-roz/main/routing';

// -- Add new BUs here ---------------------------------------------------------

export interface BusinessUnitBinding {
  orgKey: string;
  buKey: string;
  organizationId: string;
  routingEngine: RoutingEngine;
}

const businessUnits: BusinessUnitBinding[] = [
  {
    orgKey: 'afluence',
    buKey: 'business-unit-1',
    organizationId: company1Ids.organizationId,
    routingEngine: company1Routing,
  },
  {
    orgKey: 'afluence',
    buKey: 'ai-factory-creators',
    organizationId: aiFactoryCreatorsIds.organizationId,
    routingEngine: aiFactoryCreatorsRouting,
  },
  {
    orgKey: 'german-roz',
    buKey: 'main',
    organizationId: germanRozIDS.organizationId,
    routingEngine: germanRozRouting,
  },
];

function makeBusinessUnitRegistryKey(orgKey: string, buKey: string) {
  return `${orgKey}/${buKey}`;
}

export const businessUnitRegistry: Record<string, BusinessUnitBinding> = Object.fromEntries(
  businessUnits.map((businessUnit) => [
    makeBusinessUnitRegistryKey(businessUnit.orgKey, businessUnit.buKey),
    businessUnit,
  ]),
);

export function getBusinessUnitBinding(orgKey: string, buKey: string) {
  return businessUnitRegistry[makeBusinessUnitRegistryKey(orgKey, buKey)];
}

export const sequenceRegistry: Record<string, SequenceDef> = {
  ...company1Sequences,
  ...aiFactoryCreatorsSequences,
  ...germanRozSequences,
};

export const workflowRegistry: Record<string, WorkflowDef> = {
  ...afluenceOrgWorkflows,
  ...company1Workflows,
  ...aiFactoryCreatorsWorkflows,
  ...germanRozWorkflows,
};

export const clickupRegistryByPipelineId: Record<string, ClickUpPipelineConfig> = {
  ...(company1Ids.pipelineId ? { [company1Ids.pipelineId]: company1ClickupConfig } : {}),
  ...(aiFactoryCreatorsIds.pipelineId ? { [aiFactoryCreatorsIds.pipelineId]: aiFactoryCreatorsClickupConfig } : {}),
};
