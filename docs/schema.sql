-- Story Funnel Studio — Postgres schema (shared-schema + RLS)
-- Anexo de DEV-BRIEF.md. Multi-tenant: tenant_id = organization_id (L2). RLS aísla por Organization.
-- Object storage guarda binarios; estas tablas guardan keys/URLs + content_hash.
-- Convenciones: PK uuid; toda tabla de tenant lleva tenant_id NOT NULL; timestamps timestamptz;
-- soft-delete deleted_at; índice estándar (tenant_id, created_at).

create extension if not exists pgcrypto;

-- ============ ENUMS ============
create type archetype_kind as enum
  ('masterclass','free-guide','reto','waitlist','application','short3','belief-shift','psa');
create type box_color   as enum ('black','white','red');
create type hook_source  as enum ('photo','nb2','edit');
create type asset_kind   as enum ('photo','ai_hook');
create type gen_model    as enum ('gemini-2.5-flash','gemini-3-pro');
create type job_status   as enum ('queued','running','done','failed','cancelled','rejected');
create type board_kind   as enum ('variant_grid','before_after_matrix','sequence_only');
create type vote_kind    as enum ('win','maybe','kill');
create type build_status as enum ('draft','rendered','archived');

-- ============ CATÁLOGO / CONFIG (platform-shared; tenant_id NULL = global) ============
create table archetype_template (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,                          -- NULL = template de plataforma; UUID = override privado
  archetype archetype_kind not null,
  version int not null default 1,
  is_active boolean not null default true,
  scarcity_mode text not null,             -- deadline_or_cupos|deadline_and_cupos|cupos|none|optional
  pains_len int4range,
  temario_len int4range,
  extra_fields jsonb not null default '[]',-- ['duracion'] | ['avatar','objecion','resultado'] | ['creencia','dato']
  stories jsonb not null,                  -- estructura narrativa con placeholders
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, archetype, version)
);
create table archetype_slot (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references archetype_template(id) on delete cascade,
  slot_key text not null, role text not null, position int not null,
  is_hook boolean not null default false,
  unique (template_id, slot_key)
);
create table design_token_set (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid, name text not null, tokens jsonb not null,
  created_at timestamptz not null default now()
);

-- ============ BIBLIOTECA DE ASSETS ============
create table creator_profile (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, organization_id uuid not null, business_unit_id uuid,
  handle text not null, niche text not null,
  register text not null default 'tú', gender_form text not null default 'neutro',
  brand jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  deleted_at timestamptz, unique (tenant_id, handle)
);
create table image_asset (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, creator_id uuid not null references creator_profile(id),
  parent_id uuid references image_asset(id), version int not null default 1,
  kind asset_kind not null, category text, label text, src text not null,
  width_px int, height_px int, checksum text, provenance jsonb not null default '{}',
  created_at timestamptz not null default now(), deleted_at timestamptz,
  unique (tenant_id, creator_id, src)
);
create table asset_tag (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null, name text not null,
  unique (tenant_id, name)
);
create table image_asset_tag (
  image_asset_id uuid not null references image_asset(id) on delete cascade,
  tag_id uuid not null references asset_tag(id) on delete cascade,
  primary key (image_asset_id, tag_id)
);
create table text_asset (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, creator_id uuid not null references creator_profile(id),
  slot_key text not null, label text, angle text,
  top_boxes jsonb not null default '[]', bottom_boxes jsonb not null default '[]',
  version int not null default 1, parent_id uuid references text_asset(id),
  created_at timestamptz not null default now(), deleted_at timestamptz
);
create table gen_image_job (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, creator_id uuid not null references creator_profile(id),
  model gen_model not null, hook_source hook_source not null,
  prompt text not null, negative text,
  base_photo_asset_id uuid references image_asset(id),
  status job_status not null default 'queued', pgboss_job_id text,
  output_asset_id uuid references image_asset(id), error text,
  created_at timestamptz not null default now(), completed_at timestamptz
);

