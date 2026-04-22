-- =============================================================================
-- DI21 fixture seed — populates meta_ops with the exact state reflected in
-- desinflamate21-report-2026-04-22.html, so the dashboard renders 1:1 from DB
-- (no hardcoded values in the renderer).
--
-- Scope:
--   - ad_account act_738446095781713 (Germán Roz)
--   - 1 campaign DI21-2026-Q2
--   - 4 ad_sets: CUS / ASC / RMK / CARTAB (with rich targeting jsonb)
--   - 46 ads with format / wave / manual_status
--   - 46 placeholder creatives (one per ad)
--   - meta_entities for all + meta_insights daily (campaign) / lifetime (adsets, ads)
--   - meta_insights_frequency for the Frequency Distribution section
--
-- Idempotent via ON CONFLICT.
-- =============================================================================

SET search_path = public;

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. ad_account — Germán Roz
-- -----------------------------------------------------------------------------
INSERT INTO meta_ops.ad_accounts (meta_account_id, organizer_id, name, currency, timezone, account_status)
SELECT 'act_738446095781713', o.id, 'Germán Roz', 'USD', 'America/Lima', 'ACTIVE'
FROM meta_ops.organizers o WHERE o.slug = 'german-roz'
ON CONFLICT (meta_account_id) DO UPDATE
  SET name = EXCLUDED.name, updated_at = now();

-- -----------------------------------------------------------------------------
-- 2. campaign — DI21-2026-Q2
-- -----------------------------------------------------------------------------
WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug='di21' LIMIT 1)
INSERT INTO meta_ops.campaigns (
  id, account_id, business_unit_id, name, objective, status, effective_status,
  campaign_type, vertical, funnel_stage, daily_budget, lifetime_budget,
  start_time, stop_time
)
SELECT
  'DI21-2026-Q2', 'act_738446095781713', (SELECT id FROM di21),
  'DI21 Desinflámate 21', 'OUTCOME_SALES', 'ACTIVE', 'ACTIVE',
  'abo', 'salud', 'bofu', 595, 7125,
  '2026-04-08 00:00:00-05:00'::timestamptz, '2026-04-26 23:59:59-05:00'::timestamptz
ON CONFLICT (id) DO UPDATE SET
  name             = EXCLUDED.name,
  business_unit_id = EXCLUDED.business_unit_id,
  objective        = EXCLUDED.objective,
  effective_status = EXCLUDED.effective_status,
  daily_budget     = EXCLUDED.daily_budget,
  lifetime_budget  = EXCLUDED.lifetime_budget,
  start_time       = EXCLUDED.start_time,
  stop_time        = EXCLUDED.stop_time,
  updated_at       = now();

