/**
 * Responses module — stat builder (pure, framework-free).
 *
 * Shared by the server repository (initial load over all records) and the
 * client view (recomputed when the user scopes to a single campaign/landing),
 * so the stat cards always reflect the current selection consistently.
 */
import {
  RESPONSE_STATUS_STAT_LABELS,
  type ResponseProgress,
  type ResponseRecord,
  type ResponseStat,
} from './types';
import { prettyFacet } from './presentation';

/**
 * Campaign/landing facet for the stat cards — the loaded distinct landing
 * values + counts, plus the shared slug prefix and optional friendly labels.
 * Only consumed by the `landing` progress capability.
 */
export interface StatFacet {
  values: Array<[string, number]>;
  prefix: string;
  labels?: Record<string, string>;
  max?: number;
}

function contactStats(records: ResponseRecord[]): ResponseStat[] {
  return [
    { label: 'Con email', value: records.filter((r) => r.email).length },
    { label: 'Con WhatsApp', value: records.filter((r) => r.phone).length },
  ];
}

/**
 * Derive the stat cards from a source's `progress` capability (exhaustive):
 * - `status`  → one card per lifecycle value (Caro).
 * - `landing` → one card per landing (top N + "Otras"); falls back to
 *               email/WhatsApp when only one landing is in scope.
 * - `none`    → email/WhatsApp coverage.
 */
export function buildResponseStats(
  records: ResponseRecord[],
  total: number,
  progress: ResponseProgress,
  facet?: StatFacet,
): ResponseStat[] {
  const stats: ResponseStat[] = [{ label: 'Total', value: total }];

  switch (progress.kind) {
    case 'status': {
      for (const status of progress.values) {
        stats.push({
          label: RESPONSE_STATUS_STAT_LABELS[status] ?? status,
          value: records.filter((r) => r.status === status).length,
        });
      }
      return stats;
    }
    case 'landing': {
      if (!facet || facet.values.length <= 1) return [...stats, ...contactStats(records)];
      const { values, prefix, labels, max = 4 } = facet;
      for (const [value, count] of values.slice(0, max)) {
        stats.push({ label: labels?.[value] ?? prettyFacet(value, prefix), value: count });
      }
      const rest = values.slice(max).reduce((sum, [, c]) => sum + c, 0);
      if (rest > 0) stats.push({ label: 'Otras', value: rest });
      return stats;
    }
    case 'none':
      return [...stats, ...contactStats(records)];
  }
}
