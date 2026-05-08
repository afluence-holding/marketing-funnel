const LANDING_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cami · La guía que te libera del "¿qué cocino hoy?"</title>
<meta name="description" content="Una guía mensual de recetas que te libera del estrés diario de decidir qué cocinar. Sé la primera en saber cuándo sale.">
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

.container { max-width: 1240px; margin: 0 auto; padding: 0 32px; }
.narrow { max-width: 720px; margin: 0 auto; padding: 0 24px; }

/* ====== ANNOUNCEMENT BAR ====== */
.announce {
  background: var(--ink);
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
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-mark {
  width: 32px; height: 32px;
  background: var(--terracotta);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bone);
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  font-family: 'Fraunces', serif;
}
.nav-cta {
  background: var(--ink);
  color: var(--bone);
  padding: 10px 18px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background .2s;
}
.nav-cta:hover { background: var(--terracotta); }
.nav-cta::after { content: '→'; transition: transform .2s; }
.nav-cta:hover::after { transform: translateX(3px); }

/* ====== HERO ====== */
.hero {
  padding: 32px 0 80px;
  position: relative;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 64px;
  align-items: center;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11.5px;
  font-weight: 600;
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
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

h1.headline {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 400;
  font-size: clamp(48px, 7vw, 92px);
  line-height: 0.95;
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
  font-size: 19px;
  color: var(--ink-soft);
  max-width: 520px;
  margin-bottom: 36px;
  line-height: 1.55;
}

.hero-actions {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 36px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 26px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: transform .15s, background .2s, box-shadow .2s;
}
.btn-primary {
  background: var(--ink);
  color: var(--bone);
  box-shadow: 0 4px 24px -8px rgba(42,31,21,0.4);
}
.btn-primary:hover { background: var(--terracotta); transform: translateY(-1px); }
.btn-ghost {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line-strong);
}
.btn-ghost:hover { background: var(--cream); }
.btn .arrow { transition: transform .2s; }
.btn:hover .arrow { transform: translateX(4px); }

/* trust row */
.trust {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 8px;
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

/* HERO VISUAL — editorial collage */
.hero-visual {
  position: relative;
  height: 620px;
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
  font-size: 22px;
  line-height: 1.25;
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
  opacity: 0.75;
}
.card-front {
  width: 52%;
  height: 32%;
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
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-mute);
  font-weight: 600;
}
.card-front h4 {
  font-family: 'Fraunces', serif;
  font-size: 22px;
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

.placeholder-img {
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    repeating-linear-gradient(45deg, transparent 0 14px, rgba(42,31,21,0.04) 14px 15px),
    linear-gradient(135deg, var(--cream) 0%, var(--cream-deep) 100%);
  position: relative;
}
.placeholder-img .pl-text {
  position: absolute;
  bottom: 16px; left: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--ink-mute);
  background: var(--bone);
  padding: 4px 8px;
  border-radius: 4px;
}
.placeholder-img .pl-icon {
  width: 64px; height: 64px;
  border: 1.5px dashed var(--ink-mute);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-mute);
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 24px;
}

/* sticker badge */
.sticker {
  position: absolute;
  top: -18px;
  right: -10px;
  width: 110px;
  height: 110px;
  background: var(--ochre);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Fraunces', serif;
  color: var(--ink);
  font-weight: 500;
  font-size: 13px;
  line-height: 1.15;
  z-index: 4;
  transform: rotate(8deg);
  animation: sway 6s ease-in-out infinite;
  box-shadow: 0 10px 25px -8px rgba(212,160,82,0.5);
}
.sticker em {
  font-size: 22px;
  font-style: italic;
  display: block;
  margin: 2px 0;
}
@keyframes sway {
  0%, 100% { transform: rotate(8deg); }
  50% { transform: rotate(12deg) scale(1.03); }
}

/* ====== MARQUEE ====== */
.marquee {
  background: var(--ink);
  color: var(--bone);
  padding: 22px 0;
  overflow: hidden;
  position: relative;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.marquee-track {
  display: flex;
  gap: 56px;
  animation: scroll 30s linear infinite;
  white-space: nowrap;
  align-items: center;
}
.marquee-item {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 26px;
  color: var(--bone);
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  gap: 56px;
}
.marquee-item::after {
  content: '✦';
  color: var(--ochre);
  font-style: normal;
  font-size: 18px;
}
@keyframes scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* ====== PAIN SECTION ====== */
.pain {
  padding: 120px 0;
  background: var(--bone);
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
  font-size: clamp(36px, 5vw, 64px);
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin-bottom: 24px;
  max-width: 900px;
}
h2.section-h .it { font-style: italic; color: var(--terracotta); font-weight: 300; }

.pain-quotes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 64px;
}
.quote-card {
  background: var(--bone-warm);
  border-radius: 18px;
  padding: 32px;
  position: relative;
  border: 1px solid var(--line);
  transition: transform .3s, box-shadow .3s;
}
.quote-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -20px rgba(42,31,21,0.2);
}
.quote-card::before {
  content: '“';
  font-family: 'Fraunces', serif;
  position: absolute;
  top: -10px;
  left: 24px;
  font-size: 80px;
  color: var(--terracotta);
  line-height: 1;
  opacity: 0.4;
}
.quote-card p {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 19px;
  line-height: 1.4;
  color: var(--ink);
  margin: 24px 0 24px;
}
.quote-card .who {
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--line);
  padding-top: 18px;
}
.who-av {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--terracotta);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-weight: 500;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
.who-meta { font-size: 13px; color: var(--ink-soft); }
.who-meta strong { color: var(--ink); font-weight: 600; display: block; }
.beta-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(139,157,124,0.15);
  border: 1px solid rgba(139,157,124,0.4);
  color: var(--sage-deep);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 18px;
}
.beta-badge::before {
  content: '';
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--sage-deep);
}

/* ====== HOW IT WORKS ====== */
.how {
  padding: 120px 0;
  background: var(--cream);
  border-top: 1px solid var(--line);
}
.how-head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: end;
  margin-bottom: 80px;
}
.how-head p {
  font-size: 17px;
  color: var(--ink-soft);
  line-height: 1.6;
}
.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  position: relative;
}
.step {
  background: var(--bone);
  border-radius: 20px;
  padding: 36px 32px;
  border: 1px solid var(--line);
  position: relative;
}
.step-num {
  font-family: 'Fraunces', serif;
  font-size: 56px;
  font-weight: 300;
  font-style: italic;
  color: var(--terracotta);
  line-height: 1;
  margin-bottom: 24px;
  display: block;
}
.step h3 {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}
.step p {
  font-size: 15px;
  color: var(--ink-soft);
  line-height: 1.55;
}

