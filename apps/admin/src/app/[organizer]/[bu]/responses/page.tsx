import { notFound } from 'next/navigation';
import { getResponsesForTenant } from '@/lib/responses/repository';
import { listBuOptions } from '@/lib/dashboard/bu-options';
import { isModuleEnabled } from '@/lib/modules/registry';
import { ResponsesView } from '@/components/responses/responses-view';

export const dynamic = 'force-dynamic';

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ organizer: string; bu: string }>;
}) {
  const { organizer, bu } = await params;

  // The module must be enabled for this tenant (registry is the gate).
  if (!isModuleEnabled(organizer, bu, 'responses')) notFound();

  const [overview, buOptions] = await Promise.all([
    getResponsesForTenant(organizer, bu),
    listBuOptions().catch(() => []),
  ]);

  if (overview.sources.length === 0) {
    return (
      <div className="section centro-theme">
        <div className="report-header" style={{ marginBottom: 16 }}>
          <h1>Respuestas</h1>
        </div>
        <div className="card">
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            No hay fuentes de respuestas configuradas para <b>{organizer}/{bu}</b>. Registrá la
            landing en <code>lib/responses/sources.ts</code> y habilitá el módulo en el registry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsesView
      overview={overview}
      buOptions={buOptions}
      currentPath={`/${organizer}/${bu}/responses`}
      organizer={organizer}
      bu={bu}
    />
  );
}
