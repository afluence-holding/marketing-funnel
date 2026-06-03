-- =============================================================================
-- Seed: Lucas con Luca$ organizer + main business unit (Reto + webinar funnel).
--
-- Dashboard URL: /lucas-con-lucas/main
-- Match strategy: prefix → Meta campaigns whose name starts with 'LUC'.
--
-- Ad account: act_687547837002735
-- Token: stored separately (encrypted) via packages/meta-ads/src/scripts/encrypt-token.ts
--
-- After applying:
--   npm run meta:encrypt-token -- --organizer-slug lucas-con-lucas --token 'EAAB...'
--   npm run meta:pull-lucas
--
-- Idempotent via ON CONFLICT / targeted UPDATE.
-- =============================================================================

SET search_path = public;

-- -----------------------------------------------------------------------------
-- 1. Organizer
-- -----------------------------------------------------------------------------
INSERT INTO meta_ops.organizers (slug, name, ad_account_id)
VALUES ('lucas-con-lucas', 'Lucas con Luca$', 'act_687547837002735')
ON CONFLICT (slug) DO UPDATE SET
  name          = EXCLUDED.name,
  ad_account_id = EXCLUDED.ad_account_id,
  updated_at    = now();

-- -----------------------------------------------------------------------------
-- 2. Business unit (main — aligns with API org lucas-con-lucas/main)
-- -----------------------------------------------------------------------------
INSERT INTO meta_ops.business_units (organizer_id, slug, name, config, kpi_targets)
SELECT
  o.id,
  'main',
  'Reto Lucas con Luca$',
  jsonb_build_object(
    'match_strategy',       'prefix',
    'campaign_name_prefix', 'LUC',
    'attribution_window',   '7d_click_1d_view',

    'objective',            'OUTCOME_SALES',
    'event_type',           'Purchase',
    'attribution',          '7d_click_1d_view',
    'landing_url',          'marketing.byafluence.com/lucas-con-lucas/reto',
    'campaign_code',        'LCL-2026-JUN',
    'campaign_label',       'Reto Lucas con Luca$ (Jun 2026)',
    'timezone',             'America/Santiago',
    'campaign_window', jsonb_build_object(
      'starts_on',      '2026-05-01',
      'ends_on',        '2026-07-31',
      'duration_days',  92,
      'deadline_label', '2026-07-31 23:59'
    ),
    'phases', jsonb_build_array(
      jsonb_build_object('key', 'pre_webinar',  'label', 'Pre-webinar / waitlist', 'day_start', 1,  'day_end', 34),
      jsonb_build_object('key', 'webinar',      'label', 'Webinar (Jun 4)',        'day_start', 35, 'day_end', 41),
      jsonb_build_object('key', 'cart_open',    'label', 'Cart open / early bird', 'day_start', 42, 'day_end', 59),
      jsonb_build_object('key', 'reto_live',    'label', 'Reto live (Jun 29+)',    'day_start', 60, 'day_end', 92)
    ),
    'total_budget',           0,
    'daily_budget',           0,
    'cus_seed_size',          0,
    'fatigue_thresholds', jsonb_build_object(
      'cus_daily_freq_watch',         3.0,
      'cus_daily_freq_alert',         5.0,
      'rmk_daily_freq_watch',         5.0,
      'cartab_daily_freq_watch',      3.5,
      'freq_6plus_healthy_max_pct',  15.0,
      'freq_6plus_watch_max_pct',    25.0
    ),
    'link_ctr_target',        2.0,
    'link_ctr_warn',          1.5,
    'cpm_threshold',         8000.0,
    'click_to_lp_target',    75.0
  ),
  jsonb_build_object(
    'target_cpa',                20000,
    'breakeven_cpa',             35000,
    'kill_cpa',                  45000,
    'kill_window_days',           3,
    'revenue_per_conv',         77000,
    'target_roas',                3.0,
    'target_total_conversions', 150
  )
FROM meta_ops.organizers o
WHERE o.slug = 'lucas-con-lucas'
ON CONFLICT (organizer_id, slug) DO UPDATE SET
  name        = EXCLUDED.name,
  config      = EXCLUDED.config,
  kpi_targets = EXCLUDED.kpi_targets,
  updated_at  = now();

-- -----------------------------------------------------------------------------
-- 3. Price tiers (CLP) — early bird / preventa / lanzamiento
-- -----------------------------------------------------------------------------
WITH lcl AS (
  SELECT bu.id
  FROM meta_ops.business_units bu
  JOIN meta_ops.organizers o ON o.id = bu.organizer_id
  WHERE o.slug = 'lucas-con-lucas' AND bu.slug = 'main'
  LIMIT 1
)
INSERT INTO meta_ops.price_tiers (
  business_unit_id, label, price, currency, starts_on, ends_on, cutover_time, display_order
)
VALUES
  ((SELECT id FROM lcl), 'Early bird',   77000,  'CLP', '2026-06-01', '2026-06-14', NULL, 1),
  ((SELECT id FROM lcl), 'Preventa',    110000,  'CLP', '2026-06-15', '2026-06-28', NULL, 2),
  ((SELECT id FROM lcl), 'Lanzamiento', 130000,  'CLP', '2026-06-29', '2026-07-31', NULL, 3)
ON CONFLICT (business_unit_id, starts_on) DO UPDATE SET
  label         = EXCLUDED.label,
  price         = EXCLUDED.price,
  currency      = EXCLUDED.currency,
  ends_on       = EXCLUDED.ends_on,
  cutover_time  = EXCLUDED.cutover_time,
  display_order = EXCLUDED.display_order,
  updated_at    = now();

NOTIFY pgrst, 'reload schema';
