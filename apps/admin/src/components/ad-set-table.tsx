'use client';

import { useMemo, useState } from 'react';
import type { AdSetRow } from '@/lib/dashboard/dashboard-adapter';
import {
  EmptyTableRow,
  FilterBar,
  FilterGroup,
  SortableTh,
  TableSectionTitle,
  toggleInSet,
  useSortedRows,
  useTableSort,
  type TableCompare,
} from './sortable-table';

// ---------------------------------------------------------------------------
// Ad Set Performance — sortable + filterable
// ---------------------------------------------------------------------------

type SortKey =
  | 'name'
  | 'status'
  | 'daily_budget'
  | 'spend'
  | 'purchases'
  | 'cpa'
  | 'breakeven_cpa'
  | 'margin_per_sale'
  | 'roas'
  | 'link_ctr'
  | 'reach'
  | 'freq_daily_7d';

interface ColumnDef {
  key: SortKey;
  label: string;
  align?: 'left' | 'right';
  render?: () => React.ReactNode;
}

const COLUMNS: ColumnDef[] = [
  { key: 'name',            label: 'Ad Set',      align: 'left'  },
  { key: 'status',          label: 'Status',      align: 'left'  },
  { key: 'daily_budget',    label: 'Budget',      align: 'right' },
  { key: 'spend',           label: 'Spend',       align: 'right' },
  { key: 'purchases',       label: 'Purchases',   align: 'right' },
  { key: 'cpa',             label: 'CPA',         align: 'right' },
  { key: 'breakeven_cpa',   label: 'BE CPA',      align: 'right' },
  { key: 'margin_per_sale', label: 'Margin/sale', align: 'right' },
  { key: 'roas',            label: 'ROAS (Est.)', align: 'right' },
  { key: 'link_ctr',        label: 'Link CTR',    align: 'right' },
  { key: 'reach',           label: 'Reach',       align: 'right' },
  { key: 'freq_daily_7d',   label: 'Freq 7d',     align: 'right' },
];

// ACTIVE first, then PAUSED, then anything else. Ascending puts the most
// concerning (non-delivering) ad sets first.
const STATUS_RANK: Record<string, number> = { ACTIVE: 2, PAUSED: 1 };

const compareRow: TableCompare<AdSetRow, SortKey> = (a, b, { key, dir }) => {
  const mult = dir === 'asc' ? 1 : -1;
  if (key === 'name')   return a.name_subtitle.localeCompare(b.name_subtitle) * mult;
  if (key === 'status') {
    const ra = STATUS_RANK[a.status] ?? 0;
    const rb = STATUS_RANK[b.status] ?? 0;
    return (ra - rb) * mult;
  }
  const va = (a[key] as number | null) ?? null;
  const vb = (b[key] as number | null) ?? null;
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  return (va - vb) * mult;
};

const STATUS_OPTIONS = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'PAUSED', label: 'Paused' },
];

