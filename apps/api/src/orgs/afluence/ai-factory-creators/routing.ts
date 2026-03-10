import type { RoutingEngine } from '../../../core/types';
import { IDS } from './config';

function isTruthy(value?: string) {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

export const routingEngine: RoutingEngine = (lead, customFields, source) => {
  if (
    !IDS.pipelineId ||
    !IDS.stages.pre_qualified_lead ||
    !IDS.stages.meeting_schedule ||
    !IDS.stages.prospecting
  ) {
    console.warn('ai-factory-creators routing: missing pipeline/stage IDs — skipping routing');
    return [];
  }

  const formType = customFields.form_type?.toLowerCase();
  const meetingScheduled = isTruthy(customFields.meeting_scheduled);
  const isOutboundManual = source.channel === 'outbound';

  if (isOutboundManual) {
    return [
      {
        pipelineId: IDS.pipelineId,
        initialStageId: IDS.stages.prospecting,
        channel: 'outbound',
      },
    ];
  }

  if (formType === 'partial' && lead.email) {
    return [
      {
        pipelineId: IDS.pipelineId,
        initialStageId: IDS.stages.pre_qualified_lead,
        channel: 'inbound',
      },
    ];
  }

  if (formType === 'full' && meetingScheduled) {
    return [
      {
        pipelineId: IDS.pipelineId,
        initialStageId: IDS.stages.meeting_schedule,
        channel: 'inbound',
      },
    ];
  }

  if (formType === 'full' && !meetingScheduled) {
    console.warn(
      'ai-factory-creators routing: full form without meeting_scheduled=true, falling back to pre_qualified_lead',
    );
    return [
      {
        pipelineId: IDS.pipelineId,
        initialStageId: IDS.stages.pre_qualified_lead,
        channel: 'inbound',
      },
    ];
  }

  console.warn('ai-factory-creators routing: unknown form_type, falling back to pre_qualified_lead', {
    formType,
  });
  return [
    {
      pipelineId: IDS.pipelineId,
      initialStageId: IDS.stages.pre_qualified_lead,
      channel: 'inbound',
    },
  ];
};
