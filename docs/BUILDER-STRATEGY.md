# Builder Strategy Architecture — Afluence Marketing Funnel

**Status:** Strategic Design (June 2026)  
**Audience:** Cristóbal (product/tech), Pablo (revenue), Nico (ops)  
**Decision Target:** Week of June 16, 2026

---

## Executive Summary

Afluence currently deploys **code-first landings** (React components in `apps/web`) and **template-based emails** (React Email in `packages/email`). Scaling to 50 creators demands a builder UI so creators can iterate landings without dev cycles, and ops can approve designs before publishing.

This document compares **three architectural options** for landing + email builders, with focus on cost, timeline, multi-creator scalability, and Afluence's creator-first DNA. **Recommendation: Option B (Hybrid In-House)** in parallel with ops hardening — ships core landing builder in 6 weeks, email builder in week 8, and buys Afluence optionality to embed Plasmic later.

---

## Current State: What We Have

### Landing Pages
- **Location:** `apps/web/src/app/(landings)/<org>/<bu>/<landing>/`
- **Patterns:**
  - Raw HTML + iFrame in `LandingFrame` component (e.g., `apps/web/src/app/(landings)/bukku/page.tsx`)
  - React component landings (rare, e.g., German Roz webinar)
  - VSL embeds with testimonial carousel (spike: `vsl-lab`, production: `vsl-desinflamate`)
- **Form Integration:** `<LeadForm>` component handles UTM params, lead ingestion, and pixel events automatically
- **Lead Routing:** Form submits to `POST /api/orgs/:orgKey/bus/:buKey/ingest` (Zod-validated; deduped by email per org)
- **Tracking:** Meta Pixel (CAPI + pixel ID), GA4, TikTok Pixel, Clarity, Hyros — injected via `LandingConfig` component
- **Key Files:**
  - Ingestion: `apps/api/src/core/routes/ingestion.routes.ts`
  - LeadForm: `apps/web/src/components/lead-form.tsx`
  - Landing config: `apps/web/src/components/landing-config.tsx`

### Product Catalog (Cohorts & Tiers)
- **Location:** `packages/catalog/src/products/` (e.g., `german-roz-di21.ts`)
- **Type Definition:** `BusinessUnitProduct` = orgKey + buKey + `cohorts[]` (Cohort = code + contentId + startsAt/endsAt + tiers)
- **Single Source of Truth:** Catalog is editable via PR + deploy; `marketing.cohorts` DB table is a read-only mirror
- **Integration:** Web checkout reads `packages/catalog`, not the DB; catalog provides contentId for Meta CAPI
- **Key Point:** Landing pages and builders MUST surface this catalog so creators can pick which cohort/tier a form feeds into

### Emails
- **Location:** `packages/email/src/templates/` (React Email + Resend)
- **Current Templates:** Minimal (welcome.tsx, company1-followup.tsx)
- **Variable Support:** Props passed at render time (e.g., `{{ name }}`, `{{ ctaUrl }}`)
- **Delivery:** Sent via Resend API in sequences and webhooks
- **Gap:** No builder UI; creators can't compose HTML without dev help

### Admin Back-Office
- **Location:** `apps/admin` (Next.js 15, App Router)
- **Module System:** Modular enablement per BU (`apps/admin/src/lib/modules/registry.ts`)
- **Current Modules:** Campaigns (Meta analytics), Responses (landing form responses), Launch Ops, WhatsApp Groups
- **Key Pattern:** Server Actions in `.../actions.ts` + `supabaseAdminForSchema()` helpers
- **Missing:** No builder module yet

---

## Architectural Options

### Option A: Outsourced Drag-Drop (Webflow / Unbounce Style)

**Core Idea:** Creators build landings in an external drag-drop tool (Webflow, Unbounce, Framer, or custom); webhooks sync metadata back to marketing-funnel; lead ingestion stays in-house.

#### How It Works
1. Creator designs landing in external builder
2. Builder exposes webhooks/API: landing published → `POST /api/webhooks/builder-publish`
3. Webhook payload: landing URL, form schema (field names, types), cohort/BU binding
4. Marketing-funnel persists landing metadata to new `marketing.builder_landings` table
5. On publish, landing form is instrumented with marketing-funnel ingestion endpoint
6. Lead responses routed to `marketing.leads` and responses module

#### Catalog Integration
- External builder is **dumb** to cohorts (no embedded knowledge)
- Afluence ops/creator picks cohort in marketing-funnel admin UI **after** designer uploads landing
- Binding: `builder_landing_id` → `cohort_code` (m:1 allowed; one landing can sell multiple editions)
- Form field mapping: designer exports field names (e.g., `email`, `firstName`, `phone`); ingestion validates

