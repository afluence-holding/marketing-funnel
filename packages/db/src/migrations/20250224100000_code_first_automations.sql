-- Migration: Code-First Automations
-- Move sequence/workflow DEFINITIONS from DB to TypeScript code.
-- DB only stores RUNTIME data (enrollments, leads, activity logs).
--
-- Drops: workflow_actions, workflows, sequence_steps, sequences, sequence_enrollments (old)
-- Creates: sequence_enrollments (simplified, references code by key + step index)

-- ============================================================================
-- 1. Drop definition tables (no production data)
-- ============================================================================

DROP TABLE IF EXISTS marketing.workflow_actions;
DROP TABLE IF EXISTS marketing.workflows;
DROP TABLE IF EXISTS marketing.sequence_enrollments;
DROP TABLE IF EXISTS marketing.sequence_steps;
DROP TABLE IF EXISTS marketing.sequences;

-- ============================================================================
-- 2. Create simplified sequence_enrollments (runtime only)
-- ============================================================================

CREATE TABLE marketing.sequence_enrollments (
    id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_key           varchar NOT NULL,
    organization_id        uuid NOT NULL REFERENCES marketing.organizations(id) ON DELETE CASCADE,
    lead_id                uuid NOT NULL REFERENCES marketing.leads(id) ON DELETE CASCADE,
    lead_pipeline_entry_id uuid REFERENCES marketing.lead_pipeline_entries(id) ON DELETE SET NULL,
    current_step_index     integer NOT NULL DEFAULT 0,
    status                 varchar NOT NULL DEFAULT 'active',
    next_step_at           timestamptz,
    started_at             timestamptz NOT NULL DEFAULT now(),
    completed_at           timestamptz,
    updated_at             timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE marketing.sequence_enrollments IS 'Runtime: a lead progressing through a code-defined sequence. Cron checks next_step_at to advance.';
COMMENT ON COLUMN marketing.sequence_enrollments.sequence_key IS 'References a SequenceDef.key in TypeScript code (e.g. welcome-creators).';
COMMENT ON COLUMN marketing.sequence_enrollments.current_step_index IS 'Index into SequenceDef.steps[] array (0-based).';
COMMENT ON COLUMN marketing.sequence_enrollments.status IS 'active, paused, completed, failed, unenrolled';
COMMENT ON COLUMN marketing.sequence_enrollments.next_step_at IS 'When the cron should execute the next step. NULL = paused or completed.';

-- ============================================================================
-- 3. Indexes
-- ============================================================================

CREATE INDEX idx_sequence_enrollments_pending
    ON marketing.sequence_enrollments(next_step_at)
    WHERE status = 'active' AND next_step_at IS NOT NULL;

CREATE INDEX idx_sequence_enrollments_lead
    ON marketing.sequence_enrollments(lead_id);

CREATE INDEX idx_sequence_enrollments_sequence_key
    ON marketing.sequence_enrollments(sequence_key);

-- ============================================================================
-- 4. RLS
-- ============================================================================

ALTER TABLE marketing.sequence_enrollments ENABLE ROW LEVEL SECURITY;
