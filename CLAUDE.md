# CLAUDE.md — Marketing Funnel Monorepo

## Project Overview

Multi-tenant marketing automation platform. Code-first sequences and workflows drive lead nurturing through WhatsApp, Email, and AI phone calls. Landing pages capture leads with full pixel tracking. A modular back-office (`apps/admin`) is the operational hub for the team and creators: campaign analytics, landing responses, launch operations, and WhatsApp group management.

**Repo:** `afluence-holding/marketing-funnel`
**Runtime:** Node.js + TypeScript everywhere

## Monorepo Structure

```
apps/
  api/    → @marketing-funnel/api    — Express 5 automation server (port 3000)
  web/    → @marketing-funnel/web    — Next.js 15 landing pages (port 3001)
  admin/  → @marketing-funnel/admin  — Next.js 15 modular back-office (port 3002)

packages/
  config/          → Zod-validated env vars (shared)
  db/              → Supabase client + auto-generated types + SQL migrations
  email/           → Resend + React Email templates
  whatsapp-client/ → WhatsApp Cloud API wrapper
  elevenlabs/      → ElevenLabs Conversational AI client
  meta-ads/        → Meta Marketing API client (pulls campaigns/insights → meta_ops)
  clickup-client/  → ClickUp API wrapper
```

Workspace manager: **npm workspaces** (not pnpm, not yarn).

## Commands

```bash
npm install                                  # Install all workspaces
npm run dev:api                              # Start API (port 3000)
npm run dev:web                              # Start web (port 3001)
npm run dev -w @marketing-funnel/admin       # Start admin back-office (port 3002)
npm run build                                # Build all workspaces
npm run typecheck                            # Typecheck all workspaces
npm run seed -w @marketing-funnel/api        # Seed org/pipeline/stages in Supabase
npm run gen-types -w @marketing-funnel/api   # Regenerate Supabase types
```

SQL migrations live in `packages/db/src/migrations/` and are applied to Supabase
with `psql "$DATABASE_URL" -f <file>` (strip any `?pgbouncer=true` suffix). Keep
migrations **additive and idempotent** (`CREATE ... IF NOT EXISTS`,
`ADD COLUMN IF NOT EXISTS`) — campaigns are live.

## Architecture Principles

- **Code-first automations**: Sequences and workflows are TypeScript definitions in `apps/api/src/orgs/<org>/<bu>/`. DB stores runtime state only (enrollments, history).
- **Event-driven**: Services emit typed `PipelineEvent`s to `eventBus`. Workflow engine listens and executes actions instantly.
- **Multi-tenant by directory**: Each org/BU gets its own directory under `orgs/`. A central registry (`orgs/index.ts`) aggregates all sequences, workflows, routing, and configs.
- **Single deploy**: One API process serves all organizations.
- **No queues (v0)**: Direct API calls for WhatsApp/Email/Calls. Queues planned for v1.
- **Modular back-office**: `apps/admin` is a data-driven module hub. Each BU/tenant enables a set of modules (Campañas, Respuestas, Launch Ops, Grupos WhatsApp) via a registry. Admin writes go through Server Actions → repository → service-role Supabase client (no Express round-trip).

## Admin Back-Office (`apps/admin`)

Next.js 15 (App Router, `force-dynamic`) back-office. Routes are BU-scoped:
`/[organizer]/[bu][/module]`. Branding is per-org: the BU layout spreads
`brandCssVars(organizer)` so every module adopts the org accent over a light
`.centro-theme` palette.

### Module registry

Single source of truth: `apps/admin/src/lib/modules/registry.ts`.
- `AdminModuleId` + `ADMIN_MODULES` (label, `pathSuffix`).
- `ENABLED` map keyed by `${organizer}/${bu}` (data-driven enablement, `*` default).
- `enabledModules` / `isModuleEnabled` / `buildTabs` drive the tab bar and the
  Centro sidebar (`adminModuleLinks`). Add a module here + an icon in
  `lib/launch-ops/navigation.ts` and it shows up everywhere automatically.

Current modules: **campaigns** (Meta analytics), **responses** (landing form
responses), **launch** (Launch Ops / Centro de Operaciones), **whatsapp-groups**
(group rotation CRUD).

### Module conventions (template)

