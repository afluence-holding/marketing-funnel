'use client';

import { type FormEvent, Suspense, useState } from 'react';
import Image from 'next/image';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useUtm, type UtmParams } from '@/lib/tracking/use-utm';
import { trackEvent } from '@/lib/tracking/events';
import { normalizePhoneAndGetTimezone } from '@/lib/utils/phone';
import { GERMAN_WEBINAR } from './webinar-config';
import { webinarStyles } from './webinar-styles';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const CALENDAR_URL =
  `https://calendar.google.com/calendar/render?action=TEMPLATE` +
  `&text=${encodeURIComponent(GERMAN_WEBINAR.calendarTitle)}` +
  `&dates=${GERMAN_WEBINAR.calendarDates}` +
  `&details=${encodeURIComponent(GERMAN_WEBINAR.calendarDetails)}` +
  '&location=Online';

function WebinarRegistrationInner() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+51 ');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const utm = useUtm();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    const name = firstName.trim();
    const emailVal = email.trim();
    if (!name) {
      setErrorMsg('Ingresa tu nombre');
      return;
    }
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setErrorMsg('Ingresa un correo válido');
      return;
    }

    const normalizedPhone = normalizePhoneAndGetTimezone(phone);
    if (!normalizedPhone) {
      setErrorMsg('Ingresa un WhatsApp válido con código de país');
      return;
    }

    setLoading(true);

    const eventId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : String(Date.now());
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');
    const metaTracking: Record<string, string> = { eventId };
    if (fbp) metaTracking.fbp = fbp;
    if (fbc) metaTracking.fbc = fbc;

    const utmData = buildUtmData(utm);

    const body: Record<string, unknown> = {
      firstName: name,
      email: emailVal,
      phone: normalizedPhone.phone,
      source: GERMAN_WEBINAR.source,
      channel: 'inbound',
      customFields: {
        creator: 'german-roz',
        interest: 'desinflamate-21',
        event_type: 'webinar',
        webinar_date: GERMAN_WEBINAR.dateIso,
        webinar_time: GERMAN_WEBINAR.time,
        webinar_timezone: GERMAN_WEBINAR.timezone,
      },
      tracking: { meta: metaTracking },
    };
    if (Object.keys(utmData).length > 0) body.utmData = utmData;

    try {
      const res = await fetch(`${API_URL}/api/orgs/german-roz/bus/main/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
          error?: string;
          details?: Record<string, string[]>;
        };
        const detailMsg = data.details
          ? Object.values(data.details).flat().find(Boolean)
          : undefined;
        throw new Error(
          data.message ??
            detailMsg ??
            data.error ??
            `Request failed (${res.status})`,
        );
      }
      trackEvent(
        'CompleteRegistration',
        { content_name: GERMAN_WEBINAR.source },
        { eventId },
      );
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Algo salió mal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{webinarStyles}</style>

      <header className="di-header">
        <a href="#top" className="di-lockup" aria-label="DESINFLAMATE Germán Roz">
          <span className="di-lockup-mark">DESINFLÁMATE!</span>
          <span className="di-lockup-sub">con Germán Roz</span>
        </a>
        <a href="#registro" className="di-nav-cta">
          Apuntarme
        </a>
      </header>

      <main id="top" className="di-main">
        <section className="di-hero" aria-labelledby="hero-title">
          <div className="di-hero-row">
            <div className="di-hero-photo">
              <Image
                src="/german-roz/german-avatar.jpg"
                alt="Germán Roz, chef y nutricionista"
                fill
                priority
                sizes="(max-width: 720px) 72vw, 320px"
                className="di-hero-photo-img"
              />
            </div>

            <div className="di-hero-copy">
            <span className="di-pill">
              <span className="di-pill-dot" aria-hidden />
              Masterclass en vivo · {GERMAN_WEBINAR.dateShort} · Gratis
            </span>

            <h1 id="hero-title" className="di-hero-title">
              Nutrición sin dietas.{' '}
              <span className="di-accent">Cocina sin complicaciones.</span>
            </h1>

            <p className="di-hero-sub">
              Una masterclass en vivo conmigo. Te voy a contar cómo entiendo yo la comida,
              qué inflama y qué no de lo que comes todos los días, y vamos a cocinar juntos
              un par de recetas reales — de las que sí se hacen en tu cocina.
            </p>

            <ul className="di-hero-bullets">
              <li>
                {GERMAN_WEBINAR.dateShort} · {GERMAN_WEBINAR.timeLabel}
              </li>
              <li>1 hora · 100% en vivo</li>
              <li>Preguntas conmigo al final</li>
            </ul>
            </div>
          </div>

          <dl className="di-event-bar" aria-label="Detalles del evento">
            <div>
              <dt>Fecha</dt>
              <dd>{GERMAN_WEBINAR.dateShort}</dd>
            </div>
            <div>
              <dt>Hora</dt>
              <dd>{GERMAN_WEBINAR.timeLabel}</dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>~60 minutos</dd>
            </div>
            <div>
              <dt>Costo</dt>
              <dd>Gratis · cupos limitados</dd>
            </div>
          </dl>

          <div id="registro" className="di-form-card">
              {!submitted ? (
                <>
                  <div className="di-form-header">
                    <span className="di-form-eyebrow">
                      Masterclass · {GERMAN_WEBINAR.dateShort.replace('Mié ', '')}
                    </span>
                    <h2 className="di-form-title">Apúntate a la clase en vivo</h2>
                  </div>
                  <form className="di-form" onSubmit={handleSubmit} noValidate>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                      autoComplete="given-name"
                      required
                    />
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoComplete="email"
                      required
                    />
                    <PhoneInput
                      className="lead-form-phone"
                      defaultCountry="pe"
                      value={phone}
                      onChange={setPhone}
                      disabled={loading}
                      preferredCountries={['pe', 'mx', 'co', 'cl', 'ar', 'es']}
                      placeholder="WhatsApp con código de país"
                      inputClassName="react-international-phone-input"
                    />
                    <button type="submit" disabled={loading}>
                      {loading ? 'Enviando…' : 'Apúntame a la masterclass →'}
                    </button>
                    {errorMsg && <p className="di-form-error">{errorMsg}</p>}
                  </form>
                  <p className="di-form-disclaimer">
                    Te mandamos el link de la clase al correo y un recordatorio por
                    WhatsApp el día del evento. Cero spam, baja con un click.
                  </p>
                </>
              ) : (
                <div className="di-form-success" role="status">
                  <div className="di-form-success-icon" aria-hidden>
                    ✓
                  </div>
                  <h2 className="di-form-success-title">
                    ¡Gracias{firstName.trim() ? `, ${firstName.trim()}` : ''}!
                  </h2>
                  <p className="di-form-success-sub">
                    Te enviamos el link de la masterclass al correo y un recordatorio por
                    WhatsApp el <strong>{GERMAN_WEBINAR.dateShort}</strong> (
                    {GERMAN_WEBINAR.timeLabel}).
                  </p>
                  <a
                    className="di-btn-calendar"
                    href={CALENDAR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Agregar al calendario
                  </a>
                </div>
              )}
          </div>
        </section>
      </main>
    </>
  );
}

export function WebinarRegistration() {
  return (
    <Suspense fallback={null}>
      <WebinarRegistrationInner />
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

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match?.[1];
}
