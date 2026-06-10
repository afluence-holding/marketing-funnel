import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { LandingConfig } from '@/components/landing-config';
import { getWhopProduct } from '@/lib/whop/products';
import { HotmartCheckoutEmbed } from '@/components/hotmart/hotmart-checkout-embed';

/**
 * PREVIEW del checkout Hotmart (QA — no enlazada, noindex).
 *
 * Muestra la experiencia COMPLETA que verá el comprador cuando un cohort
 * Hotmart (C3) esté activo: la tarjeta real + el embed Hotmart de verdad con
 * la oferta Early Bird de $67 USD (`ymzf5qdj`, validada por API). El checkout
 * de producción (/checkout) sigue en Whop hasta el PR de catálogo de C3 —
 * esta página existe para verlo/QA-arlo ANTES del switch (US-4.1).
 *
 * Es comprable de verdad (igual que el spike): una compra aquí dispara el
 * webhook + CAPI reales. Útil para la compra de validación de US-4.2.
 */

const PREVIEW_OFFER = 'ymzf5qdj'; // Early Bird $67 USD

export const metadata: Metadata = {
  title: 'PREVIEW — Checkout Hotmart · Reto Desinflámate',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const PRODUCT_KEY = 'german-desinflamate';

export default function HotmartCheckoutPreviewPage() {
  const product = getWhopProduct(PRODUCT_KEY);
  if (!product) {
    throw new Error(`[checkout-preview] product not configured: ${PRODUCT_KEY}`);
  }

  return (
    <div className={jakarta.className}>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ} />
      <link rel="preconnect" href="https://checkout.hotmart.com" />
      <style>{styles}</style>

      <div className="checkout-shell">
        <div className="checkout-page">
          <div className="preview-banner">
            ⚗️ PREVIEW interno — así se verá el checkout cuando C3 venda por Hotmart.
            El checkout real de C2 sigue en Whop. Una compra aquí es REAL (oferta $67).
          </div>

          <header className="checkout-top">
            <a href="/german-roz/vsl-desinflamate" className="back-link">
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
              <p className="checkout-urgency">Última oportunidad al precio de lanzamiento</p>
              <p className="checkout-value-anchor">
                <s>$1,160</s> Valor total
              </p>
              <div className="checkout-price-row">
                <span className="checkout-price">$67</span>
              </div>
              <p className="checkout-price-hook">Hoy lo llevas todo por solo $67 USD</p>
              <p className="checkout-price-meta">
                pago único · acceso al reto de 21 días · se cobra en tu moneda local
              </p>
            </div>

            <div className="checkout-divider" aria-hidden />

            <HotmartCheckoutEmbed
              productKey={PRODUCT_KEY}
              backHref="/german-roz/vsl-desinflamate"
              previewOffer={PREVIEW_OFFER}
            />

            <ul className="checkout-trust checkout-value-list">
              <li>✓ 21 videos educativos de Germán (5–7 min c/u)</li>
              <li>✓ Menús personalizados Semana 2 y 3</li>
              <li>✓ Listas de compra semanales</li>
              <li>✓ Guía diaria por WhatsApp con Palti</li>
              <li>✓ Análisis nutricional de platos por foto</li>
              <li>✓ Comunidad privada de WhatsApp</li>
              <li>✓ BONO: Video Meal Prep Recetas Peruanas ($127)</li>
              <li>✓ BONO: 3 sesiones coaching grupal con Germán ($197)</li>
              <li>✓ BONO: Recetario Saludable ($47)</li>
              <li>🔒 Pago 100% seguro vía Hotmart · Visa, Mastercard, PayPal</li>
            </ul>

            <div className="checkout-guarantee">
              🛡 Garantía de 7 días · si no ves resultados, te devolvemos el 100%. Sin preguntas.
            </div>
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
.preview-banner {
  background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px;
  padding: 10px 14px; font-size: 12px; color: #664d03; margin-bottom: 16px;
  font-family: monospace;
}
.checkout-shell { min-height: 100vh; background: var(--crema); color: var(--navy); -webkit-font-smoothing: antialiased; }
.checkout-page { max-width: 520px; margin: 0 auto; padding: 20px 16px 56px; }
.checkout-top { display: flex; flex-direction: column; align-items: center; gap: 18px; margin-bottom: 24px; }
.back-link { align-self: flex-start; color: var(--naranja); text-decoration: none; font-size: 14px; font-weight: 600; }
.brand-lockup { display: flex; flex-direction: column; align-items: center; line-height: 1; }
.brand-mark { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: var(--navy); }
.brand-sub { font-size: 12px; font-weight: 500; color: var(--naranja); letter-spacing: 0.06em; margin-top: 4px; }
.checkout-card { position: relative; background: var(--blanco); border: 1px solid var(--borde); border-radius: 16px; padding: 44px 24px 28px; box-shadow: 0 24px 60px rgba(48, 56, 65, 0.1); }
.checkout-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--naranja); color: #fff; padding: 7px 20px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; white-space: nowrap; }
.checkout-offer { text-align: center; margin-bottom: 8px; }
.checkout-title { font-size: clamp(24px, 6vw, 32px); font-weight: 800; line-height: 1.1; margin-bottom: 12px; color: var(--navy); }
.checkout-urgency { font-size: 13px; font-weight: 700; color: var(--naranja); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px; }
.checkout-value-anchor { font-size: 14px; color: var(--navy-soft); margin-bottom: 6px; }
.checkout-value-anchor s { font-weight: 700; color: var(--navy); }
.checkout-price-row { display: flex; align-items: flex-end; justify-content: center; }
.checkout-price { font-size: clamp(48px, 12vw, 68px); font-weight: 800; color: var(--naranja); line-height: 0.9; letter-spacing: -2px; }
.checkout-price-hook { font-size: 14px; font-weight: 600; color: var(--navy); margin-top: 10px; }
.checkout-price-meta { font-size: 12px; color: var(--navy-soft); letter-spacing: 0.6px; text-transform: uppercase; margin-top: 10px; }
.checkout-divider { height: 1px; background: linear-gradient(90deg, transparent, var(--borde) 20%, var(--borde) 80%, transparent); margin: 22px 0 10px; }
.checkout-embed-wrap { min-height: 380px; border-radius: 12px; overflow: hidden; background: var(--blanco); }
.checkout-trust { list-style: none; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--borde); display: flex; flex-direction: column; gap: 8px; }
.checkout-trust li { font-size: 13px; color: var(--navy-soft); text-align: left; }
.checkout-testimonial, .checkout-guarantee { margin-top: 14px; padding: 12px 16px; border: 1px dashed var(--naranja); border-radius: 10px; font-size: 12.5px; color: var(--navy); text-align: center; line-height: 1.5; }
.checkout-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; min-height: 260px; color: var(--navy-soft); text-align: center; font-size: 14px; }
.checkout-state-error .muted { font-size: 13px; }
.retry-btn { margin-top: 4px; padding: 12px 22px; border-radius: 8px; border: none; background: var(--naranja); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; }
.spinner { width: 34px; height: 34px; border: 3px solid rgba(255, 87, 34, 0.2); border-top-color: var(--naranja); border-radius: 50%; animation: checkout-spin 0.75s linear infinite; }
@keyframes checkout-spin { to { transform: rotate(360deg); } }
`;
