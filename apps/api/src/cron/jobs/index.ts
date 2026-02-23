import { registerJob } from '../scheduler';
import './follow-up-calls';

/**
 * Schedule reference (cron expression):
 *   ┌──────────── minute (0-59)
 *   │ ┌────────── hour (0-23)
 *   │ │ ┌──────── day of month (1-31)
 *   │ │ │ ┌────── month (1-12)
 *   │ │ │ │ ┌──── day of week (0-7, 0 and 7 = Sunday)
 *   * * * * *
 */

// Example: workflow step processor (disabled until workflows are built)
registerJob({
  name: 'workflow-step-processor',
  schedule: '*/1 * * * *', // every minute
  enabled: false,
  handler: async () => {
    // TODO: query workflow_executions with status='running',
    // pick up current_step, execute it, advance to next_step_id
  },
});

// Example: stale lead checker (disabled)
registerJob({
  name: 'stale-lead-checker',
  schedule: '0 9 * * *', // daily at 9am
  enabled: false,
  handler: async () => {
    // TODO: find leads stuck in a stage for X days,
    // emit event or update status
  },
});
