import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import { LUCAS } from '../../lucas-config';
import { LucasRetoCheckoutEmbed } from './checkout-embed';

export const metadata: Metadata = {
  title: 'Reservar cupo — Reto Lucas con Luca$',
  description: 'Checkout seguro del Reto Lucas con Luca$. Pago procesado por Whop.',
  robots: { index: false, follow: false },
};

export default function LucasRetoCheckoutPage() {
  return (
    <>
      <LandingConfig metaPixelId={LUCAS.metaPixelId} />
      <style>{styles}</style>
      <div className="checkout-page">
        <header className="checkout-header">
          <a href="/lucas-con-lucas/reto" className="back-link">
            ← Volver
          </a>
          <h1>Reservar mi cupo</h1>
          <p>Reto Lucas con Luca$ · 15 días · pago único</p>
        </header>
        <LucasRetoCheckoutEmbed />
      </div>
    </>
  );
}

const styles = `
html, body {
  margin: 0;
  background: #0a0a0a;
  color: #fff;
  font-family: 'DM Sans', system-ui, sans-serif;
}
.checkout-page {
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}
.checkout-header {
  text-align: center;
  margin-bottom: 8px;
}
.checkout-header h1 {
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 800;
  margin: 12px 0 6px;
}
.checkout-header p {
  margin: 0;
  color: rgba(255,255,255,0.6);
  font-size: 14px;
}
.back-link {
  color: #E8622A;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}
.checkout-embed-wrap {
  min-height: 520px;
}
.checkout-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 320px;
  color: rgba(255,255,255,0.75);
  text-align: center;
}
.checkout-state-error .muted {
  color: rgba(255,255,255,0.45);
  font-size: 13px;
  max-width: 360px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(232,98,42,0.25);
  border-top-color: #E8622A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
`;
