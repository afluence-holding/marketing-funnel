-- WhatsApp group rotation pools (multi-BU, multi-cohort).
--
-- Idempotent and additive. This is the committed source of truth for the tables
-- previously created only by the API bootstrap (ensure-whatsapp-group-tables.ts).
-- The bootstrap loads THIS file when present, so it runs on every API boot.
--
-- Model: a POOL is scoped by (org_key, bu_key, pool_key) and owns N GROUPS
-- (invite links rotated by capacity). A pool optionally links to a launch/cohort
-- via `launch_code` (launch_ops.launch.code, e.g. 'DI21-C2') so the admin module
-- can group pools per cohort.

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

-- Additive: human label + cohort linkage + soft-disable.
ALTER TABLE marketing.whatsapp_group_pools
  ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT '';
ALTER TABLE marketing.whatsapp_group_pools
  ADD COLUMN IF NOT EXISTS launch_code text;
ALTER TABLE marketing.whatsapp_group_pools
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS whatsapp_group_pools_launch_idx
  ON marketing.whatsapp_group_pools (launch_code)
  WHERE launch_code IS NOT NULL;

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
