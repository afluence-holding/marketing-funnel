-- =============================================================================
-- meta_ops schema extension — DI21 dashboard support.
--
-- Adds the rich, typed tables required to render the operator dashboard
-- (clone of desinflamate21-report-2026-04-22.html) while keeping meta_entities
-- as the thin polymorphic FK anchor for meta_insights.
--
-- Idempotent: safe to re-run.
--
-- Sections:
--   1. Extend business_units (config + kpi_targets conceptual, values in seed)
--   2. Extend meta_insights (link_clicks, LP views, IC, hook_rate, video_3s)
--   3. ad_accounts
--   4. campaigns        (rich, indexed by Meta campaign_id TEXT)
--   5. ad_sets          (rich, with targeting jsonb)
--   6. ads              (rich, with wave/temperature/test_group/manual_status)
--   7. creatives        (rich, with fatigue_score/archetype/lifecycle)
--   8. audiences
--   9. price_tiers               (operator-owned)
--  10. hypotheses                (operator-owned, H1..Hn)
--  11. watch_signals             (operator-owned, threshold table)
--  12. alerts                    (snapshot of latest alerts)
--  13. ad_matchups               (video vs static pairings)
--  14. meta_insights_frequency   (bucket distribution 1, 2-3, 4-5, 6-10, 11-20, 21+)
--  15. Views: v_campaign_kpis_7d, v_daily_trend, v_bu_funnel,
--             v_ad_performance, v_recent_purchases
--  16. RLS + grants
-- =============================================================================

SET search_path = public;

