'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buildTabs } from '@/lib/modules/registry';

/**
 * Slim module tab strip rendered by the BU layout, above each module's page.
 * Additive: does not alter the existing dashboard header. Hidden when a BU
 * only has a single module enabled (keeps current dashboards untouched).
 */
export function ModuleTabBar({ organizer, bu }: { organizer: string; bu: string }) {
  const pathname = usePathname() ?? `/${organizer}/${bu}`;
  const tabs = buildTabs(organizer, bu, pathname);
  if (tabs.length <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 20,
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: 12,
      }}
    >
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          style={{
            padding: '7px 16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            borderRadius: 8,
            textDecoration: 'none',
            border: `1px solid ${t.active ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: t.active ? 'var(--color-accent)' : 'var(--color-bg-card)',
            color: t.active ? '#fff' : 'var(--color-text-secondary)',
          }}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
