'use client';

import { ADMIN_LOCALE } from '@/lib/responses/presentation';
import type { ResponseStat } from '@/lib/responses/types';

/** Aggregate stat cards for the active source (Total + status/lead breakdown). */
export function ResponsesStatsBar({ stats }: { stats: ResponseStat[] }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card"
          style={{ flex: '1 1 140px', minWidth: 140, padding: '14px 16px' }}
        >
          <div
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: 'var(--color-text-secondary)',
            }}
          >
            {stat.label}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>
            {stat.value.toLocaleString(ADMIN_LOCALE)}
          </div>
        </div>
      ))}
    </div>
  );
}
