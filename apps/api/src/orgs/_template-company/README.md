# How to create a new Business Unit

This folder is a template. Copy it, rename it, and customize it to launch a new marketing pipeline for any product.

---

## 1. Hierarchy

```
orgs/
├── afluence/                  ← Company (Organization). Example: your holding company.
│   ├── company-1/             ← Business Unit. Example: "AI Faktory Creators"
│   ├── company-2/             ← Another BU under the same org
│   └── ...
├── client-x/                  ← Another company entirely
│   └── their-product/
└── _template-company/         ← This template (you are here)
    └── _template-bu/
```

- **Company** = an organization. It groups business units together. One Supabase `organizations` row.
- **Business Unit** = one product, one funnel, one campaign. It has its own pipeline, sequences, workflows, templates. One Supabase `business_units` row.
- One company can have many BUs. Each BU is independent.

---

## 2. Files inside a Business Unit

Every BU folder has the same structure:

```
my-bu/
├── config.ts          ← Settings, IDs, env vars for this BU
├── routing.ts         ← Rules: "when a lead arrives, which pipeline and stage?"
├── seed.ts            ← Script that creates the DB records (run once)
├── sequences/         ← Time-based outreach (send WhatsApp → wait → send email → wait → call)
│   ├── index.ts       ← Exports all sequences for the registry
│   └── welcome.ts     ← A specific sequence
└── workflows/         ← Event-driven reactions (when X happens → do Y instantly)
    ├── index.ts       ← Exports all workflows for the registry
    └── auto-enroll.ts ← A specific workflow
```

| File | When you touch it | What it does |
|---|---|---|
| `config.ts` | Once at setup, then rarely | Holds org config (timezone, valid statuses) and DB IDs from seed |
| `routing.ts` | When you change how leads enter pipelines | Decides which pipeline + stage a new lead goes to |
| `seed.ts` | Run once to set up DB | Creates organization, BU, pipeline, stages, custom fields |
| `sequences/*.ts` | Every time you change outreach flow | Defines the steps: send WhatsApp, wait, email, call, etc. |
| `workflows/*.ts` | Every time you change automation logic | Defines reactions: on lead_created → enroll sequence, on call_completed → move stage |

---

## 3. Step-by-step: Create a new BU

### 3.1 Copy the template

```bash
# From apps/api/src/orgs/
cp -r _template-company/_template-bu/ my-company/my-product/
```

### 3.2 Edit config.ts

- Set your timezone
- Set your valid lead statuses
- Update env var names (replace `TEMPLATE` with your BU key, e.g. `MYPRODUCT`)

### 3.3 Edit seed.ts

- Change organization name, BU name, pipeline name
- Change stage names to match your funnel
- Change custom field definitions to match your landing page fields
- Run it: `npx ts-node src/orgs/my-company/my-product/seed.ts`
- Copy the output IDs to your `.env`

### 3.4 Edit routing.ts

- Usually: every lead goes to one pipeline at the first stage
- Advanced: route based on custom fields (e.g., "creators" go to pipeline A, "companies" go to pipeline B)

### 3.5 Create your sequences

- Define the outreach steps in `sequences/my-sequence.ts`
- Export it from `sequences/index.ts`
- See "All Sequence Step Types" below for every option

### 3.6 Create your workflows

- Define the automation rules in `workflows/my-workflow.ts`
- Export it from `workflows/index.ts`
- See "All Workflow Triggers" and "All Workflow Actions" below for every option

### 3.7 Create email templates (if using send_email steps)

- Create a React Email component in `packages/email/src/templates/<bu-key>-<name>.tsx`
- Reference it by name in your sequence step: `templateId: '<bu-key>-<name>'`

### 3.8 Register in orgs/index.ts

