import { supabaseAdmin } from '@marketing-funnel/db';
import { eventBus } from '../engine/event-bus';
import { logActivity } from './activity-log.service';
import type { RoutingDecision } from '../types';

interface CreateEntryInput {
  leadId: string;
  decision: RoutingDecision;
  triggerType: 'automatic' | 'manual';
  sourceType?: string;
  sourceId?: string;
  utmData?: Record<string, string>;
}

export async function createPipelineEntry(input: CreateEntryInput) {
  const { data: entry, error: entryError } = await supabaseAdmin
    .from('lead_pipeline_entries')
    .insert({
      lead_id: input.leadId,
      pipeline_id: input.decision.pipelineId,
      current_stage_id: input.decision.initialStageId,
      channel: input.decision.channel,
      trigger_type: input.triggerType,
      source_type: input.sourceType,
      source_id: input.sourceId,
      utm_data: input.utmData ?? null,
    })
    .select()
    .single();

  if (entryError) throw entryError;

  const { error: historyError } = await supabaseAdmin
    .from('lead_stage_history')
    .insert({
      lead_pipeline_entry_id: entry!.id,
      from_stage_id: null,
      to_stage_id: input.decision.initialStageId,
    });

  if (historyError) throw historyError;

  return entry!;
}

export async function moveStage(
  entryId: string,
  newStageId: string,
  organizationId: string,
) {
  const { data: entry, error: fetchError } = await supabaseAdmin
    .from('lead_pipeline_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (fetchError || !entry) throw fetchError ?? new Error('Pipeline entry not found');

  const previousStageId = entry.current_stage_id;

  const { error: updateError } = await supabaseAdmin
    .from('lead_pipeline_entries')
    .update({ current_stage_id: newStageId, updated_at: new Date().toISOString() })
    .eq('id', entryId);

  if (updateError) throw updateError;

  const { error: historyError } = await supabaseAdmin
    .from('lead_stage_history')
    .insert({
      lead_pipeline_entry_id: entryId,
      from_stage_id: previousStageId,
      to_stage_id: newStageId,
    });

  if (historyError) throw historyError;

  await logActivity(organizationId, entry.lead_id, 'lead.stage_moved', {
    pipelineId: entry.pipeline_id,
    fromStageId: previousStageId,
    toStageId: newStageId,
  }, entryId);

  if (previousStageId) {
    eventBus.emit({
      type: 'stage_exited',
      organizationId,
      leadId: entry.lead_id,
      pipelineEntryId: entryId,
      metadata: { stageId: previousStageId, pipelineId: entry.pipeline_id },
      timestamp: new Date(),
    });
  }

  eventBus.emit({
    type: 'stage_entered',
    organizationId,
    leadId: entry.lead_id,
    pipelineEntryId: entryId,
    metadata: { stageId: newStageId, pipelineId: entry.pipeline_id },
    timestamp: new Date(),
  });

  return { entryId, previousStageId, newStageId };
}

export async function getEntriesForLead(leadId: string) {
  const { data, error } = await supabaseAdmin
    .from('lead_pipeline_entries')
    .select('*, pipelines(*), pipeline_stages(*)')
    .eq('lead_id', leadId);

  if (error) throw error;
  return data;
}
