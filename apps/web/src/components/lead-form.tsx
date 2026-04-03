'use client';

import { type FormEvent, useState, Suspense } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useUtm, type UtmParams } from '@/lib/tracking/use-utm';
import { trackEvent, trackEventForPixel, type TrackEventOptions } from '@/lib/tracking/events';
import { normalizePhoneAndGetTimezone } from '@/lib/utils/phone';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A custom input field definition. Rendered in order. */
export interface ExtraField {
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'url' | 'select' | 'textarea';
  placeholder?: string;
  label?: string;
  required?: boolean;
  /** Only for type='select' */
  options?: { value: string; label: string }[];
}

export interface ConversionConfig {
  /** Meta Pixel standard event name. Default: 'Lead' */
  event?: string;
  /** Extra data to send with the event. */
  data?: TrackEventOptions;
  /**
   * If set, fires only to this specific Meta Pixel ID (trackSingle).
   * If omitted, fires to ALL initialized pixels.
   */
  pixelId?: string;
}

export interface LeadFormProps {
  /** API org key from `apps/api/src/orgs/<org>/...` */
  ingestOrgKey: string;
  /** API BU key from `apps/api/src/orgs/<org>/<bu>/...` */
  ingestBuKey: string;
  /** Landing source identifier, e.g. "landing-faktory-creators-v1" */
  source: string;
  /** API base URL. Defaults to NEXT_PUBLIC_API_URL env var. */
  apiUrl?: string;
  /**
   * Standard fields to show. Default: ['email', 'firstName'].
   * Set to [] to show ONLY extraFields.
   */
  fields?: ('email' | 'firstName' | 'lastName' | 'phone')[];
  /**
   * Arbitrary extra inputs. Each rendered as an input with its config.
   * Values are sent as `customFields` to the API.
   *
   * @example
   *   extraFields={[
   *     { name: 'instagram', placeholder: '@handle', required: true },
   *     { name: 'followers', type: 'number', placeholder: 'Followers' },
   *     { name: 'role', type: 'select', options: [
   *       { value: 'creator', label: 'Creator' },
   *       { value: 'brand', label: 'Brand' },
   *     ]},
   *   ]}
   */
  extraFields?: ExtraField[];
  /**
   * Hidden key-value pairs sent as `customFields`. Not visible to the user.
   * Useful for landing version, campaign ID, internal tags, etc.
   *
   * @example hiddenFields={{ landing_version: 'v2', campaign: 'black-friday' }}
   */
  hiddenFields?: Record<string, string>;
  /**
   * Conversion event config. Controls which pixel event fires on success.
   * Default: { event: 'Lead' } which fires to all initialized pixels.
   *
   * @example
   *   conversion={{ event: 'CompleteRegistration', data: { value: 0, currency: 'USD' } }}
   *   conversion={{ event: 'Lead', pixelId: '123456789' }}
   */
  conversion?: ConversionConfig;
  /**
   * URL to redirect to after successful submission.
   * If omitted, shows the successMessage inline.
   *
   * @example onSuccessRedirect="/thank-you"
   * @example onSuccessRedirect="https://wa.me/56912345678?text=Hi"
   */
  onSuccessRedirect?: string;
  /** Callback fired after successful submission (before redirect). */
  onSuccess?: () => void;
  /** Submit button text. */
  submitLabel?: string;
  /** Text shown after successful submission (when no redirect). */
  successMessage?: string;
  /** Override placeholder text for standard fields. */
  placeholders?: Partial<Record<'firstName' | 'lastName' | 'email' | 'phone', string>>;
  /** Default values for standard fields (e.g. phone country code). */
  defaultValues?: Partial<Record<'firstName' | 'lastName' | 'email' | 'phone', string>>;
  /** Default country for phone input (ISO2, e.g. "pe" for Peru). Inferred from defaultValues.phone when "+51" etc. */
  defaultCountry?: string;
  /** Loading button text. Default: "Sending..." */
  loadingLabel?: string;
  /** Additional class name for the form wrapper. */
  className?: string;
  /** Override inline styles on the form. */
  style?: React.CSSProperties;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const DEFAULT_FIELDS: LeadFormProps['fields'] = ['email', 'firstName'];
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Inner form (uses hooks that require Suspense)
// ---------------------------------------------------------------------------

function LeadFormInner({
  ingestOrgKey,
  ingestBuKey,
  source,
  apiUrl = API_URL,
  fields = DEFAULT_FIELDS,
  extraFields = [],
  hiddenFields,
  conversion,
  onSuccessRedirect,
  onSuccess,
  submitLabel = 'Submit',
  loadingLabel = 'Sending...',
  successMessage = "Thanks! We'll be in touch.",
  placeholders,
  defaultValues,
  defaultCountry,
  className,
  style,
}: LeadFormProps) {
  const utm = useUtm();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [phone, setPhone] = useState(defaultValues?.phone ?? '');

  const phoneCountry = defaultCountry ?? inferCountryFromPhone(defaultValues?.phone);

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
      const val = formData.get(field);
      if (val) body[field] = val;
    }

    const rawPhone = typeof body.phone === 'string' ? body.phone : undefined;
    if (rawPhone) {
      const normalizedPhone = normalizePhoneAndGetTimezone(rawPhone);
      if (!normalizedPhone) {
        throw new Error('Please enter a valid WhatsApp phone number');
      }
      body.phone = normalizedPhone.phone;
    }

    // Build customFields from extraFields inputs + hiddenFields
    const custom: Record<string, string> = { ...(hiddenFields ?? {}) };
    for (const ef of extraFields) {
      const val = formData.get(ef.name);
      if (val) custom[ef.name] = String(val);
    }
    if (Object.keys(custom).length > 0) body.customFields = custom;

