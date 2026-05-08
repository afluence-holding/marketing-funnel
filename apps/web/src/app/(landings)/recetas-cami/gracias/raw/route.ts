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

.container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }

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
  padding: 22px 40px;
  max-width: 1280px;
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

/* ====== HERO ASIMÉTRICO ====== */
.hero {
  padding: 48px 0 96px;
}
.hero .grid {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 80px;
  align-items: center;
}
.hero .copy { text-align: left; }

.hero .badge-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(139, 157, 124, 0.14);
  border: 1px solid rgba(139, 157, 124, 0.28);
  padding: 8px 18px 8px 10px;
  border-radius: 999px;
  margin-bottom: 28px;
  animation: pop .55s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.hero .badge-row .check {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--sage);
  color: var(--bone);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  box-shadow: 0 6px 14px -4px rgba(93,111,80,0.45);
}
.hero .badge-row .label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--sage-deep);
  text-transform: uppercase;
}
@keyframes pop {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.hero h1.headline {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 400;
  font-size: clamp(40px, 5.4vw, 72px);
  line-height: 0.96;
  letter-spacing: -0.035em;
  color: var(--ink);
  margin-bottom: 24px;
}
.hero h1.headline .it {
  font-style: italic;
  font-weight: 300;
  color: var(--terracotta);
}
.hero .lede {
  font-size: 17.5px;
  color: var(--ink-soft);
  max-width: 480px;
  margin-bottom: 32px;
  line-height: 1.6;
}
.hero .meta-row {
  display: flex;
  gap: 36px;
  flex-wrap: wrap;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  color: var(--ink-mute);
  text-transform: uppercase;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}
.hero .meta-row span strong {
  color: var(--ink);
  font-weight: 500;
  font-size: 14px;
  display: block;
  margin-bottom: 2px;
  font-family: 'Fraunces', serif;
  font-style: italic;
  letter-spacing: -0.01em;
}

/* WhatsApp PDF mockup — hero side */
.pdf-block { position: relative; }
.pdf-wrap {
  background: #ECE5DD;
  background-image:
    radial-gradient(rgba(42,31,21,0.04) 1px, transparent 1px),
    radial-gradient(rgba(42,31,21,0.03) 1px, transparent 1px);
  background-size: 20px 20px, 12px 12px;
  background-position: 0 0, 6px 6px;
  border-radius: 24px;
  padding: 28px 22px 32px;
  border: 1px solid var(--line);
  box-shadow: 0 40px 80px -32px rgba(42,31,21,0.3);
  position: relative;
  transform: rotate(1.5deg);
  transition: transform .35s cubic-bezier(0.4, 0, 0.2, 1);
}
.pdf-wrap:hover { transform: rotate(0) translateY(-4px); }
.pdf-wrap::before {
  content: 'Vista previa · WhatsApp';
  position: absolute; top: -14px; left: 24px;
  background: var(--ink); color: var(--bone);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px; letter-spacing: 0.15em; text-transform: uppercase;
  padding: 5px 12px; border-radius: 999px;
  z-index: 2;
}
.wa-bubble {
  background: white;
  border-radius: 12px;
  border-top-left-radius: 2px;
  padding: 11px 14px 9px;
  font-size: 14.5px;
  line-height: 1.4;
  color: #303030;
  margin-bottom: 8px;
  max-width: 88%;
  position: relative;
}
.wa-bubble .wa-time {
  font-size: 10px;
  color: #999;
  float: right;
  margin-left: 8px;
  margin-top: 2px;
}
.wa-pdf-card {
  background: white;
  border-radius: 12px;
  border-top-left-radius: 2px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 92%;
}
.wa-pdf-icon {
  width: 44px; height: 50px;
  background: var(--terracotta);
  border-radius: 5px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.wa-pdf-info {
  font-size: 14px;
  color: #303030;
  font-weight: 500;
  line-height: 1.25;
}
.wa-pdf-info small {
  display: block;
  color: #999;
  font-size: 11.5px;
  margin-top: 4px;
  font-weight: 400;
}

.hero .float-card {
  position: absolute;
  background: white;
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 13px;
  font-family: 'Fraunces', serif;
  font-style: italic;
  color: var(--ink);
  box-shadow: 0 18px 36px -12px rgba(42,31,21,0.22);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 12px;
  bottom: -28px;
  left: -36px;
  transform: rotate(-3deg);
  max-width: 240px;
  line-height: 1.35;
}
.hero .float-card .dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: var(--terracotta-soft);
  flex-shrink: 0;
  box-shadow: 0 0 0 0 rgba(216,142,110,0.7);
  animation: rec 1.8s infinite;
}
@keyframes rec {
  0% { box-shadow: 0 0 0 0 rgba(216,142,110,0.7); }
  70% { box-shadow: 0 0 0 8px rgba(216,142,110,0); }
  100% { box-shadow: 0 0 0 0 rgba(216,142,110,0); }
}
.hero .float-card strong {
  font-style: normal;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--terracotta);
  text-transform: uppercase;
  display: block;
  margin-top: 4px;
}

