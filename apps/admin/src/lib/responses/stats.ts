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

export interface StatConfig {
  statusColumn?: string;
  statusValues?: readonly ResponseStatus[];
}

export function buildResponseStats(
  records: ResponseRecord[],
  total: number,
  config: StatConfig,
): ResponseStat[] {
  const stats: ResponseStat[] = [{ label: 'Total', value: total }];

  if (config.statusColumn && config.statusValues?.length) {
    for (const status of config.statusValues) {
      stats.push({
        label: RESPONSE_STATUS_STAT_LABELS[status] ?? status,
        value: records.filter((r) => r.status === status).length,
      });
    }
  } else {
    // Lead-style sources: surface how many left a phone / email.
    stats.push({ label: 'Con email', value: records.filter((r) => r.email).length });
    stats.push({ label: 'Con WhatsApp', value: records.filter((r) => r.phone).length });
  }
  return stats;
}
