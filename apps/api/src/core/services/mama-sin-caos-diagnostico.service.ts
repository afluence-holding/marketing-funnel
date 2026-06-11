import { supabaseAdmin } from '@marketing-funnel/db';
import { IDS as mamaSinCaosIds } from '../../orgs/mama-sin-caos/main/config';

/**
 * Read model para el dashboard de respuestas del diagnóstico de Mamá Sin Caos.
 *
 * A diferencia de Caro Fitness (tabla dedicada `caro_fitness_progress`), el
 * diagnóstico de Mamá Sin Caos ingesta por la ruta genérica → `marketing.leads`
 * + `custom_field_values` (ver `ingestion.service.ts`). Este servicio reconstruye
 * la tabla aplanada (lead + custom fields, p.ej. `arquetipo`) con la MISMA forma
 * de salida que `listCaroFitnessProgressForTable`, para que el panel del front
 * sea un espejo del de Caro.
 */

export const MAMA_SIN_CAOS_DIAGNOSTICO_SOURCE = 'landing-mama-sin-caos-diagnostico';

const BASE_HEADERS = [
  'lead_id',
  'created_at',
  'updated_at',
  'first_name',
  'email',
  'phone',
  'source',
] as const;

type LeadRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  phone: string | null;
  source: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type CustomFieldDefinitionRow = {
  id: string;
  field_key: string;
};

type CustomFieldValueRow = {
  entity_id: string;
  field_definition_id: string;
  value: string | null;
};

async function fetchAllDiagnosticoLeads(organizationId: string): Promise<LeadRow[]> {
  const pageSize = 1000;
  let page = 0;
  const allRows: LeadRow[] = [];

  // PostgREST limita a 1000 filas/petición → paginamos (ya hay ~1k respuestas).
  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('id, email, first_name, phone, source, created_at, updated_at')
      .eq('organization_id', organizationId)
      .eq('source', MAMA_SIN_CAOS_DIAGNOSTICO_SOURCE)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const rows = (data ?? []) as LeadRow[];
    allRows.push(...rows);
    if (rows.length < pageSize) break;
    page += 1;
  }

  return allRows;
}

export async function listMamaSinCaosDiagnosticoForTable() {
  const organizationId = mamaSinCaosIds.organizationId;
  if (!organizationId) {
    throw new Error(
      'Missing MAMA_SIN_CAOS_ORG_ID. Seed the org and set the env var before reading diagnostico responses.',
    );
  }

  const leads = await fetchAllDiagnosticoLeads(organizationId);
  const leadIds = leads.map((lead) => lead.id);

  // Custom field definitions del org (entity_type = 'lead'): p.ej. `arquetipo`.
  const { data: definitions, error: defsError } = await supabaseAdmin
    .from('custom_field_definitions')
    .select('id, field_key')
    .eq('organization_id', organizationId)
    .eq('entity_type', 'lead');

  if (defsError) throw defsError;

  const typedDefinitions = (definitions ?? []) as CustomFieldDefinitionRow[];
  const fieldKeyByDefinitionId = new Map<string, string>();
  for (const definition of typedDefinitions) {
    fieldKeyByDefinitionId.set(definition.id, definition.field_key);
  }

  const customFieldKeys = Array.from(
    new Set(typedDefinitions.map((definition) => definition.field_key)),
  ).sort();

  // Valores de custom fields por lead (en chunks para no exceder límites del `in`).
  const customValuesByLeadId = new Map<string, Record<string, string>>();
  const leadChunkSize = 300;
  for (let i = 0; i < leadIds.length; i += leadChunkSize) {
    const chunk = leadIds.slice(i, i + leadChunkSize);
    if (!chunk.length) continue;

    const { data: values, error: valuesError } = await supabaseAdmin
      .from('custom_field_values')
      .select('entity_id, field_definition_id, value')
      .eq('entity_type', 'lead')
      .in('entity_id', chunk);

    if (valuesError) throw valuesError;

    for (const value of (values ?? []) as CustomFieldValueRow[]) {
      const fieldKey = fieldKeyByDefinitionId.get(value.field_definition_id);
      if (!fieldKey) continue;
      const entry = customValuesByLeadId.get(value.entity_id) ?? {};
      entry[fieldKey] = value.value ?? '';
      customValuesByLeadId.set(value.entity_id, entry);
    }
  }

  const data = leads.map((lead) => {
    const row: Record<string, string> = {
      lead_id: lead.id,
      created_at: lead.created_at ?? '',
      updated_at: lead.updated_at ?? '',
      first_name: lead.first_name ?? '',
      email: lead.email ?? '',
      phone: lead.phone ?? '',
      source: lead.source ?? '',
    };

    const customValues = customValuesByLeadId.get(lead.id) ?? {};
    for (const key of customFieldKeys) {
      row[key] = customValues[key] ?? '';
    }

    return row;
  });

  return {
    ok: true as const,
    source: MAMA_SIN_CAOS_DIAGNOSTICO_SOURCE,
    storage: 'supabase' as const,
    total: data.length,
    headers: [...BASE_HEADERS, ...customFieldKeys],
    data,
  };
}
