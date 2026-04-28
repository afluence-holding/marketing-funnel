/**
 * Scheduled Meta Ads pulls that keep the admin dashboard fresh.
 *
 * The admin app exposes three POST routes protected by a bearer secret:
 *
 *   /api/cron/today         — pull for the current day (cheap, hourly)
 *   /api/cron/recent        — pull for the recent N days (heavier, ~3x day)
 *   /api/cron/token-health  — verify the long-lived Meta token (daily)
 *
 * Rather than running a separate Railway cron service, we piggy-back on the
 * node-cron scheduler that already lives inside the API process (which runs
 * 24/7 anyway). Each job simply does a bearer-authenticated HTTP POST to the
 * admin. If ADMIN_URL or CRON_SECRET is missing we log a warning once and
 * skip — local dev, staging, and deployments without the admin dashboard
 * keep working.
 */

import { env } from '@marketing-funnel/config';
import { registerJob } from '../scheduler';

const TIMEOUT_MS = 120_000; // Pulls can take ~30-60s on large accounts.

/**
 * POST to an admin cron route with bearer auth. Throws on non-2xx so
 * registerJob's try/catch surfaces the failure in the scheduler log.
 */
async function triggerAdminCron(path: string): Promise<unknown> {
  if (!env.ADMIN_URL || !env.CRON_SECRET) {
    console.warn(
      `[cron/admin-pulls] Skipping ${path} — ADMIN_URL or CRON_SECRET not set`,
    );
    return null;
  }

  const url = new URL(path, env.ADMIN_URL).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
      // Admin routes don't require a body for scheduled pulls (they iterate
      // every business_unit by default), but an empty JSON avoids tripping
      // frameworks that expect a parseable body.
      body: '{}',
      signal: controller.signal,
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `${path} → ${res.status} ${res.statusText}: ${text.slice(0, 500)}`,
      );
    }

    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Enable the jobs only when both env vars are configured. This avoids noisy
 * "Skipping …" logs every minute on deploys that don't use the admin.
 */
const adminPullsEnabled = Boolean(env.ADMIN_URL && env.CRON_SECRET);

registerJob({
  name: 'admin-pull-today',
  schedule: '0 * * * *', // Every hour on the :00
  enabled: adminPullsEnabled,
  handler: async () => {
    const out = await triggerAdminCron('/api/cron/today');
    console.log('[cron/admin-pulls] today result:', summarise(out));
  },
});

registerJob({
  name: 'admin-pull-recent',
  schedule: '0 6,14,22 * * *', // 06:00, 14:00, 22:00 server time
  enabled: adminPullsEnabled,
  handler: async () => {
    const out = await triggerAdminCron('/api/cron/recent');
    console.log('[cron/admin-pulls] recent result:', summarise(out));
  },
});

registerJob({
  name: 'admin-pull-token-health',
  schedule: '0 3 * * *', // 03:00 server time
  enabled: adminPullsEnabled,
  handler: async () => {
    const out = await triggerAdminCron('/api/cron/token-health');
    console.log('[cron/admin-pulls] token-health result:', summarise(out));
  },
});

/** Truncate long response bodies so the log stays readable. */
function summarise(value: unknown): string {
  if (value == null) return 'null';
  try {
    const s = typeof value === 'string' ? value : JSON.stringify(value);
    return s.length > 800 ? `${s.slice(0, 800)}…` : s;
  } catch {
    return '<unserialisable>';
  }
}
