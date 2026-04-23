'use client';

import { useMemo, useState } from 'react';
import type { AdPerfRow } from '@/lib/dashboard/dashboard-adapter';

// ---------------------------------------------------------------------------
// Sortable + filterable Ad Performance table
// ---------------------------------------------------------------------------
// The server component produces `rows` already sorted by "active first, dead
// last" (see adapter). This client component adds:
//
//   1. Per-column sorting via header click (3-state cycle).
//   2. Multi-select filters for Status / Role / Format.
//   3. Free-text search over ad name and ad set name.
//
// All logic is pure client-side (useMemo) so sorting/filtering is instant
// and never triggers a server round-trip.
// ---------------------------------------------------------------------------

type SortKey =
  | 'name'
  | 'adset_name'
  | 'spend'
  | 'impressions'
  | 'reach'
  | 'link_clicks'
  | 'link_ctr'
  | 'lp_views'
  | 'purchases'
  | 'cpa'
  | 'pct_of_budget'
  | 'status';

type SortDir = 'asc' | 'desc';

interface SortState {
  key: SortKey;
  dir: SortDir;
}

interface ColumnDef {
  key: SortKey;
  label: string;
  align?: 'left' | 'right';
  numeric?: boolean;
}

const COLUMNS: ColumnDef[] = [
  { key: 'name',          label: 'Ad',           align: 'left'  },
  { key: 'adset_name',    label: 'Ad Set',       align: 'left'  },
  { key: 'spend',         label: 'Spend',        align: 'right', numeric: true },
  { key: 'impressions',   label: 'Imp',          align: 'right', numeric: true },
  { key: 'reach',         label: 'Reach',        align: 'right', numeric: true },
  { key: 'link_clicks',   label: 'Link Clicks',  align: 'right', numeric: true },
  { key: 'link_ctr',      label: 'Link CTR',     align: 'right', numeric: true },
  { key: 'lp_views',      label: 'LP Views',     align: 'right', numeric: true },
  { key: 'purchases',     label: 'Purchases',    align: 'right', numeric: true },
  { key: 'cpa',           label: 'CPA',          align: 'right', numeric: true },
  { key: 'pct_of_budget', label: '%Budget',      align: 'right', numeric: true },
  { key: 'status',        label: 'Status',       align: 'left'  },
];

/**
 * Rank used to sort by the status column. Winner is the most "desirable"
 * signal, dead the least. Ascending therefore goes dead→testing→watch→
 * active→winner which surfaces problems first; descending surfaces winners
 * first — matches operator intent when clicking the column.
 */
const STATUS_RANK: Record<AdPerfRow['status_dot'], number> = {
  dead: 0,
  testing: 1,
  watch: 2,
  active: 3,
  winner: 4,
};

const STATUS_OPTIONS: Array<{ key: AdPerfRow['status_dot']; label: string }> = [
  { key: 'winner',  label: 'Winner'  },
  { key: 'active',  label: 'Active'  },
  { key: 'watch',   label: 'Watch'   },
  { key: 'testing', label: 'Testing' },
  { key: 'dead',    label: 'Dead'    },
];

const FORMAT_OPTIONS: Array<AdPerfRow['format']> = ['VID', 'IMG'];

function compareRows(a: AdPerfRow, b: AdPerfRow, key: SortKey, dir: SortDir): number {
  const mult = dir === 'asc' ? 1 : -1;
  if (key === 'name')       return a.name.localeCompare(b.name) * mult;
  if (key === 'adset_name') return a.adset_name.localeCompare(b.adset_name) * mult;
  if (key === 'status')     return (STATUS_RANK[a.status_dot] - STATUS_RANK[b.status_dot]) * mult;
  // Numeric columns. `cpa` is nullable — null rows always sink to the
  // bottom regardless of direction so operators aren't forced to scroll
  // past a block of "—" values to reach real data.
  const va = (a[key] as number | null) ?? null;
  const vb = (b[key] as number | null) ?? null;
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  return (va - vb) * mult;
}

export interface AdPerformanceTableProps {
  rows: AdPerfRow[];
  linkCtrTarget: number;
  linkCtrWarn: number;
}

