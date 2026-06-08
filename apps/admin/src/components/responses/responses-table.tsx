'use client';

import { Fragment, useState } from 'react';
import { cellValue } from '@/lib/responses/presentation';
import {
  RESPONSE_STATUS_COLORS,
  RESPONSE_STATUS_LABELS,
  type ResponseColumn,
  type ResponseRecord,
  type ResponseStatus,
} from '@/lib/responses/types';

function StatusBadge({ value }: { value: string }) {
  const color = RESPONSE_STATUS_COLORS[value as ResponseStatus] ?? 'var(--color-text-secondary)';
  return (
    <span
      className="badge"
      style={{
        background: 'transparent',
        border: `1px solid ${color}`,
        color,
      }}
    >
      {RESPONSE_STATUS_LABELS[value as ResponseStatus] ?? value}
    </span>
  );
}

function RowDetail({ record, cols }: { record: ResponseRecord; cols: ResponseColumn[] }) {
  const detail = Object.entries(record.fields).filter(
    ([k, v]) => v && !cols.some((c) => c.key === k) && k !== 'id',
  );
  return (
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
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                color: 'var(--color-text-secondary)',
                marginBottom: 4,
              }}
            >
              {k.replace(/_/g, ' ')}
            </div>
            <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{v}</div>
          </div>
        ))
      )}
    </div>
  );
}

/** Records table with a per-row expandable panel showing the remaining fields. */
export function ResponsesTable({
  records,
  cols,
}: {
  records: ResponseRecord[];
  cols: ResponseColumn[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
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
            <th
              aria-label="Acciones"
              style={{ padding: '11px 12px', borderBottom: '1px solid var(--color-border)' }}
            />
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td
                colSpan={cols.length + 1}
                style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-secondary)' }}
              >
                No hay respuestas que coincidan.
              </td>
            </tr>
          ) : null}
          {records.map((r) => {
            const isOpen = expanded === r.id;
            return (
              <Fragment key={r.id}>
                <tr style={{ borderBottom: isOpen ? 'none' : '1px solid var(--color-border)' }}>
                  {cols.map((c) => (
                    <td
                      key={c.key}
                      style={{ padding: '10px 12px', verticalAlign: 'top', overflowWrap: 'anywhere' }}
                    >
                      {c.key === 'status' && r.fields.status ? (
                        <StatusBadge value={r.fields.status} />
                      ) : (
                        cellValue(r, c.key)
                      )}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: '10px 12px',
                      verticalAlign: 'top',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
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
                      <RowDetail record={r} cols={cols} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
