'use client';

import type { MatchupRow } from '@/lib/dashboard/dashboard-adapter';
import {
  EmptyTableRow,
  SortableTh,
  TableSectionTitle,
  useSortedRows,
  useTableSort,
  type TableCompare,
} from './sortable-table';

// ---------------------------------------------------------------------------
// Format Test (Video vs Static) — sortable only. No filter bar because this
// table is always small (a handful of predefined matchups).
// ---------------------------------------------------------------------------

type SortKey =
  | 'label'
  | 'video_ctr'
  | 'static_ctr'
  | 'video_purchases'
  | 'static_purchases'
  | 'early_winner';

const COLUMNS: Array<{ key: SortKey; label: string; align?: 'left' | 'right' }> = [
  { key: 'label',            label: 'Matchup',          align: 'left'  },
  { key: 'video_ctr',        label: 'Video CTR',        align: 'right' },
  { key: 'static_ctr',       label: 'Static CTR',       align: 'right' },
  { key: 'video_purchases',  label: 'Video Purchases',  align: 'right' },
  { key: 'static_purchases', label: 'Static Purchases', align: 'right' },
  { key: 'early_winner',     label: 'Early Winner',     align: 'left'  },
];

const compareRow: TableCompare<MatchupRow, SortKey> = (a, b, { key, dir }) => {
  const mult = dir === 'asc' ? 1 : -1;
  if (key === 'label')        return a.label.localeCompare(b.label) * mult;
  if (key === 'early_winner') return a.early_winner.localeCompare(b.early_winner) * mult;
  const va = (a[key] as number | null) ?? null;
  const vb = (b[key] as number | null) ?? null;
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  return (va - vb) * mult;
};

export function MatchupsTable({ rows }: { rows: MatchupRow[] }) {
  const { state: sort, toggle: toggleSort, clear: clearSort } = useTableSort<SortKey>();
  const sorted = useSortedRows(rows, sort, compareRow);

  return (
    <div className="section">
      <TableSectionTitle
        title="Format Test: Video vs Static"
        totalRows={rows.length}
        visibleRows={sorted.length}
        sortState={sort}
        sortLabel={COLUMNS.find(c => c.key === sort?.key)?.label}
        onClearSort={clearSort}
      />
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
              sorted.map((r, i) => (
                <tr key={i}>
                  <td>{r.label}</td>
                  <td style={{ textAlign: 'right' }}>{r.video_ctr.toFixed(2)}%</td>
                  <td style={{ textAlign: 'right' }}>{r.static_ctr.toFixed(2)}%</td>
                  <td style={{ textAlign: 'right' }}>{r.video_purchases}</td>
                  <td style={{ textAlign: 'right' }}>{r.static_purchases}</td>
                  <td>{r.early_winner}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
