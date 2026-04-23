import type { InsightsTier } from './types';

/** Tier thresholds, in days ago. */
const RECENT_MAX_DAYS = 7;
const MID_MAX_DAYS = 30;

/** Default timezone when the caller doesn't pass one. Matches DI21's operating region. */
const DEFAULT_TIME_ZONE = 'America/Lima';

/**
 * Classify an insight date into a caching tier.
 *
 *   today       → the row is for today (local date in `timeZone`)
 *   recent      → 1..7 days ago
 *   mid         → 8..30 days ago
 *   historical  → 31+ days ago
 *
 * The comparison is done in local time of `timeZone` (default: America/Lima).
 */
export function classifyTier(
  dateStr: string,
  today: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE,
): InsightsTier {
  const localToday = todayLocalISO(today, timeZone);
  if (dateStr === localToday) return 'today';
  const delta = daysBetween(dateStr, localToday);
  if (delta <= RECENT_MAX_DAYS) return 'recent';
  if (delta <= MID_MAX_DAYS) return 'mid';
  return 'historical';
}

function todayLocalISO(now: Date, timeZone: string): string {
  // en-CA renders YYYY-MM-DD natively.
  return now.toLocaleDateString('en-CA', { timeZone });
}

function daysBetween(earlier: string, later: string): number {
  const ms = Date.parse(later + 'T00:00:00Z') - Date.parse(earlier + 'T00:00:00Z');
  return Math.floor(ms / 86_400_000);
}