export function AdPerformanceTable({
  rows,
  linkCtrTarget,
  linkCtrWarn,
}: AdPerformanceTableProps) {
  const [sort, setSort] = useState<SortState | null>(null);
  const [search, setSearch] = useState('');
  // Filter state holds the SELECTED keys. Empty set = show all. This is
  // more intuitive than "exclude mode": operators add statuses/roles they
  // care about rather than enumerating the ones to hide.
  const [statusFilter, setStatusFilter] = useState<Set<AdPerfRow['status_dot']>>(new Set());
  const [roleFilter,   setRoleFilter]   = useState<Set<string>>(new Set());
  const [formatFilter, setFormatFilter] = useState<Set<AdPerfRow['format']>>(new Set());

  // Build role options from the data so new roles (e.g. CARTAB) show up
  // automatically without a code change.
  const roleOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) s.add(r.adset_role);
    return Array.from(s).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (statusFilter.size > 0 && !statusFilter.has(r.status_dot)) return false;
      if (roleFilter.size   > 0 && !roleFilter.has(r.adset_role))   return false;
      if (formatFilter.size > 0 && !formatFilter.has(r.format))     return false;
      if (q) {
        const hay = `${r.name} ${r.adset_name} ${r.adset_role}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, statusFilter, roleFilter, formatFilter, search]);

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;
    // Shallow clone so we don't mutate the props array (which would leak
    // across renders in Next.js dev mode).
    return [...filteredRows].sort((a, b) => compareRows(a, b, sort.key, sort.dir));
  }, [filteredRows, sort]);

  const handleHeaderClick = (key: SortKey) => {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: 'desc' };  // first click: desc
      if (prev.dir === 'desc')       return { key, dir: 'asc' };    // second click: asc
      return null;                                                    // third click: clear
    });
  };

  const toggle = <T,>(set: Set<T>, key: T): Set<T> => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter(new Set());
    setRoleFilter(new Set());
    setFormatFilter(new Set());
  };

  const anyFilterActive =
    search.length > 0 ||
    statusFilter.size > 0 ||
    roleFilter.size > 0 ||
    formatFilter.size > 0;

  return (
    <div className="section">
      <div className="section-title">
        Ad Performance ({sortedRows.length}
        {sortedRows.length !== rows.length ? ` / ${rows.length}` : ''} ads)
        {sort ? (
          <span
            style={{
              marginLeft: 10,
              fontSize: '0.7rem',
              color: 'var(--color-text-secondary)',
              fontWeight: 400,
            }}
          >
            — ordenado por <strong>{COLUMNS.find(c => c.key === sort.key)?.label}</strong>{' '}
            {sort.dir === 'asc' ? '↑' : '↓'}{' '}
            <button
              type="button"
              onClick={() => setSort(null)}
              style={chipButtonStyle}
            >
              reset sort
            </button>
          </span>
        ) : null}
      </div>

      {/* Filter bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          padding: '10px 12px',
          marginBottom: 8,
        }}
      >
        <input
          type="search"
          placeholder="Buscar por ad, ad set o role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1 1 240px',
            minWidth: 200,
            padding: '6px 10px',
            fontSize: '0.8rem',
            background: 'var(--color-bg-hover)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
          }}
        />

        <FilterGroup
          label="Status"
          options={STATUS_OPTIONS.map(o => ({ key: o.key, label: o.label }))}
          selected={statusFilter}
          onToggle={k => setStatusFilter(s => toggle(s, k))}
        />

        <FilterGroup
          label="Role"
          options={roleOptions.map(r => ({ key: r, label: r }))}
          selected={roleFilter}
          onToggle={k => setRoleFilter(s => toggle(s, k))}
        />

        <FilterGroup
          label="Format"
          options={FORMAT_OPTIONS.map(f => ({ key: f, label: f }))}
          selected={formatFilter}
          onToggle={k => setFormatFilter(s => toggle(s, k))}
        />

        {anyFilterActive ? (
          <button type="button" onClick={clearFilters} style={chipButtonStyle}>
            limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {COLUMNS.map(col => {
                const active = sort?.key === col.key;
                const arrow = active
                  ? sort?.dir === 'asc'
                    ? ' ↑'
                    : ' ↓'
                  : '';
                return (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col.key)}
                    title="Click para ordenar"
                    style={{
                      textAlign: col.align,
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      color: active ? 'var(--color-text-primary)' : undefined,
                    }}
                  >
                    {col.label}
                    <span
                      style={{
                        color: active
                          ? 'var(--color-accent)'
                          : 'var(--color-text-secondary)',
                        opacity: active ? 1 : 0.35,
                        marginLeft: 3,
                        fontSize: '0.65rem',
                      }}
                    >
                      {arrow || '↕'}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(r => (
              <AdPerfRowView
                key={r.id}
                row={r}
                linkCtrTarget={linkCtrTarget}
                linkCtrWarn={linkCtrWarn}
              />
            ))}
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  style={{
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    padding: 20,
                    fontSize: '0.8rem',
                  }}
                >
                  No hay ads que cumplan los filtros actuales.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilterGroup: compact pill-group for multi-select filters
// ---------------------------------------------------------------------------

function FilterGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Array<{ key: T; label: string }>;
  selected: Set<T>;
  onToggle: (key: T) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 6px',
        borderRadius: 6,
        background: 'transparent',
      }}
    >
      <span
        style={{
          fontSize: '0.65rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-text-secondary)',
          marginRight: 4,
        }}
      >
        {label}
      </span>
      {options.map(o => {
        const active = selected.has(o.key);
        return (
          <button
            key={String(o.key)}
            type="button"
            onClick={() => onToggle(o.key)}
            style={{
              padding: '3px 8px',
              fontSize: '0.7rem',
              borderRadius: 4,
              cursor: 'pointer',
              border: '1px solid var(--color-border)',
              background: active ? 'var(--color-accent)' : 'var(--color-bg-hover)',
              color: active ? '#0a0a1a' : 'var(--color-text-primary)',
              fontWeight: active ? 700 : 400,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const chipButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  color: 'var(--color-text-secondary)',
  padding: '2px 8px',
  fontSize: '0.7rem',
  cursor: 'pointer',
};

// ---------------------------------------------------------------------------
// Row view
// ---------------------------------------------------------------------------

function AdPerfRowView({
  row,
  linkCtrTarget,
  linkCtrWarn,
}: {
  row: AdPerfRow;
  linkCtrTarget: number;
  linkCtrWarn: number;
}) {
  const ctrColor =
    row.link_ctr >= linkCtrTarget
      ? 'var(--color-success)'
      : row.link_ctr >= linkCtrWarn
      ? 'var(--color-warning)'
      : 'var(--color-critical)';

  const statusColor =
    row.status_dot === 'winner'
      ? 'var(--color-success)'
      : row.status_dot === 'watch'
      ? 'var(--color-text-secondary)'
      : row.status_dot === 'dead'
      ? 'var(--color-text-secondary)'
      : 'var(--color-accent)';

  const waveBorder =
    row.wave === 'W1'
      ? '1px solid var(--color-text-secondary)'
      : '1px solid var(--color-accent)';
  const waveColor =
    row.wave === 'W1' ? 'var(--color-text-secondary)' : 'var(--color-accent)';

  return (
    <tr>
      <td>
        <span className={`status-dot status-${row.status_dot}`} />
        <span
          style={{
            fontSize: '0.65rem',
            padding: '1px 4px',
            borderRadius: 3,
            background: 'var(--color-bg-hover)',
            marginRight: 4,
          }}
        >
          {row.format}
        </span>
        <span
          style={{
            fontSize: '0.6rem',
            padding: '1px 3px',
            borderRadius: 3,
            border: waveBorder,
            color: waveColor,
            marginRight: 4,
          }}
        >
          {row.wave}
        </span>
        {row.name}
      </td>
      <td>
        <span style={{ fontSize: '0.8rem' }}>{row.adset_name}</span>{' '}
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.7rem' }}>
          ({row.adset_role})
        </span>
      </td>
      <td style={{ textAlign: 'right' }}>${row.spend.toFixed(2)}</td>
      <td style={{ textAlign: 'right' }}>{fmtInt(row.impressions)}</td>
      <td style={{ textAlign: 'right' }}>{fmtInt(row.reach)}</td>
      <td style={{ textAlign: 'right' }}>{fmtInt(row.link_clicks)}</td>
      <td style={{ textAlign: 'right', color: ctrColor }}>{fmtPct(row.link_ctr, 2)}</td>
      <td style={{ textAlign: 'right' }}>{fmtInt(row.lp_views)}</td>
      <td style={{ textAlign: 'right' }}>{row.purchases}</td>
      <td style={{ textAlign: 'right' }}>{row.cpa == null ? '—' : fmtMoney2(row.cpa)}</td>
      <td style={{ textAlign: 'right' }}>{fmtPct(row.pct_of_budget, 1)}</td>
      <td>
        <span style={{ fontSize: '0.75rem', color: statusColor }}>
          {row.manual_status}
        </span>
      </td>
    </tr>
  );
}

// Local formatters (duplicated from page.tsx — tiny enough to inline rather
// than add a shared-util import, which would force this file to pull more
// of the server bundle).
function fmtInt(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}
function fmtMoney2(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}
