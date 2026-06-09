/**
 * WhatsApp Groups repository — reads/writes the rotation pool + group rows in
 * the `marketing` schema via the service-role client (same pattern as the other
 * admin modules). The runtime assignment/rotation logic stays in the Express API
 * (`whatsapp-group-rotation.service.ts`); this module only manages configuration
 * (pools) and the group invite rows. It NEVER touches assignments, so changing
 * groups here is safe for live registrations.
 */
import { getSupabaseMarketing, getSupabaseLaunchOps } from '@/lib/supabase/server';
import type {
  CohortOption,
  RotationMode,
  WaGroup,
  WaGroupsOverview,
  WaPool,
} from './types';

const POOLS = 'whatsapp_group_pools';
const GROUPS = 'whatsapp_groups';

/**
 * Admin BU slug → rotation pool `bu_key`. The landing/API key pools under the
 * code-first buKey (e.g. german-roz/main) while the admin route uses the unified
 * slug (di21). Map here so the module targets the live pools WITHOUT touching the
 * landing's assign path. Identity by default.
 */
const POOL_BU_ALIAS: Record<string, string> = {
  'german-roz/di21': 'main',
};

export function resolvePoolScope(organizer: string, bu: string): { orgKey: string; buKey: string } {
  return { orgKey: organizer, buKey: POOL_BU_ALIAS[`${organizer}/${bu}`] ?? bu };
}

/** Normalize a WhatsApp invite link to its canonical form, or throw. */
export function normalizeInviteUrl(raw: string): string {
  const url = (raw ?? '').trim();
  const m = url.match(/^https:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]{6,})/);
  if (!m) throw new Error('invalid_invite_url');
  return `https://chat.whatsapp.com/${m[1]}`;
}

type PoolRow = {
  id: string;
  org_key: string;
  bu_key: string;
  pool_key: string;
  label: string | null;
  launch_code: string | null;
  capacity: number;
  rotation_mode: RotationMode;
  is_active: boolean;
};

type GroupRow = {
  id: string;
  pool_id: string;
  label: string | null;
  invite_url: string;
  group_jid: string | null;
  position: number;
  assigned_count: number;
  member_count: number;
  is_full: boolean;
  is_active: boolean;
};

function mapGroup(r: GroupRow): WaGroup {
  return {
    id: r.id,
    poolId: r.pool_id,
    label: r.label ?? '',
    inviteUrl: r.invite_url,
    groupJid: r.group_jid,
    position: r.position,
    assignedCount: r.assigned_count,
    memberCount: r.member_count,
    isFull: r.is_full,
    isActive: r.is_active,
  };
}

function mapPool(r: PoolRow, groups: WaGroup[]): WaPool {
  return {
    id: r.id,
    orgKey: r.org_key,
    buKey: r.bu_key,
    poolKey: r.pool_key,
    label: r.label ?? '',
    launchCode: r.launch_code,
    capacity: r.capacity,
    rotationMode: r.rotation_mode,
    isActive: r.is_active,
    groups,
    assignedTotal: groups.reduce((sum, g) => sum + g.assignedCount, 0),
  };
}

/** Cohorts (launches) for the org → the pool↔launch linkage dropdown. */
async function listCohorts(organizer: string): Promise<CohortOption[]> {
  try {
    const db = getSupabaseLaunchOps();
    const { data } = await db
      .from('launch')
      .select('code, name')
      .eq('organizer_slug', organizer)
      .order('created_at', { ascending: false });
    return ((data ?? []) as Array<{ code: string; name: string }>).map((l) => ({
      code: l.code,
      name: l.name,
    }));
  } catch {
    return [];
  }
}

/** Load every pool (with its groups) for a tenant + the cohort options. */
export async function getWaGroupsOverview(organizer: string, bu: string): Promise<WaGroupsOverview> {
  const { orgKey, buKey } = resolvePoolScope(organizer, bu);
  const db = getSupabaseMarketing();

  const [{ data: poolRows }, cohorts] = await Promise.all([
    db
      .from(POOLS)
      .select('*')
      .eq('org_key', orgKey)
      .eq('bu_key', buKey)
      .order('created_at', { ascending: true }),
    listCohorts(organizer),
  ]);

  const pools = (poolRows ?? []) as PoolRow[];
  const ids = pools.map((p) => p.id);

  let groupsByPool = new Map<string, WaGroup[]>();
  if (ids.length) {
    const { data: groupRows } = await db
      .from(GROUPS)
      .select('*')
      .in('pool_id', ids)
      .order('position', { ascending: true });
    groupsByPool = ((groupRows ?? []) as GroupRow[]).reduce((map, row) => {
      const list = map.get(row.pool_id) ?? [];
      list.push(mapGroup(row));
      map.set(row.pool_id, list);
      return map;
    }, new Map<string, WaGroup[]>());
  }

  return {
    organizer,
    bu,
    orgKey,
    buKey,
    pools: pools.map((p) => mapPool(p, groupsByPool.get(p.id) ?? [])),
    cohorts,
  };
}

/* ----------------------------- Pool mutations ----------------------------- */

