import { Router } from 'express';
import { z } from 'zod';
import { getLeadById, getLeadsByOrg } from '../services/lead.service';
import { getCustomFieldValues } from '../services/custom-field.service';
import { getEntriesForLead, moveStage } from '../services/lead-pipeline.service';
import { getActivityForLead } from '../services/activity-log.service';
import { getEnrollmentsForLead } from '../services/enrollment.service';
import { validate } from '../middleware/validate';
import { IDS } from '../../orgs/afluence/business-unit-1/config';

const router = Router();

router.get('/leads', async (_req, res, next) => {
  try {
    const leads = await getLeadsByOrg(IDS.organizationId);
    res.json({ leads });
  } catch (err) {
    next(err);
  }
});

router.get('/leads/:id', async (req, res, next) => {
  try {
    const lead = await getLeadById(req.params.id);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const [customFields, pipelineEntries, activity, enrollments] = await Promise.all([
      getCustomFieldValues('lead', lead.id),
      getEntriesForLead(lead.id),
      getActivityForLead(lead.id),
      getEnrollmentsForLead(lead.id),
    ]);

    res.json({ lead, customFields, pipelineEntries, activity, enrollments });
  } catch (err) {
    next(err);
  }
});

const moveStageSchema = z.object({
  stageId: z.string().uuid(),
});

router.put(
  '/leads/:leadId/pipeline-entries/:entryId/stage',
  validate(moveStageSchema),
  async (req, res, next) => {
    try {
      const entryId = Array.isArray(req.params.entryId) ? req.params.entryId[0] : req.params.entryId;
      if (!entryId) {
        res.status(400).json({ error: 'Invalid entry ID' });
        return;
      }
      const result = await moveStage(
        entryId,
        req.body.stageId,
        IDS.organizationId,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
