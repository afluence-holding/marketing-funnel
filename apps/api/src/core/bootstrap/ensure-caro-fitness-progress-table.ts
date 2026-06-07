import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

let ensured = false;

const INLINE_SQL = `
CREATE TABLE IF NOT EXISTS marketing.caro_fitness_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  source text NOT NULL DEFAULT 'landing-caro-fitness-diagnostico',
  email text NOT NULL DEFAULT '',
  first_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  quiz_step text NOT NULL DEFAULT 'intro',
  status text NOT NULL DEFAULT 'in_progress',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  lead_id uuid,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS caro_fitness_progress_session_id_unique
  ON marketing.caro_fitness_progress (session_id);

CREATE INDEX IF NOT EXISTS caro_fitness_progress_created_at_idx
  ON marketing.caro_fitness_progress (created_at DESC);

CREATE INDEX IF NOT EXISTS caro_fitness_progress_email_lower_idx
  ON marketing.caro_fitness_progress (lower(email))
  WHERE email <> '';
`;

export async function ensureCaroFitnessProgressTable() {
  if (ensured) return;

  const migrationPath = path.join(
    process.cwd(),
    'packages/db/src/migrations/20260607000000_caro_fitness_progress.sql',
  );
  const sql = fs.existsSync(migrationPath)
    ? fs.readFileSync(migrationPath, 'utf-8')
    : INLINE_SQL;

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(sql);
    ensured = true;
    console.info('[caro-fitness] caro_fitness_progress table ensured');
  } finally {
    await client.end();
  }
}
