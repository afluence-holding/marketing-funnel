import { supabaseAdmin } from '../db/supabase';

export async function saveCustomFieldValues(
  organizationId: string,
  entityType: string,
  entityId: string,
  customFields: Record<string, string>,
) {
  const { data: definitions } = await supabaseAdmin
    .from('custom_field_definitions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('entity_type', entityType);

  if (!definitions || definitions.length === 0) return [];

  const defsByKey = new Map(definitions.map((d) => [d.field_key, d]));
  const values: Array<{
    entity_type: string;
    entity_id: string;
    field_definition_id: string;
    value: string;
  }> = [];

  for (const [key, value] of Object.entries(customFields)) {
    const def = defsByKey.get(key);
    if (!def) continue;
    values.push({
      entity_type: entityType,
      entity_id: entityId,
      field_definition_id: def.id,
      value,
    });
  }

  if (values.length === 0) return [];

  // Upsert: delete old values for this entity, then insert new ones
  await supabaseAdmin
    .from('custom_field_values')
    .delete()
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  const { data, error } = await supabaseAdmin
    .from('custom_field_values')
    .insert(values)
    .select();

  if (error) throw error;
  return data;
}

export async function getCustomFieldValues(entityType: string, entityId: string) {
  const { data, error } = await supabaseAdmin
    .from('custom_field_values')
    .select('*, custom_field_definitions(*)')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (error) throw error;

  const result: Record<string, string> = {};
  for (const row of data ?? []) {
    const def = row.custom_field_definitions as { field_key: string } | null;
    if (def) result[def.field_key] = row.value ?? '';
  }
  return result;
}
