# API — Marketing Funnel Engine

Express.js API that powers the entire marketing automation system. Handles lead ingestion, pipeline management, multi-channel outreach sequences (WhatsApp, email, AI calls), and event-driven workflow automation.

---

## Quick start

```bash
# From repo root
npm install
npm run dev:api     # starts on http://localhost:3000
```

Required: copy `.env.example` to `.env.local` at the repo root and fill in your credentials.

---

## Architecture overview

```
Lead arrives (landing page, API, WhatsApp)
       │
       ▼
  POST /api/ingest
       │
       ▼
  ingestion.service ──► Creates/updates lead
       │                Saves custom fields
       │                Routes to pipeline + stage
       │                Logs activity
       │
       ▼
  eventBus.emit('lead_created')
       │
       ▼
  Workflow Engine (instant) ──► Matches workflows ──► Executes actions
       │                            │
       │                            ├── enroll_sequence
       │                            ├── move_stage
       │                            ├── update_status
       │                            └── notify / log
       │
       ▼
  Cron (every minute) ──► sequence-executor ──► Processes due enrollments
                               │
                               ├── send_whatsapp (text, template, image, buttons...)
                               ├── send_email (React Email templates via Resend)
                               ├── ai_call (ElevenLabs Conversational AI)
                               ├── wait (schedule next step)
                               └── manual_task (pause until human resumes)
```

---

## Folder structure

```
apps/api/src/
├── index.ts                          ← Express app entry point
│
├── core/                             ← Shared platform (you rarely touch this)
│   ├── engine/                       ← Automation runtime (see engine/README.md)
│   │   ├── event-bus.ts              ← Event emitter for pipeline events
│   │   ├── workflow-engine.ts        ← Listens to events, executes workflow actions
│   │   ├── sequence-executor.ts      ← Cron: processes sequence enrollments
│   │   ├── step-handlers/            ← HOW to execute each sequence step type
│   │   │   ├── send-whatsapp.ts      ← 7 WhatsApp variants (text, template, image, video, doc, buttons, list)
│   │   │   ├── send-email.ts         ← Email via Resend + React Email
│   │   │   ├── ai-call.ts            ← ElevenLabs phone call
│   │   │   ├── wait.ts               ← Schedule delay
│   │   │   └── manual-task.ts        ← Pause for human action
│   │   └── action-handlers/          ← HOW to execute each workflow action type
│   │       ├── enroll-sequence.ts    ← Put lead in a sequence
│   │       ├── unenroll-sequence.ts  ← Remove lead from sequence
│   │       ├── move-stage.ts         ← Move lead to pipeline stage
│   │       ├── update-status.ts      ← Change lead status
│   │       ├── log.ts                ← Write to activity_logs
│   │       └── notify.ts             ← Send notification (placeholder)
│   │
│   ├── routes/                       ← API endpoints
│   │   ├── ingestion.routes.ts       ← POST /api/ingest
│   │   ├── leads.routes.ts           ← GET /api/leads, PUT .../stage
│   │   ├── enrollment.routes.ts      ← POST/DELETE/PATCH /api/enrollments
│   │   └── elevenlabs.routes.ts      ← POST /api/elevenlabs/webhook, /call
│   │
│   ├── services/                     ← Business logic
│   │   ├── ingestion.service.ts      ← Lead ingestion orchestration
│   │   ├── lead.service.ts           ← Lead CRUD
│   │   ├── lead-pipeline.service.ts  ← Pipeline entries + stage moves
│   │   ├── enrollment.service.ts     ← Sequence enrollment management
│   │   ├── call.service.ts           ← ElevenLabs call initiation + webhooks
│   │   ├── custom-field.service.ts   ← Custom field values
│   │   └── activity-log.service.ts   ← Activity logging
│   │
│   ├── cron/                         ← Scheduled jobs
│   │   ├── scheduler.ts              ← Job registration + management (node-cron)
│   │   └── jobs/index.ts             ← Job definitions
│   │
│   ├── middleware/                    ← Express middleware
│   │   ├── validate.ts               ← Zod request body validation
│   │   └── error-handler.ts          ← Global error handler
│   │
│   └── types/index.ts                ← All TypeScript interfaces
│
└── orgs/                             ← Business unit definitions (you work here)
    ├── index.ts                      ← Global registry (sequences + workflows from all BUs)
    ├── _template-company/            ← Template for creating new BUs
    │   ├── README.md                 ← Comprehensive guide
    │   └── _template-bu/
    │       ├── config.ts
    │       ├── routing.ts
    │       ├── seed.ts
    │       ├── sequences/
    │       └── workflows/
    └── afluence/                     ← Real organization
        └── company-1/                ← Real business unit
            ├── config.ts
            ├── routing.ts
            ├── seed.ts
            ├── sequences/
            └── workflows/
```

