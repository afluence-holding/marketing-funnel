import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

let ensured = false;

const INLINE_SQL = `
CREATE TABLE IF NOT EXISTS marketing.bukku_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'landing-bukku-test-ingles',
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS bukku_leads_email_lower_unique
  ON marketing.bukku_leads (lower(email));

CREATE INDEX IF NOT EXISTS bukku_leads_created_at_idx
  ON marketing.bukku_leads (created_at DESC);
`;

export async function ensureBukkuLeadsTable() {
  if (ensured) return;

  const migrationPath = path.join(
    process.cwd(),
    'packages/db/src/migrations/20260602000000_bukku_leads.sql',
  );
  const sql = fs.existsSync(migrationPath)
    ? fs.readFileSync(migrationPath, 'utf-8')
    : INLINE_SQL;

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(sql);
    ensured = true;
    console.info('[bukku] bukku_leads table ensured');
  } finally {
    await client.end();
  }
}
