-- =============================================================================
-- Ad set budget history
-- -----------------------------------------------------------------------------
-- Append-only log of every change to ad_sets.daily_budget. Powers the dashboard
-- "Recent Budget Bumps" table.
--
-- Two writers populate this table:
--   1. The pull diff (service.ts → upsertAdSetsRich) compares the incoming
--      daily_budget against the row already in meta_ops.ad_sets and inserts
--      one row per real change. detected_via = 'pull' or 'manual_refresh'.
--   2. The Activity Log backfill (budget-history.ts → backfillAdSetBudgetHistory)
--      pulls /{adset}/activities and writes events with detected_via='backfill'
--      and the Meta event id stored in source_event_id.
--
-- Idempotency strategy
-- --------------------
-- The two writers compute `changed_at` from DIFFERENT Meta fields
-- (`updated_time` vs `event_time`) which never align at second-resolution.
-- To make the UNIQUE catch real duplicates, BOTH writers MUST truncate
-- `changed_at` to the minute before insert. With that contract:
--
--   UNIQUE (ad_set_id, changed_at, new_budget)
--
-- correctly collapses the same logical bump captured by both writers within a
-- 60-second window.
--
-- Edge case: two distinct bumps to the same `new_budget` on the same ad set
-- within the same minute will be merged into one row. Acceptable — no operator
-- bumps an ad set twice to the same value within 60s.
--
-- Source event tracking
-- ---------------------
-- `source_event_id` carries the Meta activity log event id when populated by
-- the backfill (NULL for forward-pull rows since Meta doesn't expose an event
-- id at the entity level). It's used for forensic traceability and is not
-- part of the dedup key.
-- =============================================================================

CREATE TABLE IF NOT EXISTS meta_ops.ad_set_budget_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_set_id         TEXT NOT NULL REFERENCES meta_ops.ad_sets(id) ON DELETE CASCADE,
  business_unit_id  UUID REFERENCES meta_ops.business_units(id) ON DELETE SET NULL,
  prev_budget       NUMERIC(14,2),                  -- nullable: first observation has no prior value
  new_budget        NUMERIC(14,2) NOT NULL,
  delta_amount      NUMERIC(14,2)
                    GENERATED ALWAYS AS (new_budget - COALESCE(prev_budget, 0)) STORED,
  delta_pct         NUMERIC(8,2),                   -- (new - prev) / prev * 100; NULL when prev is 0/NULL
  direction         TEXT NOT NULL
                    CHECK (direction IN ('UP', 'DOWN', 'INITIAL')),
  changed_at        TIMESTAMPTZ NOT NULL,           -- writers MUST truncate to minute (date_trunc('minute', ...))
  detected_via      TEXT NOT NULL
                    CHECK (detected_via IN ('pull', 'manual_refresh', 'backfill')),
  source_event_id   TEXT,                           -- Meta activity log event id when from backfill
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary dedup key — see header comment about minute truncation.
CREATE UNIQUE INDEX IF NOT EXISTS ux_ad_set_budget_history_event
  ON meta_ops.ad_set_budget_history (ad_set_id, changed_at, new_budget);

-- Forensic uniqueness on Meta's event id when present. Allows a backfill to
-- be re-run safely without producing duplicates even before the minute-truncation
-- contract was rolled out.
CREATE UNIQUE INDEX IF NOT EXISTS ux_ad_set_budget_history_source_event
  ON meta_ops.ad_set_budget_history (source_event_id)
  WHERE source_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ad_set_budget_history_bu_changed_at
  ON meta_ops.ad_set_budget_history (business_unit_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ad_set_budget_history_ad_set
  ON meta_ops.ad_set_budget_history (ad_set_id, changed_at DESC);

COMMENT ON TABLE meta_ops.ad_set_budget_history IS
  'Append-only log of daily_budget changes per ad set. Populated by pull jobs (forward) and Activity Log backfill (retroactive). Both writers truncate changed_at to the minute so the UNIQUE on (ad_set_id, changed_at, new_budget) deduplicates the same logical bump captured by both sources. NOTE: Only ABO ad sets (those owning their own daily_budget) generate rows here; CBO campaigns control budget at the campaign level and produce no ad-set-level events, so they will never appear in this table.';
COMMENT ON COLUMN meta_ops.ad_set_budget_history.direction IS
  'UP when new_budget > prev_budget, DOWN when new_budget < prev_budget, INITIAL on first observation (prev_budget IS NULL).';
COMMENT ON COLUMN meta_ops.ad_set_budget_history.detected_via IS
  'pull = scheduled cron pull diff; manual_refresh = user-triggered refresh diff; backfill = Meta /{adset}/activities import.';
COMMENT ON COLUMN meta_ops.ad_set_budget_history.changed_at IS
  'Truncated to minute by writers to absorb the second-level skew between Meta updated_time (forward-pull) and event_time (backfill).';

-- -----------------------------------------------------------------------------
-- RLS — match the pattern of sibling meta_ops dashboard tables. The dashboard
-- reads this table via service_role (which bypasses RLS) but exposing it via
-- PostgREST anon would otherwise leak across BUs; we lock it down to
-- authenticated and rely on the application layer to scope by BU.
-- -----------------------------------------------------------------------------

ALTER TABLE meta_ops.ad_set_budget_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auth_read ON meta_ops.ad_set_budget_history;
CREATE POLICY auth_read
  ON meta_ops.ad_set_budget_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Refresh PostgREST schema cache so the new table becomes visible immediately.
NOTIFY pgrst, 'reload schema';
