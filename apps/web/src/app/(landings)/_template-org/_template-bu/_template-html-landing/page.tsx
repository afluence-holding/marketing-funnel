/**
 * =============================================================================
 * TEMPLATE: HTML LANDING (from Lovable, Webflow, Framer export, etc.)
 * =============================================================================
 *
 * Use this when you receive a full HTML page from an external tool.
 *
 * Two approaches:
 *   A) Inline the HTML as a string (simpler, shown here)
 *   B) Import an .html file (requires ?raw query — see comment below)
 *
 * The <LandingConfig> and tracking from layout.tsx still wrap this page,
 * so pixels fire normally.
 *
 * For the LeadForm, you have two choices:
 *   1. Use the React <LeadForm> component alongside the HTML
 *   2. Keep the form inside the HTML and POST to the API from vanilla JS
 */

import { HtmlLanding } from '@/components/html-landing';
import { LeadForm } from '@/components/lead-form';
import { LandingConfig } from '@/components/landing-config';

// Option B: import from file (uncomment)
// import html from './landing.html?raw';

const html = `
<div style="text-align:center; padding:4rem 2rem; font-family:system-ui, sans-serif;">
  <h1 style="font-size:2.5rem; font-weight:800;">Your Exported Landing</h1>
  <p style="font-size:1.2rem; color:#666; max-width:500px; margin:1rem auto;">
    This HTML was pasted from Lovable / Webflow / any tool.
  </p>
</div>
`;

export default function TemplateHtmlLanding() {
  return (
    <main>
      <LandingConfig metaPixelId="REPLACE" />

      {/* The exported HTML content */}
      <HtmlLanding html={html} />

      {/* React LeadForm below the HTML content */}
      <div style={{ maxWidth: 400, margin: '2rem auto', padding: '0 1rem' }}>
        <LeadForm
          source="landing-template-html"
          fields={['firstName', 'email']}
          submitLabel="Join Now"
        />
      </div>
    </main>
  );
}
