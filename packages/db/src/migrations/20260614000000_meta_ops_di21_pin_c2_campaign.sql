-- DI21 dashboard: re-pin the campaign from the finished Q2 edition to Cohort 2.
--
-- The di21 BU config pins `campaign_meta_id` to DI21-2026-Q2 (23853990015710795,
-- ended 2026-04-26, last insight 2026-05-01). The live campaign DI21-C2-2026
-- (23856782832590795, spending since 2026-06-08) is synced in meta_ops but the
-- dashboard never shows it: the pin wins, and without a pin the spend heuristic
-- would still pick Q2 (higher lifetime spend). Window per launch DI21-C2:
-- cart opens 2026-06-10, closes 2026-06-30 23:59 (America/Lima); paid started
-- 2026-06-08.
--
-- NOTE: daily_budget / total_budget still hold the Q2 plan ($595/$7,125) —
-- update them when the C2 ad budget is confirmed (progress bar reads them).
--
-- Idempotent: jsonb merge, safe to re-run.

UPDATE meta_ops.business_units bu
SET config = bu.config || jsonb_build_object(
  'campaign_meta_id', '23856782832590795',
  'campaign_code', 'DI21-C2',
  'campaign_label', 'Desinflámate 21 · Cohort 2 (German Roz)',
  'campaign_window', jsonb_build_object(
    'starts_on', '2026-06-08',
    'ends_on', '2026-06-30',
    'duration_days', 23,
    'deadline_label', '2026-06-30 23:59'
  ),
  'phases', jsonb_build_array(
    jsonb_build_object('key', 'learning',     'label', 'Learning (D1-3)',       'day_start', 1,  'day_end', 3),
    jsonb_build_object('key', 'early_read',   'label', 'Early Read (D4-7)',     'day_start', 4,  'day_end', 7),
    jsonb_build_object('key', 'optimization', 'label', 'Optimization (D8-14)',  'day_start', 8,  'day_end', 14),
    jsonb_build_object('key', 'scaling',      'label', 'Scaling (D15+)',        'day_start', 15, 'day_end', 23)
  )
)
FROM meta_ops.organizers o
WHERE bu.organizer_id = o.id
  AND o.slug = 'german-roz'
  AND bu.slug = 'di21';
