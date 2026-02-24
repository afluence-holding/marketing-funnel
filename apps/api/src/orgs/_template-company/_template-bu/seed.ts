/**
 * ============================================================================
 * SEED — Creates the database records for this Business Unit
 * ============================================================================
 *
 * RUN: npx ts-node src/orgs/_template-company/_template-bu/seed.ts
 *      (from apps/api/)
 *
 * WHAT IT DOES:
 * 1. Creates an Organization (or reuses if you change the insert to upsert)
 * 2. Creates a Business Unit under it
 * 3. Creates a Pipeline with stages
 * 4. Creates Custom Field Definitions (for landing page form fields)
 * 5. Prints all UUIDs — copy them to your .env
 *
 * ONLY RUN ONCE per BU. If you need to re-run, delete the records first or
 * modify the script to upsert.
 *
 * CUSTOMIZE:
 * - Change the organization name, BU name, pipeline name
 * - Change stage names and count to match your funnel
 * - Change custom fields to match your landing page form
 */

import { supabaseAdmin as db } from '@marketing-funnel/db';

// ===========================================================================
// CONFIGURATION — Change these for your BU
// ===========================================================================

const ORG_NAME = 'My Company';
const BU_NAME = 'My Product';
const BU_DESCRIPTION = 'Marketing pipeline for My Product';
const PIPELINE_NAME = 'Main Pipeline';

// Stages in order. Position is set automatically (1, 2, 3...).
const STAGES = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Demo Scheduled',
  'Converted',
];

// Custom field definitions — these match the fields on your landing page.
// entity_type is always 'lead'. field_type can be: 'text', 'number', 'boolean', 'date'.
const CUSTOM_FIELDS = [
  { field_key: 'company', field_label: 'Company', field_type: 'text' },
  { field_key: 'role', field_label: 'Role', field_type: 'text' },
  { field_key: 'company_size', field_label: 'Company Size', field_type: 'number' },
  { field_key: 'industry', field_label: 'Industry', field_type: 'text' },
  { field_key: 'interest', field_label: 'Interest', field_type: 'text' },
  // Add more as needed:
  // { field_key: 'budget', field_label: 'Budget', field_type: 'number' },
  // { field_key: 'has_team', field_label: 'Has Team', field_type: 'boolean' },
];

// ENV var prefix — used in the output block. Change to match your BU key.
const ENV_PREFIX = 'TEMPLATE';

// ===========================================================================
// SEED SCRIPT — Usually no need to edit below
// ===========================================================================

async function seed() {
  console.log(`Seeding ${ORG_NAME} / ${BU_NAME}...\n`);

  // 1. Organization
  const { data: org, error: orgErr } = await db
    .from('organizations')
    .insert({ name: ORG_NAME })
    .select()
    .single();
  if (orgErr) throw orgErr;
  console.log(`Organization: ${org!.id}  (${org!.name})`);

  // 2. Business Unit
  const { data: bu, error: buErr } = await db
    .from('business_units')
    .insert({
      organization_id: org!.id,
      name: BU_NAME,
      description: BU_DESCRIPTION,
    })
    .select()
    .single();
  if (buErr) throw buErr;
  console.log(`Business Unit: ${bu!.id}  (${bu!.name})`);

  // 3. Pipeline
  const { data: pipeline, error: pipelineErr } = await db
    .from('pipelines')
    .insert({
      business_unit_id: bu!.id,
      name: PIPELINE_NAME,
      description: `Default pipeline for ${BU_NAME}`,
      is_active: true,
    })
    .select()
    .single();
  if (pipelineErr) throw pipelineErr;
  console.log(`Pipeline: ${pipeline!.id}  (${pipeline!.name})`);

  // 4. Stages
  const stages: Array<{ id: string; name: string }> = [];
  for (let i = 0; i < STAGES.length; i++) {
    const { data: stage, error: stageErr } = await db
      .from('pipeline_stages')
      .insert({
        pipeline_id: pipeline!.id,
        name: STAGES[i],
        position: i + 1,
      })
      .select()
      .single();
    if (stageErr) throw stageErr;
    stages.push({ id: stage!.id, name: stage!.name });
    console.log(`  Stage ${i + 1}: ${stage!.id}  (${stage!.name})`);
  }

  // 5. Custom Field Definitions
  console.log('\nCustom Fields:');
  for (const field of CUSTOM_FIELDS) {
    const { data: def, error: defErr } = await db
      .from('custom_field_definitions')
      .insert({
        organization_id: org!.id,
        entity_type: 'lead',
        ...field,
        required: false,
      })
      .select()
      .single();
    if (defErr) throw defErr;
    console.log(`  ${def!.id}  (${field.field_key})`);
  }

  // 6. Output .env block
  console.log('\n========================================');
  console.log('Copy these to your .env:');
  console.log('========================================\n');
  console.log(`${ENV_PREFIX}_ORG_ID=${org!.id}`);
  console.log(`${ENV_PREFIX}_PIPELINE_ID=${pipeline!.id}`);
  for (const stage of stages) {
    const envKey = stage.name.toUpperCase().replace(/\s+/g, '_');
    console.log(`${ENV_PREFIX}_STAGE_${envKey}=${stage.id}`);
  }
  console.log('\n========================================');
  console.log('Done! Now update config.ts with these env var names.');
  console.log('========================================');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
