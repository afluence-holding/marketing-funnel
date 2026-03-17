import {
  ClickUpClient,
  type ClickUpCustomField,
  type ClickUpCustomFieldOption,
  type ClickUpTaskPayload,
} from '@marketing-funnel/clickup-client';
import { supabaseAdmin } from '@marketing-funnel/db';
import { clickupRegistryByPipelineId } from '../../orgs';
import type { ClickUpPipelineConfig } from '../types';
import { getCustomFieldValues } from './custom-field.service';

interface CreateTaskInput {
  pipelineEntryId: string;
  leadId: string;
}

interface UpdateStatusInput {
  pipelineEntryId: string;
  stageId?: string;
}

function normalizeText(value: string | undefined | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Unify dash variants (en/em/minus) so "1–5K" and "1-5K" match equally.
    .replace(/[–—−]/g, '-')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function findFieldsByNames(fields: ClickUpCustomField[], names: string[]): ClickUpCustomField[] {
  const targets = new Set(names.map((n) => normalizeText(n)));
  return fields.filter((f) => targets.has(normalizeText(f.name)));
}

function resolveOptionId(field: ClickUpCustomField, rawValue: string): string | undefined {
  const options = field.type_config?.options ?? [];
  const normalized = normalizeText(rawValue);
  const getOptionText = (opt: ClickUpCustomFieldOption) => {
    const asRecord = opt as Record<string, unknown>;
    const label = typeof asRecord.label === 'string' ? asRecord.label : '';
    return normalizeText(opt.name ?? label);
  };

  const direct = options.find((opt) => getOptionText(opt) === normalized);
  if (direct?.id) return direct.id;
  const contains = options.find(
    (opt) =>
      getOptionText(opt).includes(normalized) || normalized.includes(getOptionText(opt)),
  );
  return contains?.id;
}

function formatPhoneForClickup(rawPhone: string | null | undefined): string {
  const digits = (rawPhone ?? '').replace(/\D/g, '');
  if (!digits) return '';
  // Internal normalization stores WhatsApp-ready MX numbers as 521XXXXXXXXXX.
  // ClickUp "phone" field expects +52XXXXXXXXXX (without the extra "1").
  const normalized = digits.startsWith('521') ? `52${digits.slice(3)}` : digits;
  return `+${normalized}`;
}

async function setFieldIfPossible(params: {
  client: ClickUpClient;
  taskId: string;
  listFields: ClickUpCustomField[];
  fieldNames: string[];
  value?: string | string[];
  preferredType?: 'labels' | 'drop_down';
}) {
  const rawValues = Array.isArray(params.value)
    ? params.value.map((v) => v?.trim()).filter((v): v is string => Boolean(v))
    : [params.value?.trim()].filter((v): v is string => Boolean(v));
  if (!rawValues.length) return;

  const fields = findFieldsByNames(params.listFields, params.fieldNames);
  if (!fields.length) return;
  const prioritizedFields = params.preferredType
    ? [
        ...fields.filter((field) => field.type === params.preferredType),
        ...fields.filter((field) => field.type !== params.preferredType),
      ]
    : fields;

  for (const field of prioritizedFields) {
    let payloadValue: unknown = rawValues[0];

    if (field.type === 'drop_down') {
      const optionId = resolveOptionId(field, rawValues[0] ?? '');
      if (!optionId) {
        console.log(
          `[clickup.service] No dropdown option match for "${field.name}" value "${rawValues[0] ?? ''}"`,
        );
        continue;
      }
      payloadValue = optionId;
    } else if (field.type === 'labels') {
      const optionIds = rawValues
        .map((value) => resolveOptionId(field, value))
        .filter((id): id is string => Boolean(id));
      if (!optionIds.length) {
        console.log(`[clickup.service] No labels option match for "${field.name}" values "${rawValues.join(', ')}"`);
        continue;
      }
      payloadValue = optionIds;
    } else if (rawValues.length > 1) {
      payloadValue = rawValues.join(', ');
    }

    try {
      await params.client.setTaskCustomField(params.taskId, field.id, payloadValue);
    } catch (err) {
      console.error(`[clickup.service] Failed setting custom field "${field.name}"`, err);
    }
  }
}

async function syncTaskCustomFields(
  client: ClickUpClient,
  listId: string,
  taskId: string,
  channel: 'inbound' | 'outbound',
  lead: { id: string; first_name: string | null; last_name: string | null; email: string; phone: string | null },
) {
  const listFields = await client.getListCustomFields(listId);
  if (!listFields.length) return;

  const custom = await getCustomFieldValues('lead', lead.id);
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim() || lead.email;
  const linkRrss = custom.link_social || custom.linkSocial || custom.instagram_handle || '';
  const parseMultiValue = (value: string | undefined) => {
    if (!value) return [] as string[];
    const trimmed = value.trim();
    if (!trimmed) return [] as string[];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
      } catch {
        // fallback below
      }
    }
    return trimmed
      .split(/[|,;]/)
      .map((v) => v.trim())
      .filter(Boolean);
  };
  const normalizeServiceInterest = (rawValue: string) => {
    const v = normalizeText(rawValue);
    if (v.includes('app')) return 'App para mi audiencia';
    if (v.includes('reto')) return 'Reto con IA';
    if (v.includes('membres')) return 'Membresía';
    if (v.includes('curso')) return 'Curso digital';
    if (v.includes('automat')) return 'Automatización con IA';
    if (v.includes('voz')) return 'Agentes de voz';
    if (v.includes('plataforma') || v.includes('ecosystem') || v.includes('ecosistema')) return 'Plataforma web';
    return rawValue;
  };
  const serviceInterestValues = (() => {
    const fromServiceInterest = parseMultiValue(custom.service_interest);
    const fromQueConstruir = parseMultiValue(custom.que_construir);
    const merged = [...fromServiceInterest, ...fromQueConstruir]
      .map((v) => normalizeServiceInterest(v))
      .map((v) => v.trim())
      .filter(Boolean);
    if (merged.length) return Array.from(new Set(merged));
    if (custom.service_interest) return [normalizeServiceInterest(custom.service_interest)];
    if (custom.que_construir) return [normalizeServiceInterest(custom.que_construir)];
    return [] as string[];
  })();
  const facturacion = (() => {
    const v = normalizeText(custom.facturacion);
    if (v === 'aun no monetizo' || v === 'aún no monetizo') return 'Aún no monetizo';
    if (v === '0-1k' || v === '0-1k usd') return '0-1K USD';
    if (v === '1-5k' || v === '1-5k usd') return '1-5K USD';
    if (v === '5-20k' || v === '5-20k usd') return '5-20K USD';
    if (v === '20k+' || v === '20k+ usd') return '20K+ USD';
    return custom.facturacion || '';
  })();
  const generaIngresos = (() => {
    const v = normalizeText(custom.genera_ingresos || custom.generaIngresos);
    if (v === 'si' || v === 'sí' || v === 'yes' || v === 'true') return 'Si';
    if (v === 'no' || v === 'false') return 'No';
    return custom.genera_ingresos || custom.generaIngresos || '';
  })();
  const inversion = (() => {
    const v = normalizeText(custom.inversion);
    if (v === 'ready' || v.includes('listo')) return 'Listo desde 7K';
    if (v === 'evaluating' || v.includes('evalu')) return 'Evaluando';
    if (v === 'lower' || v.includes('menor') || v.includes('busco')) return 'Busco algo menor';
    return custom.inversion || '';
  })();
  const timing = (() => {
    const v = normalizeText(custom.timing);
    if (!v) return '';
    if (v.includes('inmediat')) return 'Inmediatamente';
    if (v.includes('1-3') || v.includes('1 a 3')) return '1-3 meses';
    if (v.includes('3-6') || v.includes('3 a 6')) return '3-6 meses';
    if (v.includes('explor')) return 'Explorando';
    return custom.timing || '';
  })();
  const confirmaWhatsapp = (() => {
    const raw = custom.confirma_whatsapp || custom.confirmaWhatsapp || custom.confirmacion_whatsapp || '';
    const v = normalizeText(raw);
    if (v === 'yes' || v === 'si' || v === 'sí' || v === 'true') return 'Sí';
    if (v === 'no' || v === 'false') return 'No';
    return raw;
  })();
  const dealType = channel === 'outbound' ? 'Outbound' : 'Inbound';
  const clickupPhone = formatPhoneForClickup(lead.phone);

  await setFieldIfPossible({ client, taskId, listFields, fieldNames: ['Nombre Completo'], value: fullName });
  await setFieldIfPossible({ client, taskId, listFields, fieldNames: ['Email'], value: lead.email });
  await setFieldIfPossible({
    client,
    taskId,
    listFields,
    fieldNames: ['Phone', 'WhatsApp', 'Telefono'],
    value: clickupPhone,
  });
  await setFieldIfPossible({ client, taskId, listFields, fieldNames: ['Deal Type'], value: dealType });
  await setFieldIfPossible({
    client,
    taskId,
    listFields,
    fieldNames: ['Servicios de Interés', 'Servicios de Interes'],
    value: serviceInterestValues,
    preferredType: 'labels',
  });
  await setFieldIfPossible({ client, taskId, listFields, fieldNames: ['Nicho'], value: custom.nicho });
  await setFieldIfPossible({
    client,
    taskId,
    listFields,
    fieldNames: ['Facturación Mensual', 'Facturacion Mensual'],
    value: facturacion,
  });
  await setFieldIfPossible({
    client,
    taskId,
    listFields,
    fieldNames: ['Genera Ingresos'],
    value: generaIngresos,
  });
  await setFieldIfPossible({
    client,
    taskId,
    listFields,
    fieldNames: ['Disposición Inversión', 'Disposicion Inversion'],
    value: inversion,
  });
  await setFieldIfPossible({ client, taskId, listFields, fieldNames: ['Link RRSS', 'Link Redes'], value: linkRrss });
  await setFieldIfPossible({
    client,
    taskId,
    listFields,
    fieldNames: ['Timing de Lanzamiento', 'Timing', 'Cuando te gustaria lanzar'],
    value: timing,
  });
  await setFieldIfPossible({
    client,
    taskId,
    listFields,
    fieldNames: ['Confirma WhatsApp', 'Confirmación WhatsApp', 'Confirmacion WhatsApp'],
    value: confirmaWhatsapp,
  });
}

