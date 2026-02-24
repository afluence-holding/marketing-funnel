# apps/web — Landing Pages

Next.js app that hosts all landing pages for every org/BU. Tracking (pixels, analytics, heatmaps) is automatic.

## Folder Structure

```
apps/web/src/
  app/
    layout.tsx                              Root layout (GTM noscript)
    page.tsx                                Home placeholder
    (landings)/                             Route group — no URL segment
      layout.tsx                            Injects: GTM, Meta Pixel, GA4, Clarity, TikTok
      _template-org/                        Copy-paste template (prefixed with _)
        _template-bu/
          _template-landing/page.tsx        React landing reference
          _template-html-landing/page.tsx   HTML landing reference
      afluence/                             Org
        faktory-creators/                   BU
          v1/page.tsx                       Landing v1
          v2/page.tsx                       A/B variant
        faktory-companies/
          launch/page.tsx
  components/
    tracking/
      gtm.tsx                               Google Tag Manager
      meta-pixel.tsx                        Meta Pixel (SDK + init, supports multiple IDs)
      google-analytics.tsx                  GA4 gtag.js
      clarity.tsx                           Microsoft Clarity
      tiktok-pixel.tsx                      TikTok Pixel
    landing-config.tsx                      Per-landing pixel configuration
    lead-form.tsx                           Lead capture form -> POST /api/ingest
    html-landing.tsx                        Wrapper for raw HTML landings
  lib/
    tracking/
      events.ts                             trackEvent(), trackEventForPixel(), trackCustomEvent()
      use-utm.ts                            useUtm() hook — captures UTM params from URL
    config/
      pixels.ts                             Pixel IDs per org/BU from env vars
```

## URL Scheme

Landings live at subpaths: `yourdomain.com/<org>/<bu>/<slug>`

The `(landings)` folder is a Next.js route group — it doesn't add a URL segment. So:

```
File:  app/(landings)/afluence/faktory-creators/v1/page.tsx
URL:   yourdomain.com/afluence/faktory-creators/v1
```

---

## How to Add a New Landing

### Step 1: Create the folder

```
app/(landings)/<org>/<bu>/<slug>/page.tsx
```

### Step 2: Paste your content

**React landing** (from Lovable, Claude Code, or built here):

```tsx
import { LeadForm } from '@/components/lead-form';
import { LandingConfig } from '@/components/landing-config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Title',
  description: 'Your description',
};

export default function MyLanding() {
  return (
    <main>
      <LandingConfig metaPixelId="123456789" />

      {/* Your landing content here */}

      <LeadForm
        source="landing-org-bu-slug"
        fields={['firstName', 'email', 'phone']}
        submitLabel="Join Now"
      />
    </main>
  );
}
```

**HTML landing** (exported from Webflow, Framer, etc.):

```tsx
import { HtmlLanding } from '@/components/html-landing';
import { LeadForm } from '@/components/lead-form';

const html = `<div>...your pasted HTML...</div>`;

export default function MyLanding() {
  return (
    <main>
      <HtmlLanding html={html} />
      <LeadForm source="landing-org-bu-slug" fields={['email']} />
    </main>
  );
}
```

### Step 3: Done

Tracking is automatic from the layout. Deploy and the landing is live.

---

## Components Reference

### `<LandingConfig>`

Declares per-landing pixel IDs. Place at the top of any landing page.

```tsx
<LandingConfig
  metaPixelId="123456789"        // BU-specific Meta Pixel
  ga4Id="G-XXXXXXXXXX"           // BU-specific GA4 property
  tiktokPixelId="XXXXXXXXXX"     // BU-specific TikTok Pixel
/>
```

These are **additional** to the org-wide defaults loaded by the layout. If you only use the defaults, you don't need this component.

### `<LeadForm>`

Lead capture form that POSTs to the API and fires conversion events.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | string | *required* | Landing identifier, e.g. `"landing-faktory-v1"` |
| `fields` | array | `['email','firstName']` | Standard fields to show: `email`, `firstName`, `lastName`, `phone` |
| `extraFields` | ExtraField[] | `[]` | Arbitrary custom inputs (see below) |
| `hiddenFields` | Record | - | Invisible key-value pairs sent as `customFields` |
| `conversion` | ConversionConfig | `{event:'Lead'}` | Which pixel event to fire on success |
| `onSuccessRedirect` | string | - | URL to redirect after success (thank-you page, WhatsApp link) |
| `onSuccess` | function | - | Callback after success (before redirect) |
| `submitLabel` | string | `"Submit"` | Button text |
| `successMessage` | string | `"Thanks!..."` | Inline success text (when no redirect) |
| `apiUrl` | string | env var | API base URL override |
| `className` | string | - | CSS class for the form |
| `style` | CSSProperties | - | Inline styles for the form |

#### Extra Fields

