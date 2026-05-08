const CHECKOUT_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Recetas Cami — Checkout</title>
<meta name="description" content="Finaliza tu compra de la guia mensual de Recetas Cami. Pago seguro procesado por dLocal.">
<meta name="robots" content="noindex,nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bone: #FBF7F0;
  --bone-warm: #F7F0E4;
  --cream: #F2E8D5;
  --cream-deep: #E8DAC0;
  --terracotta: #B8623F;
  --terracotta-deep: #8E4628;
  --terracotta-soft: #D88E6E;
  --sage: #8B9D7C;
  --sage-deep: #5D6F50;
  --ochre: #D4A052;
  --ink: #2A1F15;
  --ink-soft: #5A4634;
  --ink-mute: #9C8770;
  --line: rgba(42, 31, 21, 0.08);
  --line-strong: rgba(42, 31, 21, 0.16);
}

html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bone);
  color: var(--ink);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  font-feature-settings: "ss01", "cv11";
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container { max-width: 1080px; margin: 0 auto; padding: 0 32px; width: 100%; }

/* ====== ANNOUNCE ====== */
.announce {
  background: var(--sage-deep);
  color: var(--bone);
  padding: 10px 24px;
  text-align: center;
  font-size: 12.5px;
  letter-spacing: 0.04em;
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
}
.announce .pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: #C8E6A0;
  box-shadow: 0 0 0 0 rgba(200,230,160,0.7);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(200,230,160,0.7); }
  70% { box-shadow: 0 0 0 8px rgba(200,230,160,0); }
  100% { box-shadow: 0 0 0 0 rgba(200,230,160,0); }
}
.announce strong { font-weight: 600; color: #F4D7A3; }

/* ====== NAV ====== */
nav.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 32px;
  max-width: 1240px;
  margin: 0 auto;
  width: 100%;
}
.logo {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 26px;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: -0.02em;
  display: inline-flex;
  align-items: baseline;
}
.logo small {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-soft);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-left: 10px;
  font-style: normal;
}
.logo small .heart { color: #C8553D; }
.nav-trust {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--ink-mute);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.nav-trust .lock {
  width: 12px; height: 12px;
  color: var(--sage-deep);
  flex-shrink: 0;
}

/* ====== HERO ====== */
.hero {
  padding: 32px 0 28px;
  text-align: center;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  color: var(--terracotta);
  text-transform: uppercase;
  margin-bottom: 18px;
}
.eyebrow .dash {
  width: 24px;
  height: 1px;
  background: var(--terracotta);
}
.hero h1 {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 400;
  font-size: clamp(34px, 4.6vw, 52px);
  line-height: 1.02;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin-bottom: 16px;
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
}
.hero h1 .it {
  font-style: italic;
  font-weight: 300;
  color: var(--terracotta);
}
.hero .sub {
  font-size: 16px;
  color: var(--ink-soft);
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.55;
}

/* ====== CHECKOUT SECTION ====== */
.checkout-section {
  padding: 16px 0 64px;
  flex: 1;
}

.card {
  background: var(--bone-warm);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 36px 36px 32px;
  max-width: 660px;
  margin: 0 auto;
  box-shadow: 0 30px 60px -32px rgba(42,31,21,0.18);
  position: relative;
}
.card-head {
  text-align: center;
  margin-bottom: 24px;
}
.card-title {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 500;
  line-height: 1.1;
  margin-bottom: 6px;
  color: var(--ink);
  letter-spacing: -0.015em;
}
.card-sub {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.5;
}

/* ====== ORDER SUMMARY ====== */
.order {
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 16px;
}
.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 7px 0;
}
.order-row + .order-row { border-top: 1px solid var(--line); }
.order-row .label {
  color: var(--ink-soft);
  font-size: 14px;
}
.order-row .label strong {
  color: var(--ink);
  font-weight: 600;
  font-size: 15px;
}
.order-row .value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  font-size: 13.5px;
  color: var(--ink);
  letter-spacing: 0.02em;
}
.order-row .value.muted { color: var(--ink-mute); font-weight: 400; }
.order-total {
  font-family: 'Fraunces', serif !important;
  font-style: italic;
  font-weight: 400;
  font-size: 22px !important;
  letter-spacing: -0.01em !important;
  color: var(--terracotta) !important;
}

