import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { ingestLead } from '../services/ingestion.service';
import { getBusinessUnitBinding } from '../../orgs';
import { normalizePhoneAndGetTimezone } from '../utils/phone';

// ---------------------------------------------------------------------------
// Tenant-scoped ingestion — org + BU are explicit in the URL
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

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

router.post('/orgs/:orgKey/bus/:buKey/ingest', validate(ingestSchema), async (req, res, next) => {
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
      { ...req.body, organizationId: binding.organizationId },
      binding.routingEngine,
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

router.post('/ingest', (_req, res) => {
  res.status(400).json({
    error: 'Tenant-scoped ingestion required',
    message: 'Use /api/orgs/:orgKey/bus/:buKey/ingest and keep source metadata in the request body.',
  });
});

export default router;
