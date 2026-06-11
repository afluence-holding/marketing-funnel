import { notFound } from 'next/navigation';

// Always hit the DB — never prerender or cache a BU dashboard page.
export const dynamic = 'force-dynamic';

import { loadDashboard } from '@/lib/campaigns/dashboard-adapter';
import type { DashboardData } from '@/lib/campaigns/types';
import { listBuOptions, type BuOption } from '@/lib/dashboard/bu-options';
import { CampaignsView } from '@/components/campaigns/campaigns-view';

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ organizer: string; bu: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { organizer, bu } = await params;
  const sp = (await searchParams) ?? {};
  const pickString = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;
  const rangeInput = {
    from:   pickString(sp.from),
    to:     pickString(sp.to),
    preset: pickString(sp.preset),
  };

  let data: DashboardData;
  try {
    data = await loadDashboard({
      organizerSlug: organizer,
      buSlug: bu,
      range: rangeInput,
    });
  } catch (err) {
    // Surface the real failure in server logs; a silent 404 here disguises
    // infra/env/data errors as "page does not exist".
    console.error(`[campaigns] loadDashboard failed for ${organizer}/${bu}:`, err);
    notFound();
  }

  const buOptions = await listBuOptions().catch(() => [] as BuOption[]);
  const currentPath = `/${organizer}/${bu}`;

  return (
    <CampaignsView
      data={data}
      organizerSlug={organizer}
      buSlug={bu}
      buOptions={buOptions}
      currentPath={currentPath}
    />
  );
}
