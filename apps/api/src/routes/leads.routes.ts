import { Router } from 'express';
import { getLeadById, getLeadsByOrg } from '../services/lead.service';
import { getCustomFieldValues } from '../services/custom-field.service';
import { getEntriesForLead } from '../services/lead-funnel.service';
import { getActivityForLead } from '../services/activity-log.service';
import { IDS } from '../orgs/project-1/config';

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

    const [customFields, funnelEntries, activity] = await Promise.all([
      getCustomFieldValues('lead', lead.id),
      getEntriesForLead(lead.id),
      getActivityForLead(lead.id),
    ]);

    res.json({ lead, customFields, funnelEntries, activity });
  } catch (err) {
    next(err);
  }
});

export default router;
