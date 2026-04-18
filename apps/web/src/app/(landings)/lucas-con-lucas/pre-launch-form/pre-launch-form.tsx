'use client';

import { type FormEvent, Suspense, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import logoLucas from './logo-lucas.png';
import { useUtm, type UtmParams } from '@/lib/tracking/use-utm';
import { trackEvent } from '@/lib/tracking/events';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// WhatsApp group invite link. Empty string hides the CTA; paste the real URL when ready.
const WHATSAPP_GROUP_URL = '';

// Launch date — 16 May 2026 at 00:00 local time (month index 4 = May).
const DEADLINE = new Date(2026, 4, 16, 0, 0, 0);

// Waitlist counter baseline — 17 Apr 2026 00:00 local time (month index 3 = April).
// Same Date-ctor + getTime() format as DEADLINE so both sit on the same ms epoch.
const WAITLIST_EPOCH = new Date(2026, 3, 17, 0, 0, 0).getTime();
const WAITLIST_BASE_COUNT = 840;
const MS_PER_HOUR = 3_600_000;

/** Deterministic 10..20 inclusive for a given hour index. */
function hourlyRate(hourIndex: number): number {
  const hash = Math.sin(hourIndex * 12.9898) * 43758.5453;
  const frac = hash - Math.floor(hash);
  return 10 + Math.floor(frac * 11);
}

/** Expected waitlist count at an absolute ms timestamp. Monotonic and stable. */
function computeWaitlistCount(nowMs: number): number {
  const elapsed = nowMs - WAITLIST_EPOCH;
  if (elapsed <= 0) return WAITLIST_BASE_COUNT;
  const completedHours = Math.floor(elapsed / MS_PER_HOUR);
  let total = WAITLIST_BASE_COUNT;
  for (let h = 0; h < completedHours; h++) total += hourlyRate(h);
  const fraction = (elapsed - completedHours * MS_PER_HOUR) / MS_PER_HOUR;
  return total + Math.floor(hourlyRate(completedHours) * fraction);
}

const ROTATING_PHRASES = [
  'No es un curso',
  'Estrategia real',
  'Inversión inmobiliaria en Chile',
  'Para los que van primero',
  'Algo que no viste venir',
];

type Particle = {
  x: number;
  y: number;
  r: number;
  speed: number;
  alpha: number;
  flicker: number;
  flickerSpeed: number;
};

function PreLaunchFormInner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotatingRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const [cd, setCd] = useState({ d: '--', h: '--', m: '--', s: '--' });
  const [urgency, setUrgency] = useState('');
  const [counter, setCounter] = useState('0');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const utm = useUtm();

  // Canvas animation (sunset gradient + particles + stars)
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

      ctx.save();
      ctx.globalAlpha = 0.15 + 0.1 * fade;
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.arc(
          ((i * 137.5) % 1) * canvas.width,
          ((i * 97.3) % 0.6) * canvas.height,
          0.5 + ((i * 53.7) % 1) * 0.8,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
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

  // Countdown tick
  useEffect(() => {
    function tick() {
      const diff = DEADLINE.getTime() - Date.now();
      if (diff <= 0) {
        setCd({ d: '00', h: '00', m: '00', s: '00' });
        setUrgency('🔴 Lista cerrada. Abre en minutos.');
        return;
      }
      const daysLeft = Math.floor(diff / 86400000);
      setCd({
        d: String(daysLeft).padStart(2, '0'),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
      if (daysLeft <= 3) setUrgency('⚡ Últimos días — los cupos se llenan rápido.');
      else if (daysLeft <= 7) setUrgency('Los primeros en inscribirse tienen prioridad de cupo.');
      else if (daysLeft <= 14) setUrgency('Lista de espera activa — asegura tu lugar ahora.');
      else setUrgency('');
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Rotating phrases (every 2.5s)
  useEffect(() => {
    const el = rotatingRef.current;
    if (!el) return;
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % ROTATING_PHRASES.length;
      el.style.transform = `translateY(-${idx * 22}px)`;
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // Social counter: animate 0 -> computeWaitlistCount(now) over 2s, then
  // re-sync every 30s against the deterministic hourly function (10..20 per hour).
  useEffect(() => {
    let rafId = 0;
    let interval: ReturnType<typeof setInterval> | null = null;
    let shown = 0;

    const startTimeout = setTimeout(() => {
      const target = computeWaitlistCount(Date.now());
      let start = 0;
      const duration = 2000;
      function step(ts: number) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        shown = Math.floor(ease * target);
        setCounter(shown.toLocaleString('es-CL'));
        if (p < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          shown = target;
          setCounter(shown.toLocaleString('es-CL'));
          interval = setInterval(() => {
            const live = computeWaitlistCount(Date.now());
            if (live !== shown) {
              shown = live;
              setCounter(shown.toLocaleString('es-CL'));
            }
          }, 30_000);
        }
      }
      rafId = requestAnimationFrame(step);
    }, 800);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(rafId);
      if (interval) clearInterval(interval);
    };
  }, []);

  // Toast notifications — first after 4s, then every 18s
  useEffect(() => {
    const toast = toastRef.current;
    if (!toast) return;
    let hideTimer: ReturnType<typeof setTimeout>;

    function show() {
      if (!toast) return;
      toast.innerHTML = '<span>1 persona</span> acaba de unirse ✍️';
      toast.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    const firstTimer = setTimeout(show, 4000);
    const interval = setInterval(show, 18000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = emailRef.current;
    if (!input) return;
    const email = input.value.trim();
    if (!email || !email.includes('@')) {
      input.classList.remove('shake');
      input.classList.add('error');
      // Force reflow so the shake animation restarts
      void input.offsetWidth;
      input.classList.add('shake');
      input.addEventListener(
        'animationend',
        () => input.classList.remove('shake'),
        { once: true },
      );
      input.focus();
      return;
    }
    input.classList.remove('error');
    setLoading(true);
    setErrorMsg('');

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
      email,
      source: 'landing-lucas-con-lucas-pre-launch',
      channel: 'inbound',
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
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `Request failed (${res.status})`);
      }
      trackEvent('Lead', { content_name: 'lucas-con-lucas-pre-launch' }, { eventId });
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
      <canvas id="bg" ref={canvasRef} />
      <div className="toast" ref={toastRef} />
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

        <h1>
          Construye
          <br />
          tu patrimonio <em>inmobiliario</em>
        </h1>

        <div className="rotating">
          <div className="rotating-inner" ref={rotatingRef}>
            {[...ROTATING_PHRASES, ROTATING_PHRASES[0]].map((p, i) => (
              <span key={i}>{p}</span>
            ))}
          </div>
        </div>

        <div className="countdown-wrap">
          <div className="countdown">
            <div className="cbox">
              <div className="cnum">{cd.d}</div>
              <div className="clbl">Días</div>
            </div>
            <div className="csep">:</div>
            <div className="cbox">
              <div className="cnum">{cd.h}</div>
              <div className="clbl">Horas</div>
            </div>
            <div className="csep">:</div>
            <div className="cbox">
              <div className="cnum">{cd.m}</div>
              <div className="clbl">Min</div>
            </div>
            <div className="csep">:</div>
            <div className="cbox">
              <div className="cnum">{cd.s}</div>
              <div className="clbl">Seg</div>
            </div>
          </div>
          <div className="countdown-urgency">{urgency}</div>
        </div>

        {!submitted ? (
          <div id="form-wrap">
            <form className="form" onSubmit={handleSubmit} noValidate>
              <input
                ref={emailRef}
                type="email"
                placeholder="tu@correo.com"
                disabled={loading}
                autoComplete="email"
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Enviando…' : 'Quiero registrarme →'}
              </button>
              <div className="form-note">Sin spam. Solo te avisamos cuando esté disponible.</div>
              {errorMsg && <div className="form-error">{errorMsg}</div>}
            </form>
            <div className="social">
              <div className="social-num">{counter}</div>
              <div className="social-lbl">🚧 En lista de espera</div>
            </div>
          </div>
        ) : (
          <div className="success">
            <div className="success-icon">🔑</div>
            <div className="success-title">Registrado.</div>
            <div className="success-sub">
              Serás de los primeros en saber.
              <br />
              Mantente atento a nuestros canales y redes.
            </div>
            {WHATSAPP_GROUP_URL && (
            <div className="success-actions">
              <a
                className="btn-wa"
                href={WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.861L.057 23.994l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.359-.214-3.724.977.994-3.638-.234-.374A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                </svg>
                Únete al grupo de WhatsApp
              </a>
            </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function PreLaunchForm() {
  return (
    <Suspense fallback={null}>
      <PreLaunchFormInner />
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

.wrap { position: relative; z-index: 1; text-align: center; padding: 24px; max-width: 520px; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; min-height: 100dvh; margin: 0 auto; }

.logo { margin-bottom: 20px; }

h1 { font-size: clamp(28px, 6vw, 48px); font-weight: 600; line-height: 1.1; margin-bottom: 10px; letter-spacing: -1px; font-family: Arial, sans-serif; }
h1 em { color: #E8622A; font-style: normal; }

.rotating { height: 22px; margin-bottom: 20px; overflow: hidden; position: relative; }
.rotating-inner { display: flex; flex-direction: column; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.rotating span { font-size: 14px; color: #888; height: 22px; line-height: 22px; white-space: nowrap; }

.countdown-wrap { margin-bottom: 20px; }
.countdown { display: flex; justify-content: center; gap: 10px; }
.cbox { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.cnum { font-size: clamp(24px, 5vw, 40px); font-weight: 900; color: #F5C518; line-height: 1; min-width: 48px; text-align: center; text-shadow: 0 0 12px rgba(245, 197, 24, 0.25); }
.clbl { font-size: 9px; color: #555; letter-spacing: 1px; text-transform: uppercase; }
.csep { font-size: 30px; font-weight: 900; color: #333; align-self: flex-start; margin-top: 3px; }
.countdown-urgency { margin-top: 10px; font-size: 11px; color: rgba(255, 255, 255, 0.2); letter-spacing: 0.3px; min-height: 14px; }

.form { display: flex; flex-direction: column; gap: 10px; max-width: 360px; width: 100%; margin: 0 auto; }
.form input { background: rgba(255, 255, 255, 0.07); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 14px 20px; font-size: 15px; color: #fff; outline: none; text-align: center; transition: border 0.2s, background 0.2s; font-family: inherit; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08); }
.form input.error { border-color: rgba(255, 80, 80, 0.8); background: rgba(255, 50, 50, 0.08); }
@keyframes lucasShake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
.form input.shake { animation: lucasShake 0.35s ease; }
.form input:focus { border-color: rgba(232, 98, 42, 0.7); background: rgba(255, 255, 255, 0.1); }
.form input::placeholder { color: rgba(255, 255, 255, 0.3); }
.form button { position: relative; overflow: hidden; background: rgba(232, 98, 42, 0.9); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 150, 80, 0.3); color: #fff; border-radius: 10px; padding: 14px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; box-shadow: 0 4px 24px rgba(232, 98, 42, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15); }
.form button::after { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent); transition: left 0.5s ease; pointer-events: none; }
.form button:hover:not(:disabled) { background: rgba(212, 86, 31, 0.95); }
.form button:hover:not(:disabled)::after { left: 150%; }
.form button:disabled { opacity: 0.6; cursor: not-allowed; }
.form-note { font-size: 11px; color: rgba(255, 255, 255, 0.2); margin-top: 2px; }
.form-error { font-size: 12px; color: rgba(255, 120, 120, 0.9); margin-top: 4px; }

.social { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px; }
.social-num { font-size: 36px; font-weight: 900; color: #fff; line-height: 1; text-shadow: 0 0 20px rgba(255, 255, 255, 0.15); }
.social-lbl { font-size: 12px; color: #ffffff; margin-top: 2px; }

.toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(80px); background: rgba(255, 255, 255, 0.06); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 10px 18px; font-size: 13px; color: #ccc; white-space: nowrap; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s; opacity: 0; z-index: 100; }
.toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
.toast span { color: #E8622A; font-weight: 600; }

.success { text-align: center; padding: 20px; max-width: 360px; width: 100%; margin: 0 auto; }
.success-icon { font-size: 40px; margin-bottom: 12px; }
.success-title { font-size: 22px; font-weight: 900; margin-bottom: 6px; }
.success-sub { font-size: 14px; color: #999; margin-bottom: 24px; line-height: 1.5; }
.success-actions { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.btn-wa { display: flex; align-items: center; justify-content: center; gap: 10px; background: #25D366; border: none; border-radius: 10px; padding: 14px 20px; font-size: 15px; font-weight: 700; color: #fff; cursor: pointer; font-family: inherit; text-decoration: none; transition: opacity 0.2s; box-shadow: 0 4px 24px rgba(37, 211, 102, 0.3); }
.btn-wa:hover { opacity: 0.88; }
`;
