import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '@marketing-funnel/db';
import { validate } from '../middleware/validate';
import { ingestLead } from '../services/ingestion.service';
import { resolveIngestionTargetBySource } from '../services/ingestion-source-resolver.service';
import { getBusinessUnitBinding } from '../../orgs';
import { normalizePhoneAndGetTimezone } from '../utils/phone';
import { moveStage } from '../services/lead-pipeline.service';
import { saveCustomFieldValues } from '../services/custom-field.service';
import { sendMetaCapiEvent } from '../services/meta-capi.service';
import { IDS as aiFactoryCreatorsIds } from '../../orgs/afluence/ai-factory-creators/config';

const router = Router();

const ingestSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  channel: z.enum(['inbound', 'outbound']).default('inbound'),
  sourceType: z.string().optional(),
  sourceId: z.preprocess((v) => (v === '' ? undefined : v), z.string().uuid().optional()),
  utmData: z.record(z.string(), z.string()).optional(),
  customFields: z.record(z.string(), z.string()).optional(),
  tracking: z
    .object({
      meta: z
        .object({
          eventId: z.string().min(1).optional(),
          fbp: z.string().min(1).optional(),
          fbc: z.string().min(1).optional(),
        })
        .optional(),
    })
    .optional(),
});

const meetingScheduledSchema = z.object({
  entryId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime().optional(),
  calendlyEventUri: z.string().url().optional(),
  tracking: z
    .object({
      meta: z
        .object({
          eventId: z.string().min(1).optional(),
          fbp: z.string().min(1).optional(),
          fbc: z.string().min(1).optional(),
        })
        .optional(),
    })
    .optional(),
});

const videoEventSchema = z.object({
  eventName: z.enum(['VSL_25', 'VSL_50', 'VSL_75', 'VSL_100']),
  source: z.string().min(1).optional(),
  contentName: z.string().min(1).optional(),
  milestone: z.number().int().min(0).max(100).optional(),
  tracking: z
    .object({
      meta: z
        .object({
          eventId: z.string().min(1),
          fbp: z.string().min(1).optional(),
          fbc: z.string().min(1).optional(),
        })
        .optional(),
    })
    .optional(),
});

const SANTI_INVERSOR_RESEARCH_SOURCE = 'landing-santi-inversor-research-home';
const SANTI_INVERSOR_EXPORT_TOKEN = process.env.SANTI_INVERSOR_EXPORT_TOKEN ?? '';
const SANTI_EXPORT_BASE_HEADERS = [
  'lead_id',
  'email',
  'first_name',
  'last_name',
  'phone',
  'source',
  'created_at',
  'updated_at',
];

function getQueryValue(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return String(value ?? '');
}

function escapeCsv(value: string): string {
  const normalized = String(value ?? '');
  if (
    normalized.includes('"') ||
    normalized.includes(',') ||
    normalized.includes('\n')
  ) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function isSantiInversorResearchScope(orgKey: string, buKey: string) {
  return orgKey === 'santi-inversor' && buKey === 'research';
}

type LeadExportRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
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

async function fetchAllSantiLeads(organizationId: string): Promise<LeadExportRow[]> {
  const pageSize = 1000;
  let page = 0;
  const allRows: LeadExportRow[] = [];

  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('id, email, first_name, last_name, phone, source, created_at, updated_at')
      .eq('organization_id', organizationId)
      .eq('source', SANTI_INVERSOR_RESEARCH_SOURCE)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const rows = (data ?? []) as LeadExportRow[];
    allRows.push(...rows);
    if (rows.length < pageSize) break;
    page += 1;
  }

  return allRows;
}

