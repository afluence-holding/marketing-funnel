-- =============================================================================
-- DI21 operator-managed seed: price tiers, hypotheses, watch signals,
-- extended BU config/kpi_targets, and ad-set / ad labels.
--
-- Sourced 1:1 from desinflamate21-report-2026-04-22.html so the dashboard
-- renders identically from the DB.
--
-- Idempotent via ON CONFLICT / targeted UPDATE.
-- =============================================================================

SET search_path = public;

-- -----------------------------------------------------------------------------
-- 1. Extend business_units.config and kpi_targets for DI21.
-- -----------------------------------------------------------------------------
UPDATE meta_ops.business_units
SET
  config = config
    || jsonb_build_object(
      'objective',              'OUTCOME_SALES',
      'event_type',              'Purchase',
      'attribution',             '7d_click',
      'landing_url',             'nutricion.germanroz.com/vsl-desinflamate',
      'campaign_code',           'DI21-2026-Q2',
      'campaign_label',          'Desinflamate 21 (German Roz)',
      'campaign_window', jsonb_build_object(
        'starts_on', '2026-04-08',
        'ends_on',   '2026-04-26',
        'duration_days', 19,
        'deadline_label', '2026-04-26 23:59'
      ),
      'phases', jsonb_build_array(
        jsonb_build_object('key','learning',     'label','Learning (D1-3)',     'day_start', 1,  'day_end', 3),
        jsonb_build_object('key','early_read',   'label','Early Read (D4-7)',   'day_start', 4,  'day_end', 7),
        jsonb_build_object('key','optimization', 'label','Optimization (D8-14)','day_start', 8,  'day_end', 14),
        jsonb_build_object('key','scaling',      'label','Scaling (D15+)',      'day_start', 15, 'day_end', 19)
      ),
      'total_budget',            7125,
      'daily_budget',            595,
      'cus_seed_size',           2400,
      'fatigue_thresholds', jsonb_build_object(
        'cus_daily_freq_watch',  3.0,
        'cus_daily_freq_alert',  5.0,
        'rmk_daily_freq_watch',  5.0,
        'cartab_daily_freq_watch', 3.5,
        'freq_6plus_healthy_max_pct', 15.0,
        'freq_6plus_watch_max_pct',   25.0
      ),
      'link_ctr_target',         2.0,
      'link_ctr_warn',           1.5,
      'cpm_threshold',           10.0,
      'click_to_lp_target',      75.0
    ),
  kpi_targets = kpi_targets
    || jsonb_build_object(
      'target_cpa',          40,
      'breakeven_cpa',       58,
      'kill_cpa',            65,
      'kill_window_days',    3,
      'revenue_per_conv',    87,
      'target_roas',         2.5,
      'target_total_conversions', 150
    ),
  updated_at = now()
WHERE slug = 'di21';

-- -----------------------------------------------------------------------------
-- 2. price_tiers
-- -----------------------------------------------------------------------------
WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug = 'di21' LIMIT 1)
INSERT INTO meta_ops.price_tiers (
  business_unit_id, label, price, currency, starts_on, ends_on, cutover_time, display_order
)
VALUES
  ((SELECT id FROM di21), 'Early bird', 67, 'USD', '2026-04-08', '2026-04-10', NULL,                          1),
  ((SELECT id FROM di21), 'Standard',   77, 'USD', '2026-04-11', '2026-04-19', '2026-04-11 12:00:00-05:00',   2),
  ((SELECT id FROM di21), 'Final',      87, 'USD', '2026-04-20', '2026-04-26', NULL,                          3)
ON CONFLICT (business_unit_id, starts_on) DO UPDATE SET
  label         = EXCLUDED.label,
  price         = EXCLUDED.price,
  currency      = EXCLUDED.currency,
  ends_on       = EXCLUDED.ends_on,
  cutover_time  = EXCLUDED.cutover_time,
  display_order = EXCLUDED.display_order,
  updated_at    = now();