```
app/[organizer]/[bu]/<module>/page.tsx     ← Server Component (gate + initial load)
app/[organizer]/[bu]/<module>/actions.ts   ← 'use server' mutations (RBAC guard)
lib/<module>/repository.ts                  ← service-role reads/writes
lib/<module>/types.ts                       ← domain types
components/<module>/<module>-view.tsx       ← client orchestrator (.launch-* shell)
```

- Writes use `supabaseAdminForSchema(<schema>)` helpers in `lib/supabase/server.ts`
  (`getSupabaseMarketing`, `getSupabaseLaunchOps`, `getSupabaseBackoffice`, …).
- Refresh after mutation with `router.refresh()` (not `revalidatePath`).
- Validation is manual in the repository (no Zod in admin yet).
- Smoke scripts live in `apps/admin/scripts/smoke-*.mjs`.

### RBAC (Centro de Operaciones)

Roles + module grants live in the `backoffice` schema. `getOpsSession()`
(`lib/backoffice/session.ts`) resolves the user's `OpsRole` and the
`role_module_grant` matrix. `canManage` (admin/agnostico) gates administrative
writes — every mutating server action re-checks it server-side.

## Key Patterns

### Adding a new org/BU

Copy `apps/api/src/orgs/_template-company/_template-bu/` and implement:
- `config.ts` — org IDs, pipeline ID, stage IDs, valid statuses, timezone
- `routing.ts` — lead-to-pipeline routing logic
- `seed.ts` — Supabase seed script for org/BU/pipeline/stages
- `sequences/` — automated outreach cadences
- `workflows/` — event-driven automation rules

Register in `apps/api/src/orgs/index.ts`.

### Adding a new landing page

Create route under `apps/web/src/app/(landings)/<org>/<bu>/<landing>/page.tsx`.
Use `<LeadForm>` component for lead capture — it handles UTM params and pixel events automatically.

### Sequence step types

`send_whatsapp` (text | template | image | video | document | buttons | list), `send_email`, `ai_call`, `wait`, `manual_task`

Step handlers live in `apps/api/src/core/engine/step-handlers/`.

### Workflow action types

`move_stage`, `update_status`, `enroll_sequence`, `unenroll_sequence`, `log`, `notify`

Action handlers live in `apps/api/src/core/engine/action-handlers/`.

### Workflow event types

`lead_created`, `lead_updated`, `stage_entered`, `stage_exited`, `status_changed`, `sequence_step_completed`, `sequence_completed`, `call_completed`, `call_failed`

## Database

**Supabase PostgreSQL**. Multiple schemas, each exposed to PostgREST
(`public, graphql_public, marketing, marketing_ops, meta_ops, backoffice, launch_ops`):

**`marketing`** — CRM + lead capture.
- Structure (seeded once): `organizations`, `business_units`, `pipelines`, `pipeline_stages`, `custom_field_definitions`
- Runtime (auto-populated): `leads`, `lead_pipeline_entries`, `lead_stage_history`, `custom_field_values`, `sequence_enrollments`, `activity_logs`
- Dedicated landing tables for creators whose intake lives outside the CRM: e.g. `bukku_leads`, `mama_sin_caos_leads`, `caro_fitness_progress`
- WhatsApp group rotation: `whatsapp_group_pools`, `whatsapp_groups`, `whatsapp_group_assignments`

**`meta_ops`** — Meta Ads dashboard (organizers, business_units with `slug`, campaigns, ad sets, insights). Populated by `packages/meta-ads`.

**`backoffice`** — identity & tenancy: `profile`, `afluence_membership` (staff + `ops_role`), `tenant`, `tenant_membership`, `role_module_grant` (RBAC), `service_identity`.

**`launch_ops`** — Launch Ops tracker / Centro de Operaciones: `launch` (a cohort, e.g. `code = 'DI21-C2'`), `phase`, `task`, `task_step`, `kpi`, `resource`, `content_item`, `message_asset`, `status_history`, `audit_log`, `idempotency_key`.

Types are auto-generated via `npm run gen-types` → `packages/db/src/types.ts` (typed for `marketing` only; other schemas use the untyped `supabaseAdminForSchema`). Never edit types manually.

Migrations live in `packages/db/src/migrations/` (applied via `psql`).

## WhatsApp Group Rotation

Landings that funnel registrants into WhatsApp groups use a DB-driven rotation:
- A **pool** is scoped by `(org_key, bu_key, pool_key)` and optionally linked to a
  cohort via `launch_code`. It owns **N groups** (invite links) rotated by `capacity`.
