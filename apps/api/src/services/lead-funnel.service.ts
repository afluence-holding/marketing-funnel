import { supabaseAdmin } from '../db/supabase';
import type { RoutingDecision } from '../types';

interface CreateEntryInput {
  leadId: string;
  decision: RoutingDecision;
  triggerType: 'automatic' | 'manual';
  sourceType?: string;
  sourceId?: string;
  utmData?: Record<string, string>;
}

export async function createFunnelEntry(input: CreateEntryInput) {
  const { data: entry, error: entryError } = await supabaseAdmin
    .from('lead_funnel_entries')
    .insert({
      lead_id: input.leadId,
      funnel_id: input.decision.funnelId,
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

  // Record initial stage history (null → first stage)
  const { error: historyError } = await supabaseAdmin
    .from('lead_stage_history')
    .insert({
      lead_funnel_entry_id: entry!.id,
      from_stage_id: null,
      to_stage_id: input.decision.initialStageId,
    });

  if (historyError) throw historyError;

  return entry!;
}

export async function getEntriesForLead(leadId: string) {
  const { data, error } = await supabaseAdmin
    .from('lead_funnel_entries')
    .select('*, funnels(*), funnel_stages(*)')
    .eq('lead_id', leadId);

  if (error) throw error;
  return data;
}
