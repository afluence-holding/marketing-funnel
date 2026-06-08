/**
 * Backoffice repository — staff identity + role/module grants (service-role).
 *
 * Powers the Usuarios (assign ops_role per staff) and Configuración (role→module
 * permission matrix) modules. All writes are authorized upstream by the server
 * action guard (admin/agnostico only).
 */
import { getSupabaseBackoffice } from '@/lib/supabase/server';
import type { ModuleId, OpsRole } from './rbac';

export interface StaffMember {
  userId: string;
  displayName: string | null;
  email: string | null;
  handle: string | null;
  staffRole: string;          // admin | director | member
  opsRole: OpsRole | null;    // null => derived
}

export async function listStaff(): Promise<StaffMember[]> {
  const bo = getSupabaseBackoffice();
  const { data, error } = await bo
    .from('afluence_membership')
    .select('user_id, role, ops_role, profile:user_id(display_name, email, handle)');
  if (error) throw error;
  return ((data ?? []) as any[])
    .map((r) => ({
      userId: r.user_id,
      displayName: r.profile?.display_name ?? null,
      email: r.profile?.email ?? null,
      handle: r.profile?.handle ?? null,
      staffRole: r.role,
      opsRole: r.ops_role ?? null,
    }))
    .sort((a, b) => (a.displayName ?? a.email ?? '').localeCompare(b.displayName ?? b.email ?? ''));
}

export async function setOpsRole(userId: string, opsRole: OpsRole): Promise<void> {
  const bo = getSupabaseBackoffice();
  const { error } = await bo.from('afluence_membership').update({ ops_role: opsRole }).eq('user_id', userId);
  if (error) throw error;
}

/** Toggle a single role↔module grant. Super roles ('*') are not editable here. */
export async function setGrant(role: OpsRole, moduleId: ModuleId, enabled: boolean): Promise<void> {
  const bo = getSupabaseBackoffice();
  if (enabled) {
    const { error } = await bo.from('role_module_grant').upsert({ role, module_id: moduleId }, { onConflict: 'role,module_id' });
    if (error) throw error;
  } else {
    const { error } = await bo.from('role_module_grant').delete().eq('role', role).eq('module_id', moduleId);
    if (error) throw error;
  }
}

const DEFAULT_GRANTS: Array<[OpsRole, string]> = [
  ['agnostico', '*'], ['admin', '*'],
  ['marketing', 'resumen'], ['marketing', 'kpis'], ['marketing', 'tareas'],
  ['marketing', 'gantt'], ['marketing', 'calendario'], ['marketing', 'mensajes'],
  ['operaciones', 'resumen'], ['operaciones', 'tareas'], ['operaciones', 'gantt'], ['operaciones', 'enlaces'],
  ['viewer', 'resumen'], ['viewer', 'kpis'],
];

/** Reset the permission matrix to documented defaults. */
export async function resetGrants(): Promise<void> {
  const bo = getSupabaseBackoffice();
  const editable: OpsRole[] = ['marketing', 'operaciones', 'viewer'];
  // never wipe the super-role '*' rows
  const { error: delErr } = await bo.from('role_module_grant').delete().in('role', editable);
  if (delErr) throw delErr;
  const rows = DEFAULT_GRANTS.filter(([r]) => editable.includes(r)).map(([role, module_id]) => ({ role, module_id }));
  const { error: insErr } = await bo.from('role_module_grant').upsert(rows, { onConflict: 'role,module_id' });
  if (insErr) throw insErr;
}
