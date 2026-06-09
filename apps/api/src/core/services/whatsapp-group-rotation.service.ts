import { Client } from 'pg';
import { env } from '@marketing-funnel/config';
import type { WhatsAppGroupPoolSeed, WhatsAppGroupRotationMode } from '../types';
import { ensureWhatsAppGroupTables } from '../bootstrap/ensure-whatsapp-group-tables';
import { getBusinessUnitBinding } from '../../orgs';
import { eventBus } from '../engine/event-bus';

export interface WhatsAppGroupRow {
  id: string;
  pool_id: string;
  label: string;
  invite_url: string;
  group_jid: string | null;
  position: number;
  assigned_count: number;
  member_count: number;
  is_full: boolean;
  is_active: boolean;
}

export interface WhatsAppGroupPoolRow {
  id: string;
  org_key: string;
  bu_key: string;
  pool_key: string;
  capacity: number;
  rotation_mode: WhatsAppGroupRotationMode;
}

export interface AssignResult {
  ok: true;
  inviteUrl: string;
  groupId: string;
  label: string;
  position: number;
  reused: boolean;
  poolExhausted: boolean;
}

async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  await ensureWhatsAppGroupTables();
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function getPool(
  client: Client,
  orgKey: string,
  buKey: string,
  poolKey: string,
): Promise<WhatsAppGroupPoolRow | null> {
  const res = await client.query<WhatsAppGroupPoolRow>(
    `SELECT id, org_key, bu_key, pool_key, capacity, rotation_mode
     FROM marketing.whatsapp_group_pools
     WHERE org_key = $1 AND bu_key = $2 AND pool_key = $3
     LIMIT 1`,
    [orgKey, buKey, poolKey],
  );
  return res.rows[0] ?? null;
}

/**
 * Assign a registrant to the active group of a pool. Atomic: locks the chosen
 * group row so concurrent registrations cannot over-fill a group. Idempotent by
 * phone — the same phone always gets the same group within a pool.
 */
export async function assignGroup(input: {
  orgKey: string;
  buKey: string;
  poolKey: string;
  leadId?: string | null;
  phone?: string | null;
}): Promise<AssignResult | { ok: false; reason: 'pool_not_found' | 'no_groups' }> {
  const phone = (input.phone ?? '').trim();
  const leadId = input.leadId?.trim() || null;

  return withClient(async (client) => {
    await client.query('BEGIN');
    try {
      const pool = await getPool(client, input.orgKey, input.buKey, input.poolKey);
      if (!pool) {
        await client.query('ROLLBACK');
        return { ok: false as const, reason: 'pool_not_found' as const };
      }

      // Idempotent: return existing assignment for this phone.
      if (phone) {
        const existing = await client.query<{ group_id: string }>(
          `SELECT group_id FROM marketing.whatsapp_group_assignments
           WHERE pool_id = $1 AND phone = $2 LIMIT 1`,
          [pool.id, phone],
        );
        if (existing.rows[0]) {
          if (leadId) {
            await client.query(
              `UPDATE marketing.whatsapp_group_assignments
               SET lead_id = COALESCE(lead_id, $2)
               WHERE pool_id = $1 AND phone = $3`,
              [pool.id, leadId, phone],
            );
          }
          const g = await client.query<WhatsAppGroupRow>(
            `SELECT * FROM marketing.whatsapp_groups WHERE id = $1`,
            [existing.rows[0].group_id],
          );
          await client.query('COMMIT');
          const row = g.rows[0];
          return {
            ok: true as const,
            inviteUrl: row.invite_url,
            groupId: row.id,
            label: row.label,
            position: row.position,
            reused: true,
            poolExhausted: false,
          };
        }
      }

      // Pick the active, not-full group with the lowest position (locked).
      let poolExhausted = false;
      let target = (
        await client.query<WhatsAppGroupRow>(
          `SELECT * FROM marketing.whatsapp_groups
           WHERE pool_id = $1 AND is_active = true AND is_full = false
           ORDER BY position ASC
           LIMIT 1
           FOR UPDATE`,
          [pool.id],
        )
      ).rows[0];

      // Fallback: every group is full → keep using the last active group so the
      // link still works, but flag exhaustion for monitoring.
      if (!target) {
        target = (
          await client.query<WhatsAppGroupRow>(
            `SELECT * FROM marketing.whatsapp_groups
             WHERE pool_id = $1 AND is_active = true
             ORDER BY position DESC
             LIMIT 1
             FOR UPDATE`,
            [pool.id],
          )
        ).rows[0];
        poolExhausted = true;
      }

      if (!target) {
        await client.query('ROLLBACK');
        return { ok: false as const, reason: 'no_groups' as const };
      }

      const newAssigned = target.assigned_count + 1;
      // Only auto_count mode flips is_full from the assignment counter.
      const becomesFull =
        pool.rotation_mode === 'auto_count' && newAssigned >= pool.capacity
          ? true
          : target.is_full;

      await client.query(
        `UPDATE marketing.whatsapp_groups
         SET assigned_count = $2, is_full = $3, updated_at = now()
         WHERE id = $1`,
        [target.id, newAssigned, becomesFull],
      );

      // Race-safe insert: unique (pool_id, phone) prevents double assignment.
      if (phone) {
        const ins = await client.query<{ group_id: string }>(
          `INSERT INTO marketing.whatsapp_group_assignments (pool_id, group_id, lead_id, phone)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (pool_id, phone) WHERE phone <> '' DO NOTHING
           RETURNING group_id`,
          [pool.id, target.id, leadId, phone],
        );
        if (ins.rowCount === 0) {
          // A concurrent request won the race — return its group, revert our bump.
          await client.query(
            `UPDATE marketing.whatsapp_groups
             SET assigned_count = assigned_count - 1
             WHERE id = $1`,
            [target.id],
          );
          const existing = await client.query<{ group_id: string }>(
            `SELECT group_id FROM marketing.whatsapp_group_assignments
             WHERE pool_id = $1 AND phone = $2 LIMIT 1`,
            [pool.id, phone],
          );
          const g = await client.query<WhatsAppGroupRow>(
            `SELECT * FROM marketing.whatsapp_groups WHERE id = $1`,
            [existing.rows[0].group_id],
          );
          await client.query('COMMIT');
          const row = g.rows[0];
          return {
            ok: true as const,
            inviteUrl: row.invite_url,
            groupId: row.id,
            label: row.label,
            position: row.position,
            reused: true,
            poolExhausted: false,
          };
        }
      } else {
        await client.query(
          `INSERT INTO marketing.whatsapp_group_assignments (pool_id, group_id, lead_id, phone)
           VALUES ($1, $2, $3, '')`,
          [pool.id, target.id, leadId],
        );
      }

      await client.query('COMMIT');
      return {
        ok: true as const,
        inviteUrl: target.invite_url,
        groupId: target.id,
        label: target.label,
        position: target.position,
        reused: false,
        poolExhausted,
      };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    }
  });
}

