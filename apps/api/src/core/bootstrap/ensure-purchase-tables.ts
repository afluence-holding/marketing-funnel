import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

let ensured = false;

const INLINE_SQL = `
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
`;

/** Idempotently create the cohort mirror + purchases tables (same pattern as
 * ensure-whatsapp-group-tables: versioned migration file, inline fallback). */
export async function ensurePurchaseTables() {
  if (ensured) return;

  const migrationPath = path.join(
    process.cwd(),
    'packages/db/src/migrations/20260611000000_marketing_cohorts_and_purchases.sql',
  );
  const sql = fs.existsSync(migrationPath)
    ? fs.readFileSync(migrationPath, 'utf-8')
    : INLINE_SQL;

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(sql);
    ensured = true;
    console.info('[purchases] cohort mirror + purchases tables ensured');
  } finally {
    await client.end();
  }
}
