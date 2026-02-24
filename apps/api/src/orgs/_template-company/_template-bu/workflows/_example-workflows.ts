/**
 * ============================================================================
 * EXAMPLE WORKFLOWS — Reference for ALL triggers and actions
 * ============================================================================
 *
 * A workflow reacts INSTANTLY to an event. When the event fires, the workflow
 * engine checks all registered workflows, finds matches, and executes actions.
 *
 * Structure:
 *   trigger: { event: '<event_type>', conditions: { ... } }
 *   actions: [ { type: '<action_type>', ... }, ... ]
 *
 * THIS FILE IS A REFERENCE CATALOG. Don't use all of these.
 * Copy the workflows you need into your own files.
 *
 * KEY RULES:
 * - Every workflow needs a unique `key`
 * - `conditions` is optional — omit it or pass {} to match ALL events of that type
 * - Actions execute in order, top to bottom
 * - One event can match multiple workflows (all of them fire)
 */

import type { WorkflowDef } from '../../../../core/types';
import { IDS } from '../config';

// ===========================================================================
// TRIGGER: lead_created
// Fires when a NEW lead is ingested for the first time.
// ===========================================================================

export const autoEnrollOnCreate: WorkflowDef = {
  key: 'template-auto-enroll',
  name: 'Auto-enroll new leads into welcome sequence',
  trigger: {
    event: 'lead_created',
    conditions: {},  // no conditions = matches ALL new leads
  },
  actions: [
    { type: 'enroll_sequence', sequenceKey: 'template-example' },
    { type: 'log', message: 'New lead auto-enrolled into welcome sequence' },
  ],
};

// ===========================================================================
// TRIGGER: lead_updated
// Fires when an EXISTING lead is re-ingested (fields merged).
// ===========================================================================

export const logOnUpdate: WorkflowDef = {
  key: 'template-log-update',
  name: 'Log when a lead is updated via re-ingestion',
  trigger: {
    event: 'lead_updated',
    conditions: {},
  },
  actions: [
    { type: 'log', message: 'Lead data updated via re-ingestion' },
  ],
};

// ===========================================================================
// TRIGGER: stage_entered
// Fires when a lead ENTERS a specific pipeline stage.
// Use `conditions.stageId` to filter which stage.
// ===========================================================================

export const onQualified: WorkflowDef = {
  key: 'template-on-qualified',
  name: 'When lead reaches Qualified stage, start nurture and notify',
  trigger: {
    event: 'stage_entered',
    conditions: {
      stageId: IDS.stages.qualified,  // only fires for this specific stage
    },
  },
  actions: [
    // Stop the welcome sequence (they're past that)
    { type: 'unenroll_sequence', sequenceKey: 'template-example' },
    // Start a qualified-specific sequence (you would create this)
    // { type: 'enroll_sequence', sequenceKey: 'template-qualified-nurture' },
    { type: 'notify', channel: 'slack', message: 'Lead qualified — ready for sales' },
    { type: 'log', message: 'Lead moved to Qualified, unenrolled from welcome' },
  ],
};

// ===========================================================================
// TRIGGER: stage_exited
// Fires when a lead LEAVES a specific pipeline stage.
// ===========================================================================

export const onLeftNewLead: WorkflowDef = {
  key: 'template-left-new-lead',
  name: 'Log when a lead exits the New Lead stage',
  trigger: {
    event: 'stage_exited',
    conditions: {
      stageId: IDS.stages.new_lead,
    },
  },
  actions: [
    { type: 'log', message: 'Lead exited New Lead stage' },
  ],
};

// ===========================================================================
// TRIGGER: status_changed
// Fires when a lead's status field changes (e.g., new → contacted).
// Metadata: { oldStatus, newStatus }
// ===========================================================================

export const onStatusQualified: WorkflowDef = {
  key: 'template-status-qualified',
  name: 'When status changes to qualified, move stage',
  trigger: {
    event: 'status_changed',
    conditions: {
      newStatus: 'qualified',  // only fires when the NEW status is 'qualified'
    },
  },
  actions: [
    { type: 'move_stage', stageId: IDS.stages.qualified },
  ],
};

// ===========================================================================
// TRIGGER: call_completed
// Fires when an ElevenLabs AI call finishes successfully.
// Metadata: { conversationId }
// ===========================================================================

export const onCallCompleted: WorkflowDef = {
  key: 'template-call-completed',
  name: 'After successful AI call, move to Contacted and start post-call flow',
  trigger: {
    event: 'call_completed',
    conditions: {},
  },
  actions: [
    { type: 'move_stage', stageId: IDS.stages.contacted },
    { type: 'update_status', status: 'contacted' },
    // { type: 'enroll_sequence', sequenceKey: 'template-post-call' },
    { type: 'log', message: 'AI call completed, moved to Contacted' },
  ],
};

// ===========================================================================
// TRIGGER: call_failed
// Fires when an ElevenLabs AI call fails.
// Metadata: { conversationId, error }
// ===========================================================================

export const onCallFailed: WorkflowDef = {
  key: 'template-call-failed',
  name: 'On failed call, log and notify team',
  trigger: {
    event: 'call_failed',
    conditions: {},
  },
  actions: [
    { type: 'log', message: 'AI call failed — needs manual follow-up' },
    { type: 'notify', channel: 'slack', message: 'AI call failed for a lead. Check logs.' },
  ],
};

// ===========================================================================
// TRIGGER: sequence_step_completed
// Fires after each step in a sequence finishes.
// Metadata: { sequenceKey, stepIndex, stepType }
// ===========================================================================

export const onFirstStepDone: WorkflowDef = {
  key: 'template-first-step-done',
  name: 'After first WhatsApp is sent, update status to contacted',
  trigger: {
    event: 'sequence_step_completed',
    conditions: {
      sequenceKey: 'template-example',
      stepIndex: 0,  // first step (0-based)
    },
  },
  actions: [
    { type: 'update_status', status: 'contacted' },
  ],
};

// ===========================================================================
// TRIGGER: sequence_completed
// Fires when an entire sequence finishes (all steps done).
// Metadata: { sequenceKey }
// ===========================================================================

export const onSequenceDone: WorkflowDef = {
  key: 'template-sequence-done',
  name: 'When welcome sequence completes, move to Qualified if not already',
  trigger: {
    event: 'sequence_completed',
    conditions: {
      sequenceKey: 'template-example',
    },
  },
  actions: [
    { type: 'move_stage', stageId: IDS.stages.qualified },
    { type: 'log', message: 'Welcome sequence completed, promoted to Qualified' },
    { type: 'notify', channel: 'slack', message: 'Lead completed full welcome sequence' },
  ],
};

// ===========================================================================
// ALL ACTIONS REFERENCE
// ===========================================================================
//
// enroll_sequence   — { type: 'enroll_sequence', sequenceKey: '<key>' }
//                     Puts the lead into a time-based sequence.
//
// unenroll_sequence — { type: 'unenroll_sequence', sequenceKey: '<key>' }
//                     Stops and removes the lead from a sequence.
//
// move_stage        — { type: 'move_stage', stageId: '<uuid>' }
//                     Moves the lead to a different pipeline stage.
//                     Emits stage_entered and stage_exited events (can chain workflows).
//
// update_status     — { type: 'update_status', status: '<status>' }
//                     Changes the lead's status field.
//                     Emits status_changed event (can chain workflows).
//
// log               — { type: 'log', message: '<text>' }
//                     Writes to activity_logs table.
//
// notify            — { type: 'notify', channel: '<channel>', message: '<text>' }
//                     Sends notification (placeholder: currently console.log).
//                     Ready for Slack, Discord, email integration.
//
