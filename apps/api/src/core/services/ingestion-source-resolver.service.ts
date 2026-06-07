import type { RoutingEngine } from '../types';
import { IDS as bu1Ids } from '../../orgs/afluence/business-unit-1/config';
import { routingEngine as bu1RoutingEngine } from '../../orgs/afluence/business-unit-1/routing';
import { IDS as aiFactoryCreatorsIds } from '../../orgs/afluence/ai-factory-creators/config';
import { routingEngine as aiFactoryCreatorsRoutingEngine } from '../../orgs/afluence/ai-factory-creators/routing';
import { IDS as germanRozIds } from '../../orgs/german-roz/main/config';
import { routingEngine as germanRozRoutingEngine } from '../../orgs/german-roz/main/routing';
import { IDS as lucasConLucasIds } from '../../orgs/lucas-con-lucas/main/config';
import { routingEngine as lucasConLucasRoutingEngine } from '../../orgs/lucas-con-lucas/main/routing';
import { IDS as santiInversorResearchIds } from '../../orgs/santi-inversor/research/config';
import { routingEngine as santiInversorResearchRoutingEngine } from '../../orgs/santi-inversor/research/routing';
import { IDS as recetasCamiIds } from '../../orgs/recetas-cami/main/config';
import { routingEngine as recetasCamiRoutingEngine } from '../../orgs/recetas-cami/main/routing';
import { IDS as caroFitnessIds } from '../../orgs/caro-fitness/main/config';
import { routingEngine as caroFitnessRoutingEngine } from '../../orgs/caro-fitness/main/routing';

interface IngestionTarget {
  organizationId: string;
  routingEngine: RoutingEngine;
  businessUnit: 'business-unit-1' | 'ai-factory-creators' | 'main' | 'research';
}

const AI_FACTORY_CREATORS_SOURCE = 'landing-ai-factory-creators-v1';
const GERMAN_ROZ_SOURCES = new Set([
  'landing-german-roz-form',
  'landing-german-roz-html',
  'landing-german-roz-vsl-desinflamate',
  'landing-german-roz-desinflamate-vsl',
  // Waitlist para la próxima edición de Reto Desinflámate (DI21).
  // La landing vive en apps/web/src/app/(landings)/german-roz/lista-espera/.
  // Routea a la BU `german-roz/main`; los leads se distinguen del resto
  // por `customFields.list = 'waitlist'` + `customFields.edition = 'next'`.
  'landing-german-roz-waitlist-di21',
  'landing-german-roz-webinar-2026-06-10',
]);
const LUCAS_CON_LUCAS_SOURCES = new Set([
  'landing-lucas-con-lucas-pre-launch',
  'landing-lucas-con-lucas-webinar-2026-06-04',
]);
const SANTI_INVERSOR_SOURCES = new Set([
  'landing-santi-inversor-research-home',
]);
const RECETAS_CAMI_SOURCES = new Set([
  'landing-recetas-cami-waitlist',
]);
const CARO_FITNESS_SOURCES = new Set([
  'landing-caro-fitness-diagnostico',
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

  if (source && LUCAS_CON_LUCAS_SOURCES.has(source)) {
    return {
      organizationId: lucasConLucasIds.organizationId,
      routingEngine: lucasConLucasRoutingEngine,
      businessUnit: 'main',
    };
  }

  if (source && SANTI_INVERSOR_SOURCES.has(source)) {
    return {
      organizationId: santiInversorResearchIds.organizationId,
      routingEngine: santiInversorResearchRoutingEngine,
      businessUnit: 'research',
    };
  }

  if (source && RECETAS_CAMI_SOURCES.has(source)) {
    return {
      organizationId: recetasCamiIds.organizationId,
      routingEngine: recetasCamiRoutingEngine,
      businessUnit: 'main',
    };
  }

  if (source && CARO_FITNESS_SOURCES.has(source)) {
    return {
      organizationId: caroFitnessIds.organizationId,
      routingEngine: caroFitnessRoutingEngine,
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
    `Unknown source "${source}". Allowed sources: "${AI_FACTORY_CREATORS_SOURCE}", "landing-german-roz-form", "landing-german-roz-html", "landing-german-roz-vsl-desinflamate", "landing-german-roz-desinflamate-vsl", "landing-german-roz-waitlist-di21", "landing-german-roz-webinar-2026-06-10", "landing-lucas-con-lucas-pre-launch", "landing-lucas-con-lucas-webinar-2026-06-04", "landing-santi-inversor-research-home", "landing-recetas-cami-waitlist", "landing-caro-fitness-diagnostico", "${BU1_SOURCE_PREFIX}*", or known BU1 landing sources`,
  );
}
