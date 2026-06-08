import { notFound } from 'next/navigation';
import { getLaunchByBu, getLaunchOverview } from '@/lib/launch-ops/repository';
import { LaunchOpsView } from '@/components/launch-ops/launch-ops-view';
import { getOpsSession } from '@/lib/backoffice/session';
import { listStaff, type StaffMember } from '@/lib/backoffice/repository';

export const dynamic = 'force-dynamic';

export default async function LaunchOpsPage({
  params,
}: {
  params: Promise<{ organizer: string; bu: string }>;
}) {
  const { organizer, bu } = await params;

  const launch = await getLaunchByBu(organizer, bu).catch(() => null);
  if (!launch) {
    return (
      <div className="section">
        <div className="section-title">Launch Ops</div>
        <div className="card">
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            No hay ningún lanzamiento configurado para <b>{organizer}/{bu}</b>. Corré las migraciones de{' '}
            <code>launch_ops</code> y el seed para empezar.
          </p>
        </div>
      </div>
    );
  }

  let overview;
  try {
    overview = await getLaunchOverview(launch.id);
  } catch {
    notFound();
  }

  const session = await getOpsSession().catch(() => null);
  let staff: StaffMember[] = [];
  if (session?.canManage) {
    staff = await listStaff().catch(() => []);
  }

  return (
    <LaunchOpsView
      overview={overview}
      session={
        session
          ? { opsRole: session.opsRole, canManage: session.canManage, grants: session.grants }
          : null
      }
      staff={staff}
    />
  );
}
