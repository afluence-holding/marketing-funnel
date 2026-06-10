-- Cohort mirror + purchases (modularizacion-cohorts, Épica C).
--
-- marketing.cohorts is a READ-ONLY MIRROR of packages/catalog (the code-first
-- single source of definition). It is synced unidirectionally code→DB on API
-- boot; manual edits are overwritten by the next sync and the checkout never
-- reads it. It exists for querying (BU → N cohorts), reporting and as the FK
-- target of purchases.
--
-- marketing.purchases is the durable purchase record: snapshots frozen at
-- purchase time (immune to future catalog edits) + durable webhook idempotency
-- via UNIQUE (provider, external_id). Refund/chargeback events UPDATE status
-- on the existing row (no new rows).
--
-- Additive & idempotent — applied via psql AND ensured on API boot
-- (apps/api/src/core/bootstrap/ensure-purchase-tables.ts).

CREATE TABLE IF NOT EXISTS marketing.cohorts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_key          text NOT NULL,
  bu_key           text NOT NULL,
  business_unit_id uuid REFERENCES marketing.business_units(id),
  code             text NOT NULL UNIQUE,
  content_id       text NOT NULL,
  starts_at        timestamptz,
  ends_at          timestamptz,
  timezone         text NOT NULL,
  tiers            jsonb NOT NULL DEFAULT '[]',
  is_active        boolean NOT NULL DEFAULT true,
  synced_at        timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_key, bu_key, code)
);

CREATE INDEX IF NOT EXISTS idx_cohorts_bu
  ON marketing.cohorts (org_key, bu_key, starts_at);

ALTER TABLE marketing.cohorts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS marketing.purchases (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES marketing.organizations(id),
  business_unit_id uuid REFERENCES marketing.business_units(id),
  cohort_id        uuid REFERENCES marketing.cohorts(id),
  lead_id          uuid REFERENCES marketing.leads(id),
  product_key      text NOT NULL,
  cohort_code      text NOT NULL,
  provider         text NOT NULL,
  external_id      text NOT NULL,
  plan_or_offer_id text,
  amount           numeric(10,2) NOT NULL,
  currency         text NOT NULL DEFAULT 'USD',
  content_id       text,
  status           text NOT NULL DEFAULT 'approved'
    CHECK (status IN ('approved', 'refunded', 'chargeback', 'canceled')),
  refunded_at      timestamptz,
  capi_sent_at     timestamptz,
  purchased_at     timestamptz NOT NULL DEFAULT now(),
  metadata         jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, external_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_cohort
  ON marketing.purchases (cohort_code, purchased_at);
CREATE INDEX IF NOT EXISTS idx_purchases_bu
  ON marketing.purchases (business_unit_id, purchased_at);
CREATE INDEX IF NOT EXISTS idx_purchases_org_email
  ON marketing.purchases (organization_id, ((metadata->>'email')));

ALTER TABLE marketing.purchases ENABLE ROW LEVEL SECURITY;
