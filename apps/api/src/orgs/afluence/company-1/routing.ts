import type { RoutingEngine } from '../../../core/types';
import { IDS } from './config';

/**
 * Routing logic for company-1.
 * For now, every lead goes to the main pipeline at the "New Lead" stage.
 * Expand this later with custom field checks (role, company_size, etc.)
 */
export const routingEngine: RoutingEngine = (_lead, _customFields, _source) => {
  if (!IDS.pipelineId || !IDS.stages.new_lead) {
    console.warn('company-1 routing: missing pipeline/stage IDs — skipping routing');
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
