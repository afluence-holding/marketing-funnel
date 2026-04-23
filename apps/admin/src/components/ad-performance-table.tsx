'use client';

import { useMemo, useState } from 'react';
import type { AdPerfRow } from '@/lib/dashboard/dashboard-adapter';
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
// Sortable + filterable Ad Performance table
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

interface ColumnDef {
  key: SortKey;
  label: string;
  align?: 'left' | 'right';
}

const COLUMNS: ColumnDef[] = [
  { key: 'name',          label: 'Ad',           align: 'left'  },
  { key: 'adset_name',    label: 'Ad Set',       align: 'left'  },
  { key: 'spend',         label: 'Spend',        align: 'right' },
  { key: 'impressions',   label: 'Imp',          align: 'right' },
  { key: 'reach',         label: 'Reach',        align: 'right' },
  { key: 'link_clicks',   label: 'Link Clicks',  align: 'right' },
  { key: 'link_ctr',      label: 'Link CTR',     align: 'right' },
  { key: 'lp_views',      label: 'LP Views',     align: 'right' },
  { key: 'purchases',     label: 'Purchases',    align: 'right' },
  { key: 'cpa',           label: 'CPA',          align: 'right' },
  { key: 'pct_of_budget', label: '%Budget',      align: 'right' },
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

const FORMAT_OPTIONS: Array<{ key: AdPerfRow['format']; label: string }> = [
  { key: 'VID', label: 'VID' },
  { key: 'IMG', label: 'IMG' },
];

const compareRow: TableCompare<AdPerfRow, SortKey> = (a, b, { key, dir }) => {
  const mult = dir === 'asc' ? 1 : -1;
  if (key === 'name')       return a.name.localeCompare(b.name) * mult;
  if (key === 'adset_name') return a.adset_name.localeCompare(b.adset_name) * mult;
  if (key === 'status')     return (STATUS_RANK[a.status_dot] - STATUS_RANK[b.status_dot]) * mult;
  // `cpa` is nullable — null rows always sink to the bottom regardless of
  // direction so operators aren't forced to scroll past a block of "—"
  // values to reach real data.
  const va = (a[key] as number | null) ?? null;
  const vb = (b[key] as number | null) ?? null;
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  return (va - vb) * mult;
};

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
  const { state: sort, toggle: toggleSort, clear: clearSort } = useTableSort<SortKey>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Set<AdPerfRow['status_dot']>>(new Set());
  const [roleFilter,   setRoleFilter]   = useState<Set<string>>(new Set());
  const [formatFilter, setFormatFilter] = useState<Set<AdPerfRow['format']>>(new Set());

  const roleOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) s.add(r.adset_role);
    return Array.from(s).sort().map(k => ({ key: k, label: k }));
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

  const sortedRows = useSortedRows(filteredRows, sort, compareRow);

  const hasFilters =
    search.length > 0 ||
    statusFilter.size > 0 ||
    roleFilter.size > 0 ||
    formatFilter.size > 0;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter(new Set());
    setRoleFilter(new Set());
    setFormatFilter(new Set());
  };

  return (
    <div className="section">
      <TableSectionTitle
        title="Ad Performance"
        totalRows={rows.length}
        visibleRows={sortedRows.length}
        sortState={sort}
        sortLabel={COLUMNS.find(c => c.key === sort?.key)?.label}
        onClearSort={clearSort}
      />

      <FilterBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Buscar por ad, ad set o role…"
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
        <FilterGroup
          label="Format"
          options={FORMAT_OPTIONS}
          selected={formatFilter}
          onToggle={k => setFormatFilter(s => toggleInSet(s, k))}
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
            {sortedRows.length === 0 ? (
              <EmptyTableRow colSpan={COLUMNS.length} message="No hay ads que cumplan los filtros actuales." />
            ) : (
              sortedRows.map(r => (
                <AdPerfRowView
                  key={r.id}
                  row={r}
                  linkCtrTarget={linkCtrTarget}
                  linkCtrWarn={linkCtrWarn}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
