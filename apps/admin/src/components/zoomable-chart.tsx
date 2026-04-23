'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ZoomableChartProps {
  /** Title shown in the modal header. */
  title: string;
  /** Optional sub-label shown next to the title. */
  subtitle?: string;
  /**
   * The chart to render. The same children are rendered inline AND inside
   * the modal when open — each mount is an independent Chart.js instance so
   * closing the modal disposes the zoomed copy cleanly.
   */
  children: ReactNode;
  /**
   * Optional override height for the inline (non-zoomed) render. Defaults to
   * 100% so the parent `.chart-container` still drives the size.
   */
  inlineHeight?: number | string;
}

/**
 * Wraps any chart (Chart.js, SVG, HTML bars) so that clicking it opens a
 * full-screen modal preview. Used across the dashboard to let operators
 * inspect trends, funnels and frequency distributions without squinting
 * at the grid layout.
 */
export function ZoomableChart({
  title,
  subtitle,
  children,
  inlineHeight,
}: ZoomableChartProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC closes the modal. We also lock body scroll while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        title="Click para ampliar"
        style={{
          cursor: 'zoom-in',
          position: 'relative',
          height: inlineHeight ?? '100%',
          width: '100%',
        }}
      >
        {children}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: 4,
            background: 'rgba(15, 23, 42, 0.6)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        >
          ⤢
        </span>
      </div>

      {mounted && open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(2, 6, 23, 0.82)',
                backdropFilter: 'blur(3px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4vh 4vw',
              }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  width: 'min(1400px, 92vw)',
                  height: 'min(900px, 88vh)',
                  background: 'var(--color-bg-card, #0f172a)',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                      {title}
                    </strong>
                    {subtitle ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {subtitle}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Cerrar"
                    style={{
                      background: 'var(--color-bg-hover)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cerrar · ESC
                  </button>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: 20,
                    overflow: 'auto',
                    minHeight: 0,
                  }}
                >
                  <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
                    {children}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
