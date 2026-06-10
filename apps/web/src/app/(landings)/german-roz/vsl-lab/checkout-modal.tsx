'use client';

/**
 * SPIKE — Checkout embebido DENTRO del VSL (modal overlay).
 *
 * En vez de navegar a /german-roz/desinflamate/checkout, el botón de compra del
 * VSL abre este modal, que monta el MISMO `HotmartCheckoutEmbed` (reutilizado
 * tal cual). El usuario nunca abandona el VSL. Hotmart confirma la compra inline
 * (sin redirect), así que el flujo completo vive en el modal.
 */

import { useEffect } from 'react';
import { HotmartCheckoutEmbed } from '@/components/hotmart/hotmart-checkout-embed';

const PRODUCT_KEY = 'german-desinflamate';
const ORANGE = '#FF5722';

export function VslCheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        background: 'rgba(0,0,0,.6)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 12px',
        overflowY: 'auto',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(440px,96vw)',
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 20px 60px rgba(0,0,0,.4)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
          }}
        >
          <strong style={{ fontSize: 16, color: '#17171c' }}>
            Reservar cupo — <span style={{ color: ORANGE }}>Desinflámate 21 días</span>
          </strong>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#888' }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div style={{ padding: 16 }}>
          <HotmartCheckoutEmbed productKey={PRODUCT_KEY} />
        </div>
      </div>

      {/* Estilos mínimos para los estados del embed (loading/error/spinner). */}
      <style>{`
        .checkout-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:40px 0; color:#555; }
        .checkout-state-error { color:#b00020; }
        .checkout-embed-wrap .spinner { width:28px; height:28px; border:3px solid #eee; border-top-color:${ORANGE}; border-radius:50%; animation:vsl-spin .8s linear infinite; }
        .retry-btn { background:${ORANGE}; color:#fff; border:none; padding:10px 18px; border-radius:10px; font-weight:700; cursor:pointer; }
        @keyframes vsl-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