#### Guardrails
- **Validation:** At webhook receipt, validate landing URL is reachable, form fields match schema (regex checks for email/phone)
- **Approval Workflow:** Draft state stored; ops reviews landing screenshot/preview; publish changes state to active
- **Rollback:** Keep previous version in DB (`version` column); quick rollback via admin UI toggle
- **Error Handling:** If external landing goes 404, serve cached HTML snapshot from storage bucket

#### Pros
- **Zero dev load for design iteration:** Creators use familiar, polished Webflow UI
- **Outsourced maintenance:** Third-party tool handles UI/UX updates
- **Creative flexibility:** No component library limits; drag-drop whatever you want

#### Cons
- **Integration cost:** Implement webhooks, field mapping, snapshot caching, landing metadata schema
- **Vendor lock-in:** If builder shuts down or adds restrictions, landings are orphaned
- **Latency risk:** External landing slow → user bounce (no SLA on third-party uptime)
- **Form field brittleness:** If builder changes field names, ingestion breaks (no auto-sync schema)
- **Compliance burden:** Designer PII stored in external tool; Afluence loses data ownership
- **Cost:** Webflow Workspace plan $12-40/mo per creator; Unbounce $99-299/mo

#### MVP Scope (Weeks 1–4)
- [ ] Week 1: Design webhook schema, implement landing metadata table
- [ ] Week 2: Build webhook receiver + field validator
- [ ] Week 3: Admin UI for landing approval workflow + preview
- [ ] Week 4: End-to-end test with one creator (e.g., German Roz test landing)

#### Est. Dev Effort
- **Dev weeks:** 3–4 (one mid-level engineer, PT)
- **Third-party cost:** $12–40 per creator/month (Webflow); $99–299 (Unbounce) — multiply by 50 creators
- **Timeline:** 4–6 weeks to MVP

#### Scalability to 50 Creators
- **Per-creator cost growth:** Linear ($12–299/mo × 50 = $600–14,950/mo)
- **Design consistency:** No guardrails; each creator's landing looks different (brand variability)
- **Form field chaos:** 50 creators × 5 fields each = 250 fields, all custom mappings

---

### Option B: Hybrid In-House (Light Build)

**Core Idea:** Simple drag-drop builder in `apps/admin` (or new `apps/builder` Next.js app). Pre-built template blocks (hero, CTA, form, testimonials, pricing card) with WYSIWYG editor. Falls back to HTML upload for power users. Code-generates clean HTML/CSS that lands in git.

#### How It Works
1. Creator opens builder in admin back-office (`/german-roz/di21/builder`)
2. Drag blocks onto canvas: Hero section, Image, Form, CTA button, Testimonial carousel
3. Edit text/images inline; pick from brand colors (org-level tokens)
4. Builder **generates clean HTML/CSS** (no framework bloat)
5. On publish, HTML is written to git + committed to `apps/web/src/app/(landings)/<org>/<bu>/<landing>/landing-generated.html`
6. Rails redeploy (auto-picks up new landing page)
7. Form submission routed to `POST /api/orgs/:orgKey/bus/:buKey/ingest`

#### Catalog Integration
- **Cohort Picker:** In builder, creator selects target cohort (dropdown from live `packages/catalog`)
- **Binding:** Form `action` attribute set to `https://api.marketing-funnel.com/api/orgs/${org}/bus/${bu}/ingest?cohort=${cohort}`
- **Tier Display:** If cohort has multiple tiers, builder embeds tier picker or shows "Early Bird $67 → $97" pricing ladder
- **Meta contentId:** Auto-filled in form hidden field; ingestion reads and sends to CAPI

#### Code Generation Example
```typescript
// Builder canvas state (Svelte/React hooks)
type BuilderBlock = 
  | { type: 'hero'; heading: string; bgImage: string; cta: string }
  | { type: 'form'; fields: FormField[]; cohortCode: string }
  | { type: 'testimonial-carousel'; items: Testimonial[] }

// On publish:
const html = renderBuilderToHtml(blocks, org, bu);
// Result:
// <html>
//   <head><meta...tracking pixels...></head>
//   <body>
//     <section class="hero" style="background-image: url(...)">
//       <h1>{{ heading }}</h1>
//     </section>
//     <form action="/api/orgs/german-roz/bus/di21/ingest?cohort=DI21-C2" method="POST">
//       <input name="email" type="email" required>
//       <input name="cohort_code" type="hidden" value="DI21-C2">
//       <button>Register</button>
//     </form>
//   </body>
// </html>

// Write to git:
await fs.writeFile(
  'apps/web/src/app/(landings)/german-roz/di21/landing-generated.html',
  html
);
```

