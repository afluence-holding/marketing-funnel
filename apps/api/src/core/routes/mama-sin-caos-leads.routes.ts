import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import {
  listMamaSinCaosLeadsForTable,
  upsertMamaSinCaosLead,
} from '../services/mama-sin-caos-leads.service';

const router = Router();

const upsertSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  customFields: z.record(z.string(), z.string()).optional(),
  utmData: z.record(z.string(), z.string()).optional(),
});

const VIEW_TOKEN = process.env.MAMA_SIN_CAOS_VIEW_TOKEN ?? '';

function isAuthorized(req: { query: Record<string, unknown>; get: (name: string) => string | undefined }) {
  if (!VIEW_TOKEN) return true;

  const tokenFromQuery = String(req.query.token ?? '');
  const tokenFromHeader = req.get('x-view-token') ?? '';

  return tokenFromQuery === VIEW_TOKEN || tokenFromHeader === VIEW_TOKEN;
}

router.get('/mama-sin-caos/leads', async (req, res, next) => {
  try {
    if (!isAuthorized(req)) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    const payload = await listMamaSinCaosLeadsForTable();
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
});

router.post('/mama-sin-caos/leads', validate(upsertSchema), async (req, res, next) => {
  try {
    const record = await upsertMamaSinCaosLead({
      email: req.body.email,
      firstName: req.body.firstName,
      phone: req.body.phone,
      source: req.body.source,
      customFields: req.body.customFields,
      utmData: req.body.utmData,
    });

    res.status(201).json({
      ok: true,
      message: 'Lead saved to Supabase',
      storage: 'supabase',
      lead: record,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
