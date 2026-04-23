'use client';

import { useMemo, useState } from 'react';
import type { AdPerfRow } from '@/lib/dashboard/dashboard-adapter';

// ---------------------------------------------------------------------------
// Sortable Ad Performance table
// ---------------------------------------------------------------------------
// The server component produces `rows` already sorted by spend desc (the
// default operator view). This client component adds column sorting with
// a three-state cycle: none → asc → desc → back to default. Keeping the
// component self-contained means the server keeps streaming the HTML and
// we only hydrate the table.
//
// `AdPerfRow` is imported as a *type* so this file stays a client boundary
// without pulling the heavy adapter module into the browser bundle.
// ---------------------------------------------------------------------------

type SortKey =
  | 'name'
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
 * signal, dead the least — ascending order therefore goes dead→testing→
 * watch→active→winner which is a natural way to surface problems first
 * when the operator clicks the column.
 */
const STATUS_RANK: Record<AdPerfRow['status_dot'], number> = {
  dead: 0,
  testing: 1,
  watch: 2,
  active: 3,
  winner: 4,
};

function compareRows(a: AdPerfRow, b: AdPerfRow, key: SortKey, dir: SortDir): number {
  const mult = dir === 'asc' ? 1 : -1;
  if (key === 'name') {
    return a.name.localeCompare(b.name) * mult;
  }
  if (key === 'status') {
    return (STATUS_RANK[a.status_dot] - STATUS_RANK[b.status_dot]) * mult;
  }
  // Numeric columns. `cpa` is nullable — null rows always sink to the bottom
  // regardless of direction so operators aren't forced to scroll past a block
  // of "—" values to reach real data.
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

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    // Shallow clone so we don't mutate the server prop array (which would
    // leak across renders in Next.js dev mode).
    return [...rows].sort((a, b) => compareRows(a, b, sort.key, sort.dir));
  }, [rows, sort]);

  const handleHeaderClick = (key: SortKey) => {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: 'desc' };  // first click: desc (useful for spend etc.)
      if (prev.dir === 'desc') return { key, dir: 'asc' };          // second click: asc
      return null;                                                   // third click: clear → server default
    });
  };

  return (
    <div className="section">
      <div className="section-title">
        Ad Performance ({rows.length} ads)
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
              style={{
                marginLeft: 6,
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                color: 'var(--color-text-secondary)',
                padding: '1px 6px',
                fontSize: '0.65rem',
                cursor: 'pointer',
              }}
            >
              reset
            </button>
          </span>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row view (moved from page.tsx verbatim — kept inline so it ships with the
// client bundle and the server page doesn't import it by accident).
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
        {row.name}{' '}
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
// than add a shared-util import, which would force this file to pull more of
// the server bundle).
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
