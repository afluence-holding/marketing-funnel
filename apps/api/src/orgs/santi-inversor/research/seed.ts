/**
 * Seed — creates the org, BU, pipeline, stages, and custom field definitions
 * for Santi Inversor / Research Offer.
 *
 * RUN (from apps/api/):
 *   npx ts-node src/orgs/santi-inversor/research/seed.ts
 *
 * Run ONCE. Copy the printed env block into your .env.
 */

import { supabaseAdmin as db } from '@marketing-funnel/db';

const ORG_NAME = 'Santi Inversor';
const BU_NAME = 'Research Offer';
const BU_DESCRIPTION = 'Qualification survey landing for Santi Inversor — Research Offer';
const PIPELINE_NAME = 'Research Offer Pipeline';

const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Sold', 'Lost'];

const CUSTOM_FIELDS: Array<{ field_key: string; field_label: string; field_type: 'text' | 'number' | 'boolean' | 'date' }> = [
  { field_key: 'country_code', field_label: 'Country code', field_type: 'text' },
  { field_key: 'country', field_label: 'Country', field_type: 'text' },
  { field_key: 'whatsapp_local', field_label: 'WhatsApp (local format)', field_type: 'text' },
  { field_key: 'edad', field_label: 'Age range', field_type: 'text' },
  { field_key: 'urgencia', field_label: 'Urgency (1-10)', field_type: 'number' },
  { field_key: 'punto_financiero', field_label: 'Current financial point', field_type: 'text' },
  { field_key: 'inversion_mes', field_label: 'Monthly investment capacity', field_type: 'text' },
  { field_key: 'tema_ayuda', field_label: 'Topics needing help (comma-separated)', field_type: 'text' },
  { field_key: 'vision', field_label: 'Financial vision', field_type: 'text' },
  { field_key: 'meta_12m', field_label: '12-month goal', field_type: 'text' },
  { field_key: 'session_id', field_label: 'Form session id', field_type: 'text' },
  { field_key: 'position', field_label: 'Form position reached', field_type: 'text' },
];

const ENV_PREFIX = 'SANTI_INVERSOR';

async function seed() {
  console.log(`Seeding ${ORG_NAME} / ${BU_NAME}...\n`);

  const { data: org, error: orgErr } = await db
    .from('organizations')
    .insert({ name: ORG_NAME })
    .select()
    .single();
  if (orgErr) throw orgErr;
  console.log(`Organization: ${org!.id}  (${org!.name})`);

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
  console.log('Done! Add these env vars and restart the API.');
  console.log('========================================');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
