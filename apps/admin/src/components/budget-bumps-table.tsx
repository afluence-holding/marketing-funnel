'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BudgetBumpRow } from '@/lib/dashboard/dashboard-adapter';
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
// Recent Budget Bumps — last 30d of daily_budget changes on ACTIVE ad sets
// ---------------------------------------------------------------------------
// Operators bump budgets several times a day during a launch; the dashboard
// needs to make that decision history obvious so day-over-day swings can be
// explained without diving into Ads Manager. Source = ad_set_budget_history.
// ---------------------------------------------------------------------------

type SortKey =
  | 'changed_at'
  | 'ad_set_name'
  | 'role'
  | 'prev_budget'
  | 'new_budget'
  | 'delta_amount'
  | 'delta_pct'
  | 'direction';

const COLUMNS: Array<{ key: SortKey; label: string; align?: 'left' | 'right' }> = [
  { key: 'changed_at',   label: 'Cuándo',  align: 'left'  },
  { key: 'ad_set_name',  label: 'Ad Set',  align: 'left'  },
  { key: 'role',         label: 'Role',    align: 'left'  },
  { key: 'direction',    label: 'Dir',     align: 'left'  },
  { key: 'prev_budget',  label: 'Antes',   align: 'right' },
  { key: 'new_budget',   label: 'Después', align: 'right' },
  { key: 'delta_amount', label: 'Δ $',     align: 'right' },
  { key: 'delta_pct',    label: 'Δ %',     align: 'right' },
];

const ROLE_COLOR: Record<string, string> = {
  CUS:    'var(--color-warning)',
  ASC:    'var(--color-accent)',
  RMK:    'var(--color-success)',
  CARTAB: 'var(--color-critical)',
  INT:    'var(--color-text-secondary)',
};

// Direction precedence drives the FIRST click on the column header. The hook
// cycles desc → asc → none, so giving UP a higher rank than DOWN means the
// first (desc) click groups UP bumps at the top — the bullish signal
// operators care most about. INITIAL baselines drop to the bottom.
//
// Earlier draft had this inverted (UP=0) which produced "DOWN at top" on the
// first click — confusing UX. Current ranks: higher = more "interesting".
const DIRECTION_RANK: Record<BudgetBumpRow['direction'], number> = {
  UP: 2,
  DOWN: 1,
  INITIAL: 0,
};

const compareRow: TableCompare<BudgetBumpRow, SortKey> = (a, b, { key, dir }) => {
  const mult = dir === 'asc' ? 1 : -1;
  if (key === 'changed_at')   return a.changed_at.localeCompare(b.changed_at) * mult;
  if (key === 'ad_set_name')  return a.ad_set_name.localeCompare(b.ad_set_name) * mult;
  if (key === 'role')         return a.role.localeCompare(b.role) * mult;
  if (key === 'direction')    return (DIRECTION_RANK[a.direction] - DIRECTION_RANK[b.direction]) * mult;
  // Numeric keys: nulls (e.g. INITIAL prev_budget) sink to the bottom regardless of dir.
  const va = (a[key] as number | null) ?? null;
  const vb = (b[key] as number | null) ?? null;
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  return (va - vb) * mult;
};

function formatRelative(iso: string, now = Date.now()): string {
  const diffMs = now - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return iso.slice(0, 10);
  const sec = Math.max(0, Math.round(diffMs / 1000));
  if (sec < 60)        return `hace ${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60)        return `hace ${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24)         return `hace ${hr}h`;
  const days = Math.round(hr / 24);
  if (days < 30)       return `hace ${days}d`;
  return iso.slice(0, 10);
}

// 2 decimals + es-CL locale to match KPI grid (which formats as es-CL) and
// every other money display in the dashboard. Previously hard-coded to en-US
// which split thousands with commas while KPIs used dots — same row in the
// same view, two different separators. Also defensive against NaN/Infinity:
// a corrupted upstream value would otherwise render "$NaN" or "$Infinity".
function fmtMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  // 1 decimal so a +5.5% bump doesn't read as +6%.
  return `${sign}${n.toFixed(1)}%`;
}

