'use client';

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Shared table utilities
// ---------------------------------------------------------------------------
// Every dashboard table needs three things:
//   1. Per-column sorting (3-state: none → desc → asc → none).
//   2. A filter bar (search text + multi-select pill groups).
//   3. A consistent look-and-feel: active header colour, filter summary,
//      reset actions, empty state.
//
// The hooks and components below let each table opt into whichever pieces
// it needs without duplicating the cycle logic or the pill styling.
// Tables with only a handful of rows typically just use `useTableSort` +
// `<SortableTh>`; larger tables add `useTableFilter` + `<FilterBar>`.
//
// All state is client-side and memoised — filtering/sorting N rows is
// cheap enough that we don't need virtualisation or debouncing at the
// dashboard's scale (≤ a few hundred rows per table).
// ---------------------------------------------------------------------------

export type SortDir = 'asc' | 'desc';
export interface SortState<K extends string> {
  key: K;
  dir: SortDir;
}

export type TableCompare<T, K extends string> = (a: T, b: T, state: SortState<K>) => number;

/**
 * Three-state sort cycle. First click on a column = desc (intuitive for
 * numeric KPIs where "biggest first" is the common case). Second = asc.
 * Third = clear sort and fall back to the server-provided default order.
 */
export function useTableSort<K extends string>() {
  const [state, setState] = useState<SortState<K> | null>(null);
  const toggle = (key: K) => {
    setState(prev => {
      if (!prev || prev.key !== key) return { key, dir: 'desc' };
      if (prev.dir === 'desc')       return { key, dir: 'asc' };
      return null;
    });
  };
  const clear = () => setState(null);
  return { state, toggle, clear };
}

export function useSortedRows<T, K extends string>(
  rows: T[],
  state: SortState<K> | null,
  compare: TableCompare<T, K>,
): T[] {
  return useMemo(() => {
    if (!state) return rows;
    return [...rows].sort((a, b) => compare(a, b, state));
  }, [rows, state, compare]);
}

// ---------------------------------------------------------------------------
// Sortable header cell
// ---------------------------------------------------------------------------

export function SortableTh<K extends string>({
  sortKey,
  active,
  dir,
  onClick,
  align = 'left',
  children,
}: {
  sortKey: K;
  active: boolean;
  dir?: SortDir;
  onClick: (key: K) => void;
  align?: 'left' | 'right' | 'center';
  children: ReactNode;
}) {
  const arrow = active ? (dir === 'asc' ? ' ↑' : ' ↓') : '';
  return (
    <th
      onClick={() => onClick(sortKey)}
      title="Click para ordenar"
      style={{
        textAlign: align,
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        color: active ? 'var(--color-text-primary)' : undefined,
      }}
    >
      {children}
      <span
        style={{
          color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          opacity: active ? 1 : 0.35,
          marginLeft: 3,
          fontSize: '0.65rem',
        }}
      >
        {arrow || '↕'}
      </span>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

export interface FilterOption<T extends string> {
  key: T;
  label: string;
}

export function FilterGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Array<FilterOption<T>>;
  selected: Set<T>;
  onToggle: (key: T) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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

export const chipButtonStyle: CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  color: 'var(--color-text-secondary)',
  padding: '2px 8px',
  fontSize: '0.7rem',
  cursor: 'pointer',
};

export function FilterBar({
  search,
  setSearch,
  searchPlaceholder = 'Buscar…',
  children,
  onClear,
  hasActiveFilters,
}: {
  search: string;
  setSearch: (v: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  onClear?: () => void;
  hasActiveFilters: boolean;
}) {
  return (
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
        placeholder={searchPlaceholder}
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
      {children}
      {hasActiveFilters && onClear ? (
        <button type="button" onClick={onClear} style={chipButtonStyle}>
          limpiar filtros
        </button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle helper for Set<T> state
// ---------------------------------------------------------------------------

export function toggleInSet<T>(set: Set<T>, key: T): Set<T> {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

// ---------------------------------------------------------------------------
// Empty row — rendered when filters remove every row from the table.
// ---------------------------------------------------------------------------

export function EmptyTableRow({ colSpan, message = 'No hay filas que cumplan los filtros actuales.' }: {
  colSpan: number;
  message?: string;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          padding: 20,
          fontSize: '0.8rem',
        }}
      >
        {message}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Shared section header w/ optional sort status + reset chip
// ---------------------------------------------------------------------------

export function TableSectionTitle<K extends string>({
  title,
  totalRows,
  visibleRows,
  sortState,
  sortLabel,
  onClearSort,
}: {
  title: string;
  totalRows: number;
  visibleRows: number;
  sortState: SortState<K> | null;
  sortLabel?: string;
  onClearSort?: () => void;
}) {
  const countLabel =
    visibleRows !== totalRows ? `(${visibleRows} / ${totalRows})` : `(${totalRows})`;
  return (
    <div className="section-title">
      {title} {countLabel}
      {sortState ? (
        <span
          style={{
            marginLeft: 10,
            fontSize: '0.7rem',
            color: 'var(--color-text-secondary)',
            fontWeight: 400,
          }}
        >
          — ordenado por <strong>{sortLabel ?? sortState.key}</strong>{' '}
          {sortState.dir === 'asc' ? '↑' : '↓'}{' '}
          {onClearSort ? (
            <button type="button" onClick={onClearSort} style={chipButtonStyle}>
              reset sort
            </button>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
