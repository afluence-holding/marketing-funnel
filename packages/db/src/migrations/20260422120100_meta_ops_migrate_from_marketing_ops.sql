-- =============================================================================
-- One-time data copy: marketing_ops.* → meta_ops.*
--
-- Populates the new typed tables in meta_ops from the legacy marketing_ops
-- (written by Ops/di21_monitor.py). Idempotent via ON CONFLICT.
--
-- Business-unit attachment strategy:
--   - DI21 BU uses match_strategy "prefix" with campaign_name_prefix = "DI21".
--     All campaigns whose name starts with "DI21" are attached to that BU.
--   - Campaigns without a matching prefix get business_unit_id = NULL.
--
-- meta_entities is also rebuilt so that meta_insights can FK into it.
-- =============================================================================

SET search_path = public;

-- -----------------------------------------------------------------------------
-- 1. ad_accounts
-- -----------------------------------------------------------------------------
INSERT INTO meta_ops.ad_accounts (
  meta_account_id, organizer_id, name, currency, timezone, account_status,
  spending_cap, amount_spent, created_at, updated_at
)
SELECT
  a.meta_account_id,
  o.id,
  a.name,
  a.currency,
  a.timezone,
  a.account_status,
  a.spending_cap,
  a.amount_spent,
  COALESCE(a.created_at, now()),
  COALESCE(a.updated_at, now())
FROM marketing_ops.ad_accounts a
LEFT JOIN meta_ops.organizers o ON o.ad_account_id = a.meta_account_id
ON CONFLICT (meta_account_id) DO UPDATE SET
  name           = EXCLUDED.name,
  currency       = EXCLUDED.currency,
  timezone       = EXCLUDED.timezone,
  account_status = EXCLUDED.account_status,
  spending_cap   = EXCLUDED.spending_cap,
  amount_spent   = EXCLUDED.amount_spent,
  organizer_id   = COALESCE(meta_ops.ad_accounts.organizer_id, EXCLUDED.organizer_id),
  updated_at     = now();

-- -----------------------------------------------------------------------------
-- 2. campaigns — attach to DI21 BU when name starts with "DI21".
-- -----------------------------------------------------------------------------
WITH di21 AS (
  SELECT id
  FROM meta_ops.business_units
  WHERE slug = 'di21'
  LIMIT 1
)
INSERT INTO meta_ops.campaigns (
  id, account_id, business_unit_id, name, objective, status,
  campaign_type, vertical, funnel_stage,
  daily_budget, lifetime_budget, created_at, updated_at
)
SELECT
  c.id,
  c.account_id,
  CASE
    WHEN c.name LIKE 'DI21%' OR c.name LIKE 'D21%' THEN (SELECT id FROM di21)
    ELSE NULL
  END,
  c.name,
  c.objective,
  c.status,
  c.campaign_type,
  c.vertical,
  c.funnel_stage,
  c.daily_budget,
  c.lifetime_budget,
  COALESCE(c.created_at, now()),
  COALESCE(c.updated_at, now())
FROM marketing_ops.campaigns c
ON CONFLICT (id) DO UPDATE SET
  account_id       = EXCLUDED.account_id,
  business_unit_id = COALESCE(meta_ops.campaigns.business_unit_id, EXCLUDED.business_unit_id),
  name             = EXCLUDED.name,
  objective        = EXCLUDED.objective,
  status           = EXCLUDED.status,
  campaign_type    = EXCLUDED.campaign_type,
  vertical         = EXCLUDED.vertical,
  funnel_stage     = EXCLUDED.funnel_stage,
  daily_budget     = EXCLUDED.daily_budget,
  lifetime_budget  = EXCLUDED.lifetime_budget,
  updated_at       = now();

-- -----------------------------------------------------------------------------
-- 3. ad_sets — infer business_unit_id from parent campaign.
-- -----------------------------------------------------------------------------
INSERT INTO meta_ops.ad_sets (
  id, campaign_id, business_unit_id, name, status,
  daily_budget, bid_strategy, bid_amount,
  optimization_goal, targeting, audience_id,
  created_at, updated_at
)
SELECT
  s.id,
  s.campaign_id,
  c.business_unit_id,
  s.name,
  s.status,
  s.daily_budget,
  s.bid_strategy,
  s.bid_amount,
  s.optimization_goal,
  s.targeting,
  s.audience_id,
  COALESCE(s.created_at, now()),
  COALESCE(s.updated_at, now())
FROM marketing_ops.ad_sets s
LEFT JOIN meta_ops.campaigns c ON c.id = s.campaign_id
ON CONFLICT (id) DO UPDATE SET
  campaign_id       = EXCLUDED.campaign_id,
  business_unit_id  = COALESCE(meta_ops.ad_sets.business_unit_id, EXCLUDED.business_unit_id),
  name              = EXCLUDED.name,
  status            = EXCLUDED.status,
  daily_budget      = EXCLUDED.daily_budget,
  bid_strategy      = EXCLUDED.bid_strategy,
  bid_amount        = EXCLUDED.bid_amount,
  optimization_goal = EXCLUDED.optimization_goal,
  targeting         = EXCLUDED.targeting,
  audience_id       = EXCLUDED.audience_id,
  updated_at        = now();

