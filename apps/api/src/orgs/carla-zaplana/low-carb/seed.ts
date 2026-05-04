/**
 * Seed via direct PostgreSQL — bypasses PostgREST, works with any schema.
 * Uses DATABASE_URL from .env.local.
 *
 * Run from apps/api/ with:
 *   npx ts-node src/orgs/carla-zaplana/low-carb/seed.ts
 *
 * After it prints the UUID, copy it to .env.local as:
 *   CARLA_ZAPLANA_ORG_ID=<uuid>
 */
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

const ORG_NAME = 'Carla Zaplana';
const BU_NAME = 'Low Carb';
const BU_DESCRIPTION = 'Low Carb Challenge — AI Challenge by Carla Zaplana';
const ENV_PREFIX = 'CARLA_ZAPLANA';

async function seed() {
  console.log(`Seeding ${ORG_NAME} / ${BU_NAME}...\n`);

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    const orgRes = await client.query(
      `INSERT INTO marketing.organizations (name) VALUES ($1) RETURNING id, name`,
      [ORG_NAME],
    );
    const org = orgRes.rows[0];
    console.log(`Organization: ${org.id}  (${org.name})`);

    const buRes = await client.query(
      `INSERT INTO marketing.business_units (organization_id, name, description) VALUES ($1, $2, $3) RETURNING id, name`,
      [org.id, BU_NAME, BU_DESCRIPTION],
    );
    const bu = buRes.rows[0];
    console.log(`Business Unit: ${bu.id}  (${bu.name})`);

    console.log('\n========================================');
    console.log('Copy this to your .env.local:');
    console.log('========================================\n');
    console.log(`${ENV_PREFIX}_ORG_ID=${org.id}`);
    console.log('\n========================================');
    console.log('Done! Add the env var and restart the API.');
    console.log('========================================');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
