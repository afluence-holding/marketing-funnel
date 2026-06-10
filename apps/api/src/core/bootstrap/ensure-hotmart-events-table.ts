import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

let ensured = false;

const INLINE_SQL = `
CREATE TABLE IF NOT EXISTS marketing.hotmart_webhook_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event          text,
  transaction_id text,
  offer_code     text,
  payload        jsonb NOT NULL,
  received_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hotmart_events_received
  ON marketing.hotmart_webhook_events (received_at);

ALTER TABLE marketing.hotmart_webhook_events ENABLE ROW LEVEL SECURITY;
`;

/** Idempotently create the raw Hotmart webhook capture table (spike Fase 0). */
export async function ensureHotmartEventsTable() {
  if (ensured) return;

  const migrationPath = path.join(
    process.cwd(),
    'packages/db/src/migrations/20260612000000_hotmart_webhook_events.sql',
  );
  const sql = fs.existsSync(migrationPath)
    ? fs.readFileSync(migrationPath, 'utf-8')
    : INLINE_SQL;

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(sql);
    ensured = true;
    console.info('[hotmart] webhook events table ensured');
  } finally {
    await client.end();
  }
}
