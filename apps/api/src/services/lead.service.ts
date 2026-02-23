import { supabaseAdmin } from '../db/supabase';

interface CreateLeadInput {
  organizationId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source?: string;
  status?: string;
}

export async function createOrUpdateLead(input: CreateLeadInput) {
  const { data: existing } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('organization_id', input.organizationId)
    .eq('email', input.email)
    .single();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .update({
        first_name: input.firstName ?? existing.first_name,
        last_name: input.lastName ?? existing.last_name,
        phone: input.phone ?? existing.phone,
        source: input.source ?? existing.source,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return { lead: data!, isNew: false };
  }

  const { data, error } = await supabaseAdmin
    .from('leads')
    .insert({
      organization_id: input.organizationId,
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      source: input.source,
      status: input.status ?? 'new',
    })
    .select()
    .single();

  if (error) throw error;
  return { lead: data!, isNew: true };
}

export async function getLeadById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getLeadsByOrg(organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
