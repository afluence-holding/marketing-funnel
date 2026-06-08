/**
 * Backoffice repository — staff identity + role/module grants (service-role).
 *
 * Powers the Usuarios (assign ops_role per staff) and Configuración (role→module
 * permission matrix) modules. All writes are authorized upstream by the server
 * action guard (admin/agnostico only).
 */
import { getSupabaseBackoffice } from '@/lib/supabase/server';
import type { ModuleId, OpsRole, StaffRole } from './rbac';

export interface StaffMember {
  userId: string;
  displayName: string | null;
  email: string | null;
  handle: string | null;
  staffRole: string;          // admin | director | member
  opsRole: OpsRole | null;    // null => derived
}

export interface CreateStaffInput {
  email: string;
  password: string;
  displayName: string;
  handle?: string | null;
  staffRole: StaffRole;
  opsRole: OpsRole;
}

export interface UpdateStaffInput {
  userId: string;
  displayName?: string | null;
  email?: string | null;
  handle?: string | null;
  staffRole?: StaffRole;
  opsRole?: OpsRole;
  password?: string | null;
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
  ['organico', 'resumen'], ['organico', 'kpis'], ['organico', 'tareas'],
  ['organico', 'gantt'], ['organico', 'calendario'], ['organico', 'mensajes'],
  ['paid', 'resumen'], ['paid', 'kpis'], ['paid', 'tareas'],
  ['paid', 'gantt'], ['paid', 'calendario'], ['paid', 'mensajes'],
  ['support', 'resumen'], ['support', 'tareas'], ['support', 'gantt'],
  ['support', 'enlaces'], ['support', 'mensajes'],
  ['comunidad', 'resumen'], ['comunidad', 'tareas'], ['comunidad', 'calendario'], ['comunidad', 'mensajes'],
  ['creator', 'resumen'], ['creator', 'tareas'], ['creator', 'calendario'], ['creator', 'mensajes'],
  ['viewer', 'resumen'], ['viewer', 'kpis'],
];

/** Reset the permission matrix to documented defaults. */
export async function resetGrants(): Promise<void> {
  const bo = getSupabaseBackoffice();
  const editable: OpsRole[] = ['organico', 'paid', 'support', 'comunidad', 'creator', 'viewer'];
  // never wipe the super-role '*' rows
  const { error: delErr } = await bo.from('role_module_grant').delete().in('role', editable);
  if (delErr) throw delErr;
  const rows = DEFAULT_GRANTS.filter(([r]) => editable.includes(r)).map(([role, module_id]) => ({ role, module_id }));
  const { error: insErr } = await bo.from('role_module_grant').upsert(rows, { onConflict: 'role,module_id' });
  if (insErr) throw insErr;
}

// ---------------------------------------------------------------------------
// Staff lifecycle CRUD (create / update / delete). All writes use the
// service-role client (RLS-bypassing); authorization is enforced upstream by
// the server-action guard (admin/agnostico only). Each human staff member is
// an auth.users login + a backoffice.profile (id == auth id) + an
// afluence_membership (staff role + ops_role).
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Find an auth user by email (listUsers is paginated; small user base). */
async function findAuthUserByEmail(email: string): Promise<{ id: string } | null> {
  const bo = getSupabaseBackoffice();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await bo.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => (u.email ?? '').toLowerCase() === email.toLowerCase());
    if (found) return { id: found.id };
    if (data.users.length < 200) break;
  }
  return null;
}

/** Free a handle held by an orphan placeholder profile (different id). */
async function releaseHandle(bo: ReturnType<typeof getSupabaseBackoffice>, handle: string | null | undefined, keepId: string): Promise<void> {
  if (!handle) return;
  const { data } = await bo.from('profile').select('id').eq('handle', handle).maybeSingle();
  if (data && data.id !== keepId) {
    await bo.from('profile').delete().eq('id', data.id); // cascades membership
  }
}

/**
 * Create a staff login. Idempotent on email: if the auth user already exists,
 * its password is reset and profile/membership are (re)linked.
 */
export async function createStaff(input: CreateStaffInput): Promise<{ userId: string }> {
  const email = input.email.trim();
  if (!EMAIL_RE.test(email)) throw new Error('invalid_email');
  if (!input.password || input.password.length < 6) throw new Error('weak_password');
  if (!input.displayName.trim()) throw new Error('missing_name');

  const bo = getSupabaseBackoffice();
  const handle = input.handle?.trim() || null;

  let userId: string;
  const { data: created, error: createErr } = await bo.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { display_name: input.displayName.trim() },
  });
  if (createErr) {
    const existing = await findAuthUserByEmail(email);
    if (!existing) throw createErr;
    userId = existing.id;
    const { error: updErr } = await bo.auth.admin.updateUserById(userId, { password: input.password, email_confirm: true });
    if (updErr) throw updErr;
  } else {
    userId = created.user.id;
  }

  await releaseHandle(bo, handle, userId);

  const { error: profErr } = await bo.from('profile').upsert(
    { id: userId, user_kind: 'afluence', display_name: input.displayName.trim(), handle, email },
    { onConflict: 'id' },
  );
  if (profErr) throw profErr;

  const { error: memErr } = await bo.from('afluence_membership').upsert(
    { user_id: userId, role: input.staffRole, ops_role: input.opsRole },
    { onConflict: 'user_id' },
  );
  if (memErr) throw memErr;

  return { userId };
}

/** Update profile fields, staff role, ops role, email and/or password. */
export async function updateStaff(input: UpdateStaffInput): Promise<void> {
  const bo = getSupabaseBackoffice();

  // auth-side changes (email / password) first so a failure aborts before DB writes
  const authPatch: { email?: string; password?: string } = {};
  if (input.email != null && input.email.trim()) {
    if (!EMAIL_RE.test(input.email.trim())) throw new Error('invalid_email');
    authPatch.email = input.email.trim();
  }
  if (input.password) {
    if (input.password.length < 6) throw new Error('weak_password');
    authPatch.password = input.password;
  }
  if (Object.keys(authPatch).length) {
    const { error } = await bo.auth.admin.updateUserById(input.userId, authPatch);
    if (error) throw error;
  }

  const profilePatch: Record<string, string | null> = {};
  if (input.displayName !== undefined) profilePatch.display_name = input.displayName?.trim() || null;
  if (input.email !== undefined && input.email?.trim()) profilePatch.email = input.email.trim();
  if (input.handle !== undefined) {
    const handle = input.handle?.trim() || null;
    await releaseHandle(bo, handle, input.userId);
    profilePatch.handle = handle;
  }
  if (Object.keys(profilePatch).length) {
    const { error } = await bo.from('profile').update(profilePatch).eq('id', input.userId);
    if (error) throw error;
  }

  const memPatch: Record<string, string> = {};
  if (input.staffRole !== undefined) memPatch.role = input.staffRole;
  if (input.opsRole !== undefined) memPatch.ops_role = input.opsRole;
  if (Object.keys(memPatch).length) {
    const { error } = await bo.from('afluence_membership').upsert({ user_id: input.userId, ...memPatch }, { onConflict: 'user_id' });
    if (error) throw error;
  }
}

/** Delete a staff member: removes the auth login and the profile (cascades membership). */
export async function deleteStaff(userId: string): Promise<void> {
  const bo = getSupabaseBackoffice();
  const { error: authErr } = await bo.auth.admin.deleteUser(userId);
  // ignore "user not found" so a half-provisioned record can still be cleaned up
  if (authErr && !/not.*found/i.test(authErr.message)) throw authErr;
  const { error } = await bo.from('profile').delete().eq('id', userId);
  if (error) throw error;
}
