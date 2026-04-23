# HOW TO — Add a new landing page

This is an **interactive playbook**. When a user says *"I want to add a new landing"* or *"I want to onboard a new org"*, Claude should read this doc and then **ask the user the questions below, one group at a time**, and only execute after the answers are in.

> If you are Claude: do not dump everything at once. Ask group by group. Confirm key decisions before writing files. Show the user the commands you're about to run.

---

## 0. Decision tree (ask this first)

Ask the user:

1. **Is this landing for a brand-new organization, or for an org that already exists in this repo?**
   - New org → **Flow A** (§1)
   - Existing org → **Flow B** (§2)

2. **Do you already have the landing HTML/design built, or are we building it from scratch?**
   - Already built (Lovable, Webflow, Framer, raw HTML, Figma export, etc.) → use the **HTML landing template**
   - Build from scratch (React/Tailwind inside Next.js) → use the **React landing template**
   - Copy an existing landing as starting point → ask *"which one?"* and `cp -r` it

3. **If HTML is already built — where is it?**
   - Pasted in chat → inline as a string in `page.tsx`
   - A `.html` file path on disk → import with `?raw`
   - A public URL → ask user to download/paste, don't fetch it yourself

4. **What does the form need to capture?**
   - Standard fields: any combination of `email`, `firstName`, `lastName`, `phone`
   - Extra fields: company, instagram, followers, role, message, custom selects, etc.
   - Where should the lead go after submit? Inline "thanks" message / redirect to `/gracias` / redirect to WhatsApp / redirect to external URL?

5. **What tracking pixels does this landing use?**
   - Meta Pixel ID? GA4 ID? TikTok Pixel ID? GTM? Clarity?
   - Any of these **shared across the whole org** (put in layout), or **specific to this landing** (put in page)?

6. **What automation should run when a lead is captured?**
   - Nothing for now (just store in DB) → skip sequences/workflows
   - WhatsApp follow-up → we'll create a `sequences/` file
   - Email follow-up → we'll create an email template in `packages/email`
   - AI phone call → need an ElevenLabs agent ID
   - Auto-move through pipeline stages → workflow on `call_completed` / `stage_entered`

Once these are answered, pick the flow below.

---

## Flow A — New org + new landing (end-to-end)

Repository layout to create:

```
apps/api/src/orgs/<org-key>/<bu-key>/
  ├── config.ts
  ├── routing.ts
  ├── seed.ts
  ├── sequences/index.ts
  └── workflows/index.ts

apps/web/src/app/(landings)/<org-key>/<bu-key>/<landing-slug>/
  └── page.tsx
```

Conventions:
- `<org-key>`, `<bu-key>`, `<landing-slug>` are all **kebab-case**
- The URL will be `https://<domain>/<org-key>/<bu-key>/<landing-slug>`
- `<org-key>` / `<bu-key>` in the URL must match what the API ingest expects

### A.1 — Gather org info from the user

Ask, in one batch:

- **Org key** (kebab-case, short, e.g. `acme` or `german-roz`)
- **Org display name** (e.g. "Acme Holdings")
- **BU key** (kebab-case, short, e.g. `desinflamate`)
- **BU display name** (e.g. "Desinflamate Program")
- **Timezone** (e.g. `America/Lima`, `America/Santiago`)
- **Valid lead statuses** for this BU (default: `new`, `contacted`, `qualified`, `converted`, `lost`)
- **Pipeline stage names** in order (e.g. `New Lead → Contacted → Qualified → Sold → Lost`)
- **Any custom fields** the landing form will collect beyond email/name/phone

### A.2 — Scaffold the API side

```bash
cp -r apps/api/src/orgs/_template-company/_template-bu \
      apps/api/src/orgs/<org-key>/<bu-key>
```

Then edit (in this order):

