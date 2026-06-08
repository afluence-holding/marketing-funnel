/**
 * Responses module — stat builder (pure, framework-free).
 *
 * Shared by the server repository (initial load over all records) and the
 * client view (recomputed when the user scopes to a single campaign/landing),
 * so the stat cards always reflect the current selection consistently.
 */
import {
  RESPONSE_STATUS_STAT_LABELS,
  type ResponseRecord,
  type ResponseStat,
  type ResponseStatus,
} from './types';
import { prettyFacet } from './presentation';

/**
 * Optional campaign/landing facet for the stat cards. When a source has no
 * status lifecycle (single-step forms like German's registrations) we break the
 * total down by landing instead — the meaningful "progress"/distribution view
 * with real data. Mirrors how Caro breaks down by status.
 */
export interface StatFacet {
  values: Array<[string, number]>;
  prefix: string;
  max?: number;
}

export interface StatConfig {
  statusColumn?: string;
  statusValues?: readonly ResponseStatus[];
  facet?: StatFacet;
}

export function buildResponseStats(
  records: ResponseRecord[],
  total: number,
  config: StatConfig,
): ResponseStat[] {
  const stats: ResponseStat[] = [{ label: 'Total', value: total }];

  if (config.statusColumn && config.statusValues?.length) {
    // Status-driven sources (e.g. Caro's diagnostic): breakdown by lifecycle.
    for (const status of config.statusValues) {
      stats.push({
        label: RESPONSE_STATUS_STAT_LABELS[status] ?? status,
        value: records.filter((r) => r.status === status).length,
      });
    }
  } else if (config.facet && config.facet.values.length > 1) {
    // No lifecycle but multiple landings: breakdown by landing (top N + Otros).
    const { values, prefix, max = 4 } = config.facet;
    const top = values.slice(0, max);
    for (const [value, count] of top) {
      stats.push({ label: prettyFacet(value, prefix), value: count });
    }
    const rest = values.slice(max).reduce((sum, [, c]) => sum + c, 0);
    if (rest > 0) stats.push({ label: 'Otras', value: rest });
  } else {
    // Lead-style single-source: surface how many left a phone / email.
    stats.push({ label: 'Con email', value: records.filter((r) => r.email).length });
    stats.push({ label: 'Con WhatsApp', value: records.filter((r) => r.phone).length });
  }
  return stats;
}
