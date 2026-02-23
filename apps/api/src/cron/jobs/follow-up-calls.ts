import { registerJob } from '../scheduler';

registerJob({
  name: 'follow-up-calls',
  schedule: '0 10 * * 1-5', // weekdays at 10am
  enabled: false,
  handler: async () => {
    // TODO: when workflows are built, this job will:
    // 1. Query leads that need follow-up:
    //    - status = 'new', entered funnel > 24h ago, no ai_call_initiated activity
    // 2. For each lead, call callLead() from services/call.service
    //    - or use makeBatchCalls() from @marketing-funnel/elevenlabs for efficiency
    // 3. Log results
    console.log('[follow-up-calls] Job not yet implemented');
  },
});