/* ====== BENTO: VIDEO + NOTA PERSONAL ====== */
.video-bento {
  padding: 0 0 96px;
}
.video-bento .card {
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 28px;
  padding: 56px;
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  gap: 64px;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.video-bento .card::before {
  content: '';
  position: absolute;
  top: -120px; right: -100px;
  width: 280px; height: 280px;
  background: var(--ochre);
  border-radius: 50%;
  opacity: 0.08;
  filter: blur(40px);
  pointer-events: none;
}
.video-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: 22px;
  overflow: hidden;
  background: var(--ink);
  box-shadow:
    0 28px 56px -22px rgba(42,31,21,0.4),
    0 0 0 1px var(--line);
  isolation: isolate;
  z-index: 1;
}
.video-frame video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  background: var(--ink);
}
.video-corner-tag {
  position: absolute;
  bottom: 14px;
  left: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(42, 31, 21, 0.7);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  color: var(--bone);
  padding: 6px 12px;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  pointer-events: none;
  z-index: 2;
}
.bento-text { position: relative; z-index: 1; }
.bento-text .eyebrow-mini {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-bottom: 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.bento-text .eyebrow-mini::before {
  content: '';
  width: 24px;
  height: 1px;
  background: var(--terracotta);
}
.bento-text h2 {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: clamp(26px, 2.8vw, 36px);
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin-bottom: 24px;
}
.bento-text h2 .it { font-style: italic; color: var(--terracotta); font-weight: 300; }
.bento-text p.quote {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 400;
  font-size: clamp(17px, 1.5vw, 19px);
  line-height: 1.55;
  color: var(--ink-soft);
  letter-spacing: -0.005em;
  margin-bottom: 24px;
  max-width: 480px;
}
.bento-text .quote-open,
.bento-text .quote-close {
  color: var(--terracotta);
  font-size: 1.15em;
  line-height: 0;
  vertical-align: -0.05em;
}
.bento-text .signature {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 22px;
  color: var(--terracotta);
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.bento-text .signature::before {
  content: '';
  width: 36px;
  height: 1px;
  background: var(--terracotta);
}

/* ====== STEPS COMPACTOS ====== */
.steps-section {
  padding: 0 0 88px;
}
.section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-bottom: 14px;
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
  font-size: clamp(26px, 3.2vw, 38px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin-bottom: 44px;
  text-align: center;
}
h2.section-h .it { font-style: italic; color: var(--terracotta); font-weight: 300; }

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 980px;
  margin: 0 auto;
}
.step {
  background: var(--bone-warm);
  border-radius: 16px;
  padding: 24px 22px;
  border: 1px solid var(--line);
  text-align: left;
  transition: transform .25s ease, box-shadow .25s ease;
  position: relative;
}
.step:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 32px -18px rgba(42,31,21,0.18);
}
.step-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 10px;
}
.step-num {
  font-family: 'Fraunces', serif;
  font-size: 30px;
  font-weight: 300;
  font-style: italic;
  color: var(--terracotta);
  line-height: 1;
}
.step h3 {
  font-family: 'Fraunces', serif;
  font-size: 19px;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0;
}
.step p {
  font-size: 14px;
  color: var(--ink-soft);
  line-height: 1.55;
}