/* ====== INCLUDES LIST ====== */
.includes {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 18px;
  padding: 14px 4px 18px;
  margin-bottom: 8px;
  border-bottom: 1px dashed var(--line-strong);
}
.includes li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  color: var(--ink-soft);
  line-height: 1.4;
}
.includes .check {
  width: 18px; height: 18px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(139, 157, 124, 0.18);
  color: var(--sage-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  margin-top: 1px;
}

/* ====== COUNTRY SELECTOR ====== */
.country-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin: 18px 0 16px;
  background: var(--bone);
  border: 1px solid var(--line-strong);
  border-radius: 14px;
}
.country-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-mute);
  flex-shrink: 0;
}
.country-flag {
  font-size: 16px;
  line-height: 1;
}
.country-select-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}
.country-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background: #fff;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  padding: 11px 36px 11px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.country-select:focus {
  border-color: var(--terracotta);
  box-shadow: 0 0 0 3px rgba(184, 98, 63, 0.15);
}
.country-select:disabled {
  opacity: 0.6;
  cursor: wait;
}
.country-chev {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-mute);
  pointer-events: none;
}

/* ====== IFRAME WRAPPER ====== */
/* Heights are sized to fit dLocal Go's content WITHOUT triggering an inner
   scrollbar. dLocal doesn't broadcast height via postMessage and the iframe
   is cross-origin, so we can't auto-size. Initial height fits the collapsed
   payment-method picker (~818px); JS grows the iframe on first interaction
   to fit the expanded card form (~1361px) plus safety margin. */
.checkout-frame-wrap {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--line-strong);
  min-height: 900px;
  box-shadow: inset 0 0 0 1px rgba(42,31,21,0.02);
  transition: min-height 0.35s ease;
}
.checkout-frame {
  width: 100%;
  height: 900px;
  border: 0;
  display: block;
  background: #fff;
  transition: height 0.35s ease;
}

/* ====== LOADER ====== */
.loader-overlay {
  position: absolute;
  inset: 0;
  background: var(--bone-warm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--ink-soft);
  font-size: 14px;
  z-index: 2;
  transition: opacity 0.3s ease;
}
.loader-overlay.hidden { opacity: 0; pointer-events: none; }
.loader-overlay span:last-child {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(212, 160, 82, 0.18);
  border-top-color: var(--ochre);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ====== FALLBACK ====== */
.fallback {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 32px 24px;
  text-align: center;
}
.fallback.show { display: flex; }
.fallback p {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.5;
  max-width: 380px;
}
.fallback button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 0 32px;
  border: none;
  border-radius: 999px;
  background: var(--terracotta);
  color: var(--bone);
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 14px 32px -10px rgba(184, 98, 63, 0.45);
}
.fallback button:hover {
  background: var(--terracotta-deep);
  transform: translateY(-2px);
}

/* ====== SUCCESS ====== */
.success {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 56px 24px;
  text-align: center;
}
.success.show { display: flex; }
.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--sage);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 40px -12px rgba(93, 111, 80, 0.5);
  animation: pop .55s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes pop {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.success h2 {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: 28px;
  color: var(--ink);
  letter-spacing: -0.02em;
}
.success h2 .it { font-style: italic; color: var(--terracotta); font-weight: 300; }
.success p {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.55;
  max-width: 360px;
}

/* ====== TRUST ROW ====== */
.secure-row {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--ink-mute);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.secure-row svg { color: var(--sage-deep); flex-shrink: 0; }
.methods {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  color: var(--ink-mute);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.methods .dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--ink-mute);
  display: inline-block;
  opacity: 0.5;
}

