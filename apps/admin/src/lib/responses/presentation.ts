/**
 * Responses module — presentation helpers (pure, framework-free).
 *
 * Extracted from the view so the UI components stay declarative and these
 * formatting rules are unit-testable + reusable. No React here.
 */
import type { ResponseRecord, ResponseSourceData } from './types';

export const ADMIN_LOCALE = 'es-CL';

/** Field keys rendered as datetimes (everything else is shown verbatim). */
const DATETIME_KEYS = new Set(['created_at', 'subscribed_at', 'completed_at']);

export function formatDate(value: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(ADMIN_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Display value for a table cell, formatting datetime columns. */
export function cellValue(record: ResponseRecord, key: string): string {
  const raw = record.fields[key] ?? '';
  if (DATETIME_KEYS.has(key)) return formatDate(raw);
  return raw || '—';
}

/** Longest common prefix across a list of strings (for facet label cleanup). */
export function commonPrefix(values: string[]): string {
  if (values.length < 2) return '';
  let prefix = values[0];
  for (const v of values.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < v.length && prefix[i] === v[i]) i++;
    prefix = prefix.slice(0, i);
    if (!prefix) break;
  }
  return prefix;
}

/** Human label for a facet value: drop the shared prefix and de-slug. */
export function prettyFacet(value: string, prefix: string): string {
  const stripped = (prefix && value.startsWith(prefix) ? value.slice(prefix.length) : value).trim();
  const base = stripped || value;
  return base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || value;
}

/** Serialize a source's records to CSV text (BOM added by the caller). */
export function buildCsv(source: ResponseSourceData): string {
  const cols = source.source.columns;
  const lines: string[][] = [cols.map((c) => c.label)];
  for (const r of source.records) lines.push(cols.map((c) => r.fields[c.key] ?? ''));
  return lines
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

/** Trigger a client-side CSV download for a source. */
export function downloadCsv(source: ResponseSourceData): void {
  const blob = new Blob([`\uFEFF${buildCsv(source)}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `respuestas-${source.source.id}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