1. **`config.ts`**
   - Set `timezone`
   - Set `validStatuses`
   - Rename every `TEMPLATE_*` env var prefix to `<BU_KEY_UPPER_SNAKE>_*`
     (e.g. `TEMPLATE_ORG_ID` → `DESINFLAMATE_ORG_ID`)

2. **`seed.ts`**
   - Set org name, BU name, pipeline name
   - List your stages in order
   - List your custom field definitions (match the form fields)
   - Run it: `npx ts-node apps/api/src/orgs/<org-key>/<bu-key>/seed.ts`
   - **Copy the printed IDs into `.env`** (see A.4)

3. **`routing.ts`**
   - Default: single pipeline, first stage, for every lead
   - Custom: branch by `customFields.role === 'creator'` etc.

4. **`sequences/index.ts`** + one file per sequence
   - Only if §0.6 asked for outreach
   - Reference: sequence step types listed in `apps/api/src/orgs/_template-company/README.md` §4

5. **`workflows/index.ts`** + one file per workflow
   - Only if §0.6 asked for automation
   - Reference: trigger + action types in `apps/api/src/orgs/_template-company/README.md` §5

### A.3 — Register in the global registry

Edit `apps/api/src/orgs/index.ts`:

```ts
import { sequences as myBuSequences } from './<org-key>/<bu-key>/sequences';
import { workflows as myBuWorkflows } from './<org-key>/<bu-key>/workflows';
import { routingEngine as myBuRouting } from './<org-key>/<bu-key>/routing';

export const sequenceRegistry = {
  ...existingSequences,
  ...myBuSequences,
};

export const workflowRegistry = {
  ...existingWorkflows,
  ...myBuWorkflows,
};
```

Also wire the routing engine in `apps/api/src/core/services/ingestion.service.ts` so leads arriving at `/api/orgs/<org-key>/bus/<bu-key>/ingest` are routed.

### A.4 — Add env vars

Append to `.env` (repo root):

```
<BU_KEY>_ORG_ID=<from seed output>
<BU_KEY>_BU_ID=<from seed output>
<BU_KEY>_PIPELINE_ID=<from seed output>
<BU_KEY>_STAGE_NEW_LEAD=<from seed output>
<BU_KEY>_STAGE_CONTACTED=<from seed output>
# ...one per stage
<BU_KEY>_ELEVENLABS_AGENT_ID=   # only if using AI calls
```

Also make sure these are loaded by `packages/config` (add to its Zod schema if required).

### A.5 — Scaffold the web landing

Pick the template based on §0.2:

```bash
# React template (build from scratch)
cp -r apps/web/src/app/\(landings\)/_template-org/_template-bu/_template-landing \
      apps/web/src/app/\(landings\)/<org-key>/<bu-key>/<landing-slug>

# HTML template (paste exported HTML)
cp -r apps/web/src/app/\(landings\)/_template-org/_template-bu/_template-html-landing \
      apps/web/src/app/\(landings\)/<org-key>/<bu-key>/<landing-slug>
```

> Heads up: Next.js route groups are written with literal parentheses. When copying, escape them (`\(landings\)`) or the shell will complain.

Edit `page.tsx`:

- **`metadata`** — title, description, OG image
- **`<LandingConfig>`** — pixel IDs specific to this landing (§0.5)
- **Landing content** — paste HTML or write JSX
- **`<LeadForm>`** props:
  - `ingestOrgKey="<org-key>"` ← must match the seeded org key
  - `ingestBuKey="<bu-key>"` ← must match the seeded BU key
  - `source="landing-<org-key>-<bu-key>-<landing-slug>"`
  - `fields={[...]}` — standard fields to show (§0.4)
  - `extraFields={[...]}` — custom fields (must match custom field definitions in `seed.ts`)
  - `hiddenFields={{ landing_version: 'v1', ... }}` — anything you want tracked silently
  - `conversion={{ event: 'Lead', data: { value: 0, currency: 'USD' } }}` — pixel event
  - Pick **one** success behavior: `successMessage=...` or `onSuccessRedirect=...`