/* ====== FOOTER ====== */
footer.foot {
  background: var(--ink);
  color: var(--bone);
  padding: 40px 0 28px;
  margin-top: auto;
}
.foot-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.foot-inner .logo { color: var(--bone); }
.foot-inner .logo small { color: rgba(251,247,240,0.7); }
.foot-meta {
  font-size: 12.5px;
  color: rgba(251,247,240,0.5);
  display: flex;
  gap: 20px;
  align-items: center;
}
.foot-meta a {
  color: rgba(251,247,240,0.6);
  text-decoration: none;
  transition: color .2s;
}
.foot-meta a:hover { color: var(--ochre); }

/* ====== RESPONSIVE ====== */
@media (max-width: 720px) {
  .container { padding: 0 16px; }
  nav.top { padding: 18px 16px; }
  .nav-trust { display: none; }
  .hero { padding: 24px 0 20px; }
  .hero h1 { font-size: clamp(28px, 7.4vw, 36px); }
  .hero .sub { font-size: 14px; }
  .card { padding: 22px 16px 18px; border-radius: 18px; overflow: hidden; }
  .card-title { font-size: 22px; }
  .order { padding: 14px 16px; }
  .includes { grid-template-columns: 1fr; gap: 8px; padding: 12px 4px 14px; }
  .country-row { padding: 10px 12px; gap: 10px; border-radius: 12px; }
  .country-label { font-size: 10px; }
  .country-select { font-size: 13.5px; padding: 10px 32px 10px 12px; }
  /* Break the dLocal iframe out of the card's side padding so the embedded
     checkout has the full card width to render its layout. dLocal's mobile
     layout stacks payment methods vertically and was clipping inside the
     padded box. */
  .checkout-frame-wrap {
    margin-left: -16px;
    margin-right: -16px;
    width: auto;
    border-left: 0;
    border-right: 0;
    border-radius: 0;
    min-height: 900px;
  }
  .checkout-frame { height: 900px; }
  .secure-row { font-size: 10px; margin-top: 22px; }
  .methods { font-size: 9.5px; gap: 8px; }
  .foot-inner { justify-content: center; text-align: center; }
}

@media (max-width: 380px) {
  .container { padding: 0 12px; }
  .card { padding: 20px 12px 16px; }
  .checkout-frame-wrap {
    margin-left: -12px;
    margin-right: -12px;
  }
}
</style>
</head>
<body>

<!-- Announce -->
<div class="announce">
  <span class="pulse"></span>
  <span>Pago seguro &middot; Acceso inmediato por <strong>WhatsApp</strong></span>
</div>

<!-- Nav -->
<nav class="top">
  <div class="logo">
    <span>cami<em>.</em></span>
    <small>Hecho con <span class="heart">&hearts;</span></small>
  </div>
  <div class="nav-trust">
    <svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <span>Pago cifrado SSL</span>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="container">
    <div class="eyebrow"><span class="dash"></span>&Uacute;ltimo paso &middot; checkout</div>
    <h1>Est&aacute;s a un paso de <span class="it">liberarte de "&iquest;qu&eacute; cocino?"</span></h1>
    <p class="sub">Acceso inmediato a la gu&iacute;a mensual de Recetas Cami. Pago &uacute;nico, sin suscripci&oacute;n, sin sorpresas.</p>
  </div>
</section>