-- -----------------------------------------------------------------------------
-- 3. ad_sets — CUS / ASC / RMK / CARTAB with rich targeting jsonb
-- -----------------------------------------------------------------------------
WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug='di21' LIMIT 1)
INSERT INTO meta_ops.ad_sets (
  id, campaign_id, business_unit_id, name, status, effective_status,
  daily_budget, optimization_goal, billing_event, targeting,
  role, temperature, temperature_label, updated_time
) VALUES
  ('di21_cus', 'DI21-2026-Q2', (SELECT id FROM (SELECT id FROM meta_ops.business_units WHERE slug='di21') t),
   'D21_CUS_Suscriptores-NoCompradores_$25', 'ACTIVE', 'ACTIVE',
   320, 'OFFSITE_CONVERSIONS', 'IMPRESSIONS',
   jsonb_build_object(
     'geo', jsonb_build_object('countries', jsonb_build_array('PE')),
     'demographics', jsonb_build_object('age_min', 18, 'age_max', 65, 'genders', 'all'),
     'custom_audiences', jsonb_build_array('D21_Suscriptores_NoCompradores'),
     'excluded_custom_audiences', jsonb_build_array('GR_Purchasers_180d'),
     'advantage_plus_audience', true
   ),
   'CUS', 'hybrid', 'HYBRID · Warm seed → Cold expansion (Adv+)',
   (now() - interval '2 days')),
  ('di21_asc', 'DI21-2026-Q2', (SELECT id FROM (SELECT id FROM meta_ops.business_units WHERE slug='di21') t),
   'D21_ASC_Broad_42USD', 'PAUSED', 'PAUSED',
   30, 'OFFSITE_CONVERSIONS', 'IMPRESSIONS',
   jsonb_build_object(
     'geo', jsonb_build_object('countries', jsonb_build_array('PE')),
     'demographics', jsonb_build_object('age_min', 18, 'age_max', 65, 'genders', 'female'),
     'excluded_custom_audiences', jsonb_build_array('D21_Suscriptores_NoCompradores','GR_Purchasers_180d'),
     'advantage_plus_audience', true,
     'placements', jsonb_build_array('facebook','instagram','whatsapp'),
     'devices', jsonb_build_array('mobile','desktop')
   ),
   'ASC', 'cold', 'COLD · Advantage+ Shopping',
   (now() - interval '1.6 days')),
  ('di21_rmk', 'DI21-2026-Q2', (SELECT id FROM (SELECT id FROM meta_ops.business_units WHERE slug='di21') t),
   'D21_RMK_Retargeting_20USD', 'ACTIVE', 'ACTIVE',
   95, 'OFFSITE_CONVERSIONS', 'IMPRESSIONS',
   jsonb_build_object(
     'geo', jsonb_build_object('countries', jsonb_build_array('PE')),
     'demographics', jsonb_build_object('age_min', 25, 'age_max', 65, 'genders', 'all'),
     'custom_audiences', jsonb_build_array('D21_LandingVisitors_7d','D21_VSL50plus_7d','GR_IGEngagers_90d','GR_VideoViewers75_30d','GR_VideoViewers_3s_365d'),
     'excluded_custom_audiences', jsonb_build_array('GR_Purchasers_180d'),
     'placements', jsonb_build_array('facebook','instagram'),
     'devices', jsonb_build_array('mobile','desktop')
   ),
   'RMK', 'warm', 'RETARGETING · Warm',
   (now() - interval '8.6 hours')),
  ('di21_cartab', 'DI21-2026-Q2', (SELECT id FROM (SELECT id FROM meta_ops.business_units WHERE slug='di21') t),
   'RMK-CartAbandon-180d', 'PAUSED', 'PAUSED',
   150, 'OFFSITE_CONVERSIONS', 'IMPRESSIONS',
   jsonb_build_object(
     'geo', jsonb_build_object('countries', jsonb_build_array('PE')),
     'demographics', jsonb_build_object('age_min', 25, 'age_max', 65, 'genders', 'all'),
     'custom_audiences', jsonb_build_array('IC_CartAbandon_180d_Clean'),
     'excluded_custom_audiences', jsonb_build_array('GR_Purchasers_180d'),
     'advantage_plus_audience', false,
     'placements', jsonb_build_array('facebook','instagram','audience_network','messenger'),
     'devices', jsonb_build_array('mobile','desktop')
   ),
   'CARTAB', 'hot', 'RETARGETING · Cart-Abandon (Hottest)',
   (now() - interval '7.5 hours'))
ON CONFLICT (id) DO UPDATE SET
  campaign_id       = EXCLUDED.campaign_id,
  business_unit_id  = EXCLUDED.business_unit_id,
  name              = EXCLUDED.name,
  status            = EXCLUDED.status,
  effective_status  = EXCLUDED.effective_status,
  daily_budget      = EXCLUDED.daily_budget,
  optimization_goal = EXCLUDED.optimization_goal,
  billing_event     = EXCLUDED.billing_event,
  targeting         = EXCLUDED.targeting,
  role              = EXCLUDED.role,
  temperature       = EXCLUDED.temperature,
  temperature_label = EXCLUDED.temperature_label,
  updated_time      = EXCLUDED.updated_time,
  updated_at        = now();

-- -----------------------------------------------------------------------------
-- 4. Ads fixture: 46 rows extracted from the "Ad Performance (53 ads)" table.
--    Columns (tuple): ad_id, ad_set_id, name, format, wave, manual_status,
--                     spend, imp, reach, link_clicks, link_ctr, lp_views,
--                     purchases, cpa
--    CPA is NULL when purchases = 0.
-- -----------------------------------------------------------------------------