/* ====== WHATSAPP MOCKUP SECTION ====== */
.wa-section {
  padding: 120px 0;
  background: var(--bone);
}
.wa-grid {
  display: grid;
  grid-template-columns: 1fr 0.85fr;
  gap: 80px;
  align-items: center;
}
.wa-points { list-style: none; margin-top: 40px; }
.wa-points li {
  display: flex;
  gap: 20px;
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
}
.wa-points li:last-child { border-bottom: none; }
.wa-icon {
  flex-shrink: 0;
  width: 44px; height: 44px;
  background: var(--sage);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 18px;
}
.wa-points h4 {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 4px;
}
.wa-points p { font-size: 14.5px; color: var(--ink-soft); line-height: 1.5; }

.phone-frame {
  max-width: 360px;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 44px;
  padding: 12px;
  box-shadow: 0 50px 80px -30px rgba(42,31,21,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
}
.phone-screen {
  background: #ECE5DD;
  border-radius: 32px;
  overflow: hidden;
  position: relative;
  height: 620px;
}
.wa-statusbar {
  background: #075E54;
  padding: 14px 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}
.wa-back { font-size: 18px; opacity: 0.9; }
.wa-pic {
  width: 36px; height: 36px; border-radius: 50%;
  background: #FBF7F0;
  background-image: url('/recetas-cami/guia/cuchi.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-weight: 500;
  font-size: 14px;
  overflow: hidden;
}
.wa-name { font-size: 14.5px; font-weight: 500; line-height: 1.1; }
.wa-online { font-size: 11px; opacity: 0.75; }
.wa-chat-area {
  scroll-behavior: smooth;
  overflow-y: auto;
  background-image:
    radial-gradient(rgba(0,0,0,0.025) 1px, transparent 1px),
    radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px);
  background-size: 20px 20px, 12px 12px;
  background-position: 0 0, 6px 6px;
  background-color: #ECE5DD;
  padding: 18px 12px;
  height: calc(100% - 62px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}
.wa-bubble {
  max-width: 78%;
  padding: 8px 12px 6px;
  border-radius: 8px;
  font-size: 13.5px;
  line-height: 1.4;
  color: #303030;
  position: relative;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .35s ease, transform .35s ease;
}
.wa-bubble.visible { opacity: 1; transform: translateY(0); }
.wa-bubble.mine {
  background: #DCF8C6;
  align-self: flex-end;
  border-top-right-radius: 2px;
}
.wa-bubble.theirs {
  background: white;
  align-self: flex-start;
  border-top-left-radius: 2px;
}

.wa-time { font-size: 9.5px; color: #999; float: right; margin-left: 8px; margin-top: 2px; }
@keyframes bubbleIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.wa-pdf-card {
  background: white;
  align-self: flex-start;
  transition: opacity .35s ease, transform .35s ease;
  border-radius: 8px;
  border-top-left-radius: 2px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 78%;
  opacity: 0;
  transform: translateY(8px);
}
.wa-pdf-card.visible { opacity: 1; transform: translateY(0); }
.wa-pdf-icon {
  width: 38px; height: 44px;
  background: var(--terracotta);
  border-radius: 4px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.wa-pdf-info { font-size: 13px; color: #303030; }
.wa-pdf-info small { display: block; color: #999; font-size: 11px; margin-top: 2px; }

/* ====== INSIDE THE GUIDE ====== */
.inside {
  padding: 120px 0;
  background: var(--ink);
  color: var(--bone);
  position: relative;
  overflow: hidden;
}
.inside::before {
  content: '';
  position: absolute;
  top: -200px; right: -200px;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(184,98,63,0.25), transparent 70%);
  pointer-events: none;
}
.inside .section-label { color: var(--ochre); }
.inside .section-label::before { background: var(--ochre); }
.inside h2.section-h { color: var(--bone); }
.inside h2.section-h .it { color: var(--ochre); }

.preview-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
  margin-top: 64px;
}
.preview-card {
  background: var(--bone);
  border-radius: 14px;
  overflow: hidden;
  color: var(--ink);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  min-height: 220px;
}
.preview-card .pc-img {
  flex: 1;
  border-radius: 8px;
  background:
    repeating-linear-gradient(45deg, transparent 0 10px, rgba(42,31,21,0.05) 10px 11px),
    linear-gradient(135deg, var(--cream) 0%, var(--cream-deep) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--ink-mute);
}
.preview-card .pc-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--terracotta);
}
.preview-card h4 {
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
}
.preview-card .pc-meta {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: var(--ink-soft);
  border-top: 1px solid var(--line);
  padding-top: 12px;
}
.pc-1 { grid-column: span 5; min-height: 380px; }
.pc-2 { grid-column: span 4; }
.pc-3 { grid-column: span 3; background: var(--terracotta); color: var(--bone); }
.pc-3 h4 { color: var(--bone); }
.pc-3 .pc-tag { color: var(--ochre); }
.pc-3 .pc-meta { color: rgba(251,247,240,0.7); border-color: rgba(251,247,240,0.15); }
.pc-4 { grid-column: span 4; }
.pc-5 { grid-column: span 3; background: var(--sage); color: var(--bone); }
.pc-5 h4 { color: var(--bone); }
.pc-5 .pc-tag { color: var(--bone); opacity: 0.8; }
.pc-5 .pc-meta { color: rgba(251,247,240,0.7); border-color: rgba(251,247,240,0.15); }
.pc-1 .pc-img { min-height: 200px; }

/* ====== ABOUT CAMI ====== */
.about {
  padding: 120px 0;
  background: var(--bone-warm);
}
.about-grid {
  display: grid;
  grid-template-columns: 0.85fr 1fr;
  gap: 80px;
  align-items: center;
}
.about-photo-wrap {
  position: relative;
}
.about-photo {
  width: 100%;
  aspect-ratio: 4/5;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 60px -25px rgba(42,31,21,0.3);
}
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
  font-size: 16px;
  color: var(--ink);
  max-width: 180px;
  line-height: 1.3;
}
.about-tag strong { display: block; font-style: normal; font-weight: 600; color: var(--terracotta); margin-bottom: 4px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }

.about p {
  font-size: 18px;
  color: var(--ink-soft);
  line-height: 1.65;
  margin-bottom: 20px;
}
.about p:first-of-type::first-letter {
  font-family: 'Fraunces', serif;
  font-size: 64px;
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
  font-size: 28px;
  color: var(--terracotta);
  margin-top: 24px;
}

.about-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 36px;
  padding-top: 32px;
  border-top: 1px solid var(--line-strong);
}
.about-stat .num {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: 44px;
  color: var(--terracotta);
  line-height: 1;
  letter-spacing: -0.02em;
}
.about-stat .num em { font-style: italic; font-weight: 300; }
.about-stat .lbl {
  font-size: 12.5px;
  color: var(--ink-soft);
  margin-top: 8px;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

/* ====== VALUE STACK / EARLY BIRD ====== */
.value {
  padding: 120px 0;
  background: var(--bone);
}
.value-card {
  background: linear-gradient(135deg, var(--ink) 0%, #1a1208 100%);
  color: var(--bone);
  border-radius: 28px;
  padding: 64px;
  position: relative;
  overflow: hidden;
}
.value-card::before {
  content: '';
  position: absolute;
  top: -100px; right: -100px;
  width: 320px; height: 320px;
  background: var(--ochre);
  border-radius: 50%;
  opacity: 0.12;
  filter: blur(40px);
}
.value-card::after {
  content: '';
  position: absolute;
  bottom: -120px; left: -80px;
  width: 280px; height: 280px;
  background: var(--terracotta);
  border-radius: 50%;
  opacity: 0.18;
  filter: blur(50px);
}
.value-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  position: relative;
  z-index: 1;
}
.value-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(212,160,82,0.15);
  border: 1px solid rgba(212,160,82,0.3);
  color: var(--ochre);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 20px;
}
.value-card h2 {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.05;
  margin-bottom: 24px;
  letter-spacing: -0.025em;
}
.value-card h2 .it { font-style: italic; color: var(--ochre); font-weight: 300; }
.value-card .blurb {
  font-size: 16.5px;
  opacity: 0.8;
  line-height: 1.6;
  margin-bottom: 32px;
}
.includes {
  list-style: none;
}
.includes li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px 0;
  font-size: 15px;
  border-bottom: 1px solid rgba(251,247,240,0.08);
}
.includes li:last-child { border-bottom: none; }
.includes .ck {
  flex-shrink: 0;
  width: 22px; height: 22px;
  background: var(--ochre);
  border-radius: 50%;
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  margin-top: 1px;
}
.includes strong { display: block; color: var(--bone); margin-bottom: 2px; font-weight: 500; }
.includes span { color: rgba(251,247,240,0.65); font-size: 13.5px; }