---

## API Endpoints

### Lead Ingestion

**`POST /api/ingest`** — Ingest a new lead

```json
{
  "organizationId": "uuid",
  "email": "lead@example.com",
  "firstName": "Juan",
  "lastName": "Perez",
  "phone": "+56912345678",
  "source": "landing_page",
  "channel": "inbound",
  "sourceType": "landing",
  "sourceId": "lp-faktory-v1",
  "utmData": { "utm_source": "google", "utm_medium": "cpc" },
  "customFields": { "company": "Acme", "role": "CEO" }
}
```

Response: `{ lead, entries, decisions }`

### Leads

**`GET /api/leads?organizationId=uuid`** — List all leads for an org

**`GET /api/leads/:id?organizationId=uuid`** — Get lead with custom fields, pipeline entries, activity, enrollments

**`PUT /api/leads/:leadId/pipeline-entries/:entryId/stage`** — Move lead to a new stage

```json
{ "stageId": "uuid", "organizationId": "uuid" }
```

### Enrollments

**`POST /api/enrollments`** — Enroll lead in a sequence

```json
{ "sequenceKey": "company1-welcome", "leadId": "uuid", "pipelineEntryId": "uuid" }
```

**`GET /api/enrollments/:id`** — Get enrollment details

**`DELETE /api/enrollments/:id`** — Unenroll (stop sequence)

**`PATCH /api/enrollments/:id/pause`** — Pause enrollment

**`PATCH /api/enrollments/:id/resume`** — Resume enrollment

**`GET /api/leads/:id/enrollments`** — Get all enrollments for a lead

### ElevenLabs

**`POST /api/elevenlabs/call`** — Trigger AI call manually

```json
{
  "leadId": "uuid",
  "orgId": "uuid",
  "pipelineEntryId": "uuid",
  "firstMessage": "Hola...",
  "agentId": "optional-agent-id"
}
```

**`POST /api/elevenlabs/webhook`** — Receives ElevenLabs webhook events (call completed, failed, audio)

### Health

**`GET /api/health`** — Health check + registered cron jobs

---

## Database (11 tables)

All tables live in the `marketing` schema in Supabase (PostgreSQL).

| Table | Purpose |
|---|---|
| `organizations` | Companies (e.g., Afluence) |
| `business_units` | Products within a company (e.g., AI Faktory Creators) |
| `pipelines` | Lead journey pipelines per BU |
| `pipeline_stages` | Ordered stages within a pipeline (New Lead → Contacted → Qualified → Converted) |
| `leads` | Contact records (email, phone, name, status) |
| `lead_pipeline_entries` | A lead's placement in a specific pipeline + current stage |
| `lead_stage_history` | Audit trail of stage changes |
| `custom_field_definitions` | Per-org field schemas (company, role, industry...) |
| `custom_field_values` | Actual field values per lead |
| `activity_logs` | Everything that happened to a lead (ingested, called, emailed...) |
| `sequence_enrollments` | Runtime: a lead progressing through a code-defined sequence |

Types are auto-generated: `npm run gen-types -w @marketing-funnel/api`

---

## Shared packages

This API depends on 5 internal packages from the monorepo:

| Package | What it does | Key exports |
|---|---|---|
| `@marketing-funnel/config` | Loads `.env.local`, validates with Zod | `env` (typed environment object) |
| `@marketing-funnel/db` | Supabase client setup + generated types | `supabase`, `supabaseAdmin`, `Database` types |
| `@marketing-funnel/whatsapp-client` | WhatsApp Business API | `getWhatsAppClient()` → `sendText`, `sendTemplate`, `sendImage`, `sendButtons`, `sendList`... |
| `@marketing-funnel/email` | Resend + React Email | `getEmailService()` → `send()`, `sendBulk()`, template rendering |
| `@marketing-funnel/elevenlabs` | ElevenLabs Conversational AI | `makeCall()`, `getConversation()`, agent management, webhook parsing |

---

## Cron jobs

| Job | Schedule | What it does |
|---|---|---|
| `sequence-step-processor` | Every minute | Queries `sequence_enrollments` where `next_step_at <= now()`, executes the current step, advances to next |
| `stale-lead-checker` | Daily 9 AM | (Disabled) Placeholder for finding stale leads |

---

## Code-first automations

Automation definitions (sequences, workflows, messages, prompts) live in **TypeScript code**, not the database. The database only stores **runtime data** (leads, enrollments, activity logs).

**The rule: if a human writes it, it's code. If the system generates it at runtime, it's database.**

| What | Where | Example |
|---|---|---|
| Sequence definitions | `orgs/<org>/<bu>/sequences/*.ts` | Steps: send_whatsapp → wait 48h → send_email → ai_call |
| Workflow definitions | `orgs/<org>/<bu>/workflows/*.ts` | "When lead_created → enroll in welcome sequence" |
| Messages, prompts, templates | Inside step definitions (code) | `{ body: "Hola {{lead_name}}..." }` |
| Routing logic | `orgs/<org>/<bu>/routing.ts` | "All leads → Pipeline Main, stage New Lead" |
| Pipeline structure | DB (created once by seed.ts) | Pipeline "Main", stages: New Lead → Contacted → ... |
| Leads, enrollments, logs | DB (system generates at runtime) | Lead records, enrollment state, activity trail |

To change a prompt, message, or automation flow: edit the `.ts` file, push, deploy. No database changes, no frontend.

---

## How to create a new Business Unit

See the full guide: `src/orgs/_template-company/README.md`

Short version:

1. Copy `orgs/_template-company/_template-bu/` to `orgs/<your-org>/<your-bu>/`
2. Edit `config.ts` — timezone, statuses, env var names
3. Edit `seed.ts` — org name, BU name, pipeline stages, custom fields
4. Run seed: `npx ts-node src/orgs/<your-org>/<your-bu>/seed.ts`
5. Copy output IDs to `.env.local`
6. Edit `routing.ts` — how leads enter pipelines
7. Create sequences in `sequences/*.ts`
8. Create workflows in `workflows/*.ts`
9. Create email templates in `packages/email/src/templates/<bu>-<name>.tsx`
10. Register in `orgs/index.ts` (import + spread)
11. Deploy

---

## Environment variables

```env
# Required
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_xxx

# WhatsApp (optional)
WHATSAPP_ACCESS_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
WHATSAPP_WEBHOOK_TOKEN=xxx

# ElevenLabs (optional)
ELEVENLABS_API_KEY=xxx
ELEVENLABS_AGENT_ID=xxx
ELEVENLABS_PHONE_NUMBER_ID=xxx
ELEVENLABS_WEBHOOK_SECRET=xxx

# API
PORT=3000
NODE_ENV=development

# Per-BU IDs (from seed output)
PROJECT1_ORG_ID=uuid
PROJECT1_PIPELINE_ID=uuid
PROJECT1_STAGE_NEW_LEAD=uuid
PROJECT1_STAGE_CONTACTED=uuid
PROJECT1_STAGE_QUALIFIED=uuid
PROJECT1_STAGE_CONVERTED=uuid
```

---

## Scripts

```bash
npm run dev        # Start dev server (ts-node)
npm run build      # Compile TypeScript
npm run start      # Run compiled JS
npm run typecheck  # Type check without emit
npm run seed       # Run seed for afluence/company-1
npm run gen-types  # Regenerate Supabase types
```