#### Guardrails
- **XSS Prevention:** Builder strips `<script>`, `<iframe>` tags; whitelist allowed HTML tags (p, img, button, form, etc.)
- **Link Validation:** On save, crawl all `href` and `src` attributes; flag broken links
- **Form Field Validation:** Ingestion schema enforces email/phone format; builder warns if form fields don't match catalog field definitions
- **Approval Workflow:** Draft → Preview URL (unique token) → Share with creator → Centro review → Publish
- **Rollback:** Git history; revert to any previous commit
- **Image Hosting:** Uploaded images go to S3 bucket; builder persists image URLs in HTML; CDN caches
- **Mobile Responsiveness:** Builder blocks ship with Tailwind responsive classes (hide on mobile, stack vertically, etc.)

#### MVP Scope (Weeks 1–8)

**Phase 1 (Weeks 1–4): Landing Builder + Form Integration**
- [ ] Week 1: Schema design (BuilderBlock, BlockLibrary, PublishState)
- [ ] Week 1–2: UI shell in `apps/admin` (Svelte/React + Tailwind, no external drag-drop lib yet; use `@dnd-kit/core` for cheap MVP)
- [ ] Week 2–3: Block library (hero, CTA, form, testimonials) + inline editing
- [ ] Week 3: HTML code generation + Git writer
- [ ] Week 4: Form field mapper + catalog integration; ingestion end-to-end test

**Phase 2 (Weeks 5–6): Approval Workflow + Admin UX**
- [ ] Week 5: Draft/Preview/Active states; publish permission checks (`canManage`)
- [ ] Week 5–6: Preview URL + share link; ops review UI

**Phase 3 (Weeks 7–8): Email Builder + Polish**
- [ ] Week 7: Email template builder (simpler: text blocks, CTA, variables like `{{ lead_name }}`)
- [ ] Week 7–8: Email delivery via sequences; test with live creator

#### Est. Dev Effort
- **Dev weeks:** 5–7 (one full-stack engineer)
- **Third-party cost:** $0 (self-hosted)
- **Timeline:** 8 weeks to full MVP

#### Key Tech Decisions
- **Drag-Drop Lib:** Use `@dnd-kit/core` (lightweight, no hidden dependencies) OR skip library and use HTML5 drag-drop API for MVP
- **Code Gen:** Handlebars or Nunjucks for template rendering; avoids JSX complexity
- **Git Integration:** Leverage `simple-git` npm package; commit on behalf of system user (ops@afluence)
- **Image Upload:** AWS S3 + signed URLs; Supabase Storage as alternative if no AWS
- **Editor:** Monaco Editor (VS Code in browser) for HTML fallback mode

#### Scalability to 50 Creators
- **Per-creator cost:** $0 (platform pays one-time dev cost)
- **Design consistency:** Shared component library enforces brand consistency
- **Form fields:** Standardized across all creators; ingestion schema is fixed
- **Customization:** HTML fallback mode lets power users hand-edit CSS
- **Creator autonomy:** Each creator iterates own landings; no approval bottleneck if ops trusts center template
- **Bottleneck:** Ops review cycles (mitigate: pre-approve templates, auto-publish low-risk changes)

---

### Option C: Code Generation + Escape Hatch (Plasmic Embed)

**Core Idea:** Embed Plasmic SDK in `apps/builder` (new app). Designers work visually in Plasmic; Afluence registers shared component library (pricing card, form, testimonials, hero blocks). Generator outputs React components → registered in `apps/web/src/components/builder-generated/`. Developers can fork/customize.

#### How It Works
1. Creator opens Plasmic studio (embedded iframe in `apps/builder`)
2. Plasmic UI offers drag-drop canvas + Afluence component library (pre-built, versioned)
3. Designer composes landing; Plasmic generates React component + TypeScript props
4. On publish, component code pushed to `apps/web/src/components/builder-generated/<org>-<bu>-<landing>.tsx`
5. Landing page in `apps/web/src/app/(landings)/<org>/<bu>/<landing>/page.tsx` imports component
6. Form submission routed to ingestion endpoint
7. If designer needs hand-edit (custom CSS/logic), developer forks component and re-implements in `apps/web/src/components/custom/`

#### Catalog Integration
- **Component Lib** includes pre-built form block that reads `packages/catalog` at render time
- Form block props: `{ org, bu, defaultCohort? }`; block reads catalog + renders tier picker
- Meta contentId/CAPI baked into component
- Pricing card component auto-fills price ladder from catalog