export function AdSetTable({ rows }: { rows: AdSetRow[] }) {
  const { state: sort, toggle: toggleSort, clear: clearSort } = useTableSort<SortKey>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [roleFilter,   setRoleFilter]   = useState<Set<string>>(new Set());

  const roleOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) s.add(r.role);
    return Array.from(s).sort().map(k => ({ key: k, label: k }));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (statusFilter.size > 0 && !statusFilter.has(r.status)) return false;
      if (roleFilter.size   > 0 && !roleFilter.has(r.role))     return false;
      if (q && !`${r.role} ${r.name_subtitle}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, statusFilter, roleFilter]);

  const sorted = useSortedRows(filtered, sort, compareRow);

  // trim() to match filter site at line 95.
  const hasFilters = search.trim().length > 0 || statusFilter.size > 0 || roleFilter.size > 0;
  const clearFilters = () => {
    setSearch('');
    setStatusFilter(new Set());
    setRoleFilter(new Set());
  };

  return (
    <div className="section">
      <TableSectionTitle
        title="Ad Set Performance"
        totalRows={rows.length}
        visibleRows={sorted.length}
        sortState={sort}
        sortLabel={COLUMNS.find(c => c.key === sort?.key)?.label}
        onClearSort={clearSort}
      />

      <FilterBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Buscar por role o nombre…"
        hasActiveFilters={hasFilters}
        onClear={clearFilters}
      >
        <FilterGroup
          label="Status"
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onToggle={k => setStatusFilter(s => toggleInSet(s, k))}
        />
        <FilterGroup
          label="Role"
          options={roleOptions}
          selected={roleFilter}
          onToggle={k => setRoleFilter(s => toggleInSet(s, k))}
        />
      </FilterBar>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <SortableTh
                  key={col.key}
                  sortKey={col.key}
                  active={sort?.key === col.key}
                  dir={sort?.dir}
                  onClick={toggleSort}
                  align={col.align}
                >
                  {col.label}
                </SortableTh>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <EmptyTableRow colSpan={COLUMNS.length} />
            ) : (
              sorted.map(r => <AdSetRowView key={r.id} row={r} />)
            )}
          </tbody>
        </table>
        <div
          style={{
            marginTop: 12,
            fontSize: '0.7rem',
            color: 'var(--color-text-secondary)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 8,
          }}
        >
          Freq daily = avg 7d impressions-weighted (real signal). Lifetime =
          acumulado desde launch. BE CPA tier actual = breakeven usado para
          juzgar margen. CARTAB con &lt;$300 spend se considera en learning.
        </div>
      </div>
    </div>
  );
}

function AdSetRowView({ row }: { row: AdSetRow }) {
  const statusBadge =
    row.status === 'ACTIVE'
      ? 'badge-green'
      : row.status === 'PAUSED'
      ? 'badge-yellow'
      : 'badge-red';

  const cpaColor =
    row.cpa == null
      ? 'var(--color-text-secondary)'
      : row.cpa <= row.breakeven_cpa
      ? 'var(--color-success)'
      : 'var(--color-warning)';

  const marginColor =
    row.margin_per_sale == null
      ? 'var(--color-text-secondary)'
      : row.margin_per_sale >= 0
      ? 'var(--color-success)'
      : 'var(--color-critical)';

  const roasValue = row.roas ?? 0;
  const roasColor =
    row.roas == null
      ? 'var(--color-text-secondary)'
      : roasValue >= row.roas_target
      ? 'var(--color-success)'
      : 'var(--color-warning)';

  const freqWatchColor =
    row.freq_daily_7d == null || row.freq_daily_7d < 3
      ? 'var(--color-success)'
      : 'var(--color-warning)';

  return (
    <tr>
      <td>
        <strong>{row.role}</strong>{' '}
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
          {row.name_subtitle}
        </span>
      </td>
      <td>
        <span className={`badge ${statusBadge}`}>{row.status}</span>
      </td>
      <td style={{ textAlign: 'right' }}>${row.daily_budget}/day</td>
      <td style={{ textAlign: 'right' }}>${row.spend.toFixed(2)}</td>
      <td style={{ textAlign: 'right' }}>{row.purchases}</td>
      <td style={{ textAlign: 'right', color: cpaColor }}>
        {row.cpa == null ? '—' : fmtMoney2(row.cpa)}
      </td>
      <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
        ${row.breakeven_cpa}
      </td>
      <td style={{ textAlign: 'right', color: marginColor }}>
        {row.margin_per_sale == null
          ? '—'
          : `${row.margin_per_sale >= 0 ? '+' : ''}${fmtMoney2(row.margin_per_sale)}`}
      </td>
      <td style={{ textAlign: 'right', color: roasColor }}>{roasValue.toFixed(1)}x</td>
      <td style={{ textAlign: 'right' }}>{fmtPct(row.link_ctr, 2)}</td>
      <td style={{ textAlign: 'right' }}>{fmtInt(row.reach)}</td>
      <td style={{ textAlign: 'right' }}>
        <strong style={{ color: freqWatchColor }}>
          {row.freq_daily_7d == null ? '—' : row.freq_daily_7d.toFixed(2)}
        </strong>{' '}
        ·{' '}
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {row.freq_lifetime == null ? '—' : row.freq_lifetime.toFixed(2)}
        </span>
      </td>
    </tr>
  );
}

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
