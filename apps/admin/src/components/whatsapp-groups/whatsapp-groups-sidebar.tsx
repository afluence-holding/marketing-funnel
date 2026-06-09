'use client';

/**
 * WhatsAppGroupsSidebar — modular nav for the WhatsApp Groups module. Reuses the
 * Centro `.launch-*` styles: a "Módulos" section (the BU's other admin modules)
 * and a "Pools" section (one entry per pool/cohort, selectable) plus a "Nuevo
 * pool" action. Includes the mobile drawer behaviour.
 */
import Link from 'next/link';
import type { AdminModuleLink } from '@/lib/launch-ops/navigation';

export interface PoolNavItem {
  id: string;
  label: string;
  groupCount: number;
}

export function WhatsAppGroupsSidebar({
  brand,
  subtitle,
  moduleLinks = [],
  pools,
  activePoolId,
  onSelectPool,
  onNewPool,
  canManage,
  open,
  onClose,
}: {
  brand: string;
  subtitle: string;
  moduleLinks?: AdminModuleLink[];
  pools: PoolNavItem[];
  activePoolId: string;
  onSelectPool: (id: string) => void;
  onNewPool: () => void;
  canManage: boolean;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside className={`launch-sidebar${open ? ' open' : ''}`} aria-label="Grupos de WhatsApp">
        <div className="launch-sb-brand">
          {brand}
          <small>{subtitle}</small>
        </div>

        {moduleLinks.length > 0 && (
          <div>
            <div className="launch-sb-sec">Módulos</div>
            {moduleLinks.map((m) => (
              <Link key={m.id} href={m.href} className="launch-navitem" onClick={onClose}>
                <span className="ic" aria-hidden>
                  {m.icon}
                </span>
                {m.label}
              </Link>
            ))}
          </div>
        )}

        <div>
          <div className="launch-sb-sec">Pools / Cohortes</div>
          {pools.length === 0 && (
            <div style={{ padding: '6px 12px', fontSize: '0.74rem', opacity: 0.6 }}>Sin pools aún</div>
          )}
          {pools.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`launch-navitem${activePoolId === p.id ? ' active' : ''}`}
              aria-current={activePoolId === p.id ? 'page' : undefined}
              onClick={() => {
                onSelectPool(p.id);
                onClose();
              }}
              title={p.label}
            >
              <span className="ic" aria-hidden>
                💬
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.label}
              </span>
              <span style={{ opacity: 0.6, fontSize: '0.72rem' }}>{p.groupCount}</span>
            </button>
          ))}
          {canManage && (
            <button type="button" className="launch-navitem" onClick={onNewPool}>
              <span className="ic" aria-hidden>
                ➕
              </span>
              Nuevo pool
            </button>
          )}
        </div>
      </aside>

      <div className={`launch-sb-backdrop${open ? ' show' : ''}`} onClick={onClose} aria-hidden />
    </>
  );
}