#### Shared Component Library
- **Location:** `packages/ui/src/builder-components/` OR registered in Plasmic project
- **Examples:**
  - `<HeroBlock props={{ heading, bgImage, cta }} />`
  - `<FormBlock props={{ org, bu, cohort, fields }} />` ← reads catalog
  - `<PricingCard props={{ cohorts[] }} />` ← renders tier ladder
  - `<TestimonialCarousel props={{ items[] }} />`
  - `<CtaButton props={{ label, href }} />`
- **Versioning:** Each component has a `version` prop; Plasmic can pin to specific version
- **Custom CSS:** Tailwind + CSS modules; designer can override in Plasmic

#### Guardrails
- **Type Safety:** All generated components are TypeScript; linting runs on push
- **Approval Workflow:** Plasmic draft → preview in Afluence UI → ops review → merge to main
- **Rollback:** Git history; revert commit
- **Image Hosting:** S3 bucket (same as Option B)
- **Mobile Responsiveness:** Plasmic responsive design tools + Tailwind

#### MVP Scope (Weeks 1–10)

**Phase 1 (Weeks 1–3): Plasmic Integration + Component Library**
- [ ] Week 1: Set up Plasmic workspace + API credentials
- [ ] Week 1–2: Build shared component library in Plasmic (hero, form, pricing, testimonials)
- [ ] Week 2–3: Implement Plasmic → git code generation (use Plasmic CLI or API)

**Phase 2 (Weeks 4–6): Landing Publisher + Form Integration**
- [ ] Week 4: Plasmic iframe embed in `apps/builder`; publish workflow
- [ ] Week 5: Git writer + landing page registration (auto-import in Next.js route)
- [ ] Week 6: Form ingestion integration + catalog binding

**Phase 3 (Weeks 7–9): Approval + Polish**
- [ ] Week 7–8: Preview URL + ops review UI
- [ ] Week 8–9: Email builder (optional; use React Email template generation)

**Phase 4 (Week 10): Dev Customization Flow**
- [ ] Week 10: Document fork/customize workflow for developers

#### Est. Dev Effort
- **Dev weeks:** 7–9 (full-stack engineer + Plasmic specialist time)
- **Third-party cost:** Plasmic Teams plan ~$300–500/mo (depending on seats + overages)
- **Timeline:** 10–12 weeks to MVP

#### Key Trade-offs
- **Pros:**
  - Designer/developer split: designer uses no-code, dev customizes
  - Plasmic handles complex UI/UX (responsive design, interactions)
  - Component library scales (versioning, updates)
  - TypeScript safety (generated code is type-checked)
  
- **Cons:**
  - Steeper learning curve (Plasmic API + code generation workflow)
  - Vendor lock-in on Plasmic (if subscription ends, rebuilding is expensive)
  - Longer timeline (10–12 weeks vs. 6–8 weeks)
  - Dev customization adds complexity (fork cost, testing burden)
  - Plasmic cost compounds with creators ($300–500/mo × team)

#### Scalability to 50 Creators
- **Per-creator cost:** $0 (platform cost is fixed Plasmic subscription)
- **Design consistency:** High (shared library + Plasmic version pinning)
- **Customization:** Developer escape hatch for power users
- **Bottleneck:** Plasmic workspace collaboration (shared workspace vs. per-creator workspaces?)

---

## Detailed Integration Touchpoints

### Landing Form → Lead Ingestion

**Current Flow (Code-First):**
```
Landing form (apps/web) 
  → POST /api/orgs/:orgKey/bus/:buKey/ingest (ingestion.routes.ts)
  → Zod validation (ingestSchema)
  → Lead creation or update (marketing.leads)
  → Dedup by email + org
  → Dispatch integration events (MailerLite, Hyros, Meta CAPI)
  → Emit to eventBus (workflows listen)
```

**Builder Form Integration (All Options):**
- Form `action` attribute points to the same ingestion endpoint
- Builder injects form fields matching `ingestSchema` (email, firstName, lastName, phone, customFields)
- Form includes hidden fields:
  - `cohort` (selected in builder or passed via URL param)
  - `source` (auto-filled: `landing-<org>-<bu>-<landing-name>`)
  - `tracking[meta][fbp]` (captured by Pixel library)
- On submit:
  1. LeadForm component validates locally (email format, required fields)
  2. POST to ingestion endpoint
  3. Server response: `{ lead_id, message }`
  4. Redirect to post-purchase page or thank you

**Key File:** `/apps/api/src/core/routes/ingestion.routes.ts` (no changes needed; builder forms slot in)

---

### Catalog Surface in Builder UI

