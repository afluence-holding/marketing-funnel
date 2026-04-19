-- =============================================================================
-- meta_ops schema: multi-tenant rails for Meta Ads ingestion.
-- Strangler-fig: coexists with existing marketing_ops.* (populated by
-- Ops/di21_monitor.py). Fase 1 dashboard reads marketing_ops; Fase 2 will
-- migrate to meta_ops.v_bu_daily_rollup once meta_insights is populated.
-- Idempotent: safe to re-run.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS meta_ops;

-- L1: Organizers (Meta ad account owners — e.g. Germán Roz, Afluence)
CREATE TABLE IF NOT EXISTS meta_ops.organizers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  ad_account_id      TEXT,
  encrypted_token    TEXT,  -- AES-256-GCM, base64(iv || ct || tag)
  token_expires_at   TIMESTAMPTZ,
  health_snapshot    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- L2: Business Units (products under an organizer — e.g. DI21 for Germán).
-- config.match_strategy determines how to resolve campaigns:
--   'ad_account'   → all campaigns under organizer.ad_account_id
--   'prefix'       → campaigns where name LIKE config.campaign_name_prefix || '%'
--   'campaign_ids' → explicit list in config.campaign_ids (string[])
CREATE TABLE IF NOT EXISTS meta_ops.business_units (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id     UUID NOT NULL REFERENCES meta_ops.organizers(id) ON DELETE CASCADE,
  slug             TEXT NOT NULL,
  name             TEXT NOT NULL,
  config           JSONB NOT NULL DEFAULT '{}'::jsonb,
  kpi_targets      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organizer_id, slug)
);

-- L3: Meta entities (campaigns, adsets, ads) — owned by a BU.
CREATE TABLE IF NOT EXISTS meta_ops.meta_entities (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id  UUID NOT NULL REFERENCES meta_ops.business_units(id) ON DELETE CASCADE,
  entity_type       TEXT NOT NULL CHECK (entity_type IN ('campaign','adset','ad')),
  meta_id           TEXT NOT NULL,
  parent_meta_id    TEXT,
  name              TEXT NOT NULL,
  status            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_unit_id, entity_type, meta_id)
);

