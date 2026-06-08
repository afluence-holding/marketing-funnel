'use server';

/**
 * Server actions for the Usuarios + Configuración modules. Every action
 * re-checks that the caller is an admin/agnostico (canManage) server-side, so a
 * client-side "ver como rol" preview can never escalate real permissions.
 */
import { getOpsSession } from '@/lib/backoffice/session';
import {
  listStaff,
  setOpsRole,
  setGrant,
  resetGrants,
  createStaff,
  updateStaff,
  deleteStaff,
  type CreateStaffInput,
  type UpdateStaffInput,
} from '@/lib/backoffice/repository';
import type { ModuleId, OpsRole } from '@/lib/backoffice/rbac';

type Result = { ok: true } | { ok: false; error: string };

async function requireManage(): Promise<Result | null> {
  const session = await getOpsSession();
  if (!session) return { ok: false, error: 'unauthenticated' };
  if (!session.canManage) return { ok: false, error: 'forbidden' };
  return null;
}

/** Map repository errors to friendly codes the UI can localize. */
function errCode(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/invalid_email/.test(msg)) return 'invalid_email';
  if (/weak_password/.test(msg)) return 'weak_password';
  if (/missing_name/.test(msg)) return 'missing_name';
  if (/duplicate key|unique constraint|already.*registered/i.test(msg)) return 'duplicate';
  return 'save_failed';
}

export async function setOpsRoleAction(input: { userId: string; opsRole: OpsRole }): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await setOpsRole(input.userId, input.opsRole);
    return { ok: true };
  } catch {
    return { ok: false, error: 'update_failed' };
  }
}

export async function setGrantAction(input: { role: OpsRole; moduleId: ModuleId; enabled: boolean }): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await setGrant(input.role, input.moduleId, input.enabled);
    return { ok: true };
  } catch {
    return { ok: false, error: 'update_failed' };
  }
}

export async function resetGrantsAction(): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await resetGrants();
    return { ok: true };
  } catch {
    return { ok: false, error: 'reset_failed' };
  }
}

export async function listStaffAction() {
  const denied = await requireManage();
  if (denied) return { ok: false as const, error: denied.ok ? 'forbidden' : denied.error, staff: [] };
  const staff = await listStaff();
  return { ok: true as const, staff };
}

export async function createStaffAction(input: CreateStaffInput): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await createStaff(input);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errCode(e) };
  }
}

export async function updateStaffAction(input: UpdateStaffInput): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await updateStaff(input);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errCode(e) };
  }
}

export async function deleteStaffAction(input: { userId: string }): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  // never let an admin delete their own login (would lock themselves out)
  const session = await getOpsSession();
  if (session && session.userId === input.userId) return { ok: false, error: 'cannot_delete_self' };
  try {
    await deleteStaff(input.userId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errCode(e) };
  }
}
