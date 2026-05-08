const LANDING_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cami · Lista de espera — Libérate del "¿qué cocino hoy?"</title>
<meta name="description" content="Sé de las primeras 100 en recibir la guía mensual de recetas de Cami. Acceso anticipado, precio especial de lanzamiento y Cuchi, tu IA de cocina, en beta.">
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
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
}

.serif { font-family: 'Fraunces', Georgia, serif; font-weight: 400; letter-spacing: -0.015em; }
.mono { font-family: 'JetBrains Mono', monospace; }

.container { max-width: 1180px; margin: 0 auto; padding: 0 32px; }
.hidden { display: none !important; }

/* ====== ANNOUNCEMENT BAR ====== */
.announce {
  background: var(--ink);
  color: var(--bone);
  padding: 11px 24px;
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
  background: #6FCF97;
  box-shadow: 0 0 0 0 rgba(111,207,151,0.7);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(111,207,151,0.7); }
  70% { box-shadow: 0 0 0 8px rgba(111,207,151,0); }
  100% { box-shadow: 0 0 0 0 rgba(111,207,151,0); }
}
.announce strong { font-weight: 600; color: var(--ochre); }

/* ====== NAV ====== */
nav.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 32px;
  max-width: 1180px;
  margin: 0 auto;
}
.logo {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 26px;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo em { font-style: italic; color: var(--terracotta); }
.nav-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-soft);
  background: var(--bone-warm);
  border: 1px solid var(--line);
  padding: 8px 14px;
  border-radius: 999px;
}
.nav-tag .dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--terracotta);
  animation: blink 1.6s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ====== HERO ====== */
.hero {
  padding: 28px 0 90px;
  position: relative;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 72px;
  align-items: center;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.18em;
  color: var(--terracotta);
  text-transform: uppercase;
  margin-bottom: 28px;
}
.eyebrow .dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--terracotta);
  animation: blink 1.6s infinite;
}

h1.headline {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 400;
  font-size: clamp(46px, 6.6vw, 84px);
  line-height: 0.96;
  letter-spacing: -0.035em;
  color: var(--ink);
  margin-bottom: 28px;
}
h1.headline .it {
  font-style: italic;
  font-weight: 300;
  color: var(--terracotta);
}
h1.headline .strike {
  position: relative;
  display: inline-block;
  color: var(--ink-mute);
}
h1.headline .strike::after {
  content: '';
  position: absolute;
  left: -2%;
  right: -2%;
  top: 55%;
  height: 4px;
  background: var(--terracotta);
  transform: rotate(-2deg);
  border-radius: 2px;
}

.lede {
  font-size: 18px;
  color: var(--ink-soft);
  max-width: 480px;
  margin-bottom: 32px;
  line-height: 1.6;
}

