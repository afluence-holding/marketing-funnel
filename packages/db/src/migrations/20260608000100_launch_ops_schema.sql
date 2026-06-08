-- ============================================================================
-- Migration: launch_ops — Launch Operations Tracker (ADDITIVE, greenfield)
-- ----------------------------------------------------------------------------
-- Modular launch/checklist tracker for apps/admin. Seeded from a launch's
-- operations doc (e.g. DI21-C2-Centro-Operaciones). Designed to be agnostic:
-- a "launch" can belong to any tenant/creator; nothing here couples to
-- marketing or meta_ops (loose link via launch.organizer_slug / bu_slug).
--
-- Entities:
--   launch          one row per launch (DI21-C2, etc.)
--   phase           F0..F5 (ordered)
--   task            the 58 ops tasks (+ version for optimistic lock)
--   task_step       ordered checklist steps inside a task
--   task_owner      M:N task <-> owner (owner_key text; optional profile_id)
--   dependency      structured (depends_on_task_id) + free-text note fallback
--   kpi             launch scorecard (registros, show-up, buyers, %HT, ROAS, rev)
--   resource        centralized links (landings, comms, tracking, assets, docs)
--   status_history  append-only status transitions (human/agent/system)
--   comment         notes on tasks (human/agent)
--   audit_log       append-only agent/human mutation log
--   idempotency_key store for safe agent retries
--
-- Safety: idempotent, RLS from migration 1, service_role bypass, no cross-schema
-- writes. Realtime publication added for `task` (guarded).
--
-- Run in Supabase SQL Editor after 20260608000000_backoffice_identity.sql.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS launch_ops;
GRANT USAGE ON SCHEMA launch_ops TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- launch
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.launch (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid REFERENCES backoffice.tenant(id) ON DELETE SET NULL,
  code           text NOT NULL UNIQUE,           -- e.g. 'DI21-C2'
  name           text NOT NULL,
  brand          text,                            -- e.g. 'german-roz'
  organizer_slug text,                            -- loose link to meta_ops/web
  bu_slug        text,
  status         text NOT NULL DEFAULT 'active'
                   CHECK (status IN ('planning', 'active', 'closed', 'archived')),
  starts_on      date,
  ends_on        date,
  config         jsonb NOT NULL DEFAULT '{}'::jsonb,  -- dates, price ladder, thesis
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- phase
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.phase (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id  uuid NOT NULL REFERENCES launch_ops.launch(id) ON DELETE CASCADE,
  code       text NOT NULL,                      -- 'F0'..'F5'
  name       text NOT NULL,
  position   int  NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (launch_id, code)
);

-- ----------------------------------------------------------------------------
-- task
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.task (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id          uuid NOT NULL REFERENCES launch_ops.launch(id) ON DELETE CASCADE,
  phase_id           uuid NOT NULL REFERENCES launch_ops.phase(id) ON DELETE CASCADE,
  source_index       int,                        -- stable 1-based index from seed (dep refs)
  title              text NOT NULL,
  objective          text,
  definition_of_done text,                        -- "Listo cuando: ..."
  channel            text,                        -- IG, Email, Meta Ads, Whop, ...
  workstream         text CHECK (workstream IN ('organico', 'inorganico', 'infra')),
  due_label          text,                        -- raw human label ("7-9jun", "HOY")
  due_start          date,
  due_end            date,
  status             text NOT NULL DEFAULT 'todo'
                       CHECK (status IN ('todo', 'doing', 'blocked', 'done')),
  progress_pct       int NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  position           int NOT NULL DEFAULT 0,
  version            int NOT NULL DEFAULT 1,      -- optimistic lock (If-Match)
  created_by         text,
  updated_by         text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS task_launch_idx ON launch_ops.task (launch_id);
CREATE INDEX IF NOT EXISTS task_phase_idx  ON launch_ops.task (phase_id);
CREATE INDEX IF NOT EXISTS task_status_idx ON launch_ops.task (launch_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS task_launch_source_idx
  ON launch_ops.task (launch_id, source_index) WHERE source_index IS NOT NULL;

-- ----------------------------------------------------------------------------
-- task_step
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.task_step (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id   uuid NOT NULL REFERENCES launch_ops.task(id) ON DELETE CASCADE,
  position  int NOT NULL DEFAULT 0,
  body      text NOT NULL,
  done      boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS task_step_task_idx ON launch_ops.task_step (task_id);

-- ----------------------------------------------------------------------------
-- task_owner (owner_key is agnostic; profile_id optional once identities exist)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.task_owner (
  task_id    uuid NOT NULL REFERENCES launch_ops.task(id) ON DELETE CASCADE,
  owner_key  text NOT NULL,                       -- 'nico','mau','german','tomas','elba'
  profile_id uuid REFERENCES backoffice.profile(id) ON DELETE SET NULL,
  PRIMARY KEY (task_id, owner_key)
);

-- ----------------------------------------------------------------------------
-- dependency (structured + free-text note)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.dependency (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id           uuid NOT NULL REFERENCES launch_ops.task(id) ON DELETE CASCADE,
  depends_on_task_id uuid REFERENCES launch_ops.task(id) ON DELETE SET NULL,
  note              text                          -- e.g. "Rescatado del playbook"
);
CREATE INDEX IF NOT EXISTS dependency_task_idx ON launch_ops.dependency (task_id);

-- ----------------------------------------------------------------------------
-- kpi (scorecard)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.kpi (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id    uuid NOT NULL REFERENCES launch_ops.launch(id) ON DELETE CASCADE,
  key          text NOT NULL,                     -- 'registros','show_up',...
  label        text NOT NULL,
  target_label text,
  value        numeric,
  unit         text,                              -- '%','$','#'
  is_computed  boolean NOT NULL DEFAULT false,
  formula      text,
  position     int NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (launch_id, key)
);

-- ----------------------------------------------------------------------------
-- resource (centralized links)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.resource (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id  uuid NOT NULL REFERENCES launch_ops.launch(id) ON DELETE CASCADE,
  category   text NOT NULL,                       -- 'landings','comms','tracking','assets','docs'
  key        text NOT NULL,                       -- stable id e.g. 'l_checkout'
  label      text NOT NULL,
  owner_key  text,
  url        text,
  status     text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'ready')),
  position   int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (launch_id, key)
);

-- ----------------------------------------------------------------------------
-- status_history (append-only)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid NOT NULL REFERENCES launch_ops.task(id) ON DELETE CASCADE,
  from_status text,
  to_status   text NOT NULL,
  actor       text,                               -- 'nico' | 'claude:launch-ops-agent'
  actor_type  text NOT NULL DEFAULT 'human'
                CHECK (actor_type IN ('human', 'agent', 'system')),
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS status_history_task_idx ON launch_ops.status_history (task_id);

-- ----------------------------------------------------------------------------
-- comment
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.comment (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    uuid NOT NULL REFERENCES launch_ops.task(id) ON DELETE CASCADE,
  body       text NOT NULL,
  kind       text NOT NULL DEFAULT 'note',
  actor      text,
  actor_type text NOT NULL DEFAULT 'human'
               CHECK (actor_type IN ('human', 'agent', 'system')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comment_task_idx ON launch_ops.comment (task_id);

-- ----------------------------------------------------------------------------
-- audit_log (append-only) + idempotency_key
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launch_ops.audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor           text,
  actor_type      text NOT NULL DEFAULT 'human'
                    CHECK (actor_type IN ('human', 'agent', 'system')),
  action          text NOT NULL,
  entity          text,
  entity_id       uuid,
  idempotency_key text,
  request         jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON launch_ops.audit_log (entity, entity_id);

CREATE TABLE IF NOT EXISTS launch_ops.idempotency_key (
  key        text PRIMARY KEY,
  scope      text,
  response   jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- Triggers: updated_at, version bump, status history
-- ============================================================================
CREATE OR REPLACE FUNCTION launch_ops.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION launch_ops.task_before_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  -- bump version on any meaningful change (optimistic lock)
  IF NEW.version = OLD.version THEN
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION launch_ops.task_after_status_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO launch_ops.status_history (task_id, from_status, to_status, actor, actor_type)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.updated_by,
            CASE WHEN NEW.updated_by LIKE 'claude:%' OR NEW.updated_by LIKE '%:agent'
                 THEN 'agent' ELSE 'human' END);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS launch_touch ON launch_ops.launch;
CREATE TRIGGER launch_touch BEFORE UPDATE ON launch_ops.launch
  FOR EACH ROW EXECUTE FUNCTION launch_ops.touch_updated_at();

DROP TRIGGER IF EXISTS task_before_upd ON launch_ops.task;
CREATE TRIGGER task_before_upd BEFORE UPDATE ON launch_ops.task
  FOR EACH ROW EXECUTE FUNCTION launch_ops.task_before_update();

DROP TRIGGER IF EXISTS task_status_hist ON launch_ops.task;
CREATE TRIGGER task_status_hist AFTER UPDATE ON launch_ops.task
  FOR EACH ROW EXECUTE FUNCTION launch_ops.task_after_status_change();

DROP TRIGGER IF EXISTS kpi_touch ON launch_ops.kpi;
CREATE TRIGGER kpi_touch BEFORE UPDATE ON launch_ops.kpi
  FOR EACH ROW EXECUTE FUNCTION launch_ops.touch_updated_at();

DROP TRIGGER IF EXISTS resource_touch ON launch_ops.resource;
CREATE TRIGGER resource_touch BEFORE UPDATE ON launch_ops.resource
  FOR EACH ROW EXECUTE FUNCTION launch_ops.touch_updated_at();

-- ============================================================================
-- RLS — every table gated by tenant via the launch it belongs to.
-- service_role bypasses. Reads: can_read_tenant. Writes: can_write_module('launch').
-- ============================================================================
ALTER TABLE launch_ops.launch          ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.phase           ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.task            ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.task_step       ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.task_owner      ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.dependency      ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.kpi             ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.resource        ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.status_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.comment         ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.audit_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_ops.idempotency_key ENABLE ROW LEVEL SECURITY;

-- Helper: can the caller read the launch a task belongs to?
CREATE OR REPLACE FUNCTION launch_ops.can_read_launch(p_launch_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = launch_ops, backoffice, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM launch_ops.launch l
    WHERE l.id = p_launch_id
      AND (l.tenant_id IS NULL AND backoffice.is_afluence()
           OR backoffice.can_read_tenant(l.tenant_id))
  );
$$;

CREATE OR REPLACE FUNCTION launch_ops.can_write_launch(p_launch_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = launch_ops, backoffice, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM launch_ops.launch l
    WHERE l.id = p_launch_id
      AND (l.tenant_id IS NULL AND backoffice.is_afluence_admin()
           OR backoffice.can_write_module(l.tenant_id, 'launch'))
  );
$$;

REVOKE ALL ON FUNCTION launch_ops.can_read_launch(uuid)  FROM PUBLIC;
REVOKE ALL ON FUNCTION launch_ops.can_write_launch(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION launch_ops.can_read_launch(uuid)  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION launch_ops.can_write_launch(uuid) TO authenticated, service_role;

-- launch
DROP POLICY IF EXISTS launch_read ON launch_ops.launch;
CREATE POLICY launch_read ON launch_ops.launch
  FOR SELECT TO authenticated
  USING (tenant_id IS NULL AND backoffice.is_afluence()
         OR backoffice.can_read_tenant(tenant_id));
DROP POLICY IF EXISTS launch_write ON launch_ops.launch;
CREATE POLICY launch_write ON launch_ops.launch
  FOR ALL TO authenticated
  USING (tenant_id IS NULL AND backoffice.is_afluence_admin()
         OR backoffice.can_write_module(tenant_id, 'launch'))
  WITH CHECK (tenant_id IS NULL AND backoffice.is_afluence_admin()
         OR backoffice.can_write_module(tenant_id, 'launch'));

-- child tables: read/write gated by parent launch
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['phase','task','kpi','resource'] LOOP
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

-- grandchild tables (gated through task -> launch)
CREATE OR REPLACE FUNCTION launch_ops.task_launch_id(p_task_id uuid)
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = launch_ops, pg_temp
AS $$ SELECT launch_id FROM launch_ops.task WHERE id = p_task_id $$;
REVOKE ALL ON FUNCTION launch_ops.task_launch_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION launch_ops.task_launch_id(uuid) TO authenticated, service_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['task_step','task_owner','dependency','status_history','comment'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_read ON launch_ops.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_read ON launch_ops.%I FOR SELECT TO authenticated USING (launch_ops.can_read_launch(launch_ops.task_launch_id(task_id)))',
      t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_write ON launch_ops.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_write ON launch_ops.%I FOR ALL TO authenticated USING (launch_ops.can_write_launch(launch_ops.task_launch_id(task_id))) WITH CHECK (launch_ops.can_write_launch(launch_ops.task_launch_id(task_id)))',
      t, t);
  END LOOP;
END $$;

-- audit_log + idempotency_key: service/staff only (no creator reads)
DROP POLICY IF EXISTS audit_read ON launch_ops.audit_log;
CREATE POLICY audit_read ON launch_ops.audit_log
  FOR SELECT TO authenticated USING (backoffice.is_afluence());
DROP POLICY IF EXISTS idem_read ON launch_ops.idempotency_key;
CREATE POLICY idem_read ON launch_ops.idempotency_key
  FOR SELECT TO authenticated USING (backoffice.is_afluence());

-- ============================================================================
-- Grants
-- ============================================================================
GRANT ALL    ON ALL TABLES    IN SCHEMA launch_ops TO service_role;
GRANT SELECT ON ALL TABLES    IN SCHEMA launch_ops TO authenticated;
GRANT ALL    ON ALL SEQUENCES IN SCHEMA launch_ops TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA launch_ops GRANT ALL    ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA launch_ops GRANT SELECT ON TABLES TO authenticated;

-- ============================================================================
-- Realtime: stream task changes to subscribed clients (guarded).
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'launch_ops' AND tablename = 'task'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE launch_ops.task;
    END IF;
  END IF;
END $$;

ALTER TABLE launch_ops.task REPLICA IDENTITY FULL;
