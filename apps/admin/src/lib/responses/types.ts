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

/**
 * Lifecycle statuses a source may declare (e.g. Caro's diagnostic quiz). Labels
 * and colors live here so the view and the repository share one source of truth
 * (mirrors how launch-ops keeps STATUS_LABELS in its types).
 */
export type ResponseStatus = 'completed' | 'in_progress' | 'abandoned';

/** Singular labels for chips / table badges. */
export const RESPONSE_STATUS_LABELS: Record<ResponseStatus, string> = {
  completed: 'Completado',
  in_progress: 'En progreso',
  abandoned: 'Abandonado',
};

/** Plural labels for aggregate stat cards. */
export const RESPONSE_STATUS_STAT_LABELS: Record<ResponseStatus, string> = {
  completed: 'Completados',
  in_progress: 'En progreso',
  abandoned: 'Abandonados',
};

/** Semantic color token per status. */
export const RESPONSE_STATUS_COLORS: Record<ResponseStatus, string> = {
  completed: 'var(--color-success)',
  in_progress: 'var(--color-accent)',
  abandoned: 'var(--color-critical)',
};

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

/**
 * ─── Capability contract ─────────────────────────────────────────────────
 * A source varies along three orthogonal axes we discovered in the data model.
 * Each is modelled as an explicit, exhaustive descriptor instead of loose
 * optional flags, so the engine (repository · stats · view) switches on `kind`
 * and the compiler enforces every case. Adding a creator = a pure declaration.
 */

/** WHERE the rows live. */
export type ResponseStorage =
  | { kind: 'crm'; table: string; orgId: string } // shared marketing.leads, scoped by org
  | { kind: 'dedicated'; table: string }; //          creator-owned table

/** WHAT "progress" means for this source (drives stat cards + filter chips). */
export type ResponseProgress =
  | { kind: 'status'; column: string; values: readonly ResponseStatus[] } // lifecycle (Caro)
  | { kind: 'landing'; column: string; labels?: Record<string, string> } // breakdown by landing
  | { kind: 'none' }; //                                                    no breakdown

/** HOW the row is flattened + which columns to surface. */
export interface ResponseShape {
  /** jsonb columns to spread into top-level fields. */
  jsonbColumns: string[];
  /** jsonb column flattened with an `utm_` prefix (optional). */
  utmColumn?: string;
  /** Columns shown in the main table (in order). */
  columns: ResponseColumn[];
}

/** Static description of one landing data source (capability-driven). */
export interface ResponseSource {
  /** Stable id, also used as the URL/tab key. */
  id: string;
  /** Short label for this funnel/source (e.g. "Test de inglés"). */
  label: string;
  /** Creator/brand label (e.g. "Bukku Education"). */
  creatorLabel: string;
  storage: ResponseStorage;
  progress: ResponseProgress;
  shape: ResponseShape;
  /** Max rows to load (safety cap). */
  limit?: number;
}

export interface ResponseStat {
  label: string;
  value: number;
}

/**
 * Client-safe projection of a source. `progress` is plain data (no functions)
 * so the client can switch on `progress.kind` for chips/breakdown; `sourceColumn`
 * is the resolved facet key used for the campaign/landing selector.
 */
export interface ResponseSourceView {
  id: string;
  label: string;
  creatorLabel: string;
  columns: ResponseColumn[];
  progress: ResponseProgress;
  sourceColumn: string;
}

/** One source loaded with its records + derived stats. */
export interface ResponseSourceData {
  source: ResponseSourceView;
  records: ResponseRecord[];
  total: number;
  stats: ResponseStat[];
}

export interface ResponsesOverview {
  organizer: string;
  bu: string;
  sources: ResponseSourceData[];
}
