'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

// Presets intentionally exclude "Hoy" — operators use the tile HOY at the top
// of the dashboard for same-day glance. Default preset is `30d`.
const PRESETS: Array<{ id: string; label: string }> = [
  { id: '7d',       label: 'Últimos 7 días' },
  { id: '30d',      label: 'Últimos 30 días' },
  { id: '90d',      label: 'Últimos 90 días' },
  { id: 'campaign', label: 'Total campaña' },
  { id: 'custom',   label: 'Personalizado' },
];

export interface DateRangeFilterProps {
  /** Selected preset as resolved by the server (echoes the URL). */
  currentPreset: string;
  /** Resolved start (YYYY-MM-DD) — shown when preset is not `campaign`. */
  currentStart: string;
  /** Resolved end (YYYY-MM-DD). */
  currentEnd: string;
  /** Short human-friendly label (e.g. "Últimos 30 días"). */
  currentLabel: string;
}

/**
 * Dropdown that drives the `range` query params on the current page. We
 * rebuild the URL on change and call `router.push` + `router.refresh()` so
 * the server component re-renders with the new range.
 */
export function DateRangeFilter({
  currentPreset,
  currentStart,
  currentEnd,
  currentLabel,
}: DateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(currentStart);
  const [customTo, setCustomTo] = useState(currentEnd);

  const currentHref = useMemo(() => {
    const sp = new URLSearchParams(searchParams?.toString() ?? '');
    return sp;
  }, [searchParams]);

  const navigate = (next: URLSearchParams) => {
    startTransition(() => {
      const qs = next.toString();
      router.push(qs ? `?${qs}` : '?');
      router.refresh();
    });
  };

  const applyPreset = (preset: string) => {
    const next = new URLSearchParams(currentHref);
    if (preset === '30d') {
      // 30d is the default — drop the params so shareable URLs stay clean.
      next.delete('preset');
      next.delete('from');
      next.delete('to');
    } else {
      next.set('preset', preset);
      next.delete('from');
      next.delete('to');
    }
    setOpen(false);
    navigate(next);
  };

  const applyCustom = () => {
    if (!customFrom || !customTo) return;
    if (customFrom > customTo) return;
    const next = new URLSearchParams(currentHref);
    next.set('preset', 'custom');
    next.set('from', customFrom);
    next.set('to', customTo);
    setOpen(false);
    navigate(next);
  };

  const activeLabel = currentLabel || 'Últimos 30 días';
  const buttonLabel = currentPreset === 'custom'
    ? `${currentStart} → ${currentEnd}`
    : activeLabel;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        className="badge badge-success"
        style={{
          cursor: 'pointer',
          fontSize: '0.75rem',
          padding: '6px 12px',
          background: 'var(--color-bg-hover)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>📅</span>
        <span>{buttonLabel}</span>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.65rem' }}>▾</span>
      </button>
      {open ? (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 260,
            background: 'var(--color-bg-card, #0f172a)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {PRESETS.map(p => {
              const active = p.id === currentPreset || (p.id === '30d' && !currentPreset);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => (p.id === 'custom' ? null : applyPreset(p.id))}
                  disabled={isPending}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? 'var(--color-accent)' : 'transparent',
                    color: active ? '#0a0a1a' : 'var(--color-text-primary)',
                    fontWeight: active ? 700 : 400,
                    fontSize: '0.8rem',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                fontSize: '0.65rem',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 6,
              }}
            >
              Personalizado
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="date"
                value={customFrom}
                max={customTo || undefined}
                onChange={e => setCustomFrom(e.target.value)}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  fontSize: '0.75rem',
                  background: 'var(--color-bg-hover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 4,
                  color: 'var(--color-text-primary)',
                }}
              />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>→</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={e => setCustomTo(e.target.value)}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  fontSize: '0.75rem',
                  background: 'var(--color-bg-hover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 4,
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
            <button
              type="button"
              onClick={applyCustom}
              disabled={isPending || !customFrom || !customTo || customFrom > customTo}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '6px 10px',
                borderRadius: 6,
                background: 'var(--color-accent)',
                color: '#0a0a1a',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                opacity: !customFrom || !customTo || customFrom > customTo ? 0.4 : 1,
              }}
            >
              Aplicar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
