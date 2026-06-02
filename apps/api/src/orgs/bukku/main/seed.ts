/**
 * Seed via direct PostgreSQL — idempotent setup for Bukku Education.
 *
 * RUN (from repo root):
 *   npm run seed:bukku -w @marketing-funnel/api
 */
import { Client } from 'pg';
import { env } from '@marketing-funnel/config';

const ORG_NAME = 'Bukku Education';
const BU_NAME = 'Main';
const BU_DESCRIPTION = 'English level test + market research landing for Bukku Education';
const PIPELINE_NAME = 'Bukku Leads Pipeline';
const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Sold', 'Lost'];
const ENV_PREFIX = 'BUKKU';

const CUSTOM_FIELDS: Array<{
  field_key: string;
  field_label: string;
  field_type: 'text' | 'number' | 'boolean' | 'date';
}> = [
  { field_key: 'ocupacion', field_label: 'Occupation', field_type: 'text' },
  { field_key: 'ingreso_mensual_usd', field_label: 'Monthly income (USD)', field_type: 'text' },
  { field_key: 'nivel_ingles_autorreportado', field_label: 'Self-reported English level', field_type: 'text' },
  { field_key: 'metodos_probados', field_label: 'Methods tried before', field_type: 'text' },
  { field_key: 'frustracion', field_label: 'Main frustration', field_type: 'text' },
  { field_key: 'cambio_vida', field_label: 'Life change if fluent', field_type: 'text' },
  { field_key: 'proposito_principal', field_label: 'Main learning purpose', field_type: 'text' },
  { field_key: 'preferencia_producto', field_label: 'Product preference', field_type: 'text' },
  { field_key: 'interes_ia', field_label: 'AI learning interest', field_type: 'text' },
  { field_key: 'aviso_lanzamiento', field_label: 'Wants launch notification', field_type: 'text' },
  { field_key: 'survey_submitted_at', field_label: 'Survey submitted at', field_type: 'text' },
  { field_key: 'test_level', field_label: 'Test level label', field_type: 'text' },
  { field_key: 'test_level_key', field_label: 'Test level key', field_type: 'text' },
  { field_key: 'test_cefr', field_label: 'Test CEFR equivalent', field_type: 'text' },
  { field_key: 'test_percentage', field_label: 'Test percentage', field_type: 'number' },
  { field_key: 'test_score_grammar', field_label: 'Grammar score', field_type: 'number' },
  { field_key: 'test_score_listening', field_label: 'Listening score', field_type: 'number' },
  { field_key: 'test_score_reading', field_label: 'Reading score', field_type: 'number' },
  { field_key: 'test_total', field_label: 'Test total score', field_type: 'number' },
  { field_key: 'test_max', field_label: 'Test max score', field_type: 'number' },
  { field_key: 'test_completed_at', field_label: 'Test completed at', field_type: 'text' },
  { field_key: 'guide_opened_at', field_label: 'Guide opened at', field_type: 'text' },
  { field_key: 'guide_level', field_label: 'Guide level downloaded', field_type: 'text' },
];

