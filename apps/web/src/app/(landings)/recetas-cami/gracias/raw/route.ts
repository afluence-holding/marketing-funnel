const LANDING_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gracias por tu compra · Cami</title>
<meta name="description" content="Tu compra fue confirmada. En unos segundos recibis todo por WhatsApp.">
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
}

.container { max-width: 1080px; margin: 0 auto; padding: 0 32px; }
.narrow { max-width: 720px; margin: 0 auto; padding: 0 24px; }

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
  gap: 0;
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

/* ====== HERO ====== */
.hero {
  padding: 56px 0 80px;
  text-align: center;
}
.success-mark {
  width: 96px;
  height: 96px;
  margin: 0 auto 32px;
  border-radius: 50%;
  background: var(--sage);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FBF7F0;
  font-size: 48px;
  line-height: 1;
  position: relative;
  box-shadow: 0 20px 50px -16px rgba(93,111,80,0.5);
  animation: pop .6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.success-mark::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid var(--sage);
  opacity: 0.25;
  animation: ring 1.4s ease-out infinite;
}
@keyframes pop {
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes ring {
  0% { transform: scale(0.95); opacity: 0.4; }
  100% { transform: scale(1.25); opacity: 0; }
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--sage-deep);
  text-transform: uppercase;
  margin-bottom: 24px;
}
.eyebrow .dash {
  width: 24px;
  height: 1px;
  background: var(--sage-deep);
}

h1.headline {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 400;
  font-size: clamp(40px, 6vw, 76px);
  line-height: 0.98;
  letter-spacing: -0.035em;
  color: var(--ink);
  margin-bottom: 28px;
  max-width: 820px;
  margin-left: auto;
  margin-right: auto;
}
h1.headline .it {
  font-style: italic;
  font-weight: 300;
  color: var(--terracotta);
}

