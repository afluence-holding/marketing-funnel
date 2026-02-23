import type { RoutingEngine } from '../../types';
import { IDS } from './config';

/**
 * Routing logic for project-1.
 * For now, every lead goes to the main funnel at the "New Lead" stage.
 * Expand this later with custom field checks (role, company_size, etc.)
 */
export const routingEngine: RoutingEngine = (_lead, _customFields, _source) => {
  if (!IDS.funnelId || !IDS.stages.new_lead) {
    console.warn('Project-1 routing: missing funnel/stage IDs — skipping routing');
    return [];
  }

  return [
    {
      funnelId: IDS.funnelId,
      initialStageId: IDS.stages.new_lead,
      channel: 'inbound',
    },
  ];
};