async function buildSantiExportRows(organizationId: string) {
  const leads = await fetchAllSantiLeads(organizationId);
  const leadIds = leads.map((lead) => lead.id);

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

  const customFieldKeys: string[] = Array.from(
    new Set(typedDefinitions.map((definition) => definition.field_key)),
  ).sort();

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

    const typedValues = (values ?? []) as CustomFieldValueRow[];
    for (const value of typedValues) {
      const fieldKey = fieldKeyByDefinitionId.get(value.field_definition_id);
      if (!fieldKey) continue;
      const entry = customValuesByLeadId.get(value.entity_id) ?? {};
      entry[fieldKey] = value.value ?? '';
      customValuesByLeadId.set(value.entity_id, entry);
    }
  }

  const rows: Array<Record<string, string>> = leads.map((lead) => {
    const base: Record<string, string> = {
      lead_id: lead.id,
      email: lead.email ?? '',
      first_name: lead.first_name ?? '',
      last_name: lead.last_name ?? '',
      phone: lead.phone ?? '',
      source: lead.source ?? '',
      created_at: lead.created_at ?? '',
      updated_at: lead.updated_at ?? '',
    };

    const customValues = customValuesByLeadId.get(lead.id) ?? {};
    for (const key of customFieldKeys) {
      base[key] = customValues[key] ?? '';
    }

    return base;
  });

  return {
    rows,
    headers: [...SANTI_EXPORT_BASE_HEADERS, ...customFieldKeys] as string[],
  };
}

