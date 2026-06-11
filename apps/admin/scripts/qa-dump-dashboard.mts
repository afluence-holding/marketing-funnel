/**
 * QA harness: dump the exact DashboardData the campaigns view renders, so it
 * can be diffed against ground-truth SQL. Usage:
 *   npx tsx apps/admin/scripts/qa-dump-dashboard.mts [organizer] [bu] [outfile]
 */
import { writeFileSync } from 'node:fs';
import { loadDashboard } from '../src/lib/campaigns/dashboard-adapter';

const organizerSlug = process.argv[2] ?? 'german-roz';
const buSlug = process.argv[3] ?? 'di21';
const outfile = process.argv[4] ?? '/tmp/qa-dashboard-dump.json';

const data = await loadDashboard({ organizerSlug, buSlug });
writeFileSync(outfile, JSON.stringify(data, null, 2));
console.log(`wrote ${outfile} (${Object.keys(data).length} top-level keys)`);