```typescript
// apps/api/src/orgs/index.ts
import { sequences as myProductSequences } from './my-company/my-product/sequences';
import { workflows as myProductWorkflows } from './my-company/my-product/workflows';

export const sequenceRegistry: Record<string, SequenceDef> = {
  ...company1Sequences,
  ...myProductSequences,    // ← add yours
};

export const workflowRegistry: Record<string, WorkflowDef> = {
  ...company1Workflows,
  ...myProductWorkflows,    // ← add yours
};
```

### 3.9 Add env vars

Add to `.env`:

```
MYPRODUCT_ORG_ID=<from seed output>
MYPRODUCT_PIPELINE_ID=<from seed output>
MYPRODUCT_STAGE_NEW_LEAD=<from seed output>
MYPRODUCT_STAGE_CONTACTED=<from seed output>
# ... etc
MYPRODUCT_ELEVENLABS_AGENT_ID=<if using AI calls>
```

### 3.10 Register routing in ingestion

In `core/services/ingestion.service.ts`, import your routing engine so leads for your org get routed correctly.

### 3.11 Deploy

Push, deploy. The engine picks up your sequences and workflows automatically — no migration needed.

---

## 4. All Sequence Step Types

A sequence is an ordered list of steps. The engine walks through them one by one, respecting delays.

All text fields support variable interpolation: `{{lead_name}}`, `{{lead_email}}`, `{{lead_phone}}`.

### 4.1 send_whatsapp

7 variants, controlled by `messageType`:

#### Text (plain message)

```typescript
{
  type: 'send_whatsapp',
  messageType: 'text',
  body: 'Hola {{lead_name}}, gracias por tu interes!',
  previewUrl: false,  // optional: show link previews
}
```

#### Template (Meta-approved, required for first contact in 24h+ window)

```typescript
{
  type: 'send_whatsapp',
  messageType: 'template',
  templateName: 'welcome_v1',           // approved in Meta Business Manager
  language: 'es',                        // ISO language code
  bodyParams: ['{{lead_name}}', '30%'],  // optional: fills {{1}}, {{2}} in template
  buttonParams: [                        // optional: button parameters
    { index: 0, type: 'url', text: 'https://example.com/offer/123' },
  ],
}
```

#### Image

```typescript
{
  type: 'send_whatsapp',
  messageType: 'image',
  imageUrl: 'https://cdn.example.com/promo.jpg',
  caption: 'Mira lo que tenemos para ti, {{lead_name}}',  // optional
}
```

#### Video

```typescript
{
  type: 'send_whatsapp',
  messageType: 'video',
  videoUrl: 'https://cdn.example.com/demo.mp4',
  caption: 'Un demo rapido de como funciona',  // optional
}
```

#### Document (PDF, file)

```typescript
{
  type: 'send_whatsapp',
  messageType: 'document',
  documentUrl: 'https://cdn.example.com/brochure.pdf',
  caption: 'Aqui tienes el brochure completo',  // optional
  filename: 'AI-Faktory-Brochure.pdf',           // optional: display name
}
```

#### Buttons (interactive reply buttons, max 3)

```typescript
{
  type: 'send_whatsapp',
  messageType: 'buttons',
  bodyText: '{{lead_name}}, te interesa agendar una demo?',
  buttons: [
    { id: 'yes_demo', title: 'Si, agendar' },
    { id: 'more_info', title: 'Mas info' },
    { id: 'no_thanks', title: 'No gracias' },
  ],
  headerText: 'AI Faktory',  // optional
  footerText: 'Responde con un boton',  // optional
}
```

#### List (interactive list menu, up to 10 items per section)

```typescript
{
  type: 'send_whatsapp',
  messageType: 'list',
  bodyText: 'Elige el plan que mas te interesa:',
  buttonText: 'Ver planes',
  sections: [
    {
      title: 'Planes mensuales',
      items: [
        { id: 'starter', title: 'Starter', description: '$29/mes — 1 usuario' },
        { id: 'pro', title: 'Pro', description: '$79/mes — 5 usuarios' },
        { id: 'enterprise', title: 'Enterprise', description: 'Personalizado' },
      ],
    },
  ],
  headerText: 'Nuestros planes',  // optional
  footerText: 'Selecciona uno',   // optional
}
```

