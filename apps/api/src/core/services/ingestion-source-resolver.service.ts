import type { RoutingEngine } from '../types';
import { IDS as bu1Ids } from '../../orgs/afluence/business-unit-1/config';
import { routingEngine as bu1RoutingEngine } from '../../orgs/afluence/business-unit-1/routing';
import { IDS as aiFactoryCreatorsIds } from '../../orgs/afluence/ai-factory-creators/config';
import { routingEngine as aiFactoryCreatorsRoutingEngine } from '../../orgs/afluence/ai-factory-creators/routing';
import { IDS as germanRozIds } from '../../orgs/german-roz/main/config';
import { routingEngine as germanRozRoutingEngine } from '../../orgs/german-roz/main/routing';

interface IngestionTarget {
  organizationId: string;
  routingEngine: RoutingEngine;
  businessUnit: 'business-unit-1' | 'ai-factory-creators' | 'main';
}

const AI_FACTORY_CREATORS_SOURCE = 'landing-ai-factory-creators-v1';
const GERMAN_ROZ_SOURCES = new Set([
  'landing-german-roz-form',
  'landing-german-roz-html',
  'landing-german-roz-vsl-desinflamate',
  'landing-german-roz-desinflamate-vsl',
]);
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

  if (source && GERMAN_ROZ_SOURCES.has(source)) {
    return {
      organizationId: germanRozIds.organizationId,
      routingEngine: germanRozRoutingEngine,
      businessUnit: 'main',
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
    `Unknown source "${source}". Allowed sources: "${AI_FACTORY_CREATORS_SOURCE}", "landing-german-roz-form", "landing-german-roz-html", "landing-german-roz-vsl-desinflamate", "landing-german-roz-desinflamate-vsl", "${BU1_SOURCE_PREFIX}*", or known BU1 landing sources`,
  );
}
