-- ============================================================================
-- Launch Ops — post-migration validation queries (read-only, safe to run)
-- Run in Supabase SQL Editor AFTER applying:
--   20260608000000_backoffice_identity.sql
--   20260608000100_launch_ops_schema.sql
--   20260608000200_launch_ops_seed_di21_c2.sql
-- Every query has an EXPECT comment. Nothing here mutates data.
-- ============================================================================

-- 1) Schemas exist                                   EXPECT: 2 rows
SELECT schema_name FROM information_schema.schemata
WHERE schema_name IN ('backoffice', 'launch_ops') ORDER BY 1;

-- 2) RLS enabled on every launch_ops table           EXPECT: rowsecurity = true for all
SELECT relname, relrowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'launch_ops' AND c.relkind = 'r'
ORDER BY relname;

-- 3) Seed counts                                      EXPECT: 58 tasks / 6 phases / 6 kpis / 26 resources
SELECT
  (SELECT count(*) FROM launch_ops.task     t JOIN launch_ops.launch l ON l.id = t.launch_id WHERE l.code = 'DI21-C2') AS tasks,
  (SELECT count(*) FROM launch_ops.phase    p JOIN launch_ops.launch l ON l.id = p.launch_id WHERE l.code = 'DI21-C2') AS phases,
  (SELECT count(*) FROM launch_ops.kpi      k JOIN launch_ops.launch l ON l.id = k.launch_id WHERE l.code = 'DI21-C2') AS kpis,
  (SELECT count(*) FROM launch_ops.resource r JOIN launch_ops.launch l ON l.id = r.launch_id WHERE l.code = 'DI21-C2') AS resources;

-- 4) Tasks per phase                                  EXPECT: F0=9 F1=14 F2=14 F3=10 F4=7 F5=4
SELECT p.code, count(t.id) AS tasks
FROM launch_ops.phase p
JOIN launch_ops.launch l ON l.id = p.launch_id
LEFT JOIN launch_ops.task t ON t.phase_id = p.id
WHERE l.code = 'DI21-C2'
GROUP BY p.code ORDER BY p.code;

-- 5) Dependency integrity: no structured dep points to a missing task   EXPECT: 0
SELECT count(*) AS dangling_deps
FROM launch_ops.dependency d
WHERE d.depends_on_task_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM launch_ops.task t WHERE t.id = d.depends_on_task_id);

-- 6) Every task has >= 1 owner                        EXPECT: 0 orphan tasks
SELECT count(*) AS tasks_without_owner
FROM launch_ops.task t
WHERE NOT EXISTS (SELECT 1 FROM launch_ops.task_owner o WHERE o.task_id = t.id);

-- 7) Optimistic lock + history trigger smoke (mutates then restores) ----------
--    Run manually only in a non-prod project if you want to test the trigger:
-- BEGIN;
--   UPDATE launch_ops.task SET status = 'doing', updated_by = 'test:human'
--   WHERE id = (SELECT id FROM launch_ops.task LIMIT 1) RETURNING version;  -- EXPECT version+1
--   SELECT to_status, actor_type FROM launch_ops.status_history ORDER BY created_at DESC LIMIT 1; -- EXPECT 'doing','human'
-- ROLLBACK;

-- 8) Realtime publication includes task               EXPECT: 1 row (if Realtime enabled)
SELECT schemaname, tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND schemaname = 'launch_ops';

-- 9) Helper functions are SECURITY DEFINER            EXPECT: prosecdef = true
SELECT proname, prosecdef
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('backoffice', 'launch_ops')
  AND proname IN ('is_afluence','can_read_tenant','can_write_module','can_read_launch','can_write_launch')
ORDER BY proname;
