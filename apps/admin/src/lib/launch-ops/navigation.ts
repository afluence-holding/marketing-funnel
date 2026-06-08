/**
 * Launch Ops sidebar navigation — section catalog for the Centro de Operaciones.
 *
 * Mirrors the validated reference design (docs/DI21-C2-Centro-Operaciones.html):
 * the 9 module ids are grouped into 6 ordered sections, each module carries an
 * icon. Modules + role resolution stay in `backoffice/rbac.ts`; this file only
 * adds the section/icon metadata + a grouping helper. Agnostic by design — no
 * launch-specific strings here.
 */
import { MODULE_TAB_LABEL, type ModuleId } from '@/lib/backoffice/rbac';
import { enabledModules, type AdminModuleId } from '@/lib/modules/registry';

export const SECTION_ORDER = [
  'Vista general',
  'Estadísticas',
  'Project Management',
  'Marketing',
  'Operaciones',
  'Administración',
] as const;
export type Section = (typeof SECTION_ORDER)[number];

/** module id -> the sidebar section it belongs to. */
export const MODULE_SECTION: Record<ModuleId, Section> = {
  resumen: 'Vista general',
  kpis: 'Estadísticas',
  tareas: 'Project Management',
  gantt: 'Project Management',
  calendario: 'Marketing',
  mensajes: 'Marketing',
  enlaces: 'Operaciones',
  usuarios: 'Administración',
  config: 'Administración',
};

/** module id -> nav icon (matches the reference HTML glyphs). */
export const MODULE_ICON: Record<ModuleId, string> = {
  resumen: '🏠',
  kpis: '📊',
  tareas: '✅',
  gantt: '📆',
  calendario: '🗓️',
  mensajes: '💬',
  enlaces: '🔗',
  usuarios: '👤',
  config: '⚙️',
};

export interface SidebarItem {
  id: ModuleId;
  label: string;
  icon: string;
}
export interface SidebarSection {
  section: Section;
  items: SidebarItem[];
}

/**
 * Group the visible module ids into ordered sections, preserving the order of
 * `visible` within each section. Empty sections are dropped (same rule as the
 * reference HTML: a section header only shows if it has visible modules).
 */
export function groupModulesBySection(visible: ModuleId[]): SidebarSection[] {
  const set = new Set(visible);
  return SECTION_ORDER.map((section) => ({
    section,
    items: visible
      .filter((id) => set.has(id) && MODULE_SECTION[id] === section)
      .map((id) => ({ id, label: MODULE_TAB_LABEL[id], icon: MODULE_ICON[id] })),
  })).filter((g) => g.items.length > 0);
}

/* -------------------------------------------------------------------------
 * BU-level admin modules surfaced in the sidebar (cross-route links).
 * The Centro de Operaciones is the `launch` admin module; this exposes the
 * BU's *other* enabled modules (e.g. Campañas, Respuestas) as nav links so
 * the sidebar is the unified module hub. Data-driven via the registry —
 * agnostic per tenant, no hardcoded BU strings.
 * ----------------------------------------------------------------------- */
export const ADMIN_MODULE_ICON: Record<AdminModuleId, string> = {
  campaigns: '📈',
  responses: '📥',
  launch: '🚀',
};

export interface AdminModuleLink {
  id: AdminModuleId;
  label: string;
  href: string;
  icon: string;
}

/**
 * Links to the BU's other enabled admin modules (everything except `exclude`,
 * the current module). For german-roz this yields the "Campañas" link.
 */
export function adminModuleLinks(
  organizer: string,
  bu: string,
  exclude: AdminModuleId,
): AdminModuleLink[] {
  return enabledModules(organizer, bu)
    .filter((m) => m.id !== exclude)
    .map((m) => ({
      id: m.id,
      label: m.label,
      href: `/${organizer}/${bu}${m.pathSuffix}`,
      icon: ADMIN_MODULE_ICON[m.id],
    }));
}
