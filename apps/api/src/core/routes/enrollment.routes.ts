import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import {
  enrollLead,
  unenrollLead,
  pauseEnrollment,
  resumeEnrollment,
  getEnrollmentById,
  getEnrollmentsForLead,
} from '../services/enrollment.service';
import { IDS } from '../../orgs/afluence/company-1/config';

const router = Router();

const enrollSchema = z.object({
  sequenceKey: z.string(),
  leadId: z.string().uuid(),
  pipelineEntryId: z.string().uuid().optional(),
});

router.post('/enrollments', validate(enrollSchema), async (req, res, next) => {
  try {
    const enrollment = await enrollLead(
      req.body.sequenceKey,
      req.body.leadId,
      IDS.organizationId,
      req.body.pipelineEntryId,
    );
    res.status(201).json({ enrollment });
  } catch (err) {
    next(err);
  }
});

router.get('/enrollments/:id', async (req, res, next) => {
  try {
    const enrollment = await getEnrollmentById(req.params.id);
    if (!enrollment) {
      res.status(404).json({ error: 'Enrollment not found' });
      return;
    }
    res.json({ enrollment });
  } catch (err) {
    next(err);
  }
});

router.delete('/enrollments/:id', async (req, res, next) => {
  try {
    await unenrollLead(req.params.id);
    res.json({ unenrolled: true });
  } catch (err) {
    next(err);
  }
});

router.patch('/enrollments/:id/pause', async (req, res, next) => {
  try {
    await pauseEnrollment(req.params.id);
    res.json({ paused: true });
  } catch (err) {
    next(err);
  }
});

router.patch('/enrollments/:id/resume', async (req, res, next) => {
  try {
    await resumeEnrollment(req.params.id);
    res.json({ resumed: true });
  } catch (err) {
    next(err);
  }
});

router.get('/leads/:id/enrollments', async (req, res, next) => {
  try {
    const enrollments = await getEnrollmentsForLead(req.params.id);
    res.json({ enrollments });
  } catch (err) {
    next(err);
  }
});

export default router;