    const utmData = buildUtmData(utm);
    if (Object.keys(utmData).length > 0) body.utmData = utmData;

    // Build tracking metadata for CAPI deduplication
    const eventId = crypto.randomUUID();
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');
    const metaTracking: Record<string, string> = { eventId };
    if (fbp) metaTracking.fbp = fbp;
    if (fbc) metaTracking.fbc = fbc;
    body.tracking = { meta: metaTracking };

    try {
      const res = await fetch(
        `${apiUrl}/api/orgs/${encodeURIComponent(ingestOrgKey)}/bus/${encodeURIComponent(ingestBuKey)}/ingest`,
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `Request failed (${res.status})`);
      }

      // Fire conversion events (eventId matches CAPI for dedup)
      const eventName = conversion?.event ?? 'Lead';
      const eventData: TrackEventOptions = {
        content_name: source,
        ...(conversion?.data ?? {}),
      };
      if (conversion?.pixelId) {
        trackEventForPixel(conversion.pixelId, eventName, eventData, { eventId });
      } else {
        trackEvent(eventName, eventData, { eventId });
      }

      onSuccess?.();
      setStatus('success');

      if (onSuccessRedirect) {
        window.location.href = onSuccessRedirect;
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'success' && !onSuccessRedirect) {
    return (
      <div className={className} role="status">
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#16a34a' }}>
          {successMessage}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', ...style }}
    >
      {/* Standard fields */}
      {fields!.includes('firstName') && (
        <input name="firstName" type="text" placeholder={placeholders?.firstName ?? 'First name'} defaultValue={defaultValues?.firstName} required style={inputStyle} />
      )}
      {fields!.includes('lastName') && (
        <input name="lastName" type="text" placeholder={placeholders?.lastName ?? 'Last name'} defaultValue={defaultValues?.lastName} style={inputStyle} />
      )}
      {fields!.includes('email') && (
        <input name="email" type="email" placeholder={placeholders?.email ?? 'Email'} defaultValue={defaultValues?.email} required style={inputStyle} />
      )}
      {fields!.includes('phone') && (
        <PhoneInput
          defaultCountry={phoneCountry as 'pe'}
          value={phone}
          onChange={(p) => setPhone(p)}
          name="phone"
          placeholder={placeholders?.phone ?? 'Phone'}
          preferredCountries={['pe', 'mx', 'co', 'ar', 'cl', 'ec']}
          className="lead-form-phone"
          inputStyle={inputStyle}
        />
      )}

      {/* Extra fields — arbitrary per-landing */}
      {extraFields.map((ef) => {
        if (ef.type === 'select' && ef.options) {
          return (
            <select key={ef.name} name={ef.name} required={ef.required} style={inputStyle}>
              <option value="">{ef.placeholder ?? ef.label ?? ef.name}</option>
              {ef.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          );
        }
        if (ef.type === 'textarea') {
          return (
            <textarea
              key={ef.name}
              name={ef.name}
              placeholder={ef.placeholder ?? ef.label ?? ef.name}
              required={ef.required}
              rows={3}
              style={inputStyle}
            />
          );
        }
        return (
          <input
            key={ef.name}
            name={ef.name}
            type={ef.type ?? 'text'}
            placeholder={ef.placeholder ?? ef.label ?? ef.name}
            required={ef.required}
            style={inputStyle}
          />
        );
      })}

      <button type="submit" disabled={status === 'loading'} style={buttonStyle}>
        {status === 'loading' ? loadingLabel : submitLabel}
      </button>

      {status === 'error' && (
        <p role="alert" style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>
          {errorMsg}
        </p>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Public component (wraps inner in Suspense for useSearchParams)
// ---------------------------------------------------------------------------

/**
 * Reusable lead capture form.
 *
 * Features:
 * - Standard fields (email, firstName, lastName, phone) — pick which to show
 * - Extra fields (arbitrary inputs per landing — select, textarea, number, etc.)
 * - Hidden fields (invisible data sent as customFields)
 * - UTM auto-capture from URL
 * - Configurable conversion events (which Meta/GA4/TikTok event to fire, with what data)
 * - Per-pixel targeting (fire to a specific pixel ID, not all)
 * - Success redirect (e.g. to a thank-you page or WhatsApp link)
 * - POSTs to the API's tenant-scoped ingestion endpoint
 */
export function LeadForm(props: LeadFormProps) {
  return (
    <Suspense fallback={<div style={{ minHeight: 200 }} />}>
      <LeadFormInner {...props} />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildUtmData(utm: UtmParams): Record<string, string> {
  const data: Record<string, string> = {};
  if (utm.utm_source) data.utm_source = utm.utm_source;
  if (utm.utm_medium) data.utm_medium = utm.utm_medium;
  if (utm.utm_campaign) data.utm_campaign = utm.utm_campaign;
  if (utm.utm_content) data.utm_content = utm.utm_content;
  if (utm.utm_term) data.utm_term = utm.utm_term;
  return data;
}

/** Infer ISO2 country from default phone value (e.g. "+51 " → "pe"). */
function inferCountryFromPhone(phone?: string): string {
  if (!phone) return 'pe';
  const dial = phone.replace(/\D/g, '').slice(0, 3);
  const map: Record<string, string> = {
    '51': 'pe',
    '52': 'mx',
    '54': 'ar',
    '55': 'br',
    '56': 'cl',
    '57': 'co',
    '58': 've',
    '593': 'ec',
    '598': 'uy',
  };
  for (const len of [3, 2, 1]) {
    const code = dial.slice(0, len);
    if (map[code]) return map[code];
  }
  return 'pe';
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match?.[1];
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
