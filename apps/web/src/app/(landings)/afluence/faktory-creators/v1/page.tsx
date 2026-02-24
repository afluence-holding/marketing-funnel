import { LeadForm } from '@/components/lead-form';
import { LandingConfig } from '@/components/landing-config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Faktory — Build Faster with AI',
  description: 'AI-powered tools for creators. Join the waitlist.',
  openGraph: {
    title: 'AI Faktory — Build Faster with AI',
    description: 'AI-powered tools for creators. Join the waitlist.',
  },
};

export default function FaktoryCreatorsV1() {
  return (
    <main style={mainStyle}>
      {/* BU-specific pixels — different ad account for creators */}
      <LandingConfig
        metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_AFLUENCE_FAKTORY_CREATORS}
        ga4Id={process.env.NEXT_PUBLIC_GA4_AFLUENCE_FAKTORY_CREATORS}
        tiktokPixelId={process.env.NEXT_PUBLIC_TIKTOK_AFLUENCE_FAKTORY_CREATORS}
      />

      <section style={heroStyle}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
          Build Faster with AI
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', maxWidth: 480, margin: '1rem auto 0' }}>
          AI Faktory gives creators the tools to launch apps, automations, and digital
          products — without writing a single line of code.
        </p>
      </section>

      <section style={formSectionStyle}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem' }}>
          Join the waitlist
        </h2>
        <LeadForm
          source="landing-faktory-creators-v1"
          fields={['firstName', 'email', 'phone']}
          extraFields={[
            {
              name: 'instagram',
              placeholder: '@your_handle',
              required: true,
            },
            {
              name: 'content_type',
              type: 'select',
              placeholder: 'What do you create?',
              options: [
                { value: 'video', label: 'Video content' },
                { value: 'courses', label: 'Courses / Education' },
                { value: 'saas', label: 'Apps / SaaS' },
                { value: 'other', label: 'Other' },
              ],
            },
          ]}
          hiddenFields={{ landing_version: 'v1', campaign: 'creators-launch' }}
          conversion={{ event: 'Lead', data: { content_name: 'faktory-creators-v1' } }}
          submitLabel="Get Early Access"
          successMessage="You're in! We'll reach out soon."
        />
      </section>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  textAlign: 'center',
};

const heroStyle: React.CSSProperties = {
  maxWidth: 600,
  marginBottom: '2rem',
};

const formSectionStyle: React.CSSProperties = {
  maxWidth: 400,
  width: '100%',
  padding: '2rem',
  borderRadius: '1rem',
  border: '1px solid #e5e7eb',
  backgroundColor: '#fafafa',
};
