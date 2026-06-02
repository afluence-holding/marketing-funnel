import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

let ensured = false;

const INLINE_SQL = `
CREATE TABLE IF NOT EXISTS marketing.mama_sin_caos_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'landing-afluence-mama-sin-caos-lista-secreta',
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS mama_sin_caos_leads_email_lower_unique
  ON marketing.mama_sin_caos_leads (lower(email));

CREATE INDEX IF NOT EXISTS mama_sin_caos_leads_created_at_idx
  ON marketing.mama_sin_caos_leads (created_at DESC);
`;

export async function ensureMamaSinCaosLeadsTable() {
  if (ensured) return;

  const migrationPath = path.join(
    process.cwd(),
    'packages/db/src/migrations/20260602120000_mama_sin_caos_leads.sql',
  );
  const sql = fs.existsSync(migrationPath)
    ? fs.readFileSync(migrationPath, 'utf-8')
    : INLINE_SQL;

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(sql);
    ensured = true;
    console.info('[mama-sin-caos] mama_sin_caos_leads table ensured');
  } finally {
    await client.end();
  }
}
