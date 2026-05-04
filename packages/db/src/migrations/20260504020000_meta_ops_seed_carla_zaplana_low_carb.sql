-- =============================================================================
-- Seed: Carla Zaplana organizer + Low Carb Challenge business unit.
--
-- Dashboard URL: /carla-zaplana/low-carb
-- Match strategy: prefix → all Meta campaigns whose name starts with 'LOWCARB_'.
-- Ad account: act_99222470 (USD).
-- Token: stored separately (encrypted) via packages/meta-ads/src/scripts/encrypt-token.ts.
--
-- Idempotent via ON CONFLICT / targeted UPDATE.
-- =============================================================================

SET search_path = public;

-- -----------------------------------------------------------------------------
-- 1. Organizer (Meta ad account owner — Carla Zaplana).
-- -----------------------------------------------------------------------------
INSERT INTO meta_ops.organizers (slug, name, ad_account_id)
VALUES ('carla-zaplana', 'Carla Zaplana', 'act_99222470')
ON CONFLICT (slug) DO UPDATE SET
  name          = EXCLUDED.name,
  ad_account_id = EXCLUDED.ad_account_id,
  updated_at    = now();

-- -----------------------------------------------------------------------------
-- 2. Business Unit (Low Carb Challenge) with full BuConfig + KpiTargets shape
--    expected by apps/admin/src/lib/dashboard/dashboard-adapter.ts.
-- -----------------------------------------------------------------------------
INSERT INTO meta_ops.business_units (organizer_id, slug, name, config, kpi_targets)
SELECT
  o.id,
  'low-carb',
  'Low Carb Challenge',
  jsonb_build_object(
    'match_strategy',       'prefix',
    'campaign_name_prefix', 'LOWCARB_',
    'attribution_window',   '7d_click_1d_view',

    -- Dashboard renderer fields (BuConfig contract)
    'objective',            'OUTCOME_SALES',
    'event_type',           'Purchase',
    'attribution',          '7d_click_1d_view',
    'landing_url',          'TBD',
    'campaign_code',        'LOWCARB-2026-Q2',
    'campaign_label',       'Low Carb Challenge (Carla Zaplana)',
    'timezone',             'America/Mexico_City',
    'campaign_window', jsonb_build_object(
      'starts_on',      '2026-04-22',
      'ends_on',        '2026-05-24',
      'duration_days',  33,
      'deadline_label', '2026-05-24 23:59'
    ),
    'phases', jsonb_build_array(
      jsonb_build_object('key','learning',     'label','Learning (D1-3)',      'day_start', 1,  'day_end', 3),
      jsonb_build_object('key','early_read',   'label','Early Read (D4-7)',    'day_start', 4,  'day_end', 7),
      jsonb_build_object('key','optimization', 'label','Optimization (D8-21)', 'day_start', 8,  'day_end', 21),
      jsonb_build_object('key','scaling',      'label','Scaling (D22-33)',     'day_start', 22, 'day_end', 33)
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
    'cpm_threshold',         10.0,
    'click_to_lp_target',    75.0
  ),
  jsonb_build_object(
    'target_cpa',                35,
    'breakeven_cpa',             65,
    'kill_cpa',                  80,
    'kill_window_days',           3,
    'revenue_per_conv',          89,
    'target_roas',              2.5,
    'target_total_conversions', 200
  )
FROM meta_ops.organizers o
WHERE o.slug = 'carla-zaplana'
ON CONFLICT (organizer_id, slug) DO UPDATE SET
  name        = EXCLUDED.name,
  config      = EXCLUDED.config,
  kpi_targets = EXCLUDED.kpi_targets,
  updated_at  = now();

-- -----------------------------------------------------------------------------
-- 3. Price tiers (USD).
--    From operator brief 2026-05-04:
--      Apr 22 – May 6  Early bird 1   75€ / $79  / $1,350 MXN
--      May 7 – May 18  Early bird 2   85€ / $89  / $1,550 MXN
--      May 19 – May 24 Regular        95€ / $99  / $1,700 MXN
-- -----------------------------------------------------------------------------
WITH lc AS (
  SELECT bu.id
  FROM meta_ops.business_units bu
  JOIN meta_ops.organizers o ON o.id = bu.organizer_id
  WHERE o.slug = 'carla-zaplana' AND bu.slug = 'low-carb'
  LIMIT 1
)
INSERT INTO meta_ops.price_tiers (
  business_unit_id, label, price, currency, starts_on, ends_on, cutover_time, display_order
)
VALUES
  ((SELECT id FROM lc), 'Early bird 1', 79, 'USD', '2026-04-22', '2026-05-06', NULL, 1),
  ((SELECT id FROM lc), 'Early bird 2', 89, 'USD', '2026-05-07', '2026-05-18', NULL, 2),
  ((SELECT id FROM lc), 'Regular',      99, 'USD', '2026-05-19', '2026-05-24', NULL, 3)
ON CONFLICT (business_unit_id, starts_on) DO UPDATE SET
  label         = EXCLUDED.label,
  price         = EXCLUDED.price,
  currency      = EXCLUDED.currency,
  ends_on       = EXCLUDED.ends_on,
  cutover_time  = EXCLUDED.cutover_time,
  display_order = EXCLUDED.display_order,
  updated_at    = now();

NOTIFY pgrst, 'reload schema';
