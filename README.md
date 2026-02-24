# Marketing Funnel

Multi-tenant marketing automation platform that captures leads from landing pages and nurtures them through automated sequences of WhatsApp messages, emails, and AI phone calls.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MONOREPO                                 │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │     apps/web         │    │          apps/api               │ │
│  │   Next.js 15         │    │        Express 5                │ │
│  │                      │    │                                 │ │
│  │  Landing Pages       │───▶│  POST /api/ingest              │ │
│  │  Lead Capture Forms  │    │                                 │ │
│  │  Pixel Tracking      │    │  ┌───────────────────────────┐ │ │
│  │  (Meta, GA4, TikTok, │    │  │    Ingestion Service      │ │ │
│  │   GTM, Clarity)      │    │  │  Create/update lead       │ │ │
│  └─────────────────────┘    │  │  Save custom fields       │ │ │
│                              │  │  Run routing engine       │ │ │
│                              │  │  Emit lead_created event  │ │ │
│                              │  └──────────┬────────────────┘ │ │
│                              │             │                   │ │
│                              │             ▼                   │ │
│                              │  ┌───────────────────────────┐ │ │
│                              │  │      Event Bus            │ │ │
│                              │  │  Typed PipelineEvents     │ │ │
│                              │  └──────────┬────────────────┘ │ │
│                              │             │                   │ │
│                              │     ┌───────┴───────┐          │ │
│                              │     ▼               ▼          │ │
│                              │  ┌──────────┐ ┌────────────┐  │ │
│                              │  │ Workflow │ │  Sequence   │  │ │
│                              │  │ Engine   │ │  Executor   │  │ │
│                              │  │          │ │  (cron/1m)  │  │ │
│                              │  └──────────┘ └─────┬──────┘  │ │
│                              │                     │          │ │
│                              │           ┌─────────┼────────┐ │ │
│                              │           ▼         ▼        ▼ │ │
│                              │       WhatsApp   Email    AI   │ │
│                              │       Cloud API  Resend  Call  │ │
│                              │                  (React  11Labs│ │
│                              │                  Email)        │ │
│                              │                                │ │
│                              └────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    packages/                              │   │
│  │  config  │  db  │  email  │  whatsapp-client  │ elevenlabs│   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│                     Supabase PostgreSQL                          │
│                     (marketing schema)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | npm workspaces |
| API | Express 5 + TypeScript |
| Web | Next.js 15 + React 19 |
| Database | Supabase (PostgreSQL) |
| Validation | Zod |
| Email | Resend + React Email |
| Messaging | WhatsApp Cloud API |
| Voice | ElevenLabs Conversational AI |
| Tracking | Meta Pixel, GA4, TikTok Pixel, GTM, Clarity |
| Scheduling | node-cron |

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase project (with `marketing` schema)

### Setup

```bash
# Clone the repository
git clone https://github.com/afluence-holding/marketing-funnel.git
cd marketing-funnel

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run Supabase migrations
# Apply files from apps/api/supabase/migrations/ in your Supabase dashboard

# Generate database types
npm run gen-types -w @marketing-funnel/api

# Seed initial data (org, pipeline, stages)
npm run seed -w @marketing-funnel/api

# Start development
npm run dev:api   # API on http://localhost:3000
npm run dev:web   # Web on http://localhost:3001
```

## Project Structure

```
marketing-funnel/
├── apps/
│   ├── api/                          # Express automation server
│   │   └── src/
│   │       ├── index.ts              # Server entrypoint
│   │       ├── core/
│   │       │   ├── engine/
│   │       │   │   ├── event-bus.ts          # Typed event emitter
│   │       │   │   ├── workflow-engine.ts    # Event → action executor
│   │       │   │   ├── sequence-executor.ts  # Cron-driven step processor
│   │       │   │   ├── step-handlers/        # send_whatsapp, send_email, ai_call, wait, manual_task
│   │       │   │   └── action-handlers/      # move_stage, update_status, enroll_sequence, etc.
│   │       │   ├── services/
│   │       │   │   ├── ingestion.service.ts  # Lead creation + routing
│   │       │   │   ├── lead.service.ts       # Lead CRUD
│   │       │   │   ├── lead-pipeline.service.ts
│   │       │   │   ├── enrollment.service.ts # Sequence enrollment management
│   │       │   │   ├── call.service.ts       # ElevenLabs call triggers
│   │       │   │   ├── custom-field.service.ts
│   │       │   │   └── activity-log.service.ts
│   │       │   ├── routes/
│   │       │   │   ├── ingestion.routes.ts
│   │       │   │   ├── leads.routes.ts
│   │       │   │   ├── enrollment.routes.ts
│   │       │   │   └── elevenlabs.routes.ts
│   │       │   ├── cron/                     # Scheduled jobs
│   │       │   ├── middleware/               # validate, error-handler
│   │       │   └── types/                    # All shared type definitions
│   │       └── orgs/
│   │           ├── index.ts                  # Central org registry
│   │           ├── _template-company/        # Template for new orgs
│   │           └── afluence/
│   │               └── business-unit-1/
│   │                   ├── config.ts         # IDs, statuses, timezone
│   │                   ├── routing.ts        # Lead → pipeline routing
│   │                   ├── seed.ts           # Initial data seeder
│   │                   ├── sequences/        # Automated outreach cadences
│   │                   └── workflows/        # Event-driven automations
│   │
│   └── web/                          # Next.js landing pages
│       └── src/
│           ├── app/
│           │   ├── layout.tsx                # Root layout (GTM, GA4, Clarity)
│           │   └── (landings)/               # Landing page routes
│           │       ├── layout.tsx            # Landings layout
│           │       ├── _template-org/        # Template for new landing pages
│           │       └── afluence/             # Org-specific pages
│           ├── components/
│           │   ├── lead-form.tsx             # Reusable lead capture form
│           │   ├── landing-config.tsx        # Per-landing pixel config provider
│           │   ├── html-landing.tsx          # Raw HTML landing wrapper
│           │   └── tracking/                 # Meta Pixel, GA4, TikTok, GTM, Clarity
│           └── lib/
│               ├── config/pixels.ts          # Pixel configuration per org
│               └── tracking/                 # UTM hooks, event helpers
│
├── packages/
│   ├── config/           # Zod-validated environment variables
│   ├── db/               # Supabase client + auto-generated types
│   ├── email/            # Resend client + React Email templates
│   ├── whatsapp-client/  # WhatsApp Cloud API wrapper
│   └── elevenlabs/       # ElevenLabs Conversational AI client
│
├── package.json          # Workspace root
└── CLAUDE.md             # AI assistant context
```

