import { supabaseAdmin } from '@marketing-funnel/db';
import { sequenceRegistry } from '../../orgs';

export async function enrollLead(
  sequenceKey: string,
  leadId: string,
  organizationId: string,
  pipelineEntryId?: string,
) {
  if (!sequenceRegistry[sequenceKey]) {
    throw new Error(`Sequence "${sequenceKey}" not found in registry`);
  }

  // Prevent duplicate active enrollments in the same sequence
  const { data: existing } = await supabaseAdmin
    .from('sequence_enrollments')
    .select('id')
    .eq('sequence_key', sequenceKey)
    .eq('lead_id', leadId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log(`[enrollment] Lead ${leadId} already active in "${sequenceKey}" — skipping`);
    return existing;
  }

  const { data, error } = await supabaseAdmin
    .from('sequence_enrollments')
    .insert({
      sequence_key: sequenceKey,
      organization_id: organizationId,
      lead_id: leadId,
      lead_pipeline_entry_id: pipelineEntryId ?? null,
      current_step_index: 0,
      status: 'active',
      next_step_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  console.log(`[enrollment] Enrolled lead ${leadId} in "${sequenceKey}"`);
  return data!;
}

export async function unenrollLead(enrollmentId: string) {
  const { error } = await supabaseAdmin
    .from('sequence_enrollments')
    .update({
      status: 'unenrolled',
      next_step_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId);

  if (error) throw error;
}

export async function pauseEnrollment(enrollmentId: string) {
  const { error } = await supabaseAdmin
    .from('sequence_enrollments')
    .update({
      status: 'paused',
      next_step_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId);

  if (error) throw error;
}

export async function resumeEnrollment(enrollmentId: string) {
  const { error } = await supabaseAdmin
    .from('sequence_enrollments')
    .update({
      status: 'active',
      next_step_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId);

  if (error) throw error;
}

export async function getActiveEnrollments(leadId: string) {
  const { data, error } = await supabaseAdmin
    .from('sequence_enrollments')
    .select('*')
    .eq('lead_id', leadId)
    .eq('status', 'active');

  if (error) throw error;
  return data;
}

export async function getEnrollmentById(enrollmentId: string) {
  const { data, error } = await supabaseAdmin
    .from('sequence_enrollments')
    .select('*')
    .eq('id', enrollmentId)
    .single();

  if (error) throw error;
  return data;
}

export async function getEnrollmentsForLead(leadId: string) {
  const { data, error } = await supabaseAdmin
    .from('sequence_enrollments')
    .select('*')
    .eq('lead_id', leadId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data;
}