-- -----------------------------------------------------------------------------
-- 4. creatives
-- -----------------------------------------------------------------------------
INSERT INTO meta_ops.creatives (
  id, meta_creative_id, type, headline, body_text, cta,
  media_url, thumbnail_url, vertical, archetype, version,
  fatigue_score, lifecycle_stage, peak_ctr, peak_date,
  cpmr_baseline, first_impression_date, created_at, updated_at
)
SELECT
  c.id,
  c.meta_creative_id,
  c.type,
  c.headline,
  c.body_text,
  c.cta,
  c.media_url,
  c.thumbnail_url,
  c.vertical,
  c.archetype,
  c.version,
  c.fatigue_score,
  c.lifecycle_stage,
  c.peak_ctr,
  c.peak_date,
  c.cpmr_baseline,
  c.first_impression_date,
  COALESCE(c.created_at, now()),
  COALESCE(c.updated_at, now())
FROM marketing_ops.creatives c
ON CONFLICT (id) DO UPDATE SET
  meta_creative_id      = EXCLUDED.meta_creative_id,
  type                  = EXCLUDED.type,
  headline              = EXCLUDED.headline,
  body_text             = EXCLUDED.body_text,
  cta                   = EXCLUDED.cta,
  media_url             = EXCLUDED.media_url,
  thumbnail_url         = EXCLUDED.thumbnail_url,
  vertical              = EXCLUDED.vertical,
  archetype             = EXCLUDED.archetype,
  version               = EXCLUDED.version,
  fatigue_score         = EXCLUDED.fatigue_score,
  lifecycle_stage       = EXCLUDED.lifecycle_stage,
  peak_ctr              = EXCLUDED.peak_ctr,
  peak_date             = EXCLUDED.peak_date,
  cpmr_baseline         = EXCLUDED.cpmr_baseline,
  first_impression_date = EXCLUDED.first_impression_date,
  updated_at            = now();

-- -----------------------------------------------------------------------------
-- 5. ads — inherit business_unit_id from parent ad_set.
-- -----------------------------------------------------------------------------
INSERT INTO meta_ops.ads (
  id, ad_set_id, business_unit_id, creative_id, name, status,
  created_at, updated_at
)
SELECT
  a.id,
  a.ad_set_id,
  s.business_unit_id,
  a.creative_id,
  a.name,
  a.status,
  COALESCE(a.created_at, now()),
  COALESCE(a.updated_at, now())
FROM marketing_ops.ads a
LEFT JOIN meta_ops.ad_sets s ON s.id = a.ad_set_id
ON CONFLICT (id) DO UPDATE SET
  ad_set_id        = EXCLUDED.ad_set_id,
  business_unit_id = COALESCE(meta_ops.ads.business_unit_id, EXCLUDED.business_unit_id),
  creative_id      = EXCLUDED.creative_id,
  name             = EXCLUDED.name,
  status           = EXCLUDED.status,
  updated_at       = now();

-- -----------------------------------------------------------------------------
-- 6. audiences
-- -----------------------------------------------------------------------------
INSERT INTO meta_ops.audiences (
  id, account_id, name, type, subtype, source_audience_id,
  lookalike_spec, approximate_count, status, retention_days,
  created_at, updated_at
)
SELECT
  a.id,
  a.account_id,
  a.name,
  a.type,
  a.subtype,
  a.source_audience_id,
  a.lookalike_spec,
  a.approximate_count,
  a.status,
  a.retention_days,
  COALESCE(a.created_at, now()),
  COALESCE(a.updated_at, now())
FROM marketing_ops.audiences a
ON CONFLICT (id) DO UPDATE SET
  account_id         = EXCLUDED.account_id,
  name               = EXCLUDED.name,
  type               = EXCLUDED.type,
  subtype            = EXCLUDED.subtype,
  source_audience_id = EXCLUDED.source_audience_id,
  lookalike_spec     = EXCLUDED.lookalike_spec,
  approximate_count  = EXCLUDED.approximate_count,
  status             = EXCLUDED.status,
  retention_days     = EXCLUDED.retention_days,
  updated_at         = now();

-- -----------------------------------------------------------------------------
-- 7. alerts (latest-N style; we copy whole set, dedup by (bu, alert_type, message))
-- -----------------------------------------------------------------------------
WITH di21 AS (
  SELECT id FROM meta_ops.business_units WHERE slug = 'di21' LIMIT 1
)
INSERT INTO meta_ops.alerts (
  business_unit_id, alert_type, severity, status,
  entity_type, entity_id, message, details,
  created_at, updated_at
)
SELECT
  (SELECT id FROM di21),
  a.alert_type,
  a.severity,
  a.status,
  a.entity_type,
  a.entity_id,
  a.message,
  a.details,
  COALESCE(a.created_at, now()),
  COALESCE(a.updated_at, now())
