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
import { buildResponseStats } from './stats';
import type {
  ResponseRecord,
  ResponseSource,
  ResponseSourceData,
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
function flattenRow(row: Row, shape: ResponseSource['shape']): Record<string, string> {
  const fields: Record<string, string> = {};
  const jsonb = new Set(shape.jsonbColumns);

  for (const [key, value] of Object.entries(row)) {
    if (jsonb.has(key) && value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [k, v] of Object.entries(value as Row)) fields[k] = toStringValue(v);
      continue;
    }
    if (shape.utmColumn && key === shape.utmColumn && value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Row)) fields[`utm_${k}`] = toStringValue(v);
      continue;
    }
    fields[key] = toStringValue(value);
  }
  return fields;
}

function mapRecord(row: Row, source: ResponseSource): ResponseRecord {
  const fields = flattenRow(row, source.shape);
  const statusKey = source.progress.kind === 'status' ? source.progress.column : null;
  return {
    id: toStringValue(row.id) || `${source.id}-${toStringValue(row.created_at)}`,
    sourceId: source.id,
    createdAt: (row.created_at as string | null) ?? null,
    name: toStringValue(row.first_name),
    email: toStringValue(row.email),
    phone: toStringValue(row.phone),
    status: statusKey ? toStringValue(fields[statusKey]) || null : null,
    fields,
  };
}

/**
 * Field key (in the flattened `fields` map) used for the campaign/landing
 * facet. The `landing` progress capability names it explicitly; otherwise we
 * default to `utm_source` (when a utm column is flattened) or `source`.
 */
function resolveSourceColumn(source: ResponseSource): string {
  if (source.progress.kind === 'landing') return source.progress.column;
  return source.shape.utmColumn ? 'utm_source' : 'source';
}

/** Distinct facet values + counts for the landing breakdown, server-side. */
function buildFacet(records: ResponseRecord[], key: string): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const r of records) {
    const value = (r.fields[key] ?? '').trim();
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** PostgREST caps each response at ~1000 rows, so we page through with range(). */
const PAGE_SIZE = 1000;

async function loadSource(source: ResponseSource): Promise<ResponseSourceData> {
  const db = getSupabaseMarketing();
  const cap = source.limit ?? 2000;
  const rows: Row[] = [];
  let total = 0;

  for (let from = 0; from < cap; from += PAGE_SIZE) {
    const to = Math.min(from + PAGE_SIZE, cap) - 1;
    let query = db.from(source.storage.table).select('*', { count: 'exact' });
    if (source.storage.kind === 'crm') query = query.eq('organization_id', source.storage.orgId);
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    if (count != null) total = count;
    const page = (data ?? []) as Row[];
    rows.push(...page);
    if (page.length < to - from + 1) break;
  }

  const records = rows.map((r) => mapRecord(r, source));
  total = total || records.length;
  const sourceColumn = resolveSourceColumn(source);

  const facet =
    source.progress.kind === 'landing'
      ? {
          values: buildFacet(records, sourceColumn),
          prefix: '',
          labels: source.progress.labels,
        }
      : undefined;

  return {
    source: {
      id: source.id,
      label: source.label,
      creatorLabel: source.creatorLabel,
      columns: source.shape.columns,
      progress: source.progress,
      sourceColumn,
    },
    records,
    total,
    stats: buildResponseStats(records, total, source.progress, facet),
  };
}

/** Load all response sources configured for a tenant. */
export async function getResponsesForTenant(organizer: string, bu: string): Promise<ResponsesOverview> {
  const sources = sourcesForTenant(organizer, bu);
  const sourceData = await Promise.all(sources.map((s) => loadSource(s)));
  return { organizer, bu, sources: sourceData };
}
