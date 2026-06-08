'use client';

/**
 * ResponsesSidebar — modular navigation for the Responses module.
 *
 * Mirrors the Centro de Operaciones sidebar (reuses the `.launch-*` styles): a
 * dark module rail with a "Creadores" section (cross-org links to every
 * creator's responses) and, when a creator has more than one form, a
 * "Formularios" section to switch between sources. Includes the mobile drawer
 * behaviour (backdrop is `display:none` until `.show`).
 */
import Link from 'next/link';
import { prettyFacet } from '@/lib/responses/presentation';
import type { CreatorResponseLink } from '@/lib/responses/navigation';
import type { AdminModuleLink } from '@/lib/launch-ops/navigation';

interface FormItem {
  id: string;
  label: string;
}

/** One selectable campaign/landing within the active creator (+ count). */
export interface CampaignItem {
  value: string;
  count: number;
}

export function ResponsesSidebar({
  brand,
  subtitle,
  creators,
  moduleLinks = [],
  activeOrganizer,
  forms,
  activeFormId,
  onSelectForm,
  campaigns = [],
  campaignPrefix = '',
  campaignLabels,
  activeCampaign = 'all',
  onSelectCampaign,
  campaignNoun = 'Campañas',
  open,
  onClose,
}: {
  brand: string;
  subtitle: string;
  creators: CreatorResponseLink[];
  moduleLinks?: AdminModuleLink[];
  activeOrganizer: string;
  forms: FormItem[];
  activeFormId: string;
  onSelectForm: (id: string) => void;
  campaigns?: CampaignItem[];
  campaignPrefix?: string;
  campaignLabels?: Record<string, string>;
  activeCampaign?: string;
  onSelectCampaign?: (value: string) => void;
  campaignNoun?: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside className={`launch-sidebar${open ? ' open' : ''}`} aria-label="Respuestas de creadores">
        <div className="launch-sb-brand">
          {brand}
          <small>{subtitle}</small>
        </div>

        {moduleLinks.length > 0 && (
          <div>
            <div className="launch-sb-sec">Módulos</div>
            {moduleLinks.map((m) => (
              <Link key={m.id} href={m.href} className="launch-navitem" onClick={onClose}>
                <span className="ic" aria-hidden>
                  {m.icon}
                </span>
                {m.label}
              </Link>
            ))}
          </div>
        )}

        {forms.length > 1 && (
          <div>
            <div className="launch-sb-sec">Formularios</div>
            {forms.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`launch-navitem${activeFormId === f.id ? ' active' : ''}`}
                aria-current={activeFormId === f.id ? 'page' : undefined}
                onClick={() => {
                  onSelectForm(f.id);
                  onClose();
                }}
              >
                <span className="ic" aria-hidden>
                  📝
                </span>
                {f.label}
              </button>
            ))}
          </div>
        )}

        <div>
          <div className="launch-sb-sec">Creadores</div>
          {creators.map((c) => (
            <Link
              key={`${c.organizer}/${c.bu}`}
              href={c.href}
              className={`launch-navitem${c.organizer === activeOrganizer ? ' active' : ''}`}
              aria-current={c.organizer === activeOrganizer ? 'page' : undefined}
              onClick={onClose}
            >
              <span className="ic" aria-hidden>
                {c.icon}
              </span>
              {c.label}
            </Link>
          ))}
        </div>

        {campaigns.length > 1 && onSelectCampaign && (
          <div>
            <div className="launch-sb-sec">{campaignNoun}</div>
            <button
              type="button"
              className={`launch-navitem${activeCampaign === 'all' ? ' active' : ''}`}
              aria-current={activeCampaign === 'all' ? 'page' : undefined}
              onClick={() => {
                onSelectCampaign('all');
                onClose();
              }}
            >
              <span className="ic" aria-hidden>
                📋
              </span>
              Todas
            </button>
            {campaigns.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`launch-navitem${activeCampaign === c.value ? ' active' : ''}`}
                aria-current={activeCampaign === c.value ? 'page' : undefined}
                onClick={() => {
                  onSelectCampaign(c.value);
                  onClose();
                }}
                title={c.value}
              >
                <span className="ic" aria-hidden>
                  🎯
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {campaignLabels?.[c.value] ?? prettyFacet(c.value, campaignPrefix)}
                </span>
                <span style={{ opacity: 0.6, fontSize: '0.72rem' }}>{c.count}</span>
              </button>
            ))}
          </div>
        )}
      </aside>

      <div className={`launch-sb-backdrop${open ? ' show' : ''}`} onClick={onClose} aria-hidden />
    </>
  );
}
