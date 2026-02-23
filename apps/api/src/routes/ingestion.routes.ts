import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { ingestLead } from '../services/ingestion.service';
import { IDS } from '../orgs/project-1/config';
import { routingEngine } from '../orgs/project-1/routing';

const router = Router();

const ingestSchema = z.object({
  email: z.string().email(),
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
    const result = await ingestLead(
      { ...req.body, organizationId: IDS.organizationId },
      routingEngine,
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