/**
 * Record a real join via an external WhatsApp connection webhook (modes B/C).
 * Matches the group by JID, bumps the real member count, marks the joiner's
 * assignment as joined, and emits a `whatsapp_group_joined` event when the
 * phone resolves to a lead.
 */
export async function recordJoin(input: {
  groupJid: string;
  phone: string;
}): Promise<{ matched: boolean; leadId?: string }> {
  const groupJid = input.groupJid.trim();
  const phone = input.phone.trim();
  if (!groupJid) return { matched: false };

  return withClient(async (client) => {
    const groupRes = await client.query<WhatsAppGroupRow>(
      `SELECT * FROM marketing.whatsapp_groups WHERE group_jid = $1 LIMIT 1`,
      [groupJid],
    );
    const group = groupRes.rows[0];
    if (!group) return { matched: false };

    const poolRes = await client.query<WhatsAppGroupPoolRow>(
      `SELECT id, org_key, bu_key, pool_key, capacity, rotation_mode
       FROM marketing.whatsapp_group_pools WHERE id = $1`,
      [group.pool_id],
    );
    const pool = poolRes.rows[0];

    const newMembers = group.member_count + 1;
    const becomesFull = pool && newMembers >= pool.capacity ? true : group.is_full;
    await client.query(
      `UPDATE marketing.whatsapp_groups
       SET member_count = $2, is_full = $3, updated_at = now()
       WHERE id = $1`,
      [group.id, newMembers, becomesFull],
    );

    if (phone) {
      await client.query(
        `UPDATE marketing.whatsapp_group_assignments
         SET joined_at = COALESCE(joined_at, now())
         WHERE pool_id = $1 AND phone = $2`,
        [group.pool_id, phone],
      );
    }

    // Resolve lead by phone within the pool's org → emit event for workflows.
    let leadId: string | undefined;
    if (pool && phone) {
      const binding = getBusinessUnitBinding(pool.org_key, pool.bu_key);
      if (binding?.organizationId) {
        const leadRes = await client.query<{ id: string }>(
          `SELECT id FROM marketing.leads
           WHERE organization_id = $1 AND phone = $2
           ORDER BY created_at DESC LIMIT 1`,
          [binding.organizationId, phone],
        );
        leadId = leadRes.rows[0]?.id;
        if (leadId) {
          eventBus.emit({
            type: 'whatsapp_group_joined',
            organizationId: binding.organizationId,
            leadId,
            metadata: {
              poolKey: pool.pool_key,
              groupId: group.id,
              groupLabel: group.label,
              groupJid,
              phone,
            },
            timestamp: new Date(),
          });
        }
      }
    }

    return { matched: true, leadId };
  });
}

