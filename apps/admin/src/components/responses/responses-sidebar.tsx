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
import type { CreatorResponseLink } from '@/lib/responses/navigation';
import type { AdminModuleLink } from '@/lib/launch-ops/navigation';

interface FormItem {
  id: string;
  label: string;
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
      </aside>

      <div className={`launch-sb-backdrop${open ? ' show' : ''}`} onClick={onClose} aria-hidden />
    </>
  );
}
