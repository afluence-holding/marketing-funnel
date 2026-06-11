/**
 * Seed de Mamá Sin Caos vía PostgreSQL directo (idempotente).
 * Crea organizations + business_units en el schema `marketing`.
 * Correr: `npx tsx src/orgs/mama-sin-caos/main/seed.ts` desde apps/api/.
 */
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

const ORG_NAME = 'Mamá Sin Caos';
const BU_NAME = 'Main';
const BU_DESCRIPTION = 'Landings y captura de leads de Mamá Sin Caos';
const ENV_PREFIX = 'MAMA_SIN_CAOS';

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

    // Custom field definitions del diagnóstico. Sin esto, el `arquetipo` que envía
    // el landing se descarta en la ingesta (saveCustomFieldValues exige definición).
    const CUSTOM_FIELDS: Array<{ field_key: string; field_label: string; field_type: string }> = [
      { field_key: 'arquetipo', field_label: 'Arquetipo', field_type: 'text' },
    ];
    for (const field of CUSTOM_FIELDS) {
      const existingDef = await client.query(
        `SELECT id FROM marketing.custom_field_definitions
         WHERE organization_id = $1 AND entity_type = 'lead' AND field_key = $2 LIMIT 1`,
        [org.id, field.field_key],
      );
      if (existingDef.rows[0]) {
        console.log(`Custom field (existing): ${field.field_key}`);
      } else {
        await client.query(
          `INSERT INTO marketing.custom_field_definitions
             (organization_id, entity_type, field_key, field_label, field_type, required)
           VALUES ($1, 'lead', $2, $3, $4, false)`,
          [org.id, field.field_key, field.field_label, field.field_type],
        );
        console.log(`Custom field (created): ${field.field_key}`);
      }
    }

    console.log('\n========================================');
    console.log('Copia esto a tu .env / .env.local:');
    console.log('========================================\n');
    console.log(`${ENV_PREFIX}_ORG_ID=${org.id}`);
    console.log('\nIngest endpoint: POST /api/orgs/mama-sin-caos/bus/main/ingest');
    console.log('========================================');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