<!-- Checkout -->
<section class="checkout-section">
  <div class="container">
    <div class="card" aria-labelledby="checkout-title">
      <div class="card-head">
        <p id="checkout-title" class="card-title">Finalizar compra</p>
        <p class="card-sub">Pago seguro procesado por dLocal Go.</p>
      </div>

      <div class="order" role="group" aria-label="Resumen de tu compra">
        <div class="order-row">
          <span class="label">Recetas Cami &mdash; Acceso completo</span>
          <span class="value">USD 27</span>
        </div>
        <div class="order-row">
          <span class="label"><strong>Total</strong></span>
          <span class="value order-total">USD 27</span>
        </div>
      </div>

      <ul class="includes" aria-label="Qu&eacute; incluye tu compra">
        <li><span class="check" aria-hidden="true">&check;</span><span>Gu&iacute;a mensual con 20 recetas</span></li>
        <li><span class="check" aria-hidden="true">&check;</span><span>Plan semanal listo para descargar</span></li>
        <li><span class="check" aria-hidden="true">&check;</span><span>Lista de compras semanal</span></li>
        <li><span class="check" aria-hidden="true">&check;</span><span>Acceso a Cuchi (IA cocinera)</span></li>
      </ul>

      <div class="country-row">
        <label for="country-select" class="country-label">
          <span class="country-flag" id="country-flag" aria-hidden="true">&#127758;</span>
          <span>Pa&iacute;s</span>
        </label>
        <div class="country-select-wrap">
          <select id="country-select" class="country-select" aria-label="Selecciona tu pa&iacute;s de pago">
            <option value="">Detectando&hellip;</option>
            <option value="AR">Argentina</option>
            <option value="BO">Bolivia</option>
            <option value="BR">Brasil</option>
            <option value="CL">Chile</option>
            <option value="CO">Colombia</option>
            <option value="CR">Costa Rica</option>
            <option value="EC">Ecuador</option>
            <option value="GT">Guatemala</option>
            <option value="ID">Indonesia</option>
            <option value="MX">M&eacute;xico</option>
            <option value="MY">Malasia</option>
            <option value="PE">Per&uacute;</option>
            <option value="PY">Paraguay</option>
            <option value="UY">Uruguay</option>
          </select>
          <svg class="country-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      <div class="checkout-frame-wrap" id="checkout-wrap">
        <div class="loader-overlay" id="loader" aria-live="polite">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando pago seguro&hellip;</span>
        </div>

        <iframe
          id="checkout-frame"
          class="checkout-frame"
          title="Pago seguro dLocal"
          allow="payment *; clipboard-write"
          referrerpolicy="no-referrer-when-downgrade"
          src="about:blank"
          style="display:none"
        ></iframe>

        <div class="fallback" id="fallback">
          <p>El pago embebido no pudo cargarse. Continu&aacute; de forma segura en una nueva pesta&ntilde;a.</p>
          <button id="fallback-btn" type="button">Pagar USD 27 &rarr;</button>
        </div>

        <div class="success" id="success" aria-live="polite">
          <div class="success-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBF7F0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2>&iexcl;Pago <span class="it">confirmado</span>!</h2>
          <p>Te llevamos a tu pantalla de bienvenida. Si no avanza en unos segundos, abre la gu&iacute;a desde tu correo o WhatsApp.</p>
        </div>
      </div>

      <div class="secure-row" aria-label="Pago seguro">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>Pago cifrado &middot; Procesado por dLocal Go</span>
      </div>
      <div class="methods" aria-hidden="true">
        <span>VISA</span><span class="dot"></span>
        <span>MASTERCARD</span><span class="dot"></span>
        <span>AMEX</span><span class="dot"></span>
        <span>PIX</span><span class="dot"></span>
        <span>OXXO</span>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="foot">
  <div class="container">
    <div class="foot-inner">
      <div class="logo">
        <span>cami<em>.</em></span>
        <small>Hecho con <span class="heart">&hearts;</span></small>
      </div>
      <div class="foot-meta">
        <span>&copy; 2026 Cami Recetas</span>
        <a href="#">T&eacute;rminos</a>
        <a href="#">Privacidad</a>
      </div>
    </div>
  </div>
</footer>