/** Manual lever: mark a group full so rotation advances to the next one. */
export async function setGroupFull(groupId: string, isFull: boolean) {
  return withClient(async (client) => {
    const res = await client.query<WhatsAppGroupRow>(
      `UPDATE marketing.whatsapp_groups
       SET is_full = $2, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [groupId, isFull],
    );
    return res.rows[0] ?? null;
  });
}

/** Add (or upsert by position) a group to a pool — used by admin/DB-free edits. */
export async function addGroup(input: {
  orgKey: string;
  buKey: string;
  poolKey: string;
  label: string;
  inviteUrl: string;
  position?: number;
  groupJid?: string | null;
}) {
  return withClient(async (client) => {
    const pool = await getPool(client, input.orgKey, input.buKey, input.poolKey);
    if (!pool) return null;
    const position =
      input.position ??
      (
        await client.query<{ next: number }>(
          `SELECT COALESCE(MAX(position), 0) + 1 AS next
           FROM marketing.whatsapp_groups WHERE pool_id = $1`,
          [pool.id],
        )
      ).rows[0].next;

    const res = await client.query<WhatsAppGroupRow>(
      `INSERT INTO marketing.whatsapp_groups (pool_id, label, invite_url, group_jid, position)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (pool_id, position) DO UPDATE
         SET label = EXCLUDED.label,
             invite_url = EXCLUDED.invite_url,
             group_jid = EXCLUDED.group_jid,
             updated_at = now()
       RETURNING *`,
      [pool.id, input.label, input.inviteUrl, input.groupJid ?? null, position],
    );
    return res.rows[0];
  });
}

/** Pool state for an admin panel / monitoring. */
export async function getPoolState(orgKey: string, buKey: string, poolKey: string) {
  return withClient(async (client) => {
    const pool = await getPool(client, orgKey, buKey, poolKey);
    if (!pool) return null;
    const groups = await client.query<WhatsAppGroupRow>(
      `SELECT * FROM marketing.whatsapp_groups WHERE pool_id = $1 ORDER BY position ASC`,
      [pool.id],
    );
    return { pool, groups: groups.rows };
  });
}

/**
 * Idempotent seed from code: ensures each declared pool exists (capacity +
 * rotation mode). Initial groups are inserted ONLY when the pool has none, so
 * live DB edits (links added/edited by hand) always win on subsequent boots.
 */
export async function seedWhatsAppGroupPools(seeds: WhatsAppGroupPoolSeed[]) {
  if (!seeds.length) return;
  await withClient(async (client) => {
    for (const seed of seeds) {
      const capacity = seed.capacity ?? 500;
      const rotationMode: WhatsAppGroupRotationMode = seed.rotationMode ?? 'auto_count';
      const label = seed.label ?? '';
      const launchCode = seed.launchCode ?? null;
      const poolRes = await client.query<{ id: string }>(
        `INSERT INTO marketing.whatsapp_group_pools (org_key, bu_key, pool_key, capacity, rotation_mode, label, launch_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (org_key, bu_key, pool_key) DO UPDATE
           SET capacity = EXCLUDED.capacity,
               rotation_mode = EXCLUDED.rotation_mode,
               -- never clobber live admin edits with empty seed values
               label = CASE WHEN EXCLUDED.label <> '' THEN EXCLUDED.label ELSE marketing.whatsapp_group_pools.label END,
               launch_code = COALESCE(EXCLUDED.launch_code, marketing.whatsapp_group_pools.launch_code),
               updated_at = now()
         RETURNING id`,
        [seed.orgKey, seed.buKey, seed.poolKey, capacity, rotationMode, label, launchCode],
      );
      const poolId = poolRes.rows[0].id;

      const count = await client.query<{ n: string }>(
        `SELECT COUNT(*)::int AS n FROM marketing.whatsapp_groups WHERE pool_id = $1`,
        [poolId],
      );
      const hasGroups = Number(count.rows[0].n) > 0;
      const validGroups = seed.groups.filter((g) => g.inviteUrl && g.inviteUrl.trim());
      if (!hasGroups && validGroups.length) {
        for (const g of validGroups) {
          await client.query(
            `INSERT INTO marketing.whatsapp_groups (pool_id, label, invite_url, group_jid, position)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (pool_id, position) DO NOTHING`,
            [poolId, g.label, g.inviteUrl.trim(), g.groupJid ?? null, g.position],
          );
        }
        console.info(
          `[whatsapp-groups] seeded ${validGroups.length} group(s) for ${seed.orgKey}/${seed.buKey}/${seed.poolKey}`,
        );
      }
    }
  });
}
