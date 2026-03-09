# Engine — How it works

## The real-world analogy

You have a store. A new customer walks in (a lead arrives).

- The **receptionist** (ingestion service) writes down their info and shouts: "NEW CUSTOMER!"
- The **event bus** is that shout. Just a loudspeaker in the building.
- The **manager** (workflow engine) hears the shout and immediately says: "Put them in the welcome program!" That's an instant decision — zero delay.
- The **welcome program** is a sequence. It's a printed checklist on a wall that says: day 1 send WhatsApp, day 3 send email, day 5 call them.
- The **assistant** (sequence executor) comes in every minute, looks at the checklist, checks the clock, and does whatever's due right now. "Oh, it's been 48 hours since step 1, time to send the email." Then marks the step done and notes when the next one is due.

That's it. That's the whole engine.

---

## Folder structure

```
engine/
├── event-bus.ts           ← the loudspeaker
├── workflow-engine.ts     ← the manager (hears events, makes instant decisions)
├── sequence-executor.ts   ← the assistant (checks clock every minute, does the next step)
├── action-handlers/       ← things the MANAGER can order (instant)
│   ├── enroll-sequence    ← "put this lead in a sequence"
│   ├── move-stage         ← "move this lead to another stage"
│   ├── update-status      ← "change this lead's status"
│   ├── unenroll-sequence  ← "pull this lead out of a sequence"
│   ├── log                ← "write this down"
│   └── notify             ← "alert someone"
└── step-handlers/         ← things the ASSISTANT can do (scheduled)
    ├── send-whatsapp      ← send a WhatsApp (text, template, image, buttons...)
    ├── send-email         ← send an email
    ├── ai-call            ← call with ElevenLabs AI
    ├── wait               ← "come back in X hours"
    └── manual-task        ← "pause until a human does something"
```

---

## action-handlers vs step-handlers

|                        | action-handlers                          | step-handlers                            |
| ---------------------- | ---------------------------------------- | ---------------------------------------- |
| **Who uses them?**     | Workflow engine (the manager)            | Sequence executor (the assistant)        |
| **When?**              | Instantly, the moment an event happens   | Scheduled, when the clock says it's time |
| **Triggered by?**      | Events (lead_created, call_completed...) | Cron job every minute checking next_step_at |
| **Purpose**            | Make decisions, orchestrate              | Do the actual outreach to the lead       |
| **Examples**           | "Enroll in sequence", "Move stage"       | "Send WhatsApp", "Send email", "AI call" |
| **You define them in** | `workflows/auto-enroll.ts`               | `sequences/welcome.ts`                   |

---

## Timeline: what happens when a lead arrives

```
SECOND 0:
  Lead fills form on landing page
  → POST /api/orgs/:orgKey/bus/:buKey/ingest
  → ingestion.service creates/updates lead in DB
  → eventBus.emit('lead_created')          ← loudspeaker shouts

SECOND 0 (instant):
  → workflow-engine hears 'lead_created'
  → checks workflows: auto-enroll says "on lead_created → enroll_sequence"
  → action-handler 'enroll_sequence' runs
  → creates row in DB: sequence_enrollments {
      sequence_key: 'company1-welcome',
      current_step_index: 0,
      next_step_at: NOW              ← ready immediately
    }

NEXT CRON TICK (within 1 minute):
  → sequence-executor queries: "any enrollments due?"
  → finds the enrollment, step_index=0
  → looks up welcome sequence in code → step[0] is send_whatsapp
  → step-handler 'send_whatsapp' runs → sends the WhatsApp
  → updates DB: step_index=1, next_step_at=NOW+48hours

48 HOURS LATER (cron tick):
  → sequence-executor finds the enrollment again
  → step[1] is wait (already waited), step advanced to step[2] = send_email
  → step-handler 'send_email' runs → sends the email
  → updates DB: step_index=3, next_step_at=NOW+24hours

24 HOURS LATER:
  → step[3] is send_whatsapp text → sends it
  → advances to step[4], next_step_at=NOW+48hours

48 HOURS LATER:
  → step[4] is ai_call → calls the lead via ElevenLabs
  → no more steps → marks enrollment as 'completed'
  → eventBus.emit('sequence_completed')    ← loudspeaker shouts again
  → (you could add a workflow that reacts to this too)
```

---

## Why workflows + sequences instead of one big thing?

Because they solve different problems:

- **Workflows** = "when X happens, immediately do Y". They're reactive. They connect things together. They don't wait.
- **Sequences** = "do step 1, wait, do step 2, wait, do step 3". They're a timeline. They're how you nurture a lead over days/weeks.

A workflow can *start* a sequence. A sequence *finishing* can trigger a workflow. They chain together.

---

## What YOU write vs what the engine does

You write this (in `orgs/afluence/company-1/`):

```typescript
// workflows/auto-enroll.ts — WHAT should happen when a lead arrives
{
  trigger: { event: 'lead_created' },
  actions: [{ type: 'enroll_sequence', sequenceKey: 'company1-welcome' }],
}

// sequences/welcome.ts — the nurturing timeline
steps: [
  { type: 'send_whatsapp', messageType: 'template', templateName: '...', language: 'es' },
  { type: 'wait', hours: 48 },
  { type: 'send_email', templateId: 'company1-followup', subject: '...' },
  { type: 'wait', hours: 24 },
  { type: 'ai_call', agentId: '...' },
]
```

The engine does the rest. **You never touch `engine/`.**
