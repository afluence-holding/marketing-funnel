/**
 * Seed via direct PostgreSQL — bypasses PostgREST, works with any schema.
 * Uses DATABASE_URL from .env.local.
 *
 * Note: the Recetas Cami organization was first created during the
 * Phase 1 bulk-import migration of historical waitlist emails, so this
 * script is idempotent: if the org / BU already exist, it just prints
 * the existing IDs instead of inserting duplicates.
 */
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

const ORG_NAME = 'Recetas Cami';
const BU_NAME = 'Main';
const BU_DESCRIPTION = 'Waitlist + sales landings for the Recetas Cami monthly guide';
const ENV_PREFIX = 'RECETAS_CAMI';

async function seed() {
  console.log(`Seeding ${ORG_NAME} / ${BU_NAME}...\n`);

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    const existingOrgRes = await client.query(
      `SELECT id, name FROM marketing.organizations WHERE name = $1 LIMIT 1`,
      [ORG_NAME],
    );

    let org = existingOrgRes.rows[0];
    if (org) {
      console.log(`Organization (existing): ${org.id}  (${org.name})`);
    } else {
      const orgRes = await client.query(
        `INSERT INTO marketing.organizations (name) VALUES ($1) RETURNING id, name`,
        [ORG_NAME],
      );
      org = orgRes.rows[0];
      console.log(`Organization (created): ${org.id}  (${org.name})`);
    }

    const existingBuRes = await client.query(
      `SELECT id, name FROM marketing.business_units WHERE organization_id = $1 AND name = $2 LIMIT 1`,
      [org.id, BU_NAME],
    );

    let bu = existingBuRes.rows[0];
    if (bu) {
      console.log(`Business Unit (existing): ${bu.id}  (${bu.name})`);
    } else {
      const buRes = await client.query(
        `INSERT INTO marketing.business_units (organization_id, name, description) VALUES ($1, $2, $3) RETURNING id, name`,
        [org.id, BU_NAME, BU_DESCRIPTION],
      );
      bu = buRes.rows[0];
      console.log(`Business Unit (created): ${bu.id}  (${bu.name})`);
    }

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
