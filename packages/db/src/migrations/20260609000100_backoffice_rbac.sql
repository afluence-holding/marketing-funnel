-- ============================================================================
-- Migration: backoffice RBAC — ops roles + module grants (ADDITIVE)
-- ----------------------------------------------------------------------------
-- Backs the Centro de Operaciones "Usuarios" + "Configuración" modules with
-- real, DB-driven role→module access (replacing the HTML's localStorage logic).
--
--   afluence_membership.ops_role  per-staff ops role (agnostico/admin/marketing/
--                                 operaciones/viewer). Nullable: NULL derives from
--                                 the existing `role` (admin/director->admin,
--                                 member->viewer) so nothing breaks.
--   role_module_grant             which modules each ops role can view. module_id
--                                 '*' = all. Seeded from the doc's ROLES map.
--   tenant.enabled_modules        per-tenant module catalog (data form of the
--                                 static registry ENABLED map). Optional/forward.
--
-- Safety: additive only (new nullable column / new table / new column with
-- default). Existing is_afluence*/can_* semantics untouched. Idempotent.
--
-- Run after 20260608000000_backoffice_identity.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- afluence_membership.ops_role
-- ----------------------------------------------------------------------------
ALTER TABLE backoffice.afluence_membership
  ADD COLUMN IF NOT EXISTS ops_role text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'afluence_membership_ops_role_chk'
  ) THEN
    ALTER TABLE backoffice.afluence_membership
      ADD CONSTRAINT afluence_membership_ops_role_chk
      CHECK (ops_role IS NULL OR ops_role IN
        ('agnostico','admin','marketing','operaciones','viewer'));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- tenant.enabled_modules (forward-looking; app falls back to static registry)
-- ----------------------------------------------------------------------------
ALTER TABLE backoffice.tenant
  ADD COLUMN IF NOT EXISTS enabled_modules jsonb NOT NULL DEFAULT '["campaigns"]'::jsonb;

-- ----------------------------------------------------------------------------
-- role_module_grant — role → module visibility ('*' = all)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS backoffice.role_module_grant (
  role       text NOT NULL
               CHECK (role IN ('agnostico','admin','marketing','operaciones','viewer')),
  module_id  text NOT NULL,        -- tab id: resumen/kpis/tareas/gantt/calendario/
                                   -- mensajes/enlaces/usuarios/config, or '*'
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role, module_id)
);

-- Seed defaults from the operations doc's ROLES map (idempotent).
INSERT INTO backoffice.role_module_grant (role, module_id) VALUES
  ('agnostico','*'),
  ('admin','*'),
  ('marketing','resumen'), ('marketing','kpis'), ('marketing','tareas'),
  ('marketing','gantt'), ('marketing','calendario'), ('marketing','mensajes'),
  ('operaciones','resumen'), ('operaciones','tareas'), ('operaciones','gantt'),
  ('operaciones','enlaces'),
  ('viewer','resumen'), ('viewer','kpis')
ON CONFLICT (role, module_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------
-- Resolve the caller's ops role (explicit ops_role, else derive from staff role,
-- else 'agnostico' for any un-onboarded afluence user => no regression).
CREATE OR REPLACE FUNCTION backoffice.current_ops_role()
RETURNS text
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = backoffice, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT m.ops_role FROM backoffice.afluence_membership m WHERE m.user_id = auth.uid()),
    (SELECT CASE WHEN m.role IN ('admin','director') THEN 'admin' ELSE 'viewer' END
       FROM backoffice.afluence_membership m WHERE m.user_id = auth.uid()),
    'agnostico'
  );
$$;

CREATE OR REPLACE FUNCTION backoffice.can_see_module(p_role text, p_module text)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = backoffice, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM backoffice.role_module_grant g
    WHERE g.role = p_role AND (g.module_id = '*' OR g.module_id = p_module)
  );
$$;

REVOKE ALL ON FUNCTION backoffice.current_ops_role()              FROM PUBLIC;
REVOKE ALL ON FUNCTION backoffice.can_see_module(text, text)      FROM PUBLIC;
GRANT EXECUTE ON FUNCTION backoffice.current_ops_role()           TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION backoffice.can_see_module(text, text)   TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- RLS + grants
-- ----------------------------------------------------------------------------
ALTER TABLE backoffice.role_module_grant ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS role_module_grant_read ON backoffice.role_module_grant;
CREATE POLICY role_module_grant_read ON backoffice.role_module_grant
  FOR SELECT TO authenticated USING (backoffice.is_afluence());

DROP POLICY IF EXISTS role_module_grant_write ON backoffice.role_module_grant;
CREATE POLICY role_module_grant_write ON backoffice.role_module_grant
  FOR ALL TO authenticated
  USING (backoffice.is_afluence_admin())
  WITH CHECK (backoffice.is_afluence_admin());

GRANT ALL    ON backoffice.role_module_grant TO service_role;
GRANT SELECT ON backoffice.role_module_grant TO authenticated;
