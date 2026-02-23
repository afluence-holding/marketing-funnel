import 'dotenv/config';

/**
 * Seed script for project-1.
 * Run: npm run seed (from apps/api)
 *
 * Creates: organization → business unit → funnel → 4 stages → custom field definitions
 * After running, copy the output IDs to your .env file.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'marketing' },
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log('Seeding project-1...\n');

  // 1. Organization
  const { data: org, error: orgErr } = await db
    .from('organizations')
    .insert({ name: 'Project 1' })
    .select()
    .single();
  if (orgErr) throw orgErr;
  console.log(`Organization: ${org!.id}  (${org!.name})`);

  // 2. Business Unit
  const { data: bu, error: buErr } = await db
    .from('business_units')
    .insert({
      organization_id: org!.id,
      name: 'Main',
      description: 'Main business unit for Project 1',
    })
    .select()
    .single();
  if (buErr) throw buErr;
  console.log(`Business Unit: ${bu!.id}  (${bu!.name})`);

  // 3. Funnel
  const { data: funnel, error: funnelErr } = await db
    .from('funnels')
    .insert({
      business_unit_id: bu!.id,
      name: 'Main Funnel',
      description: 'Default lead funnel',
      is_active: true,
    })
    .select()
    .single();
  if (funnelErr) throw funnelErr;
  console.log(`Funnel: ${funnel!.id}  (${funnel!.name})`);

  // 4. Funnel Stages
  const stageNames = ['New Lead', 'Contacted', 'Qualified', 'Converted'];
  const stages: Array<{ id: string; name: string }> = [];

  for (let i = 0; i < stageNames.length; i++) {
    const { data: stage, error: stageErr } = await db
      .from('funnel_stages')
      .insert({
        funnel_id: funnel!.id,
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
  console.log(`PROJECT1_FUNNEL_ID=${funnel!.id}`);
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
