/**
 * ============================================================================
 * CONFIG — Settings and IDs for this Business Unit
 * ============================================================================
 *
 * HOW TO USE:
 * 1. Replace "TEMPLATE" with your BU key (e.g., "FAKTORY", "CHALLENGES")
 * 2. Adjust validStatuses to match your funnel stages
 * 3. Set your timezone
 * 4. Run seed.ts first, then paste the output IDs into your .env
 *
 * The IDS object maps readable names to UUID values from the database.
 * Sequences, workflows, and routing all reference IDS to know which
 * pipeline/stage to use.
 */

import type { OrgConfig } from '../../../core/types';

// ---------------------------------------------------------------------------
// Organization-level configuration
// ---------------------------------------------------------------------------

export const config: OrgConfig = {
  // Default status when a new lead is created
  defaultLeadStatus: 'new',

  // All valid statuses a lead can have in this BU.
  // Used for validation. Add/remove as needed.
  validStatuses: ['new', 'contacted', 'engaged', 'qualified', 'converted', 'lost'],

  // IANA timezone for scheduling (used by cron, timestamps, etc.)
  timezone: 'America/Santiago',
};

// ---------------------------------------------------------------------------
// Database IDs — populated from seed.ts output via environment variables
// ---------------------------------------------------------------------------
// After running seed.ts, it prints the UUIDs. Add them to your .env like:
//
//   TEMPLATE_ORG_ID=abc-123-...
//   TEMPLATE_PIPELINE_ID=def-456-...
//   TEMPLATE_STAGE_NEW_LEAD=ghi-789-...
//   etc.
//
// Then reference them here. This keeps secrets out of code.

export const IDS = {
  organizationId: process.env.TEMPLATE_ORG_ID ?? '',
  pipelineId: process.env.TEMPLATE_PIPELINE_ID ?? '',

  // One entry per pipeline stage. Keys should match your seed.ts stage names.
  stages: {
    new_lead: process.env.TEMPLATE_STAGE_NEW_LEAD ?? '',
    contacted: process.env.TEMPLATE_STAGE_CONTACTED ?? '',
    qualified: process.env.TEMPLATE_STAGE_QUALIFIED ?? '',
    converted: process.env.TEMPLATE_STAGE_CONVERTED ?? '',
    // Add more stages as needed:
    // demo_scheduled: process.env.TEMPLATE_STAGE_DEMO_SCHEDULED ?? '',
    // lost: process.env.TEMPLATE_STAGE_LOST ?? '',
  },
};
