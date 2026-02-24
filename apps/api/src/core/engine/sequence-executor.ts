import { supabaseAdmin } from '@marketing-funnel/db';
import { sequenceRegistry } from '../../orgs';
import { stepHandlerMap } from './step-handlers';
import { eventBus } from './event-bus';
import { getLeadById } from '../services/lead.service';
import { logActivity } from '../services/activity-log.service';
import type { StepLeadContext } from '../types';

export async function processEnrollments() {
  const { data: due, error } = await supabaseAdmin
    .from('sequence_enrollments')
    .select('*')
    .eq('status', 'active')
    .not('next_step_at', 'is', null)
    .lte('next_step_at', new Date().toISOString())
    .limit(50);

  if (error) {
    console.error('[sequence-executor] Query failed:', error);
    return;
  }

  if (!due || due.length === 0) return;

  console.log(`[sequence-executor] Processing ${due.length} enrollment(s)`);

  for (const enrollment of due) {
    try {
      await processOne(enrollment);
    } catch (err) {
      console.error(`[sequence-executor] Failed enrollment ${enrollment.id}:`, err);
      await markFailed(enrollment.id);
    }
  }
}

async function processOne(enrollment: {
  id: string;
  sequence_key: string;
  organization_id: string;
  lead_id: string;
  lead_pipeline_entry_id: string | null;
  current_step_index: number;
}) {
  const sequence = sequenceRegistry[enrollment.sequence_key];
  if (!sequence) {
    console.error(`[sequence-executor] Sequence "${enrollment.sequence_key}" not in registry`);
    await markFailed(enrollment.id);
    return;
  }

  const step = sequence.steps[enrollment.current_step_index];
  if (!step) {
    await markCompleted(enrollment);
    return;
  }

  const lead = await getLeadById(enrollment.lead_id);
  if (!lead) {
    console.error(`[sequence-executor] Lead ${enrollment.lead_id} not found`);
    await markFailed(enrollment.id);
    return;
  }

  const leadCtx: StepLeadContext = {
    id: lead.id,
    email: lead.email,
    phone: lead.phone ?? undefined,
    organizationId: enrollment.organization_id,
    firstName: lead.first_name ?? undefined,
    lastName: lead.last_name ?? undefined,
  };

  const handler = stepHandlerMap[step.type];
  if (!handler) {
    console.error(`[sequence-executor] No handler for step type "${step.type}"`);
    await markFailed(enrollment.id);
    return;
  }

  const result = await handler(
    step,
    leadCtx,
    { id: enrollment.id, pipelineEntryId: enrollment.lead_pipeline_entry_id ?? undefined },
  );

  await logActivity(
    enrollment.organization_id,
    enrollment.lead_id,
    `sequence.step_executed`,
    {
      sequenceKey: enrollment.sequence_key,
      stepIndex: enrollment.current_step_index,
      stepType: step.type,
    },
    enrollment.lead_pipeline_entry_id ?? undefined,
  );

  eventBus.emit({
    type: 'sequence_step_completed',
    organizationId: enrollment.organization_id,
    leadId: enrollment.lead_id,
    pipelineEntryId: enrollment.lead_pipeline_entry_id ?? undefined,
    metadata: {
      sequenceKey: enrollment.sequence_key,
      stepIndex: enrollment.current_step_index,
      stepType: step.type,
    },
    timestamp: new Date(),
  });

  const nextIndex = enrollment.current_step_index + 1;

  if (nextIndex >= sequence.steps.length) {
    await markCompleted(enrollment);
    return;
  }

  // For manual_task without delay, pause enrollment until manual resume
  if (step.type === 'manual_task' && !result.delayMs) {
    await supabaseAdmin
      .from('sequence_enrollments')
      .update({
        current_step_index: nextIndex,
        status: 'paused',
        next_step_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id);
    return;
  }

  const nextStepAt = result.delayMs
    ? new Date(Date.now() + result.delayMs).toISOString()
    : new Date().toISOString();

  await supabaseAdmin
    .from('sequence_enrollments')
    .update({
      current_step_index: nextIndex,
      next_step_at: nextStepAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollment.id);
}

async function markCompleted(enrollment: {
  id: string;
  sequence_key: string;
  organization_id: string;
  lead_id: string;
  lead_pipeline_entry_id: string | null;
}) {
  await supabaseAdmin
    .from('sequence_enrollments')
    .update({
      status: 'completed',
      next_step_at: null,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollment.id);

  eventBus.emit({
    type: 'sequence_completed',
    organizationId: enrollment.organization_id,
    leadId: enrollment.lead_id,
    pipelineEntryId: enrollment.lead_pipeline_entry_id ?? undefined,
    metadata: { sequenceKey: enrollment.sequence_key },
    timestamp: new Date(),
  });

  console.log(`[sequence-executor] Completed sequence "${enrollment.sequence_key}" for lead ${enrollment.lead_id}`);
}

async function markFailed(enrollmentId: string) {
  await supabaseAdmin
    .from('sequence_enrollments')
    .update({
      status: 'failed',
      next_step_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId);
}