CREATE TEMP TABLE IF NOT EXISTS _di21_ads (
  ad_id          TEXT,
  ad_set_id      TEXT,
  name           TEXT,
  format         TEXT,
  wave           TEXT,
  manual_status  TEXT,
  spend          NUMERIC,
  impressions    INTEGER,
  reach          INTEGER,
  link_clicks    INTEGER,
  link_ctr       NUMERIC,
  lp_views       INTEGER,
  purchases      INTEGER,
  cpa            NUMERIC
) ON COMMIT DROP;

INSERT INTO _di21_ads VALUES
  ('di21_ad_001', 'di21_cus',    'CA_VC_Cortisol50s',              'VID','W1','Winner', 613.85, 91599, 31175, 2378, 2.60, 1944, 16, 38.37),
  ('di21_ad_002', 'di21_cus',    'CUS_CB18_NeuralFood',            'IMG','W2','Watch',  525.40, 75199, 23973,  905, 1.20,  758, 13, 40.42),
  ('di21_ad_003', 'di21_cus',    'CA_CB09_Aspiracion',             'IMG','W1','Winner', 445.94, 62835, 20346,  983, 1.56,  891, 22, 20.27),
  ('di21_ad_004', 'di21_cus',    'CA_CB10_Ritual',                 'IMG','W1','Winner', 324.31, 45545, 16255,  754, 1.66,  664,  9, 36.03),
  ('di21_ad_005', 'di21_cus',    'CA_CB03_Aspiracion',             'IMG','W1','Watch',  272.69, 36877, 13839,  577, 1.56,  521,  6, 45.45),
  ('di21_ad_006', 'di21_asc',    'ASC_CB22_BreakfastDeception',    'IMG','W2','Active', 201.31, 39490, 20068,  989, 2.50,  883,  2,100.66),
  ('di21_ad_007', 'di21_cus',    'CUS_CB15_BodyReset',             'IMG','W2','Watch',  164.30, 31221, 14823,  383, 1.23,  349,  3, 54.77),
  ('di21_ad_008', 'di21_rmk',    'RMK_D1_P1_Deadline',             'IMG','W1','Winner', 161.77, 21574,  6647,  232, 1.08,  208, 14, 11.56),
  ('di21_ad_009', 'di21_cus',    'CUS_CB17_CortisolKitchen',       'IMG','W2','Winner', 157.20, 20268,  9546,  284, 1.40,  242,  5, 31.44),
  ('di21_ad_010', 'di21_asc',    'ASC_CB09_Winner_Clone',          'IMG','W2','Watch',  143.32, 23469, 12845,  298, 1.27,  269,  1,143.32),
  ('di21_ad_011', 'di21_asc',    'ASC_VC_Cortisol50s',             'VID','W2','Winner', 120.15, 25654, 16236,  503, 1.96,  420,  5, 24.03),
  ('di21_ad_012', 'di21_rmk',    'RMK_GR_PostergarSalud_9x16',     'IMG','W1','Winner', 108.03, 12910,  9643,  536, 4.15,  470,  6, 18.00),
  ('di21_ad_013', 'di21_cus',    'CA_VA_Pain41s',                  'VID','W1','Winner', 101.15, 13365,  7028,  385, 2.88,  288,  3, 33.72),
  ('di21_ad_014', 'di21_asc',    'ASC_CB21_Confrontation',         'IMG','W2','Watch',  100.25, 13930,  8668,  222, 1.59,  193,  2, 50.12),
  ('di21_ad_015', 'di21_cus',    'CA_CB04_Pain',                   'IMG','W1','Active',  93.31, 12651,  8246,  304, 2.40,  281,  2, 46.66),
  ('di21_ad_016', 'di21_cus',    'CA_CB06_Curiosidad',             'IMG','W1','Winner',  83.65, 14818,  8736,  248, 1.67,  234,  4, 20.91),
  ('di21_ad_017', 'di21_cus',    'CUS_CB19_SymptomsBody',          'IMG','W2','Watch',   81.63, 15273,  9461,  201, 1.32,  159,  1, 81.63),
  ('di21_ad_018', 'di21_rmk',    'RMK_RMK01_Deadline',             'IMG','W1','Winner',  75.92,  7310,  3378,  113, 1.55,   98,  8,  9.49),
  ('di21_ad_019', 'di21_rmk',    'RMK_RMK08_UrgencyHourglass',     'IMG','W2','Winner',  70.30,  7543,  3525,   92, 1.22,   83,  4, 17.57),
  ('di21_ad_020', 'di21_cus',    'CA_CB08_Permission',             'IMG','W1','Watch',   53.18,  9670,  6711,  188, 1.94,  169,  0, NULL),
  ('di21_ad_021', 'di21_cus',    'CA_CB01_Authority',              'IMG','W1','Winner',  43.69,  6312,  4570,  160, 2.53,  164,  2, 21.84),
  ('di21_ad_022', 'di21_cus',    'CA_VB_Authority39s',             'VID','W1','Active',  32.47,  3172,  2589,  129, 4.07,  114,  0, NULL),
  ('di21_ad_023', 'di21_rmk',    'RMK_RMK02_Access',               'IMG','W1','Winner',  27.70,  2445,  1114,   45, 1.84,   34,  1, 27.70),
  ('di21_ad_024', 'di21_asc',    'ASC_CB23_FogDoorway',            'IMG','W2','Watch',   18.30,  2574,  1902,   26, 1.01,   23,  0, NULL),
  ('di21_ad_025', 'di21_rmk',    'RMK_D1_P5_Transformation',       'IMG','W1','Winner',  14.90,  1909,  1394,   27, 1.41,   22,  3,  4.97),
  ('di21_ad_026', 'di21_cus',    'CA_CB11_Authority',              'IMG','W1','Watch',   14.00,  2296,  1837,   45, 1.96,   34,  0, NULL),
  ('di21_ad_027', 'di21_rmk',    'RMK_CB14_Belonging',             'IMG','W1','Watch',   12.72,  1067,   714,   15, 1.41,   15,  0, NULL),
  ('di21_ad_028', 'di21_asc',    'ASC_CB06_Curiosidad',            'IMG','W2','Watch',   12.25,  1572,  1333,   22, 1.40,   18,  0, NULL),
  ('di21_ad_029', 'di21_cus',    'CUS_CB20_HiddenInflam',          'IMG','W2','Watch',   12.01,  1561,  1266,   10, 0.64,   10,  0, NULL),
  ('di21_ad_030', 'di21_cus',    'CUS_CB16_MorningRitual',         'IMG','W2','Watch',   10.89,  1133,   869,   12, 1.06,   10,  0, NULL),
  ('di21_ad_031', 'di21_rmk',    'RMK_RMK05_FOMO',                 'IMG','W1','Winner',   8.81,  1067,   779,   23, 2.16,   18,  2,  4.41),
  ('di21_ad_032', 'di21_rmk',    'RMK_CB13_Urgencia',              'IMG','W1','Watch',    7.24,   757,   449,   10, 1.32,    9,  0, NULL),
  ('di21_ad_033', 'di21_asc',    'ASC_CB24_AspirationWarm',        'IMG','W2','Watch',    4.59,   548,   455,    7, 1.28,    6,  0, NULL),
  ('di21_ad_034', 'di21_cus',    'CA_CB02_Science',                'IMG','W1','Testing',  2.97,   371,   309,    7, 1.89,    4,  0, NULL),
  ('di21_ad_035', 'di21_rmk',    'RMK_RMK11_MirrorReflection',     'IMG','W2','Testing',  2.66,   340,   276,    3, 0.88,    2,  0, NULL),
  ('di21_ad_036', 'di21_asc',    'ASC_CB04_Pain',                  'IMG','W2','Testing',  2.58,   246,   235,   12, 4.88,   14,  0, NULL),
  ('di21_ad_037', 'di21_rmk',    'RMK_RMK06_PriceReframe',         'IMG','W2','Testing',  2.54,   341,   285,    8, 2.35,    6,  0, NULL),
  ('di21_ad_038', 'di21_asc',    'ASC_VA_Pain41s',                 'VID','W2','Testing',  1.84,   167,   160,    8, 4.79,    6,  0, NULL),
  ('di21_ad_039', 'di21_asc',    'ASC_CB03_Aspiracion',            'IMG','W2','Testing',  1.75,   129,   125,    9, 6.98,    7,  0, NULL),
  ('di21_ad_040', 'di21_asc',    'ASC_CB01_Authority',             'IMG','W2','Testing',  1.68,   184,   174,    6, 3.26,    4,  0, NULL),
  ('di21_ad_041', 'di21_asc',    'ASC_CB08_Permission',            'IMG','W2','Testing',  1.33,   174,   164,    7, 4.02,    6,  0, NULL),
  ('di21_ad_042', 'di21_asc',    'ASC_VB_Authority39s',            'VID','W2','Testing',  0.93,    91,    87,   10,10.99,    9,  0, NULL),
  ('di21_ad_043', 'di21_asc',    'ASC_CB02_Science',               'IMG','W2','Testing',  0.73,    56,    52,    2, 3.57,    1,  0, NULL),
  ('di21_ad_044', 'di21_rmk',    'RMK_GR_MomentoPerfecto_9x16',    'IMG','W1','Testing',  0.50,    56,    56,    9,16.07,    8,  0, NULL),
  ('di21_ad_045', 'di21_rmk',    'RMK_G41_Fase2_CierreCarrito',    'IMG','W1','Testing',  0.09,    22,    22,    0, 0.00,    0,  0, NULL),
  ('di21_ad_046', 'di21_rmk',    'RMK_G41_Fase2_Transformation',   'IMG','W1','Testing',  0.02,     4,     4,    0, 0.00,    0,  0, NULL),
  ('di21_ad_047', 'di21_cartab', 'CartAb_G41_UltimoPaso',          'IMG','W1','Testing',  0.01,     1,     1,    0, 0.00,    0,  0, NULL);

