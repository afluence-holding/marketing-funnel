import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { ingestLead } from '../services/ingestion.service';
import { resolveIngestionTargetBySource } from '../services/ingestion-source-resolver.service';

const router = Router();

const ingestSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  channel: z.enum(['inbound', 'outbound']).default('inbound'),
  sourceType: z.string().optional(),
  sourceId: z.string().uuid().optional(),
  utmData: z.record(z.string(), z.string()).optional(),
  customFields: z.record(z.string(), z.string()).optional(),
});

router.post('/ingest', validate(ingestSchema), async (req, res, next) => {
  try {
    const source = req.body.source;
    const formType = req.body.customFields?.form_type?.toLowerCase();
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

    const result = await ingestLead(
      { ...req.body, email, organizationId: target.organizationId },
      target.routingEngine,
    );

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

export default router;
