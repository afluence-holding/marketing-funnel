import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { LandingConfig } from '@/components/landing-config';
import {
  formatWhopPrice,
  getWhopProduct,
  resolveWhopTier,
} from '@/lib/whop/products';
import { HotmartCheckoutEmbed } from '@/components/hotmart/hotmart-checkout-embed';
import { DesinflamateCheckoutEmbedLoader } from './checkout-embed-loader';

// Resolve the price ladder per request (not at build time).
export const dynamic = 'force-dynamic';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const PRODUCT_KEY = 'german-desinflamate';

export const metadata: Metadata = {
  title: 'Reservar cupo — Reto Desinflámate · Germán Roz',
  description: 'COMIDA REAL, SIN DIETAS RESTRICTIVAS — 21 DÍAS CON GERMÁN ROZ.',
  robots: { index: false, follow: false },
};

/** "16 de junio" en la tz del producto — fecha límite del tier vigente. */
function formatTierDeadline(until: string | undefined, timezone: string): string | null {
  if (!until) return null;
  const d = new Date(until);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      timeZone: timezone,
    }).format(d);
  } catch {
    return null;
  }
}

export default function DesinflamateCheckoutPage() {
  // Cohort + tier resolved PER REQUEST (force-dynamic) — never at module load,
  // so a deploy that already contains a future cohort keeps selling the right
  // edition. Sin redirección por ventana de venta: el checkout vende siempre.
  const product = getWhopProduct(PRODUCT_KEY);
  if (!product) {
    throw new Error(`[checkout] product not configured: ${PRODUCT_KEY}`);
  }
  const tier = resolveWhopTier(product);
  const price = formatWhopPrice(product, tier.price);

  // CRO v2 (docs/Propuesta de Cambios Checkout v2.docx): urgencia y escalera
  // derivadas del CATÁLOGO — al lanzar C3 estos textos se actualizan solos.
  const tierIndex = product.tiers.indexOf(tier);
  const nextTier = tierIndex >= 0 ? product.tiers[tierIndex + 1] : undefined;
  const deadline = formatTierDeadline(tier.until, product.timezone);
  const urgencyLine =
    tierIndex === 0
      ? 'Última oportunidad al precio de lanzamiento'
      : 'Última oportunidad de unirte al reto';
  const priceRiseLine =
    nextTier && deadline
      ? `Precio sube a ${formatWhopPrice(product, nextTier.price)} después del ${deadline} · `
      : '';

  return (
    <div className={jakarta.className}>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ} />
      {/* Preconnect al host del proveedor del cohort activo (acelera el primer paint
          del embed). Provider-aware: Hotmart vs Whop. */}
      {product.provider === 'hotmart' ? (
        <>
          <link rel="preconnect" href="https://checkout.hotmart.com" />
          <link rel="preconnect" href="https://pay.hotmart.com" />
          <link rel="dns-prefetch" href="https://checkout.hotmart.com" />
        </>
      ) : (
        <>
          <link rel="preconnect" href="https://api.whop.com" />
          <link rel="preconnect" href="https://js.whop.com" />
          <link rel="dns-prefetch" href="https://api.whop.com" />
          <link rel="dns-prefetch" href="https://js.whop.com" />
        </>
      )}
      <style>{styles}</style>

      <div className="checkout-shell">
        <div className="checkout-page">
          <header className="checkout-top">
            {/* C4 (ex PR #74): Volver → VSL (lista-espera decía "edición cerrada" en plena venta). */}
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
              <p className="checkout-urgency">{urgencyLine}</p>
              <p className="checkout-value-anchor">
                <s>$1,160</s> Valor total
              </p>
              <div className="checkout-price-row">
                <span className="checkout-price">{price}</span>
              </div>
              <p className="checkout-price-hook">Hoy lo llevas todo por solo {price} USD</p>
              {/* C1 (ex PR #74): moneda inequívoca + promesa real (21 días, no "de por vida").
                  Hotmart cobra el equivalente en moneda local (ancla USD). */}
              <p className="checkout-price-meta">
                {priceRiseLine}pago único · acceso al reto de 21 días
                {product.provider === 'hotmart' ? ' · se cobra en tu moneda local' : ''}
              </p>
            </div>

            <div className="checkout-divider" aria-hidden />

            {/* El provider lo decide el cohort activo del catálogo: lanzar una
                edición Hotmart (C3) enruta aquí sin tocar este archivo. */}
            {product.provider === 'hotmart' ? (
              <HotmartCheckoutEmbed
                productKey={PRODUCT_KEY}
                backHref="/german-roz/vsl-desinflamate"
              />
            ) : (
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
            )}

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
              <li>
                {/* Hotmart: solo tarjeta (métodos alternativos ocultos en el embed). */}
                {product.provider === 'hotmart'
                  ? '🔒 Pago 100% seguro vía Hotmart · Visa, Mastercard'
                  : '🔒 Pago 100% seguro vía Whop · Visa, Mastercard, PayPal'}
              </li>
            </ul>

            <div className="checkout-testimonial">
              <p className="stars" aria-hidden>
                ⭐⭐⭐⭐⭐
              </p>
              <p className="quote">
                “Bajé 4 kilos de inflamación y me siento con energía increíble. Las recetas
                son deliciosas.”
              </p>
              <p className="author">— María González, 42 años · Grupo 1</p>
              <p className="social-proof">+2,500 mujeres transformadas · 98% reportan más energía</p>
            </div>

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

.checkout-urgency {
  font-size: 13px;
  font-weight: 700;
  color: var(--naranja);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
}

.checkout-value-anchor {
  font-size: 14px;
  color: var(--navy-soft);
  margin-bottom: 6px;
}
.checkout-value-anchor s {
  font-weight: 700;
  color: var(--navy);
}

.checkout-price-hook {
  font-size: 14px;
  font-weight: 600;
  color: var(--navy);
  margin-top: 10px;
}

.checkout-value-list li {
  text-align: left;
  font-size: 13px;
}

.checkout-testimonial {
  margin-top: 18px;
  padding: 14px 16px;
  background: var(--crema);
  border: 1px solid var(--borde);
  border-radius: 10px;
  text-align: center;
}
.checkout-testimonial .stars { font-size: 14px; letter-spacing: 2px; }
.checkout-testimonial .quote {
  font-size: 13px;
  font-style: italic;
  color: var(--navy);
  margin: 8px auto 6px;
  max-width: 42ch;
  line-height: 1.5;
}
.checkout-testimonial .author { font-size: 12px; color: var(--navy-soft); }
.checkout-testimonial .social-proof {
  font-size: 12px;
  font-weight: 700;
  color: var(--naranja);
  margin-top: 10px;
}

.checkout-guarantee {
  margin-top: 14px;
  padding: 12px 16px;
  border: 1px dashed var(--naranja);
  border-radius: 10px;
  font-size: 12.5px;
  color: var(--navy);
  text-align: center;
  line-height: 1.5;
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