async function seed() {
  console.log(`Seeding ${ORG_NAME} / ${BU_NAME}...\n`);

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    let orgRes = await client.query(
      `SELECT id, name FROM marketing.organizations WHERE name = $1 LIMIT 1`,
      [ORG_NAME],
    );
    let org = orgRes.rows[0];
    if (org) {
      console.log(`Organization (existing): ${org.id}  (${org.name})`);
    } else {
      orgRes = await client.query(
        `INSERT INTO marketing.organizations (name) VALUES ($1) RETURNING id, name`,
        [ORG_NAME],
      );
      org = orgRes.rows[0];
      console.log(`Organization (created): ${org.id}  (${org.name})`);
    }

    let buRes = await client.query(
      `SELECT id, name FROM marketing.business_units WHERE organization_id = $1 AND name = $2 LIMIT 1`,
      [org.id, BU_NAME],
    );
    let bu = buRes.rows[0];
    if (bu) {
      console.log(`Business Unit (existing): ${bu.id}  (${bu.name})`);
    } else {
      buRes = await client.query(
        `INSERT INTO marketing.business_units (organization_id, name, description) VALUES ($1, $2, $3) RETURNING id, name`,
        [org.id, BU_NAME, BU_DESCRIPTION],
      );
      bu = buRes.rows[0];
      console.log(`Business Unit (created): ${bu.id}  (${bu.name})`);
    }

    let pipelineRes = await client.query(
      `SELECT id, name FROM marketing.pipelines WHERE business_unit_id = $1 AND name = $2 LIMIT 1`,
      [bu.id, PIPELINE_NAME],
    );
    let pipeline = pipelineRes.rows[0];
    if (pipeline) {
      console.log(`Pipeline (existing): ${pipeline.id}  (${pipeline.name})`);
    } else {
      pipelineRes = await client.query(
        `INSERT INTO marketing.pipelines (business_unit_id, name, description, is_active)
         VALUES ($1, $2, $3, true) RETURNING id, name`,
        [bu.id, PIPELINE_NAME, `Default pipeline for ${BU_NAME}`],
      );
      pipeline = pipelineRes.rows[0];
      console.log(`Pipeline (created): ${pipeline.id}  (${pipeline.name})`);
    }

    const stages: Array<{ id: string; name: string }> = [];
    for (let i = 0; i < STAGES.length; i++) {
      const stageName = STAGES[i];
      let stageRes = await client.query(
        `SELECT id, name FROM marketing.pipeline_stages
         WHERE pipeline_id = $1 AND name = $2 LIMIT 1`,
        [pipeline.id, stageName],
      );
      let stage = stageRes.rows[0];
      if (stage) {
        console.log(`  Stage ${i + 1} (existing): ${stage.id}  (${stage.name})`);
      } else {
        stageRes = await client.query(
          `INSERT INTO marketing.pipeline_stages (pipeline_id, name, position)
           VALUES ($1, $2, $3) RETURNING id, name`,
          [pipeline.id, stageName, i + 1],
        );
        stage = stageRes.rows[0];
        console.log(`  Stage ${i + 1} (created): ${stage.id}  (${stage.name})`);
      }
      stages.push({ id: stage.id, name: stage.name });
    }

    console.log('\nCustom Fields:');
    for (const field of CUSTOM_FIELDS) {
      const existingFieldRes = await client.query(
        `SELECT id, field_key FROM marketing.custom_field_definitions
         WHERE organization_id = $1 AND entity_type = 'lead' AND field_key = $2 LIMIT 1`,
        [org.id, field.field_key],
      );
      if (existingFieldRes.rows[0]) {
        console.log(`  (existing) ${field.field_key}`);
        continue;
      }

      const fieldRes = await client.query(
        `INSERT INTO marketing.custom_field_definitions
           (organization_id, entity_type, field_key, field_label, field_type, required)
         VALUES ($1, 'lead', $2, $3, $4, false)
         RETURNING id, field_key`,
        [org.id, field.field_key, field.field_label, field.field_type],
      );
      console.log(`  (created) ${fieldRes.rows[0].field_key}`);
    }

    console.log('\n========================================');
    console.log('Copy these to your .env.local:');
    console.log('========================================\n');
    console.log(`${ENV_PREFIX}_ORG_ID=${org.id}`);
    console.log(`${ENV_PREFIX}_PIPELINE_ID=${pipeline.id}`);
    for (const stage of stages) {
      const envKey = stage.name.toUpperCase().replace(/\s+/g, '_');
      console.log(`${ENV_PREFIX}_STAGE_${envKey}=${stage.id}`);
    }
    console.log('\n========================================');
    console.log('Done! Add these env vars and restart the API.');
    console.log('========================================');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