-- -----------------------------------------------------------------------------
-- 3. hypotheses H1..H8
-- -----------------------------------------------------------------------------
WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug = 'di21' LIMIT 1)
INSERT INTO meta_ops.hypotheses (
  business_unit_id, code, statement, current_reading, success_criteria, status, display_order
) VALUES
  ((SELECT id FROM di21), 'H1', 'Advantage+ expands effectively from 2,400 seed',
     'Reach 53,078 = 22.1x seed, CPA $35.27', 'CPA <$53 at scale', 'testing', 1),
  ((SELECT id FROM di21), 'H2', 'Seed provides strong enough signal for algorithm',
     '86 CUS purchases, $35.27 CPA', 'CUS 5+ purchases/day', 'testing', 2),
  ((SELECT id FROM di21), 'H3', 'NB2 surrealist imagery resonates with 30+ women Peru',
     'Best CTR 16.1%', 'CTR >1% across 3+ concepts', 'testing', 3),
  ((SELECT id FROM di21), 'H4', 'Retargeting with urgency drives highest ROAS',
     'RMK 38p, 6.0x ROAS', 'RMK ROAS >2.5x', 'testing', 4),
  ((SELECT id FROM di21), 'H5', 'Video format outperforms static in CUS',
     'Videos: higher CTR. Statics: more purchases', 'Video CTR > Static +0.3%', 'testing', 5),
  ((SELECT id FROM di21), 'H6', '19-day window allows 150-200 total conversions',
     '134 in 15 days (~8.9/day)', '150+ total conversions', 'testing', 6),
  ((SELECT id FROM di21), 'H7', 'Food-dominant visuals pass Meta compliance',
     '0 rejections, all ads approved', '0 rejections', 'validated', 7),
  ((SELECT id FROM di21), 'H8', 'CAPI + Pixel enables Andromeda optimization',
     'CPA trend across 15 days', 'CPA flat/improving over time', 'testing', 8)
ON CONFLICT (business_unit_id, code) DO UPDATE SET
  statement        = EXCLUDED.statement,
  current_reading  = EXCLUDED.current_reading,
  success_criteria = EXCLUDED.success_criteria,
  status           = EXCLUDED.status,
  display_order    = EXCLUDED.display_order,
  updated_at       = now();

-- -----------------------------------------------------------------------------
-- 4. watch_signals (What to Watch Next)
-- -----------------------------------------------------------------------------
WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug = 'di21' LIMIT 1)
INSERT INTO meta_ops.watch_signals (
  business_unit_id, signal_key, signal_label, threshold_display,
  current_display, status, action_if_breached, display_order
) VALUES
  ((SELECT id FROM di21), 'cus_daily_freq_7d',   'CUS Daily Freq (7d)',   '<3.0',         '2.14',             'ok',    'Pause lowest-CTR CUS ads / inyectar Wave 3', 1),
  ((SELECT id FROM di21), 'cus_cpa',             'CUS CPA',               '<$58',         '$35.27',           'ok',    'Reduce CUS budget', 2),
  ((SELECT id FROM di21), 'rmk_cpa',             'RMK CPA',               '<$30',         '$12.98',           'ok',    'Pausar ads losers, ramp winners', 3),
  ((SELECT id FROM di21), 'rmk_daily_freq_7d',   'RMK Daily Freq (7d)',   '<5.0',         '1.75',             'ok',    'Expand RMK audiences', 4),
  ((SELECT id FROM di21), 'cartab_cpa',          'CARTAB CPA',            '<$22 target',  '—',                'watch', 'Kill si 0 compras @ $300 spend', 5),
  ((SELECT id FROM di21), 'cartab_daily_freq',   'CARTAB Daily Freq',     '<3.5',         '1.00',             'ok',    'Reducir budget o diversificar visual', 6),
  ((SELECT id FROM di21), 'cartab_purchases',    'CARTAB Purchases',      '≥1 by Apr 23', '0',                'watch', 'Si 0 por Apr 23 → evaluar pausar', 7),
  ((SELECT id FROM di21), 'cpm',                 'CPM',                   '<$10.0',       '$6.78',            'ok',    'Check auction pressure', 8),
  ((SELECT id FROM di21), 'link_ctr',            'Link CTR',              '>1.5%',        '1.83%',            'ok',    'Creative refresh', 9),
  ((SELECT id FROM di21), 'cus_reach_vs_seed',   'CUS Reach vs Seed',     '>>2,400',      '53,078 (22.1x)',   'ok',    'Test broader seed', 10),
  ((SELECT id FROM di21), 'purchase_velocity',   'Purchase velocity',     '>4/day',       '8.9/day',          'ok',    'Increase budget or refresh', 11),
  ((SELECT id FROM di21), 'price_tier',          'Price tier',            '$87',          'Final tier',       'ok',    'Monitor CVR change', 12),
  ((SELECT id FROM di21), 'deadline_carrito',    'Deadline carrito',      'Apr 26 23:59', '4d left',          'ok',    'Last push Apr 25-26', 13)
