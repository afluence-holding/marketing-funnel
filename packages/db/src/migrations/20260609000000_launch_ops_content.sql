-- ============================================================================
-- Migration: launch_ops content — Calendario + Mensajes (ADDITIVE)
-- ----------------------------------------------------------------------------
-- Adds two creator-agnostic content tables to the existing launch_ops schema so
-- the admin "Centro de Operaciones" can render the Calendario (content plan) and
-- Mensajes (copy assets) modules from the launch's operations doc.
--
--   content_item   one planned content unit (reel/story/email/message/sequence/
--                  matrix_row/milestone) for the launch's calendar.
--   message_asset  one strategy copy asset (status + file path + linked tasks).
--
-- Safety: additive only. New tables, RLS via existing launch_ops.can_read_launch
-- / can_write_launch helpers (same model as task/kpi/resource). service_role
-- bypasses RLS. No changes to existing tables. Idempotent.
--
-- Run after 20260608000100_launch_ops_schema.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- content_item — Calendario
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.content_item (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id   uuid NOT NULL REFERENCES launch_ops.launch(id) ON DELETE CASCADE,
  phase_id    uuid REFERENCES launch_ops.phase(id) ON DELETE SET NULL,
  day         date,                                  -- nullable: ranges/narratives
  day_label   text,                                  -- e.g. 'Sáb 6'
  channel     text,                                  -- 'IG Orgánico','Email',...
  kind        text NOT NULL DEFAULT 'message'
                CHECK (kind IN ('reel','story','email','message',
                                'sequence','matrix_row','milestone')),
  stage_label text,                                  -- 'PRE','$67','$77','$87','CIERRE'
  title       text NOT NULL,
  body        text,
  status      text NOT NULL DEFAULT 'planned'
                CHECK (status IN ('planned','ready','published')),
  position    int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_item_launch_idx  ON launch_ops.content_item (launch_id, position);
CREATE INDEX IF NOT EXISTS content_item_kind_idx    ON launch_ops.content_item (launch_id, kind);
CREATE INDEX IF NOT EXISTS content_item_channel_idx ON launch_ops.content_item (launch_id, channel);

-- ----------------------------------------------------------------------------
-- message_asset — Mensajes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.message_asset (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id  uuid NOT NULL REFERENCES launch_ops.launch(id) ON DELETE CASCADE,
  key        text NOT NULL,                          -- stable id
  title      text NOT NULL,
  channel    text,                                   -- grouping label
  status     text NOT NULL DEFAULT 'todo'
               CHECK (status IN ('ready','todo')),
  file_path  text,                                   -- e.g. '03-launch/.../Guion.md'
  summary    text,
  task_refs  int[] NOT NULL DEFAULT '{}',            -- source_index refs into task
  position   int  NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (launch_id, key)
);

CREATE INDEX IF NOT EXISTS message_asset_launch_idx ON launch_ops.message_asset (launch_id, position);

-- ----------------------------------------------------------------------------
-- touch triggers (reuse launch_ops.touch_updated_at from migration 1)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS content_item_touch  ON launch_ops.content_item;
CREATE TRIGGER content_item_touch  BEFORE UPDATE ON launch_ops.content_item
  FOR EACH ROW EXECUTE FUNCTION launch_ops.touch_updated_at();

DROP TRIGGER IF EXISTS message_asset_touch ON launch_ops.message_asset;
CREATE TRIGGER message_asset_touch BEFORE UPDATE ON launch_ops.message_asset
  FOR EACH ROW EXECUTE FUNCTION launch_ops.touch_updated_at();

-- ----------------------------------------------------------------------------
-- RLS — same model as task/kpi/resource (gated by parent launch)
-- ----------------------------------------------------------------------------
ALTER TABLE launch_ops.content_item  ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.message_asset ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['content_item','message_asset'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_read ON launch_ops.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_read ON launch_ops.%I FOR SELECT TO authenticated USING (launch_ops.can_read_launch(launch_id))',
      t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_write ON launch_ops.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_write ON launch_ops.%I FOR ALL TO authenticated USING (launch_ops.can_write_launch(launch_id)) WITH CHECK (launch_ops.can_write_launch(launch_id))',
      t, t);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- Grants (match schema defaults)
-- ----------------------------------------------------------------------------
GRANT ALL    ON launch_ops.content_item  TO service_role;
GRANT SELECT ON launch_ops.content_item  TO authenticated;
GRANT ALL    ON launch_ops.message_asset TO service_role;
GRANT SELECT ON launch_ops.message_asset TO authenticated;