-- -----------------------------------------------------------------------------
-- 5. creatives — one stub per ad (operator can enrich later)
-- -----------------------------------------------------------------------------
WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug='di21' LIMIT 1)
INSERT INTO meta_ops.creatives (id, meta_creative_id, business_unit_id, type, format, headline, wave, lifecycle_stage)
SELECT
  gen_random_uuid(),
  a.ad_id || '_creative',
  (SELECT id FROM di21),
  a.format,
  CASE WHEN a.format = 'VID' THEN 'video' ELSE 'image' END,
  a.name,
  a.wave,
  lower(a.manual_status)
FROM _di21_ads a
ON CONFLICT (meta_creative_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. ads
-- -----------------------------------------------------------------------------
WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug='di21' LIMIT 1)
INSERT INTO meta_ops.ads (
  id, ad_set_id, business_unit_id, creative_id, name, status, effective_status,
  manual_status, wave, format
)
SELECT
  a.ad_id, a.ad_set_id, (SELECT id FROM di21),
  c.id, a.name,
  CASE WHEN a.manual_status IN ('Dead') THEN 'PAUSED' ELSE 'ACTIVE' END,
  CASE WHEN a.manual_status IN ('Dead') THEN 'PAUSED' ELSE 'ACTIVE' END,
  a.manual_status, a.wave, a.format
