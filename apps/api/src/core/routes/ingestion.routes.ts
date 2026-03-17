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

    const xForwardedFor = req.headers['x-forwarded-for'];
    const clientIpAddress = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor?.split(',')[0]?.trim() ?? req.ip;
    const eventId = req.body.tracking?.meta?.eventId;
    if (eventId && formType === 'full') {
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

router.post('/ingest', (_req, res) => {
  res.status(400).json({
    error: 'Tenant-scoped ingestion required',
    message: 'Use /api/orgs/:orgKey/bus/:buKey/ingest and keep source metadata in the request body.',
  });
});

export default router;