-- ============ SECUENCIA / SPEC ============
create table story_sequence (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, organization_id uuid not null, business_unit_id uuid,
  cohort_id uuid not null, workflow_id uuid not null,
  creator_id uuid not null references creator_profile(id),
  template_id uuid not null references archetype_template(id),
  schema_version int not null default 1, version int not null default 1,
  parent_id uuid references story_sequence(id),
  status text not null default 'draft',
  campaign_label text, launch_label text,
  keyword text not null, hook_slot text not null default 'hook',
  funnel jsonb not null, pains jsonb not null default '[]', temario jsonb not null default '[]',
  photos jsonb not null default '{}', hook_image jsonb not null default '{}',
  overrides jsonb not null default '{}', copy_overrides jsonb not null default '{}',
  design_override jsonb not null default '{}', render_override jsonb not null default '{}',
  design_token_set_id uuid references design_token_set(id),
  created_by uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint keyword_fmt check (keyword ~ '^[A-ZÁÉÍÓÚÑ0-9]{3,15}$')
);
create table sequence_slot_binding (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, sequence_id uuid not null references story_sequence(id) on delete cascade,
  slot_key text not null,
  default_image_asset_id uuid references image_asset(id),
  default_text_asset_id uuid references text_asset(id),
  position int not null, unique (sequence_id, slot_key)
);
create table seed_build (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, sequence_id uuid not null references story_sequence(id) on delete cascade,
  name text not null, selection jsonb not null
);

-- ============ BUILD / PERMUTACIÓN (inmutable una vez renderizada) ============
create table build (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, sequence_id uuid not null references story_sequence(id),
  sequence_version int not null, template_version int not null,
  label text, selection jsonb not null, status build_status not null default 'draft',
  content_hash text not null, created_by uuid not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, content_hash)
);
create table build_frame (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, build_id uuid not null references build(id) on delete cascade,
  slot_key text not null, role text not null, position int not null,
  image_asset_id uuid references image_asset(id),
  resolved_copy jsonb not null, frame_overrides jsonb not null default '{}',
  unique (build_id, position)
);

-- ============ RENDER ============
create table render_job (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, build_id uuid not null references build(id),
  scope text not null default 'full', only_frames int[],
  status job_status not null default 'queued', pgboss_job_id text,
  device_scale_factor int not null default 2, engine_version text,
  started_at timestamptz, finished_at timestamptz, error text,
  created_at timestamptz not null default now()
);
create table render_output (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, render_job_id uuid not null references render_job(id) on delete cascade,
  build_frame_id uuid not null references build_frame(id), position int not null,
  png_path text not null, width_px int not null default 2160, height_px int not null default 3840,
  bytes bigint, checksum text, created_at timestamptz not null default now(),
  unique (render_job_id, position)
);

-- ============ BOARD DE REVISIÓN MULTI-REVISOR ============
create table review_board (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, cohort_id uuid not null,
  sequence_id uuid references story_sequence(id),
  board_kind board_kind not null default 'variant_grid',
  project_slug text not null, title text not null,
  display_meta jsonb not null default '{}', fixed_sequence jsonb not null default '[]',
  kpis jsonb not null default '[]', suggestions jsonb not null default '[]',
  consensus_threshold numeric not null default 0.60,
  created_at timestamptz not null default now(), deleted_at timestamptz,
  unique (tenant_id, project_slug)
);
create table board_variant (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, board_id uuid not null references review_board(id) on delete cascade,
  variant_slug text not null, label text not null, hypothesis text, angle text,
  tags jsonb not null default '[]', default_status vote_kind,
  build_id uuid references build(id), position int not null default 0,
  unique (board_id, variant_slug)
);
create table board_variant_frame (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, variant_id uuid not null references board_variant(id) on delete cascade,
  role text not null, label text, position int not null,
  image_ref text not null, copy text, after_ref text, before_label text, after_label text,
  unique (variant_id, position)
);
create table rubric_check (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, board_id uuid not null references review_board(id) on delete cascade,
  check_key text not null, label text not null, is_gate boolean not null default false, position int not null,
  unique (board_id, check_key)
);
create table reviewer (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, board_id uuid not null references review_board(id) on delete cascade,
  user_id uuid, enrollment_id uuid, display_name text not null,
  created_at timestamptz not null default now()
);
create table ballot (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, board_id uuid not null references review_board(id) on delete cascade,
  reviewer_id uuid not null references reviewer(id),
  submitted_at timestamptz, import_payload jsonb,
  created_at timestamptz not null default now(),
  unique (board_id, reviewer_id)
);
create table ballot_vote (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, ballot_id uuid not null references ballot(id) on delete cascade,
  variant_id uuid not null references board_variant(id), vote vote_kind not null, reason text,
  unique (ballot_id, variant_id)
);
create table ballot_rubric_result (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, ballot_id uuid not null references ballot(id) on delete cascade,
  variant_id uuid not null references board_variant(id),
  rubric_check_id uuid not null references rubric_check(id), passed boolean not null,
  unique (ballot_id, variant_id, rubric_check_id)
);
create table decision (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, board_id uuid not null references review_board(id),
  winner_variant_id uuid references board_variant(id), consensus_pct numeric,
  is_publishable boolean not null default false,
  pending_fixes jsonb not null default '[]', disagreements jsonb not null default '[]',
  decided_by uuid not null, decided_at timestamptz not null default now()
);

