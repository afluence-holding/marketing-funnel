/**
 * Backoffice RBAC — shared constants for ops roles and module visibility.
 *
 * Module ids are the launch "Centro de Operaciones" tab ids. They are the same
 * tokens stored in backoffice.role_module_grant.module_id ('*' = all).
 */

export type OpsRole =
  | 'agnostico'
  | 'admin'
  | 'organico'
  | 'paid'
  | 'support'
  | 'comunidad'
  | 'creator'
  | 'viewer';

export const OPS_ROLES: OpsRole[] = [
  'agnostico',
  'admin',
  'organico',
  'paid',
  'support',
  'comunidad',
  'creator',
  'viewer',
];

export const ROLE_LABELS: Record<OpsRole, string> = {
  agnostico: 'Agnóstico (todo)',
  admin: 'Admin / PM',
  organico: 'Orgánico',
  paid: 'Paid / Trafficker',
  support: 'Support / OB / Config',
  comunidad: 'Comunidad / WhatsApp',
  creator: 'Creator',
  viewer: 'Viewer',
};

/** Internal staff role (backoffice.afluence_membership.role). Client-safe. */
export const STAFF_ROLES = ['admin', 'director', 'member'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Admin',
  director: 'Director',
  member: 'Miembro',
};

/** All Centro de Operaciones module ids, in sidebar order. */
export const MODULE_IDS = [
  'resumen',
  'kpis',
  'tareas',
  'gantt',
  'calendario',
  'mensajes',
  'enlaces',
  'usuarios',
  'config',
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

/** module id -> the LaunchOpsView tab label it controls. */
export const MODULE_TAB_LABEL: Record<ModuleId, string> = {
  resumen: 'Resumen',
  kpis: 'KPIs',
  tareas: 'Tareas',
  gantt: 'Gantt',
  calendario: 'Calendario',
  mensajes: 'Mensajes',
  enlaces: 'Enlaces',
  usuarios: 'Usuarios',
  config: 'Configuración',
};

/** Roles that always see everything + can manage roles/permissions. */
export function isSuperRole(role: OpsRole): boolean {
  return role === 'agnostico' || role === 'admin';
}

/** Resolve the set of module ids visible to a role given the grant matrix. */
export function modulesForRole(
  role: OpsRole,
  grants: Record<string, string[]>,
): ModuleId[] {
  const list = grants[role] ?? [];
  if (isSuperRole(role) || list.includes('*')) return [...MODULE_IDS];
  return MODULE_IDS.filter((m) => list.includes(m));
}
