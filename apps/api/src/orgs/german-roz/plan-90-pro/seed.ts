/**
 * Seed via direct PostgreSQL — bypasses PostgREST, works with any schema.
 * Uses DATABASE_URL from .env.local.
 *
 * Adds the `Plan 90 Pro` BU under the EXISTING `German Roz` organization.
 */
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';
import { IDS as MAIN_IDS } from '../main/config';

const ORG_ID = MAIN_IDS.organizationId;
const BU_NAME = 'Plan 90 Pro';
const BU_DESCRIPTION = 'Landing page lead capture for Plan 90 Pro';

async function seed() {
  console.log(`Seeding German Roz / ${BU_NAME} under existing org ${ORG_ID}...\n`);

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    const buRes = await client.query(
      `INSERT INTO marketing.business_units (organization_id, name, description) VALUES ($1, $2, $3) RETURNING id, name`,
      [ORG_ID, BU_NAME, BU_DESCRIPTION],
    );
    const bu = buRes.rows[0];
    console.log(`Business Unit: ${bu.id}  (${bu.name})`);

    console.log('\n========================================');
    console.log('Business Unit created successfully.');
    console.log('No new env vars needed — reuses GERMAN_ROZ org id.');
    console.log('========================================');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
