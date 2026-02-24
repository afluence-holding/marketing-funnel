-- Rename funnel → pipeline (tables and columns)
-- Run this in Supabase SQL Editor, then: npm run gen-types -w @marketing-funnel/api

-- 1. Rename tables
ALTER TABLE marketing.funnels RENAME TO pipelines;
ALTER TABLE marketing.funnel_stages RENAME TO pipeline_stages;
ALTER TABLE marketing.lead_funnel_entries RENAME TO lead_pipeline_entries;

-- 2. Rename columns in pipeline_stages
ALTER TABLE marketing.pipeline_stages RENAME COLUMN funnel_id TO pipeline_id;

-- 3. Rename columns in lead_pipeline_entries
ALTER TABLE marketing.lead_pipeline_entries RENAME COLUMN funnel_id TO pipeline_id;

-- 4. Rename column in workflows
ALTER TABLE marketing.workflows RENAME COLUMN funnel_id TO pipeline_id;

-- 5. Rename lead_funnel_entry_id → lead_pipeline_entry_id in referencing tables
ALTER TABLE marketing.activity_logs RENAME COLUMN lead_funnel_entry_id TO lead_pipeline_entry_id;
ALTER TABLE marketing.lead_stage_history RENAME COLUMN lead_funnel_entry_id TO lead_pipeline_entry_id;
ALTER TABLE marketing.workflow_executions RENAME COLUMN lead_funnel_entry_id TO lead_pipeline_entry_id;