FROM _di21_ads a
LEFT JOIN meta_ops.creatives c ON c.meta_creative_id = (a.ad_id || '_creative')
ON CONFLICT (id) DO UPDATE SET
  ad_set_id        = EXCLUDED.ad_set_id,
  business_unit_id = EXCLUDED.business_unit_id,
  creative_id      = EXCLUDED.creative_id,
  name             = EXCLUDED.name,
  status           = EXCLUDED.status,
  manual_status    = EXCLUDED.manual_status,
  wave             = EXCLUDED.wave,
  format           = EXCLUDED.format,
  updated_at       = now();

-- -----------------------------------------------------------------------------
-- 7. meta_entities for campaign + 4 adsets + 47 ads
-- -----------------------------------------------------------------------------
WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug='di21' LIMIT 1)
INSERT INTO meta_ops.meta_entities (business_unit_id, entity_type, meta_id, parent_meta_id, name, status)
SELECT (SELECT id FROM di21), 'campaign', 'DI21-2026-Q2', NULL, 'DI21 Desinflámate 21', 'ACTIVE'
ON CONFLICT (business_unit_id, entity_type, meta_id) DO UPDATE SET
  name = EXCLUDED.name, status = EXCLUDED.status, updated_at = now();

WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug='di21' LIMIT 1)
INSERT INTO meta_ops.meta_entities (business_unit_id, entity_type, meta_id, parent_meta_id, name, status)
SELECT (SELECT id FROM di21), 'adset', s.id, s.campaign_id, s.name, s.status
FROM meta_ops.ad_sets s WHERE s.campaign_id = 'DI21-2026-Q2'
ON CONFLICT (business_unit_id, entity_type, meta_id) DO UPDATE SET
  name = EXCLUDED.name, status = EXCLUDED.status, updated_at = now();