-- ============ COSTOS (atómicos → agregan hacia arriba) + AUDITORÍA ============
create table cost_event (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, cohort_id uuid not null,
  source text not null, ref_table text, ref_id uuid,
  qty numeric not null, unit_cost_usd numeric,
  amount_usd numeric generated always as (qty * coalesce(unit_cost_usd,0)) stored,
  occurred_at timestamptz not null default now()
);
create table audit_log (
  id bigint generated always as identity primary key,
  tenant_id uuid not null, actor_user_id uuid, action text not null,
  entity text not null, entity_id uuid, diff jsonb, at timestamptz not null default now()
);

-- ============ ÍNDICES (estándar validado + acceso) ============
create index on story_sequence (tenant_id, created_at desc);
create index on image_asset    (tenant_id, created_at desc);
create index on build          (tenant_id, created_at desc);
create index on render_job     (tenant_id, created_at desc);
create index on review_board   (tenant_id, created_at desc);
create index on ballot         (tenant_id, created_at desc);
create index on cost_event     (tenant_id, occurred_at desc);
create index on render_job     (status) where status in ('queued','running');
create index on gen_image_job  (status) where status in ('queued','running');
create index on image_asset    (creator_id) where deleted_at is null;
create index on story_sequence (cohort_id);
create index on cost_event     (cohort_id, source);
create index on image_asset    using gin (provenance);
create index on story_sequence using gin (funnel);
create index on build          (sequence_id, sequence_version);

-- ============ RLS (shared-schema + tenant_id). Aplicar a CADA tabla de tenant. ============
-- Ejemplo (repetir el patrón por tabla):
alter table story_sequence enable row level security;
alter table story_sequence force row level security;
create policy tenant_isolation on story_sequence
  using (tenant_id = current_setting('app.tenant_id')::uuid)
  with check (tenant_id = current_setting('app.tenant_id')::uuid);
-- Catálogo compartido (lectura de fila plataforma NULL + propias; escritura solo propias):
alter table archetype_template enable row level security;
create policy catalog_read on archetype_template for select
  using (tenant_id is null or tenant_id = current_setting('app.tenant_id')::uuid);
create policy catalog_write on archetype_template for all
  using (tenant_id = current_setting('app.tenant_id')::uuid)
  with check (tenant_id = current_setting('app.tenant_id')::uuid);

-- ============ VISTAS DERIVADAS (métricas NO se almacenan) ============
create view v_launch_cost as
  select tenant_id, cohort_id,
         sum(amount_usd) filter (where source='gemini_tokens')  as gemini_usd,
         sum(amount_usd) filter (where source='render_seconds') as render_usd,
         sum(amount_usd) as total_usd
  from cost_event group by tenant_id, cohort_id;

create view v_board_tally as
  select bv.board_id, bv.id as variant_id, bv.label,
         count(*) filter (where v.vote='win')   as wins,
         count(*) filter (where v.vote='maybe') as maybes,
         count(*) filter (where v.vote='kill')  as kills,
         count(distinct b.reviewer_id) as n_reviewers,
         round(count(*) filter (where v.vote='win')::numeric
               / nullif(count(distinct b.reviewer_id),0), 3) as win_pct
  from board_variant bv
  join ballot_vote v on v.variant_id = bv.id
  join ballot b on b.id = v.ballot_id and b.submitted_at is not null
  group by bv.board_id, bv.id, bv.label;

create view v_variant_gate_status as
  select brr.variant_id,
         bool_and(brr.passed) filter (where rc.is_gate) as passes_all_gates
  from ballot_rubric_result brr
  join rubric_check rc on rc.id = brr.rubric_check_id
  group by brr.variant_id;
