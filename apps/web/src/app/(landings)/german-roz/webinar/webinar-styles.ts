/** Estilos alineados con lista-espera / webinar-jun10-landing (versión compacta). */
export const webinarStyles = `
  :root {
    --di-orange: #ff5722;
    --di-orange-dark: #e64a19;
    --di-orange-soft: #fff1ec;
    --di-orange-line: rgba(255, 87, 34, 0.18);
    --di-navy: #303841;
    --di-navy-soft: #4a5560;
    --di-bg: #ffffff;
    --di-bg-alt: #f7f8f9;
    --di-border: rgba(48, 56, 65, 0.08);
    --di-border-strong: rgba(48, 56, 65, 0.16);
    --di-muted: #6b7280;
    --di-radius: 14px;
    --di-radius-lg: 22px;
    --di-shadow: 0 12px 36px rgba(48, 56, 65, 0.08);
    --di-shadow-lg: 0 24px 64px rgba(48, 56, 65, 0.12);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--di-bg);
    color: var(--di-navy);
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }

  .di-header {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem clamp(1rem, 4vw, 2.5rem);
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: saturate(160%) blur(12px);
    -webkit-backdrop-filter: saturate(160%) blur(12px);
    border-bottom: 1px solid var(--di-border);
  }
  .di-lockup { display: inline-flex; flex-direction: column; line-height: 1; color: var(--di-navy); }
  .di-lockup-mark { font-size: clamp(1rem, 2.4vw, 1.15rem); font-weight: 800; letter-spacing: 0.02em; }
  .di-lockup-sub { margin-top: 0.25rem; font-size: 0.7rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--di-orange); }
  .di-nav-cta {
    background: var(--di-orange); color: #fff !important;
    padding: 0.55rem 1rem; border-radius: 999px; font-weight: 600;
    box-shadow: 0 6px 18px rgba(255, 87, 34, 0.35);
    transition: transform 0.2s ease, background 0.2s ease;
  }
  .di-nav-cta:hover { background: var(--di-orange-dark); transform: translateY(-1px); }

  .di-main {
    padding: 0 clamp(1rem, 4vw, 2.5rem) clamp(2.5rem, 6vw, 4rem);
  }
  .di-hero {
    max-width: 960px; margin: 0 auto;
    padding: clamp(1.25rem, 4vw, 2rem) 0 0;
    display: flex; flex-direction: column; align-items: stretch;
    gap: clamp(1.25rem, 3vw, 1.75rem);
  }

  .di-hero-row {
    display: grid;
    grid-template-columns: minmax(0, clamp(200px, 32vw, 320px)) minmax(0, 1fr);
    gap: clamp(1.25rem, 3vw, 2rem);
    align-items: center;
    width: 100%;
  }

  .di-hero-photo {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: var(--di-radius-lg);
    overflow: hidden;
    border: 4px solid var(--di-orange-soft);
    box-shadow: var(--di-shadow-lg);
    background: var(--di-bg-alt);
    flex-shrink: 0;
  }
  .di-hero-photo-img {
    object-fit: cover;
    object-position: center 18%;
  }

  .di-hero-copy {
    display: flex; flex-direction: column; align-items: flex-start;
    text-align: left;
    min-width: 0;
  }
  @media (max-width: 720px) {
    .di-hero-row {
      grid-template-columns: 1fr;
      justify-items: center;
      text-align: center;
    }
    .di-hero-photo {
      width: min(100%, 280px);
    }
    .di-hero-copy {
      align-items: center;
      text-align: center;
    }
  }
  .di-pill {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.4rem 0.85rem; border-radius: 999px;
    background: var(--di-orange-soft); color: var(--di-orange-dark);
    border: 1px solid var(--di-orange-line);
    font-size: 0.78rem; font-weight: 600; margin-bottom: 1rem;
  }
  .di-pill-dot {
    width: 7px; height: 7px; border-radius: 999px; background: var(--di-orange);
    box-shadow: 0 0 0 4px rgba(255, 87, 34, 0.18);
    animation: diPulse 2.2s ease-in-out infinite;
  }
  @keyframes diPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
  .di-hero-title {
    font-size: clamp(1.75rem, 5vw, 2.75rem);
    line-height: 1.08; letter-spacing: -0.02em;
    font-weight: 800; color: var(--di-navy); margin-bottom: 1rem;
  }
  .di-accent { color: var(--di-orange); }
  .di-hero-sub {
    font-size: clamp(0.95rem, 1.8vw, 1.1rem);
    line-height: 1.55; color: var(--di-navy-soft);
    max-width: 36rem; margin-bottom: 1rem;
  }
  .di-hero-bullets {
    list-style: none;
    display: flex; flex-wrap: wrap; justify-content: flex-start;
    gap: 0.5rem 1.25rem; color: var(--di-navy); font-size: 0.92rem;
  }
  @media (max-width: 720px) {
    .di-hero-bullets { justify-content: center; }
  }
  .di-hero-bullets li { display: inline-flex; gap: 0.5rem; align-items: center; }
  .di-hero-bullets li::before {
    content: ''; width: 6px; height: 6px; border-radius: 999px;
    background: var(--di-orange); flex-shrink: 0;
  }

  .di-event-bar {
    width: 100%;
    display: grid; grid-template-columns: repeat(4, 1fr);
    background: var(--di-bg-alt);
    border: 1px solid var(--di-border);
    border-radius: var(--di-radius);
    overflow: hidden;
  }
  .di-event-bar > div {
    padding: 1rem 1.1rem;
    border-right: 1px solid var(--di-border);
    text-align: left;
  }
  .di-event-bar > div:last-child { border-right: 0; }
  .di-event-bar dt {
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--di-orange); margin-bottom: 0.35rem;
  }
  .di-event-bar dd { font-size: 0.95rem; font-weight: 700; color: var(--di-navy); }
  @media (max-width: 720px) {
    .di-event-bar { grid-template-columns: repeat(2, 1fr); }
    .di-event-bar > div { border-bottom: 1px solid var(--di-border); }
    .di-event-bar > div:nth-child(odd) { border-right: 1px solid var(--di-border); }
    .di-event-bar > div:nth-child(even) { border-right: 0; }
    .di-event-bar > div:nth-last-child(-n+2) { border-bottom: 0; }
  }

  .di-form-card {
    width: 100%; max-width: 520px; margin: 0 auto;
    background: #fff; border: 1px solid var(--di-border);
    border-radius: var(--di-radius-lg);
    padding: clamp(1.25rem, 3vw, 1.75rem);
    box-shadow: var(--di-shadow-lg);
    text-align: left;
  }
  .di-form-header { margin-bottom: 1.1rem; }
  .di-form-eyebrow {
    display: block; font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--di-orange); margin-bottom: 0.4rem;
  }
  .di-form-title { font-size: clamp(1.1rem, 2vw, 1.3rem); font-weight: 700; color: var(--di-navy); }
  .di-form { display: flex; flex-direction: column; gap: 0.75rem; }
  .di-form input {
    background: #fff; border: 1px solid var(--di-border-strong);
    border-radius: 10px; padding: 0.85rem 1rem;
    font-size: 0.95rem; font-family: inherit; color: var(--di-navy);
    outline: none; width: 100%;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .di-form input::placeholder { color: var(--di-muted); }
  .di-form input:focus {
    border-color: var(--di-orange);
    box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.15);
  }
  .di-form .lead-form-phone { width: 100%; position: relative; }
  .di-form .react-international-phone-input-container { display: flex; align-items: stretch; }
  .di-form .react-international-phone-country-selector-button {
    background: #fff; border: 1px solid var(--di-border-strong);
    border-right: none; border-radius: 10px 0 0 10px;
    padding: 0 0.5rem; min-width: 52px;
  }
  .di-form .react-international-phone-input-container .react-international-phone-input {
    border-radius: 0 10px 10px 0; flex: 1; min-width: 0;
    border: 1px solid var(--di-border-strong); border-left: none;
    padding: 0.85rem 1rem; font-size: 0.95rem;
  }
  .di-form button[type="submit"] {
    margin-top: 0.5rem; background: var(--di-orange); color: #fff;
    border: none; border-radius: 10px; padding: 1rem 1.25rem;
    font-size: 0.95rem; font-weight: 700; cursor: pointer; width: 100%;
    box-shadow: 0 8px 22px rgba(255, 87, 34, 0.32);
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .di-form button[type="submit"]:hover:not(:disabled) {
    background: var(--di-orange-dark); transform: translateY(-1px);
  }
  .di-form button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
  .di-form-disclaimer { margin-top: 0.85rem; font-size: 0.78rem; color: var(--di-muted); line-height: 1.4; text-align: center; }
  .di-form-error { font-size: 0.82rem; color: #dc2626; text-align: center; }

  .di-form-success { text-align: center; padding: 0.25rem 0; }
  .di-form-success-icon {
    width: 52px; height: 52px; margin: 0 auto 1rem; border-radius: 50%;
    background: var(--di-orange-soft); border: 2px solid var(--di-orange);
    color: var(--di-orange); font-size: 1.35rem; font-weight: 800; line-height: 48px;
  }
  .di-form-success-title { font-size: 1.2rem; font-weight: 800; color: var(--di-navy); margin-bottom: 0.5rem; }
  .di-form-success-sub { font-size: 0.92rem; color: var(--di-navy-soft); line-height: 1.55; margin-bottom: 1.25rem; }
  .di-form-success-sub strong { color: var(--di-navy); }
  .di-btn-calendar {
    display: block; width: 100%; padding: 0.95rem 1.25rem;
    background: var(--di-navy); color: #fff !important;
    border-radius: 10px; font-weight: 700; font-size: 0.95rem; text-align: center;
  }
  .di-btn-calendar:hover { opacity: 0.92; }
`;