/* ====== FORM CARD (early access) ====== */
.form-card {
  background: linear-gradient(135deg, var(--ink) 0%, #1a1208 100%);
  color: var(--bone);
  border-radius: 22px;
  padding: 32px 32px 28px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 30px 50px -25px rgba(42,31,21,0.35);
}
.form-card::before {
  content: '';
  position: absolute;
  top: -120px; right: -100px;
  width: 280px; height: 280px;
  background: var(--ochre);
  border-radius: 50%;
  opacity: 0.14;
  filter: blur(50px);
  pointer-events: none;
}
.form-card::after {
  content: '';
  position: absolute;
  bottom: -120px; left: -80px;
  width: 240px; height: 240px;
  background: var(--terracotta);
  border-radius: 50%;
  opacity: 0.18;
  filter: blur(50px);
  pointer-events: none;
}
.form-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(212,160,82,0.15);
  border: 1px solid rgba(212,160,82,0.3);
  color: var(--ochre);
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}
.form-card .form-title {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: 26px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  color: var(--bone);
  position: relative;
  z-index: 1;
}
.form-card .form-title em { font-style: italic; color: var(--ochre); font-weight: 300; }
.form-card .form-sub {
  font-size: 14px;
  color: rgba(251,247,240,0.72);
  margin-bottom: 22px;
  line-height: 1.5;
  position: relative;
  z-index: 1;
}
.form-card form { display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; }
.form-card input[type="email"] {
  width: 100%;
  padding: 16px 18px;
  font-family: inherit;
  font-size: 15px;
  color: var(--bone);
  background: rgba(251,247,240,0.08);
  border: 1px solid rgba(251,247,240,0.18);
  border-radius: 12px;
  transition: border-color .2s, background .2s;
  outline: none;
}
.form-card input[type="email"]::placeholder { color: rgba(251,247,240,0.45); }
.form-card input[type="email"]:focus {
  border-color: var(--ochre);
  background: rgba(251,247,240,0.12);
}
.form-card button {
  padding: 16px 24px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  background: var(--ochre);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background .2s, transform .1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.form-card button::after { content: '→'; transition: transform .2s; }
.form-card button:hover { background: #E0AE5E; }
.form-card button:hover::after { transform: translateX(4px); }
.form-card button:active { transform: scale(0.98); }
.form-card button:disabled {
  opacity: 0.6;
  cursor: progress;
}
.form-card .msg {
  font-size: 12.5px;
  color: var(--terracotta-soft);
  min-height: 16px;
  margin-top: 2px;
  position: relative;
  z-index: 1;
}
.form-card .fineprint {
  font-size: 11.5px;
  color: rgba(251,247,240,0.5);
  text-align: center;
  margin-top: 14px;
  line-height: 1.5;
  position: relative;
  z-index: 1;
}
.form-card .scarcity {
  margin-top: 22px;
  position: relative;
  z-index: 1;
}
.form-card .scarcity-row {
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(251,247,240,0.65);
}
.form-card .scarcity-row strong { color: var(--ochre); font-weight: 600; }
.form-card .scarcity-bar {
  width: 100%;
  height: 6px;
  background: rgba(251,247,240,0.1);
  border-radius: 3px;
  overflow: hidden;
}
.form-card .scarcity-fill {
  height: 100%;
  width: 73%;
  background: linear-gradient(90deg, var(--terracotta-soft), var(--ochre));
  border-radius: 3px;
}

/* ====== HERO VISUAL ====== */
.hero-visual {
  position: relative;
  height: 580px;
}
.card-frame {
  position: absolute;
  border-radius: 14px;
  overflow: hidden;
  background: var(--cream);
  box-shadow: 0 30px 60px -25px rgba(42,31,21,0.35), 0 8px 20px -10px rgba(42,31,21,0.15);
}
.card-main {
  width: 78%;
  height: 78%;
  top: 8%;
  left: 12%;
  z-index: 2;
  transform: rotate(-1.5deg);
}
.card-back {
  width: 60%;
  height: 50%;
  top: 0;
  right: 0;
  background: var(--terracotta);
  z-index: 1;
  transform: rotate(3deg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
}
.card-back-content {
  font-family: 'Fraunces', serif;
  font-style: italic;
  color: var(--bone);
  font-size: 20px;
  line-height: 1.3;
  font-weight: 400;
}
.card-back-content small {
  display: block;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-top: 14px;
  opacity: 0.78;
}
.card-front {
  width: 54%;
  height: 30%;
  bottom: 4%;
  left: 0;
  background: var(--bone-warm);
  z-index: 3;
  transform: rotate(-3deg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.card-front .label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-mute);
  font-weight: 500;
}
.card-front h4 {
  font-family: 'Fraunces', serif;
  font-size: 21px;
  font-weight: 500;
  color: var(--ink);
  line-height: 1.1;
}
.card-front .meta {
  font-size: 12px;
  color: var(--ink-soft);
  display: flex;
  gap: 12px;
}
.card-front .meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* sticker badge */
.sticker {
  position: absolute;
  top: -18px;
  right: -10px;
  width: 116px;
  height: 116px;
  background: var(--ochre);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Fraunces', serif;
  color: var(--ink);
  font-weight: 500;
  font-size: 12.5px;
  line-height: 1.2;
  z-index: 4;
  transform: rotate(8deg);
  animation: sway 6s ease-in-out infinite;
  box-shadow: 0 10px 25px -8px rgba(212,160,82,0.5);
}
.sticker em {
  font-size: 20px;
  font-style: italic;
  display: block;
  margin: 2px 0;
}
@keyframes sway {
  0%, 100% { transform: rotate(8deg); }
  50% { transform: rotate(12deg) scale(1.03); }
}

/* trust row */
.trust {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 28px;
}
.avatars {
  display: flex;
}
.avatars .av {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 2.5px solid var(--bone);
  margin-left: -10px;
  background-size: cover;
  background-position: center;
  font-family: 'Fraunces', serif;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}
.avatars .av:first-child { margin-left: 0; }
.av.a1 { background: linear-gradient(135deg, #B8623F, #8E4628); }
.av.a2 { background: linear-gradient(135deg, #8B9D7C, #5D6F50); }
.av.a3 { background: linear-gradient(135deg, #D4A052, #B8823F); color: var(--ink); }
.av.a4 { background: linear-gradient(135deg, #D88E6E, #B8623F); }
.trust-text { font-size: 13.5px; color: var(--ink-soft); line-height: 1.4; }
.trust-text strong { color: var(--ink); font-weight: 600; }
.stars { color: var(--ochre); letter-spacing: 1px; font-size: 12px; }

/* ====== BENEFITS SECTION ====== */
.benefits {
  padding: 110px 0;
  background: var(--bone-warm);
  border-top: 1px solid var(--line);
}
.section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
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
  font-size: clamp(34px, 4.6vw, 56px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin-bottom: 18px;
  max-width: 760px;
}
h2.section-h .it { font-style: italic; color: var(--terracotta); font-weight: 300; }
.section-sub {
  font-size: 16px;
  color: var(--ink-soft);
  max-width: 540px;
  margin-bottom: 56px;
  line-height: 1.6;
}

.benefit-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}
.benefit-card {
  background: var(--bone);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform .25s, box-shadow .25s;
}
.benefit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -20px rgba(42,31,21,0.18);
}
.benefit-num {
  width: 42px; height: 42px;
  background: var(--terracotta);
  color: var(--bone);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-weight: 500;
  font-size: 18px;
  font-style: italic;
}
.benefit-card.alt .benefit-num { background: var(--sage); }
.benefit-card.alt2 .benefit-num { background: var(--ochre); color: var(--ink); }
.benefit-card h3 {
  font-family: 'Fraunces', serif;
  font-weight: 500;
  font-size: 22px;
  color: var(--ink);
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.benefit-card p {
  font-size: 14.5px;
  color: var(--ink-soft);
  line-height: 1.55;
}
.benefit-card .tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.benefit-card.alt .tag { color: var(--sage-deep); }
.benefit-card.alt2 .tag { color: var(--ochre); }

/* ====== ABOUT MINI ====== */
.about-mini {
  padding: 110px 0;
  background: var(--bone);
}
.about-grid {
  display: grid;
  grid-template-columns: 0.85fr 1fr;
  gap: 80px;
  align-items: center;
}
.about-photo-wrap { position: relative; }
.about-photo {
  width: 100%;
  aspect-ratio: 4/5;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 60px -25px rgba(42,31,21,0.3);
  background: var(--cream);
}
.about-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.about-tag {
  position: absolute;
  bottom: -22px;
  right: -22px;
  background: var(--bone);
  border-radius: 14px;
  padding: 18px 22px;
  box-shadow: 0 20px 40px -20px rgba(42,31,21,0.25);
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 15px;
  color: var(--ink);
  max-width: 200px;
  line-height: 1.35;
  border: 1px solid var(--line);
}
.about-tag strong {
  display: block;
  font-style: normal;
  font-weight: 600;
  color: var(--terracotta);
  margin-bottom: 4px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
}
.about-mini p {
  font-size: 17px;
  color: var(--ink-soft);
  line-height: 1.65;
  margin-bottom: 18px;
}
.about-mini p:first-of-type::first-letter {
  font-family: 'Fraunces', serif;
  font-size: 60px;
  float: left;
  line-height: 0.85;
  margin: 6px 12px 0 0;
  color: var(--terracotta);
  font-style: italic;
  font-weight: 400;
}
.signature {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 26px;
  color: var(--terracotta);
  margin-top: 18px;
}

/* ====== FOOTER ====== */
footer.foot {
  background: var(--ink);
  color: var(--bone);
  padding: 56px 0 28px;
}
.foot-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(251,247,240,0.1);
}
.foot-row .logo { color: var(--bone); }
.foot-row .logo em { color: var(--ochre); }
.foot-row p {
  color: rgba(251,247,240,0.7);
  font-size: 14px;
  max-width: 320px;
  line-height: 1.55;
}
.foot-bottom {
  padding-top: 22px;
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: rgba(251,247,240,0.45);
  flex-wrap: wrap;
  gap: 12px;
}
.foot-bottom a { color: rgba(251,247,240,0.6); text-decoration: none; }
.foot-bottom a:hover { color: var(--ochre); }

/* ====== THANKS OVERLAY ====== */
#thanks-screen {
  position: fixed;
  inset: 0;
  background: rgba(42,31,21,0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
}
.thanks-modal {
  background: var(--bone);
  border-radius: 24px;
  padding: 52px 44px 44px;
  max-width: 480px;
  text-align: center;
  position: relative;
  animation: pop .45s cubic-bezier(0.34,1.56,0.64,1);
  border: 1px solid var(--line);
  box-shadow: 0 40px 80px -20px rgba(42,31,21,0.35);
}
@keyframes pop {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.thanks-icon {
  width: 76px; height: 76px;
  background: var(--sage);
  border-radius: 50%;
  margin: 0 auto 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 38px;
  font-weight: 400;
}
.thanks-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-bottom: 10px;
}
.thanks-modal h3 {
  font-family: 'Fraunces', serif;
  font-size: 30px;
  margin-bottom: 12px;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--ink);
  line-height: 1.15;
}
.thanks-modal h3 em { font-style: italic; color: var(--terracotta); font-weight: 300; }
.thanks-modal p {
  color: var(--ink-soft);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 28px;
}
.thanks-perks {
  list-style: none;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bone-warm);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 20px 22px;
  margin-bottom: 28px;
}
.thanks-perks li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  color: var(--ink-soft);
  line-height: 1.45;
}
.thanks-perks .ck {
  flex-shrink: 0;
  width: 20px; height: 20px;
  background: var(--terracotta);
  color: var(--bone);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  margin-top: 1px;
}
.thanks-perks strong { color: var(--ink); font-weight: 600; display: block; margin-bottom: 1px; }
.thanks-foot {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-mute);
}

/* ====== RESPONSIVE ====== */
@media (max-width: 980px) {
  .hero-grid, .about-grid {
    grid-template-columns: 1fr;
    gap: 56px;
  }
  .hero-visual { height: 460px; max-width: 460px; margin: 0 auto; }
  .benefit-grid { grid-template-columns: 1fr; }
  .about-tag { right: 0; bottom: -16px; padding: 14px 18px; font-size: 14px; max-width: 220px; }
}
@media (max-width: 640px) {
  .container { padding: 0 20px; }
  nav.top { padding: 16px 20px; }
  .hero { padding: 14px 0 56px; }
  .benefits, .about-mini { padding: 72px 0; }
  .form-card { padding: 26px 22px 24px; border-radius: 18px; }
  .form-card .form-title { font-size: 22px; }
  .hero-visual { height: 400px; }
  .sticker { width: 92px; height: 92px; font-size: 11px; top: -10px; right: -4px; }
  .sticker em { font-size: 17px; }
  .nav-tag { display: none; }
  .thanks-modal { padding: 40px 28px 32px; border-radius: 20px; }
  .thanks-modal h3 { font-size: 24px; }
  .thanks-perks { padding: 16px 18px; }
}
</style>
</head>
<body>

<!-- Announcement -->
<div class="announce">
  <span class="pulse"></span>
  <span>Lista de espera abierta · <strong>27 cupos restantes</strong> con acceso anticipado</span>
</div>

<!-- Nav -->
<nav class="top">
  <div class="logo">
    <span>cami<em>.</em></span>
  </div>
  <div class="nav-tag">
    <span class="dot"></span>
    Próximamente · 2026
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="container hero-grid">
    <div>
      <div class="eyebrow"><span class="dot"></span>Lanzamiento · Lista de espera</div>
      <h1 class="headline">
        Libérate del<br>
        <span class="strike">"¿qué cocino</span><br>
        <span class="it">hoy?"</span>
      </h1>
      <p class="lede">Una guía mensual con 20 recetas en menos de 30 minutos, plan semanal, lista de compras y Cuchi — tu IA de cocina por WhatsApp. Sé de las primeras 100 en recibirla con precio especial.</p>

      <div class="trust">
        <div class="avatars">
          <div class="av a1">M</div>
          <div class="av a2">L</div>
          <div class="av a3">V</div>
          <div class="av a4">+</div>
        </div>
        <div class="trust-text">
          <div class="stars">★★★★★</div>
          <div><strong>+800.000 mujeres</strong> siguen las recetas de Cami · 4.9/5 en la beta</div>
        </div>
      </div>
    </div>

    <div class="hero-visual">
      <div class="card-frame card-back">
        <div class="card-back-content">
          "Volví a cocinar sin culpa, sin estrés y sin gastar de más."
          <small>— Vale, usuaria beta</small>
        </div>
      </div>
      <div class="card-frame card-main">
        <img src="/recetas-cami/guia/01-rollitos.jpg" alt="Rollitos de carne con cilantro" style="width:100%;height:100%;object-fit:cover;display:block;">
      </div>
      <div class="card-frame card-front">
        <div>
          <div class="label">Receta · 04 · Marzo</div>
          <h4>Rollitos de carne<br>con cilantro</h4>
        </div>
        <div class="meta">
          <span>⏱ 25 min</span>
          <span>👥 4 pers.</span>
        </div>
      </div>
      <div class="sticker">
        Early access<em>-40%</em>OFF
      </div>
    </div>
  </div>

  <!-- FORM CARD (full-width on mobile, integrated below hero) -->
  <div class="container" style="margin-top: 64px;">
    <div class="form-card" id="cta">
      <span class="form-badge">★ Solo lista de espera · cupos limitados</span>
      <p class="form-title">Sé de las <em>primeras 100</em> en recibir la guía.</p>
      <p class="form-sub">Precio especial de lanzamiento, acceso anticipado a Cuchi (la IA de cocina) y un descuento exclusivo que solo recibe la lista.</p>

      <form id="waitlist-form" novalidate>
        <input id="email" name="email" type="email" placeholder="tu@correo.com" autocomplete="email" required />
        <button id="submit-btn" type="submit">Quiero ser de las primeras</button>
        <p id="msg" class="msg" aria-live="polite"></p>
      </form>

      <div class="scarcity">
        <div class="scarcity-row">
          <span>Cupos de lanzamiento</span>
          <span><strong>73/100 tomados</strong></span>
        </div>
        <div class="scarcity-bar"><div class="scarcity-fill"></div></div>
      </div>

      <p class="fineprint">Sin spam · sin promesas vacías. Solo aviso cuando salga + el descuento.</p>
    </div>
  </div>
</section>

<!-- BENEFITS -->
<section class="benefits">
  <div class="container">
    <div class="section-label">Lo que recibe la lista</div>
    <h2 class="section-h">Tres ventajas que <span class="it">solo se llevan</span> las primeras 100.</h2>
    <p class="section-sub">No es solo enterarte primero. Es entrar con condiciones que el resto no va a tener cuando se abra al público.</p>

    <div class="benefit-grid">
      <div class="benefit-card">
        <div class="benefit-num">01</div>
        <h3>Acceso anticipado</h3>
        <p>Recibís la guía 7 días antes del lanzamiento público. Cocinas con las primeras recetas mientras el resto sigue esperando.</p>
        <span class="tag">+7 días de ventaja</span>
      </div>

      <div class="benefit-card alt">
        <div class="benefit-num">02</div>
        <h3>Cuchi en beta privada</h3>
        <p>Tu IA de cocina por WhatsApp, en versión beta cerrada. Le preguntas qué hacer con lo que tienes en la refri y te responde en segundos.</p>
        <span class="tag">Solo lista de espera</span>
      </div>

      <div class="benefit-card alt2">
        <div class="benefit-num">03</div>
        <h3>-40% en el lanzamiento</h3>
        <p>Precio especial reservado solo para las primeras 100. Pago único, sin suscripciones, sin sorpresas. Acceso de por vida.</p>
        <span class="tag">USD $27 vs $47 público</span>
      </div>
    </div>
  </div>
</section>

<!-- ABOUT MINI -->
<section class="about-mini">
  <div class="container about-grid">
    <div class="about-photo-wrap">
      <div class="about-photo">
        <img src="/recetas-cami/guia/04-cami.jpg" alt="Cami en su cocina">
      </div>
      <div class="about-tag">
        <strong>Hola, soy Cami</strong>
        Freelancer, creadora de contenido, fan del orden en la cocina.
      </div>
    </div>
    <div>
      <div class="section-label">Detrás de la guía</div>
      <h2 class="section-h">No es otra app. Es<br>una <span class="it">amiga que cocina.</span></h2>
      <p>Hace ocho años empecé a compartir lo que cocinaba en casa. No porque sea chef — soy freelancer, creadora de contenido y, como tú, alguien que llega cansada y tiene que cocinar igual.</p>
      <p>Esta guía es lo que armé para mí: 20 recetas simples, ricas y baratas, que funcionan los lunes a las 7. Y Cuchi, la IA que entrené con mis recetas, te acompaña cuando no estoy.</p>
      <div class="signature">— Cami</div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="foot">
  <div class="container">
    <div class="foot-row">
      <div class="logo">
        <span>cami<em>.</em></span>
      </div>
      <p>La guía con 20 recetas que te libera del "¿qué cocino hoy?". Plan semanal, lista de compras y Cuchi, tu IA de cocina, todo a tu WhatsApp.</p>
    </div>
    <div class="foot-bottom">
      <span>© 2026 Cami Recetas · Hecho con cariño</span>
      <span><a href="#">Términos</a> · <a href="#">Privacidad</a></span>
    </div>
  </div>
</footer>

<!-- THANKS OVERLAY -->
<section id="thanks-screen" class="hidden" aria-live="polite" role="dialog" aria-modal="true">
  <div class="thanks-modal">
    <div class="thanks-icon">✓</div>
    <div class="thanks-eyebrow">Estás dentro</div>
    <h3>¡Gracias por unirte a la <em>lista de espera</em>!</h3>
    <p>Te avisamos por correo apenas se abra el acceso anticipado. Mientras tanto, esto es lo que te asegura tu lugar:</p>
    <ul class="thanks-perks">
      <li><span class="ck">✓</span><div><strong>Acceso 7 días antes</strong>del lanzamiento público.</div></li>
      <li><span class="ck">✓</span><div><strong>Cuchi en beta privada</strong>solo para la lista de espera.</div></li>
      <li><span class="ck">✓</span><div><strong>-40% de descuento</strong>reservado para las primeras 100.</div></li>
    </ul>
    <div class="thanks-foot">Pronto en tu inbox · revisa también spam</div>
  </div>
</section>

<script>
(() => {
  const API_BASE = '__API_URL__';
  const INGEST_PATH = '/api/orgs/recetas-cami/bus/main/ingest';
  const SOURCE = 'landing-recetas-cami-waitlist';
  const QUEUE_KEY = 'recetas-cami-waitlist-queue:v1';
  const MAX_RETRIES = 5;
  const BASE_BACKOFF_MS = 600;
  const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

  const form = document.getElementById('waitlist-form');
  const input = document.getElementById('email');
  const msg = document.getElementById('msg');
  const btn = document.getElementById('submit-btn');
  const defaultButtonText = btn.textContent;
  const thanksScreen = document.getElementById('thanks-screen');

  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });
    return utm;
  }

  function buildPayload(email) {
    return {
      email: email,
      source: SOURCE,
      channel: 'inbound',
      sourceType: 'landing-page',
      utmData: getUtmParams(),
      customFields: {
        landing_path: window.location.pathname,
        submitted_at: new Date().toISOString(),
      },
    };
  }

  function readQueue() {
    try {
      const raw = window.localStorage.getItem(QUEUE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  function writeQueue(queue) {
    try {
      window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (_error) {
      /* localStorage unavailable */
    }
  }

  function enqueue(payload) {
    const queue = readQueue();
    queue.push({ payload: payload, attempts: 0, queuedAt: Date.now() });
    writeQueue(queue);
  }

  async function postIngest(payload) {
    const res = await fetch(API_BASE + INGEST_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!res.ok) {
      throw new Error('ingest_failed_' + res.status);
    }
    return true;
  }

  async function trySendWithRetries(payload) {
    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
      try {
        await postIngest(payload);
        return true;
      } catch (error) {
        lastError = error;
        const delay = BASE_BACKOFF_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }

  async function flushQueue() {
    const queue = readQueue();
    if (!queue.length) return;
    const remaining = [];
    for (const item of queue) {
      try {
        await postIngest(item.payload);
      } catch (_error) {
        item.attempts = (item.attempts || 0) + 1;
        if (item.attempts < MAX_RETRIES * 2) remaining.push(item);
      }
    }
    writeQueue(remaining);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    msg.textContent = '';

    const email = String(input.value || '').trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      msg.textContent = 'Ingresá un correo válido.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando...';

    const payload = buildPayload(email);

    try {
      await trySendWithRetries(payload);
      thanksScreen.classList.remove('hidden');
      flushQueue().catch(() => {});
    } catch (_error) {
      enqueue(payload);
      thanksScreen.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = defaultButtonText;
    }
  });

  window.addEventListener('online', () => {
    flushQueue().catch(() => {});
  });
  flushQueue().catch(() => {});
})();
</script>

</body>
</html>`;

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const html = LANDING_HTML.replace(/__API_URL__/g, apiUrl);
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
    },
  });
}
