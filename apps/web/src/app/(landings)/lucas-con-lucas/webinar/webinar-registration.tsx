'use client';

import { type FormEvent, Suspense, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import logoLucas from '../pre-launch-form/logo-lucas.png';
import { useUtm, type UtmParams } from '@/lib/tracking/use-utm';
import { trackEvent } from '@/lib/tracking/events';
import { normalizePhoneAndGetTimezone } from '@/lib/utils/phone';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const INGEST_SOURCE = 'landing-lucas-con-lucas-webinar-2026-06-04';

const WHATSAPP_GROUP_URL =
  'https://chat.whatsapp.com/FrS6wqhSWM2HdepEdajz92?mode=gi_t';

/** Webinar: 4 jun 2026, 19:00 America/Santiago (UTC-4 → 23:00 UTC) */
const CALENDAR_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Webinar+Lucas+con+Luca%24&dates=20260604T230000Z/20260604T240000Z&details=Webinar+gratuito+de+inversi%C3%B3n+inmobiliaria+en+Chile.&location=Online';

type Particle = {
  x: number;
  y: number;
  r: number;
  speed: number;
  alpha: number;
  flicker: number;
  flickerSpeed: number;
};

function WebinarRegistrationInner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+56 ');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const utm = useUtm();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    let raf = 0;
    let particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function genParticles() {
      if (!canvas) return;
      particles = [];
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.85,
          r: 0.5 + Math.random() * 1.2,
          speed: 0.1 + Math.random() * 0.3,
          alpha: 0.1 + Math.random() * 0.3,
          flicker: Math.random() * Math.PI * 2,
          flickerSpeed: 0.01 + Math.random() * 0.02,
        });
      }
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fade = 0.5 + 0.5 * Math.sin(t * 0.3);
      const horizonY = canvas.height * 0.92;
      const curveR = canvas.width * 2.2;
      const cx = canvas.width / 2;
      const cy = horizonY + curveR;

      const layers = [
        { spread: 120, color: 'rgba(200,80,20,', base: 0.06, amp: 0.04 },
        { spread: 80, color: 'rgba(232,98,42,', base: 0.08, amp: 0.05 },
        { spread: 50, color: 'rgba(245,160,50,', base: 0.06, amp: 0.04 },
        { spread: 25, color: 'rgba(255,200,80,', base: 0.04, amp: 0.03 },
      ];
      for (const l of layers) {
        const alpha = l.base + l.amp * fade;
        const r0 = Math.max(0, curveR - l.spread);
        const grad = ctx.createRadialGradient(cx, cy, r0, cx, cy, curveR + l.spread);
        grad.addColorStop(0, l.color + '0)');
        grad.addColorStop(0.45, l.color + alpha + ')');
        grad.addColorStop(0.55, l.color + alpha + ')');
        grad.addColorStop(1, l.color + '0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const lineAlpha = 0.12 + 0.1 * fade;
      const lineGrad = ctx.createRadialGradient(
        cx,
        cy,
        Math.max(0, curveR - 8),
        cx,
        cy,
        curveR + 8,
      );
      lineGrad.addColorStop(0, 'rgba(255,220,150,0)');
      lineGrad.addColorStop(0.45, 'rgba(255,220,150,' + lineAlpha + ')');
      lineGrad.addColorStop(0.5, 'rgba(255,255,220,' + lineAlpha * 1.2 + ')');
      lineGrad.addColorStop(0.55, 'rgba(255,220,150,' + lineAlpha + ')');
      lineGrad.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = lineGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, curveR, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0a0a';
      ctx.fill();
      ctx.restore();

      for (const p of particles) {
        p.y -= p.speed;
        p.flicker += p.flickerSpeed;
        if (p.y < -10) p.y = canvas.height * 0.85;
        ctx.save();
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.flicker));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = '#E8622A';
        ctx.fill();
        ctx.restore();
      }

      t += 0.012;
      raf = requestAnimationFrame(draw);
    }

    resize();
    genParticles();
    draw();

    const onResize = () => {
      resize();
      genParticles();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

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
      setErrorMsg('Ingresa un WhatsApp válido');
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
      source: INGEST_SOURCE,
      channel: 'inbound',
      customFields: {
        event_type: 'webinar',
        webinar_date: '2026-06-04',
        webinar_time: '19:00',
        webinar_timezone: 'America/Santiago',
      },
      tracking: { meta: metaTracking },
    };
    if (Object.keys(utmData).length > 0) body.utmData = utmData;

    try {
      const res = await fetch(`${API_URL}/api/orgs/lucas-con-lucas/bus/main/ingest`, {
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
        { content_name: 'lucas-con-lucas-webinar-2026-06-04' },
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
      <style>{styles}</style>
      <canvas id="bg" ref={canvasRef} aria-hidden />
      <div className="wrap">
        <div className="logo">
          <Image
            src={logoLucas}
            alt="Lucas con Luca$"
            width={140}
            priority
            style={{ width: 140, maxWidth: '65%', height: 'auto' }}
          />
        </div>

        <div className="badge">Webinar gratuito · Online</div>

        <div className="host">
          <div className="host-photo-wrap">
            <Image
              src="/lucas-con-lucas/reto/lucas.jpg"
              alt="Lucas, fundador de Flipeame"
              width={400}
              height={500}
              priority
              className="host-photo"
              sizes="(max-width: 520px) 220px, 240px"
            />
          </div>
          <div className="host-meta">
            <span className="host-eyebrow">Conduce el webinar</span>
            <span className="host-name">Lucas</span>
            <span className="host-role">Fundador de Flipeame · +150 propiedades</span>
          </div>
        </div>

        <h1>
          Inversión inmobiliaria
          <br />
          en <em>Chile</em>
        </h1>

        <p className="subtitle">
          Estrategia real para empezar a invertir en propiedades en Chile, sin humo
          ni promesas vacías.
        </p>

        <div className="datetime">
          <span className="datetime-date">4 de junio de 2026</span>
          <span className="datetime-time">19:00 hrs · hora Chile</span>
        </div>

        {!submitted ? (
          <div className="form-wrap">
            <form className="form" onSubmit={handleSubmit} noValidate>
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
              <div className="phone-wrap">
                <PhoneInput
                  defaultCountry="cl"
                  value={phone}
                  onChange={setPhone}
                  disabled={loading}
                  preferredCountries={['cl', 'pe', 'mx', 'co', 'ar']}
                  placeholder="WhatsApp"
                  inputClassName="phone-input"
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Reservando cupo…' : 'Reservar mi cupo gratis →'}
              </button>
              <div className="form-note">
                Te enviaremos el link de acceso por correo y WhatsApp.
              </div>
              {errorMsg && <div className="form-error">{errorMsg}</div>}
            </form>
          </div>
        ) : (
          <div className="success">
            <div className="success-icon">✓</div>
            <div className="success-title">¡Cupo reservado!</div>
            <div className="success-sub">
              Te esperamos el <strong>4 de junio a las 19:00</strong> (hora Chile).
              <br />
              Revisa tu correo y WhatsApp con el link de acceso.
            </div>
            <div className="success-actions">
              <a
                className="btn-calendar"
                href={CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Agregar al calendario
              </a>
              {WHATSAPP_GROUP_URL && (
                <a
                  className="btn-wa"
                  href={WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Unirme al grupo de WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </div>
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

const styles = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #0a0a0a; overflow-x: hidden; }
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #fff; }
canvas#bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }

.wrap { position: relative; z-index: 1; text-align: center; padding: 24px 20px 40px; max-width: 520px; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; min-height: 100dvh; margin: 0 auto; }
.logo { margin-bottom: 16px; }

.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #E8622A;
  border: 1px solid rgba(232, 98, 42, 0.45);
  background: rgba(232, 98, 42, 0.12);
  padding: 6px 14px;
  border-radius: 999px;
  margin-bottom: 20px;
}

.host {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
}
@media (min-width: 420px) {
  .host {
    flex-direction: row;
    align-items: center;
    gap: 20px;
    text-align: left;
    max-width: 100%;
  }
}

.host-photo-wrap {
  position: relative;
  flex-shrink: 0;
  width: min(200px, 48vw);
}
.host-photo-wrap::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(232, 98, 42, 0.85), rgba(245, 160, 50, 0.35));
  z-index: 0;
}
.host-photo-wrap::after {
  content: '';
  position: absolute;
  right: -8px;
  bottom: -8px;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: rgba(232, 98, 42, 0.35);
  z-index: -1;
}
.host-photo {
  position: relative;
  z-index: 1;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: center top;
  border-radius: 14px;
  display: block;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
}

.host-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
@media (min-width: 420px) {
  .host-meta { align-items: flex-start; flex: 1; min-width: 0; }
}

.host-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(232, 98, 42, 0.9);
}
.host-name {
  font-size: clamp(28px, 7vw, 36px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.5px;
  color: #fff;
}
.host-role {
  font-size: 13px;
  color: #888;
  line-height: 1.4;
  max-width: 200px;
}
@media (min-width: 420px) {
  .host-role { max-width: none; }
}

h1 { font-size: clamp(26px, 5.5vw, 42px); font-weight: 600; line-height: 1.12; margin-bottom: 12px; letter-spacing: -0.5px; font-family: Arial, sans-serif; }
h1 em { color: #E8622A; font-style: normal; }

.subtitle { font-size: 14px; color: #aaa; line-height: 1.55; max-width: 400px; margin-bottom: 20px; }

.datetime {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
  padding: 14px 20px;
  width: 100%;
  max-width: 360px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}
.datetime-date { font-size: 17px; font-weight: 700; color: #fff; }
.datetime-time { font-size: 14px; color: #E8622A; font-weight: 600; }

.form-wrap { width: 100%; max-width: 360px; }
.form { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.form input:not(.phone-input) {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 14px 20px;
  font-size: 15px;
  color: #fff;
  outline: none;
  text-align: center;
  font-family: inherit;
  width: 100%;
}
.form input:focus { border-color: rgba(232, 98, 42, 0.7); }
.form input::placeholder { color: rgba(255, 255, 255, 0.3); }

.phone-wrap { width: 100%; }
.phone-wrap .react-international-phone-input-container {
  width: 100%;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  overflow: hidden;
}
.phone-wrap .react-international-phone-country-selector-button {
  background: transparent;
  border: none;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
}
.phone-wrap .phone-input {
  background: transparent !important;
  border: none !important;
  color: #fff !important;
  font-size: 15px !important;
  text-align: left;
  width: 100%;
}
.phone-wrap .phone-input::placeholder { color: rgba(255, 255, 255, 0.3); }

.form button {
  background: rgba(232, 98, 42, 0.9);
  border: 1px solid rgba(255, 150, 80, 0.3);
  color: #fff;
  border-radius: 10px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
  box-shadow: 0 4px 24px rgba(232, 98, 42, 0.2);
}
.form button:hover:not(:disabled) { background: rgba(212, 86, 31, 0.95); }
.form button:disabled { opacity: 0.6; cursor: not-allowed; }
.form-note { font-size: 11px; color: rgba(255, 255, 255, 0.35); margin-top: 2px; }
.form-error { font-size: 12px; color: rgba(255, 120, 120, 0.95); margin-top: 4px; }

.success { text-align: center; padding: 12px 0; max-width: 400px; width: 100%; }
.success-icon {
  width: 48px; height: 48px; margin: 0 auto 12px;
  background: rgba(232, 98, 42, 0.2);
  border: 2px solid #E8622A;
  border-radius: 50%;
  font-size: 22px; line-height: 44px; color: #E8622A; font-weight: 700;
}
.success-title { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
.success-sub { font-size: 14px; color: #999; line-height: 1.55; margin-bottom: 20px; }
.success-sub strong { color: #fff; }
.success-actions { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.btn-calendar {
  display: block;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}
.btn-calendar:hover { background: rgba(255, 255, 255, 0.12); }
.btn-wa {
  display: block;
  padding: 12px 16px;
  background: linear-gradient(135deg, #29d76d 0%, #22c45f 100%);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}
.btn-wa:hover { opacity: 0.95; }
`;