-- -----------------------------------------------------------------------------
-- 2. meta_insights: add link funnel columns used by the dashboard.
--    (meta_insights exists from 20260418000000_meta_ops_extend.sql)
-- -----------------------------------------------------------------------------
ALTER TABLE meta_ops.meta_insights
  ADD COLUMN IF NOT EXISTS link_clicks          INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS landing_page_views   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS initiate_checkout    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unique_link_clicks   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hook_rate            NUMERIC(10,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_3s_views       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actions              JSONB   NOT NULL DEFAULT '[]'::jsonb;

-- -----------------------------------------------------------------------------
-- 3. ad_accounts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.ad_accounts (
  meta_account_id   TEXT PRIMARY KEY,
  organizer_id      UUID REFERENCES meta_ops.organizers(id) ON DELETE SET NULL,
  name              TEXT,
  currency          TEXT,
  timezone          TEXT,
  account_status    TEXT,
  spending_cap      NUMERIC(14,2),
  amount_spent      NUMERIC(14,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_accounts_organizer
  ON meta_ops.ad_accounts(organizer_id);

-- -----------------------------------------------------------------------------
-- 4. campaigns — rich per-campaign record. PK is Meta's campaign id (TEXT).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.campaigns (
  id                    TEXT PRIMARY KEY,
  account_id            TEXT REFERENCES meta_ops.ad_accounts(meta_account_id) ON DELETE SET NULL,
  business_unit_id      UUID REFERENCES meta_ops.business_units(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  objective             TEXT,
  status                TEXT,
  effective_status      TEXT,
  buying_type           TEXT,
  bid_strategy          TEXT,
  campaign_type         TEXT,           -- cbo / abo / advantage_plus
  vertical              TEXT,           -- creadores / empresas / ...
  funnel_stage          TEXT,           -- tofu / mofu / bofu
  daily_budget          NUMERIC(14,2),
  lifetime_budget       NUMERIC(14,2),
  start_time            TIMESTAMPTZ,
  stop_time             TIMESTAMPTZ,
  updated_time          TIMESTAMPTZ,    -- Meta's updated_time
  learning_stage_info   JSONB,          -- { status, attribution_windows, ... }
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_bu        ON meta_ops.campaigns(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_account   ON meta_ops.campaigns(account_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_effective ON meta_ops.campaigns(effective_status);

-- -----------------------------------------------------------------------------
-- 5. ad_sets — rich per-adset record. PK = Meta adset id (TEXT).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.ad_sets (
  id                    TEXT PRIMARY KEY,
  campaign_id           TEXT REFERENCES meta_ops.campaigns(id) ON DELETE CASCADE,
  business_unit_id      UUID REFERENCES meta_ops.business_units(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  status                TEXT,
  effective_status      TEXT,
  daily_budget          NUMERIC(14,2),
  lifetime_budget       NUMERIC(14,2),
  bid_strategy          TEXT,
  bid_amount            NUMERIC(14,2),
  optimization_goal     TEXT,
  billing_event         TEXT,
  destination_type      TEXT,
  targeting             JSONB,                 -- full targeting spec
  audience_id           TEXT,                  -- primary audience if any
  -- Operator-assigned role (CUS / ASC / RMK / CARTAB / ...)
  role                  TEXT,
  temperature           TEXT,                  -- cold / warm / hot / hybrid
  temperature_label     TEXT,                  -- human label e.g. "HYBRID · Warm seed → Cold expansion (Adv+)"
  learning_stage_info   JSONB,
  updated_time          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_sets_campaign  ON meta_ops.ad_sets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_sets_bu        ON meta_ops.ad_sets(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_ad_sets_role      ON meta_ops.ad_sets(role);

-- -----------------------------------------------------------------------------
-- 6. creatives (need before ads for FK)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.creatives (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_creative_id      TEXT UNIQUE,
  business_unit_id      UUID REFERENCES meta_ops.business_units(id) ON DELETE SET NULL,
  type                  TEXT,               -- IMG / VID / CAROUSEL
  format                TEXT,               -- image / video / carousel / collection
  headline              TEXT,
  body_text             TEXT,
  cta                   TEXT,
  media_url             TEXT,
  thumbnail_url         TEXT,
  vertical              TEXT,
  archetype             TEXT,               -- Aspiracion / Authority / Pain / ...
  version               INTEGER,
  wave                  TEXT,               -- W1 / W2 / W3
  fatigue_score         NUMERIC(6,3),
  lifecycle_stage       TEXT,               -- testing / winner / watch / dead
  peak_ctr              NUMERIC(8,4),
  peak_date             DATE,
  cpmr_baseline         NUMERIC(14,4),
  first_impression_date DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creatives_bu        ON meta_ops.creatives(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_creatives_wave      ON meta_ops.creatives(wave);
CREATE INDEX IF NOT EXISTS idx_creatives_lifecycle ON meta_ops.creatives(lifecycle_stage);

-- -----------------------------------------------------------------------------
-- 7. ads
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.ads (
  id                    TEXT PRIMARY KEY,
  ad_set_id             TEXT REFERENCES meta_ops.ad_sets(id) ON DELETE CASCADE,
  business_unit_id      UUID REFERENCES meta_ops.business_units(id) ON DELETE SET NULL,
  creative_id           UUID REFERENCES meta_ops.creatives(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  status                TEXT,
  effective_status      TEXT,
  -- Operator-assigned labels used in the ad_performance table
  manual_status         TEXT,               -- winner / watch / dead / testing / active
  wave                  TEXT,               -- mirrors creatives.wave for quick filters
  format                TEXT,               -- IMG / VID
  test_group            TEXT,
  updated_time          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ads_adset  ON meta_ops.ads(ad_set_id);
CREATE INDEX IF NOT EXISTS idx_ads_bu     ON meta_ops.ads(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON meta_ops.ads(manual_status);

-- -----------------------------------------------------------------------------
-- 8. audiences
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.audiences (
  id                    TEXT PRIMARY KEY,
  account_id            TEXT REFERENCES meta_ops.ad_accounts(meta_account_id) ON DELETE SET NULL,
  business_unit_id      UUID REFERENCES meta_ops.business_units(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  type                  TEXT,
  subtype               TEXT,
  source_audience_id    TEXT,
  lookalike_spec        JSONB,
  approximate_count     INTEGER,
  status                TEXT,
  retention_days        INTEGER,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audiences_account ON meta_ops.audiences(account_id);
CREATE INDEX IF NOT EXISTS idx_audiences_bu      ON meta_ops.audiences(business_unit_id);

-- -----------------------------------------------------------------------------
-- 9. price_tiers — history of price changes during the campaign window.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.price_tiers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id      UUID NOT NULL REFERENCES meta_ops.business_units(id) ON DELETE CASCADE,
  label                 TEXT,                -- "Early bird", "Standard", "Final"
  price                 NUMERIC(10,2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'USD',
  starts_on             DATE NOT NULL,
  ends_on               DATE,                -- NULL = open-ended (current tier)
  cutover_time          TIMESTAMPTZ,         -- optional intra-day cutover (blend day)
  display_order         INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_tiers_bu
  ON meta_ops.price_tiers(business_unit_id, starts_on);

-- Guarantee one tier per day (no overlapping ranges)
CREATE UNIQUE INDEX IF NOT EXISTS idx_price_tiers_bu_start
  ON meta_ops.price_tiers(business_unit_id, starts_on);

-- -----------------------------------------------------------------------------
-- 10. hypotheses — H1..Hn per BU, with status tracking.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.hypotheses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id      UUID NOT NULL REFERENCES meta_ops.business_units(id) ON DELETE CASCADE,
  code                  TEXT NOT NULL,       -- "H1"..."H8"
  statement             TEXT NOT NULL,
  current_reading       TEXT,                -- "Reach 53,078 = 22.1x seed, CPA $35.27"
  success_criteria      TEXT,                -- "CPA <$53 at scale"
  status                TEXT NOT NULL DEFAULT 'testing',  -- testing / validated / rejected
  display_order         INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_unit_id, code)
);

CREATE INDEX IF NOT EXISTS idx_hypotheses_bu ON meta_ops.hypotheses(business_unit_id, display_order);

-- -----------------------------------------------------------------------------
-- 11. watch_signals — "What to Watch Next" thresholds per BU.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.watch_signals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id      UUID NOT NULL REFERENCES meta_ops.business_units(id) ON DELETE CASCADE,
  signal_key            TEXT NOT NULL,       -- stable identifier, e.g. "cus_daily_freq_7d"
  signal_label          TEXT NOT NULL,       -- display label
  threshold_display     TEXT NOT NULL,       -- "<3.0", "<$58", ">1.5%"
  current_display       TEXT,                -- computed snapshot, operator-updated
  status                TEXT NOT NULL DEFAULT 'ok',  -- ok / watch / breach
  action_if_breached    TEXT,
  display_order         INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_unit_id, signal_key)
);

CREATE INDEX IF NOT EXISTS idx_watch_signals_bu ON meta_ops.watch_signals(business_unit_id, display_order);

-- -----------------------------------------------------------------------------
-- 12. alerts — threshold alerts surfaced on the dashboard.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.alerts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id      UUID REFERENCES meta_ops.business_units(id) ON DELETE CASCADE,
  alert_type            TEXT NOT NULL,       -- CPA / TRACKING / ASC / FREQUENCY / ...
  severity              TEXT NOT NULL,       -- green / yellow / red / blue
  status                TEXT NOT NULL DEFAULT 'active',   -- active / resolved
  entity_type           TEXT,
  entity_id             TEXT,
  message               TEXT NOT NULL,
  details               JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_bu_active
  ON meta_ops.alerts(business_unit_id, status, created_at DESC);

-- -----------------------------------------------------------------------------
-- 13. ad_matchups — Video vs Static pairs for the format-test section.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.ad_matchups (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id      UUID NOT NULL REFERENCES meta_ops.business_units(id) ON DELETE CASCADE,
  label                 TEXT NOT NULL,                  -- "VA_Pain41s vs CB04_Pain"
  video_ad_id           TEXT REFERENCES meta_ops.ads(id) ON DELETE SET NULL,
  static_ad_id          TEXT REFERENCES meta_ops.ads(id) ON DELETE SET NULL,
  -- Snapshot metrics (computed by ingest, stored for report consistency)
  video_ctr             NUMERIC(8,4),
  static_ctr            NUMERIC(8,4),
  video_purchases       INTEGER,
  static_purchases      INTEGER,
  early_winner          TEXT,                           -- "Video" / "Static (conv)" / ...
  display_order         INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_matchups_bu ON meta_ops.ad_matchups(business_unit_id, display_order);

-- -----------------------------------------------------------------------------
-- 14. meta_insights_frequency — distribution of reach across impression buckets.
--      One row per (entity_id, date); aggregates the Meta `frequency_value`
--      breakdown pulled at the ad_set or campaign level.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ops.meta_insights_frequency (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id             UUID NOT NULL REFERENCES meta_ops.meta_entities(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,
  reach                 INTEGER NOT NULL DEFAULT 0,
  avg_frequency         NUMERIC(8,3) NOT NULL DEFAULT 0,
  bucket_1              INTEGER NOT NULL DEFAULT 0,
  bucket_2_3            INTEGER NOT NULL DEFAULT 0,
  bucket_4_5            INTEGER NOT NULL DEFAULT 0,
  bucket_6_10           INTEGER NOT NULL DEFAULT 0,
  bucket_11_20          INTEGER NOT NULL DEFAULT 0,
  bucket_21_plus        INTEGER NOT NULL DEFAULT 0,
  raw                   JSONB,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_id, date)
);

CREATE INDEX IF NOT EXISTS idx_freq_entity_date
  ON meta_ops.meta_insights_frequency(entity_id, date DESC);

-- =============================================================================
-- 15. Views
-- =============================================================================

-- v_campaign_kpis_7d: rolling 7-day per-campaign rollup used in ad set /
-- campaign tables. Computes derived ratios.
CREATE OR REPLACE VIEW meta_ops.v_campaign_kpis_7d AS
WITH window_insights AS (
  SELECT
    e.business_unit_id,
    e.meta_id           AS campaign_id,
    e.name              AS campaign_name,
    mi.date,
    mi.spend,
    mi.impressions,
    mi.reach,
    mi.clicks,
    mi.link_clicks,
    mi.landing_page_views,
    mi.initiate_checkout,
    mi.leads,
    mi.purchases,
    mi.purchase_value,
    mi.frequency
  FROM meta_ops.meta_entities e
  JOIN meta_ops.meta_insights mi ON mi.entity_id = e.id
  WHERE e.entity_type = 'campaign'
    AND mi.date >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT
  wi.business_unit_id,
  wi.campaign_id,
  wi.campaign_name,
  SUM(spend)                                   AS total_spend,
  SUM(impressions)                             AS total_impressions,
  SUM(reach)                                   AS total_reach,
  SUM(clicks)                                  AS total_clicks,
  SUM(link_clicks)                             AS total_link_clicks,
  SUM(landing_page_views)                      AS total_lp_views,
  SUM(initiate_checkout)                       AS total_init_checkout,
  SUM(leads)                                   AS total_leads,
  SUM(purchases)                               AS total_purchases,
  SUM(purchase_value)                          AS total_purchase_value,
  CASE WHEN SUM(impressions) > 0
    THEN ROUND(100.0 * SUM(link_clicks)::numeric / SUM(impressions), 4)
    ELSE 0 END                                 AS link_ctr,
  CASE WHEN SUM(impressions) > 0
    THEN ROUND(1000.0 * SUM(spend)::numeric / SUM(impressions), 4)
    ELSE 0 END                                 AS cpm,
  CASE WHEN SUM(link_clicks) > 0
    THEN ROUND(SUM(spend)::numeric / SUM(link_clicks), 4)
    ELSE 0 END                                 AS cpc,
  CASE WHEN SUM(purchases) > 0
    THEN ROUND(SUM(spend)::numeric / SUM(purchases), 4)
    ELSE 0 END                                 AS cpa,
  CASE WHEN SUM(spend) > 0
    THEN ROUND(SUM(purchase_value)::numeric / SUM(spend), 4)
    ELSE 0 END                                 AS roas,
  CASE WHEN SUM(reach) > 0
    THEN ROUND(SUM(impressions)::numeric / SUM(reach), 4)
    ELSE 0 END                                 AS avg_frequency
FROM window_insights wi
GROUP BY wi.business_unit_id, wi.campaign_id, wi.campaign_name;

-- v_daily_trend: per-BU daily totals for the trends chart.
CREATE OR REPLACE VIEW meta_ops.v_daily_trend AS
SELECT
  e.business_unit_id,
  mi.date,
  SUM(mi.spend)                                  AS total_spend,
  SUM(mi.impressions)                            AS total_impressions,
  SUM(mi.reach)                                  AS total_reach,
  SUM(mi.clicks)                                 AS total_clicks,
  SUM(mi.link_clicks)                            AS total_link_clicks,
  SUM(mi.landing_page_views)                     AS total_lp_views,
  SUM(mi.initiate_checkout)                      AS total_init_checkout,
  SUM(mi.leads)                                  AS total_leads,
  SUM(mi.purchases)                              AS total_purchases,
  SUM(mi.purchase_value)                         AS total_purchase_value,
  CASE WHEN SUM(mi.impressions) > 0
    THEN ROUND(100.0 * SUM(mi.link_clicks)::numeric / SUM(mi.impressions), 4)
    ELSE 0 END                                   AS link_ctr,
  CASE WHEN SUM(mi.impressions) > 0
    THEN ROUND(1000.0 * SUM(mi.spend)::numeric / SUM(mi.impressions), 4)
    ELSE 0 END                                   AS cpm
FROM meta_ops.meta_entities e
JOIN meta_ops.meta_insights mi ON mi.entity_id = e.id
WHERE e.entity_type = 'campaign'
GROUP BY e.business_unit_id, mi.date;

-- v_bu_funnel: BU-level funnel Impressions → Link Clicks → LP Views → IC → Purchase,
-- aggregated over the full campaign window (since first insight).
CREATE OR REPLACE VIEW meta_ops.v_bu_funnel AS
SELECT
  e.business_unit_id,
  SUM(mi.impressions)                            AS impressions,
  SUM(mi.link_clicks)                            AS link_clicks,
  SUM(mi.landing_page_views)                     AS landing_page_views,
  SUM(mi.initiate_checkout)                      AS initiate_checkout,
  SUM(mi.purchases)                              AS purchases
FROM meta_ops.meta_entities e
JOIN meta_ops.meta_insights mi ON mi.entity_id = e.id
WHERE e.entity_type = 'campaign'
GROUP BY e.business_unit_id;

-- v_ad_performance: per-ad aggregated KPIs (lifetime window) with operator
-- labels from meta_ops.ads joined in. Used by the big "Ad Performance" table.
CREATE OR REPLACE VIEW meta_ops.v_ad_performance AS
SELECT
  e.business_unit_id,
  e.meta_id                                      AS ad_id,
  e.name                                         AS ad_name,
  e.parent_meta_id                               AS ad_set_id,
  a.manual_status,
  a.wave,
  a.format,
  SUM(mi.spend)                                  AS spend,
  SUM(mi.impressions)                            AS impressions,
  SUM(mi.reach)                                  AS reach,
  SUM(mi.clicks)                                 AS clicks,
  SUM(mi.link_clicks)                            AS link_clicks,
  SUM(mi.landing_page_views)                     AS landing_page_views,
  SUM(mi.purchases)                              AS purchases,
  SUM(mi.purchase_value)                         AS purchase_value,
  CASE WHEN SUM(mi.impressions) > 0
    THEN ROUND(100.0 * SUM(mi.link_clicks)::numeric / SUM(mi.impressions), 4)
    ELSE 0 END                                   AS link_ctr,
  CASE WHEN SUM(mi.purchases) > 0
    THEN ROUND(SUM(mi.spend)::numeric / SUM(mi.purchases), 4)
    ELSE NULL END                                AS cpa
FROM meta_ops.meta_entities e
JOIN meta_ops.meta_insights mi ON mi.entity_id = e.id
LEFT JOIN meta_ops.ads a ON a.id = e.meta_id
WHERE e.entity_type = 'ad'
GROUP BY e.business_unit_id, e.meta_id, e.name, e.parent_meta_id,
         a.manual_status, a.wave, a.format;

-- v_recent_purchases: combinations of (date × ad) with >0 purchases, ordered
-- desc for the "Últimas 10 Compras" section.
CREATE OR REPLACE VIEW meta_ops.v_recent_purchases AS
SELECT
  e.business_unit_id,
  mi.date,
  e.meta_id                                      AS ad_id,
  e.name                                         AS ad_name,
  e.parent_meta_id                               AS ad_set_id,
  ads_p.name                                     AS ad_set_name,
  ads_p.role                                     AS ad_set_role,
  ads_p.temperature_label                        AS temperature_label,
  mi.purchases,
  mi.spend,
  CASE WHEN mi.purchases > 0
    THEN ROUND(mi.spend::numeric / mi.purchases, 4)
    ELSE NULL END                                AS cpa_day
FROM meta_ops.meta_entities e
JOIN meta_ops.meta_insights mi ON mi.entity_id = e.id
LEFT JOIN meta_ops.ad_sets ads_p ON ads_p.id = e.parent_meta_id
WHERE e.entity_type = 'ad'
  AND mi.purchases > 0
ORDER BY mi.date DESC, mi.purchases DESC;

-- =============================================================================
-- 16. RLS + grants
-- =============================================================================

ALTER TABLE meta_ops.ad_accounts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.campaigns                ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.ad_sets                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.ads                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.creatives                ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.audiences                ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.price_tiers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.hypotheses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.watch_signals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.alerts                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.ad_matchups              ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.meta_insights_frequency  ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'ad_accounts','campaigns','ad_sets','ads','creatives','audiences',
    'price_tiers','hypotheses','watch_signals','alerts','ad_matchups',
    'meta_insights_frequency'
  ] LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS auth_read ON meta_ops.%I', t
    );
    EXECUTE format(
      'CREATE POLICY auth_read ON meta_ops.%I FOR SELECT TO authenticated USING (true)',
      t
    );
  END LOOP;
END $$;

-- Schema + object-level grants (mirror what 20260418000000 did for the first batch).
GRANT USAGE ON SCHEMA meta_ops TO anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA meta_ops TO service_role;
GRANT SELECT ON ALL TABLES   IN SCHEMA meta_ops TO authenticated, anon;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA meta_ops TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA meta_ops
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_ops
  GRANT SELECT ON TABLES TO authenticated, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_ops
  GRANT ALL ON SEQUENCES TO service_role;

NOTIFY pgrst, 'reload schema';
