'use client';

import { type FormEvent, useState, Suspense } from 'react';
import { useUtm, type UtmParams } from '@/lib/tracking/use-utm';
import { trackEvent } from '@/lib/tracking/events';

interface LeadFormProps {
  /** Landing source identifier, e.g. "landing-faktory-creators-v1" */
  source: string;
  /** API base URL. Defaults to NEXT_PUBLIC_API_URL env var. */
  apiUrl?: string;
  /** Extra custom fields to send alongside the form data. */
  customFields?: Record<string, string>;
  /** Fields to show in the form. Defaults to email + firstName. */
  fields?: ('email' | 'firstName' | 'lastName' | 'phone')[];
  /** Submit button text. */
  submitLabel?: string;
  /** Text shown after successful submission. */
  successMessage?: string;
  /** Additional class name for the form wrapper. */
  className?: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const DEFAULT_FIELDS: LeadFormProps['fields'] = ['email', 'firstName'];
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Inner component that uses useUtm (requires Suspense boundary for useSearchParams).
 */
function LeadFormInner({
  source,
  apiUrl = API_URL,
  customFields,
  fields = DEFAULT_FIELDS,
  submitLabel = 'Submit',
  successMessage = 'Thanks! We\'ll be in touch.',
  className,
}: LeadFormProps) {
  const utm = useUtm();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {
      source,
      channel: 'inbound',
    };

    for (const field of fields!) {
      const value = formData.get(field);
      if (value) body[field] = value;
    }

    const utmData = buildUtmData(utm);
    if (Object.keys(utmData).length > 0) body.utmData = utmData;
    if (customFields && Object.keys(customFields).length > 0) {
      body.customFields = customFields;
    }

    try {
      const res = await fetch(`${apiUrl}/api/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `Request failed (${res.status})`);
      }

      setStatus('success');
      trackEvent('Lead', { content_name: source });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'success') {
    return (
      <div className={className} role="status">
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#16a34a' }}>
          {successMessage}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {fields!.includes('firstName') && (
        <input
          name="firstName"
          type="text"
          placeholder="First name"
          required
          style={inputStyle}
        />
      )}
      {fields!.includes('lastName') && (
        <input
          name="lastName"
          type="text"
          placeholder="Last name"
          style={inputStyle}
        />
      )}
      {fields!.includes('email') && (
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          style={inputStyle}
        />
      )}
      {fields!.includes('phone') && (
        <input
          name="phone"
          type="tel"
          placeholder="Phone"
          style={inputStyle}
        />
      )}

      <button type="submit" disabled={status === 'loading'} style={buttonStyle}>
        {status === 'loading' ? 'Sending...' : submitLabel}
      </button>

      {status === 'error' && (
        <p role="alert" style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>
          {errorMsg}
        </p>
      )}
    </form>
  );
}

/**
 * Reusable lead capture form.
 *
 * - Auto-captures UTM params from the URL
 * - POSTs to the API's /api/ingest endpoint
 * - Fires Meta Pixel + GA4 conversion events on success
 * - Configurable fields, labels, and custom fields
 *
 * Wrapped in Suspense because useSearchParams requires it in Next.js App Router.
 */
export function LeadForm(props: LeadFormProps) {
  return (
    <Suspense fallback={<div style={{ minHeight: 200 }} />}>
      <LeadFormInner {...props} />
    </Suspense>
  );
}

function buildUtmData(utm: UtmParams): Record<string, string> {
  const data: Record<string, string> = {};
  if (utm.utm_source) data.utm_source = utm.utm_source;
  if (utm.utm_medium) data.utm_medium = utm.utm_medium;
  if (utm.utm_campaign) data.utm_campaign = utm.utm_campaign;
  if (utm.utm_content) data.utm_content = utm.utm_content;
  if (utm.utm_term) data.utm_term = utm.utm_term;
  return data;
}

const inputStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #d1d5db',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: '0.5rem',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
  width: '100%',
};