## Core Concepts

### Code-First Automations

Sequences and workflows are defined as TypeScript objects — not stored in a database or configured via UI. This gives you full type safety, version control, and code review for your automation logic.

**Sequences** are time-based outreach cadences:

```typescript
// apps/api/src/orgs/afluence/business-unit-1/sequences/welcome.ts
export const welcomeSequence: SequenceDef = {
  key: 'company1-welcome',
  name: 'Welcome Sequence',
  steps: [
    { type: 'send_whatsapp', messageType: 'template', templateName: 'welcome', language: 'es', bodyParams: ['{{lead_name}}'] },
    { type: 'wait', hours: 48 },
    { type: 'send_email', templateId: 'welcome-email', subject: 'Welcome!' },
    { type: 'wait', hours: 24 },
    { type: 'send_whatsapp', messageType: 'text', body: 'Follow-up message for {{lead_name}}' },
    { type: 'wait', hours: 48 },
    { type: 'ai_call', agentId: 'agent-id', firstMessage: 'Hello {{lead_name}}...' },
  ],
};
```

**Workflows** are event-driven automations:

```typescript
// apps/api/src/orgs/afluence/business-unit-1/workflows/auto-enroll.ts
export const autoEnrollWorkflow: WorkflowDef = {
  key: 'company1-auto-enroll',
  name: 'Auto-enroll new leads',
  trigger: { event: 'lead_created' },
  actions: [
    { type: 'enroll_sequence', sequenceKey: 'company1-welcome' },
  ],
};
```

### Lead Lifecycle

```
Landing Page → POST /api/ingest → Create/Dedup Lead → Route to Pipeline
                                         │
                                         ▼
                                   Emit lead_created
                                         │
                                         ▼
                                   Workflow Engine
                                   (auto-enroll in sequence)
                                         │
                                         ▼
                                   Sequence Executor (cron every 1min)
                                         │
                            ┌────────────┼────────────┐
                            ▼            ▼            ▼
                       WhatsApp       Email      AI Phone Call
```

### Event System

The `PipelineEventBus` is a typed event emitter that decouples services from automation logic:

| Event | Emitted When |
|-------|-------------|
| `lead_created` | New lead ingested |
| `lead_updated` | Lead data modified |
| `stage_entered` | Lead moves to a new pipeline stage |
| `stage_exited` | Lead leaves a pipeline stage |
| `status_changed` | Lead status updated |
| `sequence_step_completed` | A sequence step executes successfully |
| `sequence_completed` | All steps in a sequence finish |
| `call_completed` | AI call ends successfully |
| `call_failed` | AI call fails |

### Database Schema

11 tables in the `marketing` schema, split into **structure** (seeded once) and **runtime** (auto-populated):

**Structure:** `organizations` → `business_units` → `pipelines` → `pipeline_stages`, `custom_field_definitions`

**Runtime:** `leads`, `lead_pipeline_entries`, `lead_stage_history`, `custom_field_values`, `sequence_enrollments`, `activity_logs`

Leads are deduplicated by email within each organization.

### Multi-Tenancy

Each organization gets its own directory:

```
apps/api/src/orgs/
├── _template-company/     # Copy this to onboard a new org
│   └── _template-bu/
│       ├── config.ts
│       ├── routing.ts
│       ├── seed.ts
│       ├── sequences/
│       └── workflows/
├── afluence/
│   └── business-unit-1/
└── index.ts               # Registry that aggregates all orgs
```

All orgs share the same database, API process, and cron scheduler.

