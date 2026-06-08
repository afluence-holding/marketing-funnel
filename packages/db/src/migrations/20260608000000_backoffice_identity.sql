-- ============================================================================
-- Migration: backoffice identity layer (ADDITIVE — does NOT touch marketing/meta_ops)
-- ----------------------------------------------------------------------------
-- Purpose: shared identity + multi-tenant primitives for apps/admin back office.
--   - profile           : 1:1 with auth.users (afluence staff | creator | service)
--   - tenant            : a client workspace (loosely mapped to organizer/bu by slug)
--   - tenant_membership : which users can read/write which tenant + which modules
--   - afluence_membership: internal staff roles (admin/director/member)
--   - service_identity  : non-human actors (e.g. Claude launch-ops agent)
--
-- Safety:
--   - Fully idempotent (IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).
--   - No changes to existing schemas or tables.
--   - RLS enabled from migration 1. service_role bypasses RLS (Supabase default).
--   - Helper functions are SECURITY DEFINER with a pinned search_path.
--
-- Run in Supabase SQL Editor. Re-runnable.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS backoffice;

GRANT USAGE ON SCHEMA backoffice TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- profile : one row per identity. id == auth.users.id for human/login users.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS backoffice.profile (
  id           uuid PRIMARY KEY,
  user_kind    text NOT NULL DEFAULT 'afluence'
                 CHECK (user_kind IN ('afluence', 'creator', 'service')),
  display_name text,
  handle       text UNIQUE,
  email        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- tenant : a client workspace. Loosely coupled to meta_ops/marketing via slugs
--          (no cross-schema FK on purpose — keeps this layer agnostic).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS backoffice.tenant (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE,
  name              text NOT NULL,
  organizer_slug    text,
  bu_slug           text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- afluence_membership : internal staff roles. Presence => user is afluence staff.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS backoffice.afluence_membership (
  user_id    uuid PRIMARY KEY REFERENCES backoffice.profile(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'member'
               CHECK (role IN ('admin', 'director', 'member')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- tenant_membership : scoped access for any user (esp. creators) to a tenant.
--   modules: jsonb array of enabled modules, e.g. ["launch","responses"] or ["*"].
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS backoffice.tenant_membership (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES backoffice.tenant(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES backoffice.profile(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'viewer'
               CHECK (role IN ('owner', 'editor', 'viewer')),
  modules    jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS tenant_membership_user_idx
  ON backoffice.tenant_membership (user_id, tenant_id);

-- ----------------------------------------------------------------------------
-- service_identity : non-human actors. token_hash = sha256(token). Never store raw.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS backoffice.service_identity (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,            -- e.g. 'claude:launch-ops-agent'
  name         text NOT NULL,
  token_hash   text,                            -- sha256 hex; rotate by replacing
  scopes       text[] NOT NULL DEFAULT '{}',    -- e.g. {tasks:read,status:write}
  tenant_id    uuid REFERENCES backoffice.tenant(id) ON DELETE SET NULL,
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

-- ============================================================================
-- Helper functions (SECURITY DEFINER, pinned search_path) — used by RLS in
-- this and other schemas (launch_ops). Avoids recursive RLS on membership.
-- ============================================================================

CREATE OR REPLACE FUNCTION backoffice.current_user_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = backoffice, pg_temp
AS $$ SELECT auth.uid() $$;

CREATE OR REPLACE FUNCTION backoffice.is_afluence()
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = backoffice, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM backoffice.profile p
    WHERE p.id = auth.uid()
      AND p.user_kind = 'afluence'
  );
$$;

CREATE OR REPLACE FUNCTION backoffice.is_afluence_admin()
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = backoffice, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM backoffice.afluence_membership m
    WHERE m.user_id = auth.uid()
      AND m.role IN ('admin', 'director')
  );
$$;

CREATE OR REPLACE FUNCTION backoffice.can_read_tenant(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = backoffice, pg_temp
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND (
      backoffice.is_afluence()
      OR EXISTS (
        SELECT 1 FROM backoffice.tenant_membership tm
        WHERE tm.user_id = auth.uid()
          AND tm.tenant_id = p_tenant_id
      )
    );
$$;

CREATE OR REPLACE FUNCTION backoffice.can_write_module(p_tenant_id uuid, p_module text)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = backoffice, pg_temp
AS $$
  SELECT
    backoffice.is_afluence_admin()
    OR EXISTS (
      SELECT 1 FROM backoffice.tenant_membership tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = p_tenant_id
        AND tm.role IN ('owner', 'editor')
        AND (tm.modules ? p_module OR tm.modules @> '["*"]'::jsonb)
    );
$$;

REVOKE ALL ON FUNCTION backoffice.current_user_id()              FROM PUBLIC;
REVOKE ALL ON FUNCTION backoffice.is_afluence()                  FROM PUBLIC;
REVOKE ALL ON FUNCTION backoffice.is_afluence_admin()            FROM PUBLIC;
REVOKE ALL ON FUNCTION backoffice.can_read_tenant(uuid)          FROM PUBLIC;
REVOKE ALL ON FUNCTION backoffice.can_write_module(uuid, text)   FROM PUBLIC;
GRANT EXECUTE ON FUNCTION backoffice.current_user_id()            TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION backoffice.is_afluence()                TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION backoffice.is_afluence_admin()          TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION backoffice.can_read_tenant(uuid)        TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION backoffice.can_write_module(uuid, text) TO authenticated, service_role;

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE backoffice.profile             ENABLE ROW LEVEL SECURITY;
ALTER TABLE backoffice.tenant              ENABLE ROW LEVEL SECURITY;
ALTER TABLE backoffice.afluence_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE backoffice.tenant_membership   ENABLE ROW LEVEL SECURITY;
ALTER TABLE backoffice.service_identity    ENABLE ROW LEVEL SECURITY;

-- profile: a user sees their own row; afluence staff see all.
DROP POLICY IF EXISTS profile_read ON backoffice.profile;
CREATE POLICY profile_read ON backoffice.profile
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR backoffice.is_afluence());

-- tenant: readable if the caller can read that tenant.
DROP POLICY IF EXISTS tenant_read ON backoffice.tenant;
CREATE POLICY tenant_read ON backoffice.tenant
  FOR SELECT TO authenticated
  USING (backoffice.can_read_tenant(id));

-- afluence_membership: staff-only visibility.
DROP POLICY IF EXISTS afluence_membership_read ON backoffice.afluence_membership;
CREATE POLICY afluence_membership_read ON backoffice.afluence_membership
  FOR SELECT TO authenticated
  USING (backoffice.is_afluence());

-- tenant_membership: a user sees their own memberships; staff see all.
DROP POLICY IF EXISTS tenant_membership_read ON backoffice.tenant_membership;
CREATE POLICY tenant_membership_read ON backoffice.tenant_membership
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR backoffice.is_afluence());

-- service_identity: staff-only (never exposed to creators/agents via PostgREST).
DROP POLICY IF EXISTS service_identity_read ON backoffice.service_identity;
CREATE POLICY service_identity_read ON backoffice.service_identity
  FOR SELECT TO authenticated
  USING (backoffice.is_afluence_admin());

-- ============================================================================
-- Grants: service_role full (bypasses RLS anyway); authenticated SELECT-gated;
-- anon gets nothing (no policy => deny under RLS).
-- ============================================================================
GRANT ALL    ON ALL TABLES    IN SCHEMA backoffice TO service_role;
GRANT SELECT ON ALL TABLES    IN SCHEMA backoffice TO authenticated;
GRANT ALL    ON ALL SEQUENCES IN SCHEMA backoffice TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA backoffice GRANT ALL    ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA backoffice GRANT SELECT ON TABLES TO authenticated;

-- updated_at trigger helper (shared)
CREATE OR REPLACE FUNCTION backoffice.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_touch ON backoffice.profile;
CREATE TRIGGER profile_touch BEFORE UPDATE ON backoffice.profile
  FOR EACH ROW EXECUTE FUNCTION backoffice.touch_updated_at();

DROP TRIGGER IF EXISTS tenant_touch ON backoffice.tenant;
CREATE TRIGGER tenant_touch BEFORE UPDATE ON backoffice.tenant
  FOR EACH ROW EXECUTE FUNCTION backoffice.touch_updated_at();
