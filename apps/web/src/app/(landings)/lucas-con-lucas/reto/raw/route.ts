const LANDING_HTML = `<!DOCTYPE html>
<html lang="es-CL">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reto Lucas con Luca$ · 15 días de inversión inmobiliaria en Chile</title>
<meta name="description" content="Reto de 15 días - WhatsApp. De cero a inversor inmobiliario en Chile. Video diario por WhatsApp con Lucas, fundador de Flipeame. +150 propiedades flipeadas.">

<!--
  ============================================================
  PLACEHOLDERS A REEMPLAZAR ANTES DE LANZAR:
  ============================================================
  1. VSL: buscar el marcador "VSL_EMBED_HERE" en el body y reemplazar el div placeholder
     por el iframe de YouTube/Vimeo/Wistia.

  2. WhatsApp: buscar todas las apariciones de
     https://chat.whatsapp.com/FrS6wqhSWM2HdepEdajz92?mode=gi_t"$89.000" y "$39.000" para cambiarlos.

  4. Countdown + FECHAS DE COHORT: en el script al final, cambiar
     - const COHORT_START = new Date(...)  fecha real de inicio del reto
     - const DEADLINE = new Date(...)  cierre de inscripciones (ej: 1-2 días antes)
     Ambas fechas se renderizan automáticamente en el hero, precio y FAQ
     (buscar todos los spans con clase "fecha-cohort" o "fecha-cierre").

  5. Foto de Lucas: YA INCORPORADA (archivo lucas.jpg en el mismo folder).
     Si querés cambiarla, reemplazar lucas.jpg o cambiar el src del img id="lucas-foto".

  6. Testimonios: buscar la sección id="testimonios" y editar nombres,
     fotos y textos. Hoy hay 3 placeholders.
  ============================================================
-->

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">

<style>
  :root {
    --naranja: #E8622A;
    --naranja-oscuro: #C44A18;
    --amarillo: #F5C518;
    --amarillo-suave: #F9D957;
    --negro: #0E0E0E;
    --negro-suave: #161616;
    --negro-card: #1C1C1C;
    --gris: #2A2A2A;
    --gris-claro: #A5A5A5;
    --blanco: #F5F2EC;
    --blanco-puro: #FFFFFF;

    --display: 'Anton', 'Arial Narrow', sans-serif;
    --body: 'DM Sans', system-ui, sans-serif;
    --mono: 'Space Mono', 'Courier New', monospace;

    --max: 1240px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--negro);
    color: var(--blanco);
    font-family: var(--body);
    font-size: 17px;
    line-height: 1.55;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  /* Grain / noise overlay sutil */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0.04;
    background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
    mix-blend-mode: overlay;
  }

  /* ============ TOPBAR STICKY ============ */
  .topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--negro);
    border-bottom: 1px solid var(--gris);
    backdrop-filter: blur(8px);
  }

  .topbar-inner {
    max-width: var(--max);
    margin: 0 auto;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .logo {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    line-height: 1;
  }
  .logo-img {
    width: 110px;
    height: auto;
    display: block;
  }
  .logo-tag {
    font-family: var(--body);
    font-size: 9px;
    letter-spacing: 4px;
    font-weight: 700;
    color: var(--gris-claro);
    text-transform: uppercase;
    padding-left: 10px;
    border-left: 1px solid var(--gris);
  }
  @media (max-width: 520px) {
    .logo-img { width: 86px; }
    .logo-tag { display: none; }
  }

  .topbar-cta {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .topbar-timer {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--amarillo);
    letter-spacing: 1px;
    display: none;
  }
  @media (min-width: 720px) {
    .topbar-timer { display: block; }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 22px;
    background: var(--naranja);
    color: var(--blanco-puro);
    text-decoration: none;
    font-family: var(--body);
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.3px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 0 var(--naranja-oscuro);
    text-transform: uppercase;
    line-height: 1;
  }
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 var(--naranja-oscuro);
  }
  .btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--naranja-oscuro);
  }
  .btn-grande {
    padding: 22px 36px;
    font-size: 18px;
  }
  .btn-amarillo {
    background: var(--amarillo);
    color: var(--negro);
    box-shadow: 0 4px 0 #C9A20F;
  }
  .btn-amarillo:hover { box-shadow: 0 6px 0 #C9A20F; }
  .btn-amarillo:active { box-shadow: 0 1px 0 #C9A20F; }

  .btn-ghost {
    background: transparent;
    border: 2px solid var(--blanco);
    box-shadow: none;
    padding: 12px 20px;
  }
  .btn-ghost:hover { background: var(--blanco); color: var(--negro); }

  .topbar .btn { padding: 10px 18px; font-size: 13px; box-shadow: 0 3px 0 var(--naranja-oscuro); }

  /* ============ MARQUEE ============ */
  .marquee {
    background: var(--amarillo);
    color: var(--negro);
    border-top: 2px solid var(--negro);
    border-bottom: 2px solid var(--negro);
    overflow: hidden;
    padding: 12px 0;
    position: relative;
    z-index: 2;
  }
  .marquee-track {
    display: flex;
    white-space: nowrap;
    animation: marquee 28s linear infinite;
    font-family: var(--display);
    font-size: 20px;
    letter-spacing: 2px;
  }
  .marquee-track span {
    padding: 0 28px;
    display: inline-flex;
    align-items: center;
    gap: 28px;
  }
  .marquee-track span::after {
    content: '$';
    color: var(--naranja);
    font-size: 24px;
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* ============ HERO ============ */
  .hero {
    position: relative;
    padding: 40px 24px 90px;
    max-width: var(--max);
    margin: 0 auto;
    z-index: 2;
  }

  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--negro-card);
    border: 1px solid var(--gris);
    padding: 8px 16px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--amarillo);
    margin-bottom: 32px;
  }
  .hero-tag::before {
    content: '';
    width: 8px;
    height: 8px;
    background: var(--naranja);
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(232, 98, 42, 0.25);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 4px rgba(232, 98, 42, 0.25); }
    50% { box-shadow: 0 0 0 8px rgba(232, 98, 42, 0); }
  }

  .hero h1 {
    font-family: var(--display);
    font-size: clamp(48px, 9vw, 124px);
    line-height: 0.92;
    letter-spacing: -0.5px;
    text-transform: uppercase;
    margin-bottom: 24px;
    max-width: 1000px;
  }
  .hero h1 .stroke {
    -webkit-text-stroke: 2px var(--blanco);
    color: transparent;
  }
  .hero h1 .naranja { color: var(--naranja); }
  .hero h1 .amarillo { color: var(--amarillo); }
  .hero h1 .underline-wave {
    position: relative;
    display: inline-block;
  }
  .hero h1 .underline-wave::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 8px;
    background: var(--amarillo);
    z-index: -1;
    transform: skewX(-8deg);
  }

  .hero-sub {
    font-size: clamp(19px, 2.2vw, 26px);
    color: var(--gris-claro);
    max-width: 760px;
    line-height: 1.55;
    margin-top: 36px;
    margin-bottom: 40px;
  }
  .hero-sub strong { color: var(--blanco); font-weight: 600; }

  /* VSL PLACEHOLDER */
  .vsl-wrap {
    position: relative;
    max-width: 920px;
    margin: 0 auto 40px;
  }
  .vsl-wrap::before {
    content: '';
    position: absolute;
    inset: -14px;
    background: linear-gradient(135deg, var(--naranja), var(--amarillo));
    border-radius: 8px;
    z-index: -1;
  }
  .vsl-frame {
    background: var(--negro);
    border: 3px solid var(--negro);
    border-radius: 4px;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    position: relative;
  }


  .vsl-unmute {
    position: absolute; left: 12px; bottom: 12px; z-index: 30;
    background: var(--naranja); color: var(--blanco-puro); border: none;
    padding: 10px 16px 10px 12px; border-radius: 999px;
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    font-family: var(--body); font-size: 13px; font-weight: 700;
    transition: transform 0.25s ease, opacity 0.35s ease, background 0.2s ease;
    box-shadow: 0 6px 18px -4px rgba(232,98,42,0.55);
  }
  .vsl-unmute:hover { background: var(--naranja-oscuro); transform: translateY(-1px); }
  .vsl-unmute.is-hidden { opacity: 0; pointer-events: none; }
  .vsl-placeholder {
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 50% 50%, rgba(232,98,42,0.18) 0%, transparent 65%),
      repeating-linear-gradient(
        45deg,
        var(--negro-card),
        var(--negro-card) 22px,
        var(--negro-suave) 22px,
        var(--negro-suave) 44px
      );
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 18px;
    cursor: pointer;
    position: relative;
  }
  .vsl-placeholder:hover .play-btn { transform: scale(1.08); }
  .play-btn {
    width: 92px;
    height: 92px;
    border-radius: 50%;
    background: var(--naranja);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 12px rgba(232,98,42,0.18), 0 12px 40px rgba(0,0,0,0.5);
    transition: transform 0.2s ease;
  }
  .play-btn::before {
    content: '';
    border-style: solid;
    border-width: 16px 0 16px 26px;
    border-color: transparent transparent transparent var(--blanco-puro);
    margin-left: 6px;
  }
  .vsl-label {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 3px;
    color: var(--gris-claro);
    text-transform: uppercase;
  }

  .hero-cta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
  }
  .hero-cta-row .guarantee-mini {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--gris-claro);
  }
  .hero-cta-row .guarantee-mini strong { color: var(--amarillo); }

  /* COHORT INFO BAR */
  .cohort-bar {
    margin-top: 36px;
    display: inline-flex;
    flex-wrap: wrap;
    align-items: stretch;
    background: var(--negro-card);
    border: 1px solid var(--gris);
    border-left: 4px solid var(--amarillo);
    border-radius: 6px;
    overflow: hidden;
  }
  .cohort-bar > div {
    padding: 14px 22px;
    border-right: 1px solid var(--gris);
  }
  .cohort-bar > div:last-child { border-right: none; }
  .cohort-bar .ch-label {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--gris-claro);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .cohort-bar .ch-value {
    font-family: var(--display);
    font-size: 20px;
    color: var(--blanco);
    letter-spacing: 1px;
    line-height: 1;
  }
  .cohort-bar .ch-value.alert { color: var(--naranja); }
  @media (max-width: 600px) {
    .cohort-bar > div { padding: 12px 16px; }
    .cohort-bar .ch-value { font-size: 16px; }
  }

  /* Decoración hero: $ flotantes */
  .deco-dollar {
    position: absolute;
    font-family: var(--display);
    color: var(--gris);
    pointer-events: none;
    line-height: 1;
    z-index: -1;
  }
  .deco-dollar.d1 { top: 80px; right: 5%; font-size: 220px; transform: rotate(8deg); }
  .deco-dollar.d2 { bottom: 100px; left: -20px; font-size: 160px; transform: rotate(-12deg); color: var(--naranja); opacity: 0.15; }
  @media (max-width: 768px) {
    .deco-dollar.d1 { font-size: 120px; right: -10px; }
    .deco-dollar.d2 { display: none; }
  }

  /* ============ TRACK RECORD STRIP ============ */
  .track {
    background: var(--blanco);
    color: var(--negro);
    padding: 40px 24px;
    position: relative;
    z-index: 2;
  }
  .track-inner {
    max-width: var(--max);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 32px;
    text-align: center;
  }
  .track-item .num {
    font-family: var(--display);
    font-size: clamp(48px, 6vw, 78px);
    line-height: 1;
    color: var(--negro);
    letter-spacing: -1px;
  }
  .track-item .num em {
    font-style: normal;
    color: var(--naranja);
  }
  .track-item .label {
    margin-top: 6px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--negro);
  }

  /* ============ SECCIONES ============ */
  section { position: relative; z-index: 2; }

  .seccion {
    padding: 100px 24px;
    max-width: var(--max);
    margin: 0 auto;
  }
  @media (max-width: 720px) {
    .seccion { padding: 70px 20px; }
  }

  .eyebrow {
    display: inline-block;
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 3px;
    color: var(--naranja);
    text-transform: uppercase;
    margin-bottom: 28px;
    padding: 6px 10px;
    background: rgba(232,98,42,0.1);
    border-left: 3px solid var(--naranja);
  }

  h2.titulo {
    font-family: var(--display);
    font-size: clamp(38px, 6vw, 76px);
    line-height: 1.05;
    text-transform: uppercase;
    margin-bottom: 24px;
    letter-spacing: -0.5px;
  }
  h2.titulo .accent { color: var(--amarillo); }
  h2.titulo .naranja { color: var(--naranja); }

  p.lead {
    font-size: clamp(17px, 1.5vw, 20px);
    color: var(--gris-claro);
    max-width: 720px;
    margin-bottom: 48px;
    line-height: 1.55;
  }

  /* ============ PROBLEM ============ */
  .problem {
    background: var(--negro-suave);
    border-top: 1px solid var(--gris);
    border-bottom: 1px solid var(--gris);
  }
  .problem-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
    margin-top: 16px;
  }
  .problem-card {
    background: var(--negro-card);
    padding: 28px 24px;
    border-radius: 6px;
    border-left: 4px solid var(--naranja);
    font-size: 16px;
    color: var(--blanco);
    line-height: 1.5;
  }
  .problem-card::before {
    content: '✕';
    display: block;
    color: var(--naranja);
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 12px;
  }

  /* ============ ¿QUÉ ES EL RETO? ============ */
  .que-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
  }
  .que-card {
    background: var(--negro-card);
    border: 1px solid var(--gris);
    padding: 32px 24px;
    border-radius: 6px;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .que-card:hover { border-color: var(--naranja); transform: translateY(-4px); }
  .que-card .que-num {
    font-family: var(--display);
    font-size: 42px;
    color: var(--amarillo);
    line-height: 1;
    margin-bottom: 14px;
  }
  .que-card .que-titulo {
    font-family: var(--display);
    font-size: 22px;
    text-transform: uppercase;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }
  .que-card .que-desc {
    font-size: 14px;
    color: var(--gris-claro);
    line-height: 1.5;
  }

  /* ============ PARA QUIÉN ============ */
  .para-quien {
    background: var(--negro-suave);
  }
  .para-quien-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    margin-top: 16px;
  }
  .pq-card {
    background: var(--negro-card);
    padding: 36px 28px;
    border-radius: 8px;
    border-top: 6px solid var(--naranja);
  }
  .pq-card.no { border-top-color: var(--gris); opacity: 0.85; }
  .pq-card h3 {
    font-family: var(--display);
    font-size: 32px;
    text-transform: uppercase;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pq-card.si h3 { color: var(--amarillo); }
  .pq-card.no h3 { color: var(--gris-claro); }
  .pq-card ul { list-style: none; }
  .pq-card li {
    padding: 12px 0;
    border-bottom: 1px solid var(--gris);
    font-size: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .pq-card li:last-child { border-bottom: none; }
  .pq-card.si li::before {
    content: '✓';
    color: var(--naranja);
    font-weight: bold;
    font-size: 18px;
    flex-shrink: 0;
  }
  .pq-card.no li::before {
    content: '✕';
    color: var(--gris-claro);
    font-weight: bold;
    font-size: 18px;
    flex-shrink: 0;
  }

  /* ============ LAS 3 SEMANAS ============ */
  .semanas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
  .semana {
    background: var(--negro-card);
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--gris);
    transition: transform 0.2s ease, border-color 0.2s ease;
  }
  .semana:hover { transform: translateY(-6px); border-color: var(--naranja); }
  .semana-header {
    padding: 28px 24px 20px;
    border-bottom: 1px solid var(--gris);
    position: relative;
    overflow: hidden;
  }
  .semana:nth-child(1) .semana-header { background: linear-gradient(135deg, var(--naranja), var(--naranja-oscuro)); }
  .semana:nth-child(2) .semana-header { background: linear-gradient(135deg, var(--amarillo), #D4A50F); }
  .semana:nth-child(2) .semana-header * { color: var(--negro) !important; }
  .semana:nth-child(3) .semana-header { background: var(--negro); border-bottom: 1px solid var(--naranja); }
  .semana:nth-child(3) .semana-header .semana-num,
  .semana:nth-child(3) .semana-header .semana-titulo { color: var(--amarillo); }
  .semana:nth-child(3) .semana-header .semana-sub { color: var(--blanco); }

  .semana-num {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--blanco);
    opacity: 0.85;
  }
  .semana-titulo {
    font-family: var(--display);
    font-size: 36px;
    line-height: 1;
    text-transform: uppercase;
    margin-top: 6px;
    color: var(--blanco-puro);
    letter-spacing: -0.5px;
  }
  .semana-sub {
    margin-top: 8px;
    font-size: 14px;
    color: rgba(255,255,255,0.85);
  }
  .dias-list { padding: 16px 0; }
  .dia {
    padding: 14px 24px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
    border-bottom: 1px solid var(--gris);
    font-size: 14px;
  }
  .dia:last-child { border-bottom: none; }
  .dia-num {
    font-family: var(--display);
    font-size: 22px;
    line-height: 1;
    color: var(--naranja);
    min-width: 36px;
    background: var(--negro);
    border-radius: 4px;
    padding: 6px 8px;
    text-align: center;
  }
  .dia-content { flex: 1; }
  .dia-titulo {
    font-weight: 600;
    color: var(--blanco);
    margin-bottom: 2px;
  }
  .dia-tipo {
    font-size: 11px;
    color: var(--gris-claro);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* ============ LUCAS BIO ============ */
  .lucas {
    background: var(--blanco);
    color: var(--negro);
  }
  .lucas .seccion {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 60px;
    align-items: center;
  }
  @media (max-width: 920px) {
    .lucas .seccion { grid-template-columns: 1fr; gap: 40px; }
  }
  #lucas-foto {
    width: 100%;
    height: auto;
    border-radius: 6px;
    box-shadow: 18px 18px 0 var(--negro);
    display: block;
  }
  .lucas-content .eyebrow { background: rgba(232,98,42,0.15); color: var(--naranja); }
  .lucas-content h2 {
    font-family: var(--display);
    font-size: clamp(36px, 5vw, 64px);
    line-height: 0.95;
    text-transform: uppercase;
    margin-bottom: 24px;
    color: var(--negro);
  }
  .lucas-content h2 .accent { color: var(--naranja); }
  .lucas-content p {
    color: #333;
    margin-bottom: 18px;
    font-size: 17px;
    line-height: 1.65;
  }
  .lucas-firma {
    margin-top: 28px;
    font-family: var(--display);
    font-size: 38px;
    color: var(--naranja);
    line-height: 1;
    letter-spacing: 1px;
    transform: rotate(-4deg);
    display: inline-block;
  }

  /* ============ TESTIMONIOS ============ */
  .testimonios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
  .testi {
    background: var(--negro-card);
    border: 1px solid var(--gris);
    border-radius: 8px;
    padding: 28px 24px;
    position: relative;
    transition: transform 0.2s ease;
  }
  .testi:hover { transform: translateY(-4px); }
  .testi::before {
    content: '"';
    position: absolute;
    top: -10px;
    left: 18px;
    font-family: var(--display);
    font-size: 80px;
    color: var(--naranja);
    line-height: 1;
  }
  .testi-text {
    font-size: 15px;
    color: var(--blanco);
    line-height: 1.6;
    margin-bottom: 20px;
    margin-top: 18px;
    font-style: italic;
  }
  .testi-author {
    display: flex;
    align-items: center;
    gap: 14px;
    border-top: 1px solid var(--gris);
    padding-top: 16px;
  }
  .testi-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--naranja), var(--amarillo));
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--display);
    color: var(--negro);
    font-size: 20px;
  }
  .testi-name {
    font-weight: 700;
    font-size: 15px;
  }
  .testi-role {
    font-size: 12px;
    color: var(--gris-claro);
  }
  .stars { color: var(--amarillo); font-size: 14px; letter-spacing: 2px; margin-top: 4px; }

  /* ============ VALUE STACK / LO QUE INCLUYE ============ */
  .stack-section {
    background:
      linear-gradient(180deg, var(--negro) 0%, var(--negro-suave) 100%);
    border-top: 1px solid var(--gris);
  }
  .stack-box {
    max-width: 880px;
    margin: 40px auto 0;
    background: var(--negro-card);
    border: 1px solid var(--gris);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 30px 70px rgba(0,0,0,0.4);
  }
  .stack-header {
    background: var(--negro);
    padding: 18px 28px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: center;
    border-bottom: 1px solid var(--gris);
  }
  .stack-header .h-item {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--gris-claro);
    text-transform: uppercase;
  }
  .stack-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px;
    align-items: center;
    padding: 22px 28px;
    border-bottom: 1px solid var(--gris);
    transition: background 0.2s ease;
  }
  .stack-row:hover { background: rgba(232,98,42,0.04); }
  .stack-row:last-of-type { border-bottom: none; }
  .stack-row .item-info { padding-right: 16px; }
  .stack-row .item-title {
    font-family: var(--display);
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--blanco);
    margin-bottom: 4px;
    line-height: 1.1;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .stack-row .item-title::before {
    content: '✓';
    color: var(--naranja);
    font-size: 18px;
    flex-shrink: 0;
  }
  .stack-row .item-desc {
    font-size: 14px;
    color: var(--gris-claro);
    line-height: 1.4;
    padding-left: 30px;
  }
  .stack-row .item-price {
    font-family: var(--display);
    font-size: 24px;
    color: var(--amarillo);
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
  .stack-total {
    background: var(--negro);
    padding: 28px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px;
    align-items: center;
    border-top: 3px solid var(--naranja);
  }
  .stack-total .total-label {
    font-family: var(--display);
    font-size: 26px;
    text-transform: uppercase;
    color: var(--blanco);
    letter-spacing: 1px;
  }
  .stack-total .total-price {
    font-family: var(--display);
    font-size: clamp(36px, 5vw, 52px);
    color: var(--blanco);
    letter-spacing: -1px;
    line-height: 1;
  }
  .stack-connector {
    max-width: 880px;
    margin: 0 auto;
    text-align: center;
    padding: 30px 24px 0;
  }
  .stack-connector .arrow {
    display: inline-block;
    font-family: var(--display);
    font-size: 80px;
    color: var(--naranja);
    line-height: 1;
    transform: rotate(0deg);
    animation: bounceDown 1.6s ease-in-out infinite;
  }
  .stack-connector .pero {
    font-family: var(--display);
    font-size: clamp(28px, 4vw, 44px);
    text-transform: uppercase;
    color: var(--blanco);
    line-height: 1.05;
    margin-top: 10px;
  }
  .stack-connector .pero .accent { color: var(--amarillo); }
  @keyframes bounceDown {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(8px); }
  }
  @media (max-width: 600px) {
    .stack-header, .stack-row, .stack-total { padding: 16px 18px; }
    .stack-row .item-desc { padding-left: 0; }
    .stack-row .item-title { font-size: 17px; }
    .stack-row .item-price { font-size: 20px; }
  }

  /* ============ PRECIO TIERS (3 niveles) ============ */
  .precio-tiers {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 16px;
    padding: 20px;
    background: var(--negro);
    border-radius: 8px;
    border: 1px solid var(--gris);
  }
  .tier {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: center;
    padding-bottom: 14px;
    border-bottom: 1px dashed var(--gris);
  }
  .tier:last-child { border-bottom: none; padding-bottom: 0; }
  .tier-label {
    text-align: left;
    font-size: 12px;
    color: var(--gris-claro);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-family: var(--mono);
  }
  .tier.highlight .tier-label { color: var(--amarillo); font-weight: 700; }
  .tier-price-strike {
    font-family: var(--display);
    font-size: 28px;
    color: var(--gris-claro);
    text-decoration: line-through;
    text-decoration-thickness: 2px;
    text-decoration-color: var(--naranja);
    line-height: 1;
  }
  .tier.highlight {
    background: linear-gradient(135deg, rgba(232,98,42,0.12), rgba(245,197,24,0.08));
    margin: 6px -10px -10px;
    padding: 18px 14px 18px;
    border-radius: 6px;
    border-bottom: none;
  }
  .tier-price-huge {
    font-family: var(--display);
    font-size: clamp(56px, 9vw, 96px);
    color: var(--amarillo);
    line-height: 0.9;
    letter-spacing: -2px;
  }
  @media (max-width: 500px) {
    .tier { grid-template-columns: 1fr; gap: 4px; text-align: center; }
    .tier-label { text-align: center; }
  }
  .precio-section {
    background:
      radial-gradient(circle at 20% 20%, rgba(232,98,42,0.18), transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(245,197,24,0.12), transparent 50%),
      var(--negro);
    border-top: 1px solid var(--gris);
    border-bottom: 1px solid var(--gris);
  }
  .precio-card {
    max-width: 720px;
    margin: 40px auto 0;
    background: var(--negro-card);
    border: 2px solid var(--naranja);
    border-radius: 14px;
    padding: 50px 40px;
    text-align: center;
    box-shadow: 0 30px 70px rgba(0,0,0,0.5), 0 0 0 14px rgba(232,98,42,0.06);
    position: relative;
  }
  @media (max-width: 600px) { .precio-card { padding: 36px 22px; } }
  .precio-badge {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--amarillo);
    color: var(--negro);
    padding: 8px 24px;
    border-radius: 30px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .precio-titulo {
    font-family: var(--display);
    font-size: clamp(28px, 4vw, 42px);
    text-transform: uppercase;
    margin-bottom: 30px;
    line-height: 1;
  }
  .precio-numero {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 14px;
    margin-bottom: 8px;
  }
  .precio-antes {
    font-family: var(--display);
    font-size: 32px;
    color: var(--gris-claro);
    text-decoration: line-through;
    text-decoration-thickness: 3px;
    text-decoration-color: var(--naranja);
    line-height: 1;
  }
  .precio-ahora {
    font-family: var(--display);
    font-size: clamp(64px, 10vw, 110px);
    color: var(--amarillo);
    line-height: 0.9;
    letter-spacing: -2px;
  }
  .precio-clp {
    font-family: var(--mono);
    font-size: 14px;
    color: var(--gris-claro);
    letter-spacing: 2px;
    margin-bottom: 26px;
  }
  .ahorras {
    display: inline-block;
    background: var(--naranja);
    color: var(--blanco-puro);
    padding: 8px 18px;
    border-radius: 30px;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 1px;
    margin-bottom: 30px;
  }

  /* COUNTDOWN */
  .countdown {
    display: flex;
    justify-content: center;
    gap: 14px;
    margin-bottom: 30px;
  }
  .cd-box {
    background: var(--negro);
    border: 1px solid var(--gris);
    padding: 14px 18px;
    border-radius: 6px;
    min-width: 70px;
  }
  .cd-num {
    font-family: var(--display);
    font-size: 36px;
    color: var(--amarillo);
    line-height: 1;
  }
  .cd-label {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--gris-claro);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 4px;
  }
  @media (max-width: 500px) {
    .cd-box { padding: 10px 12px; min-width: 56px; }
    .cd-num { font-size: 28px; }
  }

  .incluye-list {
    text-align: left;
    margin: 30px 0;
    display: grid;
    gap: 10px;
  }
  .incluye-list li {
    list-style: none;
    padding: 10px 0;
    border-bottom: 1px dashed var(--gris);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 15px;
    color: var(--blanco);
  }
  .incluye-list li:last-child { border-bottom: none; }
  .incluye-list li::before {
    content: '✓';
    color: var(--naranja);
    font-weight: bold;
    font-size: 18px;
    flex-shrink: 0;
  }

  /* ============ GARANTÍA ============ */
  .garantia {
    background: var(--blanco);
    color: var(--negro);
  }
  .garantia .seccion {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 60px;
    align-items: center;
  }
  @media (max-width: 720px) {
    .garantia .seccion { grid-template-columns: 1fr; text-align: center; }
  }
  .sello {
    width: 200px;
    height: 200px;
    margin: 0 auto;
    border-radius: 50%;
    background: var(--amarillo);
    border: 6px dashed var(--negro);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 16px;
    transform: rotate(-8deg);
    font-family: var(--display);
    color: var(--negro);
    line-height: 1;
    box-shadow: 8px 8px 0 var(--naranja);
  }
  .sello-num { font-size: 64px; line-height: 0.9; }
  .sello-dias { font-size: 14px; letter-spacing: 3px; margin-top: 4px; }
  .sello-text {
    font-family: var(--body);
    font-size: 10px;
    font-weight: 700;
    margin-top: 6px;
    letter-spacing: 1.5px;
    line-height: 1.2;
  }
  .garantia h2 {
    font-family: var(--display);
    font-size: clamp(32px, 4.5vw, 56px);
    line-height: 0.95;
    text-transform: uppercase;
    margin-bottom: 18px;
    color: var(--negro);
  }
  .garantia h2 .accent { color: var(--naranja); }
  .garantia p {
    font-size: 17px;
    color: #444;
    line-height: 1.6;
  }

  /* ============ FAQ ============ */
  .faq-list {
    max-width: 880px;
    margin: 16px auto 0;
  }
  .faq-item {
    background: var(--negro-card);
    border: 1px solid var(--gris);
    border-radius: 6px;
    margin-bottom: 12px;
    overflow: hidden;
    transition: border-color 0.2s ease;
  }
  .faq-item[open] { border-color: var(--naranja); }
  .faq-item summary {
    padding: 22px 24px;
    cursor: pointer;
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    font-weight: 600;
    font-size: 16px;
    color: var(--blanco);
  }
  .faq-item summary::-webkit-details-marker { display: none; }
  .faq-item summary::after {
    content: '+';
    font-family: var(--display);
    font-size: 32px;
    color: var(--naranja);
    line-height: 1;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }
  .faq-item[open] summary::after { transform: rotate(45deg); }
  .faq-answer {
    padding: 0 24px 24px;
    color: var(--gris-claro);
    line-height: 1.6;
    font-size: 15px;
  }

  /* ============ FINAL CTA ============ */
  .final-cta {
    text-align: center;
    background:
      radial-gradient(circle at 50% 0%, rgba(232,98,42,0.25), transparent 60%),
      var(--negro);
    padding: 100px 24px 80px;
    border-top: 1px solid var(--gris);
    position: relative;
    overflow: hidden;
  }
  .final-cta::before {
    content: '$';
    position: absolute;
    font-family: var(--display);
    font-size: 600px;
    color: var(--gris);
    opacity: 0.1;
    top: -100px;
    right: -100px;
    z-index: 0;
    pointer-events: none;
  }
  .final-cta > * { position: relative; z-index: 2; }
  .final-cta h2 {
    font-family: var(--display);
    font-size: clamp(40px, 7vw, 88px);
    line-height: 0.95;
    text-transform: uppercase;
    margin-bottom: 24px;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }
  .final-cta h2 .accent { color: var(--amarillo); }
  .final-cta p {
    font-size: 18px;
    color: var(--gris-claro);
    max-width: 600px;
    margin: 0 auto 36px;
  }

  /* ============ FOOTER ============ */
  footer {
    background: var(--negro-suave);
    padding: 36px 24px;
    text-align: center;
    border-top: 1px solid var(--gris);
  }
  footer .footer-inner {
    max-width: var(--max);
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  .footer-logo {
    font-family: var(--display);
    font-size: 20px;
    letter-spacing: 2px;
  }
  .footer-logo .luca-s { color: var(--amarillo); }
  footer p {
    font-size: 12px;
    color: var(--gris-claro);
    letter-spacing: 1px;
  }

  /* ============ ANIMACIONES SCROLL ============ */
  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
</style>
</head>
<body>

<!-- ============ TOPBAR ============ -->
<header class="topbar">
  <div class="topbar-inner">
    <a href="#" class="logo" aria-label="Lucas con Luca$">
      <img src="/lucas-con-lucas/reto/asset-1.png" alt="Lucas con Luca$" class="logo-img">
      <span class="logo-tag">× FLIPEAME</span>
    </a>
    <div class="topbar-cta">
      <div class="topbar-timer" id="topTimer">CIERRAN EN <span id="topTimerVal">--:--:--</span></div>
      <a href="#precio" class="btn">Quiero entrar</a>
    </div>
  </div>
</header>

<!-- ============ MARQUEE ============ -->
<div class="marquee" aria-hidden="true">
  <div class="marquee-track">
    <span>15 días</span><span>video diario</span><span>WhatsApp</span><span>UF +14% rentabilidad</span><span>+150 propiedades flipeadas</span><span>+60 clientes felices</span><span>chile</span>
    <span>15 días</span><span>video diario</span><span>WhatsApp</span><span>UF +14% rentabilidad</span><span>+150 propiedades flipeadas</span><span>+60 clientes felices</span><span>chile</span>
  </div>
</div>

<!-- ============ HERO ============ -->
<section class="hero">
  <div class="deco-dollar d1">$</div>
  <div class="deco-dollar d2">$</div>

  <!-- VSL VIDEO - LO PRIMERO -->
  <div class="vsl-wrap" style="margin-top: 0;">
    <div class="vsl-frame">
      <!-- VSL YouTube -->
      <div class="vsl-frame" id="vslFrame" aria-label="VSL Reto Lucas con Luca$">
        <button type="button" class="vsl-unmute" id="vslUnmute" aria-label="Activar audio del video">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <span>Activar sonido</span>
        </button>
      </div>
    </div>
  </div>

  <span class="hero-tag" style="margin-top: 48px;">Próximo inicio · <span class="fecha-cohort">--</span> · Cupos limitados</span>

  <h1 style="line-height: 1.05;">
    <span class="amarillo">APRENDE</span> LO <span class="naranja">NECESARIO</span><br>
    DE INVERSIÓN<br>
    <span class="underline-wave">INMOBILIARIA</span><br>
    EN <span class="stroke">CHILE</span> <span class="amarillo">EN 15 DÍAS</span>.
  </h1>

  <p class="hero-sub">
    Un <strong>video diario por WhatsApp</strong> de 8 minutos con Lucas, fundador de Flipeame.
    Obtendrás la <strong>mentalidad, herramientas y la acción</strong> para adentrarte al mundo de la inversión inmobiliaria.
    <strong>+150 propiedades flipeadas</strong> respaldan cada cosa que vas a aprender.
  </p>

  <div class="hero-cta-row">
    <a href="#precio" class="btn btn-grande">Quiero entrar al reto →</a>
    <div class="guarantee-mini">
      🛡️ <strong>Garantía 2 días.</strong> Si cancelas dentro de los 2 días una vez iniciado el reto, te devolvemos el 50%.
    </div>
  </div>

  <!-- COHORT INFO -->
  <div class="cohort-bar">
    <div>
      <div class="ch-label">Inicio del reto</div>
      <div class="ch-value fecha-cohort">--</div>
    </div>
    <div>
      <div class="ch-label">Cierre de inscripciones</div>
      <div class="ch-value alert fecha-cierre">--</div>
    </div>
    <div>
      <div class="ch-label">Modalidad</div>
      <div class="ch-value">Reto de 15 días · WhatsApp</div>
    </div>
  </div>
</section>

<!-- ============ TRACK RECORD ============ -->
<section class="track">
  <div class="track-inner">
    <div class="track-item">
      <div class="num"><em>+</em>60</div>
      <div class="label">Clientes felices</div>
    </div>
    <div class="track-item">
      <div class="num"><em>+</em>150</div>
      <div class="label">Propiedades flipeadas</div>
    </div>
    <div class="track-item">
      <div class="num"><em>+</em>15K</div>
      <div class="label">m² remodelados</div>
    </div>
    <div class="track-item">
      <div class="num">UF<em>+</em>14%</div>
      <div class="label">Rentabilidad anual</div>
    </div>
    <div class="track-item">
      <div class="num"><em>+</em>7</div>
      <div class="label">Años en el rubro</div>
    </div>
  </div>
</section>

<!-- ============ PROBLEM ============ -->
<section class="problem">
  <div class="seccion">
    <span class="eyebrow">El problema real</span>
    <h2 class="titulo">Tienes ahorros.<br>Pero <span class="naranja">no sabes</span> dónde meterlos.</h2>
    <p class="lead">
      Mientras tu plata duerme en el banco, la inflación se la come.
      Y la mayoría de los chilenos que quieren invertir en propiedades nunca dan el primer paso por una sola razón: <strong style="color:var(--blanco)">No tienen el conocimiento necesario.</strong>
    </p>
    <div class="problem-grid">
      <div class="problem-card">Crees que necesitas plata, contactos o suerte para empezar.</div>
      <div class="problem-card">No entiendes la UF, el CapRate ni cómo se calcula la rentabilidad real.</div>
      <div class="problem-card">Tu plata pierde valor cada mes que pasa sin tomar una decisión.</div>
      <div class="problem-card">No sabes cómo identificar las buenas oportunidades de inversión.</div>
    </div>
  </div>
</section>

<!-- ============ ¿QUÉ ES EL RETO? ============ -->
<section>
  <div class="seccion">
    <span class="eyebrow">El reto</span>
    <h2 class="titulo">15 días.<br><span class="accent">Un video al día.</span><br>El método completo.</h2>
    <p class="lead">
      Lucas te entrega lo que aprendió en +7 años y +150 propiedades.
      Cada día, un video corto por WhatsApp y una mini tarea para que apliques al toque.
    </p>
    <div class="que-grid">
      <div class="que-card">
        <div class="que-num">15</div>
        <div class="que-titulo">Clases</div>
        <div class="que-desc">Lunes a viernes durante 3 semanas. Fines de semana descansas.</div>
      </div>
      <div class="que-card">
        <div class="que-num">8'</div>
        <div class="que-titulo">Por día</div>
        <div class="que-desc">Caso real + concepto con ejemplo numérico + mini tarea. Directo al grano.</div>
      </div>
      <div class="que-card">
        <div class="que-num">📱</div>
        <div class="que-titulo">WhatsApp</div>
        <div class="que-desc">Todo llega a tu chat. Sin plataformas, sin logins, sin excusas.</div>
      </div>
      <div class="que-card">
        <div class="que-num">🤖</div>
        <div class="que-titulo">Lucas IA del RETO</div>
        <div class="que-desc">Lucas IA todos los días: te guiará, hará seguimiento y responderá tus dudas según tu perfil.</div>
      </div>
    </div>
  </div>
</section>

<!-- ============ PARA QUIÉN ============ -->
<section class="para-quien">
  <div class="seccion">
    <span class="eyebrow">¿Es para ti?</span>
    <h2 class="titulo">Esto NO es<br>para <span class="naranja">cualquiera.</span></h2>
    <div class="para-quien-grid">
      <div class="pq-card si">
        <h3>✓ ES PARA TI SI…</h3>
        <ul>
          <li>Tienes ahorros y no sabes dónde meterlos.</li>
          <li>Tienes sueldo y quieres un ingreso extra.</li>
          <li>Quieres invertir pero nunca te has atrevido.</li>
          <li>Tienes 2 o no tienes una propiedad de inversión.</li>
          <li>Estás dispuesto a poner 8 minutos al día por 15 días.</li>
        </ul>
      </div>
      <div class="pq-card no">
        <h3>✕ NO ES PARA TI SI…</h3>
        <ul>
          <li>Buscas plata fácil y rápida, sin método.</li>
          <li>No estás dispuesto a ver los números fríos.</li>
          <li>Te aburre el rigor, la disciplina y el proceso.</li>
          <li>Esperas que alguien invierta por ti.</li>
          <li>Crees que las propiedades "se compran con la intuición".</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ============ LAS 3 SEMANAS ============ -->
<section>
  <div class="seccion">
    <span class="eyebrow">El programa día por día</span>
    <h2 class="titulo">3 semanas.<br><span class="accent">15 clases.</span><br>Un camino claro.</h2>
    <p class="lead">
      El orden no es casual. Primero la mentalidad. Después las herramientas. Al final, la acción.
      Si saltas el orden, te equivocas. Por eso el reto está diseñado así.
    </p>

    <div class="semanas-grid">
      <!-- SEMANA 1 -->
      <div class="semana">
        <div class="semana-header">
          <div class="semana-num">Semana 01</div>
          <div class="semana-titulo">Mentalidad</div>
          <div class="semana-sub">Fundamentos para entender el juego</div>
        </div>
        <div class="dias-list">
          <div class="dia"><div class="dia-num">01</div><div class="dia-content"><div class="dia-titulo">Bienvenida + Promesa del reto</div><div class="dia-tipo">Clase + tarea reflexiva</div></div></div>
          <div class="dia"><div class="dia-num">02</div><div class="dia-content"><div class="dia-titulo">La UF + inflación vs ahorro</div><div class="dia-tipo">Clase + tarea práctica</div></div></div>
          <div class="dia"><div class="dia-num">03</div><div class="dia-content"><div class="dia-titulo">Plusvalía pasiva vs activa</div><div class="dia-tipo">Clase + tarea reflexiva</div></div></div>
          <div class="dia"><div class="dia-num">04</div><div class="dia-content"><div class="dia-titulo">Dividendo, renta y beneficio</div><div class="dia-tipo">Clase + tarea práctica</div></div></div>
          <div class="dia"><div class="dia-num">05</div><div class="dia-content"><div class="dia-titulo">CapRate + Quiz cierre S1</div><div class="dia-tipo">Clase + quiz</div></div></div>
        </div>
      </div>

      <!-- SEMANA 2 -->
      <div class="semana">
        <div class="semana-header">
          <div class="semana-num">Semana 02</div>
          <div class="semana-titulo">Herramientas</div>
          <div class="semana-sub">Aprende a leer los números fríos</div>
        </div>
        <div class="dias-list">
          <div class="dia"><div class="dia-num">06</div><div class="dia-content"><div class="dia-titulo">Deuda buena vs mala</div><div class="dia-tipo">Clase + tarea reflexiva</div></div></div>
          <div class="dia"><div class="dia-num">07</div><div class="dia-content"><div class="dia-titulo">Cash-flow completo</div><div class="dia-tipo">Clase + tarea práctica</div></div></div>
          <div class="dia"><div class="dia-num">08</div><div class="dia-content"><div class="dia-titulo">ROI + Equity, vacancia, contribuciones</div><div class="dia-tipo">Clase + tarea práctica</div></div></div>
          <div class="dia"><div class="dia-num">09</div><div class="dia-content"><div class="dia-titulo">Pie, crédito hipotecario y perfil inversor</div><div class="dia-tipo">Clase + tarea práctica</div></div></div>
          <div class="dia"><div class="dia-num">10</div><div class="dia-content"><div class="dia-titulo">Simulación real + Quiz cierre S2</div><div class="dia-tipo">Clase + quiz</div></div></div>
        </div>
      </div>

      <!-- SEMANA 3 -->
      <div class="semana">
        <div class="semana-header">
          <div class="semana-num">Semana 03</div>
          <div class="semana-titulo">Acción</div>
          <div class="semana-sub">El paso del pensar al hacer</div>
        </div>
        <div class="dias-list">
          <div class="dia"><div class="dia-num">11</div><div class="dia-content"><div class="dia-titulo">Dónde buscar + Leer zonas + Propiteq</div><div class="dia-tipo">Clase + tarea práctica</div></div></div>
          <div class="dia"><div class="dia-num">12</div><div class="dia-content"><div class="dia-titulo">Proceso legal de compra paso a paso</div><div class="dia-tipo">Clase + tarea reflexiva</div></div></div>
          <div class="dia"><div class="dia-num">13</div><div class="dia-content"><div class="dia-titulo">Los errores que Lucas cometió</div><div class="dia-tipo">Clase + tarea reflexiva</div></div></div>
          <div class="dia"><div class="dia-num">14</div><div class="dia-content"><div class="dia-titulo">El siguiente nivel: Flipping</div><div class="dia-tipo">Clase especial</div></div></div>
          <div class="dia"><div class="dia-num">15</div><div class="dia-content"><div class="dia-titulo">Quiz cierre S3 + Hoja de ruta personal</div><div class="dia-tipo">Cierre del reto</div></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ LUCAS BIO ============ -->
<section class="lucas">
  <div class="seccion">
    <img id="lucas-foto" src="/lucas-con-lucas/reto/asset-2.jpg" alt="Lucas, founder de Flipeame">

    <div class="lucas-content">
      <span class="eyebrow">Tu instructor</span>
      <h2>Conoce a <span class="accent">Lucas.</span></h2>
      <p>
        Founder & CEO de <strong>Flipeame</strong>. Hace 7 años decidió no dejar
        su plata durmiendo en el banco: ahorró, tomó la decisión y cerró su primer
        negocio inmobiliario. Ese fue el punto de quiebre.
      </p>
      <p>
        Hoy lleva <strong>+150 propiedades flipeadas</strong>, +60 clientes
        felices, +15.000 m² remodelados y una rentabilidad anualizada
        promedio de <strong>UF +14%</strong>.
      </p>
      <p>
        Su motor no es la plata: es la <strong>libertad financiera real</strong>,
        la que te da tiempo, no sueldo. Y este reto es la forma más
        directa de transmitirte lo que aprendió, sin filtros.
      </p>
      <div class="lucas-firma">— Lucas</div>
    </div>
  </div>
</section>

<!-- ============ TESTIMONIOS ============ -->
<!-- OCULTOS para el próximo inicio del reto. Quitar 'style="display:none"' de la <section> cuando se quiera mostrar nuevamente. -->
<section id="testimonios" style="display:none">
  <div class="seccion">
    <span class="eyebrow">Testimonios</span>
    <h2 class="titulo">Lo que dicen los que <span class="accent">ya entraron.</span></h2>
    <div class="testimonios-grid">
      <!-- TESTIMONIO 1 (placeholder) -->
      <div class="testi">
        <div class="testi-text">
          Llegué sin saber qué era la UF. Salí entendiendo cómo evaluar una propiedad y con un plan concreto para hacer mi primer flip este año.
        </div>
        <div class="testi-author">
          <div class="testi-avatar">CM</div>
          <div>
            <div class="testi-name">Camila M.</div>
            <div class="testi-role">Ingeniera, Santiago</div>
            <div class="stars">★★★★★</div>
          </div>
        </div>
      </div>

      <!-- TESTIMONIO 2 (placeholder) -->
      <div class="testi">
        <div class="testi-text">
          Lo mejor: 8 minutos al día. Pude verlo entre reuniones. La tarea de la simulación real me hizo cambiar de zona.
        </div>
        <div class="testi-author">
          <div class="testi-avatar">JR</div>
          <div>
            <div class="testi-name">Jorge R.</div>
            <div class="testi-role">Gerente comercial, Viña</div>
            <div class="stars">★★★★★</div>
          </div>
        </div>
      </div>

      <!-- TESTIMONIO 3 (placeholder) -->
      <div class="testi">
        <div class="testi-text">
          Tenía un departamento parado hace 2 años. En el día 8 calculé el CapRate y entendí que tenía que venderlo. Cambió todo.
        </div>
        <div class="testi-author">
          <div class="testi-avatar">PS</div>
          <div>
            <div class="testi-name">Paula S.</div>
            <div class="testi-role">Contadora auditora, Concepción</div>
            <div class="stars">★★★★★</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ LO QUE INCLUYE (VALUE STACK) ============ -->
<section class="stack-section">
  <div class="seccion" style="text-align:center;">
    <span class="eyebrow" style="margin: 0 auto 56px;">Lo que incluye</span>
    <h2 class="titulo">Todo lo que <span class="accent">entra al reto.</span></h2>
    <p class="lead" style="margin-left:auto; margin-right:auto;">
      Esto no es un curso de videos sueltos. Es el sistema completo de Lucas +
      acompañamiento + comunidad + recursos. Mira el valor real de cada cosa.
    </p>

    <div class="stack-box">
      <div class="stack-header">
        <div class="h-item">El reto incluye</div>
        <div class="h-item">Valor</div>
      </div>

      <div class="stack-row">
        <div class="item-info">
          <div class="item-title">15 videoclases con Lucas</div>
          <div class="item-desc">3 semanas · L–V · 8-9 min/día · caso real + concepto + ejemplo numérico aplicado</div>
        </div>
        <div class="item-price">$197.000</div>
      </div>

      <div class="stack-row">
        <div class="item-info">
          <div class="item-title">15 PDFs explicativos</div>
          <div class="item-desc">Resumen visual descargable de cada clase con conceptos clave, fórmulas y diagramas</div>
        </div>
        <div class="item-price">$77.000</div>
      </div>

      <div class="stack-row">
        <div class="item-info">
          <div class="item-title">Tareas prácticas diarias</div>
          <div class="item-desc">Aplicas lo aprendido con casos reales · prácticas y reflexivas según el día</div>
        </div>
        <div class="item-price">$67.000</div>
      </div>

      <div class="stack-row">
        <div class="item-info">
          <div class="item-title">Acompañamiento 24/7 con Lucas IA</div>
          <div class="item-desc">Pregúntale lo que sea, cuando sea. Te responde según tu perfil de inversor</div>
        </div>
        <div class="item-price">$147.000</div>
      </div>

      <div class="stack-row">
        <div class="item-info">
          <div class="item-title">Recursos descargables</div>
          <div class="item-desc">Calculadoras, planillas, simuladores, checklists y plantillas listas para usar</div>
        </div>
        <div class="item-price">$87.000</div>
      </div>

      <div class="stack-total">
        <div class="total-label">Valor total</div>
        <div class="total-price">$575.000</div>
      </div>
    </div>

    <div class="stack-connector">
      <div class="arrow">↓</div>
      <div class="pero">Pero hoy lo obtienes por <span class="accent">solo</span>.</div>
    </div>
  </div>
</section>

<!-- ============ PRECIO ============ -->
<section id="precio" class="precio-section">
  <div class="seccion" style="text-align:center;">
    <span class="eyebrow" style="margin: 0 auto 56px;">Únete ahora</span>
    <h2 class="titulo">Entra al reto<br><span class="accent">antes del cierre.</span></h2>
    <p class="lead" style="margin-left:auto; margin-right:auto;">
      Este RETO tiene cupos limitados y empieza el <strong style="color:var(--blanco);" class="fecha-cohort">--</strong>.
      Cuando cierra, cierra. Te metes ahora o esperas el próximo.
    </p>

    <div class="precio-card">
      <div class="precio-badge">⚡ Promo lanzamiento</div>
      <div class="precio-titulo">Reto Lucas con Luca$</div>

      <div class="precio-tiers">
        <div class="tier">
          <div class="tier-label">Valor total de todo lo incluido</div>
          <div class="tier-price-strike">$575.000</div>
        </div>
        <div class="tier">
          <div class="tier-label">Precio oficial post-lanzamiento</div>
          <div class="tier-price-strike">$247.000</div>
        </div>
        <div class="tier highlight">
          <div class="tier-label">⚡ Hoy, en lanzamiento</div>
          <div class="tier-price-huge">$87.000</div>
        </div>
      </div>
      <div class="precio-clp">CLP · pago único · sin mensualidades</div>

      <div class="ahorras">Te ahorras $488.000 vs valor total</div>

      <!-- FECHA RETO -->
      <div style="background:var(--negro); border:1px solid var(--gris); border-radius:6px; padding:14px 18px; margin-bottom:20px;">
        <div style="font-family:var(--mono); font-size:10px; color:var(--gris-claro); letter-spacing:2px; text-transform:uppercase;">Este RETO empieza</div>
        <div style="font-family:var(--display); font-size:24px; color:var(--amarillo); letter-spacing:1px; margin-top:4px;" class="fecha-cohort">--</div>
      </div>

      <!-- COUNTDOWN -->
      <div style="font-size:13px; color:var(--gris-claro); letter-spacing:2px; text-transform:uppercase; margin-bottom:14px;">
        Inscripciones cierran en
      </div>
      <div class="countdown" id="countdown">
        <div class="cd-box"><div class="cd-num" id="cd-d">00</div><div class="cd-label">Días</div></div>
        <div class="cd-box"><div class="cd-num" id="cd-h">00</div><div class="cd-label">Horas</div></div>
        <div class="cd-box"><div class="cd-num" id="cd-m">00</div><div class="cd-label">Min</div></div>
        <div class="cd-box"><div class="cd-num" id="cd-s">00</div><div class="cd-label">Seg</div></div>
      </div>

      <ul class="incluye-list" style="margin: 20px 0 24px;">
        <li>Acceso completo a las 15 clases del reto</li>
        <li>Garantía de devolución 2 días · 50%</li>
        <li>Sin mensualidades · pago único</li>
      </ul>

      <!-- WhatsApp CTA -->
      <!-- Reemplazar el número 56XXXXXXXXX por el real -->
      <a href="https://chat.whatsapp.com/FrS6wqhSWM2HdepEdajz92?mode=gi_t"
         class="btn btn-grande btn-amarillo" target="_blank" rel="noopener"
         style="width:100%; max-width:420px; margin-top:10px;">
        Quiero entrar por WhatsApp →
      </a>

      <div style="margin-top:18px; font-size:13px; color:var(--gris-claro);">
        🛡️ Garantía de 2 días · devolución del 50%
      </div>
    </div>
  </div>
</section>

<!-- ============ GARANTÍA ============ -->
<section class="garantia">
  <div class="seccion">
    <div class="sello">
      <div class="sello-num">2</div>
      <div class="sello-dias">DÍAS</div>
      <div class="sello-text">GARANTÍA<br>50% DEVOLUCIÓN</div>
    </div>
    <div>
      <span class="eyebrow" style="background:rgba(232,98,42,0.15); color:var(--naranja);">Sin riesgo</span>
      <h2>Si no es para ti,<br>te <span class="accent">devolvemos</span> el 50%.</h2>
      <p>
        Tienes 2 días desde que inicia el reto para decidir si es para ti.
        Si dentro de esos 2 días no te convence, nos escribes por WhatsApp y te devolvemos el 50%
        de lo que pagaste. <strong>Sin formularios, sin letras chicas, sin drama.</strong>
      </p>
    </div>
  </div>
</section>

<!-- ============ FAQ ============ -->
<section>
  <div class="seccion">
    <span class="eyebrow">Preguntas frecuentes</span>
    <h2 class="titulo">Todo lo que <span class="accent">ya nos preguntaron.</span></h2>

    <div class="faq-list">
      <details class="faq-item">
        <summary>¿Cuándo empieza el reto?</summary>
        <div class="faq-answer">
          Este RETO empieza el <strong style="color:var(--amarillo);" class="fecha-cohort">--</strong>. El reto funciona en grupos cerrados para que todos avancemos al mismo ritmo. Las inscripciones cierran el <strong style="color:var(--amarillo);" class="fecha-cierre">--</strong>. Una vez que entras, te llega la bienvenida por WhatsApp y el día 1 te llega el primer video.
        </div>
      </details>

      <details class="faq-item">
        <summary>¿Necesito tener ahorros o experiencia previa?</summary>
        <div class="faq-answer">
          No. El reto está diseñado para personas que parten de cero. Lo único que necesitas es estar dispuesto a ver 8 minutos de video al día y hacer la mini tarea. Si ya tienes ahorros o una propiedad, también te sirve: aprendes a leer los números reales.
        </div>
      </details>

      <details class="faq-item">
        <summary>¿Qué pasa si no puedo ver el video ese día?</summary>
        <div class="faq-answer">
          Los videos quedan disponibles en tu chat de WhatsApp. Los ves cuando puedas. Lo importante es que termines los 15 días y hagas las tareas, aunque te demores un par de días extra.
        </div>
      </details>

      <details class="faq-item">
        <summary>¿Qué es Lucas IA y cómo funciona?</summary>
        <div class="faq-answer">
          Es un asistente entrenado con la metodología de Lucas. Le mandas tu tarea cada día y te responde según tu perfil: si vienes con ahorros, con propiedad, con sueldo o desde cero. Es como tener un mentor 24/7 que conoce tu caso.
        </div>
      </details>

      <details class="faq-item">
        <summary>¿Esto es un curso de flipping?</summary>
        <div class="faq-answer">
          No. Este reto es la base para entender inversión inmobiliaria en Chile: UF, CapRate, ROI, cash-flow, dónde comprar, cómo financiar. El curso de flipping completo es otro producto que se ofrece al final del día 14 a quienes ya decidieron dar el siguiente paso.
        </div>
      </details>

      <details class="faq-item">
        <summary>¿Funciona si vivo fuera de Santiago?</summary>
        <div class="faq-answer">
          Sí. Los conceptos aplican a todo Chile y el método sirve para cualquier región. Lucas además te enseña a leer zonas con Propiteq, sin importar dónde vivas.
        </div>
      </details>

      <details class="faq-item">
        <summary>¿Cuándo y cómo pago?</summary>
        <div class="faq-answer">
          Cuando haces clic en "Quiero entrar", te llevamos al WhatsApp del equipo de Flipeame. Ahí te enviamos el link de pago seguro (tarjeta de débito o crédito). Es un único pago, sin mensualidades.
        </div>
      </details>

      <details class="faq-item">
        <summary>¿De verdad puedo pedir devolución?</summary>
        <div class="faq-answer">
          Sí. Tienes 2 días desde que inicia el reto. Nos escribes "quiero la devolución" por WhatsApp y procesamos el reembolso del 50%. Sin preguntas, sin trabas.
        </div>
      </details>

      <details class="faq-item">
        <summary>¿Y si pierdo este RETO?</summary>
        <div class="faq-answer">
          Cuando cierran las inscripciones de este RETO, no se puede entrar más a este grupo. Te puedes anotar para el próximo — escríbenos por WhatsApp y te avisamos primero cuando abramos. Lo que no hacemos es dejar entrar a alguien una vez que el reto empezó: el orden de los 15 días importa y arrancar atrasado rompe la experiencia.
        </div>
      </details>
    </div>
  </div>
</section>

<!-- ============ FINAL CTA ============ -->
<section class="final-cta">
  <h2>Tu plata <span class="accent">no va a esperarte.</span></h2>
  <p>
    Cada mes que pasa sin invertir, la inflación se come tus ahorros.
    En 15 días puedes tener un método. La decisión es ahora.
  </p>
  <!-- Reemplazar el número 56XXXXXXXXX por el real -->
  <a href="https://chat.whatsapp.com/FrS6wqhSWM2HdepEdajz92?mode=gi_t"
     class="btn btn-grande" target="_blank" rel="noopener">
    Quiero entrar al reto →
  </a>
  <div style="margin-top:18px; font-size:13px; color:var(--gris-claro);">
    🛡️ 2 días de garantía · 50% de devolución · pago único · sin mensualidades
  </div>
</section>

<!-- ============ FOOTER ============ -->
<footer>
  <div class="footer-inner">
    <div class="footer-logo" aria-label="Lucas con Luca$">
      <img src="/lucas-con-lucas/reto/asset-3.png" alt="Lucas con Luca$" style="width:130px; height:auto; display:block;">
    </div>
    <p>© 2026 Flipeame · Lucas con Luca$ · Todos los derechos reservados</p>
  </div>
</footer>

<script>
  // ========== FECHAS DEL COHORT ==========
  // ⚠️ CAMBIAR ESTAS 2 FECHAS POR LAS REALES (formato: 'YYYY-MM-DDTHH:mm:ss')
  const COHORT_START = new Date('2026-06-08T09:00:00'); // Día 1 del reto (lunes 8 de junio 2026)
  const DEADLINE     = new Date('2026-06-08T23:59:59'); // Cierre de inscripciones (mismo 8 de junio)

  // Render fechas en todos los spans .fecha-cohort y .fecha-cierre
  const fmtFecha = (d) => {
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return d.getDate() + ' ' + meses[d.getMonth()].toUpperCase() + ' ' + d.getFullYear();
  };
  document.querySelectorAll('.fecha-cohort').forEach(el => el.textContent = fmtFecha(COHORT_START));
  document.querySelectorAll('.fecha-cierre').forEach(el => el.textContent = fmtFecha(DEADLINE));

  // ========== COUNTDOWN ==========
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    const now = new Date().getTime();
    let diff = DEADLINE.getTime() - now;
    if (diff < 0) diff = 0;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const els = {
      d: document.getElementById('cd-d'),
      h: document.getElementById('cd-h'),
      m: document.getElementById('cd-m'),
      s: document.getElementById('cd-s')
    };
    if (els.d) els.d.textContent = pad(d);
    if (els.h) els.h.textContent = pad(h);
    if (els.m) els.m.textContent = pad(m);
    if (els.s) els.s.textContent = pad(s);

    const top = document.getElementById('topTimerVal');
    if (top) top.textContent = pad(d) + 'd ' + pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  tick();
  setInterval(tick, 1000);

  // ========== REVEAL ON SCROLL ==========
  const revealEls = document.querySelectorAll('.seccion, .que-card, .semana, .testi, .precio-card, .faq-item');
  revealEls.forEach(function (el) { el.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  revealEls.forEach(function (el) { io.observe(el); });
</script>
<script>
(function () {
  var YT_ID = '13TPlosIGx4';
  var SPEED = 1.25;
  var BASE = 'playsinline=1&rel=0&modestbranding=1&controls=0&fs=0&disablekb=1&iv_load_policy=3&enablejsapi=1';
  function buildSrc(m) { return 'https://www.youtube.com/embed/' + YT_ID + '?autoplay=1&mute=' + (m ? '1' : '0') + '&' + BASE; }
  function boot() {
    var frame = document.getElementById('vslFrame');
    var btn = document.getElementById('vslUnmute');
    if (!frame || !btn) return setTimeout(boot, 200);
    var iframe = document.createElement('iframe');
    iframe.id = 'yt-vsl';
    iframe.title = 'Reto Lucas con Luca$';
    iframe.src = buildSrc(true);
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    iframe.allowFullscreen = true;
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;display:block;z-index:1;';
    frame.insertBefore(iframe, btn);
    function sendCmd(fn, args) {
      try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: fn, args: args || [] }), '*'); } catch (_) {}
    }
    function subscribe() {
      try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*'); } catch (_) {}
    }
    iframe.addEventListener('load', subscribe);
    setTimeout(subscribe, 600);
    btn.addEventListener('click', function () {
      iframe.src = buildSrc(false);
      btn.classList.add('is-hidden');
      setTimeout(function () { btn.remove(); }, 400);
      iframe.addEventListener('load', function () {
        setTimeout(function () { sendCmd('setPlaybackRate', [SPEED]); }, 1000);
        setTimeout(function () { sendCmd('setPlaybackRate', [SPEED]); }, 2500);
        subscribe();
      });
    });
    var fsBtn = document.createElement('button');
    fsBtn.type = 'button';
    fsBtn.innerHTML = '\\u26F6 Pantalla completa';
    fsBtn.setAttribute('aria-label', 'Pantalla completa');
    fsBtn.style.cssText = 'position:absolute;right:12px;bottom:12px;z-index:35;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:.55rem .85rem;font-size:12px;font-weight:700;color:#fff;background:rgba(12,12,12,.62);cursor:pointer;opacity:0;pointer-events:none;transition:opacity .2s;font-family:inherit;';
    frame.appendChild(fsBtn);
    var fsT;
    function showFs() { fsBtn.style.opacity='1'; fsBtn.style.pointerEvents='auto'; clearTimeout(fsT); fsT=setTimeout(function(){fsBtn.style.opacity='0';fsBtn.style.pointerEvents='none';},1800); }
    frame.addEventListener('mousemove', showFs);
    frame.addEventListener('touchstart', showFs, {passive:true});
    fsBtn.addEventListener('click', function(ev) {
      ev.stopPropagation();
      var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (isFs) { (document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document); return; }
      var req = frame.requestFullscreen || frame.webkitRequestFullscreen;
      if (req) { var p=req.call(frame); if(p&&p.catch)p.catch(function(){}); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){setTimeout(boot,200);});
  else setTimeout(boot, 200);
})();
</script>
<script>
(function () {
  function inIframe() { try { return window.parent && window.parent !== window; } catch (_) { return true; } }
  function postHeight() {
    if (!inIframe()) return;
    try {
      var h = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
      window.parent.postMessage({ type: 'iframe-height', height: h }, '*');
    } catch (_) {}
  }
  if (document.readyState === 'complete') postHeight();
  else window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  if ('ResizeObserver' in window) { try { new ResizeObserver(postHeight).observe(document.documentElement); } catch (_) {} }
  setTimeout(postHeight, 100); setTimeout(postHeight, 600); setTimeout(postHeight, 1500);
  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (href.length < 2 || href === '#') return;
    var target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    if (inIframe()) {
      try {
        var rect = target.getBoundingClientRect();
        var top = rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0);
        window.parent.postMessage({ type: 'iframe-scroll-to', top: top, hash: href }, '*');
        return;
      } catch (_) {}
    }
    try { target.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (_) {
      window.scrollTo(0, target.getBoundingClientRect().top + (window.pageYOffset || 0));
    }
    if (window.history && history.replaceState) { try { history.replaceState(null, '', href); } catch (_) {} }
  }, true);
})();
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