ON CONFLICT (business_unit_id, signal_key) DO UPDATE SET
  signal_label       = EXCLUDED.signal_label,
  threshold_display  = EXCLUDED.threshold_display,
  current_display    = EXCLUDED.current_display,
  status             = EXCLUDED.status,
  action_if_breached = EXCLUDED.action_if_breached,
  display_order      = EXCLUDED.display_order,
  updated_at         = now();

-- -----------------------------------------------------------------------------
-- 5. alerts (canonical set shown in the HTML on 2026-04-22)
--    Clear stale DI21 alerts created by marketing_ops mirror; re-insert
--    the canonical ones with display-friendly messages.
-- -----------------------------------------------------------------------------
WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug = 'di21' LIMIT 1)
DELETE FROM meta_ops.alerts WHERE business_unit_id = (SELECT id FROM di21);

WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug = 'di21' LIMIT 1)
INSERT INTO meta_ops.alerts (
  business_unit_id, alert_type, severity, status, message, details
) VALUES
  ((SELECT id FROM di21), 'CPA',          'green',  'active', 'CPA $30.88 — GREEN zone (target <$40, BE $58 @ $87). 134 purchases at exceptional efficiency.', NULL),
  ((SELECT id FROM di21), 'TRACKING',     'yellow', 'active', 'Meta reports $4187.69 revenue (134p = $31.25/p). Product is $87. Verify pixel value.', NULL),
  ((SELECT id FROM di21), 'ASC',          'blue',   'active', 'ASC PAUSED (Apr 21 strategic decision — foco final week en CUS + RMK + CARTAB). Lifetime: 10p / $611 spent / $61.10 CPA.', NULL),
  ((SELECT id FROM di21), 'CARTAB',       'blue',   'active', 'CARTAB status: PAUSED. Lifetime: 0p / $0.', NULL),
  ((SELECT id FROM di21), 'EXPANSION',    'green',  'active', 'CUS reach 53,078 = 22.1x seed. Advantage+ expanding strongly.', NULL),
  ((SELECT id FROM di21), 'FREQUENCY',    'green',  'active', 'Daily freq (7d) — CUS 2.14, ASC 1.57, RMK 1.75, CARTAB 1.00. Lifetime CUS 8.37 (acum 15d).', NULL),
  ((SELECT id FROM di21), 'PHASE',        'blue',   'active', 'Day 15 of SCALING phase. Full diagnosis mode.', NULL),
  ((SELECT id FROM di21), 'FATIGUE-DIST', 'red',    'active', '29.4% del reach vio ads 6+ veces (7d). Wave 2 puede no estar rescatando — evaluar Wave 3 o ampliar audiencia.', NULL);

-- -----------------------------------------------------------------------------
-- 6. Ad-set roles, temperatures, budgets (DI21).
--    Matches the four adsets visible in the Adset Performance table.
-- -----------------------------------------------------------------------------

-- CUS — Seed + Advantage+
UPDATE meta_ops.ad_sets
SET
  role              = 'CUS',
  temperature       = 'hybrid',
  temperature_label = 'HYBRID · Warm seed → Cold expansion (Adv+)',
  status            = 'ACTIVE',
  daily_budget      = COALESCE(daily_budget, 320),
  updated_at        = now()
WHERE name ILIKE '%CUS%Suscriptores%' OR name ILIKE 'D21_CUS%' OR name ILIKE '%CUS%Seed%';

-- ASC — Advantage+ Shopping (Cold)
UPDATE meta_ops.ad_sets
SET
  role              = 'ASC',
  temperature       = 'cold',
  temperature_label = 'COLD · Advantage+ Shopping',
  status            = 'PAUSED',
  daily_budget      = COALESCE(daily_budget, 30),
  updated_at        = now()
WHERE name ILIKE '%ASC%Broad%' OR name ILIKE 'D21_ASC%';

-- RMK — Retargeting Warm
UPDATE meta_ops.ad_sets
SET
  role              = 'RMK',
  temperature       = 'warm',
  temperature_label = 'RETARGETING · Warm',
  status            = 'ACTIVE',
  daily_budget      = COALESCE(daily_budget, 95),
  updated_at        = now()
WHERE name ILIKE '%RMK%Retargeting%' OR name ILIKE 'D21_RMK%';

-- CARTAB — Cart-Abandon 180d
UPDATE meta_ops.ad_sets
SET
  role              = 'CARTAB',
  temperature       = 'hot',
  temperature_label = 'RETARGETING · Cart-Abandon (Hottest)',
  status            = 'PAUSED',
  daily_budget      = COALESCE(daily_budget, 150),
  updated_at        = now()