WITH di21 AS (SELECT id FROM meta_ops.business_units WHERE slug='di21' LIMIT 1)
INSERT INTO meta_ops.meta_entities (business_unit_id, entity_type, meta_id, parent_meta_id, name, status)
SELECT (SELECT id FROM di21), 'ad', a.id, a.ad_set_id, a.name, a.status
FROM meta_ops.ads a WHERE a.business_unit_id = (SELECT id FROM di21)
ON CONFLICT (business_unit_id, entity_type, meta_id) DO UPDATE SET
  name = EXCLUDED.name, status = EXCLUDED.status, updated_at = now();

-- -----------------------------------------------------------------------------
-- 8. meta_insights
--
-- 8a. Campaign daily trend (15 days, Apr 08 → Apr 22) — exact trendData from
--     the HTML. Impressions/link_clicks/lp_views/ic distributed proportionally
--     to spend so lifetime totals roll up to what the HTML shows.
--
--     HTML lifetime totals:
--       spend       4137.66
--       impressions 609,997
--       reach       64,399   (non-additive — stored on Apr 22 only)
--       link_clicks 11,193
--       lp_views    9,672
--       init_ck     2,309
--       purchases   134
--
--     Proportional per-day value = lifetime_total * (day_spend / lifetime_spend).
-- -----------------------------------------------------------------------------

CREATE TEMP TABLE IF NOT EXISTS _di21_trend (date DATE, spend NUMERIC, purchases INTEGER, ctr NUMERIC, cpm NUMERIC) ON COMMIT DROP;
INSERT INTO _di21_trend VALUES
  ('2026-04-08',  28.02,  2, 2.708855, 6.378329),
  ('2026-04-09',  31.67,  8, 3.736264, 9.943485),
  ('2026-04-10',  30.31,  6, 3.637588, 10.208825),
  ('2026-04-11', 285.89, 11, 2.741194, 9.007814),
  ('2026-04-12', 232.98,  9, 2.471411, 6.313479),
  ('2026-04-13', 348.85,  7, 1.857617, 6.000275),
  ('2026-04-14', 334.07, 10, 1.722083, 5.943143),
  ('2026-04-15', 330.10,  8, 1.766887, 5.969798),
  ('2026-04-16', 363.97, 13, 1.526181, 5.685610),
  ('2026-04-17', 471.40,  9, 1.749588, 6.577001),
  ('2026-04-18', 343.49,  4, 1.624849, 7.046961),
  ('2026-04-19', 351.51, 17, 1.797635, 6.801796),
  ('2026-04-20', 403.93, 18, 1.488324, 7.757144),
  ('2026-04-21', 453.04,  9, 1.650614, 7.709220),
  ('2026-04-22', 128.43,  3, 2.412944, 9.034822);

