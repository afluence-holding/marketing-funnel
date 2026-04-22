import type { EntityMetrics } from '@/lib/dashboard/adapter';

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function fmtInt(n: number): string {
  return new Intl.NumberFormat('es-CL').format(Math.round(n));
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

export function EntityTable({ title, rows }: { title: string; rows: EntityMetrics[] }) {
  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
              <th className="text-left px-4 py-2 font-normal">Name</th>
              <th className="text-right px-4 py-2 font-normal">Spend</th>
              <th className="text-right px-4 py-2 font-normal">Leads</th>
              <th className="text-right px-4 py-2 font-normal">CPA</th>
              <th className="text-right px-4 py-2 font-normal">ROAS</th>
              <th className="text-right px-4 py-2 font-normal">CTR</th>
              <th className="text-right px-4 py-2 font-normal">Freq</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center px-4 py-8 text-zinc-500">
                  No data for this range.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.entity_id} className="border-b border-zinc-800/50 last:border-0">
                  <td className="px-4 py-2">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-zinc-500">{r.entity_id}</div>
                  </td>
                  <td className="text-right px-4 py-2">{fmtCurrency(r.spend)}</td>
                  <td className="text-right px-4 py-2">{fmtInt(r.leads)}</td>
                  <td className="text-right px-4 py-2">{fmtCurrency(r.cpa)}</td>
                  <td className="text-right px-4 py-2">{r.roas.toFixed(2)}</td>
                  <td className="text-right px-4 py-2">{fmtPct(r.ctr)}</td>
                  <td className="text-right px-4 py-2">{r.frequency.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