### 4.2 send_email

Sends an email using a React Email template from `packages/email/src/templates/`.

```typescript
{
  type: 'send_email',
  templateId: 'mybu-welcome',         // file: packages/email/src/templates/mybu-welcome.tsx
  subject: '{{lead_name}}, bienvenido!',
  data: {                              // optional: extra props passed to the React component
    ctaUrl: 'https://example.com/demo',
    offerCode: 'SAVE30',
  },
}
```

The template receives `lead_name`, `lead_email`, `lead_phone` automatically, plus anything in `data`.

### 4.3 ai_call

Initiates a phone call using ElevenLabs Conversational AI.

```typescript
{
  type: 'ai_call',
  agentId: process.env.MYBU_ELEVENLABS_AGENT_ID ?? '',
  firstMessage: 'Hola {{lead_name}}, te llamo de AI Faktory...',  // optional
  dynamicVariables: {                                               // optional: injected into agent context
    offer: 'descuento 30%',
    product: 'Plan Pro',
  },
}
```

### 4.4 wait

Pauses the sequence for a duration. The next step runs after the delay.

```typescript
{ type: 'wait', hours: 48 }                // wait 2 days
{ type: 'wait', hours: 1, minutes: 30 }    // wait 1.5 hours
{ type: 'wait', minutes: 15 }              // wait 15 minutes
```

### 4.5 manual_task

Pauses the sequence until a human resumes it via API. Useful for "review this lead before proceeding."

```typescript
{
  type: 'manual_task',
  description: 'Review lead profile and confirm qualification',
  assignee: 'sales-team',  // optional: who should do this
}
```

Resume via API: `PATCH /api/enrollments/:id/resume`

---

## 5. All Workflow Triggers

A workflow fires instantly when an event matches. The `trigger.event` field determines which event.

Optional: `trigger.conditions` filters by metadata (e.g., only trigger for a specific stage).

### Available events

| Event | When it fires | Metadata available |
|---|---|---|
| `lead_created` | New lead is ingested for the first time | `source`, `channel` |
| `lead_updated` | Existing lead is re-ingested (fields merged) | `source`, `channel` |
| `stage_entered` | Lead moves INTO a pipeline stage | `stageId`, `stageName`, `pipelineId` |
| `stage_exited` | Lead moves OUT OF a pipeline stage | `stageId`, `stageName`, `pipelineId` |
| `status_changed` | Lead's status field changes | `oldStatus`, `newStatus` |
| `sequence_step_completed` | One step of a sequence finishes | `sequenceKey`, `stepIndex`, `stepType` |
| `sequence_completed` | Entire sequence finishes (all steps done) | `sequenceKey` |
| `call_completed` | ElevenLabs AI call finishes successfully | `conversationId` |
| `call_failed` | ElevenLabs AI call fails | `conversationId`, `error` |

### Example: trigger on any new lead

```typescript
{
  trigger: { event: 'lead_created', conditions: {} },
  actions: [...]
}
```

### Example: trigger only when entering a specific stage

```typescript
{
  trigger: {
    event: 'stage_entered',
    conditions: { stageId: IDS.stages.qualified },
  },
  actions: [...]
}
```

### Example: trigger when a sequence completes

```typescript
{
  trigger: {
    event: 'sequence_completed',
    conditions: { sequenceKey: 'mybu-welcome' },
  },
  actions: [...]
}
```

---

## 6. All Workflow Actions

Actions are what a workflow DOES when the trigger matches. Executed instantly, in order.

### enroll_sequence

Puts the lead into a time-based sequence.

```typescript
{ type: 'enroll_sequence', sequenceKey: 'mybu-welcome' }
```