WITH cam AS (
  SELECT e.id FROM meta_ops.meta_entities e
  WHERE e.entity_type = 'campaign' AND e.meta_id = 'DI21-2026-Q2' LIMIT 1
),
totals AS (
  SELECT SUM(spend) AS tspend FROM _di21_trend
)
INSERT INTO meta_ops.meta_insights (
  entity_id, date, tier, spend, impressions, reach, clicks,
  link_clicks, landing_page_views, initiate_checkout,
  leads, purchases, purchase_value
)
SELECT
  (SELECT id FROM cam),
  t.date,
  CASE
    WHEN t.date >= CURRENT_DATE                      THEN 'today'
    WHEN t.date >= CURRENT_DATE - INTERVAL '7 days'  THEN 'recent'
    WHEN t.date >= CURRENT_DATE - INTERVAL '30 days' THEN 'mid'
    ELSE 'historical'
  END,
  t.spend,
  ROUND((609997::numeric * t.spend / (SELECT tspend FROM totals)))::int,
  CASE WHEN t.date = '2026-04-22' THEN 64399 ELSE 0 END,
  ROUND((11193::numeric * t.spend / (SELECT tspend FROM totals)))::int,
  ROUND((11193::numeric * t.spend / (SELECT tspend FROM totals)))::int,
  ROUND((9672::numeric  * t.spend / (SELECT tspend FROM totals)))::int,
  ROUND((2309::numeric  * t.spend / (SELECT tspend FROM totals)))::int,
  0,
  t.purchases,
  (t.purchases::numeric * CASE
      WHEN t.date <= '2026-04-10' THEN 67
      WHEN t.date =  '2026-04-11' THEN 72   -- blend day per HTML
      WHEN t.date <= '2026-04-19' THEN 77
      ELSE 87
    END)
FROM _di21_trend t
ON CONFLICT (entity_id, date) DO UPDATE SET
  spend              = EXCLUDED.spend,
  impressions        = EXCLUDED.impressions,
  reach              = EXCLUDED.reach,
  clicks             = EXCLUDED.clicks,
  link_clicks        = EXCLUDED.link_clicks,
  landing_page_views = EXCLUDED.landing_page_views,
  initiate_checkout  = EXCLUDED.initiate_checkout,
  purchases          = EXCLUDED.purchases,
  purchase_value     = EXCLUDED.purchase_value,
  updated_at         = now();

-- 8b. Ad-set lifetime totals (single row dated 2026-04-22).
WITH lookup AS (
  SELECT e.id AS entity_id, e.meta_id
  FROM meta_ops.meta_entities e
  WHERE e.entity_type = 'adset'
    AND e.meta_id IN ('di21_cus','di21_asc','di21_rmk','di21_cartab')
)
INSERT INTO meta_ops.meta_insights (
  entity_id, date, tier, spend, impressions, reach, clicks,
  link_clicks, landing_page_views, initiate_checkout,
  leads, purchases, purchase_value
)
SELECT lookup.entity_id, '2026-04-22', 'today', v.spend, v.impressions, v.reach, v.clicks,
       v.link_clicks, v.lp_views, v.init_ck, 0, v.purchases, v.purchase_value
FROM (VALUES
  ('di21_cus',    3033.44, 448500, 53078, 8029, 8029, 6930, 1654,  86, 86*77.63),
  ('di21_asc',     611.01, 126130, 36272, 2472, 2472, 2121,  493,  10, 10*77.63),
  ('di21_rmk',     493.20,  35358, 14464,  692,  692,  620,  162,  38, 38*77.63),
  ('di21_cartab',    0.01,      1,     1,    0,    0,    0,    0,   0,  0)
) AS v(ad_set_id, spend, impressions, reach, clicks, link_clicks, lp_views, init_ck, purchases, purchase_value)
JOIN lookup ON lookup.meta_id = v.ad_set_id
ON CONFLICT (entity_id, date) DO UPDATE SET
  spend              = EXCLUDED.spend,
  impressions        = EXCLUDED.impressions,
  reach              = EXCLUDED.reach,
  clicks             = EXCLUDED.clicks,
  link_clicks        = EXCLUDED.link_clicks,
  landing_page_views = EXCLUDED.landing_page_views,
  initiate_checkout  = EXCLUDED.initiate_checkout,
  purchases          = EXCLUDED.purchases,
  purchase_value     = EXCLUDED.purchase_value,
  updated_at         = now();