## API Reference

### Lead Ingestion

```bash
POST /api/ingest
Content-Type: application/json

{
  "organizationId": "uuid",
  "email": "lead@example.com",
  "phone": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "source": {
    "type": "landing_page",
    "id": "landing-v1",
    "utmData": { "utm_source": "facebook", "utm_campaign": "summer" }
  },
  "customFields": {
    "company": "Acme Inc",
    "interest": "premium"
  }
}
```

### Lead Management

```bash
GET /api/leads                          # List all leads
GET /api/leads/:id                      # Full lead detail with pipeline entries, activity, enrollments
PUT /api/leads/:leadId/pipeline-entries/:entryId/stage   # Move lead to a different stage
```

### Sequence Enrollment

```bash
POST   /api/enrollments                 # Enroll lead in a sequence
GET    /api/enrollments/:id             # Enrollment detail
DELETE /api/enrollments/:id             # Unenroll (cancel)
PATCH  /api/enrollments/:id/pause       # Pause enrollment
PATCH  /api/enrollments/:id/resume      # Resume enrollment
```

### AI Calls

```bash
POST /api/elevenlabs/call               # Trigger outbound AI call
POST /api/elevenlabs/webhook            # Receive call status events
```

### Health

```bash
GET /api/health                         # Server status + registered cron jobs
```

## Environment Variables

Create `.env.local` at the monorepo root:

```env
# Database (required)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...

# Email (required)
RESEND_API_KEY=re_...

# WhatsApp (optional)
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_TOKEN=
WHATSAPP_BUSINESS_ID=
WHATSAPP_API_VERSION=v21.0
WHATSAPP_BASE_URL=https://graph.facebook.com

# ElevenLabs (optional)
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
ELEVENLABS_PHONE_NUMBER_ID=
ELEVENLABS_WEBHOOK_SECRET=

# Server
PORT=3000
NODE_ENV=development

# Per-org IDs (set after seeding)
PROJECT1_ORG_ID=
PROJECT1_PIPELINE_ID=
PROJECT1_STAGE_NEW_LEAD=
PROJECT1_STAGE_CONTACTED=
PROJECT1_STAGE_QUALIFIED=
PROJECT1_STAGE_CONVERTED=

# Web tracking (Next.js)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_META_PIXEL_AFLUENCE_BU1=
NEXT_PUBLIC_GA4_AFLUENCE_BU1=
NEXT_PUBLIC_TIKTOK_AFLUENCE_BU1=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_CLARITY_ID=
```

## Adding a New Organization

1. Copy the template:
   ```bash
   cp -r apps/api/src/orgs/_template-company apps/api/src/orgs/new-org
   mv apps/api/src/orgs/new-org/_template-bu apps/api/src/orgs/new-org/main-bu
   ```

2. Configure `config.ts` with org IDs, pipeline IDs, and stage IDs

3. Define routing logic in `routing.ts`

4. Create sequences in `sequences/` and workflows in `workflows/`

5. Register the org in `apps/api/src/orgs/index.ts`

6. Write a `seed.ts` to create the org/pipeline/stages in Supabase

7. Add corresponding landing pages in `apps/web/src/app/(landings)/new-org/`

8. Add pixel configurations in `apps/web/src/lib/config/pixels.ts`

## Adding a New Landing Page

1. Create the route directory:
   ```
   apps/web/src/app/(landings)/<org>/<bu>/<landing-name>/page.tsx
   ```

2. Use the `<LeadForm>` component — it automatically captures UTM parameters and fires pixel events on submission.

3. Configure pixel IDs in `apps/web/src/lib/config/pixels.ts` for your org/BU.

## Sequence Step Types

| Step | Description | Key Fields |
|------|------------|------------|
| `send_whatsapp` | WhatsApp message | `messageType`: text, template, image, video, document, buttons, list |
| `send_email` | Email via Resend | `templateId`, `subject`, `data` |
| `ai_call` | ElevenLabs phone call | `agentId`, `firstMessage`, `dynamicVariables` |
| `wait` | Delay before next step | `hours`, `minutes` |
| `manual_task` | Human task (logged) | `description`, `assignee` |

All text fields support `{{lead_name}}`, `{{lead_email}}`, `{{lead_phone}}` interpolation.

## Workflow Action Types

| Action | Description |
|--------|------------|
| `move_stage` | Move lead to a different pipeline stage |
| `update_status` | Change lead status |
| `enroll_sequence` | Start a sequence for the lead |
| `unenroll_sequence` | Cancel an active enrollment |
| `log` | Write to activity log |
| `notify` | Send notification (extensible) |

## Scripts Reference

| Command | Description |
|---------|------------|
| `npm run dev:api` | Start API server in development |
| `npm run dev:web` | Start Next.js dev server |
| `npm run build` | Build all workspaces |
| `npm run typecheck` | TypeScript check all workspaces |
| `npm run seed -w @marketing-funnel/api` | Seed org/pipeline data |
| `npm run gen-types -w @marketing-funnel/api` | Regenerate Supabase types |

## License

ISC