function resolveClickUpConfig(pipelineId: string): ClickUpPipelineConfig | null {
  const config = clickupRegistryByPipelineId[pipelineId];
  if (!config || !config.enabled || !config.apiToken || !config.listId) return null;
  return config;
}

export async function createClickUpTaskForEntry(input: CreateTaskInput): Promise<string | null> {
  const { data: entry, error: entryError } = await supabaseAdmin
    .from('lead_pipeline_entries')
    .select('id, lead_id, pipeline_id, current_stage_id, channel, clickup_task_id')
    .eq('id', input.pipelineEntryId)
    .single();

  if (entryError || !entry) throw entryError ?? new Error('Pipeline entry not found');

  if (entry.clickup_task_id) {
    console.log(`[clickup.service] Entry ${entry.id} already linked to task ${entry.clickup_task_id}`);
    return entry.clickup_task_id;
  }

  // Confirmed strategy: only inbound entries trigger task creation.
  if (entry.channel !== 'inbound') {
    console.log(`[clickup.service] Entry ${entry.id} is "${entry.channel}" — skip task creation`);
    return null;
  }

  const clickupConfig = resolveClickUpConfig(entry.pipeline_id);
  if (!clickupConfig) {
    console.log(`[clickup.service] ClickUp disabled or missing config for pipeline ${entry.pipeline_id}`);
    return null;
  }

  const { data: lead, error: leadError } = await supabaseAdmin
    .from('leads')
    .select('id, first_name, last_name, email, phone')
    .eq('id', input.leadId)
    .single();

  if (leadError || !lead) throw leadError ?? new Error('Lead not found');

  const status = clickupConfig.stageToStatusMap[entry.current_stage_id] || undefined;
  const taskPayload: ClickUpTaskPayload = {
    name: [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim() || lead.email,
    description: `Lead ${lead.email} (pipeline_entry_id: ${entry.id})`,
    status,
    ...(clickupConfig.customItemId ? { custom_item_id: clickupConfig.customItemId } : {}),
  };

  const client = new ClickUpClient({ apiToken: clickupConfig.apiToken });
  const task = await client.createTask(clickupConfig.listId, taskPayload);
  await syncTaskCustomFields(client, clickupConfig.listId, task.id, entry.channel as 'inbound' | 'outbound', lead);

  const { error: updateError } = await supabaseAdmin
    .from('lead_pipeline_entries')
    .update({
      clickup_task_id: task.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entry.id);

  if (updateError) throw updateError;

  console.log(`[clickup.service] Created ClickUp task ${task.id} for entry ${entry.id}`);
  return task.id;
}

export async function updateClickUpTaskStatusForEntry(input: UpdateStatusInput): Promise<void> {
  const { data: entry, error: entryError } = await supabaseAdmin
    .from('lead_pipeline_entries')
    .select('id, lead_id, pipeline_id, current_stage_id, clickup_task_id')
    .eq('id', input.pipelineEntryId)
    .single();

  if (entryError || !entry) throw entryError ?? new Error('Pipeline entry not found');
  if (!entry.clickup_task_id) {
    console.log(`[clickup.service] Entry ${entry.id} has no clickup_task_id — skip status update`);
    return;
  }

  const clickupConfig = resolveClickUpConfig(entry.pipeline_id);
  if (!clickupConfig) {
    console.log(`[clickup.service] ClickUp disabled or missing config for pipeline ${entry.pipeline_id}`);
    return;
  }

  const stageId = input.stageId ?? entry.current_stage_id;
  const targetStatus = clickupConfig.stageToStatusMap[stageId];

  if (!targetStatus) {
    console.log(`[clickup.service] No ClickUp status mapping for stage ${stageId}`);
    return;
  }

  const client = new ClickUpClient({ apiToken: clickupConfig.apiToken });
  try {
    await client.updateTaskStatus(entry.clickup_task_id, targetStatus);
    console.log(`[clickup.service] Updated ClickUp task ${entry.clickup_task_id} to "${targetStatus}"`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const missingTask = message.includes('ITEM_013') || message.toLowerCase().includes('task not found');
    if (!missingTask) throw error;

    console.warn(
      `[clickup.service] Task ${entry.clickup_task_id} missing for entry ${entry.id}; recreating task link`,
    );
    const { error: clearError } = await supabaseAdmin
      .from('lead_pipeline_entries')
      .update({
        clickup_task_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id);
    if (clearError) throw clearError;

    const recreatedTaskId = await createClickUpTaskForEntry({
      pipelineEntryId: entry.id,
      leadId: entry.lead_id,
    });
    if (!recreatedTaskId) {
      console.warn(`[clickup.service] Could not recreate task for entry ${entry.id}`);
      return;
    }

    console.log(`[clickup.service] Recreated missing task ${recreatedTaskId} for entry ${entry.id}`);
  }
}