// Render `changed_at` (ISO from Supabase, always in UTC) as the user's local
// time so Lima operators see "22:00" for an event that happened at "22:00 in
// Lima", not "03:00 UTC". The earlier `iso.slice(0,16)` displayed the raw
// UTC string, which contradicted the relative line above ("hace 2h" vs
// "21:14 UTC" looked like a 5h discrepancy in Peru).
function formatLocalAbsolute(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16).replace('T', ' ');
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

// Map direction → CSS class (defined in globals.css). Building the styles
// inline with `${var(--color-success)}22` produced an invalid CSS expression
// at runtime — `var()` calls cannot be string-concatenated. The class-based
// approach also lets us unit-test the styling and lets users override it
// with a stylesheet without touching React.
const DIRECTION_PILL: Record<
  BudgetBumpRow['direction'],
  { label: string; className: string; arrow: string }
> = {
  UP:      { label: 'UP',      className: 'pill-direction pill-direction-up',      arrow: '▲' },
  DOWN:    { label: 'DOWN',    className: 'pill-direction pill-direction-down',    arrow: '▼' },
  INITIAL: { label: 'INITIAL', className: 'pill-direction pill-direction-initial', arrow: '·' },
};

export function BudgetBumpsTable({ rows }: { rows: BudgetBumpRow[] }) {
  const { state: sort, toggle: toggleSort, clear: clearSort } = useTableSort<SortKey>();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Set<string>>(new Set());
  const [dirFilter, setDirFilter] = useState<Set<string>>(new Set());

  const roleOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) s.add(r.role);
    return Array.from(s).sort().map(k => ({ key: k, label: k }));
  }, [rows]);

  const dirOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) s.add(r.direction);
    return Array.from(s).sort().map(k => ({ key: k, label: k }));
  }, [rows]);

  // Prune filter selections that are no longer present in the latest data.
  // Without this, refreshing the dashboard after a bump scrolls off the 30d
  // window leaves the filter state pointing at "ASC" when no ad set has the
  // ASC role anymore, producing zero rows with no visible cause.
  useEffect(() => {
    setRoleFilter(prev => {
      const valid = new Set(roleOptions.map(o => o.key));
      const next = new Set<string>();
      for (const k of prev) if (valid.has(k)) next.add(k);
      return next.size === prev.size ? prev : next;
    });
  }, [roleOptions]);

  useEffect(() => {
    setDirFilter(prev => {
      const valid = new Set(dirOptions.map(o => o.key));
      const next = new Set<string>();
      for (const k of prev) if (valid.has(k)) next.add(k);
      return next.size === prev.size ? prev : next;
    });
  }, [dirOptions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (roleFilter.size > 0 && !roleFilter.has(r.role))           return false;
      if (dirFilter.size > 0 && !dirFilter.has(r.direction))         return false;
      if (q && !`${r.ad_set_name} ${r.role}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, roleFilter, dirFilter]);

  // Default order = adapter's "newest first" — we don't bake that into the
  // compare fn because the user may explicitly clear sort and expect to see
  // the server-returned order back.
  const sorted = useSortedRows(filtered, sort, compareRow);
  // Use trim() to match the actual filter logic at line 172 — otherwise the
  // "limpiar filtros" pill flashes when the user types whitespace alone but
  // no filtering is happening, which is confusing UX.
  const hasFilters = search.trim().length > 0 || roleFilter.size > 0 || dirFilter.size > 0;
  const clearFilters = () => {
    setSearch('');
    setRoleFilter(new Set());
    setDirFilter(new Set());
  };

  return (
    <div className="section">
      <TableSectionTitle
        title="Cambios recientes de budget (últimos 30d, ACTIVE)"
        totalRows={rows.length}
        visibleRows={sorted.length}
        sortState={sort}
        sortLabel={COLUMNS.find(c => c.key === sort?.key)?.label}
        onClearSort={clearSort}
      />

      <FilterBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Buscar por ad set o role…"
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
          label="Dir"
          options={dirOptions}
          selected={dirFilter}
          onToggle={k => setDirFilter(s => toggleInSet(s, k))}
        />
      </FilterBar>

      <div className="card">
        {/* Description sits OUTSIDE the horizontal scroll wrapper so on
            narrow viewports the operator's eyes stay on the explanatory
            copy while only the table itself scrolls. The earlier draft
            wrapped both in `overflow-x: auto` which made the description
            jiggle horizontally too. */}
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            marginBottom: 12,
          }}
        >
          Cambios capturados por el job de pull (forward) y por el backfill de
          Meta Activity Log (retroactivo). Filtrado a ad sets ACTIVE; los
          baselines (INITIAL) marcan la primera vez que vimos un budget.
          {' '}
          <strong>Solo se muestran ad sets ABO</strong> (con presupuesto
          propio); las campañas CBO no aparecen aquí porque el budget vive
          a nivel de campaña, no de ad set.
        </div>
        <div style={{ overflowX: 'auto' }}>
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
                <EmptyTableRow
                  colSpan={COLUMNS.length}
                  message={
                    rows.length === 0
                      ? 'Aún no se han registrado cambios. Ejecuta el backfill o espera al próximo pull.'
                      : 'No hay filas que cumplan los filtros actuales.'
                  }
                />
              ) : (
                sorted.map(r => (
                  <BudgetBumpRowView
                    key={`${r.ad_set_id}-${r.changed_at}-${r.new_budget}`}
                    row={r}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BudgetBumpRowView({ row }: { row: BudgetBumpRow }) {
  const roleColor = ROLE_COLOR[row.role] ?? 'var(--color-text-secondary)';
  const dirPill = DIRECTION_PILL[row.direction];
  const deltaClass =
    row.direction === 'UP'   ? 'delta-positive' :
    row.direction === 'DOWN' ? 'delta-negative' :
    'delta-neutral';

  // Hydration safety: `formatRelative` reads `Date.now()` and
  // `formatLocalAbsolute` uses the TZ of the runtime — both differ between
  // SSR and the browser, which produces hydration warnings and a flash of
  // mismatched text on first paint. Render a stable UTC placeholder during
  // SSR/first render, then swap to relative + local on the client. Mounted
  // gate is per-row but the cost is trivial (a single useState + useEffect).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const utcPlaceholder = row.changed_at.slice(0, 16).replace('T', ' ') + ' UTC';

  return (
    <tr>
      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }} suppressHydrationWarning>
        {mounted ? formatRelative(row.changed_at) : utcPlaceholder}
        <span
          style={{
            display: 'block',
            fontSize: '0.65rem',
            color: 'var(--color-text-secondary)',
          }}
          suppressHydrationWarning
        >
          {mounted ? formatLocalAbsolute(row.changed_at) : ''}
        </span>
      </td>
      <td style={{ fontSize: '0.8rem' }}>{row.ad_set_name}</td>
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
          {row.role}
        </span>
      </td>
      <td>
        <span className={dirPill.className}>
          {dirPill.arrow} {dirPill.label}
        </span>
      </td>
      <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
        {fmtMoney(row.prev_budget)}
      </td>
      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtMoney(row.new_budget)}</td>
      <td className={deltaClass} style={{ textAlign: 'right', fontWeight: 600 }}>
        {row.direction === 'INITIAL'
          ? '—'
          : `${row.delta_amount >= 0 ? '+' : ''}${fmtMoney(row.delta_amount)}`}
      </td>
      <td className={deltaClass} style={{ textAlign: 'right', fontWeight: 600 }}>
        {/* Defense in depth: the adapter contract sets `delta_pct = null`
            for INITIAL rows so `fmtPct` would already show "—", but if a
            bad migration ever stored a numeric pct on an INITIAL row we'd
            display a misleading "+33%" baseline. Force "—" by direction. */}
        {row.direction === 'INITIAL' ? '—' : fmtPct(row.delta_pct)}
      </td>
    </tr>
  );
}
