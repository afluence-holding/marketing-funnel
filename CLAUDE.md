# CLAUDE.md — Marketing Funnel Monorepo

## Project Overview

Multi-tenant marketing automation platform. Code-first sequences and workflows drive lead nurturing through WhatsApp, Email, and AI phone calls. Landing pages capture leads with full pixel tracking.

**Repo:** `afluence-holding/marketing-funnel`
**Runtime:** Node.js + TypeScript everywhere

## Monorepo Structure

```
apps/
  api/    → @marketing-funnel/api    — Express 5 automation server (port 3000)
  web/    → @marketing-funnel/web    — Next.js 15 landing pages (port 3001)

packages/
  config/          → Zod-validated env vars (shared)
  db/              → Supabase client + auto-generated types
  email/           → Resend + React Email templates
  whatsapp-client/ → WhatsApp Cloud API wrapper
  elevenlabs/      → ElevenLabs Conversational AI client
```

Workspace manager: **npm workspaces** (not pnpm, not yarn).

## Commands

```bash
npm install                              # Install all workspaces
npm run dev:api                          # Start API (port 3000)
npm run dev:web                          # Start web (port 3001)
npm run build                            # Build all workspaces
npm run typecheck                        # Typecheck all workspaces
npm run seed -w @marketing-funnel/api    # Seed org/pipeline/stages in Supabase
npm run gen-types -w @marketing-funnel/api  # Regenerate Supabase types
```

## Architecture Principles

- **Code-first automations**: Sequences and workflows are TypeScript definitions in `apps/api/src/orgs/<org>/<bu>/`. DB stores runtime state only (enrollments, history).
- **Event-driven**: Services emit typed `PipelineEvent`s to `eventBus`. Workflow engine listens and executes actions instantly.
- **Multi-tenant by directory**: Each org/BU gets its own directory under `orgs/`. A central registry (`orgs/index.ts`) aggregates all sequences, workflows, routing, and configs.
- **Single deploy**: One API process serves all organizations.
- **No queues (v0)**: Direct API calls for WhatsApp/Email/Calls. Queues planned for v1.

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

**Supabase PostgreSQL** with `marketing` schema. 11 tables split into:

**Structure tables** (seeded once): `organizations`, `business_units`, `pipelines`, `pipeline_stages`, `custom_field_definitions`

**Runtime tables** (auto-populated): `leads`, `lead_pipeline_entries`, `lead_stage_history`, `custom_field_values`, `sequence_enrollments`, `activity_logs`

Types are auto-generated via `npm run gen-types` → `packages/db/src/types.ts`. Never edit types manually.

Migrations live in `apps/api/supabase/migrations/`.

## Environment Variables

Env files at monorepo root: `.env` and `.env.local` (loaded by `packages/config`).

**Required:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `RESEND_API_KEY`

**Optional (per integration):** `WHATSAPP_*`, `ELEVENLABS_*`

**Per-org config:** `PROJECT1_ORG_ID`, `PROJECT1_PIPELINE_ID`, `PROJECT1_STAGE_*` (loaded in org config files)

**Web (Next.js public):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_META_PIXEL_*`, `NEXT_PUBLIC_GA4_*`, `NEXT_PUBLIC_TIKTOK_*`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_API_URL`

## API Endpoints

```
GET  /api/health
POST /api/ingest                                          # Lead ingestion
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

Landing pages support: Meta Pixel, Google Analytics 4, TikTok Pixel, Google Tag Manager, Microsoft Clarity. Configured per-org via `apps/web/src/lib/config/pixels.ts`. Tracking components in `apps/web/src/components/tracking/`.

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