/* ====== CTA FULL-WIDTH ====== */
.cta-section {
  padding: 0 0 88px;
}
.cta-card {
  background: linear-gradient(135deg, var(--ink) 0%, #1a1208 100%);
  color: var(--bone);
  border-radius: 28px;
  padding: 48px 56px;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 48px;
  align-items: center;
  text-align: left;
}
.cta-card::before {
  content: '';
  position: absolute;
  top: -120px; right: -100px;
  width: 320px; height: 320px;
  background: var(--ochre);
  border-radius: 50%;
  opacity: 0.14;
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
.cta-card .left,
.cta-card .right { position: relative; z-index: 1; }
.cta-card .right { text-align: right; }
.cta-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--ochre);
  text-transform: uppercase;
  margin-bottom: 14px;
  font-weight: 600;
}
.cta-card h3 {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: clamp(26px, 3vw, 36px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
  max-width: 460px;
}
.cta-card h3 .it { font-style: italic; color: var(--ochre); font-weight: 300; }
.cta-card p.cta-blurb {
  font-size: 15px;
  color: rgba(251,247,240,0.72);
  max-width: 440px;
  line-height: 1.55;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 20px 36px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  background: var(--ochre);
  color: var(--ink);
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: transform .15s ease, background .2s ease, box-shadow .2s ease;
  box-shadow: 0 16px 40px -12px rgba(212,160,82,0.5);
  white-space: nowrap;
}
.btn-primary:hover {
  background: #E0AE5E;
  transform: translateY(-2px);
}
.btn-primary .arrow { transition: transform .2s; }
.btn-primary:hover .arrow { transform: translateX(4px); }
.cta-card .micro {
  display: block;
  margin-top: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(251,247,240,0.45);
}

/* ====== HELP ====== */
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
@media (max-width: 960px) {
  .hero .grid {
    grid-template-columns: 1fr;
    gap: 64px;
  }
  .hero { padding: 32px 0 64px; }
  .hero .copy { text-align: center; }
  .hero .meta-row { justify-content: center; }
  .hero .lede { margin-left: auto; margin-right: auto; }
  .pdf-wrap { max-width: 420px; margin: 0 auto; }
  .hero .float-card { left: 0; right: 0; margin: 0 auto; max-width: 260px; bottom: -34px; }

  .video-bento .card {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 40px 28px;
  }
  .video-frame { max-width: 320px; margin: 0 auto; }
  .bento-text { text-align: center; }
  .bento-text .eyebrow-mini { justify-content: center; }
  .bento-text p.quote { margin-left: auto; margin-right: auto; }
  .bento-text .signature { justify-content: center; }

  .cta-card {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 40px 28px;
    text-align: center;
  }
  .cta-card .right { text-align: center; }
  .cta-card h3 { margin-left: auto; margin-right: auto; }
  .cta-card p.cta-blurb { margin-left: auto; margin-right: auto; }
}

@media (max-width: 720px) {
  .container { padding: 0 24px; }
  nav.top { padding: 18px 24px; }
  .steps { grid-template-columns: 1fr; max-width: 420px; }
  .video-bento { padding: 0 0 64px; }
  .steps-section { padding: 0 0 64px; }
  .cta-section { padding: 0 0 64px; }
  .hero h1.headline { font-size: clamp(36px, 9vw, 48px); }
  .pdf-wrap { padding: 22px 16px; transform: rotate(0); }
  .hero .float-card { display: none; }
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

<!-- Hero asimétrico -->
<section class="hero">
  <div class="container">
    <div class="grid">
      <div class="copy">
        <div class="badge-row">
          <span class="check">&check;</span>
          <span class="label">Compra confirmada</span>
        </div>
        <h1 class="headline">
          &iexcl;Bienvenida a <span class="it">la cocina!</span>
        </h1>
        <p class="lede">
          En los pr&oacute;ximos minutos te llega todo por WhatsApp: la gu&iacute;a con 20 recetas, el plan semanal, la lista de compras y el acceso a Cuchi, tu IA de cocina.
        </p>
        <div class="meta-row">
          <span><strong>20</strong>recetas</span>
          <span><strong>48</strong>p&aacute;ginas</span>
          <span><strong>1</strong>IA cocinera</span>
        </div>
      </div>
      <div class="pdf-block">
        <div class="pdf-wrap" aria-hidden="true">
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
        <div class="float-card" aria-hidden="true">
          <span class="dot"></span>
          <span>
            &ldquo;Lo grab&eacute; pensando en ti.&rdquo;
            <strong>&mdash; Mira el video</strong>
          </span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Bento: video + nota personal -->
<section class="video-bento">
  <div class="container">
    <div class="card">
      <div class="video-frame">
        <video
          controls
          playsinline
          preload="metadata"
          disablePictureInPicture
          controlsList="nodownload noremoteplayback noplaybackrate"
          x-webkit-airplay="deny"
          poster="/recetas-cami/guia/04-cami.jpg"
        >
          <source src="https://zfjeshglpjoxblkneitk.supabase.co/storage/v1/object/public/recetas-cami_assets/welcome-cami.mp4" type="video/mp4">
          Tu navegador no soporta video. Puedes abrir el mensaje
          <a href="https://zfjeshglpjoxblkneitk.supabase.co/storage/v1/object/public/recetas-cami_assets/welcome-cami.mp4" style="color: var(--bone); text-decoration: underline;">aqu&iacute;</a>.
        </video>
        <span class="video-corner-tag">Cami &middot; 0:53</span>
      </div>
      <div class="bento-text">
        <div class="eyebrow-mini">Una nota de Cami</div>
        <h2>Mira lo que <span class="it">te quiero contar</span>.</h2>
        <p class="quote">
          <span class="quote-open">&ldquo;</span>Gracias por confiar en m&iacute;. Esta gu&iacute;a es lo que arm&eacute; para mi propia semana, y ahora es tuya. Si te traba algo o te falta un ingrediente, escr&iacute;bele a Cuchi como si fuera yo.<span class="quote-close">&rdquo;</span>
        </p>
        <div class="signature">Cami</div>
      </div>
    </div>
  </div>
</section>

<!-- Steps compactos -->
<section class="steps-section">
  <div class="container" style="text-align:center;">
    <div class="section-label">Qu&eacute; viene ahora</div>
    <h2 class="section-h">Tres pasos. <span class="it">Cero fricci&oacute;n.</span></h2>
    <div class="steps">
      <div class="step">
        <div class="step-head">
          <span class="step-num">01</span>
          <h3>Revisa tu WhatsApp</h3>
        </div>
        <p>En unos minutos te llega un mensaje de Cuchi con la gu&iacute;a en PDF y el plan semanal listo para descargar.</p>
      </div>
      <div class="step">
        <div class="step-head">
          <span class="step-num">02</span>
          <h3>Saluda a Cuchi</h3>
        </div>
        <p>Tu IA de cocina queda en el chat. Preg&uacute;ntale por reemplazos, porciones o qu&eacute; hacer con lo que tienes en la nevera.</p>
      </div>
      <div class="step">
        <div class="step-head">
          <span class="step-num">03</span>
          <h3>Cocina sin pensar</h3>
        </div>
        <p>Abre la gu&iacute;a, elige el d&iacute;a y arranca. 20 recetas en menos de 30 minutos esperando por ti.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA full-width -->
<section class="cta-section">
  <div class="container">
    <div class="cta-card">
      <div class="left">
        <div class="cta-eyebrow">Bonus exclusivo</div>
        <h3>Sum&aacute;te a Cuchi en <span class="it">WhatsApp ahora</span>.</h3>
        <p class="cta-blurb">Abre el chat con Cuchi para recibir tu gu&iacute;a y empezar a cocinar hoy mismo.</p>
      </div>
      <div class="right">
        <a href="#" class="btn-primary" id="primary-cta">
          Abrir WhatsApp <span class="arrow">&rarr;</span>
        </a>
        <span class="micro">Respuesta inmediata</span>
      </div>
    </div>
  </div>
</section>

<!-- Help -->
<p class="help">
  &iquest;No te lleg&oacute; nada en los pr&oacute;ximos 10 minutos? Escr&iacute;benos a
  <a href="mailto:contact@byafluence.com">contact@byafluence.com</a> y lo resolvemos al toque.
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