### A.6 — Org-wide pixels (optional)

If this org has pixels that apply to **all** its landings, wire them in an org-level layout:

- Create `apps/web/src/app/(landings)/<org-key>/layout.tsx` and add `<LandingConfig>` there, **or**
- Add to `apps/web/src/lib/config/pixels.ts` if a config entry exists for the org

### A.7 — Verify end-to-end

Run both apps locally:

```bash
npm run dev:api   # port 3000
npm run dev:web   # port 3001
```

Then:

1. Open `http://localhost:3001/<org-key>/<bu-key>/<landing-slug>`
2. Fill out the form with a test email
3. Check browser devtools network tab — form should POST to `http://localhost:3000/api/orgs/<org-key>/bus/<bu-key>/ingest` and return 2xx
4. Check Supabase `marketing.leads` — new row with your email
5. Check `marketing.lead_pipeline_entries` — entry at the expected stage
6. If sequences are enabled, check `marketing.sequence_enrollments`
7. Open Meta Pixel Helper / GA4 DebugView — confirm the `Lead` event fires

### A.8 — Deploy checklist

- [ ] `.env` vars set in production (Vercel / Railway / wherever)
- [ ] Supabase migrations run (if any new ones)
- [ ] `npm run seed` has been executed **once** against prod DB (or manually created the org/BU/pipeline rows)
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Commit and push

---

## Flow B — New landing for an existing org

Use this when the org + BU are already registered, seeded, and live.

### B.1 — Identify the existing org/BU

Ask:
- **Which org/BU is this for?** (list them from `apps/api/src/orgs/` — e.g. `afluence`, `german-roz`, `lucas-con-lucas`)
- **Is this a new BU under that org, or a new landing under an existing BU?**
  - New BU → do §A.1 through §A.4 for the BU only, then continue here
  - Existing BU → skip straight to B.2

### B.2 — Copy an existing landing (recommended) or the template

Option 1 — copy a similar landing from the same org (fastest, inherits styling):

```bash
cp -r apps/web/src/app/\(landings\)/<org-key>/<bu-key>/<existing-slug> \
      apps/web/src/app/\(landings\)/<org-key>/<bu-key>/<new-slug>
```

Option 2 — fresh from template (see §A.5).

### B.3 — Customize

Edit the copied `page.tsx`:
- **`source`** prop must be unique — update to `landing-<org-key>-<bu-key>-<new-slug>`
- **`metadata`** — unique title/description per landing (SEO)
- **`<LandingConfig>`** — if this landing uses a different pixel than the org default
- **`conversion`** — consider a landing-specific `content_name` so you can filter events later
- **`hiddenFields.landing_version`** or similar — bump version for A/B tests

### B.4 — Handle custom fields

If the new landing captures fields the existing BU doesn't know about:

1. Add the field to `seed.ts` `customFields` for that BU
2. **Do not re-run the full seed**. Either:
   - Write a one-off migration script that only inserts the new `custom_field_definitions` row, **or**
   - Insert manually in Supabase
3. Regen types: `npm run gen-types -w @marketing-funnel/api`

### B.5 — Verify + deploy

Same as §A.7–A.8. No seed needed. No registry changes needed. No env var changes needed.

---

## Reference: quick file map

| What | Where |
|---|---|
| Landing pages | `apps/web/src/app/(landings)/<org>/<bu>/<slug>/page.tsx` |
| React landing template | `apps/web/src/app/(landings)/_template-org/_template-bu/_template-landing/page.tsx` |
| HTML landing template | `apps/web/src/app/(landings)/_template-org/_template-bu/_template-html-landing/page.tsx` |
| LeadForm component | `apps/web/src/components/lead-form.tsx` |
| HTML wrapper | `apps/web/src/components/html-landing.tsx` |
| Landing pixel config | `apps/web/src/components/landing-config.tsx` |
| Global pixel config | `apps/web/src/lib/config/pixels.ts` |
| Tracking scripts | `apps/web/src/components/tracking/` |
| Org backend | `apps/api/src/orgs/<org>/<bu>/` |
| Org backend template | `apps/api/src/orgs/_template-company/_template-bu/` |
| Full BU reference (sequences/workflows) | `apps/api/src/orgs/_template-company/README.md` |
| Org registry | `apps/api/src/orgs/index.ts` |
| Ingestion service | `apps/api/src/core/services/ingestion.service.ts` |
| Email templates | `packages/email/src/templates/` |
| Env var schema | `packages/config/` |