CREATE INDEX IF NOT EXISTS idx_meta_entities_bu_type ON meta_ops.meta_entities (business_unit_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_meta_entities_meta_id ON meta_ops.meta_entities (meta_id);

-- L4: Daily insights per entity. Ratios are generated columns.
-- tier: today|recent|mid|historical. Monotonic progression enforced by trigger.
CREATE TABLE IF NOT EXISTS meta_ops.meta_insights (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id       UUID NOT NULL REFERENCES meta_ops.meta_entities(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  tier            TEXT NOT NULL CHECK (tier IN ('today','recent','mid','historical')),
  spend           NUMERIC(14,2) NOT NULL DEFAULT 0,
  impressions     BIGINT NOT NULL DEFAULT 0,
  reach           BIGINT NOT NULL DEFAULT 0,
  clicks          BIGINT NOT NULL DEFAULT 0,
  leads           BIGINT NOT NULL DEFAULT 0,
  purchases       BIGINT NOT NULL DEFAULT 0,
  purchase_value  NUMERIC(14,2) NOT NULL DEFAULT 0,
  frequency       NUMERIC(15,4) GENERATED ALWAYS AS (CASE WHEN reach > 0 THEN impressions::numeric / reach ELSE 0 END) STORED,
  ctr             NUMERIC(15,4) GENERATED ALWAYS AS (CASE WHEN impressions > 0 THEN clicks::numeric / impressions ELSE 0 END) STORED,
  cpm             NUMERIC(15,4) GENERATED ALWAYS AS (CASE WHEN impressions > 0 THEN spend * 1000 / impressions ELSE 0 END) STORED,
  cpc             NUMERIC(15,4) GENERATED ALWAYS AS (CASE WHEN clicks > 0 THEN spend / clicks ELSE 0 END) STORED,
  cpa             NUMERIC(15,4) GENERATED ALWAYS AS (CASE WHEN purchases > 0 THEN spend / purchases ELSE 0 END) STORED,
  roas            NUMERIC(15,4) GENERATED ALWAYS AS (CASE WHEN spend > 0 THEN purchase_value / spend ELSE 0 END) STORED,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_id, date)
);

CREATE INDEX IF NOT EXISTS idx_meta_insights_date ON meta_ops.meta_insights (date);
CREATE INDEX IF NOT EXISTS idx_meta_insights_entity_date ON meta_ops.meta_insights (entity_id, date DESC);

-- Trigger: once an insight row advances to a "fresher" tier, it cannot move back.
-- historical (1) → mid (2) → recent (3) → today (4).  Only tier UPDATEs are checked.
CREATE OR REPLACE FUNCTION meta_ops.prevent_tier_downgrade() RETURNS TRIGGER AS $$
DECLARE
  rank JSONB := '{"historical":1,"mid":2,"recent":3,"today":4}'::jsonb;
BEGIN
  IF (rank->>NEW.tier)::int < (rank->>OLD.tier)::int THEN
    RAISE EXCEPTION 'Tier downgrade not allowed: % → %', OLD.tier, NEW.tier;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_tier_downgrade ON meta_ops.meta_insights;
CREATE TRIGGER trg_prevent_tier_downgrade
  BEFORE UPDATE OF tier ON meta_ops.meta_insights
  FOR EACH ROW
  WHEN (OLD.tier IS DISTINCT FROM NEW.tier)
  EXECUTE FUNCTION meta_ops.prevent_tier_downgrade();

-- Rate limit snapshots (from Meta's x-business-use-case-usage header).
-- Retention: trim externally if size grows; index supports "latest per account" queries.
CREATE TABLE IF NOT EXISTS meta_ops.meta_rate_limit_usage (
  id                                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_account_id                         TEXT NOT NULL,
  call_count                            INT,
  total_cputime                         INT,
  total_time                            INT,
  estimated_time_to_regain_access_sec   INT,
  raw                                   JSONB,
  snapshotted_at                        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_account_time
  ON meta_ops.meta_rate_limit_usage (ad_account_id, snapshotted_at DESC);

-- Pull jobs log (one row per cron invocation).
CREATE TABLE IF NOT EXISTS meta_ops.meta_pull_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type          TEXT NOT NULL CHECK (job_type IN ('today','recent','mid','historical','token-health')),
  business_unit_id  UUID REFERENCES meta_ops.business_units(id) ON DELETE SET NULL,
  status            TEXT NOT NULL CHECK (status IN ('running','completed','failed','skipped')),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  rows_written      INT NOT NULL DEFAULT 0,
  error             TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_pull_jobs_type_started ON meta_ops.meta_pull_jobs (job_type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_pull_jobs_bu_started ON meta_ops.meta_pull_jobs (business_unit_id, started_at DESC);

-- Advisory locks (table-based — reliable across serverless invocations that
-- do not share a connection pool, unlike pg_advisory_lock which is connection-scoped).
CREATE TABLE IF NOT EXISTS meta_ops.meta_pull_locks (
  key         TEXT PRIMARY KEY,
  locked_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_by   TEXT,
  expires_at  TIMESTAMPTZ NOT NULL
);

-- Rate-limit helper for /api/refresh (last-triggered timestamp per user+BU).
-- Keeps the rate limit durable across serverless invocations.
CREATE TABLE IF NOT EXISTS meta_ops.refresh_rate_limit (
  user_id           UUID NOT NULL,
  business_unit_id  UUID NOT NULL REFERENCES meta_ops.business_units(id) ON DELETE CASCADE,
  last_refresh_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, business_unit_id)
);

-- Per-BU daily rollup for dashboards.
CREATE OR REPLACE VIEW meta_ops.v_bu_daily_rollup AS
SELECT
  bu.id                                         AS business_unit_id,
  bu.slug                                       AS bu_slug,
  o.slug                                        AS organizer_slug,
  mi.date,
  SUM(mi.spend)                                 AS spend,
  SUM(mi.impressions)                           AS impressions,
  SUM(mi.reach)                                 AS reach,
  SUM(mi.clicks)                                AS clicks,
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
GROUP BY bu.id, bu.slug, o.slug, mi.date;

-- RLS: service_role bypasses by default; authenticated users read-only.
ALTER TABLE meta_ops.organizers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.business_units          ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.meta_entities           ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.meta_insights           ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.meta_rate_limit_usage   ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.meta_pull_jobs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.meta_pull_locks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ops.refresh_rate_limit      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auth_read ON meta_ops.organizers;
CREATE POLICY auth_read ON meta_ops.organizers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS auth_read ON meta_ops.business_units;
CREATE POLICY auth_read ON meta_ops.business_units FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS auth_read ON meta_ops.meta_entities;
CREATE POLICY auth_read ON meta_ops.meta_entities FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS auth_read ON meta_ops.meta_insights;
CREATE POLICY auth_read ON meta_ops.meta_insights FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS auth_read ON meta_ops.meta_rate_limit_usage;
CREATE POLICY auth_read ON meta_ops.meta_rate_limit_usage FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS auth_read ON meta_ops.meta_pull_jobs;
CREATE POLICY auth_read ON meta_ops.meta_pull_jobs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS auth_read ON meta_ops.meta_pull_locks;
CREATE POLICY auth_read ON meta_ops.meta_pull_locks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS auth_read ON meta_ops.refresh_rate_limit;
CREATE POLICY auth_read ON meta_ops.refresh_rate_limit FOR SELECT TO authenticated USING (true);