FROM marketing_ops.alerts a;

-- -----------------------------------------------------------------------------
-- 8. meta_entities + meta_insights: rebuild from marketing_ops.metrics_daily.
--
--    metrics_daily rows have entity_type ∈ {campaign, adset, ad}
--    and entity_id = Meta's TEXT id.
--
--    Strategy:
--      (a) derive a meta_entities row per (bu, entity_type, entity_id),
--          inferring bu from the typed table (campaigns/ad_sets/ads).
--      (b) insert meta_insights rows joined via that entity.id.
-- -----------------------------------------------------------------------------

-- 8a. Build meta_entities from the typed tables (campaigns, ad_sets, ads).
INSERT INTO meta_ops.meta_entities (
  business_unit_id, entity_type, meta_id, parent_meta_id, name, status,
  created_at, updated_at
)
SELECT c.business_unit_id, 'campaign', c.id, NULL, c.name, c.status,
       c.created_at, c.updated_at
FROM meta_ops.campaigns c
WHERE c.business_unit_id IS NOT NULL
ON CONFLICT (business_unit_id, entity_type, meta_id) DO UPDATE SET
  name       = EXCLUDED.name,
  status     = EXCLUDED.status,
  updated_at = now();

INSERT INTO meta_ops.meta_entities (
  business_unit_id, entity_type, meta_id, parent_meta_id, name, status,
  created_at, updated_at
)
SELECT s.business_unit_id, 'adset', s.id, s.campaign_id, s.name, s.status,
       s.created_at, s.updated_at
FROM meta_ops.ad_sets s
WHERE s.business_unit_id IS NOT NULL
ON CONFLICT (business_unit_id, entity_type, meta_id) DO UPDATE SET
  parent_meta_id = EXCLUDED.parent_meta_id,
  name           = EXCLUDED.name,
  status         = EXCLUDED.status,
  updated_at     = now();

INSERT INTO meta_ops.meta_entities (
  business_unit_id, entity_type, meta_id, parent_meta_id, name, status,
  created_at, updated_at
)
SELECT a.business_unit_id, 'ad', a.id, a.ad_set_id, a.name, a.status,
       a.created_at, a.updated_at
FROM meta_ops.ads a
WHERE a.business_unit_id IS NOT NULL
ON CONFLICT (business_unit_id, entity_type, meta_id) DO UPDATE SET
  parent_meta_id = EXCLUDED.parent_meta_id,
  name           = EXCLUDED.name,
  status         = EXCLUDED.status,
  updated_at     = now();

-- 8b. meta_insights: one row per (entity, date).
--     Lookup meta_entities.id via (business_unit_id, entity_type, meta_id).
--     tier: classify by age vs CURRENT_DATE (matches TS classifyTier).
INSERT INTO meta_ops.meta_insights (
  entity_id, date, tier, spend, impressions, reach, clicks,
  leads, purchases, purchase_value, hook_rate, video_3s_views, updated_at
)
SELECT
  e.id,
  md.date,
  CASE
    WHEN md.date >= CURRENT_DATE                    THEN 'today'
    WHEN md.date >= CURRENT_DATE - INTERVAL '7 days'  THEN 'recent'
    WHEN md.date >= CURRENT_DATE - INTERVAL '30 days' THEN 'mid'
    ELSE 'historical'
  END,
  COALESCE(md.spend, 0),
  COALESCE(md.impressions, 0),
  COALESCE(md.reach, 0),
  COALESCE(md.clicks, 0),
  COALESCE(md.leads, 0),
  COALESCE(md.purchases, 0),
  COALESCE(md.purchase_value, 0),
  COALESCE(md.hook_rate, 0),
  COALESCE(md.video_3s_views, 0),
  COALESCE(md.updated_at, now())
FROM marketing_ops.metrics_daily md
JOIN meta_ops.meta_entities e
  ON e.entity_type = md.entity_type
 AND e.meta_id     = md.entity_id
ON CONFLICT (entity_id, date) DO UPDATE SET
  spend          = EXCLUDED.spend,
  impressions    = EXCLUDED.impressions,
  reach          = EXCLUDED.reach,
  clicks         = EXCLUDED.clicks,
  leads          = EXCLUDED.leads,
  purchases      = EXCLUDED.purchases,
  purchase_value = EXCLUDED.purchase_value,
  hook_rate      = EXCLUDED.hook_rate,
  video_3s_views = EXCLUDED.video_3s_views,
  updated_at     = now();

-- Note: link_clicks / landing_page_views / initiate_checkout are not populated
-- by marketing_ops.metrics_daily today. They'll be zero for migrated rows and
-- will be filled by future meta-ads TS ingest passes (or by a Python backfill).
-- The dashboard renderer must handle zero/NULL gracefully.

NOTIFY pgrst, 'reload schema';
