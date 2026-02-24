/**
 * ============================================================================
 * ROUTING — Where do leads go when they arrive?
 * ============================================================================
 *
 * The routing engine is called by ingestion.service.ts after a lead is
 * created or updated. It returns an array of RoutingDecision objects.
 * Each decision creates a lead_pipeline_entry (puts the lead in a pipeline
 * at a specific stage).
 *
 * WHEN IS THIS CALLED?
 * - Every time POST /api/ingest is hit for this organization.
 * - The ingestion service passes: the lead, their custom fields, and source info.
 *
 * WHAT SHOULD IT RETURN?
 * - An array of { pipelineId, initialStageId, channel }.
 * - Usually 1 entry. Can be 0 (skip routing) or 2+ (put lead in multiple pipelines).
 *
 * INPUTS AVAILABLE:
 * - lead: { id, email, organizationId }
 * - customFields: Record<string, string>  — values from the landing page form
 * - source: { type, id?, utmData? }       — where the lead came from
 */

import type { RoutingEngine } from '../../../core/types';
import { IDS } from './config';

// ===========================================================================
// OPTION A: Simple routing (most common for v0)
// Every lead goes to the same pipeline at the first stage.
// ===========================================================================

export const routingEngine: RoutingEngine = (_lead, _customFields, _source) => {
  if (!IDS.pipelineId || !IDS.stages.new_lead) {
    console.warn('[routing] Missing pipeline/stage IDs — skipping. Run seed.ts first.');
    return [];
  }

  return [
    {
      pipelineId: IDS.pipelineId,
      initialStageId: IDS.stages.new_lead,
      channel: 'inbound',
    },
  ];
};

// ===========================================================================
// OPTION B: Route based on custom fields (uncomment to use)
// Example: route "creators" and "companies" to different starting stages.
// ===========================================================================

/*
export const routingEngine: RoutingEngine = (_lead, customFields, _source) => {
  if (!IDS.pipelineId) return [];

  const role = customFields['role']?.toLowerCase() ?? '';

  if (role.includes('creator') || role.includes('influencer')) {
    return [{
      pipelineId: IDS.pipelineId,
      initialStageId: IDS.stages.new_lead,
      channel: 'inbound',
    }];
  }

  if (role.includes('company') || role.includes('business')) {
    return [{
      pipelineId: IDS.pipelineId,
      initialStageId: IDS.stages.qualified,  // companies skip to qualified
      channel: 'inbound',
    }];
  }

  // Default: new lead stage
  return [{
    pipelineId: IDS.pipelineId,
    initialStageId: IDS.stages.new_lead,
    channel: 'inbound',
  }];
};
*/

// ===========================================================================
// OPTION C: Route based on UTM source (uncomment to use)
// Example: paid ads go to one pipeline, organic to another.
// ===========================================================================

/*
export const routingEngine: RoutingEngine = (_lead, _customFields, source) => {
  if (!IDS.pipelineId) return [];

  const utm = source.utmData?.utm_medium ?? '';

  return [{
    pipelineId: IDS.pipelineId,
    initialStageId: IDS.stages.new_lead,
    channel: utm === 'cpc' || utm === 'paid' ? 'outbound' : 'inbound',
  }];
};
*/

// ===========================================================================
// OPTION D: Skip routing entirely (uncomment to use)
// Lead is created but not placed in any pipeline. Useful for "list only" leads.
// ===========================================================================

/*
export const routingEngine: RoutingEngine = () => [];
*/