-- 8c. Per-ad lifetime totals (single row dated 2026-04-22) from the _di21_ads temp table.
WITH lookup AS (
  SELECT e.id AS entity_id, e.meta_id
  FROM meta_ops.meta_entities e
  WHERE e.entity_type = 'ad'
)
INSERT INTO meta_ops.meta_insights (
  entity_id, date, tier, spend, impressions, reach, clicks,
  link_clicks, landing_page_views, initiate_checkout,
  leads, purchases, purchase_value
)
SELECT
  l.entity_id, '2026-04-22', 'today',
  a.spend, a.impressions, a.reach, a.link_clicks,
  a.link_clicks, a.lp_views, 0, 0, a.purchases, a.purchases * 77.63
FROM _di21_ads a
JOIN lookup l ON l.meta_id = a.ad_id
ON CONFLICT (entity_id, date) DO UPDATE SET
  spend              = EXCLUDED.spend,
  impressions        = EXCLUDED.impressions,
  reach              = EXCLUDED.reach,
  clicks             = EXCLUDED.clicks,
  link_clicks        = EXCLUDED.link_clicks,
  landing_page_views = EXCLUDED.landing_page_views,
  purchases          = EXCLUDED.purchases,
  purchase_value     = EXCLUDED.purchase_value,
  updated_at         = now();

-- -----------------------------------------------------------------------------
-- 9. meta_insights_frequency — the per-scope (TOTAL/CUS/ASC/RMK/CARTAB) bucket
--    distribution from the HTML's "Frequency Distribution (last 7d)" section.
--    Scope TOTAL is linked to the campaign entity; per-adset to each adset.
-- -----------------------------------------------------------------------------
WITH entities AS (
  SELECT meta_id, id AS entity_id
  FROM meta_ops.meta_entities
  WHERE meta_id IN ('DI21-2026-Q2','di21_cus','di21_asc','di21_rmk','di21_cartab')
)
INSERT INTO meta_ops.meta_insights_frequency (
  entity_id, date, reach, avg_frequency,
  bucket_1, bucket_2_3, bucket_4_5, bucket_6_10, bucket_11_20, bucket_21_plus
)
SELECT e.entity_id, '2026-04-22', v.reach, v.avg_freq,
       v.b1, v.b23, v.b45, v.b610, v.b1120, v.b21plus
FROM (VALUES
  ('DI21-2026-Q2', 59232, 5.93,
     ROUND(59232*0.376553)::int, ROUND(59232*0.227715)::int, ROUND(59232*0.101837)::int,
     ROUND(59232*0.128579)::int, ROUND(59232*0.094543)::int, ROUND(59232*0.070773)::int),
  ('di21_cus',     48112, 5.26,
     ROUND(48112*0.371799)::int, ROUND(48112*0.238444)::int, ROUND(48112*0.125707)::int,
     ROUND(48112*0.125042)::int, ROUND(48112*0.094446)::int, ROUND(48112*0.044563)::int),
  ('di21_asc',     33680, 2.70,
     ROUND(33680*0.513777)::int, ROUND(33680*0.273634)::int, ROUND(33680*0.105701)::int,
     ROUND(33680*0.079572)::int, ROUND(33680*0.022803)::int, ROUND(33680*0.004513)::int),
  ('di21_rmk',     10568, 3.46,
     ROUND(10568*0.493565)::int, ROUND(10568*0.247161)::int, ROUND(10568*0.096896)::int,
     ROUND(10568*0.093490)::int, ROUND(10568*0.052990)::int, ROUND(10568*0.015897)::int),
  ('di21_cartab',      1, 1.00, 1, 0, 0, 0, 0, 0)
) AS v(meta_id, reach, avg_freq, b1, b23, b45, b610, b1120, b21plus)
JOIN entities e ON e.meta_id = v.meta_id
ON CONFLICT (entity_id, date) DO UPDATE SET
  reach          = EXCLUDED.reach,
  avg_frequency  = EXCLUDED.avg_frequency,
  bucket_1       = EXCLUDED.bucket_1,
  bucket_2_3     = EXCLUDED.bucket_2_3,
  bucket_4_5     = EXCLUDED.bucket_4_5,
  bucket_6_10    = EXCLUDED.bucket_6_10,
  bucket_11_20   = EXCLUDED.bucket_11_20,
  bucket_21_plus = EXCLUDED.bucket_21_plus,
  updated_at     = now();

COMMIT;

NOTIFY pgrst, 'reload schema';
