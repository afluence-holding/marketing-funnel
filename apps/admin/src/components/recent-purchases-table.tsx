'use client';

import { useMemo, useState } from 'react';
import type { RecentPurchase } from '@/lib/dashboard/dashboard-adapter';
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
// Recent Purchases — sortable + filterable
// ---------------------------------------------------------------------------

type SortKey =
  | 'date'
  | 'purchases'
  | 'adset_role'
  | 'ad_name'
  | 'temperature_label'
  | 'spend_day'
  | 'cpa_day';

const COLUMNS: Array<{ key: SortKey; label: string; align?: 'left' | 'right' }> = [
  { key: 'date',              label: 'Fecha',       align: 'left'  },
  { key: 'purchases',         label: 'Compras',     align: 'right' },
  { key: 'adset_role',        label: 'Ad Set',      align: 'left'  },
  { key: 'ad_name',           label: 'Ad',          align: 'left'  },
  { key: 'temperature_label', label: 'Temperatura', align: 'left'  },
  { key: 'spend_day',         label: 'Spend día',   align: 'right' },
  { key: 'cpa_day',           label: 'CPA día',     align: 'right' },
];

const ROLE_COLOR: Record<string, string> = {
  CUS:    'var(--color-warning)',
  ASC:    'var(--color-accent)',
  RMK:    'var(--color-success)',
  CARTAB: 'var(--color-critical)',
  INT:    'var(--color-text-secondary)',
};

const compareRow: TableCompare<RecentPurchase, SortKey> = (a, b, { key, dir }) => {
  const mult = dir === 'asc' ? 1 : -1;
  if (key === 'date')              return a.date.localeCompare(b.date) * mult;
  if (key === 'adset_role')        return a.adset_role.localeCompare(b.adset_role) * mult;
  if (key === 'ad_name')           return a.ad_name.localeCompare(b.ad_name) * mult;
  if (key === 'temperature_label') return a.temperature_label.localeCompare(b.temperature_label) * mult;
  const va = (a[key] as number | null) ?? null;
  const vb = (b[key] as number | null) ?? null;
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  return (va - vb) * mult;
};

export function RecentPurchasesTable({ rows }: { rows: RecentPurchase[] }) {
  const { state: sort, toggle: toggleSort, clear: clearSort } = useTableSort<SortKey>();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Set<string>>(new Set());
  const [tempFilter, setTempFilter] = useState<Set<string>>(new Set());

  const roleOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) s.add(r.adset_role);
    return Array.from(s).sort().map(k => ({ key: k, label: k }));
  }, [rows]);

  const tempOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) if (r.temperature_label) s.add(r.temperature_label);
    return Array.from(s).sort().map(k => ({ key: k, label: k }));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (roleFilter.size > 0 && !roleFilter.has(r.adset_role))       return false;
      if (tempFilter.size > 0 && !tempFilter.has(r.temperature_label)) return false;
      if (q && !`${r.ad_name} ${r.adset_role} ${r.temperature_label}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, roleFilter, tempFilter]);

  const sorted = useSortedRows(filtered, sort, compareRow);
  // trim() to match the filter site at line 81 — avoids "limpiar filtros"
  // flash when user types whitespace-only.
  const hasFilters = search.trim().length > 0 || roleFilter.size > 0 || tempFilter.size > 0;
  const clearFilters = () => {
    setSearch('');
    setRoleFilter(new Set());
    setTempFilter(new Set());
  };

  return (
    <div className="section">
      <TableSectionTitle
        title="Últimas Compras (incluye hoy)"
        totalRows={rows.length}
        visibleRows={sorted.length}
        sortState={sort}
        sortLabel={COLUMNS.find(c => c.key === sort?.key)?.label}
        onClearSort={clearSort}
      />

      <FilterBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Buscar por ad, role o temperatura…"
        hasActiveFilters={hasFilters}
        onClear={clearFilters}
      >
        <FilterGroup
          label="Role"
          options={roleOptions}
          selected={roleFilter}
          onToggle={k => setRoleFilter(s => toggleInSet(s, k))}
        />
        <FilterGroup
          label="Temp"
          options={tempOptions}
          selected={tempFilter}
          onToggle={k => setTempFilter(s => toggleInSet(s, k))}
        />
      </FilterBar>

      <div className="card" style={{ overflowX: 'auto' }}>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            marginBottom: 12,
          }}
        >
          Meta API no expone eventos de compra individuales. Esta tabla muestra
          las combinaciones ad × día con compras ordenadas por fecha
          descendente (granularidad máxima disponible). Incluye compras del día
          de hoy.
        </div>
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
              sorted.map((r, i) => <RecentPurchaseRowView key={i} row={r} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentPurchaseRowView({ row }: { row: RecentPurchase }) {
  const roleColor = ROLE_COLOR[row.adset_role] ?? 'var(--color-text-secondary)';
  const cpa = row.cpa_day;
  const cpaColor =
    cpa == null
      ? 'var(--color-text-secondary)'
      : cpa <= row.cpa_target
      ? 'var(--color-success)'
      : cpa <= row.cpa_breakeven
      ? 'var(--color-warning)'
      : 'var(--color-critical)';
  return (
    <tr>
      <td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>
      <td style={{ textAlign: 'right', fontWeight: 600 }}>{row.purchases}</td>
      <td>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: 4,
            border: `1px solid ${roleColor}`,
            color: roleColor,
            fontWeight: 700,
          }}
        >
          {row.adset_role}
        </span>
      </td>
      <td style={{ fontSize: '0.8rem' }}>{row.ad_name}</td>
      <td style={{ fontSize: '0.7rem', color: roleColor, fontWeight: 600 }}>
        {row.temperature_label}
      </td>
      <td style={{ textAlign: 'right' }}>${row.spend_day.toFixed(2)}</td>
      <td style={{ textAlign: 'right', color: cpaColor }}>
        {cpa == null ? '—' : fmtMoney2(cpa)}
      </td>
    </tr>
  );
}

function fmtMoney2(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
