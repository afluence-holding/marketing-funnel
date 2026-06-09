import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { LandingConfig } from '@/components/landing-config';
import {
  formatWhopPrice,
  getWhopProduct,
  resolveWhopTier,
} from '@/lib/whop/products';
import { DesinflamateCheckoutEmbedLoader } from './checkout-embed-loader';

// Resolve the price ladder per request (not at build time).
export const dynamic = 'force-dynamic';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const PRODUCT_KEY = 'german-desinflamate';
const product = getWhopProduct(PRODUCT_KEY)!;

export const metadata: Metadata = {
  title: 'Reservar cupo — Reto Desinflámate · Germán Roz',
  description: product.headline,
  robots: { index: false, follow: false },
};

export default function DesinflamateCheckoutPage() {
  // Sin redirección por ventana de venta: el checkout vende siempre.
  const tier = resolveWhopTier(product);
  const price = formatWhopPrice(product, tier.price);

  return (
    <div className={jakarta.className}>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ} />
      <link rel="preconnect" href="https://api.whop.com" />
      <link rel="preconnect" href="https://js.whop.com" />
      <link rel="dns-prefetch" href="https://api.whop.com" />
      <link rel="dns-prefetch" href="https://js.whop.com" />
      <style>{styles}</style>

      <div className="checkout-shell">
        <div className="checkout-page">
          <header className="checkout-top">
            <a href="/german-roz/lista-espera" className="back-link">
              ← Volver
            </a>
            <div className="brand-lockup">
              <span className="brand-mark">DESINFLÁMATE!</span>
              <span className="brand-sub">con Germán Roz</span>
            </div>
          </header>

          <div className="checkout-card">
            <span className="checkout-badge">Reservar cupo</span>

            <div className="checkout-offer">
              <h1 className="checkout-title">{product.title}</h1>
              <p className="checkout-headline">{product.headline}</p>
              <div className="checkout-price-row">
                <span className="checkout-price">{price}</span>
              </div>
              <p className="checkout-price-meta">USD · pago único · acceso de por vida</p>
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
              <DesinflamateCheckoutEmbedLoader />
            </Suspense>

            <ul className="checkout-trust">
              <li>🔒 Pago seguro vía Whop</li>
              <li>💬 Acceso por WhatsApp</li>
              <li>🥗 21 días · comida real, sin dietas restrictivas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
:root {
  --naranja: #FF5722;
  --naranja-oscuro: #E64A19;
  --navy: #303841;
  --navy-soft: #5a6470;
  --blanco: #ffffff;
  --crema: #fff7f3;
  --borde: #f0e6e0;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body { min-height: 100%; background: var(--crema); }

.checkout-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(circle at 15% 0%, rgba(255, 87, 34, 0.08), transparent 45%),
    radial-gradient(circle at 85% 100%, rgba(255, 87, 34, 0.05), transparent 40%),
    var(--crema);
  color: var(--navy);
  -webkit-font-smoothing: antialiased;
}

.checkout-page {
  max-width: 520px;
  margin: 0 auto;
  padding: 20px 16px 56px;
}

.checkout-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.back-link {
  align-self: flex-start;
  color: var(--naranja);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.back-link:hover { opacity: 0.8; }

.brand-lockup {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}
.brand-mark {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--navy);
}
.brand-sub {
  font-size: 12px;
  font-weight: 500;
  color: var(--naranja);
  letter-spacing: 0.06em;
  margin-top: 4px;
}

.checkout-card {
  position: relative;
  background: var(--blanco);
  border: 1px solid var(--borde);
  border-radius: 16px;
  padding: 44px 24px 28px;
  box-shadow: 0 24px 60px rgba(48, 56, 65, 0.1);
}

@media (max-width: 480px) {
  .checkout-card { padding: 40px 18px 24px; }
}

.checkout-badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--naranja);
  color: #fff;
  padding: 7px 20px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(255, 87, 34, 0.3);
}

.checkout-offer { text-align: center; margin-bottom: 8px; }

.checkout-title {
  font-size: clamp(24px, 6vw, 32px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
  color: var(--navy);
}

.checkout-headline {
  font-size: 12px;
  line-height: 1.5;
  color: var(--navy-soft);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  max-width: 36ch;
  margin: 0 auto 18px;
}

.checkout-price-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.checkout-price {
  font-size: clamp(48px, 12vw, 68px);
  font-weight: 800;
  color: var(--naranja);
  line-height: 0.9;
  letter-spacing: -2px;
}

.checkout-price-meta {
  font-size: 12px;
  color: var(--navy-soft);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 10px;
}

.checkout-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--borde) 20%, var(--borde) 80%, transparent);
  margin: 22px 0 10px;
}

.checkout-embed-wrap {
  min-height: 380px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--blanco);
}

.checkout-trust {
  list-style: none;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--borde);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkout-trust li {
  font-size: 12px;
  color: var(--navy-soft);
  text-align: center;
}

.checkout-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 260px;
  color: var(--navy-soft);
  text-align: center;
  font-size: 14px;
}

.checkout-state-error .muted {
  color: var(--navy-soft);
  font-size: 13px;
  max-width: 320px;
}

.retry-btn {
  margin-top: 4px;
  padding: 12px 22px;
  border-radius: 8px;
  border: none;
  background: var(--naranja);
  color: #fff;
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
  border: 3px solid rgba(255, 87, 34, 0.2);
  border-top-color: var(--naranja);
  border-radius: 50%;
  animation: checkout-spin 0.75s linear infinite;
}
@keyframes checkout-spin { to { transform: rotate(360deg); } }
`;
