import type { AggregatedMetrics } from '@/lib/dashboard/adapter';

interface Kpi {
  label: string;
  value: string;
  sub?: string;
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function fmtInt(n: number): string {
  return new Intl.NumberFormat('es-CL').format(Math.round(n));
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

function fmt2(n: number): string {
  return n.toFixed(2);
}

export function KpiGrid({ metrics }: { metrics: AggregatedMetrics }) {
  const kpis: Kpi[] = [
    { label: 'Spend', value: fmtCurrency(metrics.spend) },
    { label: 'ROAS', value: fmt2(metrics.roas), sub: `Purchase value: ${fmtCurrency(metrics.purchase_value)}` },
    { label: 'CPA', value: fmtCurrency(metrics.cpa), sub: `${fmtInt(metrics.purchases)} purchases` },
    { label: 'Leads', value: fmtInt(metrics.leads) },
    { label: 'CTR', value: fmtPct(metrics.ctr), sub: `${fmtInt(metrics.clicks)} clicks / ${fmtInt(metrics.impressions)} impr` },
    { label: 'CPM', value: fmtCurrency(metrics.cpm) },
    { label: 'Frequency', value: fmt2(metrics.frequency), sub: `${fmtInt(metrics.reach)} reach` },
    { label: 'CPC', value: fmtCurrency(metrics.cpc) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((k) => (
        <div key={k.label} className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/30">
          <div className="text-xs uppercase tracking-wider text-zinc-500">{k.label}</div>
          <div className="text-xl font-semibold mt-1">{k.value}</div>
          {k.sub && <div className="text-xs text-zinc-500 mt-1">{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}
