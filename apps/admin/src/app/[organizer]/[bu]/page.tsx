import { notFound } from 'next/navigation';
import { loadDashboardData } from '@/lib/dashboard/adapter';
import { computeHealthScore } from '@/lib/dashboard/health-score';
import { HealthGauge } from '@/components/health-gauge';
import { KpiGrid } from '@/components/kpi-grid';
import { EntityTable } from '@/components/entity-table';

interface Params {
  organizer: string;
  bu: string;
}

export default async function DashboardPage({ params }: { params: Promise<Params> }) {
  const { organizer, bu } = await params;

  let data;
  try {
    data = await loadDashboardData({ organizerSlug: organizer, buSlug: bu });
  } catch {
    notFound();
  }

  const health = computeHealthScore(data.totals, data.bu.kpi_targets);

  return (
    <main className="min-h-screen px-6 py-8 max-w-6xl mx-auto space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            {data.bu.organizer_slug} · {data.bu.match_strategy}
          </div>
          <h1 className="text-2xl font-semibold mt-1">{data.bu.name}</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {data.since} → {data.until}
          </p>
        </div>
        <HealthGauge score={health} />
      </header>

      {!data.hasData && (
        <div className="border border-yellow-500/30 bg-yellow-500/5 text-yellow-200 text-sm rounded-lg p-4">
          Sin campañas registradas en <code>marketing_ops.campaigns</code> para este BU
          (<code>{data.bu.match_strategy}</code>). Esperá a que el pipeline{' '}
          <code>di21_monitor.py</code> sincronice o cambiá el <code>match_strategy</code>.
        </div>
      )}

      <KpiGrid metrics={data.totals} />

      <section>
        <EntityTable title="By campaign" rows={data.byCampaign} />
      </section>
    </main>
  );
}
