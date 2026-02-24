import {
  makeCall,
  getConversation,
  type CallOutcome,
  type TranscriptMessage,
} from '@marketing-funnel/elevenlabs';
import { getLeadById } from './lead.service';
import { logActivity, getActivityForLead } from './activity-log.service';
import { eventBus } from '../engine/event-bus';

interface CallLeadOptions {
  orgId: string;
  pipelineEntryId?: string;
  dynamicVariables?: Record<string, string>;
  firstMessage?: string;
  agentId?: string;
}

export async function callLead(
  leadId: string,
  options: CallLeadOptions,
): Promise<{ conversationId: string }> {
  const lead = await getLeadById(leadId);
  if (!lead) throw new Error(`Lead ${leadId} not found`);
  if (!lead.phone) throw new Error(`Lead ${leadId} has no phone number`);

  const dynamicVars: Record<string, string> = {
    lead_name: [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'there',
    lead_email: lead.email,
    lead_source: lead.source ?? 'unknown',
    ...options.dynamicVariables,
  };

  const result = await makeCall({
    toNumber: lead.phone,
    agentId: options.agentId,
    dynamicVariables: dynamicVars,
    conversationConfigOverride: options.firstMessage
      ? { firstMessage: options.firstMessage }
      : undefined,
  });

  await logActivity(
    options.orgId,
    leadId,
    'ai_call_initiated',
    {
      conversationId: result.conversationId,
      toNumber: lead.phone,
      agentId: options.agentId ?? 'default',
    },
    options.pipelineEntryId,
  );

  return { conversationId: result.conversationId };
}

export async function handleCallCompleted(
  conversationId: string,
): Promise<void> {
  const conversation = await getConversation(conversationId);

  const activities = await findLeadByConversation(conversationId);
  if (!activities) {
    console.warn(`[call.service] No lead found for conversation ${conversationId}`);
    return;
  }

  const { leadId, orgId, pipelineEntryId } = activities;

  const outcome: CallOutcome = conversation.status === 'done' ? 'answered' : 'failed';

  await logActivity(
    orgId,
    leadId,
    'ai_call_completed',
    {
      conversationId,
      durationSecs: conversation.metadata.callDurationSecs,
      transcriptLength: conversation.transcript.length,
      outcome,
      hasAudio: conversation.hasAudio,
    },
    pipelineEntryId,
  );

  eventBus.emit({
    type: 'call_completed',
    organizationId: orgId,
    leadId,
    pipelineEntryId,
    metadata: { conversationId, outcome },
    timestamp: new Date(),
  });
}

export async function handleCallFailed(
  conversationId: string | undefined,
  error: string,
  agentId: string,
): Promise<void> {
  if (!conversationId) {
    console.error(`[call.service] Call initiation failed: ${error} (agent: ${agentId})`);
    return;
  }

  const activities = await findLeadByConversation(conversationId);
  if (!activities) return;

  await logActivity(
    activities.orgId,
    activities.leadId,
    'ai_call_failed',
    { conversationId, error },
    activities.pipelineEntryId,
  );

  eventBus.emit({
    type: 'call_failed',
    organizationId: activities.orgId,
    leadId: activities.leadId,
    pipelineEntryId: activities.pipelineEntryId,
    metadata: { conversationId, error },
    timestamp: new Date(),
  });
}

async function findLeadByConversation(conversationId: string) {
  const { supabaseAdmin } = await import('@marketing-funnel/db');

  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select('lead_id, organization_id, lead_pipeline_entry_id')
    .eq('action', 'ai_call_initiated')
    .filter('metadata->>conversationId', 'eq', conversationId)
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    leadId: data.lead_id,
    orgId: data.organization_id,
    pipelineEntryId: data.lead_pipeline_entry_id ?? undefined,
  };
}