.price-block {
  background: rgba(251,247,240,0.05);
  border: 1px solid rgba(251,247,240,0.1);
  border-radius: 18px;
  padding: 32px;
  backdrop-filter: blur(10px);
}
.price-line {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 6px;
}
.price-old {
  font-family: 'Fraunces', serif;
  font-size: 24px;
  text-decoration: line-through;
  color: rgba(251,247,240,0.4);
  font-weight: 300;
}
.price-now {
  font-family: 'Fraunces', serif;
  font-size: 64px;
  color: var(--ochre);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
}
.price-now em { font-style: italic; font-weight: 300; }
.price-sub {
  font-size: 13.5px;
  color: rgba(251,247,240,0.65);
  margin-bottom: 28px;
}
.scarcity {
  margin-bottom: 28px;
}
.scarcity-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(251,247,240,0.6);
}
.scarcity-bar {
  width: 100%;
  height: 6px;
  background: rgba(251,247,240,0.1);
  border-radius: 3px;
  overflow: hidden;
}
.scarcity-fill {
  height: 100%;
  width: 73%;
  background: linear-gradient(90deg, var(--terracotta-soft), var(--ochre));
  border-radius: 3px;
}

.value-form { display: flex; flex-direction: column; gap: 12px; }
.value-form input {
  width: 100%;
  padding: 16px 18px;
  font-family: inherit;
  font-size: 15px;
  color: var(--bone);
  background: rgba(251,247,240,0.06);
  border: 1px solid rgba(251,247,240,0.15);
  border-radius: 12px;
  transition: border-color .2s, background .2s;
}
.value-form input::placeholder { color: rgba(251,247,240,0.45); }
.value-form input:focus {
  outline: none;
  border-color: var(--ochre);
  background: rgba(251,247,240,0.1);
}
.value-form button {
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
.value-form button:hover { background: #E0AE5E; }
.value-form button:active { transform: scale(0.98); }
.fineprint {
  font-size: 11.5px;
  color: rgba(251,247,240,0.5);
  text-align: center;
  margin-top: 4px;
  line-height: 1.5;
}

/* ====== FAQ ====== */
.faq-section {
  padding: 120px 0;
  background: var(--bone);
}
.faq-grid {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 80px;
  align-items: start;
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.faq-item {
  border-bottom: 1px solid var(--line-strong);
  cursor: pointer;
}
.faq-q {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: -0.01em;
  user-select: none;
}
.faq-toggle {
  width: 32px; height: 32px;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: transform .3s, background .2s;
  flex-shrink: 0;
  margin-left: 16px;
}
.faq-item.open .faq-toggle {
  background: var(--ink);
  color: var(--bone);
  transform: rotate(45deg);
}
.faq-a {
  max-height: 0;
  overflow: hidden;
  transition: max-height .35s ease, padding .35s ease;
  font-size: 15.5px;
  color: var(--ink-soft);
  line-height: 1.65;
  padding-right: 60px;
}
.faq-item.open .faq-a {
  max-height: 240px;
  padding-bottom: 24px;
}

/* ====== FOOTER ====== */
footer.foot {
  background: var(--ink);
  color: var(--bone);
  padding: 80px 0 32px;
}
.foot-top {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 60px;
  margin-bottom: 60px;
}
.foot-brand .logo { color: var(--bone); margin-bottom: 18px; }
.foot-brand p { color: rgba(251,247,240,0.65); font-size: 14.5px; line-height: 1.6; max-width: 320px; }
.foot-col h5 {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ochre);
  margin-bottom: 16px;
  font-weight: 600;
}
.foot-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.foot-col a { color: rgba(251,247,240,0.75); text-decoration: none; font-size: 14.5px; transition: color .2s; }
.foot-col a:hover { color: var(--ochre); }
.foot-bottom {
  border-top: 1px solid rgba(251,247,240,0.1);
  padding-top: 28px;
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: rgba(251,247,240,0.45);
}

/* ====== SOCIAL POPUP ====== */
/* ====== STICKY DISCOUNT BANNER ====== */
.sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(95deg, #C8553D 0%, #B04A36 100%);
  color: #FBF7F0;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  z-index: 1500;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.18);
  transform: translateY(100%);
  transition: transform .5s cubic-bezier(0.4,0,0.2,1);
  flex-wrap: wrap;
}
.sticky-cta.show { transform: translateY(0); }
.sticky-cta-text {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.sticky-cta-pulse {
  width: 10px;
  height: 10px;
  background: #F4C26B;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(244,194,107,0.8);
  animation: stickyPulse 1.6s infinite;
  flex-shrink: 0;
}
@keyframes stickyPulse {
  0% { box-shadow: 0 0 0 0 rgba(244,194,107,0.8); }
  70% { box-shadow: 0 0 0 12px rgba(244,194,107,0); }
  100% { box-shadow: 0 0 0 0 rgba(244,194,107,0); }
}
.sticky-cta-headline {
  font-family: 'Fraunces', serif;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.sticky-cta-headline em {
  font-style: italic;
  color: #F4C26B;
  font-weight: 600;
}
.sticky-cta-sub {
  font-size: 12.5px;
  opacity: 0.85;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sticky-cta-timer {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  background: rgba(0,0,0,0.22);
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.05em;
  font-weight: 600;
}
.sticky-cta-btn {
  background: #FBF7F0;
  color: #1A1A1A;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14.5px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform .2s ease, box-shadow .2s ease;
  white-space: nowrap;
}
.sticky-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
}
.sticky-cta-close {
  position: absolute;
  top: 6px;
  right: 10px;
  background: transparent;
  border: none;
  color: rgba(251,247,240,0.6);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
}
.sticky-cta-close:hover { color: #FBF7F0; }
@media (max-width: 720px) {
  .sticky-cta { padding: 12px 14px 14px; gap: 12px; }
  .sticky-cta-headline { font-size: 14.5px; }
  .sticky-cta-sub { font-size: 11px; }
  .sticky-cta-btn { padding: 10px 18px; font-size: 13.5px; }
  .sticky-cta-text { gap: 10px; flex: 1 1 100%; justify-content: center; text-align: center; }
}

/* Inline CTA strip between sections */
.inline-cta {
  background: linear-gradient(95deg, #1A1A1A 0%, #2A2A2A 100%);
  color: #FBF7F0;
  border-radius: 18px;
  padding: 32px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  flex-wrap: wrap;
  margin: 80px auto;
  max-width: 1080px;
  position: relative;
  overflow: hidden;
}
.inline-cta::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(200,85,61,0.35) 0%, transparent 70%);
  pointer-events: none;
}
.inline-cta-text { position: relative; z-index: 1; }
.inline-cta-eyebrow {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #F4C26B;
  font-weight: 600;
  margin-bottom: 8px;
}
.inline-cta h3 {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.2;
  max-width: 520px;
}
.inline-cta h3 em { font-style: italic; color: #F4C26B; }
.inline-cta-btn {
  background: #C8553D;
  color: #FBF7F0;
  padding: 16px 28px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: transform .2s ease, box-shadow .2s ease;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}
.inline-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(200,85,61,0.4);
}
@media (max-width: 720px) {
  .inline-cta { padding: 28px 24px; margin: 60px 16px; }
  .inline-cta h3 { font-size: 22px; }
}

.popup {
  position: fixed;
  bottom: 96px;
  left: 24px;
  background: var(--bone);
  border-radius: 16px;
  padding: 14px 18px 14px 14px;
  box-shadow: 0 20px 50px -10px rgba(42,31,21,0.25);
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 320px;
  border: 1px solid var(--line);
  transform: translateX(-130%);
  transition: transform .5s cubic-bezier(0.4,0,0.2,1);
  z-index: 1000;
}
.popup.show { transform: translateX(0); }
.popup-av {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: var(--terracotta);
  color: white;
  font-family: 'Fraunces', serif;
  font-weight: 500;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.popup-text { font-size: 13.5px; color: var(--ink); line-height: 1.4; }
.popup-text strong { font-weight: 600; }
.popup-time {
  font-size: 11px;
  color: var(--ink-mute);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
}
.popup-dot {
  width: 6px; height: 6px;
  background: #6FCF97;
  border-radius: 50%;
}

/* ====== SUCCESS STATE ====== */
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(42,31,21,0.6);
  backdrop-filter: blur(8px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
}
.success-overlay.show { display: flex; }
.success-modal {
  background: var(--bone);
  border-radius: 24px;
  padding: 56px 48px;
  max-width: 480px;
  text-align: center;
  position: relative;
  animation: pop .4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.success-icon {
  width: 72px; height: 72px;
  background: var(--sage);
  border-radius: 50%;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
}
.success-modal h3 {
  font-family: 'Fraunces', serif;
  font-size: 32px;
  margin-bottom: 12px;
  font-weight: 500;
  letter-spacing: -0.02em;
}
.success-modal p { color: var(--ink-soft); font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
.success-modal button {
  background: var(--ink);
  color: var(--bone);
  border: none;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}

/* ====== RESPONSIVE ====== */
@media (max-width: 980px) {
  .hero-grid, .how-head, .wa-grid, .about-grid, .value-grid, .faq-grid, .foot-top { grid-template-columns: 1fr; gap: 40px; }
  .hero-visual { height: 480px; }
  .pain-quotes, .steps { grid-template-columns: 1fr; }
  .preview-grid { grid-template-columns: repeat(2, 1fr); }
  .pc-1, .pc-2, .pc-3, .pc-4, .pc-5 { grid-column: span 1; }
  .pc-1 { grid-column: span 2; min-height: 280px; }
  .value-card { padding: 40px 28px; }
  .about-stats { grid-template-columns: repeat(3, 1fr); }
  .marquee-item { font-size: 20px; gap: 36px; }
  .marquee-track { gap: 36px; }
}
@media (max-width: 640px) {
  .container { padding: 0 20px; }
  nav.top { padding: 16px 20px; }
  .hero { padding: 16px 0 60px; }
  .pain, .how, .wa-section, .inside, .about, .value, .faq-section { padding: 80px 0; }
  .preview-grid { grid-template-columns: 1fr; }
  .pc-1 { grid-column: span 1; min-height: 240px; }
  .about-stats { grid-template-columns: 1fr; gap: 16px; }
  .about-tag { right: 0; bottom: -16px; padding: 14px 18px; font-size: 14px; }
  .quote-card { padding: 24px; }
  .value-card { padding: 32px 22px; border-radius: 20px; }
  .price-now { font-size: 52px; }
  .popup { left: 12px; right: 12px; max-width: none; }
  .success-modal { padding: 40px 28px; }
  .nav-cta { display: none; }
}
</style>
<template id="__bundler_thumbnail">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#F5EFE6"/><g transform="translate(120,120)"><circle cx="80" cy="80" r="80" fill="#C8553D"/><text x="80" y="98" text-anchor="middle" font-family="Georgia,serif" font-size="80" font-style="italic" fill="#F5EFE6">C</text></g></svg>
</template>
</head>
<body>

<!-- Announcement -->
<div class="announce">
  <span class="pulse"></span>
  <span>Oferta de lanzamiento activa · <strong>27 cupos restantes</strong> con descuento</span>
</div>

<!-- Nav -->
<nav class="top">
  <div class="logo">
    <span>cami<em>.</em> <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:500;color:var(--ink-soft);letter-spacing:0.04em;text-transform:uppercase;margin-left:6px;">Hecho con <span style="color:#C8553D;">♥</span></span></span>
  </div>
  <a href="#cta" class="nav-cta">Quiero entrar</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="container hero-grid">
    <div>
      <div class="eyebrow"><span class="dot"></span>Lanzamiento · Mayo 2026</div>
      <h1 class="headline">
        Libérate del<br>
        <span class="strike">"¿qué cocino</span><br>
        <span class="it">hoy?"</span>
      </h1>
      <p class="lede">Una guía con 20 recetas, todas en menos de 30 minutos, lista de compras y plan semanal — todo directo a tu WhatsApp. Y Cuchi, tu IA de cocina, te acompaña paso a paso. Cocinas sin pensar, comes rico, recuperas tus tardes.</p>
      <div class="hero-actions">
        <a href="#cta" class="btn btn-primary">Comprar la guía <span class="arrow">→</span></a>
        <a href="#how" class="btn btn-ghost">Ver cómo funciona</a>
      </div>
      <div class="trust">
        <div class="avatars">
          <div class="av a1">M</div>
          <div class="av a2">L</div>
          <div class="av a3">V</div>
          <div class="av a4">+</div>
        </div>
        <div class="trust-text">
          <div class="stars">★★★★★</div>
          <div><strong>+800.000 mujeres</strong> siguen mis recetas · 4.9/5 en la versión beta</div>
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
          <span>$ Bajo</span>
        </div>
      </div>
      <div class="sticker">
        Lanzamiento<em>40%</em>OFF
      </div>
    </div>
  </div>
</section>

<!-- Marquee -->
<div class="marquee">
  <div class="marquee-track">
    <span class="marquee-item">20 recetas para todo el mes</span>
    <span class="marquee-item">Cuchi, tu IA de cocina 24/7</span>
    <span class="marquee-item">Lista de compras lista</span>
    <span class="marquee-item">Plan semanal armado</span>
    <span class="marquee-item">Directo a tu WhatsApp</span>
    <span class="marquee-item">20 recetas para todo el mes</span>
    <span class="marquee-item">Cuchi, tu IA de cocina 24/7</span>
    <span class="marquee-item">Lista de compras lista</span>
    <span class="marquee-item">Plan semanal armado</span>
    <span class="marquee-item">Directo a tu WhatsApp</span>
  </div>
</div>

<!-- PAIN -->
<section class="pain">
  <div class="container">
    <div class="section-label">El problema</div>
    <h2 class="section-h">Son las 7 de la tarde y otra vez<br>la misma <span class="it">pregunta agotadora.</span></h2>
    <p style="font-size:15px;color:var(--ink-soft);max-width:560px;margin-top:8px;">Esto es lo que nos contaron <strong style="color:var(--sage-deep);">las usuarias beta</strong> antes de empezar:</p>
    <div class="pain-quotes">
      <div class="quote-card">
        <span class="beta-badge">Usuaria beta</span>
        <p>Llegaba del trabajo y no tenía cabeza para pensar qué hacer. Terminaba pidiendo delivery tres veces por semana.</p>
        <div class="who">
          <div class="who-av" style="background-image:url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces');"></div>
          <div class="who-meta"><strong>Martina, 34</strong>Mamá de 2, freelancer</div>
        </div>
      </div>
      <div class="quote-card">
        <span class="beta-badge">Usuaria beta</span>
        <p>Tenía la nevera llena y sentía que no había nada para comer. Tiraba dinero todas las semanas.</p>
        <div class="who">
          <div class="who-av" style="background-image:url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces');"></div>
          <div class="who-meta"><strong>Lucía, 29</strong>Vive sola, oficina full-time</div>
        </div>
      </div>
      <div class="quote-card">
        <span class="beta-badge">Usuaria beta</span>
        <p>Miraba recetas en Instagram, guardaba cien y nunca cocinaba ninguna. Era ruido, no soluciones.</p>
        <div class="who">
          <div class="who-av" style="background-image:url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces');"></div>
          <div class="who-meta"><strong>Valentina, 41</strong>Mamá, emprendedora</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- INLINE CTA #1 -->
<div class="container">
  <div class="inline-cta">
    <div class="inline-cta-text">
      <div class="inline-cta-eyebrow">Lanzamiento · -40% por 48hs</div>
      <h3>¿Y si esta noche cocinas algo <em>distinto</em>?</h3>
    </div>
    <a href="#cta" class="inline-cta-btn">Quiero la guía con descuento <span>→</span></a>
  </div>
</div>

<!-- HOW -->
<section class="how" id="how">
  <div class="container">
    <div class="how-head">
      <div>
        <div class="section-label">Cómo funciona</div>
        <h2 class="section-h">Tres pasos. <span class="it">Cero fricción.</span></h2>
      </div>
      <p>Sin descargar apps. Sin crear cuentas. Sin tutoriales. La guía llega cada mes a tu WhatsApp como un mensaje más — pero el que te resuelve la semana entera.</p>
    </div>
    <div class="steps">
      <div class="step">
        <span class="step-num">01</span>
        <h3>Compras la guía</h3>
        <p>Pago único. Dejas tu email y WhatsApp. Te llega todo al instante: las 20 recetas, el plan semanal y la lista de compras.</p>
      </div>
      <div class="step">
        <span class="step-num">02</span>
        <h3>Conoces a Cuchi</h3>
        <p>Cuchi es tu IA de cocina por WhatsApp. Le preguntas qué hacer si te falta un ingrediente, cómo cambiar una receta, cuánto rinde. Responde al instante, las 24h.</p>
      </div>
      <div class="step">
        <span class="step-num">03</span>
        <h3>Cocinas sin pensar</h3>
        <p>Abres el plan, miras qué necesitas, lo compras todo junto. Cocinas con Cuchi de copiloto. Sin caos, sin culpa, sin pedir delivery.</p>
      </div>
    </div>
  </div>
</section>

<!-- WHATSAPP -->
<section class="wa-section">
  <div class="container wa-grid">
    <div>
      <div class="section-label">El canal</div>
      <h2 class="section-h">Donde ya<br>estás todos los días: <span class="it">tu WhatsApp.</span></h2>
      <p style="font-size:17px;color:var(--ink-soft);max-width:480px;line-height:1.6;">Olvídate de buscar el PDF perdido en Drive o de abrir una app más. La guía llega a tu chat. Y Cuchi, tu IA, te responde como una amiga que sabe cocinar.</p>
      <ul class="wa-points">
        <li>
          <div class="wa-icon">↻</div>
          <div>
            <h4>Pago único, todo de una</h4>
            <p>Compras la guía y recibes todo al instante. Sin suscripciones, sin cobros mensuales.</p>
          </div>
        </li>
        <li>
          <div class="wa-icon">↺</div>
          <div>
            <h4>Cuchi te responde 24/7</h4>
            <p>¿Te falta un ingrediente? ¿No sabes con qué cambiarlo? Le escribes a Cuchi y te resuelve al instante.</p>
          </div>
        </li>
        <li>
          <div class="wa-icon">✦</div>
          <div>
            <h4>Audios y videos cortos</h4>
            <p>Trucos de Cami en 30 segundos. Los escuchas mientras cocinas, sin manos en el teléfono.</p>
          </div>
        </li>
      </ul>
    </div>
    <div class="phone-frame">
      <div class="phone-screen">
        <div class="wa-statusbar">
          <span class="wa-back">‹</span>
          <div class="wa-pic"></div>
          <div>
            <div class="wa-name">Cuchi · IA de cocina</div>
            <div class="wa-online">en línea</div>
          </div>
        </div>
        <div class="wa-chat-area">
          <div class="wa-bubble theirs">¡Hola Mar! Aquí está tu guía con las 20 recetas 🌿<span class="wa-time">9:02</span></div>
          <div class="wa-pdf-card">
            <div class="wa-pdf-icon">PDF</div>
            <div class="wa-pdf-info">Guia-Cami-20-recetas.pdf<small>2.4 MB · 48 páginas</small></div>
          </div>
          <div class="wa-bubble mine">Me falta cilantro para los rollitos 🙃<span class="wa-time">9:14</span></div>
          <div class="wa-bubble theirs">Sin problema. Usa perejil + un toque de lima. Queda igual de fresco ✨<span class="wa-time">9:14</span></div>
          <div class="wa-bubble mine">¿Y si lo hago para 6 personas?<span class="wa-time">9:15</span></div>
          <div class="wa-bubble theirs">Multiplica todo x1.5. Carne: 750g, tortillas: 9, cilantro: 1 manojo grande 📝<span class="wa-time">9:15</span></div>
          <div class="wa-bubble mine">¿Me queda calabacín de ayer, qué hago?<span class="wa-time">9:18</span></div>
          <div class="wa-bubble theirs">Córtalo en bastones, saltéalo 4 min con ajo y lo agregas adentro del rollito. Queda buenísimo 🔥<span class="wa-time">9:18</span></div>
          <div class="wa-bubble mine">Eres lo mejor Cuchi 🙌<span class="wa-time">9:19</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- INSIDE THE GUIDE -->
<section class="inside">
  <div class="container">
    <div class="section-label">Adentro de la guía</div>
    <h2 class="section-h">20 recetas, todas <span class="it">en menos de 30 minutos.</span></h2>
    <div class="preview-grid">
      <div class="preview-card pc-1">
        <div class="pc-tag">Plato fuerte · destacada</div>
        <div class="pc-img" style="background:none;padding:0;overflow:hidden;"><img src="/recetas-cami/guia/gnocchis.jpg" alt="Ñoquis con salsa de tomate y queso" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
        <h4>Ñoquis caseros con salsa de tomate</h4>
        <div class="pc-meta"><span>⏱ 25 min</span><span>👥 4</span><span>$ Bajo</span></div>
      </div>
      <div class="preview-card pc-2">
        <div class="pc-tag">Express</div>
        <div class="pc-img" style="background:none;padding:0;overflow:hidden;"><img src="/recetas-cami/guia/05-hamburguesa-lentejas.jpg" alt="Hamburguesa de lentejas con verduras frescas" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
        <h4>Hamburguesa de lentejas con ensalada</h4>
        <div class="pc-meta"><span>⏱ 25 min</span><span>👥 2</span></div>
      </div>
      <div class="preview-card pc-3">
        <div class="pc-tag">Opción vegetariana</div>
        <h4>Hamburguesas de lenteja<br>con ensalada</h4>
        <div class="pc-meta"><span>⏱ 25 min</span></div>
      </div>
      <div class="preview-card pc-4">
        <div class="pc-tag">Familiar</div>
        <div class="pc-img" style="background:none;padding:0;overflow:hidden;"><img src="/recetas-cami/guia/01-rollitos.jpg" alt="Rollitos de carne" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
        <h4>Rollitos de carne tiernos al wok</h4>
        <div class="pc-meta"><span>⏱ 30 min</span><span>👥 4</span></div>
      </div>
      <div class="preview-card pc-5">
        <div class="pc-tag">Plato fuerte</div>
        <h4>Rollitos de Carne</h4>
        <div class="pc-meta"><span>⏱ 25 min</span></div>
      </div>

    </div>
  </div>
</section>

<!-- ABOUT CAMI -->
<section class="about">
  <div class="container about-grid">
    <div class="about-photo-wrap">
      <div class="about-photo">
        <img src="/recetas-cami/guia/04-cami.jpg" alt="Cami en su cocina" style="width:100%;height:100%;object-fit:cover;display:block;">
      </div>
      <div class="about-tag" style="display:none;">
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
      <div class="about-stats">
        <div class="about-stat">
          <div class="num">8<em>años</em></div>
          <div class="lbl">Cocinando<br>y compartiendo</div>
        </div>
        <div class="about-stat">
          <div class="num">+180k</div>
          <div class="lbl">Familias<br>en la comunidad</div>
        </div>
        <div class="about-stat">
          <div class="num">4.9<em>/5</em></div>
          <div class="lbl">Calificación<br>en la versión beta</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- INLINE CTA #2 -->
<div class="container">
  <div class="inline-cta">
    <div class="inline-cta-text">
      <div class="inline-cta-eyebrow">Precio de lanzamiento · termina pronto</div>
      <h3>Súmate hoy y ahorra <em>USD $20</em>.</h3>
    </div>
    <a href="#cta" class="inline-cta-btn">Comprar con -40% <span>→</span></a>
  </div>
</div>

<!-- VALUE / EARLY BIRD -->
<section class="value" id="cta">
  <div class="container">
    <div class="value-card">
      <div class="value-grid">
        <div>
          <div class="value-badge">★ Precio de lanzamiento · solo lista de espera</div>
          <h2>Compra una vez. <span class="it">Cocina<br>todo el mes.</span></h2>
          <p class="blurb">Las primeras 100 personas se llevan la guía con un descuento exclusivo. Pago único, sin renovaciones, sin sorpresas.</p>
          <ul class="includes">
            <li><span class="ck">✓</span><div><strong>20 recetas para todo el mes</strong><span>Probadas, fotografiadas, con video corto.</span></div></li>
            <li><span class="ck">✓</span><div><strong>Plan semanal + lista de compras</strong><span>Ya organizado por días. Editable.</span></div></li>
            <li><span class="ck">✓</span><div><strong>Cuchi, tu IA de cocina por WhatsApp</strong><span>Resuelve dudas 24/7 mientras cocinas.</span></div></li>
            <li><span class="ck">✓</span><div><strong>Audios y videos cortos de Cami</strong><span>Trucos en 30 segundos, manos libres.</span></div></li>
            <li><span class="ck">✓</span><div><strong>Bonus: 5 recetas secretas</strong><span>Recetas exclusivas que solo reciben las compradoras de la guía.</span></div></li>
          </ul>
        </div>
        <div class="price-block">
          <div class="price-line">
            <span class="price-old">USD $47</span>
            <span class="price-now">USD $<em>27</em></span>
          </div>
          <div class="price-sub">pago único · acceso inmediato</div>
          <div class="scarcity">
            <div class="scarcity-row">
              <span>Cupos de lanzamiento</span>
              <span><strong style="color:var(--ochre)">73/100 tomados</strong></span>
            </div>
            <div class="scarcity-bar"><div class="scarcity-fill"></div></div>
          </div>
          <a href="https://checkout.dlocalgo.com/payment-link/CHANGEME" target="_blank" rel="noopener" class="value-form-cta" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:18px 24px;font-family:inherit;font-size:15px;font-weight:600;color:var(--ink);background:var(--ochre);border:none;border-radius:12px;cursor:pointer;transition:background .2s, transform .1s;text-decoration:none;box-shadow:0 10px 30px -10px rgba(212,160,82,0.5);">Comprar ahora · USD $27 <span>→</span></a>
          <p class="fineprint">Pago seguro · acceso inmediato a la guía + Cuchi.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="faq-section">
  <div class="container faq-grid">
    <div>
      <div class="section-label">Preguntas frecuentes</div>
      <h2 class="section-h">Lo que <span class="it">probablemente</span> te estás preguntando.</h2>
      <p style="color:var(--ink-soft);font-size:15.5px;line-height:1.6;margin-top:16px;max-width:320px;">¿Falta algo? Escríbenos a hola@cami.com — respondemos en menos de 24h.</p>
    </div>
    <div class="faq-list">
      <div class="faq-item open">
        <div class="faq-q">¿Es una suscripción? <span class="faq-toggle">+</span></div>
        <div class="faq-a">No. Es un pago único. Compras la guía, recibes las 20 recetas + plan + lista de compras y acceso a Cuchi por WhatsApp. Sin renovaciones automáticas, sin sorpresas.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">¿Qué es Cuchi exactamente? <span class="faq-toggle">+</span></div>
        <div class="faq-a">Cuchi es una IA de cocina entrenada con las recetas y el estilo de Cami. Le escribes por WhatsApp cualquier duda mientras cocinas — reemplazos, porciones, técnicas, qué hacer con lo que te queda en la nevera — y te responde al instante, 24/7.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">¿Sirve si vivo sola o cocino para muchos? <span class="faq-toggle">+</span></div>
        <div class="faq-a">Sí. Cada receta indica porciones y cómo escalar. El plan se adapta a 1, 2, 4 o 6 personas — y Cuchi te ayuda a ajustar cantidades al instante.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">¿Soy vegetariana o tengo restricciones? <span class="faq-toggle">+</span></div>
        <div class="faq-a">La guía incluye un mix balanceado y todas las recetas tienen sustituciones sugeridas. Si tienes restricciones específicas, le preguntas a Cuchi y te adapta cualquier receta.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">¿Cómo recibo todo? <span class="faq-toggle">+</span></div>
        <div class="faq-a">100% por WhatsApp: PDF de la guía, audios y videos cortos. También te llega copia por email. Cuchi queda en tu chat para escribirle cuando quieras.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">¿Por qué WhatsApp y no una app? <span class="faq-toggle">+</span></div>
        <div class="faq-a">Porque ya estás ahí. Cero fricción, cero login. Y porque cocinar tiene que ser tan simple como abrir un chat.</div>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="foot">
  <div class="container">
    <div class="foot-top">
      <div class="foot-brand">
        <div class="logo">
          <span style="color:var(--bone)">cami<em>.</em> <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:500;color:rgba(251,247,240,0.7);letter-spacing:0.04em;text-transform:uppercase;margin-left:6px;">Hecho con <span style="color:#E8826A;">♥</span></span></span>
        </div>
        <p>La guía con 20 recetas que te libera del "¿qué cocino hoy?". Plan semanal, lista de compras y Cuchi, tu IA de cocina, todo a tu WhatsApp.</p>
      </div>
      <div class="foot-col">
        <h5>Enlaces</h5>
        <ul>
          <li><a href="#how">Cómo funciona</a></li>
          <li><a href="#cta">Precio de lanzamiento</a></li>
          <li><a href="#">Recetas gratis</a></li>
          <li><a href="#">Blog</a></li>
        </ul>
      </div>
      <div class="foot-col">
        <h5>Contacto</h5>
        <ul>
          <li><a href="mailto:hola@cami.com">hola@cami.com</a></li>
          <li><a href="#">Instagram</a></li>
          <li><a href="#">TikTok</a></li>
          <li><a href="#">WhatsApp</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 Cami Recetas. Hecho con 🥄 en Buenos Aires.</span>
      <span><a href="#" style="color:rgba(251,247,240,0.6);text-decoration:none;">Términos</a> · <a href="#" style="color:rgba(251,247,240,0.6);text-decoration:none;">Privacidad</a></span>
    </div>
  </div>
</footer>

<!-- STICKY DISCOUNT BANNER -->
<div class="sticky-cta" id="stickyCta">
  <button class="sticky-cta-close" id="stickyCtaClose" aria-label="Cerrar">×</button>
  <div class="sticky-cta-text">
    <span class="sticky-cta-pulse"></span>
    <div>
      <div class="sticky-cta-headline">Lanzamiento <em>-40% OFF</em> · solo hoy</div>
      <div class="sticky-cta-sub">Termina en <span class="sticky-cta-timer" id="stickyTimer">23:59:59</span></div>
    </div>
  </div>
  <a href="#cta" class="sticky-cta-btn">Quiero la guía <span>→</span></a>
</div>

<!-- Social popup -->
<div class="popup" id="popup">
  <div class="popup-av" id="popupAv">M</div>
  <div>
    <div class="popup-text" id="popupText"><strong>Martina</strong> de Santiago compró la guía</div>
    <div class="popup-time"><span class="popup-dot"></span>hace 2 minutos</div>
  </div>
</div>



<script>
// WhatsApp chat loop
(function() {
  const chat = document.querySelector('.wa-chat-area');
  if (!chat) return;
  const items = Array.from(chat.children);
  let idx = 0;
  function tick() {
    if (idx >= items.length) {
      // pause, then reset
      setTimeout(() => {
        items.forEach(el => el.classList.remove('visible'));
        chat.scrollTop = 0;
        idx = 0;
        setTimeout(tick, 800);
      }, 2500);
      return;
    }
    const el = items[idx];
    el.classList.add('visible');
    // scroll the new item into view inside the chat
    chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
    idx++;
    setTimeout(tick, 950);
  }
  // start when chat is visible
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(tick, 400);
        io.disconnect();
      }
    });
  }, { threshold: 0.4 });
  io.observe(chat);
})();

// Sticky discount banner: show after scroll, countdown, close
(function() {
  const banner = document.getElementById('stickyCta');
  const closeBtn = document.getElementById('stickyCtaClose');
  const timerEl = document.getElementById('stickyTimer');
  if (!banner || !timerEl) return;

  // Show after user scrolls past hero
  let dismissed = sessionStorage.getItem('stickyCtaClosed') === '1';
  function onScroll() {
    if (dismissed) return;
    if (window.scrollY > 600) banner.classList.add('show');
    else banner.classList.remove('show');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  closeBtn.addEventListener('click', () => {
    banner.classList.remove('show');
    dismissed = true;
    sessionStorage.setItem('stickyCtaClosed', '1');
  });

  // Countdown — resets to 23:59:59 daily, persists across reloads same day
  function getEndTime() {
    const stored = localStorage.getItem('stickyCtaEnd');
    const now = Date.now();
    if (stored && +stored > now) return +stored;
    const end = now + 24 * 60 * 60 * 1000;
    localStorage.setItem('stickyCtaEnd', String(end));
    return end;
  }
  const endTime = getEndTime();
  function updateTimer() {
    const diff = Math.max(0, endTime - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');
    timerEl.textContent = \`\${pad(h)}:\${pad(m)}:\${pad(s)}\`;
  }
  updateTimer();
  setInterval(updateTimer, 1000);
})();

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Social popup rotation
const popups = [
  { name: 'Martina', city: 'Santiago', initial: 'M', time: 'hace 2 minutos', action: 'compró la guía' },
  { name: 'Lucía', city: 'Viña del Mar', initial: 'L', time: 'hace 5 minutos', action: 'compró la guía' },
  { name: 'Valentina', city: 'Concepción', initial: 'V', time: 'hace 8 minutos', action: 'compró la guía' },
  { name: 'Sofía', city: 'Valparaíso', initial: 'S', time: 'hace 12 minutos', action: 'compró la guía' },
  { name: 'Camila', city: 'La Serena', initial: 'C', time: 'hace 15 minutos', action: 'compró la guía' },
];
let popupIdx = 0;
const popupEl = document.getElementById('popup');
const popupText = document.getElementById('popupText');
const popupAv = document.getElementById('popupAv');
const colors = ['var(--terracotta)', 'var(--sage)', 'var(--ochre)', 'var(--terracotta-deep)'];

function showPopup() {
  const p = popups[popupIdx % popups.length];
  popupText.innerHTML = \`<strong>\${p.name}</strong> de \${p.city} \${p.action}\`;
  popupAv.textContent = p.initial;
  popupAv.style.background = colors[popupIdx % colors.length];
  popupEl.querySelector('.popup-time').innerHTML = \`<span class="popup-dot"></span>\${p.time}\`;
  popupEl.classList.add('show');
  setTimeout(() => popupEl.classList.remove('show'), 4500);
  popupIdx++;
}
setTimeout(showPopup, 3000);
setInterval(showPopup, 9000);
</script>

</body>
</html>
`;

export async function GET() {
  return new Response(LANDING_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
    },
  });
}
