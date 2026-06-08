'use client';

import { ADMIN_LOCALE } from '@/lib/responses/presentation';
import { RESPONSE_STATUS_LABELS, type ResponseStatus } from '@/lib/responses/types';

export type StatusFilter = 'all' | ResponseStatus;

/**
 * Toolbar: free-text search, status chips (when the source declares statuses),
 * CSV export and a result counter. Campaign/landing selection lives in the
 * sidebar (the modular nav). Chips reuse the shared `.launch-chip` style.
 */
export function ResponsesFilterBar({
  query,
  onQuery,
  statusValues,
  statusFilter,
  onStatusFilter,
  onExport,
  filteredCount,
  total,
}: {
  query: string;
  onQuery: (v: string) => void;
  statusValues?: readonly ResponseStatus[];
  statusFilter: StatusFilter;
  onStatusFilter: (v: StatusFilter) => void;
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