---

## Reference: common `<LeadForm>` recipes

### Minimal lead capture (email + name)

```tsx
<LeadForm
  ingestOrgKey="acme"
  ingestBuKey="main"
  source="landing-acme-main-home"
  fields={['firstName', 'email']}
  successMessage="Thanks! We'll be in touch."
/>
```

### Webinar signup with redirect

```tsx
<LeadForm
  ingestOrgKey="acme"
  ingestBuKey="webinar"
  source="landing-acme-webinar-may2026"
  fields={['firstName', 'email', 'phone']}
  conversion={{ event: 'CompleteRegistration', data: { content_name: 'webinar-may' } }}
  onSuccessRedirect="/webinar/confirmation"
/>
```

### WhatsApp handoff

```tsx
<LeadForm
  ingestOrgKey="acme"
  ingestBuKey="sales"
  source="landing-acme-sales-cta"
  fields={['firstName', 'phone']}
  conversion={{ event: 'Contact' }}
  onSuccessRedirect="https://wa.me/56912345678?text=Hola%20quiero%20info"
/>
```

### Qualification form with select + extra fields

```tsx
<LeadForm
  ingestOrgKey="acme"
  ingestBuKey="enterprise"
  source="landing-acme-enterprise-demo"
  fields={['firstName', 'lastName', 'email', 'phone']}
  extraFields={[
    { name: 'company', placeholder: 'Company', required: true },
    { name: 'employees', type: 'select', placeholder: 'Company size', options: [
      { value: '1-10', label: '1-10' },
      { value: '11-50', label: '11-50' },
      { value: '51+', label: '51+' },
    ]},
    { name: 'message', type: 'textarea', placeholder: 'Tell us more' },
  ]}
  hiddenFields={{ landing_version: 'v2', campaign: 'enterprise-q2' }}
  conversion={{ event: 'SubmitApplication', data: { value: 1000, currency: 'USD' } }}
  successMessage="Thanks — our team will reach out within 24h."
/>
```

---

## When things go wrong

| Symptom | Likely cause |
|---|---|
| Form submits but lead never appears in DB | `ingestOrgKey` / `ingestBuKey` don't match what's seeded in Supabase |
| `404` from the ingest endpoint | Route isn't registered, or you forgot to wire routing in `ingestion.service.ts` |
| Custom field value missing on the lead | Field name in `extraFields` doesn't match `custom_field_definitions.key` |
| Pixel doesn't fire | `<LandingConfig>` missing, wrong pixel ID, or conversion event fired before pixel loaded (hard-refresh and check Meta Pixel Helper) |
| Sequence never runs | BU not registered in `orgs/index.ts`, or cron `sequence-step-processor` isn't running |
| Next.js can't find the page | Route group parentheses not escaped when copying, or `page.tsx` isn't the default export |
| Types error after seed | Run `npm run gen-types -w @marketing-funnel/api` |

---

## TL;DR for Claude

1. Read this doc
2. Ask the questions in §0 — **one group at a time, wait for answers**
3. Pick Flow A (new org) or Flow B (existing org)
4. Before running the first `cp`, echo back the plan: *"I'll create `<org>/<bu>/<slug>` using the `<react|html>` template, with form fields `[...]`, pixels `[...]`, and success behavior `[...]`. Proceed?"*
5. Execute step by step. After each file edit, briefly say what changed.
6. At the end, run the verification in §A.7 and report back.