**Requirement:** When creator picks cohort for a landing, they see:
- Cohort code + description
- Active date range (humanized: "June 16 – July 15")
- Tier ladder (early bird $X, regular $Y, last-chance $Z)
- Meta contentId (for reference only)

**Implementation (All Options):**
```typescript
// apps/admin/src/lib/catalog/resolver.ts (new)
import { resolveActiveCohort, getCatalogByOrgBu } from '@marketing-funnel/catalog';

export async function getCohortsByBu(org: string, bu: string) {
  const catalog = getCatalogByOrgBu(org, bu);
  return catalog.cohorts.map(cohort => ({
    code: cohort.code,
    label: `${cohort.code} (${cohort.startsAt} – ${cohort.endsAt})`,
    contentId: cohort.contentId,
    tiers: cohort.tiers.map(tier => ({
      price: tier.price,
      until: tier.until,
      checkoutRef: tier.checkoutRef
    }))
  }));
}

// Builder form:
const cohorts = await getCohortsByBu(org, bu);
return (
  <select name="cohort" defaultValue={cohorts[0].code}>
    {cohorts.map(c => (
      <option key={c.code} value={c.code}>{c.label}</option>
    ))}
  </select>
);
```

---

### Landing Responses → Admin Responses Module

**Current Flow:**
- Leads ingested into `marketing.leads` + `marketing.lead_pipeline_entries`
- Admin Responses module queries `marketing.leads WHERE source LIKE 'landing-%'`
- Displays in table + filters by date, source, status

**Builder Landing Integration (All Options):**
- Builder landing sets `source` to `landing-<org>-<bu>-<landing-name>` (auto-generated)
- Responses module picks up automatically (no schema change needed)
- Display: Admin sees form responses grouped by landing → can filter/export

**Admin UI Enhancement (Option B/C):**
- Add filter: "Landing" (dropdown of all builder-generated landings for org)
- Show landing thumbnail in response row (preview image)

---

### Pixel Tracking Integration

**Current:** `LandingConfig` component injects Meta Pixel, GA4, TikTok, Clarity, Hyros into page
- **Key File:** `apps/web/src/components/landing-config.tsx`
- **Mechanism:** `<script>` tags in `<Head>` + event firing via JS

**Builder Integration:**
- **Option A (External):** External builder embeds pixel code; webhook payload includes pixel IDs
- **Option B (In-House):** Builder HTML includes `<LandingConfig>` as wrapper OR raw pixel `<script>` tags
  ```html
  <!-- Generated HTML includes raw pixel tags -->
  <script async src="https://connect.facebook.net/en_US/fbevents.js"></script>
  <script>
    fbq('init', '{{ META_PIXEL_ID }}');
    fbq('track', 'PageView');
  </script>
  ```
  → Env vars substituted at runtime (landing HTML is not static; Next.js route renders it with env)

- **Option C (Plasmic):** Generated React component imports `<LandingConfig>`; Plasmic respects it

**Form Tracking:**
- Form `onSubmit` fires pixel event `fbq('track', 'Lead')` before POST
- Form hidden fields preserve `fbp`, `fbc` (from pixel cookies) for CAPI attribution
- Ingestion endpoint reads `tracking[meta]` and sends to Meta CAPI

---

### Email Builder → Template Library

**Current State:**
- Emails are React Email components in `packages/email/src/templates/`
- Rendered at send time; variables like `{{ name }}` passed as props

**Option A (External):** External builder exports HTML template; Afluence stores in `marketing.email_templates` table
- On send: template HTML + variables → Resend

**Option B/C (In-House):**
```typescript
// Email builder generates HTML template
const emailTemplate = `
<html>
  <body>
    <h1>Welcome, {{ lead_name }}!</h1>
    <p>Your discount code: {{ discount_code }}</p>
    <a href="{{ cta_url }}">Get Started</a>
  </body>
</html>
`;

// Store in DB (new table: marketing.email_templates)
// Or commit to git: packages/email/src/templates/builder-generated/<org>-<bu>-<name>.html

// On send (sequence step handler):
import Handlebars from 'handlebars';
const template = Handlebars.compile(emailTemplate);
const html = template({
  lead_name: lead.first_name,
  discount_code: cohort.discount_code,
  cta_url: generateCtaUrl(org, bu, lead.id)
});

await sendEmail({
  to: lead.email,
  html,
  subject: 'Welcome to Desinflámate!'
});
```

**Variable Catalog (All Options):**
- Available vars: `{{ lead_name }}`, `{{ lead_email }}`, `{{ cohort_code }}`, `{{ tier_price }}`, `{{ discount_code }}`, `{{ cta_url }}`
- Builder UI shows available vars in sidebar (autocomplete in text fields)

