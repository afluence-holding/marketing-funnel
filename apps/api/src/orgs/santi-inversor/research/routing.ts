import type { RoutingEngine } from '../../../core/types';
import { IDS } from './config';

export const routingEngine: RoutingEngine = (_lead, _customFields, _source) => {
  if (!IDS.pipelineId || !IDS.stages.new_lead) {
    console.warn('[santi-inversor/research routing] Missing pipeline/stage IDs — skipping. Run seed.ts first.');
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
