-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE marketing.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  lead_id uuid NOT NULL,
  lead_funnel_entry_id uuid,
  action character varying NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES marketing.organizations(id),
  CONSTRAINT activity_logs_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES marketing.leads(id),
  CONSTRAINT activity_logs_lead_funnel_entry_id_fkey FOREIGN KEY (lead_funnel_entry_id) REFERENCES marketing.lead_funnel_entries(id)
);
CREATE TABLE marketing.business_units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT business_units_pkey PRIMARY KEY (id),
  CONSTRAINT business_units_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES marketing.organizations(id)
);
CREATE TABLE marketing.custom_field_definitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  entity_type character varying NOT NULL,
  field_key character varying NOT NULL,
  field_label character varying NOT NULL,
  field_type character varying NOT NULL,
  options jsonb,
  required boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT custom_field_definitions_pkey PRIMARY KEY (id),
  CONSTRAINT custom_field_definitions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES marketing.organizations(id)
);
CREATE TABLE marketing.custom_field_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_type character varying NOT NULL,
  entity_id uuid NOT NULL,
  field_definition_id uuid NOT NULL,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT custom_field_values_pkey PRIMARY KEY (id),
  CONSTRAINT custom_field_values_field_definition_id_fkey FOREIGN KEY (field_definition_id) REFERENCES marketing.custom_field_definitions(id)
);
CREATE TABLE marketing.funnel_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  funnel_id uuid NOT NULL,
  name character varying NOT NULL,
  position integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT funnel_stages_pkey PRIMARY KEY (id),
  CONSTRAINT funnel_stages_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES marketing.funnels(id)
);
CREATE TABLE marketing.funnels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT funnels_pkey PRIMARY KEY (id),
  CONSTRAINT funnels_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES marketing.business_units(id)
);
CREATE TABLE marketing.lead_funnel_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  funnel_id uuid NOT NULL,
  current_stage_id uuid NOT NULL,
  channel character varying NOT NULL,
  trigger_type character varying NOT NULL,
  source_type character varying,
  source_id uuid,
  utm_data jsonb,
  entered_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lead_funnel_entries_pkey PRIMARY KEY (id),
  CONSTRAINT lead_funnel_entries_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES marketing.leads(id),
  CONSTRAINT lead_funnel_entries_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES marketing.funnels(id),
  CONSTRAINT lead_funnel_entries_current_stage_id_fkey FOREIGN KEY (current_stage_id) REFERENCES marketing.funnel_stages(id)
);
CREATE TABLE marketing.lead_stage_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_funnel_entry_id uuid NOT NULL,
  from_stage_id uuid,
  to_stage_id uuid NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lead_stage_history_pkey PRIMARY KEY (id),
  CONSTRAINT lead_stage_history_lead_funnel_entry_id_fkey FOREIGN KEY (lead_funnel_entry_id) REFERENCES marketing.lead_funnel_entries(id),
  CONSTRAINT lead_stage_history_from_stage_id_fkey FOREIGN KEY (from_stage_id) REFERENCES marketing.funnel_stages(id),
  CONSTRAINT lead_stage_history_to_stage_id_fkey FOREIGN KEY (to_stage_id) REFERENCES marketing.funnel_stages(id)
);
CREATE TABLE marketing.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  email character varying NOT NULL,
  first_name character varying,
  last_name character varying,
  phone character varying,
  source character varying,
  status character varying NOT NULL DEFAULT 'new'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT leads_pkey PRIMARY KEY (id),
  CONSTRAINT leads_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES marketing.organizations(id)
);
CREATE TABLE marketing.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE marketing.workflow_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL,
  lead_id uuid NOT NULL,
  lead_funnel_entry_id uuid NOT NULL,
  current_step_id uuid,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT workflow_executions_pkey PRIMARY KEY (id),
  CONSTRAINT workflow_executions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES marketing.workflows(id),
  CONSTRAINT workflow_executions_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES marketing.leads(id),
  CONSTRAINT workflow_executions_lead_funnel_entry_id_fkey FOREIGN KEY (lead_funnel_entry_id) REFERENCES marketing.lead_funnel_entries(id),
  CONSTRAINT workflow_executions_current_step_id_fkey FOREIGN KEY (current_step_id) REFERENCES marketing.workflow_steps(id)
);
CREATE TABLE marketing.workflow_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL,
  step_type character varying NOT NULL,
  config jsonb,
  next_step_id uuid,
  is_entry_point boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT workflow_steps_pkey PRIMARY KEY (id),
  CONSTRAINT workflow_steps_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES marketing.workflows(id)
);
CREATE TABLE marketing.workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  funnel_id uuid NOT NULL,
  name character varying NOT NULL,
  trigger_on character varying NOT NULL,
  trigger_conditions jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT workflows_pkey PRIMARY KEY (id),
  CONSTRAINT workflows_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES marketing.funnels(id)
);