WHERE name ILIKE '%CartAbandon%' OR name ILIKE '%CARTAB%' OR name ILIKE '%Cart-Abandon%';

-- INT — Interest-based Cold (new role for D21_INT_* ad sets not in the original HTML snapshot)
UPDATE meta_ops.ad_sets
SET
  role              = 'INT',
  temperature       = 'cold',
  temperature_label = 'COLD · Interest (Cocina/Fitness/Dieta)',
  updated_at        = now()
WHERE role IS NULL AND (name ILIKE 'D21_INT%' OR name ILIKE '%Interest%');

-- -----------------------------------------------------------------------------
-- 7. Ad format + wave by name-pattern heuristics.
--    VID = name contains '_V[A-C]_' or '_VC_' etc. Otherwise IMG.
--    Wave 2 = creative batch 15–24 (CUS_CB1[5-9], CUS_CB2[0-4], ASC_CB2X, etc.).
-- -----------------------------------------------------------------------------
-- First pass: name-pattern heuristics (used before first pull, when creative.type is null).
UPDATE meta_ops.ads SET format = 'VID' WHERE format IS NULL AND (name ~ '_V[A-Z]_' OR name ~ '_VC\y' OR name ~ '_VB\y' OR name ~ '_VA\y' OR name ILIKE '%9x16%');
UPDATE meta_ops.ads SET format = 'IMG' WHERE format IS NULL;

-- Second pass (authoritative): once the Meta pull has populated creatives, the creative's type
-- (VID via video_id, IMG via image_url) is the source of truth. Propagate to ads.format.
UPDATE meta_ops.ads a
SET format = c.type,
    updated_at = now()
FROM meta_ops.creatives c
WHERE c.id = a.creative_id
  AND c.type IN ('VID', 'IMG')
  AND a.business_unit_id = c.business_unit_id
  AND (a.format IS NULL OR a.format <> c.type);

UPDATE meta_ops.ads
SET wave = 'W2'
WHERE (name ~ 'CB1[5-9]' OR name ~ 'CB2[0-4]')
   OR name ILIKE 'ASC_%CB%'
   OR name ILIKE '%CB1[5-9]%'
   OR name ILIKE 'RMK_RMK0[5-9]%'
   OR name ILIKE 'RMK_RMK1[0-9]%';

UPDATE meta_ops.ads SET wave = 'W1' WHERE wave IS NULL;

-- -----------------------------------------------------------------------------
-- 8. Manual status bootstrap — default "Testing" for any ad lacking an
--    operator-assigned label. The dashboard adapter computes live
--    winner/watch/dead classifications from metrics; manual_status is the
--    override column.
-- -----------------------------------------------------------------------------
UPDATE meta_ops.ads SET manual_status = 'Testing' WHERE manual_status IS NULL;

-- -----------------------------------------------------------------------------
-- 9. ad_matchups (Format Test: Video vs Static)
-- -----------------------------------------------------------------------------
WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug = 'di21' LIMIT 1),
vids AS (
  SELECT id, name FROM meta_ops.ads WHERE business_unit_id = (SELECT id FROM di21) AND format = 'VID'
),
stats AS (
  SELECT id, name FROM meta_ops.ads WHERE business_unit_id = (SELECT id FROM di21) AND format = 'IMG'
)
INSERT INTO meta_ops.ad_matchups (
  business_unit_id, label, video_ad_id, static_ad_id,
  video_ctr, static_ctr, video_purchases, static_purchases, early_winner, display_order
)
SELECT (SELECT id FROM di21), t.label, v.id, s.id,
       t.video_ctr, t.static_ctr, t.video_purchases, t.static_purchases, t.early_winner, t.ord
FROM (VALUES
  ('VA_Pain41s vs CB04_Pain',         'CA_VA_Pain41s',    'CA_CB04_Pain',      2.88, 2.40, 3,  2, 'Video',         1),
  ('VB_Authority39s vs CB01_Authority','CA_VB_Authority39s','CA_CB01_Authority', 4.07, 2.53, 0,  2, 'Static (conv)', 2),
  ('VC_Cortisol50s vs CB02_Science',  'CA_VC_Cortisol50s','CA_CB02_Science',   2.60, 1.89, 16, 0, 'Video',         3)
) AS t(label, video_name, static_name, video_ctr, static_ctr, video_purchases, static_purchases, early_winner, ord)
LEFT JOIN vids  v ON v.name = t.video_name
LEFT JOIN stats s ON s.name = t.static_name
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
