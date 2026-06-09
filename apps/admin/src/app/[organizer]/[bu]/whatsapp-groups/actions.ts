'use server';

/**
 * Server actions for the WhatsApp Groups module. Every mutation re-checks that
 * the caller is an admin/agnostico (canManage) server-side — the client "ver
 * como rol" preview can never escalate real permissions. Writes go directly to
 * the `marketing` schema via the repository (service role); the live rotation in
 * the API is never touched, so edits are safe for in-flight registrations.
 */
import { getOpsSession } from '@/lib/backoffice/session';
import {
  createPool,
  updatePool,
  deletePool,
  createGroup,
  updateGroup,
  deleteGroup,
  type CreatePoolInput,
  type UpdatePoolInput,
  type CreateGroupInput,
  type UpdateGroupInput,
} from '@/lib/whatsapp-groups/repository';

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
  if (/invalid_invite_url/.test(msg)) return 'invalid_invite_url';
  if (/invalid_pool_key/.test(msg)) return 'invalid_pool_key';
  if (/missing_label/.test(msg)) return 'missing_label';
  if (/invalid_capacity/.test(msg)) return 'invalid_capacity';
  if (/invalid_position/.test(msg)) return 'invalid_position';
  if (/pool_has_assignments/.test(msg)) return 'pool_has_assignments';
  if (/group_has_assignments/.test(msg)) return 'group_has_assignments';
  if (/duplicate key|unique constraint/i.test(msg)) return 'duplicate';
  return 'save_failed';
}

export async function createPoolAction(input: CreatePoolInput): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await createPool(input);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errCode(e) };
  }
}

export async function updatePoolAction(input: UpdatePoolInput): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await updatePool(input);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errCode(e) };
  }
}

export async function deletePoolAction(input: { poolId: string }): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await deletePool(input.poolId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errCode(e) };
  }
}

export async function createGroupAction(input: CreateGroupInput): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await createGroup(input);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errCode(e) };
  }
}

export async function updateGroupAction(input: UpdateGroupInput): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await updateGroup(input);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errCode(e) };
  }
}

export async function deleteGroupAction(input: { groupId: string }): Promise<Result> {
  const denied = await requireManage();
  if (denied) return denied;
  try {
    await deleteGroup(input.groupId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errCode(e) };
  }
}
