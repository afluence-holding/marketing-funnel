import type { CSSProperties } from 'react';
import { ModuleTabBar } from '@/components/launch-ops/module-tab-bar';
import { brandCssVars } from '@/lib/branding/org-brand';

export const dynamic = 'force-dynamic';

/**
 * BU shell. Adds a modular tab strip above every module page for this BU and
 * BRANDS the whole subtree with the org's accent: `brandCssVars(organizer)`
 * sets `--color-accent` (+ dark/soft) so every module — Campañas, Respuestas,
 * Centro — adopts the organization's color. The global light palette lives in
 * `:root`; this only overrides the accent per org.
 */
export default async function BuLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizer: string; bu: string }>;
}) {
  const { organizer, bu } = await params;
  return (
    <div style={brandCssVars(organizer) as CSSProperties}>
      <ModuleTabBar organizer={organizer} bu={bu} />
      {children}
    </div>
  );
}
