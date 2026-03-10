import type { RoutingEngine } from '../types';
import { IDS as bu1Ids } from '../../orgs/afluence/business-unit-1/config';
import { routingEngine as bu1RoutingEngine } from '../../orgs/afluence/business-unit-1/routing';
import { IDS as aiFactoryCreatorsIds } from '../../orgs/afluence/ai-factory-creators/config';
import { routingEngine as aiFactoryCreatorsRoutingEngine } from '../../orgs/afluence/ai-factory-creators/routing';

interface IngestionTarget {
  organizationId: string;
  routingEngine: RoutingEngine;
  businessUnit: 'business-unit-1' | 'ai-factory-creators';
}

const AI_FACTORY_CREATORS_SOURCE = 'landing-ai-factory-creators-v1';
const BU1_SOURCE_PREFIX = 'landing-bu1-';
const BU1_EXPLICIT_SOURCES = new Set([
  'landing-faktory-creators-v1',
]);

function isBusinessUnit1Source(source?: string) {
  if (!source) return true;
  return source.startsWith(BU1_SOURCE_PREFIX) || BU1_EXPLICIT_SOURCES.has(source);
}

export function resolveIngestionTargetBySource(rawSource?: string): IngestionTarget {
  const source = rawSource?.trim();

  if (source === AI_FACTORY_CREATORS_SOURCE) {
    return {
      organizationId: aiFactoryCreatorsIds.organizationId,
      routingEngine: aiFactoryCreatorsRoutingEngine,
      businessUnit: 'ai-factory-creators',
    };
  }

  if (isBusinessUnit1Source(source)) {
    return {
      organizationId: bu1Ids.organizationId,
      routingEngine: bu1RoutingEngine,
      businessUnit: 'business-unit-1',
    };
  }

  throw new Error(
    `Unknown source "${source}". Allowed sources: "${AI_FACTORY_CREATORS_SOURCE}", "${BU1_SOURCE_PREFIX}*", or known BU1 landing sources`,
  );
}
