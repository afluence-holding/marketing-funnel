-- ============================================================================
-- Migration: Centro de Operaciones — role taxonomy refresh (ADDITIVE / SAFE)
-- ----------------------------------------------------------------------------
-- The DI21-C2 doc evolved the ops team model from a generic
-- (marketing / operaciones) split into a launch-specific one:
--
--   organico   Orgánico (IG/email/ManyChat content)
--   paid       Paid / Trafficker
--   support    Support / Order-bump / Config
--   comunidad  Comunidad / WhatsApp
--   creator    Creator (Germán)
--
-- This migration:
--   1. Re-maps any existing ops_role values out of the retired taxonomy so the
--      tightened CHECK passes (marketing/operaciones -> NULL; re-seeded below by
--      the staff-directory step run via psql, not in this file).
--   2. Replaces the ops_role + role_module_grant.role CHECK constraints.
--   3. Drops retired grant rows and re-seeds the documented role->module matrix.
--
-- Idempotent. No data loss: launch_ops runtime state is untouched; only role
-- metadata + the grant matrix change. Run after 20260609000100_backoffice_rbac.sql.
-- ============================================================================

-- 1) Move existing values out of the retired taxonomy (CHECK allows NULL) ------
UPDATE backoffice.afluence_membership
   SET ops_role = NULL
 WHERE ops_role IS NOT NULL
   AND ops_role NOT IN
     ('agnostico','admin','organico','paid','support','comunidad','creator','viewer');

-- 2a) afluence_membership.ops_role CHECK ---------------------------------------
ALTER TABLE backoffice.afluence_membership
  DROP CONSTRAINT IF EXISTS afluence_membership_ops_role_chk;
ALTER TABLE backoffice.afluence_membership
  ADD CONSTRAINT afluence_membership_ops_role_chk
  CHECK (ops_role IS NULL OR ops_role IN
    ('agnostico','admin','organico','paid','support','comunidad','creator','viewer'));

-- 2b) role_module_grant.role CHECK (inline auto-named constraint) ---------------
DO $$
DECLARE c text;
BEGIN
  SELECT conname INTO c
    FROM pg_constraint
   WHERE conrelid = 'backoffice.role_module_grant'::regclass
     AND contype = 'c'
     AND pg_get_constraintdef(oid) ILIKE '%role%IN%';
  IF c IS NOT NULL THEN
    EXECUTE format('ALTER TABLE backoffice.role_module_grant DROP CONSTRAINT %I', c);
  END IF;
END $$;

-- 3) Drop retired grant rows then re-seed the documented matrix ----------------
DELETE FROM backoffice.role_module_grant
 WHERE role NOT IN
   ('agnostico','admin','organico','paid','support','comunidad','creator','viewer');

ALTER TABLE backoffice.role_module_grant
  ADD CONSTRAINT role_module_grant_role_chk
  CHECK (role IN ('agnostico','admin','organico','paid','support','comunidad','creator','viewer'));

INSERT INTO backoffice.role_module_grant (role, module_id) VALUES
  ('agnostico','*'),
  ('admin','*'),
  ('organico','resumen'), ('organico','kpis'), ('organico','tareas'),
  ('organico','gantt'), ('organico','calendario'), ('organico','mensajes'),
  ('paid','resumen'), ('paid','kpis'), ('paid','tareas'),
  ('paid','gantt'), ('paid','calendario'), ('paid','mensajes'),
  ('support','resumen'), ('support','tareas'), ('support','gantt'),
  ('support','enlaces'), ('support','mensajes'),
  ('comunidad','resumen'), ('comunidad','tareas'),
  ('comunidad','calendario'), ('comunidad','mensajes'),
  ('creator','resumen'), ('creator','tareas'),
  ('creator','calendario'), ('creator','mensajes'),
  ('viewer','resumen'), ('viewer','kpis')
ON CONFLICT (role, module_id) DO NOTHING;
