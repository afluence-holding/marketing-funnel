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
