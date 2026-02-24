# @marketing-pipeline/elevenlabs

AI phone call package for the marketing pipeline. Wraps [ElevenLabs Conversational AI](https://elevenlabs.io/docs/conversational-ai/overview) to make outbound calls to leads as part of your pipeline sequences.

This package is the `ai_call` sequence step — when a lead is enrolled in a sequence, the system can automatically phone them with a personalized AI agent.

---

## How it works (the big picture)

```
Landing page form
      │
      ▼
POST /api/ingest  ──→  Lead created in DB
      │
      ▼
Routing engine assigns lead to pipeline stage
      │
      ▼
Sequence executes "ai_call" step
      │
      ▼
callLead() in apps/api ──→ makeCall() in this package
      │                          │
      │                          ▼
      │                   ElevenLabs API
      │                   (Twilio outbound call)
      │                          │
      │                          ▼
      │                   Agent calls lead's phone
      │                   "Hi Maria, following up on..."
      │                          │
      │                          ▼
      │                   Call ends → webhook fires
      │                          │
      ▼                          ▼
activity_logs ◄──── POST /api/elevenlabs/webhook
(ai_call_initiated)        │
(ai_call_completed)        ▼
                     Transcript + duration saved
```

---

## Setup (one-time)

### 1. Get your ElevenLabs credentials

1. Go to [elevenlabs.io](https://elevenlabs.io) and create an account
2. Go to **Settings > API Keys** and copy your API key
3. Go to **Conversational AI > Agents** and create an agent (or use the API — see below)
4. Go to **Conversational AI > Phone Numbers** and import your Twilio number
5. Copy the agent ID and phone number ID

### 2. Set env vars

Add to your `.env.local` at the monorepo root:

```bash
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_AGENT_ID=abc123def456                # your default agent
ELEVENLABS_PHONE_NUMBER_ID=pn_abc123            # your Twilio number in ElevenLabs
ELEVENLABS_WEBHOOK_SECRET=whsec_xxxxx           # from ElevenLabs webhook settings
```

All four are optional in the Zod schema (the API won't crash if you haven't set them yet). But calling and webhooks will throw at runtime if the required ones are missing.

### 3. Configure the webhook in ElevenLabs Dashboard

1. Go to **Settings > Webhooks** in your ElevenLabs workspace
2. Set the URL to: `https://your-domain.com/api/elevenlabs/webhook`
3. Enable **Post-call transcription** (required) and **Call initiation failure** (recommended)
4. Copy the webhook secret and set it as `ELEVENLABS_WEBHOOK_SECRET`

---

## Real-world example: Project-1 follow-up call

Your pipeline for Project-1 works like this: a lead fills out a landing page form, enters the "New Lead" stage, and you want to call them within minutes to qualify them.

### Step 1: Create your agent (one-time)

You can do this in the ElevenLabs Dashboard, or programmatically:

```typescript
import { createAgent } from '@marketing-pipeline/elevenlabs';

const agent = await createAgent({
  name: 'Project-1 Follow-up Agent',
  tags: ['project-1', 'follow-up'],
  conversationConfig: {
    prompt: `You are a friendly sales representative for our company.
You are calling {{lead_name}} who signed up through {{lead_source}}.
Your goal is to:
1. Confirm they are interested
2. Ask what specific problem they want to solve
3. Schedule a demo call with the team
Be conversational, warm, and brief. Keep the call under 3 minutes.
If they are not interested, thank them politely and end the call.`,
    firstMessage: 'Hi {{lead_name}}, this is Ana from the team. You recently signed up on our website and I wanted to quickly follow up. Do you have a moment?',
    language: 'en',
    llm: 'gpt-4o',
  },
});

console.log('Agent created:', agent);
// Save the agent_id in your .env or org config
```

The `{{lead_name}}` and `{{lead_source}}` are **dynamic variables** — they get replaced with real values when you make each call.

### Step 2: Call a single lead

When a lead enters your pipeline and you want to call them immediately:

```typescript
import { callLead } from '../services/call.service';

// After lead ingestion in your route handler or sequence executor:
const result = await callLead(lead.id, {
  orgId: IDS.ORG_ID,
  pipelineEntryId: entry.id,
  firstMessage: 'Hi {{lead_name}}, this is Ana. You just signed up on our landing page — do you have a quick minute?',
  dynamicVariables: {
    campaign: 'project-1-landing',
  },
});

console.log('Call started, conversation:', result.conversationId);
```

What happens behind the scenes:
1. `callLead()` fetches the lead from DB (gets phone, name, email, source)
2. Builds dynamic variables: `{ lead_name: "Maria Garcia", lead_email: "maria@...", lead_source: "landing-page", campaign: "project-1-landing" }`
3. Calls `makeCall()` from this package, which hits the ElevenLabs Twilio outbound call API
4. ElevenLabs tells Twilio to dial the lead's phone number
5. The AI agent speaks the first message with the lead's name injected
6. An `ai_call_initiated` activity is logged to the DB

### Step 3: Call completes — webhook handles the rest

When the call ends, ElevenLabs sends a POST to `/api/elevenlabs/webhook` with the full transcript. The route in `apps/api` automatically:

1. Verifies the HMAC signature
2. Fetches the full conversation details (transcript, duration, analysis)
3. Finds the lead by looking up the `ai_call_initiated` activity log
4. Logs an `ai_call_completed` activity with the transcript metadata

You can see the call results in your activity logs:

```typescript
import { getActivityForLead } from '../services/activity-log.service';

const activities = await getActivityForLead(leadId);
// [
//   { action: 'ai_call_completed', metadata: { durationSecs: 147, outcome: 'answered', transcriptLength: 12, ... } },
//   { action: 'ai_call_initiated', metadata: { conversationId: '...', toNumber: '+1234567890' } },
//   { action: 'lead_ingested', ... },
// ]
```

### Step 4: Review the transcript

```typescript
import { getConversation } from '@marketing-pipeline/elevenlabs';

const conversation = await getConversation(conversationId);

for (const msg of conversation.transcript) {
  console.log(`[${msg.timeInCallSecs}s] ${msg.role}: ${msg.message}`);
}
// [0s] agent: Hi Maria, this is Ana from the team...
// [3s] user: Oh hi! Yes, I just signed up.
// [5s] agent: Great! What problem are you looking to solve?
// [8s] user: We need better lead tracking...
// ...
```

---

## Batch calls (campaigns)

When you have many leads to call at once — for example a Monday morning follow-up for all leads that came in over the weekend:

```typescript
import { makeBatchCalls } from '@marketing-pipeline/elevenlabs';

const result = await makeBatchCalls({
  callName: 'Weekend leads follow-up — Feb 24',
  recipients: [
    {
      phoneNumber: '+1234567890',
      dynamicVariables: { lead_name: 'Maria Garcia', lead_source: 'landing-page' },
    },
    {
      phoneNumber: '+0987654321',
      dynamicVariables: { lead_name: 'Carlos Lopez', lead_source: 'facebook-ad' },
    },
  ],
  scheduledTimeUnix: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  timezone: 'America/Mexico_City',
});

console.log('Batch submitted:', result.id, 'Calls scheduled:', result.totalCallsScheduled);
```

The cron job template at `apps/api/src/cron/jobs/follow-up-calls.ts` is ready for you to enable and customize for this exact use case.

---

## API endpoints

The API exposes two endpoints under `/api/elevenlabs`:

### POST /api/elevenlabs/call

Manually trigger a call to a lead. Useful for internal tools or admin panels.

```bash
curl -X POST http://localhost:3000/api/elevenlabs/call \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "uuid-of-lead",
    "orgId": "uuid-of-org",
    "pipelineEntryId": "uuid-of-pipeline-entry",
    "firstMessage": "Hi {{lead_name}}, quick follow-up...",
    "agentId": "optional-override-agent-id"
  }'
```

Response:

```json
{ "conversationId": "conv_abc123" }
```

### POST /api/elevenlabs/webhook

Receives post-call events from ElevenLabs. **You don't call this** — ElevenLabs calls it automatically after every call ends.

---

## Package API reference

### Calls

```typescript
import { makeCall, makeBatchCalls } from '@marketing-pipeline/elevenlabs';

// Single call
const result = await makeCall({
  toNumber: '+1234567890',        // required
  agentId: 'agent_123',          // optional (falls back to ELEVENLABS_AGENT_ID)
  phoneNumberId: 'pn_456',       // optional (falls back to ELEVENLABS_PHONE_NUMBER_ID)
  dynamicVariables: {             // optional — injected into agent prompt
    lead_name: 'Maria',
    lead_source: 'website',
  },
  conversationConfigOverride: {   // optional — override agent config for this call
    firstMessage: 'Custom greeting for this specific lead',
    language: 'es',
    voiceId: 'different-voice-id',
  },
});
// Returns: { conversationId: string, callSid?: string }

// Batch calls
const batch = await makeBatchCalls({
  callName: 'Campaign name',
  recipients: [{ phoneNumber: '+1...', dynamicVariables: { ... } }],
  scheduledTimeUnix: 1740000000,  // optional — schedule for later
  timezone: 'America/New_York',   // optional
});
// Returns: { id: string, status: string, totalCallsScheduled: number }
```

### Conversations

```typescript
import { getConversation, listConversations, getConversationAudio } from '@marketing-pipeline/elevenlabs';

// Get full transcript + metadata for a completed call
const convo = await getConversation('conv_id');
// Returns: { conversationId, agentId, status, transcript[], metadata, hasAudio, analysis }

// List recent conversations
const list = await listConversations({ agentId: 'agent_123', pageSize: 10 });

// Download audio recording
const audioStream = await getConversationAudio('conv_id');
```

### Agents

```typescript
import { createAgent, getAgent, updateAgent, deleteAgent, listAgents } from '@marketing-pipeline/elevenlabs';

const agent = await createAgent({
  name: 'Sales Follow-up',
  conversationConfig: {
    prompt: 'You are a sales rep...',
    firstMessage: 'Hi {{lead_name}}!',
    language: 'en',
    llm: 'gpt-4o',
    voiceId: 'voice_id',       // optional
  },
  tags: ['sales'],
});

await updateAgent('agent_id', { name: 'Updated name' });
const details = await getAgent('agent_id');
const agents = await listAgents({ search: 'sales' });
await deleteAgent('agent_id');
```

### Phone numbers

```typescript
import { listPhoneNumbers, getPhoneNumber, updatePhoneNumber } from '@marketing-pipeline/elevenlabs';

const numbers = await listPhoneNumbers();
const number = await getPhoneNumber('pn_123');
await updatePhoneNumber('pn_123', { agentId: 'new_agent_id' });
```

### Webhooks (for custom Express routes)

```typescript
import { verifyElevenLabsWebhook, parseWebhookEvent } from '@marketing-pipeline/elevenlabs';

// Middleware — verifies HMAC signature
router.post('/my-webhook', verifyElevenLabsWebhook('your-secret'), (req, res) => {
  const event = parseWebhookEvent(req.body);

  if (event?.type === 'post_call_transcription') {
    // event.data.conversation_id
    // event.data.transcript
    // event.data.metadata.call_duration_secs
  }

  if (event?.type === 'call_initiation_failure') {
    // event.data.error
  }

  res.json({ received: true });
});
```

---

## Activity log events

Every call creates activity log entries in `marketing.activity_logs`:

| Action | When | Metadata |
|---|---|---|
| `ai_call_initiated` | Call is placed | `{ conversationId, toNumber, agentId }` |
| `ai_call_completed` | Call ends successfully | `{ conversationId, durationSecs, transcriptLength, outcome, hasAudio }` |
| `ai_call_failed` | Call fails to connect | `{ conversationId, error }` |

---

## Sequence integration (future)

This package maps to the `ai_call` step type in the sequence engine (see `docs/VISION-ARCHITECTURE.md`). When the sequence executor reaches an `ai_call` step, the `sequence_steps.config` JSONB looks like:

```json
{
  "step_type": "ai_call",
  "config": {
    "agentId": "optional-override",
    "firstMessage": "Hi {{lead_name}}, following up on your {{lead_source}} submission...",
    "language": "en",
    "dynamicVariableMapping": {
      "lead_name": "lead.first_name",
      "lead_source": "lead.source",
      "campaign": "sequence.name"
    }
  }
}
```

The sequence executor resolves the dynamic variables from the lead record, then calls `callLead()` from `apps/api/src/services/call.service.ts`.

---

## File structure

```
packages/elevenlabs/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts            Re-exports everything
    ├── client.ts           Singleton ElevenLabsClient (reads ELEVENLABS_API_KEY from env)
    ├── calls.ts            makeCall() and makeBatchCalls()
    ├── conversations.ts    getConversation(), listConversations(), getConversationAudio()
    ├── agents.ts           CRUD for ElevenLabs agents
    ├── phone-numbers.ts    Manage Twilio phone numbers in ElevenLabs
    ├── webhooks.ts         Express middleware for signature verification + event parsing
    └── types.ts            TypeScript interfaces for all inputs/outputs

apps/api/
├── src/
│   ├── services/
│   │   └── call.service.ts      callLead(), handleCallCompleted(), handleCallFailed()
│   ├── routes/
│   │   └── elevenlabs.routes.ts POST /api/elevenlabs/webhook + POST /api/elevenlabs/call
│   └── cron/jobs/
│       └── follow-up-calls.ts   Disabled template for scheduled call campaigns
```

---

## Pricing notes

ElevenLabs charges per minute of voice conversation. LLM costs are separate. See [elevenlabs.io/pricing](https://elevenlabs.io/pricing) for current rates. In development, the free tier gives you 15 minutes/month which is enough for testing.
