import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { LandingConfig } from '@/components/landing-config';
import { LUCAS, formatLucasRetoPrice } from '../../lucas-config';
import { LUCAS_RETO_FONTS } from '../../lucas-reto-tokens';
import logoLucas from '../../pre-launch-form/logo-lucas.png';
import { LucasRetoCheckoutEmbedLoader } from './checkout-embed-loader';

export const metadata: Metadata = {
  title: 'Reservar cupo — Reto Lucas con Luca$',
  description: LUCAS.reto.whopProductHeadline,
  robots: { index: false, follow: false },
};

export default function LucasRetoCheckoutPage() {
  return (
    <>
      <LandingConfig metaPixelId={LUCAS.metaPixelId} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={LUCAS_RETO_FONTS} />
      <link rel="preconnect" href="https://api.whop.com" />
      <link rel="preconnect" href="https://js.whop.com" />
      <link rel="dns-prefetch" href="https://api.whop.com" />
      <link rel="dns-prefetch" href="https://js.whop.com" />
      <style>{styles}</style>
      <div className="checkout-shell">
        <div className="checkout-page">
          <header className="checkout-top">
            <a href="/lucas-con-lucas/reto" className="back-link">
              ← Volver al reto
            </a>
            <div className="logo-wrap">
              <Image
                src={logoLucas}
                alt="Lucas con Luca$"
                width={128}
                priority
                style={{ width: 128, maxWidth: '58vw', height: 'auto' }}
              />
            </div>
          </header>

          <div className="checkout-card">
            <span className="checkout-badge">⚡ Reservar cupo</span>

            <div className="checkout-offer">
              <h1 className="checkout-title">Reto Lucas con Luca$</h1>
              <p className="checkout-headline">{LUCAS.reto.whopProductHeadline}</p>
              <div className="checkout-price-row">
                <span className="checkout-price">{formatLucasRetoPrice()}</span>
              </div>
              <p className="checkout-price-meta">CLP · pago único · sin mensualidades</p>
            </div>

            <div className="checkout-divider" aria-hidden />

            <Suspense
              fallback={
                <div className="checkout-state">
                  <div className="spinner" aria-hidden />
                  <p>Preparando formulario de pago…</p>
                </div>
              }
            >
              <LucasRetoCheckoutEmbedLoader />
            </Suspense>

            <ul className="checkout-trust">
              <li>🛡️ Garantía 2 días · 50% devolución</li>
              <li>🔒 Pago seguro vía Whop</li>
              <li>📱 Acceso por WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = `
:root {
  --naranja: #E8622A;
  --naranja-oscuro: #C44A18;
  --amarillo: #F5C518;
  --negro: #0E0E0E;
  --negro-card: #1C1C1C;
  --gris: #2A2A2A;
  --gris-claro: #A5A5A5;
  --blanco: #F5F2EC;
  --display: 'Anton', 'Arial Narrow', sans-serif;
  --body: 'DM Sans', system-ui, sans-serif;
  --mono: 'Space Mono', 'Courier New', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  min-height: 100%;
  background: var(--negro);
}

.checkout-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 0%, rgba(232, 98, 42, 0.22), transparent 45%),
    radial-gradient(circle at 85% 100%, rgba(245, 197, 24, 0.1), transparent 40%),
    var(--negro);
  color: var(--blanco);
  font-family: var(--body);
  -webkit-font-smoothing: antialiased;
  position: relative;
}

.checkout-shell::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.045;
  background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
  z-index: 0;
}

.checkout-page {
  position: relative;
  z-index: 1;
  max-width: 520px;
  margin: 0 auto;
  padding: 20px 16px 56px;
}

.checkout-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
}

.back-link {
  align-self: flex-start;
  color: var(--naranja);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: opacity 0.2s;
}
.back-link:hover { opacity: 0.85; }

.logo-wrap {
  display: flex;
  justify-content: center;
}

.checkout-card {
  position: relative;
  background: var(--negro-card);
  border: 2px solid var(--naranja);
  border-radius: 14px;
  padding: 44px 24px 28px;
  box-shadow:
    0 28px 60px rgba(0, 0, 0, 0.55),
    0 0 0 12px rgba(232, 98, 42, 0.05);
}

@media (max-width: 480px) {
  .checkout-card { padding: 40px 18px 24px; }
}

.checkout-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--amarillo);
  color: var(--negro);
  padding: 7px 20px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  white-space: nowrap;
}

.checkout-offer {
  text-align: center;
  margin-bottom: 8px;
}

.checkout-title {
  font-family: var(--display);
  font-size: clamp(26px, 6vw, 36px);
  text-transform: uppercase;
  line-height: 1;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
}

.checkout-headline {
  font-size: 13px;
  line-height: 1.45;
  color: var(--gris-claro);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  max-width: 36ch;
  margin: 0 auto 18px;
}

.checkout-price-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
}

.checkout-price {
  font-family: var(--display);
  font-size: clamp(52px, 12vw, 72px);
  color: var(--amarillo);
  line-height: 0.9;
  letter-spacing: -2px;
}

.checkout-price-meta {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gris-claro);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 8px;
}

.checkout-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 98, 42, 0.45) 20%,
    rgba(232, 98, 42, 0.45) 80%,
    transparent
  );
  margin: 20px 0 8px;
}

.checkout-embed-wrap {
  min-height: 380px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(14, 14, 14, 0.6);
}

.checkout-trust {
  list-style: none;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--gris);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkout-trust li {
  font-size: 12px;
  color: var(--gris-claro);
  text-align: center;
  letter-spacing: 0.02em;
}

.checkout-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 260px;
  color: var(--gris-claro);
  text-align: center;
  font-size: 14px;
}

.checkout-state-error .muted {
  color: rgba(165, 165, 165, 0.85);
  font-size: 13px;
  max-width: 320px;
}

.retry-btn {
  margin-top: 4px;
  padding: 12px 22px;
  border-radius: 4px;
  border: none;
  background: var(--naranja);
  color: #fff;
  font-family: var(--body);
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 0 var(--naranja-oscuro);
  transition: transform 0.15s ease;
}
.retry-btn:hover { transform: translateY(-1px); }
.retry-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--naranja-oscuro); }

.spinner {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(232, 98, 42, 0.2);
  border-top-color: var(--naranja);
  border-radius: 50%;
  animation: checkout-spin 0.75s linear infinite;
}
@keyframes checkout-spin { to { transform: rotate(360deg); } }
`;
