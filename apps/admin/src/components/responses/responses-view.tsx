'use client';

import { useMemo, useState } from 'react';
import { BuSelector } from '@/components/bu-selector';
import { ResponsesSidebar } from '@/components/responses/responses-sidebar';
import { ResponsesStatsBar } from '@/components/responses/responses-stats-bar';
import { ResponsesFilterBar, type StatusFilter } from '@/components/responses/responses-filter-bar';
import { ResponsesTable } from '@/components/responses/responses-table';
import { creatorResponseLinks } from '@/lib/responses/navigation';
import { adminModuleLinks } from '@/lib/launch-ops/navigation';
import { commonPrefix, downloadCsv } from '@/lib/responses/presentation';
import { buildResponseStats } from '@/lib/responses/stats';
import type { BuOption } from '@/lib/dashboard/bu-options';
import type { ResponsesOverview } from '@/lib/responses/types';

/**
 * ResponsesView — orchestrator for the Responses module.
 *
 * Owns the active-source / filter state and composes the modular pieces:
 * sidebar (creator + module nav), stats bar, filter bar and table. All
 * presentation helpers live in `lib/responses/presentation.ts` and the status
 * vocabulary in `lib/responses/types.ts` (single source of truth).
 */
export function ResponsesView({
  overview,
  buOptions,
  currentPath,
  organizer,
  bu,
}: {
  overview: ResponsesOverview;
  buOptions: BuOption[];
  currentPath: string;
  organizer: string;
  bu: string;
}) {
  const [activeId, setActiveId] = useState(overview.sources[0]?.source.id ?? '');
  const active = overview.sources.find((s) => s.source.id === activeId) ?? overview.sources[0];

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sourceKey = active?.source.sourceColumn ?? '';

  const creators = useMemo(() => creatorResponseLinks(), []);
  const moduleLinks = useMemo(() => adminModuleLinks(organizer, bu, 'responses'), [organizer, bu]);
  const forms = useMemo(
    () => overview.sources.map((s) => ({ id: s.source.id, label: s.source.label })),
    [overview.sources],
  );

  /** Distinct acquisition sources present in the loaded records, with counts. */
  const sourceOptions = useMemo(() => {
    if (!active || !sourceKey) return [] as Array<[string, number]>;
    const counts = new Map<string, number>();
    for (const r of active.records) {
      const value = (r.fields[sourceKey] ?? '').trim();
      if (!value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [active, sourceKey]);

  const sourcePrefix = useMemo(() => commonPrefix(sourceOptions.map(([v]) => v)), [sourceOptions]);

  /** Records scoped to the selected campaign/landing (drives stats + table). */
  const scoped = useMemo(() => {
    if (!active) return [];
    if (sourceFilter === 'all') return active.records;
    return active.records.filter((r) => (r.fields[sourceKey] ?? '').trim() === sourceFilter);
  }, [active, sourceFilter, sourceKey]);

  const progress = active?.source.progress;
  const statusValues = progress?.kind === 'status' ? progress.values : undefined;
  const campaignLabels = progress?.kind === 'landing' ? progress.labels : undefined;

  /** Stats reflect the current campaign scope (driven by the progress capability). */
  const stats = useMemo(() => {
    if (!active || !progress) return [];
    const total = sourceFilter === 'all' ? active.total : scoped.length;
    // When viewing "all" of a landing source, break the total down by landing
    // so single-step forms still get a rich, Caro-like stats panel.
    const facet =
      sourceFilter === 'all' && sourceOptions.length > 1
        ? { values: sourceOptions, prefix: sourcePrefix, labels: campaignLabels, max: 4 }
        : undefined;
    return buildResponseStats(scoped, total, progress, facet);
  }, [active, progress, scoped, sourceFilter, sourceOptions, sourcePrefix, campaignLabels]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
      );
    });
  }, [scoped, query, statusFilter]);

  if (!active) return null;

  const resetFilters = () => {
    setStatusFilter('all');
    setSourceFilter('all');
  };

  return (
    <div className="section centro-theme">
      <div className="launch-shell">
        <ResponsesSidebar
          brand={active.source.creatorLabel}
          subtitle="Respuestas"
          creators={creators}
          moduleLinks={moduleLinks}
          activeOrganizer={organizer}
          forms={forms}
          activeFormId={activeId}
          onSelectForm={(id) => {
            setActiveId(id);
            resetFilters();
          }}
          campaigns={sourceOptions.map(([value, count]) => ({ value, count }))}
          campaignPrefix={sourcePrefix}
          campaignLabels={campaignLabels}
          activeCampaign={sourceFilter}
          onSelectCampaign={setSourceFilter}
          campaignNoun="Campañas"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        <div className="launch-main">
          <button
            type="button"
            className="launch-sb-toggle"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú de creadores"
          >
            ☰ Creadores
          </button>

          <div className="report-header" style={{ marginBottom: 16 }}>
            <div>
              <h1>Respuestas</h1>
              <div style={{ marginTop: 4 }}>
                <span className="date-label">{active.source.creatorLabel}</span>{' '}
                <span className="badge badge-accent">{active.source.label}</span>
              </div>
            </div>
            <BuSelector options={buOptions} currentPath={currentPath} />
          </div>

          <ResponsesStatsBar stats={stats} />

          <ResponsesFilterBar
            query={query}
            onQuery={setQuery}
            statusValues={statusValues}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onExport={() => downloadCsv(active)}
            filteredCount={filtered.length}
            total={sourceFilter === 'all' ? active.total : scoped.length}
          />

          <ResponsesTable records={filtered} cols={active.source.columns} />
        </div>
      </div>
    </div>
  );
}
