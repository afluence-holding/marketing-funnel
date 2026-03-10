ALTER TABLE marketing.lead_pipeline_entries
ADD COLUMN IF NOT EXISTS clickup_task_id varchar(255) NULL;
