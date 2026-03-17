import { ClickUpClient } from '@marketing-funnel/clickup-client';
import { supabaseAdmin } from '@marketing-funnel/db';
import type { PipelineEvent } from '../types';
import { afluenceClickupChatConfig, afluenceOrganizationId } from '../../orgs/afluence/config';
import { getCustomFieldValues } from './custom-field.service';

function toText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseMultiValue(value: string | undefined): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
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
}

function toTitleCase(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveClickupTaskUrlForLead(leadId: string): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { data: latestEntry } = await supabaseAdmin
      .from('lead_pipeline_entries')
      .select('clickup_task_id')
      .eq('lead_id', leadId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const taskId = toText(latestEntry?.clickup_task_id);
    if (taskId) {
      return `https://app.clickup.com/t/${taskId}`;
    }
    if (attempt < 5) await sleep(250);
  }

  return '';
}

function resolveAssigneeLabelFromTask(task: Awaited<ReturnType<ClickUpClient['getTask']>>): string {
  const assignees = Array.isArray(task.assignees) ? task.assignees : [];
  if (!assignees.length) return 'unassigned';
  const labels = assignees
    .map((assignee) => assignee.username || assignee.email || '')
    .filter(Boolean);
  return labels.length ? labels.join(', ') : 'unassigned';
}

function buildLeadCreatedMessage(params: {
  fullName: string;
  email: string;
  phone: string;
  source: string;
  channel: string;
  assignee: string;
  clickupTaskUrl?: string;
  customFields: Record<string, string>;
}) {
  const selectedServices = parseMultiValue(params.customFields.que_construir).join(', ');
  const customFieldLines = Object.entries(params.customFields)
    .filter(([, value]) => value.trim().length > 0)
    .map(([key, value]) => {
      if (key === 'que_construir') {
        return `Que construir: ${selectedServices || value}`;
      }
      return `${toTitleCase(key)}: ${value}`;
    });

  return [
    'Nuevo lead registrado',
    `Nombre: ${params.fullName}`,
    `Email: ${params.email}`,
    `Telefono: ${params.phone || 'n/a'}`,
    `Source: ${params.source || 'n/a'}`,
    `Canal: ${params.channel || 'n/a'}`,
    `Assignee: ${params.assignee}`,
    ...(params.clickupTaskUrl ? [`ClickUp: ${params.clickupTaskUrl}`] : []),
    '',
    'Campos del formulario:',
    ...(customFieldLines.length ? customFieldLines : ['Sin custom fields']),
  ].join('\n');
}

export async function sendAfluenceLeadCreatedToClickupChannel(event: PipelineEvent): Promise<void> {
  if (event.type !== 'lead_created') return;

  if (!afluenceOrganizationId || event.organizationId !== afluenceOrganizationId) return;

  if (!afluenceClickupChatConfig.enabled) {
    console.log('[clickup-chat] Afluence chat notifications disabled');
    return;
  }

  const { apiToken, workspaceId, channelId } = afluenceClickupChatConfig;
  if (!apiToken || !workspaceId || !channelId) {
    console.warn('[clickup-chat] Missing chat config (token/workspace/channel), skipping');
    return;
  }

  const { data: lead, error: leadError } = await supabaseAdmin
    .from('leads')
    .select('id, first_name, last_name, email, phone')
    .eq('id', event.leadId)
    .single();

  if (leadError || !lead) throw leadError ?? new Error('Lead not found for clickup chat notification');

  const clickupClient = new ClickUpClient({ apiToken });
  const clickupTaskUrl = await resolveClickupTaskUrlForLead(lead.id);
  let assignee = 'unassigned';
  if (clickupTaskUrl) {
    const clickupTaskId = clickupTaskUrl.split('/t/')[1] ?? '';
    if (clickupTaskId) {
      try {
        const task = await clickupClient.getTask(clickupTaskId);
        assignee = resolveAssigneeLabelFromTask(task);
      } catch (error) {
        console.warn('[clickup-chat] Failed to resolve task assignee', error);
      }
    }
  }

  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim() || lead.email;
  const customFields = await getCustomFieldValues('lead', lead.id);
  const message = buildLeadCreatedMessage({
    fullName,
    email: lead.email,
    phone: lead.phone ?? '',
    source: toText(event.metadata?.source),
    channel: toText(event.metadata?.channel),
    assignee,
    clickupTaskUrl,
    customFields,
  });

  await clickupClient.createChatMessage(workspaceId, channelId, message);
  console.log(`[clickup-chat] Sent lead_created notification for lead ${event.leadId}`);
}