<script>
  (function () {
    // dLocal Go public credentials (same key as the original button snippet)
    const API_KEY = 'fMnjqHVVVbBxSTfroigYUkqZBlLBlRRn';
    const API_URL = 'https://api.dlocalgo.com/v1/checkout';

    // Path to redirect to after a successful payment.
    // Uses window.top so we escape the Next.js iframe wrapper that hosts this page.
    const SUCCESS_REDIRECT = '/recetas-cami/gracias';

    // Countries supported by dLocal Go (extracted from the SDK).
    // If the detected country isn't in this list, we fall back to letting
    // dLocal show its own selector with country="" so the user picks.
    const SUPPORTED = new Set([
      'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'EC', 'GT',
      'ID', 'MX', 'MY', 'PE', 'PY', 'UY'
    ]);

    const frame = document.getElementById('checkout-frame');
    const wrap = document.getElementById('checkout-wrap');
    const loader = document.getElementById('loader');
    const loaderText = loader.querySelector('span:last-child');
    const fallback = document.getElementById('fallback');
    const fallbackBtn = document.getElementById('fallback-btn');
    const successPanel = document.getElementById('success');
    const select = document.getElementById('country-select');
    const flag = document.getElementById('country-flag');

    let checkoutUrl = null;
    let frameLoaded = false;
    let activeRequestId = 0; // guards against stale responses when user changes country fast
    let successHandled = false; // prevent duplicate redirects

    // dLocal's iframe is cross-origin and never broadcasts its content
    // height via postMessage, so we can't auto-size. The CSS starts at 900px
    // (fits the collapsed payment picker). On the first interaction signal
    // we grow to 1500px so the expanded card form (~1361px) renders without
    // an internal scrollbar.
    const EXPANDED_H = 1500;
    let iframeExpanded = false;
    function expandIframe() {
      if (iframeExpanded) return;
      iframeExpanded = true;
      frame.style.height = EXPANDED_H + 'px';
      if (wrap) wrap.style.minHeight = EXPANDED_H + 'px';
    }
    // Mouse: hovering the iframe is the strongest "about to interact" signal
    frame.addEventListener('mouseenter', expandIframe);
    // Touch: equivalent on mobile (touchstart fires before any tap is processed)
    frame.addEventListener('touchstart', expandIframe, { passive: true });
    // Click-into-iframe handoff: parent window blurs and activeElement points
    // at the iframe element. Catches keyboard nav too.
    window.addEventListener('blur', function () {
      if (document.activeElement === frame) expandIframe();
    });

    // Country code → flag emoji
    function flagOf(code) {
      if (!code || !/^[A-Z]{2}$/.test(code)) return '🌎';
      return String.fromCodePoint(
        0x1F1E6 + code.charCodeAt(0) - 65,
        0x1F1E6 + code.charCodeAt(1) - 65
      );
    }

    function setLoaderText(t) { if (loaderText) loaderText.textContent = t; }

    function showFallback() {
      loader.classList.add('hidden');
      frame.style.display = 'none';
      fallback.classList.add('show');
    }

    function showSuccess() {
      if (successHandled) return;
      successHandled = true;
      loader.classList.add('hidden');
      frame.style.display = 'none';
      fallback.classList.remove('show');
      successPanel.classList.add('show');
      // Brief delay so the user sees the confirmation, then jump to /gracias.
      // window.top breaks out of the Next.js iframe wrapper.
      setTimeout(function () {
        try {
          (window.top || window).location.href = SUCCESS_REDIRECT;
        } catch (_) {
          window.location.href = SUCCESS_REDIRECT;
        }
      }, 1500);
    }

    function showLoader() {
      fallback.classList.remove('show');
      successPanel.classList.remove('show');
      loader.classList.remove('hidden');
      frame.style.display = 'none';
    }

    // --- Country detection ---
    // Try ipwho.is first (fast, no key, generous limits), then fall back
    // to Cloudflare's trace endpoint. If both fail, return '' and let
    // dLocal show its own selector.
    async function detectCountry() {
      // Cache the result for 24h so repeat visitors don't hit the API again
      try {
        const cached = JSON.parse(localStorage.getItem('dlg_country') || 'null');
        if (cached && cached.code && (Date.now() - cached.t) < 86400000) {
          return cached.code;
        }
      } catch (_) {}

      const sources = [
        async () => {
          const r = await fetch('https://ipwho.is/', { cache: 'no-store' });
          const d = await r.json();
          return (d && d.success !== false) ? (d.country_code || '').toUpperCase() : '';
        },
        async () => {
          const r = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'no-store' });
          const text = await r.text();
          const m = text.match(/loc=([A-Z]{2})/);
          return m ? m[1] : '';
        },
      ];

      for (const src of sources) {
        try {
          const code = await Promise.race([
            src(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2500)),
          ]);
          if (code && /^[A-Z]{2}$/.test(code)) {
            try {
              localStorage.setItem('dlg_country', JSON.stringify({ code, t: Date.now() }));
            } catch (_) {}
            return code;
          }
        } catch (_) { /* try next source */ }
      }
      return '';
    }

    // --- Checkout creation ---
    async function createCheckout(country) {
      // Only pre-select if the detected country is one dLocal Go supports
      const useCountry = SUPPORTED.has(country) ? country : '';

      const payload = {
        subType: 'BUTTON',
        country: useCountry,
        currency: 'USD',
        amount: '27',
        lang: 'es',
        text: 'Pagar',
      };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Referer': 'JSButton',
          Authorization: 'Bearer ' + API_KEY,
        },
        body: JSON.stringify(payload),
      });
      return res.json();
    }

    // Load checkout for a given country and swap iframe
    async function loadCheckout(country) {
      const myReqId = ++activeRequestId;
      frameLoaded = false;
      showLoader();
      setLoaderText('Cargando pago seguro…');

      try {
        const data = await createCheckout(country);

        // Bail if a newer request superseded this one
        if (myReqId !== activeRequestId) return;

        if (!data || !data.url) {
          console.error('dLocal returned no URL', data);
          showFallback();
          return;
        }
        checkoutUrl = data.url;
        frame.style.display = 'block';
        frame.src = checkoutUrl;

        // Safety: if it doesn't load in 10s, fall back
        setTimeout(() => {
          if (myReqId === activeRequestId && !frameLoaded) {
            console.warn('Iframe did not load in time, falling back to redirect');
            showFallback();
          }
        }, 10000);
      } catch (err) {
        if (myReqId !== activeRequestId) return;
        console.error('Error creating checkout:', err);
        showFallback();
      }
    }

    // iframe load handler — set once
    frame.addEventListener('load', () => {
      if (frame.src && frame.src !== 'about:blank') {
        frameLoaded = true;
        loader.classList.add('hidden');
      }
    });

    // User changes country — re-create checkout with new country
    select.addEventListener('change', () => {
      const code = select.value;
      flag.textContent = flagOf(code);
      if (code) {
        // Persist user's manual choice
        try { localStorage.setItem('dlg_country', JSON.stringify({ code, t: Date.now(), manual: true })); } catch (_) {}
        loadCheckout(code);
      }
    });

    // --- Initial flow ---
    (async () => {
      // Reset to placeholder while we detect
      select.disabled = true;

      const country = await detectCountry();
      if (country) {
        console.log('[checkout] detected country:', country);
      }

      // If detection landed on a supported country, pre-select it; otherwise
      // leave the placeholder visible and let the user pick.
      if (country && SUPPORTED.has(country)) {
        select.value = country;
        flag.textContent = flagOf(country);
      } else {
        // Show a generic placeholder — first option text becomes "Selecciona tu país"
        select.options[0].textContent = 'Selecciona tu país';
        flag.textContent = '🌎';
      }
      select.disabled = false;

      // Kick off checkout creation with whatever we have (may be empty)
      loadCheckout(country);
    })();

    // Fallback button — open in new tab
    fallbackBtn.addEventListener('click', () => {
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.reload();
      }
    });

    // Listen for postMessage events from the iframe (best-effort)
    window.addEventListener('message', (event) => {
      if (!event.origin || event.origin.indexOf('dlocalgo.com') === -1) return;
      const data = event.data;
      console.log('[dLocal message]', data);

      const str = typeof data === 'string' ? data.toLowerCase() : JSON.stringify(data || '').toLowerCase();
      if (str.indexOf('paid') !== -1 || str.indexOf('approved') !== -1 || str.indexOf('success') !== -1) {
        showSuccess();
      }
    });
  })();
</script>
</body>
</html>`;

export async function GET() {
  return new Response(CHECKOUT_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // No cache: the dLocal checkout URL is generated per request and we
      // never want to hand out stale country state.
      'Cache-Control': 'no-store, max-age=0',
      // Prevent the page from being framed by anyone other than us.
      'X-Frame-Options': 'SAMEORIGIN',
    },
  });
}