.lede {
  font-size: 18px;
  color: var(--ink-soft);
  max-width: 560px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

/* ====== WHATSAPP PDF CARD ====== */
.pdf-wrap {
  max-width: 420px;
  margin: 0 auto 56px;
  background: #ECE5DD;
  background-image:
    radial-gradient(rgba(42,31,21,0.04) 1px, transparent 1px),
    radial-gradient(rgba(42,31,21,0.03) 1px, transparent 1px);
  background-size: 20px 20px, 12px 12px;
  background-position: 0 0, 6px 6px;
  border-radius: 18px;
  padding: 24px 18px;
  border: 1px solid var(--line);
  box-shadow: 0 30px 60px -28px rgba(42,31,21,0.25);
  text-align: left;
}
.wa-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.12em;
  color: var(--ink-mute);
  text-transform: uppercase;
  margin-bottom: 10px;
  padding-left: 4px;
}
.wa-bubble {
  background: white;
  border-radius: 10px;
  border-top-left-radius: 2px;
  padding: 9px 12px 7px;
  font-size: 13.5px;
  line-height: 1.4;
  color: #303030;
  margin-bottom: 8px;
  max-width: 88%;
  position: relative;
}
.wa-bubble .wa-time {
  font-size: 9.5px;
  color: #999;
  float: right;
  margin-left: 8px;
  margin-top: 2px;
}
.wa-pdf-card {
  background: white;
  border-radius: 10px;
  border-top-left-radius: 2px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 90%;
}
.wa-pdf-icon {
  width: 40px; height: 46px;
  background: var(--terracotta);
  border-radius: 4px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.wa-pdf-info {
  font-size: 13.5px;
  color: #303030;
  font-weight: 500;
  line-height: 1.25;
}
.wa-pdf-info small {
  display: block;
  color: #999;
  font-size: 11.5px;
  margin-top: 3px;
  font-weight: 400;
}

/* ====== STEPS ====== */
.steps-section {
  padding: 0 0 80px;
}
.section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}
.section-label::before {
  content: '';
  width: 24px;
  height: 1px;
  background: var(--terracotta);
}
h2.section-h {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: clamp(28px, 3.6vw, 42px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin-bottom: 56px;
  text-align: center;
}
h2.section-h .it { font-style: italic; color: var(--terracotta); font-weight: 300; }

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 980px;
  margin: 0 auto;
}
.step {
  background: var(--bone-warm);
  border-radius: 18px;
  padding: 32px 28px;
  border: 1px solid var(--line);
  text-align: left;
  transition: transform .25s ease, box-shadow .25s ease;
}
.step:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 40px -22px rgba(42,31,21,0.2);
}
.step-num {
  font-family: 'Fraunces', serif;
  font-size: 44px;
  font-weight: 300;
  font-style: italic;
  color: var(--terracotta);
  line-height: 1;
  margin-bottom: 18px;
  display: block;
}
.step h3 {
  font-family: 'Fraunces', serif;
  font-size: 21px;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 10px;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.step p {
  font-size: 14.5px;
  color: var(--ink-soft);
  line-height: 1.55;
}

/* ====== PERSONAL NOTE ====== */
.personal {
  padding: 0 0 96px;
}
.personal-card {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 56px;
  align-items: center;
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 48px;
  max-width: 880px;
  margin: 0 auto;
  position: relative;
}
.personal-photo {
  position: relative;
  width: 100%;
  aspect-ratio: 4/5;
  background: var(--bone);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 30px 50px -25px rgba(42,31,21,0.45);
  transform: rotate(-2deg);
  transition: transform .35s cubic-bezier(0.4, 0, 0.2, 1);
}
.personal-photo:hover { transform: rotate(0deg) translateY(-4px); }
.personal-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.personal-photo .tape {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%) rotate(-3deg);
  width: 88px;
  height: 22px;
  background: rgba(212,160,82,0.55);
  border-radius: 2px;
  box-shadow: 0 4px 8px -4px rgba(42,31,21,0.2);
  z-index: 2;
}
.personal-text .eyebrow-mini {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.personal-text .eyebrow-mini::before {
  content: '';
  width: 24px;
  height: 1px;
  background: var(--terracotta);
}
.personal-text p {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 400;
  font-size: clamp(20px, 2.4vw, 26px);
  line-height: 1.4;
  color: var(--ink);
  letter-spacing: -0.01em;
  margin-bottom: 12px;
}
.personal-text p .quote-open,
.personal-text p .quote-close {
  font-family: 'Fraunces', serif;
  color: var(--terracotta);
  font-size: 1.1em;
  line-height: 0;
  vertical-align: -0.05em;
}
.personal-text .signature {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 24px;
  color: var(--terracotta);
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.personal-text .signature::before {
  content: '';
  width: 36px;
  height: 1px;
  background: var(--terracotta);
}

@media (max-width: 720px) {
  .personal-card {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 32px 24px;
    text-align: center;
  }
  .personal-photo {
    max-width: 220px;
    margin: 0 auto;
  }
  .personal-text .signature { justify-content: center; }
}

/* ====== CTA SECTION ====== */
.cta-section {
  padding: 0 0 96px;
  text-align: center;
}
.cta-card {
  background: linear-gradient(135deg, var(--ink) 0%, #1a1208 100%);
  color: var(--bone);
  border-radius: 24px;
  padding: 56px 40px;
  max-width: 720px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
.cta-card::before {
  content: '';
  position: absolute;
  top: -120px; right: -100px;
  width: 320px; height: 320px;
  background: var(--ochre);
  border-radius: 50%;
  opacity: 0.12;
  filter: blur(40px);
}
.cta-card::after {
  content: '';
  position: absolute;
  bottom: -120px; left: -80px;
  width: 280px; height: 280px;
  background: var(--terracotta);
  border-radius: 50%;
  opacity: 0.18;
  filter: blur(50px);
}
.cta-card .inner { position: relative; z-index: 1; }
.cta-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--ochre);
  text-transform: uppercase;
  margin-bottom: 16px;
  font-weight: 600;
}
.cta-card h3 {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: clamp(26px, 3.2vw, 36px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}
.cta-card h3 .it { font-style: italic; color: var(--ochre); font-weight: 300; }
.cta-card p.cta-blurb {
  font-size: 15.5px;
  color: rgba(251,247,240,0.75);
  max-width: 440px;
  margin: 0 auto 32px;
  line-height: 1.6;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 18px 32px;
  border-radius: 999px;
  font-size: 15.5px;
  font-weight: 600;
  text-decoration: none;
  background: var(--ochre);
  color: var(--ink);
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: transform .15s ease, background .2s ease, box-shadow .2s ease;
  box-shadow: 0 16px 40px -12px rgba(212,160,82,0.5);
}
.btn-primary:hover {
  background: #E0AE5E;
  transform: translateY(-2px);
}
.btn-primary .arrow { transition: transform .2s; }
.btn-primary:hover .arrow { transform: translateX(4px); }

/* ====== HELP LINE ====== */
.help {
  text-align: center;
  font-size: 14px;
  color: var(--ink-soft);
  padding: 0 24px 64px;
}
.help a {
  color: var(--terracotta);
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid rgba(184,98,63,0.3);
  transition: border-color .2s;
}
.help a:hover { border-color: var(--terracotta); }

/* ====== FOOTER ====== */
footer.foot {
  background: var(--ink);
  color: var(--bone);
  padding: 56px 0 32px;
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
  .hero { padding: 40px 0 56px; }
  .success-mark { width: 80px; height: 80px; font-size: 40px; margin-bottom: 24px; }
  .steps { grid-template-columns: 1fr; max-width: 420px; }
  .cta-card { padding: 40px 24px; border-radius: 18px; }
  .pdf-wrap { padding: 18px 14px; }
  .foot-inner { justify-content: center; text-align: center; }
}
</style>
</head>
<body>

<!-- Announce -->
<div class="announce">
  <span class="pulse"></span>
  <span>Tu compra fue <strong>confirmada</strong> · ya estamos preparando tu acceso</span>
</div>

<!-- Nav -->
<nav class="top">
  <div class="logo">
    <span>cami<em>.</em></span>
    <small>Hecho con <span class="heart">&hearts;</span></small>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="container">
    <div class="success-mark">&check;</div>
    <div class="eyebrow"><span class="dash"></span>Compra confirmada</div>
    <h1 class="headline">
      &iexcl;Bienvenida a <span class="it">la cocina!</span>
    </h1>
    <p class="lede">
      En los pr&oacute;ximos minutos te llega todo por WhatsApp: la gu&iacute;a con 20 recetas, el plan semanal, la lista de compras y el acceso a Cuchi, tu IA de cocina.
    </p>

    <!-- WhatsApp PDF Card mockup -->
    <div class="pdf-wrap" aria-hidden="true">
      <div class="wa-meta">Vista previa &middot; WhatsApp</div>
      <div class="wa-bubble">
        &iexcl;Hola! Ac&aacute; te dejo tu gu&iacute;a del mes <span aria-hidden="true">&#129383;</span>
        <span class="wa-time">ahora</span>
      </div>
      <div class="wa-pdf-card">
        <div class="wa-pdf-icon">PDF</div>
        <div class="wa-pdf-info">
          Guia-Cami-20-recetas.pdf
          <small>2.4 MB &middot; 48 p&aacute;ginas</small>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Steps -->
<section class="steps-section">
  <div class="container" style="text-align:center;">
    <div class="section-label">Qu&eacute; viene ahora</div>
    <h2 class="section-h">Tres pasos. <span class="it">Cero fricci&oacute;n.</span></h2>
    <div class="steps">
      <div class="step">
        <span class="step-num">01</span>
        <h3>Revisa tu WhatsApp</h3>
        <p>En unos minutos te llega un mensaje de Cuchi con la gu&iacute;a en PDF y el plan semanal listo para descargar.</p>
      </div>
      <div class="step">
        <span class="step-num">02</span>
        <h3>Saluda a Cuchi</h3>
        <p>Tu IA de cocina queda en el chat. Preg&uacute;ntale por reemplazos, porciones o qu&eacute; hacer con lo que tienes en la nevera.</p>
      </div>
      <div class="step">
        <span class="step-num">03</span>
        <h3>Cocina sin pensar</h3>
        <p>Abre la gu&iacute;a, elige el d&iacute;a y arranca. 20 recetas en menos de 30 minutos esperando por ti.</p>
      </div>
    </div>
  </div>
</section>

<!-- Personal note from Cami -->
<section class="personal">
  <div class="container">
    <div class="personal-card">
      <div class="personal-photo">
        <span class="tape" aria-hidden="true"></span>
        <img src="/recetas-cami/guia/04-cami.jpg" alt="Cami en su cocina">
      </div>
      <div class="personal-text">
        <div class="eyebrow-mini">Una nota de Cami</div>
        <p>
          <span class="quote-open">&ldquo;</span>Gracias por confiar en m&iacute;. Esta gu&iacute;a es lo que arm&eacute; para mi propia semana, y ahora es tuya. Si te traba algo o te falta un ingrediente, escr&iacute;bele a Cuchi como si fuera yo.<span class="quote-close">&rdquo;</span>
        </p>
        <div class="signature">Cami</div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <div class="cta-card">
      <div class="inner">
        <div class="cta-eyebrow">Bonus exclusivo</div>
        <h3>Sum&aacute;te a Cuchi en <span class="it">WhatsApp ahora</span>.</h3>
        <p class="cta-blurb">Abre el chat con Cuchi para recibir tu gu&iacute;a y empezar a cocinar hoy mismo.</p>
        <a href="#" class="btn-primary" id="primary-cta">
          Abrir WhatsApp <span class="arrow">&rarr;</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Help -->
<p class="help">
  &iquest;No te lleg&oacute; nada en los pr&oacute;ximos 10 minutos? Escr&iacute;benos a
  <a href="mailto:hola@cami.com">hola@cami.com</a> y lo resolvemos al toque.
</p>

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

</body>
</html>`;

export async function GET() {
  return new Response(LANDING_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
    },
  });
}
