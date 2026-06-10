import { registerJob } from '../scheduler';
// Side-effect import: registers the hourly/daily admin-dashboard pull jobs.
// Jobs self-disable when ADMIN_URL / CRON_SECRET are missing.
import './admin-pulls';

/**
 * Schedule reference (cron expression):
 *   ┌──────────── minute (0-59)
 *   │ ┌────────── hour (0-23)
 *   │ │ ┌──────── day of month (1-31)
 *   │ │ │ ┌────── month (1-12)
 *   │ │ │ │ ┌──── day of week (0-7, 0 and 7 = Sunday)
 *   * * * * *
 */

registerJob({
  name: 'sequence-step-processor',
  schedule: '*/1 * * * *',
  enabled: true,
  handler: async () => {
    const { processEnrollments } = await import('../../engine/sequence-executor');
    await processEnrollments();
  },
});

registerJob({
  name: 'integration-delivery-retry',
  schedule: '*/1 * * * *',
  enabled: true,
  handler: async () => {
    const { processIntegrationDeliveries } = await import('../../integrations/retry-processor');
    await processIntegrationDeliveries();
  },
});

registerJob({
  name: 'integration-delivery-purge',
  schedule: '30 4 * * *', // diario 04:30: retención de PII (filas delivered)
  enabled: true,
  handler: async () => {
    const { purgeDeliveredOlderThan } = await import('../../integrations/delivery-repository');
    const purged = await purgeDeliveredOlderThan(30);
    if (purged > 0) console.info(`[integrations] purged ${purged} delivered rows`);
  },
});

registerJob({
  name: 'stale-lead-checker',
  schedule: '0 9 * * *',
  enabled: false,
  handler: async () => {
    // TODO: find leads stuck in a stage for X days, emit event or update status
  },
});
