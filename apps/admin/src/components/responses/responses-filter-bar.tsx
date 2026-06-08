'use client';

import { ADMIN_LOCALE, prettyFacet } from '@/lib/responses/presentation';
import { RESPONSE_STATUS_LABELS, type ResponseStatus } from '@/lib/responses/types';

export type StatusFilter = 'all' | ResponseStatus;

/**
 * Toolbar: free-text search, status chips (when the source declares statuses),
 * a source/landing facet dropdown, CSV export and a result counter. Chips reuse
 * the shared `.launch-chip` style so they match the rest of the Centro.
 */
export function ResponsesFilterBar({
  query,
  onQuery,
  statusValues,
  statusFilter,
  onStatusFilter,
  sourceOptions,
  sourcePrefix,
  sourceNoun,
  sourceFilter,
  onSourceFilter,
  onExport,
  filteredCount,
  total,
}: {
  query: string;
  onQuery: (v: string) => void;
  statusValues?: readonly ResponseStatus[];
  statusFilter: StatusFilter;
  onStatusFilter: (v: StatusFilter) => void;
  sourceOptions: Array<[string, number]>;
  sourcePrefix: string;
  sourceNoun: string;
  sourceFilter: string;
  onSourceFilter: (v: string) => void;
  onExport: () => void;
  filteredCount: number;
  total: number;
}) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
      <input
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Buscar por nombre, email o WhatsApp…"
        style={{
          flex: '1 1 280px',
          minWidth: 220,
          padding: '9px 12px',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-card)',
          color: 'var(--color-text-primary)',
        }}
      />

      {statusValues?.length ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', ...statusValues] as StatusFilter[]).map((sv) => (
            <button
              key={sv}
              type="button"
              className={`launch-chip${statusFilter === sv ? ' active' : ''}`}
              onClick={() => onStatusFilter(sv)}
            >
              {sv === 'all' ? 'Todos los estados' : RESPONSE_STATUS_LABELS[sv]}
            </button>
          ))}
        </div>
      ) : null}

      {sourceOptions.length ? (
        <select
          value={sourceFilter}
          onChange={(e) => onSourceFilter(e.target.value)}
          aria-label={`Filtrar por ${sourceNoun}`}
          title={`Filtrar por ${sourceNoun}`}
          style={{
            padding: '9px 12px',
            borderRadius: 8,
            border: `1px solid ${sourceFilter !== 'all' ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: 'var(--color-bg-card)',
            color: sourceFilter !== 'all' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            maxWidth: 260,
          }}
        >
          <option value="all">Todas · {sourceNoun}</option>
          {sourceOptions.map(([value, count]) => (
            <option key={value} value={value}>
              {prettyFacet(value, sourcePrefix)} ({count.toLocaleString(ADMIN_LOCALE)})
            </option>
          ))}
        </select>
      ) : null}

      <button
        type="button"
        onClick={onExport}
        style={{
          padding: '9px 16px',
          fontSize: '0.8rem',
          fontWeight: 700,
          borderRadius: 8,
          cursor: 'pointer',
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-card)',
          color: 'var(--color-text-primary)',
        }}
      >
        Exportar CSV
      </button>

      <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
        {filteredCount.toLocaleString(ADMIN_LOCALE)} de {total.toLocaleString(ADMIN_LOCALE)}
      </span>
    </div>
  );
}
