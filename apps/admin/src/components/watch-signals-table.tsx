'use client';

import { useMemo, useState } from 'react';
import type { WatchSignalItem } from '@/lib/dashboard/dashboard-adapter';
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
// What to Watch Next — sortable + filterable by status
// ---------------------------------------------------------------------------

type SortKey = 'label' | 'threshold' | 'current' | 'status' | 'action';

const COLUMNS: Array<{ key: SortKey; label: string; align?: 'left' | 'right' }> = [
  { key: 'label',     label: 'Signal',            align: 'left' },
  { key: 'threshold', label: 'Threshold',         align: 'left' },
  { key: 'current',   label: 'Current',           align: 'left' },
  { key: 'status',    label: 'Status',            align: 'left' },
  { key: 'action',    label: 'Action if Breached', align: 'left' },
];

// Breach first (most urgent) → watch → ok. Ascending therefore surfaces
// problems to the top of the list which is the natural operator workflow.
const STATUS_RANK: Record<WatchSignalItem['status'], number> = {
  breach: 0,
  watch:  1,
  ok:     2,
};

const compareRow: TableCompare<WatchSignalItem, SortKey> = (a, b, { key, dir }) => {
  const mult = dir === 'asc' ? 1 : -1;
  if (key === 'status') return (STATUS_RANK[a.status] - STATUS_RANK[b.status]) * mult;
  const va = String(a[key] ?? '');
  const vb = String(b[key] ?? '');
  return va.localeCompare(vb) * mult;
};

const STATUS_OPTIONS: Array<{ key: WatchSignalItem['status']; label: string }> = [
  { key: 'breach', label: 'Breach' },
  { key: 'watch',  label: 'Watch'  },
  { key: 'ok',     label: 'OK'     },
];

export function WatchSignalsTable({ items }: { items: WatchSignalItem[] }) {
  const { state: sort, toggle: toggleSort, clear: clearSort } = useTableSort<SortKey>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Set<WatchSignalItem['status']>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(r => {
      if (statusFilter.size > 0 && !statusFilter.has(r.status)) return false;
      if (q && !`${r.label} ${r.action}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, statusFilter]);

  const sorted = useSortedRows(filtered, sort, compareRow);
  const hasFilters = search.length > 0 || statusFilter.size > 0;
  const clearFilters = () => {
    setSearch('');
    setStatusFilter(new Set());
  };

  return (
    <div className="section">
      <TableSectionTitle
        title="What to Watch Next"
        totalRows={items.length}
        visibleRows={sorted.length}
        sortState={sort}
        sortLabel={COLUMNS.find(c => c.key === sort?.key)?.label}
        onClearSort={clearSort}
      />

      <FilterBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Buscar por signal o acción…"
        hasActiveFilters={hasFilters}
        onClear={clearFilters}
      >
        <FilterGroup
          label="Status"
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onToggle={k => setStatusFilter(s => toggleInSet(s, k))}
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
              sorted.map((sig, i) => {
                const badgeClass =
                  sig.status === 'ok'
                    ? 'badge-green'
                    : sig.status === 'watch'
                    ? 'badge-yellow'
                    : 'badge-red';
                const badgeLabel =
                  sig.status === 'ok'
                    ? 'OK'
                    : sig.status === 'watch'
                    ? 'WATCH'
                    : 'BREACH';
                return (
                  <tr key={i}>
                    <td>{sig.label}</td>
                    <td>{sig.threshold}</td>
                    <td>{sig.current}</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                    </td>
                    <td
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {sig.action}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
