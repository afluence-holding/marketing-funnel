/**
 * =============================================================================
 * TEMPLATE LANDING PAGE
 * =============================================================================
 *
 * Copy this folder to: (landings)/<org>/<bu>/<slug>/page.tsx
 * Then customize everything below.
 *
 * This template shows ALL available features:
 * - LandingConfig: per-landing pixel initialization
 * - LeadForm: with all field types, hidden fields, custom events, redirect
 * - Metadata: SEO + Open Graph
 *
 * Delete what you don't need. This is a reference, not a minimal example.
 */

import { LeadForm } from '@/components/lead-form';
import { LandingConfig } from '@/components/landing-config';
import type { Metadata } from 'next';

// ---------------------------------------------------------------------------
// 1. SEO + Open Graph metadata
// ---------------------------------------------------------------------------
export const metadata: Metadata = {
  title: 'Your Landing Title',
  description: 'A compelling description for search engines and social cards.',
  openGraph: {
    title: 'Your Landing Title',
    description: 'A compelling description for social sharing.',
    // images: [{ url: '/og/your-landing-image.png', width: 1200, height: 630 }],
  },
};

// ---------------------------------------------------------------------------
// 2. Page component
// ---------------------------------------------------------------------------
export default function TemplateLanding() {
  return (
    <main>
      {/* ----------------------------------------------------------------- */}
      {/* 3. PER-LANDING PIXELS                                             */}
      {/*    These are ADDITIONAL to the org-wide defaults in layout.tsx.    */}
      {/*    Delete if this landing uses only the default pixels.           */}
      {/* ----------------------------------------------------------------- */}
      <LandingConfig
        metaPixelId="REPLACE_WITH_META_PIXEL_ID"
        ga4Id="G-REPLACE_WITH_GA4_ID"
        tiktokPixelId="REPLACE_WITH_TIKTOK_ID"
      />

      {/* ----------------------------------------------------------------- */}
      {/* 4. YOUR LANDING CONTENT                                           */}
      {/*    Paste from Lovable, Claude Code, or build here.                */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <h1>Your Landing Headline</h1>
        <p>Your landing copy goes here.</p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 5. LEAD CAPTURE FORM                                              */}
      {/*    See all props documented below.                                */}
      {/* ----------------------------------------------------------------- */}
      <LeadForm
        // --- REQUIRED ---
        ingestOrgKey="<api-org-key>"
        ingestBuKey="<api-bu-key>"
        source="landing-<org>-<bu>-<slug>"

        // --- STANDARD FIELDS ---
        // Pick which standard fields to show. Default: ['email', 'firstName']
        // Options: 'email' | 'firstName' | 'lastName' | 'phone'
        fields={['firstName', 'email', 'phone']}

        // --- EXTRA FIELDS (arbitrary, per-landing) ---
        // These get sent as customFields to the API.
        // Supported types: text, email, tel, number, url, select, textarea
        extraFields={[
          { name: 'company', placeholder: 'Company name' },
          { name: 'instagram', placeholder: '@handle', required: true },
          { name: 'followers', type: 'number', placeholder: 'Followers count' },
          { name: 'website', type: 'url', placeholder: 'https://...' },
          {
            name: 'role',
            type: 'select',
            placeholder: 'Select your role',
            options: [
              { value: 'creator', label: 'Creator' },
              { value: 'brand', label: 'Brand / Company' },
              { value: 'agency', label: 'Agency' },
              { value: 'other', label: 'Other' },
            ],
          },
          { name: 'message', type: 'textarea', placeholder: 'Tell us about your project' },
        ]}

        // --- HIDDEN FIELDS ---
        // Invisible data sent as customFields. Good for tracking.
        hiddenFields={{
          landing_version: 'v1',
          campaign: 'launch-2026',
          ab_variant: 'a',
        }}

        // --- CONVERSION EVENT ---
        // Which Meta/GA4/TikTok event fires on success.
        // Default: { event: 'Lead' }
        // Standard Meta events: Lead, Purchase, CompleteRegistration, Subscribe,
        //   Contact, StartTrial, SubmitApplication, Schedule, ViewContent, etc.
        conversion={{
          event: 'Lead',
          data: { value: 0, currency: 'USD', content_name: 'your-landing' },
          // pixelId: '123456789',  // ← uncomment to fire ONLY to this pixel
        }}

        // --- SUCCESS BEHAVIOR ---
        // Option A: show inline message (default)
        successMessage="Thanks! We'll reach out soon."
        // Option B: redirect to a URL after submission
        // onSuccessRedirect="/thank-you"
        // Option C: redirect to WhatsApp
        // onSuccessRedirect="https://wa.me/56912345678?text=Hi%20I%20signed%20up"

        // --- LABELS ---
        submitLabel="Get Started"

        // --- API ---
        // apiUrl="https://api.yourdomain.com"  // override if needed
      />
    </main>
  );
}
