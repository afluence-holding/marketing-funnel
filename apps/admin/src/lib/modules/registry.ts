/**
 * Admin module registry.
 *
 * The back office is modular: each BU/tenant can enable a set of modules
 * (Campaigns, Responses, Launch Ops, ...). This registry is the single source
 * of truth for: which modules exist, their tab metadata, and a resolver for
 * which modules are enabled for a given (organizer, bu).
 *
 * Agnostic by design: enablement is data-driven. For the MVP it is a static
 * map; later it can be backed by backoffice.tenant_membership.modules without
 * changing any consumer.
 */

export type AdminModuleId = 'campaigns' | 'responses' | 'launch';

export interface AdminModule {
  id: AdminModuleId;
  label: string;
  /** Path suffix appended to `/${organizer}/${bu}`. Empty = the index page. */
  pathSuffix: string;
}

export const ADMIN_MODULES: Record<AdminModuleId, AdminModule> = {
  campaigns: { id: 'campaigns', label: 'Campañas', pathSuffix: '' },
  responses: { id: 'responses', label: 'Respuestas', pathSuffix: '/responses' },
  launch: { id: 'launch', label: 'Launch Ops', pathSuffix: '/launch' },
};

/**
 * Static enablement map. Key = `${organizer}/${bu}`.
 * `*` (default) keeps campaigns everywhere so nothing regresses.
 */
const ENABLED: Record<string, AdminModuleId[]> = {
  '*': ['campaigns'],
  // german-roz is unified on the `di21` BU: that's where the Meta campaigns
  // data lives (meta_ops) AND the Centro/launch. The legacy `/german-roz/main`
  // URL is 308-redirected to `di21` in middleware.
  'german-roz/di21': ['campaigns', 'launch', 'responses'],
  // Creators whose landing intake lives outside the CRM (dedicated marketing
  // tables). Responses-only back office — no Meta campaigns dashboard.
  'bukku/main': ['responses'],
  'mama-sin-caos/main': ['responses'],
  'caro-fitness/main': ['responses'],
};

export function enabledModules(organizer: string, bu: string): AdminModule[] {
  const key = `${organizer}/${bu}`;
  const ids = ENABLED[key] ?? ENABLED['*'];
  return ids.map((id) => ADMIN_MODULES[id]);
}

export function isModuleEnabled(organizer: string, bu: string, id: AdminModuleId): boolean {
  return enabledModules(organizer, bu).some((m) => m.id === id);
}

/** Canonical landing path for a tenant: its first enabled module's route. */
export function primaryPath(organizer: string, bu: string): string {
  const base = `/${organizer}/${bu}`;
  const first = enabledModules(organizer, bu)[0];
  return `${base}${first?.pathSuffix ?? ''}`;
}

export interface ModuleTab {
  id: AdminModuleId;
  label: string;
  href: string;
  active: boolean;
}

/** Build tab descriptors for the BU shell, marking the active one by pathname. */
export function buildTabs(organizer: string, bu: string, pathname: string): ModuleTab[] {
  const base = `/${organizer}/${bu}`;
  return enabledModules(organizer, bu).map((m) => {
    const href = `${base}${m.pathSuffix}`;
    const active = m.pathSuffix === '' ? pathname === base || pathname === `${base}/` : pathname.startsWith(href);
    return { id: m.id, label: m.label, href, active };
  });
}