### unenroll_sequence

Pulls the lead OUT of a sequence (stops it).

```typescript
{ type: 'unenroll_sequence', sequenceKey: 'mybu-welcome' }
```

### move_stage

Moves the lead to a different pipeline stage.

```typescript
{ type: 'move_stage', stageId: IDS.stages.contacted }
```

### update_status

Changes the lead's status field.

```typescript
{ type: 'update_status', status: 'qualified' }
```

### log

Writes an entry to activity_logs.

```typescript
{ type: 'log', message: 'Lead auto-qualified after call completed' }
```

### notify

Sends a notification (placeholder — currently logs to console, ready for Slack/Discord/email).

```typescript
{ type: 'notify', channel: 'slack', message: 'New qualified lead: {{lead_name}}' }
```

---

## 7. Email Templates

Email templates are React Email components. They live in `packages/email/src/templates/`.

### Naming convention

`<bu-key>-<template-name>.tsx`

Examples: `faktory-welcome.tsx`, `faktory-followup.tsx`, `challenges-reminder.tsx`

### Minimal template

```tsx
import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components';
import * as React from 'react';

interface Props {
  lead_name: string;
  lead_email?: string;
  ctaUrl?: string;
}

export default function MyTemplate({ lead_name, ctaUrl = 'https://example.com' }: Props) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>Hola {lead_name}</Heading>
          <Text>Gracias por tu interes.</Text>
          <Button href={ctaUrl}>Ver mas</Button>
        </Container>
      </Body>
    </Html>
  );
}
```

The step handler automatically passes `lead_name`, `lead_email`, `lead_phone` to the template, plus any extra `data` you define in the step.

---

## 8. Environment Variables

Each BU should add its IDs to `.env`. Convention: `<BU_KEY>_<VARIABLE>`.

```env
# -- my-product BU --
MYPRODUCT_ORG_ID=uuid-from-seed
MYPRODUCT_PIPELINE_ID=uuid-from-seed
MYPRODUCT_STAGE_NEW_LEAD=uuid-from-seed
MYPRODUCT_STAGE_CONTACTED=uuid-from-seed
MYPRODUCT_STAGE_QUALIFIED=uuid-from-seed
MYPRODUCT_STAGE_CONVERTED=uuid-from-seed

# Optional: if this BU uses AI calls
MYPRODUCT_ELEVENLABS_AGENT_ID=agent-id-from-elevenlabs
```

---

## 9. Variable Interpolation

All text fields in sequence steps support these variables:

| Variable | Replaced with | Example |
|---|---|---|
| `{{lead_name}}` | First + last name, or "there" if empty | "Juan Perez" |
| `{{lead_email}}` | Lead's email | "juan@email.com" |
| `{{lead_phone}}` | Lead's phone number | "+56912345678" |

They work in: WhatsApp body/caption, email subject, AI call firstMessage.

---

## 10. Common Patterns

### Pattern: Welcome flow (most common)

```
Workflow: on lead_created → enroll_sequence('welcome')
Sequence: WhatsApp template → wait 2d → email → wait 1d → text → wait 2d → AI call
```

### Pattern: Stage-based nurturing

```
Workflow: on stage_entered (qualified) → enroll_sequence('qualified-nurture')
Workflow: on stage_entered (qualified) → unenroll_sequence('welcome')  // stop welcome
Sequence: email with case study → wait 3d → AI call with demo offer
```

### Pattern: Post-call follow-up

```
Workflow: on call_completed → move_stage(contacted) + enroll_sequence('post-call')
Workflow: on call_failed → log('call failed') + enroll_sequence('retry-call')
```

### Pattern: Multi-step qualification

```
Workflow: on lead_created → enroll_sequence('qualification')
Sequence: WhatsApp buttons ("interested?") → wait 1d → email → wait 2d → manual_task("review")
Then on manual resume → AI call
```