---

### Ad Builder → Meta Ads Manager

**Current:** `packages/meta-ads` pulls existing campaigns from Meta; admin dashboard displays

**Ad Builder (Option B/C, Future):**
- Designer creates ad creative in builder (1x1 image, 1.91x1 carousel, 4x5 video format)
- Builder exports PNG/JPG/MP4 to S3
- Creator uploads exported asset to Meta Ads Manager manually (or future: sync via Meta API)
- Afluence tracks which assets came from builder (metadata) for reporting

**Scope Note:** Ad builder is **Phase 2** (post-landing/email). For MVP, focus on landings + emails only.

---

## Recommendation: Option B (Hybrid In-House)

### Rationale

1. **Cost Alignment:** Afluence owns the tool; scales to 50 creators at $0 incremental cost (one-time 5–7 week dev investment)
   - Option A: $600–14,950/mo (creator tool subscriptions)
   - Option C: $300–500/mo (Plasmic, compounding with team size)

2. **Timeline:** 8 weeks to MVP (Option A: 4–6 weeks, but ongoing integration tax; Option C: 10–12 weeks)

3. **Creator Autonomy:** Fits Afluence's **creator-first ethos**
   - Creators own their landing code (in git)
   - No vendor dependency (if Afluence fails, creator can export HTML + run elsewhere)
   - Fast iteration (no external tool loading time)

4. **Operational Control:** Ops gets full visibility + approval workflow
   - Draft → Preview URL (share with creator) → Centro review → Publish
   - Easy rollback (git revert)
   - No surprise changes (external tool could have breaking updates)

5. **Optionality:** HTML fallback mode preserves developer escape hatch
   - Power users (developers) can hand-edit CSS/HTML
   - Builder is a "fast path" for creators, not a constraint

6. **Platform Foundation:** Landing builder is table-stakes for a factory (builders are table-stakes for any modern platform)
   - Tomorrow: extend to offer templates (pre-built landing skeletons)
   - Tomorrow: extend to embed Plasmic for advanced design (Option C becomes a Phase 2 refactor)

### Phased Rollout

**Phase 1 (Weeks 1–6): Landing Builder MVP**
- Simple drag-drop (hero, CTA, form, testimonials)
- Catalog integration (cohort picker)
- Code generation → git commit
- Draft/Preview/Publish workflow

**Phase 2 (Weeks 7–8): Email Builder**
- Text blocks + CTA + variable insertion
- Template storage (git or DB)
- Sequence integration (email step can use builder templates)

**Phase 3 (Weeks 9–10, Future): Polish**
- Template library (pre-built skeletons: 3-tier, webinar, waitlist, etc.)
- Image upload UI (S3 integration)
- Mobile preview

### Success Metrics

- **Creator adoption:** 10 creators launch landings via builder in first 4 weeks post-MVP
- **Time-to-publish:** Landing from blank → published in <1 hour (vs. 3–5 days via dev request)
- **Approval cycle:** <24 hours from creator submit → ops review → publish
- **Error rate:** <0.1% landing 404s or broken forms (monitoring via uptime cron)

---

## Implementation Sketch (Option B)

### Schema & DB

```sql
-- marketing.builder_landings (new)
CREATE TABLE marketing.builder_landings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_key TEXT NOT NULL,
  bu_key TEXT NOT NULL,
  landing_name TEXT NOT NULL, -- e.g., "desinflamate-v2"
  cohort_code TEXT, -- references marketing.cohorts.code
  state TEXT NOT NULL DEFAULT 'draft', -- draft | preview | active | archived
  blocks JSONB NOT NULL, -- BuilderBlock[] serialized
  html_snapshot TEXT, -- cached HTML from last publish
  git_commit_sha TEXT, -- SHA of git commit
  created_by UUID NOT NULL REFERENCES backoffice.profile(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  UNIQUE(org_key, bu_key, landing_name)
);

-- backoffice.approval_tasks (new, or reuse existing)
CREATE TABLE backoffice.approval_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_key TEXT,
  bu_key TEXT,
  resource_type TEXT, -- 'landing' | 'email'
  resource_id UUID,
  status TEXT DEFAULT 'pending', -- pending | approved | rejected
  submitted_by UUID REFERENCES backoffice.profile(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES backoffice.profile(id),
  reviewed_at TIMESTAMPTZ,
  preview_url TEXT,
  UNIQUE(resource_type, resource_id)
);
```

### File Structure (Option B)