```tsx
extraFields={[
  { name: 'company', placeholder: 'Company name' },
  { name: 'instagram', placeholder: '@handle', required: true },
  { name: 'followers', type: 'number', placeholder: 'How many?' },
  { name: 'website', type: 'url', placeholder: 'https://...' },
  {
    name: 'role',
    type: 'select',
    options: [
      { value: 'creator', label: 'Creator' },
      { value: 'brand', label: 'Brand' },
    ],
  },
  { name: 'notes', type: 'textarea', placeholder: 'Tell us more' },
]}
```

Supported types: `text`, `email`, `tel`, `number`, `url`, `select`, `textarea`.

#### Conversion Events

```tsx
// Default: fires 'Lead' to ALL initialized pixels
conversion={{ event: 'Lead' }}

// Custom event with data
conversion={{ event: 'CompleteRegistration', data: { value: 0, currency: 'USD' } }}

// Fire ONLY to a specific Meta Pixel (not all)
conversion={{ event: 'Lead', pixelId: '123456789' }}
```

Standard Meta events: `Lead`, `Purchase`, `CompleteRegistration`, `Subscribe`, `Contact`, `StartTrial`, `SubmitApplication`, `Schedule`, `ViewContent`, `AddToCart`, `InitiateCheckout`.

#### Success Redirect

```tsx
// Redirect to thank-you page
onSuccessRedirect="/thank-you"

// Redirect to WhatsApp
onSuccessRedirect="https://wa.me/56912345678?text=Hi%20I%20just%20signed%20up"

// Custom callback
onSuccess={() => console.log('Lead captured!')}
```

### `<HtmlLanding>`

Renders raw HTML via `dangerouslySetInnerHTML`. Only use with trusted content.

```tsx
import { HtmlLanding } from '@/components/html-landing';
const html = `<div>...</div>`;
<HtmlLanding html={html} />
```

---

## Tracking

### What Loads Automatically (layout)

Every landing under `(landings)/` gets these for free:

| Tool | Purpose | Cost |
|------|---------|------|
| Google Tag Manager | Container for all tags | Free |
| Meta Pixel | Facebook/Instagram ad tracking | Free |
| Google Analytics 4 | Traffic + behavior analysis | Free |
| Microsoft Clarity | Heatmaps + session recordings | Free |
| TikTok Pixel | TikTok ad tracking | Free |

### Per-Landing Pixels

Use `<LandingConfig>` to add BU-specific pixels (different ad accounts, different creators, etc.). Multiple Meta Pixels can coexist — events fire to ALL initialized pixels by default.

### Firing Events Manually

```tsx
import { trackEvent, trackCustomEvent, trackEventForPixel } from '@/lib/tracking/events';

// Standard event (fires to ALL pixels: Meta + GA4 + TikTok)
trackEvent('Lead');
trackEvent('Purchase', { value: 99.99, currency: 'USD' });

// Custom event
trackCustomEvent('ClickedWhatsApp', { landing: 'v2' });

// Target a specific Meta Pixel only
trackEventForPixel('123456789', 'Lead', { content_name: 'landing-v1' });
```

### UTM Capture

The `LeadForm` auto-captures UTM params from the URL and sends them to the API.

```
yourdomain.com/afluence/faktory-creators/v1?utm_source=facebook&utm_medium=cpc&utm_campaign=launch
```

These are stored in the API as `utmData` on the lead record.

### A/B Testing

Folder-based: create `v1/` and `v2/` under the same BU. Use different UTM `utm_content=v1` vs `utm_content=v2` to compare in GA4.

---

## Environment Variables

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Org-wide (loaded in layout for all landings)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX
NEXT_PUBLIC_CLARITY_ID=xxxxxxxxxx
NEXT_PUBLIC_META_PIXEL_DEFAULT=123456789
NEXT_PUBLIC_GA4_DEFAULT=G-XXXXXXXXXX
NEXT_PUBLIC_TIKTOK_PIXEL_DEFAULT=XXXXXXXXXX

# Per-BU pixels (used by LandingConfig or directly in env)
NEXT_PUBLIC_META_PIXEL_AFLUENCE_FAKTORY_CREATORS=123456789
NEXT_PUBLIC_GA4_AFLUENCE_FAKTORY_CREATORS=G-XXXXXXXXXX
NEXT_PUBLIC_TIKTOK_AFLUENCE_FAKTORY_CREATORS=XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_AFLUENCE_FAKTORY_COMPANIES=987654321
NEXT_PUBLIC_GA4_AFLUENCE_FAKTORY_COMPANIES=G-YYYYYYYYYY
NEXT_PUBLIC_TIKTOK_AFLUENCE_FAKTORY_COMPANIES=YYYYYYYYYY
```

All tracking scripts gracefully skip when their env var is not set. Nothing breaks during development.

---

## Scripts

```bash
npm run dev -w @marketing-funnel/web    # Dev server on port 3001
npm run build -w @marketing-funnel/web  # Production build
npm run typecheck -w @marketing-funnel/web
```
