import { ModuleTabBar } from '@/components/launch-ops/module-tab-bar';

export const dynamic = 'force-dynamic';

/**
 * BU shell. Adds a modular tab strip above every module page for this BU.
 * Non-breaking: the existing dashboard page keeps its own header; this only
 * prepends the tab bar (which hides itself when a single module is enabled).
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
    <>
      <ModuleTabBar organizer={organizer} bu={bu} />
      {children}
    </>
  );
}
