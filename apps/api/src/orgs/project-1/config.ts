import type { OrgConfig } from '../../types';

export const config: OrgConfig = {
  defaultLeadStatus: 'new',
  validStatuses: ['new', 'contacted', 'engaged', 'qualified', 'converted'],
  timezone: 'America/Lima',
};

/**
 * These IDs are populated by the seed script.
 * After running `npm run seed`, copy the real UUIDs here.
 */
export const IDS = {
  organizationId: process.env.PROJECT1_ORG_ID ?? '',
  funnelId: process.env.PROJECT1_FUNNEL_ID ?? '',
  stages: {
    new_lead: process.env.PROJECT1_STAGE_NEW_LEAD ?? '',
    contacted: process.env.PROJECT1_STAGE_CONTACTED ?? '',
    qualified: process.env.PROJECT1_STAGE_QUALIFIED ?? '',
    converted: process.env.PROJECT1_STAGE_CONVERTED ?? '',
  },
};
