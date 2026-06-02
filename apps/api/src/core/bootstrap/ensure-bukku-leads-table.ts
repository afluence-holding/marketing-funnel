import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

let ensured = false;

export async function ensureBukkuLeadsTable() {
  if (ensured) return;

  const migrationPath = path.join(
    process.cwd(),
    'packages/db/src/migrations/20260602000000_bukku_leads.sql',
  );
  const sql = fs.readFileSync(migrationPath, 'utf-8');

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