- Pools are declared code-first per BU (`apps/api/src/orgs/<org>/<bu>/whatsapp-groups.ts`,
  aggregated in `orgs/index.ts` → `whatsappGroupPoolRegistry`) and seeded on boot —
  but `seedWhatsAppGroupPools` only inserts groups into an **empty** pool.
- Runtime assignment (`assignGroup` in `whatsapp-group-rotation.service.ts`) is atomic
  and idempotent by phone; the landing calls `POST /api/orgs/:org/bus/:bu/whatsapp-group/assign`.
- Day-to-day management (add/edit/disable groups, new cohorts/pools) is done in the admin
  **Grupos WhatsApp** module — never edit the rotation runtime to add a group.

## Environment Variables

Env files at monorepo root: `.env` and `.env.local` (loaded by `packages/config`).

**Required:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `RESEND_API_KEY`

**Optional (per integration):** `WHATSAPP_*`, `ELEVENLABS_*`

**Per-org config:** `PROJECT1_ORG_ID`, `PROJECT1_PIPELINE_ID`, `PROJECT1_STAGE_*` (loaded in org config files)

**Web (Next.js public):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_META_PIXEL_*`, `NEXT_PUBLIC_GA4_*`, `NEXT_PUBLIC_TIKTOK_*`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_API_URL`

## API Endpoints

```
GET  /api/health
POST /api/orgs/:orgKey/bus/:buKey/ingest                  # Lead ingestion
GET  /api/leads                                           # List leads
GET  /api/leads/:id                                       # Lead detail
PUT  /api/leads/:leadId/pipeline-entries/:entryId/stage   # Move stage

POST   /api/enrollments                                   # Enroll in sequence
GET    /api/enrollments/:id
DELETE /api/enrollments/:id                               # Unenroll
PATCH  /api/enrollments/:id/pause
PATCH  /api/enrollments/:id/resume

POST /api/elevenlabs/webhook                              # Call event webhook
POST /api/elevenlabs/call                                 # Trigger AI call

POST /api/orgs/:orgKey/bus/:buKey/whatsapp-group/assign   # Assign lead to a rotating group (landing)
GET  /api/orgs/:orgKey/bus/:buKey/whatsapp-group/state    # Pool state (admin token)
POST /api/orgs/:orgKey/bus/:buKey/whatsapp-group/groups   # Add a group (admin token)
```

## Code Conventions

- TypeScript strict mode across all packages
- Zod for all validation (env vars, request bodies)
- Express 5 async error handling via `error-handler.ts` middleware
- Imports between workspaces use `@marketing-funnel/<pkg>` aliases
- Org-specific code NEVER lives in `core/` — it goes in `orgs/<org>/<bu>/`
- Template interpolation in sequences: `{{lead_name}}`, `{{lead_email}}`, `{{lead_phone}}`
- All DB operations use Supabase JS client from `@marketing-funnel/db`
- Cron jobs registered in `apps/api/src/core/cron/jobs/`

## Tracking (Web)

Landing pages support: Meta Pixel, Google Analytics 4, TikTok Pixel, Google Tag Manager, Microsoft Clarity, and Hyros. Configured per-org via `apps/web/src/lib/config/pixels.ts`. Tracking components in `apps/web/src/components/tracking/`. Raw-HTML landings inject tracking in their `raw/route.ts` handler (see `apps/web/src/lib/tracking/landing-html.ts`).

## File Naming

- kebab-case for files and directories
- `.routes.ts` suffix for Express route files
- `.service.ts` suffix for service files
- Sequence files named by sequence purpose (e.g., `welcome.ts`)
- Workflow files named by workflow purpose (e.g., `auto-enroll.ts`)

## Testing

No test framework configured yet. Planned for future iterations.

## Important Notes

- Never commit `.env.local` — it contains secrets
- Run `npm run gen-types` after any Supabase schema change
- Run `npm run seed` when setting up a new org for the first time
- The cron `sequence-step-processor` runs every minute — it drives all sequence execution
- Leads are deduplicated by email per organization
- DB migrations must be additive & idempotent and applied via `psql` to `DATABASE_URL`; expose any new schema to PostgREST before the admin can read it
- When changing a raw-HTML landing, never touch its `<script>` block, form field IDs, or `raw/route.ts` placeholders — that would break lead ingestion
- Admin writes go through Server Actions guarded by `canManage`; never bypass to the client
