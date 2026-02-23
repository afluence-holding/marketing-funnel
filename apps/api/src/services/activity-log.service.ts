import { supabaseAdmin } from '../db/supabase';
import type { Json } from '../db/types';

export async function logActivity(
  organizationId: string,
  leadId: string,
  action: string,
  metadata?: Record<string, Json | undefined>,
  leadFunnelEntryId?: string,
) {
  const { error } = await supabaseAdmin.from('activity_logs').insert({
    organization_id: organizationId,
    lead_id: leadId,
    lead_funnel_entry_id: leadFunnelEntryId ?? null,
    action,
    metadata: (metadata as Json) ?? null,
  });

  if (error) throw error;
}

export async function getActivityForLead(leadId: string) {
  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
