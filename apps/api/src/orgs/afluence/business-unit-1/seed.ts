/**
 * Seed script for company-1 (Afluence org).
 * Run: npm run seed (from apps/api)
 *
 * Creates: organization → business unit → pipeline → 4 stages → custom field definitions
 * After running, copy the output IDs to your .env file.
 */

import { supabaseAdmin as db } from '@marketing-funnel/db';

async function seed() {
  console.log('Seeding afluence/company-1...\n');

  // 1. Organization
  const { data: org, error: orgErr } = await db
    .from('organizations')
    .insert({ name: 'Afluence' })
    .select()
    .single();
  if (orgErr) throw orgErr;
  console.log(`Organization: ${org!.id}  (${org!.name})`);

  // 2. Business Unit
  const { data: bu, error: buErr } = await db
    .from('business_units')
    .insert({
      organization_id: org!.id,
      name: 'Company-1',
      description: 'First business unit for Afluence',
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
      name: 'Main Pipeline',
      description: 'Default lead pipeline',
      is_active: true,
    })
    .select()
    .single();
  if (pipelineErr) throw pipelineErr;
  console.log(`Pipeline: ${pipeline!.id}  (${pipeline!.name})`);

  // 4. Pipeline Stages
  const stageNames = ['New Lead', 'Contacted', 'Qualified', 'Converted'];
  const stages: Array<{ id: string; name: string }> = [];

  for (let i = 0; i < stageNames.length; i++) {
    const { data: stage, error: stageErr } = await db
      .from('pipeline_stages')
      .insert({
        pipeline_id: pipeline!.id,
        name: stageNames[i],
        position: i + 1,
      })
      .select()
      .single();
    if (stageErr) throw stageErr;
    stages.push({ id: stage!.id, name: stage!.name });
    console.log(`  Stage ${i + 1}: ${stage!.id}  (${stage!.name})`);
  }

  // 5. Custom Field Definitions
  const fields = [
    { field_key: 'company', field_label: 'Company', field_type: 'text' },
    { field_key: 'role', field_label: 'Role', field_type: 'text' },
    { field_key: 'company_size', field_label: 'Company Size', field_type: 'number' },
    { field_key: 'industry', field_label: 'Industry', field_type: 'text' },
    { field_key: 'interest', field_label: 'Interest', field_type: 'text' },
  ];

  console.log('\nCustom Fields:');
  for (const field of fields) {
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

  // Output .env block
  console.log('\n--- Copy these to your .env ---\n');
  console.log(`PROJECT1_ORG_ID=${org!.id}`);
  console.log(`PROJECT1_PIPELINE_ID=${pipeline!.id}`);
  console.log(`PROJECT1_STAGE_NEW_LEAD=${stages[0].id}`);
  console.log(`PROJECT1_STAGE_CONTACTED=${stages[1].id}`);
  console.log(`PROJECT1_STAGE_QUALIFIED=${stages[2].id}`);
  console.log(`PROJECT1_STAGE_CONVERTED=${stages[3].id}`);
  console.log('\n--- Done! ---');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