router.post('/orgs/:orgKey/bus/:buKey/ingest', validate(ingestSchema), async (req, res, next) => {
  try {
    const source = req.body.source;
    const formType = req.body.customFields?.form_type?.toLowerCase();
    const isAiFactoryCreatorsSource = source === 'landing-ai-factory-creators-v1';
    const forceCreateLead = isAiFactoryCreatorsSource && formType === 'full';
    const email = req.body.email?.trim();

    if (formType === 'partial' && !email) {
      console.warn('[ingest] skipping partial payload without email', { source, formType });
      return res.status(200).json({
        skipped: true,
        reason: 'missing_minimum_data',
      });
    }

    if (!email) {
      return res.status(400).json({
        error: 'Validation failed',
        details: {
          email: ['Email is required unless customFields.form_type is "partial".'],
        },
      });
    }

    let target: ReturnType<typeof resolveIngestionTargetBySource>;
    try {
      target = resolveIngestionTargetBySource(source);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid source',
        details: {
          source: [error instanceof Error ? error.message : 'Unknown source'],
        },
      });
    }

    console.info('[ingest] source resolved', {
      source: source ?? null,
      businessUnit: target.businessUnit,
      organizationId: target.organizationId,
    });

    const orgKey = Array.isArray(req.params.orgKey) ? req.params.orgKey[0] : req.params.orgKey;
    const buKey = Array.isArray(req.params.buKey) ? req.params.buKey[0] : req.params.buKey;

    if (!orgKey || !buKey) {
      res.status(400).json({ error: 'Invalid org or business unit key' });
      return;
    }

    const binding = getBusinessUnitBinding(orgKey, buKey);
    if (!binding) {
      res.status(404).json({
        error: 'Business unit not found',
        message: `Unknown ingestion target: ${orgKey}/${buKey}`,
      });
      return;
    }

    if (!binding.organizationId) {
      res.status(503).json({
        error: 'Organization not configured',
        message: `Missing organization ID for ${orgKey}/${buKey}. Set the env var.`,
      });
      return;
    }

    if (req.body.phone) {
      const normalizedPhone = normalizePhoneAndGetTimezone(req.body.phone);
      if (!normalizedPhone) {
        res.status(400).json({
          error: 'Invalid phone number',
          message: 'Phone must be a valid international number.',
        });
        return;
      }
    }

    const result = await ingestLead(
      { ...req.body, organizationId: binding.organizationId, forceCreateLead },
      binding.routingEngine,
    );

    // --- Meta CAPI ---
    const xForwardedFor = req.headers['x-forwarded-for'];
    const clientIpAddress = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor?.split(',')[0]?.trim() ?? req.ip;
    const eventId = req.body.tracking?.meta?.eventId;

    // Resolve per-org CAPI credentials (fall back to global env vars)
    const capiCreds = getCapiCredentials(orgKey);

    // Fire CAPI: ai-factory-creators requires formType=full; other orgs fire on any eventId
    const shouldFireCapi = eventId && (formType === 'full' || orgKey !== 'afluence');
    if (shouldFireCapi) {
      for (const eventName of ['Lead', 'CompleteRegistration'] as const) {
        try {
          await sendMetaCapiEvent({
            eventName,
            eventId,
            eventSourceUrl: req.get('referer') ?? req.get('origin'),
            userData: {
              email: req.body.email,
              phone: req.body.phone,
              fbp: req.body.tracking?.meta?.fbp,
              fbc: req.body.tracking?.meta?.fbc,
              clientIpAddress,
              clientUserAgent: req.get('user-agent') ?? undefined,
            },
            customData: {
              content_name: source ?? 'unknown',
              form_type: formType ?? 'unknown',
              channel: req.body.channel ?? 'inbound',
            },
            ...capiCreds,
          });
        } catch (error) {
          console.warn('[meta-capi] ingest event failed', {
            eventName,
            source: source ?? null,
            error: error instanceof Error ? error.message : 'unknown',
          });
        }
      }
    }

    res.status(201).json({
      message: result.isNew ? 'Lead created and routed' : 'Lead updated and routed',
      lead: result.lead,
      entries: result.entries,
      decisions: result.decisions,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/orgs/:orgKey/bus/:buKey/leads/:leadId/meeting-scheduled',
  validate(meetingScheduledSchema),
  async (req, res, next) => {
    try {
      const orgKey = Array.isArray(req.params.orgKey) ? req.params.orgKey[0] : req.params.orgKey;
      const buKey = Array.isArray(req.params.buKey) ? req.params.buKey[0] : req.params.buKey;
      const leadId = Array.isArray(req.params.leadId) ? req.params.leadId[0] : req.params.leadId;

      if (!orgKey || !buKey || !leadId) {
        res.status(400).json({ error: 'Invalid org, business unit or lead ID' });
        return;
      }

      const binding = getBusinessUnitBinding(orgKey, buKey);
      if (!binding) {
        res.status(404).json({
          error: 'Business unit not found',
          message: `Unknown ingestion target: ${orgKey}/${buKey}`,
        });
        return;
      }
      if (orgKey !== 'afluence' || buKey !== 'ai-factory-creators') {
        res.status(400).json({
          error: 'Unsupported business unit for meeting scheduling endpoint',
          message: 'This endpoint is currently enabled only for afluence/ai-factory-creators.',
        });
        return;
      }

      const { data: lead, error: leadError } = await supabaseAdmin
        .from('leads')
        .select('id, organization_id, email, phone')
        .eq('id', leadId)
        .single();

      if (leadError || !lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      if (lead.organization_id !== binding.organizationId) {
        res.status(403).json({ error: 'Lead does not belong to this business unit organization' });
        return;
      }

      const requestedEntryId = req.body.entryId;
      const { data: entry, error: entryError } = requestedEntryId
        ? await supabaseAdmin
            .from('lead_pipeline_entries')
            .select('id, lead_id')
            .eq('id', requestedEntryId)
            .eq('lead_id', leadId)
            .single()
        : await supabaseAdmin
            .from('lead_pipeline_entries')
            .select('id, lead_id')
            .eq('lead_id', leadId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

      if (entryError || !entry) {
        res.status(404).json({ error: 'Pipeline entry not found for lead' });
        return;
      }

      if (!aiFactoryCreatorsIds.stages.meeting_schedule) {
        res.status(503).json({
          error: 'Meeting schedule stage not configured',
          message: 'Missing PROJECT2_STAGE_MEETING_SCHEDULE env variable.',
        });
        return;
      }

      const moveResult = await moveStage(
        entry.id,
        aiFactoryCreatorsIds.stages.meeting_schedule,
        binding.organizationId,
      );

      await saveCustomFieldValues(binding.organizationId, 'lead', leadId, {
        meeting_scheduled: 'true',
        meeting_scheduled_at: req.body.scheduledAt ?? new Date().toISOString(),
        ...(req.body.calendlyEventUri ? { calendly_event_uri: req.body.calendlyEventUri } : {}),
      });

      const xForwardedFor = req.headers['x-forwarded-for'];
      const clientIpAddress = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor?.split(',')[0]?.trim() ?? req.ip;
      const eventId = req.body.tracking?.meta?.eventId;
      if (eventId) {
        try {
          await sendMetaCapiEvent({
            eventName: 'Schedule',
            eventId,
            eventSourceUrl: req.get('referer') ?? req.get('origin'),
            userData: {
              email: lead.email ?? undefined,
              phone: lead.phone ?? undefined,
              fbp: req.body.tracking?.meta?.fbp,
              fbc: req.body.tracking?.meta?.fbc,
              clientIpAddress,
              clientUserAgent: req.get('user-agent') ?? undefined,
            },
            customData: {
              content_name: 'ai-factory-creators-v1',
              calendly_event_uri: req.body.calendlyEventUri ?? null,
            },
          });
        } catch (error) {
          console.warn('[meta-capi] meeting event failed', {
            eventName: 'Schedule',
            leadId,
            error: error instanceof Error ? error.message : 'unknown',
          });
        }
      }

      res.status(200).json({
        message: 'Meeting marked as scheduled and stage moved',
        leadId,
        pipelineEntryId: entry.id,
        moveResult,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/orgs/:orgKey/bus/:buKey/video-events',
  validate(videoEventSchema),
  async (req, res, next) => {
    try {
      const orgKey = Array.isArray(req.params.orgKey) ? req.params.orgKey[0] : req.params.orgKey;
      const buKey = Array.isArray(req.params.buKey) ? req.params.buKey[0] : req.params.buKey;

      if (!orgKey || !buKey) {
        res.status(400).json({ error: 'Invalid org or business unit key' });
        return;
      }

      const binding = getBusinessUnitBinding(orgKey, buKey);
      if (!binding) {
        res.status(404).json({
          error: 'Business unit not found',
          message: `Unknown ingestion target: ${orgKey}/${buKey}`,
        });
        return;
      }

      const eventId = req.body.tracking?.meta?.eventId;
      if (!eventId) {
        res.status(400).json({
          error: 'Missing required tracking.meta.eventId',
        });
        return;
      }

      const xForwardedFor = req.headers['x-forwarded-for'];
      const clientIpAddress = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor?.split(',')[0]?.trim() ?? req.ip;
      const capiCreds = getCapiCredentials(orgKey);

      try {
        await sendMetaCapiEvent({
          eventName: req.body.eventName,
          eventId,
          eventSourceUrl: req.get('referer') ?? req.get('origin'),
          userData: {
            fbp: req.body.tracking?.meta?.fbp,
            fbc: req.body.tracking?.meta?.fbc,
            clientIpAddress,
            clientUserAgent: req.get('user-agent') ?? undefined,
          },
          customData: {
            content_name: req.body.contentName ?? req.body.source ?? 'unknown',
            source: req.body.source ?? null,
            milestone: req.body.milestone ?? null,
            bu_key: buKey,
          },
          ...capiCreds,
        });
      } catch (error) {
        console.warn('[meta-capi] video event failed', {
          eventName: req.body.eventName,
          source: req.body.source ?? null,
          error: error instanceof Error ? error.message : 'unknown',
        });
      }

      res.status(202).json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/orgs/:orgKey/bus/:buKey/stats', async (req, res, next) => {
  try {
    const orgKey = Array.isArray(req.params.orgKey) ? req.params.orgKey[0] : req.params.orgKey;
    const buKey = Array.isArray(req.params.buKey) ? req.params.buKey[0] : req.params.buKey;

    if (!orgKey || !buKey) {
      res.status(400).json({ error: 'Invalid org or business unit key' });
      return;
    }

    if (!isSantiInversorResearchScope(orgKey, buKey)) {
      res.status(400).json({
        error: 'Unsupported business unit for stats endpoint',
        message: 'This endpoint is currently enabled only for santi-inversor/research.',
      });
      return;
    }

    const binding = getBusinessUnitBinding(orgKey, buKey);
    if (!binding) {
      res.status(404).json({
        error: 'Business unit not found',
        message: `Unknown ingestion target: ${orgKey}/${buKey}`,
      });
      return;
    }

    const leads = await fetchAllSantiLeads(binding.organizationId);
    const uniqueEmails = new Set(
      leads
        .map((lead) => String(lead.email ?? '').trim().toLowerCase())
        .filter(Boolean),
    );

    res.status(200).json({
      ok: true,
      source: SANTI_INVERSOR_RESEARCH_SOURCE,
      total_submissions: leads.length,
      unique_emails: uniqueEmails.size,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/orgs/:orgKey/bus/:buKey/export', async (req, res, next) => {
  try {
    const orgKey = Array.isArray(req.params.orgKey) ? req.params.orgKey[0] : req.params.orgKey;
    const buKey = Array.isArray(req.params.buKey) ? req.params.buKey[0] : req.params.buKey;

    if (!orgKey || !buKey) {
      res.status(400).json({ error: 'Invalid org or business unit key' });
      return;
    }

    if (!isSantiInversorResearchScope(orgKey, buKey)) {
      res.status(400).json({
        error: 'Unsupported business unit for export endpoint',
        message: 'This endpoint is currently enabled only for santi-inversor/research.',
      });
      return;
    }

    if (SANTI_INVERSOR_EXPORT_TOKEN) {
      const tokenFromQuery = getQueryValue(req.query.token);
      const tokenFromHeader = req.get('x-export-token') ?? '';
      const isAuthorized =
        tokenFromQuery === SANTI_INVERSOR_EXPORT_TOKEN ||
        tokenFromHeader === SANTI_INVERSOR_EXPORT_TOKEN;

      if (!isAuthorized) {
        res.status(401).json({ ok: false, error: 'Unauthorized export access' });
        return;
      }
    }

    const binding = getBusinessUnitBinding(orgKey, buKey);
    if (!binding) {
      res.status(404).json({
        error: 'Business unit not found',
        message: `Unknown ingestion target: ${orgKey}/${buKey}`,
      });
      return;
    }

    const { rows, headers } = await buildSantiExportRows(binding.organizationId);
    const format = getQueryValue(req.query.format).trim().toLowerCase();
    const selectedFormat = format === 'csv' ? 'csv' : 'json';

    if (selectedFormat === 'csv') {
      const csvLines = [
        headers.join(','),
        ...rows.map((row) => headers.map((header) => escapeCsv(row[header] ?? '')).join(',')),
      ];
      const csv = `${csvLines.join('\n')}\n`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="santi-inversor-research-export-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      );
      res.status(200).send(csv);
      return;
    }

    res.status(200).json({
      ok: true,
      source: SANTI_INVERSOR_RESEARCH_SOURCE,
      total: rows.length,
      headers,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/ingest', (_req, res) => {
  res.status(400).json({
    error: 'Tenant-scoped ingestion required',
    message: 'Use /api/orgs/:orgKey/bus/:buKey/ingest and keep source metadata in the request body.',
  });
});

/** Resolve per-org CAPI pixel ID + access token. Returns empty object to use global defaults. */
function getCapiCredentials(orgKey: string): { pixelId?: string; accessToken?: string } {
  if (orgKey === 'german-roz') {
    const pixelId = process.env.META_PIXEL_ID_GERMAN_ROZ;
    const accessToken = process.env.META_CAPI_TOKEN_GERMAN_ROZ;
    if (pixelId && accessToken) return { pixelId, accessToken };
  }
  if (orgKey === 'lucas-con-lucas') {
    const pixelId = process.env.META_PIXEL_ID_LUCAS_CON_LUCAS;
    const accessToken = process.env.META_CAPI_TOKEN_LUCAS_CON_LUCAS;
    if (pixelId && accessToken) return { pixelId, accessToken };
  }
  return {};
}

export default router;
