/**
 * Responses module — data access layer.
 *
 * Read-only. Reads existing landing tables in the `marketing` schema via the
 * service-role client and normalizes every row into `ResponseRecord`. The
 * module never writes to these tables (they are owned by the live web/api
 * intake) — it only surfaces them in the back office.
 */

import { getSupabaseMarketing } from '@/lib/supabase/server';
import { sourcesForTenant } from './sources';
import type {
  ResponseRecord,
  ResponseSource,
  ResponseSourceData,
  ResponseStat,
  ResponsesOverview,
} from './types';

type Row = Record<string, unknown>;

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Flatten a DB row into a flat string map: top-level scalars + spread jsonb
 * columns + utm_-prefixed utm column. Fully generic — no per-source logic.
 */
function flattenRow(row: Row, source: ResponseSource): Record<string, string> {
  const fields: Record<string, string> = {};
  const jsonb = new Set(source.jsonbColumns);

  for (const [key, value] of Object.entries(row)) {
    if (jsonb.has(key) && value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [k, v] of Object.entries(value as Row)) fields[k] = toStringValue(v);
      continue;
    }
    if (source.utmColumn && key === source.utmColumn && value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Row)) fields[`utm_${k}`] = toStringValue(v);
      continue;
    }
    fields[key] = toStringValue(value);
  }
  return fields;
}

function mapRecord(row: Row, source: ResponseSource): ResponseRecord {
  const fields = flattenRow(row, source);
  return {
    id: toStringValue(row.id) || `${source.id}-${toStringValue(row.created_at)}`,
    sourceId: source.id,
    createdAt: (row.created_at as string | null) ?? null,
    name: toStringValue(row.first_name),
    email: toStringValue(row.email),
    phone: toStringValue(row.phone),
    status: source.statusColumn ? toStringValue(row[source.statusColumn]) || null : null,
    fields,
  };
}

function buildStats(records: ResponseRecord[], total: number, source: ResponseSource): ResponseStat[] {
  const stats: ResponseStat[] = [{ label: 'Total', value: total }];

  if (source.statusColumn && source.statusValues?.length) {
    const labelByStatus: Record<string, string> = {
      completed: 'Completados',
      in_progress: 'En progreso',
      abandoned: 'Abandonados',
    };
    for (const status of source.statusValues) {
      stats.push({
        label: labelByStatus[status] ?? status,
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

async function loadSource(source: ResponseSource): Promise<ResponseSourceData> {
  const db = getSupabaseMarketing();
  const { data, error, count } = await db
    .from(source.table)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(source.limit ?? 2000);

  if (error) throw error;
  const rows = (data ?? []) as Row[];
  const records = rows.map((r) => mapRecord(r, source));
  const total = count ?? records.length;

  return {
    source: {
      id: source.id,
      label: source.label,
      creatorLabel: source.creatorLabel,
      columns: source.columns,
      statusColumn: source.statusColumn,
      statusValues: source.statusValues,
    },
    records,
    total,
    stats: buildStats(records, total, source),
  };
}

/** Load all response sources configured for a tenant. */
export async function getResponsesForTenant(organizer: string, bu: string): Promise<ResponsesOverview> {
  const sources = sourcesForTenant(organizer, bu);
  const sourceData = await Promise.all(sources.map((s) => loadSource(s)));
  return { organizer, bu, sources: sourceData };
}
