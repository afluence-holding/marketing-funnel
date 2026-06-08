/**
 * Responses module — domain types.
 *
 * Domain-agnostic: a "response" is one submission captured by a landing
 * (waitlist, quiz, survey, diagnostic). The module never owns the data — it
 * reads existing landing tables in the `marketing` schema and normalizes every
 * row into the same shape so the UI is fully creator-agnostic.
 *
 * Adding a new creator = add a `ResponseSource` descriptor in `sources.ts`.
 * No schema changes, no new tables.
 */

/** A normalized submission. `fields` holds every flattened value as a string. */
export interface ResponseRecord {
  id: string;
  sourceId: string;
  createdAt: string | null;
  name: string;
  email: string;
  phone: string;
  /** Optional lifecycle status (e.g. caro: in_progress | completed | abandoned). */
  status: string | null;
  /** Flattened, stringified view of the whole row (top-level + jsonb + utm_*). */
  fields: Record<string, string>;
}

/** A display column. `key` indexes into `ResponseRecord.fields`. */
export interface ResponseColumn {
  key: string;
  label: string;
}

/** Static description of one landing data source. */
export interface ResponseSource {
  /** Stable id, also used as the URL/tab key. */
  id: string;
  /** Short label for this funnel/source (e.g. "Test de inglés"). */
  label: string;
  /** Creator/brand label (e.g. "Bukku Education"). */
  creatorLabel: string;
  /** Table name within the `marketing` schema. */
  table: string;
  /**
   * Optional equality filter, for shared multi-tenant tables (e.g. the CRM
   * `leads` table holds every org). Dedicated creator tables omit this.
   */
  filter?: { column: string; value: string };
  /** jsonb columns to flatten into top-level fields. */
  jsonbColumns: string[];
  /** jsonb column flattened with an `utm_` prefix (optional). */
  utmColumn?: string;
  /** Column that holds a lifecycle status, if any (enables status filter/stats). */
  statusColumn?: string;
  /** Known status values, ordered, for filter chips + stats breakdown. */
  statusValues?: string[];
  /** Columns shown in the main table (in order). */
  columns: ResponseColumn[];
  /** Max rows to load (safety cap). */
  limit?: number;
}

export interface ResponseStat {
  label: string;
  value: number;
}

/** One source loaded with its records + derived stats. */
export interface ResponseSourceData {
  source: Pick<ResponseSource, 'id' | 'label' | 'creatorLabel' | 'columns' | 'statusColumn' | 'statusValues'>;
  records: ResponseRecord[];
  total: number;
  stats: ResponseStat[];
}

export interface ResponsesOverview {
  organizer: string;
  bu: string;
  sources: ResponseSourceData[];
}
