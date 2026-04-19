import type { InsightsTier } from './types';

/** Tier thresholds, in days ago. */
const RECENT_MAX_DAYS = 7;
const MID_MAX_DAYS = 30;

/**
 * Classify an insight date into a caching tier.
 *
 *   today       → the row is for today (Santiago/en-CA local date)
 *   recent      → 1..7 days ago
 *   mid         → 8..30 days ago
 *   historical  → 31+ days ago
 */
export function classifyTier(dateStr: string, today: Date = new Date()): InsightsTier {
  const localToday = todayLocalISO(today);
  if (dateStr === localToday) return 'today';
  const delta = daysBetween(dateStr, localToday);
  if (delta <= RECENT_MAX_DAYS) return 'recent';
  if (delta <= MID_MAX_DAYS) return 'mid';
  return 'historical';
}

function todayLocalISO(now: Date): string {
  // en-CA renders YYYY-MM-DD natively.
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}

function daysBetween(earlier: string, later: string): number {
  const ms = Date.parse(later + 'T00:00:00Z') - Date.parse(earlier + 'T00:00:00Z');
  return Math.floor(ms / 86_400_000);
}
