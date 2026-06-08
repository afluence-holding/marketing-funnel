import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

let ensured = false;

const INLINE_SQL = `
CREATE TABLE IF NOT EXISTS marketing.whatsapp_group_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_key text NOT NULL,
  bu_key text NOT NULL,
  pool_key text NOT NULL,
  capacity integer NOT NULL DEFAULT 500,
  rotation_mode text NOT NULL DEFAULT 'auto_count'
    CHECK (rotation_mode IN ('manual', 'auto_count', 'join_webhook')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_group_pools_key_unique
  ON marketing.whatsapp_group_pools (org_key, bu_key, pool_key);

CREATE TABLE IF NOT EXISTS marketing.whatsapp_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES marketing.whatsapp_group_pools(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  invite_url text NOT NULL,
  group_jid text,
  position integer NOT NULL DEFAULT 1,
  assigned_count integer NOT NULL DEFAULT 0,
  member_count integer NOT NULL DEFAULT 0,
  is_full boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_groups_pool_position_unique
  ON marketing.whatsapp_groups (pool_id, position);

CREATE INDEX IF NOT EXISTS whatsapp_groups_pool_active_idx
  ON marketing.whatsapp_groups (pool_id, is_active, is_full, position);

CREATE INDEX IF NOT EXISTS whatsapp_groups_jid_idx
  ON marketing.whatsapp_groups (group_jid)
  WHERE group_jid IS NOT NULL;

CREATE TABLE IF NOT EXISTS marketing.whatsapp_group_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES marketing.whatsapp_group_pools(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES marketing.whatsapp_groups(id) ON DELETE CASCADE,
  lead_id uuid,
  phone text NOT NULL DEFAULT '',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_group_assignments_pool_phone_unique
  ON marketing.whatsapp_group_assignments (pool_id, phone)
  WHERE phone <> '';

CREATE INDEX IF NOT EXISTS whatsapp_group_assignments_group_idx
  ON marketing.whatsapp_group_assignments (group_id);

CREATE INDEX IF NOT EXISTS whatsapp_group_assignments_lead_idx
  ON marketing.whatsapp_group_assignments (lead_id)
  WHERE lead_id IS NOT NULL;
`;

export async function ensureWhatsAppGroupTables() {
  if (ensured) return;

  const migrationPath = path.join(
    process.cwd(),
    'packages/db/src/migrations/20260610000000_whatsapp_group_rotation.sql',
  );
  const sql = fs.existsSync(migrationPath)
    ? fs.readFileSync(migrationPath, 'utf-8')
    : INLINE_SQL;

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(sql);
    ensured = true;
    console.info('[whatsapp-groups] whatsapp group rotation tables ensured');
  } finally {
    await client.end();
  }
}
