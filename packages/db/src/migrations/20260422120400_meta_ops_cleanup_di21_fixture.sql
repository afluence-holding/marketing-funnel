-- =============================================================================
-- Cleanup DI21 fixture rows once the real Meta pull has populated meta_ops.
--
-- Rationale: 20260422120300_meta_ops_seed_di21_fixture.sql seeded the dashboard
-- with a snapshot from desinflamate21-report-2026-04-22.html using synthetic
-- IDs (di21_cus, di21_ad_XXX, DI21-2026-Q2 as string). Once the real Meta pull
-- runs (Phase 4), those synthetic rows coexist with the real numeric IDs and
-- cause double-counting in the dashboard.
--
-- Criterion: any ad/ad_set/campaign/meta_entity whose id is NOT all-digits is a
-- fixture row and should be removed. Operator-managed tables (price_tiers,
-- hypotheses, watch_signals, alerts, ad_matchups, business_units.config) are
-- kept intact; only Meta-sourced structural data is cleaned.
--
-- Idempotent: safe to re-run. The first real pull will delete synthetic rows;
-- subsequent runs delete nothing.
-- =============================================================================

BEGIN;

WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug = 'di21' LIMIT 1)

-- 1. ad_matchups referencing synthetic ads.
DELETE FROM meta_ops.ad_matchups am
USING meta_ops.ads a
WHERE (am.video_ad_id = a.id OR am.static_ad_id = a.id)
  AND a.id !~ '^[0-9]+$'
  AND a.business_unit_id = (SELECT id FROM di21);

-- 2. meta_insights attached to synthetic meta_entities (so FK cascade works clean).
DELETE FROM meta_ops.meta_insights mi
USING meta_ops.meta_entities me
WHERE mi.entity_id = me.id
  AND me.business_unit_id = (SELECT id FROM meta_ops.business_units WHERE slug = 'di21')
  AND me.meta_id !~ '^[0-9]+$';

DELETE FROM meta_ops.meta_insights_frequency mif
USING meta_ops.meta_entities me
WHERE mif.entity_id = me.id
  AND me.business_unit_id = (SELECT id FROM meta_ops.business_units WHERE slug = 'di21')
  AND me.meta_id !~ '^[0-9]+$';

-- 3. meta_entities with synthetic meta_id.
DELETE FROM meta_ops.meta_entities
WHERE business_unit_id = (SELECT id FROM meta_ops.business_units WHERE slug = 'di21')
  AND meta_id !~ '^[0-9]+$';

-- 4. ads with synthetic ids.
DELETE FROM meta_ops.ads
WHERE business_unit_id = (SELECT id FROM meta_ops.business_units WHERE slug = 'di21')
  AND id !~ '^[0-9]+$';

-- 5. Orphaned creatives: those where no ad references them. Restricted to DI21 BU.
DELETE FROM meta_ops.creatives c
WHERE c.business_unit_id = (SELECT id FROM meta_ops.business_units WHERE slug = 'di21')
  AND NOT EXISTS (SELECT 1 FROM meta_ops.ads a WHERE a.creative_id = c.id);

-- 6. ad_sets with synthetic ids.
DELETE FROM meta_ops.ad_sets
WHERE business_unit_id = (SELECT id FROM meta_ops.business_units WHERE slug = 'di21')
  AND id !~ '^[0-9]+$';

-- 7. campaigns with synthetic ids.
DELETE FROM meta_ops.campaigns
WHERE business_unit_id = (SELECT id FROM meta_ops.business_units WHERE slug = 'di21')
  AND id !~ '^[0-9]+$';

COMMIT;
