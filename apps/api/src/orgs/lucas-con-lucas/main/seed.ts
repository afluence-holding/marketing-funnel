/**
 * Seed via direct PostgreSQL — bypasses PostgREST, works with any schema.
 * Uses DATABASE_URL from .env.local.
 */
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

const ORG_NAME = 'Lucas con Lucas';
const BU_NAME = 'Main';
const BU_DESCRIPTION = 'Pre-launch waitlist landing for Lucas con Lucas';
const ENV_PREFIX = 'LUCAS_CON_LUCAS';

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