export interface CreatePoolInput {
  organizer: string;
  bu: string;
  poolKey: string;
  label: string;
  launchCode?: string | null;
  capacity?: number;
  rotationMode?: RotationMode;
}

export async function createPool(input: CreatePoolInput): Promise<{ id: string }> {
  const poolKey = input.poolKey.trim();
  if (!/^[a-z0-9][a-z0-9._-]{1,80}$/i.test(poolKey)) throw new Error('invalid_pool_key');
  if (!input.label.trim()) throw new Error('missing_label');
  const { orgKey, buKey } = resolvePoolScope(input.organizer, input.bu);
  const db = getSupabaseMarketing();
  const { data, error } = await db
    .from(POOLS)
    .insert({
      org_key: orgKey,
      bu_key: buKey,
      pool_key: poolKey,
      label: input.label.trim(),
      launch_code: input.launchCode?.trim() || null,
      capacity: input.capacity ?? 500,
      rotation_mode: input.rotationMode ?? 'auto_count',
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: (data as { id: string }).id };
}

export interface UpdatePoolInput {
  poolId: string;
  label?: string;
  launchCode?: string | null;
  capacity?: number;
  rotationMode?: RotationMode;
  isActive?: boolean;
}

export async function updatePool(input: UpdatePoolInput): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.label !== undefined) {
    if (!input.label.trim()) throw new Error('missing_label');
    patch.label = input.label.trim();
  }
  if (input.launchCode !== undefined) patch.launch_code = input.launchCode?.trim() || null;
  if (input.capacity !== undefined) {
    if (!Number.isFinite(input.capacity) || input.capacity < 1) throw new Error('invalid_capacity');
    patch.capacity = Math.floor(input.capacity);
  }
  if (input.rotationMode !== undefined) patch.rotation_mode = input.rotationMode;
  if (input.isActive !== undefined) patch.is_active = input.isActive;

  const db = getSupabaseMarketing();
  const { error } = await db.from(POOLS).update(patch).eq('id', input.poolId);
  if (error) throw error;
}

/** Hard-delete a pool — only when it has no assignments (protects live data). */
export async function deletePool(poolId: string): Promise<void> {
  const db = getSupabaseMarketing();
  const { count, error: countErr } = await db
    .from('whatsapp_group_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('pool_id', poolId);
  if (countErr) throw countErr;
  if ((count ?? 0) > 0) throw new Error('pool_has_assignments');
  const { error } = await db.from(POOLS).delete().eq('id', poolId);
  if (error) throw error;
}

/* ----------------------------- Group mutations ---------------------------- */

export interface CreateGroupInput {
  poolId: string;
  label?: string;
  inviteUrl: string;
  groupJid?: string | null;
  position?: number;
}

export async function createGroup(input: CreateGroupInput): Promise<{ id: string }> {
  const inviteUrl = normalizeInviteUrl(input.inviteUrl);
  const db = getSupabaseMarketing();

  let position = input.position;
  if (position == null) {
    const { data } = await db
      .from(GROUPS)
      .select('position')
      .eq('pool_id', input.poolId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    position = ((data as { position?: number } | null)?.position ?? 0) + 1;
  }

  const label = input.label?.trim() || `Grupo ${position}`;
  const { data, error } = await db
    .from(GROUPS)
    .insert({
      pool_id: input.poolId,
      label,
      invite_url: inviteUrl,
      group_jid: input.groupJid?.trim() || null,
      position,
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: (data as { id: string }).id };
}

export interface UpdateGroupInput {
  groupId: string;
  label?: string;
  inviteUrl?: string;
  groupJid?: string | null;
  position?: number;
  isFull?: boolean;
  isActive?: boolean;
}

export async function updateGroup(input: UpdateGroupInput): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.label !== undefined) patch.label = input.label.trim() || 'Grupo';
  if (input.inviteUrl !== undefined) patch.invite_url = normalizeInviteUrl(input.inviteUrl);
  if (input.groupJid !== undefined) patch.group_jid = input.groupJid?.trim() || null;
  if (input.position !== undefined) {
    if (!Number.isInteger(input.position) || input.position < 1) throw new Error('invalid_position');
    patch.position = input.position;
  }
  if (input.isFull !== undefined) patch.is_full = input.isFull;
  if (input.isActive !== undefined) patch.is_active = input.isActive;

  const db = getSupabaseMarketing();
  const { error } = await db.from(GROUPS).update(patch).eq('id', input.groupId);
  if (error) throw error;
}

/**
 * Hard-delete a group — only when it has no assignments. The assignments FK is
 * ON DELETE CASCADE, so deleting a group with registrants would silently drop
 * their idempotent phone→group mapping. Refuse and let the admin deactivate
 * (is_active=false) instead, which keeps history and removes it from rotation.
 */
export async function deleteGroup(groupId: string): Promise<void> {
  const db = getSupabaseMarketing();
  const { count, error: countErr } = await db
    .from('whatsapp_group_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('group_id', groupId);
  if (countErr) throw countErr;
  if ((count ?? 0) > 0) throw new Error('group_has_assignments');
  const { error } = await db.from(GROUPS).delete().eq('id', groupId);
  if (error) throw error;
}
