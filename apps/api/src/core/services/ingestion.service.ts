import { createOrUpdateLead } from './lead.service';
import { saveCustomFieldValues, getCustomFieldValues } from './custom-field.service';
import { createPipelineEntry } from './lead-pipeline.service';
import { logActivity } from './activity-log.service';
import { eventBus } from '../engine/event-bus';
import type { RoutingEngine } from '../types';
import { normalizePhoneAndGetTimezone } from '../utils/phone';

interface IngestInput {
  organizationId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source?: string;
  channel?: 'inbound' | 'outbound';
  sourceType?: string;
  sourceId?: string;
  utmData?: Record<string, string>;
  customFields?: Record<string, string>;
  phoneTimezone?: string;
}

export async function ingestLead(input: IngestInput, routingEngine: RoutingEngine) {
  const normalizedPhone = input.phone
    ? normalizePhoneAndGetTimezone(input.phone)
    : null;

  // 1. Create or update lead
  const { lead, isNew } = await createOrUpdateLead({
    organizationId: input.organizationId,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: normalizedPhone?.phone,
    source: input.source,
  });

  // 2. Save custom fields
  if (input.customFields && Object.keys(input.customFields).length > 0) {
    await saveCustomFieldValues(
      input.organizationId,
      'lead',
      lead.id,
      input.customFields,
    );
  }

  // 3. Get all custom fields for routing
  const persistedCustomFields = await getCustomFieldValues('lead', lead.id);
  // Use persisted values plus incoming payload to avoid routing gaps
  // when a field definition is missing or newly added.
  const allCustomFields = {
    ...persistedCustomFields,
    ...(input.customFields ?? {}),
  };

  // 4. Run routing engine
  const decisions = routingEngine(
    { id: lead.id, email: lead.email, organizationId: input.organizationId },
    allCustomFields,
    {
      type: input.sourceType ?? 'api',
      id: input.sourceId,
      channel: input.channel ?? 'inbound',
      utmData: input.utmData,
    },
  );

  // 5. Create pipeline entries for each routing decision
  const entries = [];
  for (const decision of decisions) {
    const entry = await createPipelineEntry({
      organizationId: input.organizationId,
      leadId: lead.id,
      decision,
      triggerType: 'automatic',
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      utmData: input.utmData,
    });
    entries.push(entry);

    await logActivity(
      input.organizationId,
      lead.id,
      'lead.routed_to_pipeline',
      { pipelineId: decision.pipelineId, stageId: decision.initialStageId },
      entry.id,
    );
  }

  // 6. Log the ingestion event
  await logActivity(
    input.organizationId,
    lead.id,
    isNew ? 'lead.created' : 'lead.updated',
    {
      source: input.source,
      channel: input.channel,
      utmData: input.utmData,
      phone: normalizedPhone?.phone,
      phoneTimezone: normalizedPhone?.timezone ?? input.phoneTimezone,
    },
  );

  // 7. Emit event for workflow engine
  eventBus.emit({
    type: isNew ? 'lead_created' : 'lead_updated',
    organizationId: input.organizationId,
    leadId: lead.id,
    metadata: {
      source: input.source,
      channel: input.channel,
      phone: normalizedPhone?.phone,
      phoneTimezone: normalizedPhone?.timezone ?? input.phoneTimezone,
    },
    timestamp: new Date(),
  });

  return { lead, isNew, entries, decisions };
}