```
apps/admin/
  src/
    app/
      [organizer]/[bu]/builder/
        page.tsx                       ← landing list + create
        [landing-id]/
          page.tsx                     ← editor canvas
          actions.ts                   ← save draft, publish, delete
    components/
      builder/
        canvas.tsx                     ← Svelte component, canvas + blocks
        block-library.tsx              ← hero, form, cta, testimonials
        block-editor.tsx               ← inline editing panel
        toolbar.tsx                    ← undo/redo, save, preview, publish
    lib/
      builder/
        types.ts                       ← BuilderBlock, BuilderLanding, PublishState
        code-gen.ts                    ← renderBuilderToHtml()
        git-writer.service.ts          ← commit to git
        preview-url.service.ts         ← generate signed preview token
        catalog-resolver.ts            ← getCohortsByBu()

packages/
  builder-code-gen/
    src/
      render.ts                        ← Nunjucks HTML generation
      blocks/
        hero.njk                       ← template fragments
        form.njk
        testimonial-carousel.njk
```

### Key Service: Code Generation

```typescript
// apps/admin/src/lib/builder/code-gen.ts

import nunjucks from 'nunjucks';
import { BuilderBlock } from './types';

export function renderBuilderToHtml(
  blocks: BuilderBlock[],
  org: string,
  bu: string,
  cohort: string,
  pixelIds: { meta?: string; ga4?: string }
): string {
  const env = nunjucks.configure();
  
  const blockHtml = blocks
    .map(block => {
      switch (block.type) {
        case 'hero':
          return env.render('hero.njk', {
            heading: block.heading,
            bgImage: block.bgImage,
            cta: block.cta
          });
        case 'form':
          return env.render('form.njk', {
            fields: block.fields,
            cohort,
            org,
            bu
          });
        // ...
      }
    })
    .join('\n');

  const template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Landing</title>
  <style>${compileTailwind(blocks)}</style>
  <!-- Pixel tracking -->
  <script async src="https://connect.facebook.net/en_US/fbevents.js"></script>
  <script>
    fbq('init', '${pixelIds.meta}');
    fbq('track', 'PageView');
  </script>
</head>
<body>
  ${blockHtml}
</body>
</html>
  `;

  return template;
}
```

### Publish Action (Server)

```typescript
// apps/admin/src/app/[organizer]/[bu]/builder/[landing-id]/actions.ts

'use server';

import { z } from 'zod';
import { supabaseAdminForSchema } from '@/lib/supabase/server';
import { renderBuilderToHtml } from '@/lib/builder/code-gen';
import { commitToGit } from '@/lib/builder/git-writer.service';
import { getIntegrationConfig, getCohortsByBu } from '@marketing-funnel/catalog';

const publishSchema = z.object({
  landingId: z.string().uuid(),
  org: z.string(),
  bu: z.string(),
  blocks: z.array(z.any()),
  cohort: z.string(),
});

