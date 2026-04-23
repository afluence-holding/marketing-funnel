-- =============================================================================
-- Fix v_bu_daily_rollup: filter by entity_type='campaign' to avoid triple-counting.
-- =============================================================================
-- The original view (20260418000000) summed across all entity levels
-- (campaign + adset + ad), so any consumer of the view would see ~3x the real
-- numbers. This rewrite restricts aggregation to campaign-level insights, which
-- is the single source of truth per Meta. Campaign totals already include all
-- ad set and ad activity beneath them.
--
-- Also extends the output with the newer funnel columns added in
-- 20260422120000_meta_ops_dashboard_schema.sql (link_clicks, landing_page_views,
-- initiate_checkout) so dashboards can read the full funnel from one view.
--
-- Idempotent: DROP + CREATE (the shape changes — new columns inserted in the
-- middle of the select list — so CREATE OR REPLACE is rejected by Postgres
-- with "cannot change name of view column ... use ALTER VIEW ... RENAME").
-- =============================================================================

DROP VIEW IF EXISTS meta_ops.v_bu_daily_rollup;

CREATE VIEW meta_ops.v_bu_daily_rollup AS
SELECT
  bu.id                                         AS business_unit_id,
  bu.slug                                       AS bu_slug,
  o.slug                                        AS organizer_slug,
  mi.date                                       AS date,
  SUM(mi.spend)                                 AS spend,
  SUM(mi.impressions)                           AS impressions,
  -- NOTE: reach is NOT strictly additive across days/rows, but we preserve the
  -- SUM for backward compatibility with the original view shape.
  SUM(mi.reach)                                 AS reach,
  SUM(mi.clicks)                                AS clicks,
  SUM(mi.link_clicks)                           AS link_clicks,
  SUM(mi.landing_page_views)                    AS landing_page_views,
  SUM(mi.initiate_checkout)                     AS initiate_checkout,
  SUM(mi.leads)                                 AS leads,
  SUM(mi.purchases)                             AS purchases,
  SUM(mi.purchase_value)                        AS purchase_value,
  CASE WHEN SUM(mi.impressions) > 0
       THEN SUM(mi.clicks)::numeric / SUM(mi.impressions) ELSE 0 END AS ctr,
  CASE WHEN SUM(mi.spend) > 0
       THEN SUM(mi.purchase_value) / SUM(mi.spend) ELSE 0 END        AS roas,
  CASE WHEN SUM(mi.purchases) > 0
       THEN SUM(mi.spend) / SUM(mi.purchases) ELSE 0 END              AS cpa
FROM meta_ops.meta_insights mi
JOIN meta_ops.meta_entities me ON me.id = mi.entity_id
JOIN meta_ops.business_units bu ON bu.id = me.business_unit_id
JOIN meta_ops.organizers o ON o.id = bu.organizer_id
WHERE me.entity_type = 'campaign'
GROUP BY bu.id, bu.slug, o.slug, mi.date;
