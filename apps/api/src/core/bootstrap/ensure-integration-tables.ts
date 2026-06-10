import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

let ensured = false;

const INLINE_SQL = `
CREATE TABLE IF NOT EXISTS marketing.integration_deliveries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_key         text NOT NULL,
  bu_key          text NOT NULL,
  connector       text NOT NULL,
  event_type      text NOT NULL,
  dedup_key       text NOT NULL,
  payload         jsonb NOT NULL DEFAULT '{}',
  status          text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','delivered','failed','dead')),
  attempts        int  NOT NULL DEFAULT 0,
  max_attempts    int  NOT NULL DEFAULT 8,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error      text,
  delivered_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connector, dedup_key)
);
CREATE INDEX IF NOT EXISTS idx_int_deliveries_due
  ON marketing.integration_deliveries (status, next_attempt_at)
  WHERE status IN ('pending','failed');
CREATE INDEX IF NOT EXISTS idx_int_deliveries_org_status
  ON marketing.integration_deliveries (org_key, bu_key, status, created_at);
ALTER TABLE marketing.integration_deliveries ENABLE ROW LEVEL SECURITY;
`;

/** Idempotently create the integration outbox table on boot. */
export async function ensureIntegrationTables() {
  if (ensured) return;
  const migrationPath = path.join(
    process.cwd(),
    'packages/db/src/migrations/20260613000000_integration_deliveries.sql',
  );
  const sql = fs.existsSync(migrationPath)
    ? fs.readFileSync(migrationPath, 'utf-8')
    : INLINE_SQL;

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(sql);
    ensured = true;
    console.info('[integrations] integration_deliveries table ensured');
  } finally {
    await client.end();
  }
}