export async function publishLanding(input: z.infer<typeof publishSchema>) {
  const { landingId, org, bu, blocks, cohort } = publishSchema.parse(input);

  // 1. Check permission
  const session = await getOpsSession();
  if (!session?.can_manage) throw new Error('Unauthorized');

  // 2. Validate blocks
  // validateBlocks(blocks);

  // 3. Get pixel IDs for org
  const pixelIds = await getOrgPixelIds(org);

  // 4. Generate HTML
  const html = renderBuilderToHtml(blocks, org, bu, cohort, pixelIds);

  // 5. Write to git
  const gitSha = await commitToGit({
    path: `apps/web/src/app/(landings)/${org}/${bu}/${landingId}/page.generated.tsx`,
    content: wrapHtmlInReactComponent(html),
    message: `feat(landing): publish ${org}/${bu}/${landingId} (cohort: ${cohort})`
  });

  // 6. Update DB state
  const marketing = supabaseAdminForSchema('marketing');
  await marketing
    .from('builder_landings')
    .update({
      state: 'active',
      html_snapshot: html,
      git_commit_sha: gitSha,
      published_at: new Date().toISOString()
    })
    .eq('id', landingId);

  // 7. Return success
  return {
    success: true,
    url: `https://marketing-funnel.com/${org}/${bu}/${landingId}`,
    gitSha
  };
}
```

---

## Timeline & Capacity

### Estimated Effort (Option B)

| Phase | Tasks | Weeks | FTE | Owner |
|-------|-------|-------|-----|-------|
| **1: Landing Builder** | Schema, UI, code gen, git writer | 4 | 1.0 | Eng (full-stack) |
| **2: Approval Workflow** | Preview URL, ops UI, permissions | 2 | 0.5 | Eng, Nico (PO) |
| **3: Email Builder** | Email template editor, delivery | 2 | 0.5 | Eng |
| **4: Polish & Testing** | Image upload, mobile, perf, docs | 2 | 0.5 | Eng, QA |
| **TOTAL** | | **8–10** | **~2.0** | |

### Critical Path

```
Week 1: Schema + types (blocking builder UI)
Week 2–3: Canvas + blocks (blocking code gen)
Week 3–4: Code gen + git writer (blocking end-to-end)
Week 4: E2E test with one creator
Week 5: Approval workflow (blocking ops adoption)
Week 6: Email builder (optional for MVP)
Week 7–8: Polish + docs
```

### Capacity Check (Cristobal)
- **Current sprint capacity:** Cris ~40h/week
- **Marketing-funnel demand:** VSL checkout hardening, integrations fan-out, catalog sync bugs
- **Option B builder:** 5–7 weeks FT (could be PT contractor or defer other work)
- **Recommendation:** Hire contractor (mid-level full-stack Node/React) for 8 weeks, shadow with one internal eng

---

## Risk Mitigation

### Option B Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Builder UI is slow to edit | Creator frustration | Use Svelte for reactivity; limit to 10–15 blocks per landing initially |
| Git writer fails (auth, merge conflict) | Publishing breaks | Fallback: save HTML to storage bucket; serve directly |
| Code generation produces invalid HTML | Landing 404s | Validate HTML on save (JSHint-like); test in headless browser before commit |
| Creators break form integration | Ingestion stops | Form block is immutable (preview-only); can't modify action URL or field names |
| Approval backlog | Publisher delays | Auto-approve if ops trusts center templates; escalate only "custom" designs |

---

## Comparison Table

| Criterion | Option A | Option B | Option C |
|-----------|----------|---------|----------|
| **Time to MVP** | 4–6 weeks | 8 weeks | 10–12 weeks |
| **Dev Weeks** | 3–4 | 5–7 | 7–9 |
| **Per-Creator Cost** | $12–299/mo | $0 | $0 (fixed $300–500/mo) |
| **Total 50-Creator Cost** | $600–14,950/mo | $0 | $300–500/mo |
| **Design Flexibility** | High (no limits) | Medium (block library) | High (Plasmic) |
| **Scalability** | Medium (vendor limits) | High (no limits) | High (library versions) |
| **Ops Control** | Low (external tool) | High (full visibility) | Medium (Plasmic + git) |
| **Vendor Lock-In** | High | None | Medium (Plasmic) |
| **Developer Escape Hatch** | None | HTML fallback | Fork + customize |
| **Brand Consistency** | Low | High | High |
| **Creator Learning Curve** | Low (drag-drop is familiar) | Low (same) | Medium (Plasmic syntax) |

---

## Recommendation Summary

**Go with Option B (Hybrid In-House).**

**Why:**
1. **8-week timeline fits product velocity** (faster than C, less ongoing tax than A)
2. **$0 per-creator cost** (scales to 50 with no new burn)
3. **Full ops control** (fits Afluence's ethos: transparent, data-driven)
4. **HTML fallback preserves developer optionality** (creator friction = dev helps)
5. **Future-proof:** If Plasmic becomes critical later, refactor Phase 2 (use Option C as design system, not core builder)

**Next Steps:**
1. **Week of June 16:** Greenlight (Cristobal + Pablo + Nico alignment call)
2. **Week of June 23:** Hire contractor (or schedule Cris 100% builder)
3. **Week of July 7:** Soft launch with German Roz (landing v1)
4. **Week of July 21:** General availability for all creators

---

## Appendix: File Paths & Key Code References

**Current Monorepo Structure:**
- Landing ingestion: `apps/api/src/core/routes/ingestion.routes.ts`
- Lead form component: `apps/web/src/components/lead-form.tsx`
- Landing config (tracking): `apps/web/src/components/landing-config.tsx`
- Catalog: `packages/catalog/src/types.ts`, `packages/catalog/src/products/`
- Admin modules: `apps/admin/src/lib/modules/registry.ts`
- Email templates: `packages/email/src/templates/`
- Integrations registry: `apps/api/src/core/integrations/registry.ts`

**New Files (Option B):**
- `apps/admin/src/app/[organizer]/[bu]/builder/page.tsx` (landing list)
- `apps/admin/src/components/builder/canvas.tsx` (editor UI)
- `apps/admin/src/lib/builder/code-gen.ts` (HTML generation)
- `apps/admin/src/lib/builder/git-writer.service.ts` (git commit)
- `packages/db/src/migrations/20260701000000_builder_landings.sql` (schema)

---

**Document Version:** 1.0  
**Last Updated:** June 10, 2026  
**Author:** Claude Code (architectural analysis)  
**Status:** Ready for decision
