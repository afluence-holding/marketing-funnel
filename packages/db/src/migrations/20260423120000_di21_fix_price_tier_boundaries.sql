-- =============================================================================
-- Fix DI21 price tier boundaries
-- =============================================================================
-- Operator confirmed: Standard tier (USD 77) was active until 2026-04-21 23:59
-- Lima time. Final tier (USD 87) actually started on 2026-04-22.
--
-- Previous seed had Standard ending 2026-04-19 and Final starting 2026-04-20,
-- which over-valued ~2 days of purchases at $87 instead of the correct $77.
--
-- Adapter `priceForDate(iso)` reads `starts_on/ends_on` to value revenue, so
-- this single update fixes:
--   • HOY card sub-text  (no change today, still $87)
--   • Range / Total tiles (recompute purchases on 04-20 and 04-21)
--   • Last-5-days strip   (cards for 04-20 / 04-21 will now show $77)
--   • KPI ROAS / CPA      (revenue accumulator uses priceForDate per day)
--   • Ad set ROAS rollup  (same priceForDate per-day loop)
-- =============================================================================

WITH di21 AS (
  SELECT id FROM meta_ops.business_units WHERE slug = 'di21' LIMIT 1
)
UPDATE meta_ops.price_tiers AS pt
SET    ends_on   = '2026-04-21'::date,
       updated_at = now()
FROM   di21
WHERE  pt.business_unit_id = di21.id
  AND  pt.label = 'Standard';

WITH di21 AS (
  SELECT id FROM meta_ops.business_units WHERE slug = 'di21' LIMIT 1
)
UPDATE meta_ops.price_tiers AS pt
SET    starts_on  = '2026-04-22'::date,
       updated_at = now()
FROM   di21
WHERE  pt.business_unit_id = di21.id
  AND  pt.label = 'Final';

-- Sanity check: emit the corrected tier window so the migration log shows the
-- new boundaries. Fails loud if either row was missed.
DO $$
DECLARE
  std_end   date;
  fin_start date;
BEGIN
  SELECT pt.ends_on INTO std_end
    FROM meta_ops.price_tiers pt
    JOIN meta_ops.business_units bu ON bu.id = pt.business_unit_id
   WHERE bu.slug = 'di21' AND pt.label = 'Standard';
  SELECT pt.starts_on INTO fin_start
    FROM meta_ops.price_tiers pt
    JOIN meta_ops.business_units bu ON bu.id = pt.business_unit_id
   WHERE bu.slug = 'di21' AND pt.label = 'Final';

  IF std_end IS DISTINCT FROM '2026-04-21'::date THEN
    RAISE EXCEPTION 'DI21 Standard ends_on did not update (got %)', std_end;
  END IF;
  IF fin_start IS DISTINCT FROM '2026-04-22'::date THEN
    RAISE EXCEPTION 'DI21 Final starts_on did not update (got %)', fin_start;
  END IF;

  RAISE NOTICE 'DI21 price tiers fixed → Standard ends %, Final starts %', std_end, fin_start;
END $$;
