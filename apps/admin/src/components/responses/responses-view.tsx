'use client';

import { Fragment, useMemo, useState } from 'react';
import { BuSelector } from '@/components/bu-selector';
import type { BuOption } from '@/lib/dashboard/bu-options';
import type { ResponseRecord, ResponseSourceData, ResponsesOverview } from '@/lib/responses/types';

const STATUS_COLOR: Record<string, string> = {
  completed: 'var(--color-success)',
  in_progress: 'var(--color-accent)',
  abandoned: 'var(--color-critical)',
};
const STATUS_LABEL: Record<string, string> = {
  completed: 'Completado',
  in_progress: 'En progreso',
  abandoned: 'Abandonado',
};

function formatDate(value: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function cellValue(record: ResponseRecord, key: string): string {
  const raw = record.fields[key] ?? '';
  if (key === 'created_at' || key === 'subscribed_at' || key === 'completed_at') return formatDate(raw);
  return raw || '—';
}

function downloadCsv(source: ResponseSourceData) {
  const cols = source.source.columns;
  const header = cols.map((c) => c.label);
  const lines = [header];
  for (const r of source.records) {
    lines.push(cols.map((c) => r.fields[c.key] ?? ''));
  }
  const csv = lines
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `respuestas-${source.source.id}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ResponsesView({
  overview,
  buOptions,
  currentPath,
}: {
  overview: ResponsesOverview;
  buOptions: BuOption[];
  currentPath: string;
}) {
  const [activeId, setActiveId] = useState(overview.sources[0]?.source.id ?? '');
  const active = overview.sources.find((s) => s.source.id === activeId) ?? overview.sources[0];

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!active) return [];
    const q = query.trim().toLowerCase();
    return active.records.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
      );
    });
  }, [active, query, statusFilter]);

  if (!active) return null;

  const cols = active.source.columns;

  return (
    <div className="section">
      <div className="report-header" style={{ marginBottom: 16 }}>
        <div>
          <h1>Respuestas</h1>
          <div style={{ marginTop: 4 }}>
            <span className="date-label">{active.source.creatorLabel}</span>{' '}
            <span className="badge badge-blue">{active.source.label}</span>
          </div>
        </div>
        <BuSelector options={buOptions} currentPath={currentPath} />
      </div>

      {overview.sources.length > 1 && (
        <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {overview.sources.map((s) => (
            <button
              key={s.source.id}
              type="button"
              onClick={() => {
                setActiveId(s.source.id);
                setExpanded(null);
                setStatusFilter('all');
              }}
              style={{
                padding: '7px 16px',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 8,
                cursor: 'pointer',
                border: `1px solid ${s.source.id === activeId ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: s.source.id === activeId ? 'var(--color-accent)' : 'var(--color-bg-card)',
                color: s.source.id === activeId ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {s.source.creatorLabel}
            </button>
          ))}
        </nav>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {active.stats.map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ flex: '1 1 140px', minWidth: 140, padding: '14px 16px' }}
          >
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-text-secondary)' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>
              {stat.value.toLocaleString('es-CL')}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
        {active.source.statusValues?.length ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', ...active.source.statusValues].map((sv) => (
              <button
                key={sv}
                type="button"
                onClick={() => setStatusFilter(sv)}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: `1px solid ${statusFilter === sv ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: statusFilter === sv ? 'var(--color-accent)' : 'var(--color-bg-card)',
                  color: statusFilter === sv ? '#fff' : 'var(--color-text-secondary)',
                }}
              >
                {sv === 'all' ? 'Todos' : STATUS_LABEL[sv] ?? sv}
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => downloadCsv(active)}
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
          {filtered.length.toLocaleString('es-CL')} de {active.total.toLocaleString('es-CL')}
        </span>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', minWidth: 880, borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              {cols.map((c) => (
                <th
                  key={c.key}
                  style={{
                    padding: '11px 12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {c.label}
                </th>
              ))}
              <th style={{ padding: '11px 12px', borderBottom: '1px solid var(--color-border)' }} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={cols.length + 1} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No hay respuestas que coincidan.
                </td>
              </tr>
            ) : null}
            {filtered.map((r) => {
              const isOpen = expanded === r.id;
              const detail = Object.entries(r.fields).filter(
                ([k, v]) => v && !cols.some((c) => c.key === k) && k !== 'id',
              );
              return (
                <Fragment key={r.id}>
                  <tr style={{ borderBottom: isOpen ? 'none' : '1px solid var(--color-border)' }}>
                    {cols.map((c) => (
                      <td key={c.key} style={{ padding: '10px 12px', verticalAlign: 'top', overflowWrap: 'anywhere' }}>
                        {c.key === 'status' && r.fields.status ? (
                          <span
                            className="badge"
                            style={{
                              background: 'transparent',
                              border: `1px solid ${STATUS_COLOR[r.fields.status] ?? 'var(--color-border)'}`,
                              color: STATUS_COLOR[r.fields.status] ?? 'var(--color-text-secondary)',
                            }}
                          >
                            {STATUS_LABEL[r.fields.status] ?? r.fields.status}
                          </span>
                        ) : (
                          cellValue(r, c.key)
                        )}
                      </td>
                    ))}
                    <td style={{ padding: '10px 12px', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-secondary)',
                          borderRadius: 8,
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        {isOpen ? 'Ocultar' : 'Ver más'}
                      </button>
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td colSpan={cols.length + 1} style={{ padding: '0 12px 16px' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: 10,
                            background: 'var(--color-bg)',
                            borderRadius: 10,
                            padding: 14,
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          {detail.length === 0 ? (
                            <span style={{ color: 'var(--color-text-secondary)' }}>Sin campos adicionales.</span>
                          ) : (
                            detail.map(([k, v]) => (
                              <div key={k}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                                  {k.replace(/_/g, ' ')}
                                </div>
                                <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{v}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
