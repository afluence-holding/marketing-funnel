import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { upsertCaroFitnessProgress } from '../services/caro-fitness-progress.service';

const router = Router();

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

router.post('/caro-fitness/progress', validate(upsertSchema), async (req, res, next) => {
  try {
    const record = await upsertCaroFitnessProgress({
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
