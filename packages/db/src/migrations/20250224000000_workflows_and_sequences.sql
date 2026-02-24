-- Migration: Replace old workflow tables with Workflows + Sequences architecture
-- Workflows = event-driven automation (the brain: instant actions)
-- Sequences = time-based outreach cadences (the hands: send, wait, call)
--
-- Safe to drop: old tables have no data in production.
-- Run this in Supabase SQL Editor, then: npm run gen-types -w @marketing-funnel/api

-- ============================================================================
-- 1. Drop old workflow tables
-- ============================================================================

DROP TABLE IF EXISTS marketing.workflow_executions;
DROP TABLE IF EXISTS marketing.workflow_steps;
DROP TABLE IF EXISTS marketing.workflows;

-- ============================================================================
-- 2. Workflows (event-driven automation rules)
-- ============================================================================

CREATE TABLE marketing.workflows (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES marketing.organizations(id) ON DELETE CASCADE,
    name        varchar NOT NULL,
    trigger_on  varchar NOT NULL,
    trigger_conditions jsonb,
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE marketing.workflows IS 'Event-driven automation rules. When an event matches trigger_on + trigger_conditions, execute workflow_actions in order.';
COMMENT ON COLUMN marketing.workflows.trigger_on IS 'Event type: stage_entered, status_changed, lead_created, sequence_completed, manual';
COMMENT ON COLUMN marketing.workflows.trigger_conditions IS 'JSON conditions: { pipeline_id, stage_id } or { status: "qualified" } etc.';

-- ============================================================================
-- 3. Workflow Actions (what a workflow does, ordered)
-- ============================================================================

CREATE TABLE marketing.workflow_actions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id uuid NOT NULL REFERENCES marketing.workflows(id) ON DELETE CASCADE,
    action_type varchar NOT NULL,
    config      jsonb,
    position    integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE marketing.workflow_actions IS 'Ordered actions executed instantly when a workflow fires.';
COMMENT ON COLUMN marketing.workflow_actions.action_type IS 'Action type: move_stage, update_status, enroll_sequence, notify, log';
COMMENT ON COLUMN marketing.workflow_actions.config IS 'Action config: { stage_id } or { sequence_id } or { status: "MQL" } etc.';
COMMENT ON COLUMN marketing.workflow_actions.position IS 'Execution order within the workflow (0-based).';

-- ============================================================================
-- 4. Sequences (outreach cadences)
-- ============================================================================

CREATE TABLE marketing.sequences (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES marketing.organizations(id) ON DELETE CASCADE,
    name        varchar NOT NULL,
    description text,
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE marketing.sequences IS 'Time-based outreach cadences. A lead is enrolled and progresses through steps over time.';

-- ============================================================================
-- 5. Sequence Steps (ordered steps in a sequence)
-- ============================================================================

CREATE TABLE marketing.sequence_steps (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id    uuid NOT NULL REFERENCES marketing.sequences(id) ON DELETE CASCADE,
    step_type      varchar NOT NULL,
    config         jsonb,
    next_step_id   uuid REFERENCES marketing.sequence_steps(id) ON DELETE SET NULL,
    is_entry_point boolean NOT NULL DEFAULT false,
    position       integer NOT NULL DEFAULT 0,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE marketing.sequence_steps IS 'Ordered steps in a sequence. Chained via next_step_id for traversal, position for display.';
COMMENT ON COLUMN marketing.sequence_steps.step_type IS 'Step type: send_whatsapp, send_email, ai_call, wait, manual_task';
COMMENT ON COLUMN marketing.sequence_steps.config IS 'Step config: { template_id, delay_days, phone_config, message } etc.';
COMMENT ON COLUMN marketing.sequence_steps.next_step_id IS 'Next step in the chain. NULL = end of sequence.';

-- ============================================================================
-- 6. Sequence Enrollments (a lead running through a sequence)
-- ============================================================================

CREATE TABLE marketing.sequence_enrollments (
    id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id            uuid NOT NULL REFERENCES marketing.sequences(id) ON DELETE CASCADE,
    lead_id                uuid NOT NULL REFERENCES marketing.leads(id) ON DELETE CASCADE,
    lead_pipeline_entry_id uuid REFERENCES marketing.lead_pipeline_entries(id) ON DELETE SET NULL,
    current_step_id        uuid REFERENCES marketing.sequence_steps(id) ON DELETE SET NULL,
    status                 varchar NOT NULL DEFAULT 'active',
    started_at             timestamptz NOT NULL DEFAULT now(),
    next_step_at           timestamptz,
    completed_at           timestamptz,
    updated_at             timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE marketing.sequence_enrollments IS 'A lead actively running through a sequence. Cron checks next_step_at to advance.';
COMMENT ON COLUMN marketing.sequence_enrollments.status IS 'Enrollment status: active, paused, completed, failed, unenrolled';
COMMENT ON COLUMN marketing.sequence_enrollments.next_step_at IS 'When the cron should execute the next step. NULL if waiting for manual action or completed.';
COMMENT ON COLUMN marketing.sequence_enrollments.lead_pipeline_entry_id IS 'Optional pipeline context. NULL if enrollment happened outside a pipeline.';

-- ============================================================================
-- 7. Indexes
-- ============================================================================

CREATE INDEX idx_workflows_org ON marketing.workflows(organization_id);
CREATE INDEX idx_workflows_trigger ON marketing.workflows(trigger_on) WHERE is_active = true;

CREATE INDEX idx_workflow_actions_workflow ON marketing.workflow_actions(workflow_id, position);

CREATE INDEX idx_sequences_org ON marketing.sequences(organization_id);

CREATE INDEX idx_sequence_steps_sequence ON marketing.sequence_steps(sequence_id, position);

CREATE INDEX idx_sequence_enrollments_sequence ON marketing.sequence_enrollments(sequence_id);
CREATE INDEX idx_sequence_enrollments_lead ON marketing.sequence_enrollments(lead_id);
CREATE INDEX idx_sequence_enrollments_pending ON marketing.sequence_enrollments(next_step_at)
    WHERE status = 'active' AND next_step_at IS NOT NULL;

-- ============================================================================
-- 8. RLS (match existing pattern — permissive for now)
-- ============================================================================

ALTER TABLE marketing.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.sequence_enrollments ENABLE ROW LEVEL SECURITY;
