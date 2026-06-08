import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import {
  listGermanRozProgressForTable,
  upsertGermanRozProgress,
} from '../services/german-roz-progress.service';

const router = Router();

const VIEW_TOKEN = process.env.GERMAN_ROZ_VIEW_TOKEN ?? '';

function isAuthorized(req: { query: Record<string, unknown>; get: (name: string) => string | undefined }) {
  if (!VIEW_TOKEN) return true;

  const tokenFromQuery = String(req.query.token ?? '');
  const tokenFromHeader = req.get('x-view-token') ?? '';

  return tokenFromQuery === VIEW_TOKEN || tokenFromHeader === VIEW_TOKEN;
}

const upsertSchema = z.object({
  sessionId: z.string().min(8),
  source: z.string().optional(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  phone: z.string().optional(),
  quizStep: z.string().optional(),
  status: z.enum(['in_progress', 'abandoned', 'completed']).optional(),
  answers: z.record(z.string(), z.string()).optional(),
  utmData: z.record(z.string(), z.string()).optional(),
  leadId: z.string().uuid().optional(),
});

router.get('/german-roz/progress', async (req, res, next) => {
  try {
    if (!isAuthorized(req)) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    const payload = await listGermanRozProgressForTable();
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
});

router.post('/german-roz/progress', validate(upsertSchema), async (req, res, next) => {
  try {
    const record = await upsertGermanRozProgress({
      sessionId: req.body.sessionId,
      source: req.body.source,
      email: req.body.email,
      firstName: req.body.firstName,
      phone: req.body.phone,
      quizStep: req.body.quizStep,
      status: req.body.status,
      answers: req.body.answers,
      utmData: req.body.utmData,
      leadId: req.body.leadId,
      completedAt: req.body.status === 'completed' ? new Date().toISOString() : undefined,
    });

    res.status(201).json({
      ok: true,
      message: 'Progress saved',
      storage: 'supabase',
      progress: record,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
