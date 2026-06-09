import { notFound } from 'next/navigation';
import { isModuleEnabled } from '@/lib/modules/registry';
import { getWaGroupsOverview } from '@/lib/whatsapp-groups/repository';
import { listBuOptions } from '@/lib/dashboard/bu-options';
import { getOpsSession } from '@/lib/backoffice/session';
import { WhatsAppGroupsView } from '@/components/whatsapp-groups/whatsapp-groups-view';

export const dynamic = 'force-dynamic';

export default async function WhatsAppGroupsPage({
  params,
}: {
  params: Promise<{ organizer: string; bu: string }>;
}) {
  const { organizer, bu } = await params;

  // The module must be enabled for this tenant (registry is the gate).
  if (!isModuleEnabled(organizer, bu, 'whatsapp-groups')) notFound();

  const [overview, buOptions, session] = await Promise.all([
    getWaGroupsOverview(organizer, bu),
    listBuOptions().catch(() => []),
    getOpsSession().catch(() => null),
  ]);

  // Writes are admin-only (canManage); un-onboarded users default to agnostico.
  const canManage = session?.canManage ?? true;

  return (
    <WhatsAppGroupsView
      overview={overview}
      buOptions={buOptions}
      currentPath={`/${organizer}/${bu}/whatsapp-groups`}
      organizer={organizer}
      bu={bu}
      canManage={canManage}
    />
  );
}
