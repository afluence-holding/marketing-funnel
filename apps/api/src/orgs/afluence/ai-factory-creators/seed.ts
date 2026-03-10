import { supabaseAdmin as db } from '@marketing-funnel/db';

const ORG_NAME = 'Afluence';
const BU_NAME = 'AI Factory Creators';
const BU_DESCRIPTION = 'Inbound + outbound funnel for creators and sales opportunities';
const PIPELINE_NAME = 'AI Factory Creators Pipeline';
const ENV_PREFIX = 'PROJECT2';

const STAGES = [
  { key: 'PROSPECTING', name: 'Prospecting' },
  { key: 'PRE_QUALIFIED_LEAD', name: 'Pre-qualified Lead' },
  { key: 'MEETING_SCHEDULE', name: 'Meeting Schedule' },
  { key: 'OPPORTUNITY', name: 'Opportunity' },
  { key: 'PRD', name: 'PRD' },
  { key: 'QUOTE', name: 'Quote' },
] as const;

const CUSTOM_FIELDS = [
  { field_key: 'form_type', field_label: 'Form Type', field_type: 'text' },
  { field_key: 'call_scheduled', field_label: 'Call Scheduled', field_type: 'boolean' },
  { field_key: 'call_scheduled_at', field_label: 'Call Scheduled At', field_type: 'text' },
  { field_key: 'instagram_handle', field_label: 'Instagram Handle', field_type: 'text' },
  { field_key: 'service_interest', field_label: 'Service Interest', field_type: 'text' },
  { field_key: 'nicho', field_label: 'Nicho', field_type: 'text' },
  { field_key: 'facturacion', field_label: 'Facturacion', field_type: 'text' },
  { field_key: 'genera_ingresos', field_label: 'Genera Ingresos', field_type: 'text' },
  { field_key: 'inversion', field_label: 'Inversion', field_type: 'text' },
  { field_key: 'que_construir', field_label: 'Que Construir', field_type: 'text' },
  { field_key: 'timing', field_label: 'Timing', field_type: 'text' },
  { field_key: 'meeting_scheduled', field_label: 'Meeting Scheduled', field_type: 'text' },
  { field_key: 'confirma_whatsapp', field_label: 'Confirma WhatsApp', field_type: 'text' },
  { field_key: 'confirmaWhatsapp', field_label: 'Confirma WhatsApp Camel', field_type: 'text' },
] as const;

async function seed() {
  console.log('Seeding afluence/ai-factory-creators...\n');

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

  const createdStages: Array<{ id: string; key: string; name: string }> = [];
  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];
    const { data: created, error: stageErr } = await db
      .from('pipeline_stages')
      .insert({
        pipeline_id: pipeline!.id,
        name: stage.name,
        position: i + 1,
      })
      .select()
      .single();
    if (stageErr) throw stageErr;
    createdStages.push({ id: created!.id, key: stage.key, name: created!.name });
    console.log(`  Stage ${i + 1}: ${created!.id}  (${created!.name})`);
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

  console.log('\n--- Copy these to your .env ---\n');
  console.log(`${ENV_PREFIX}_ORG_ID=${org!.id}`);
  console.log(`${ENV_PREFIX}_PIPELINE_ID=${pipeline!.id}`);
  for (const stage of createdStages) {
    console.log(`${ENV_PREFIX}_STAGE_${stage.key}=${stage.id}`);
  }
  console.log('\n--- Done! ---');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
