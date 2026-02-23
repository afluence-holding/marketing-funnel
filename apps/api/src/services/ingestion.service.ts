import { createOrUpdateLead } from './lead.service';
import { saveCustomFieldValues, getCustomFieldValues } from './custom-field.service';
import { createFunnelEntry } from './lead-funnel.service';
import { logActivity } from './activity-log.service';
import type { RoutingEngine } from '../types';

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
}

export async function ingestLead(input: IngestInput, routingEngine: RoutingEngine) {
  // 1. Create or update lead
  const { lead, isNew } = await createOrUpdateLead({
    organizationId: input.organizationId,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
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
  const allCustomFields = await getCustomFieldValues('lead', lead.id);

  // 4. Run routing engine
  const decisions = routingEngine(
    { id: lead.id, email: lead.email, organizationId: input.organizationId },
    allCustomFields,
    {
      type: input.sourceType ?? 'api',
      id: input.sourceId,
      utmData: input.utmData,
    },
  );

  // 5. Create funnel entries for each routing decision
  const entries = [];
  for (const decision of decisions) {
    const entry = await createFunnelEntry({
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
      'lead.routed_to_funnel',
      { funnelId: decision.funnelId, stageId: decision.initialStageId },
      entry.id,
    );
  }

  // 6. Log the ingestion event
  await logActivity(
    input.organizationId,
    lead.id,
    isNew ? 'lead.created' : 'lead.updated',
    { source: input.source, channel: input.channel, utmData: input.utmData },
  );

  return { lead, isNew, entries, decisions };
}
