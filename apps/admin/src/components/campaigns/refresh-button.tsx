'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface RefreshButtonProps {
  organizerSlug: string;
  buSlug: string;
}

type UiState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; rowsWritten: number }
  | { kind: 'error'; message: string; retryAfterSec?: number };

export function RefreshButton({ organizerSlug, buSlug }: RefreshButtonProps) {
  const router = useRouter();
  const [ui, setUi] = useState<UiState>({ kind: 'idle' });
  const [isPending, startTransition] = useTransition();

  const disabled = ui.kind === 'loading' || isPending;

  async function onClick() {
    setUi({ kind: 'loading' });
    try {
      const res = await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizer_slug: organizerSlug, bu_slug: buSlug }),
      });
      const payload = (await res.json()) as {
        error?: string;
        retry_after_sec?: number;
        rowsWritten?: number;
      };
      if (!res.ok) {
        setUi({
          kind: 'error',
          message: payload.error ?? `HTTP ${res.status}`,
          retryAfterSec: payload.retry_after_sec,
        });
        return;
      }
      setUi({ kind: 'success', rowsWritten: payload.rowsWritten ?? 0 });
      startTransition(() => router.refresh());
      setTimeout(() => setUi({ kind: 'idle' }), 3000);
    } catch (err) {
      setUi({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Network error',
      });
    }
  }

  const label =
    ui.kind === 'loading' || isPending
      ? 'Refreshing…'
      : ui.kind === 'success'
      ? `Updated · ${ui.rowsWritten} rows`
      : ui.kind === 'error'
      ? ui.retryAfterSec
        ? `Wait ${ui.retryAfterSec}s`
        : 'Retry'
      : 'Refresh data';

  const tone =
    ui.kind === 'success'
      ? 'var(--color-success)'
      : ui.kind === 'error'
      ? 'var(--color-critical)'
      : 'var(--color-accent)';

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={ui.kind === 'error' ? ui.message : 'Pull latest data from Meta for today'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 6,
          border: `1px solid ${tone}`,
          background: 'transparent',
          color: tone,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 150ms ease',
        }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: tone,
            animation:
              ui.kind === 'loading' || isPending ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
          }}
        />
        {label}
      </button>
    </>
  );
}
