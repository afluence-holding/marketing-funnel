import type { Metadata } from 'next';
import Image from 'next/image';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { LandingConfig } from '@/components/landing-config';
import { LeadForm } from '@/components/lead-form';

// ---------------------------------------------------------------------------
// Waitlist DI21 — captura emails para la próxima edición del Reto Desinflámate.
// ---------------------------------------------------------------------------
// Brand alineado con la VSL original:
//   - Naranja signature  #FF5722
//   - Navy text          #303841
//   - Background blanco  #FFFFFF
//   - Tipografía         Plus Jakarta Sans
//
// Los leads aterrizan en la BU `german-roz/main` con `customFields`:
//   - creator:  'german-roz'
//   - interest: 'desinflamate-21'
//   - edition:  'next'
//   - list:     'waitlist'
// para poder filtrarlos en Supabase cuando se abran cupos. No hay sequence
// automática; el envío del aviso queda manual hasta que se confirme fecha.
//
// VSL: el video de Germán Roz vive en YouTube (id `1TGY0iYZUzs`) y se
// embebe con autoplay muted, igual que la VSL original. NO embebemos el
// bundle React de 582k del VSL antiguo porque traía countdown expirado,
// precio $87 USD y CTAs hardcoded a Hotmart — todo eso choca contra el
// mensaje de waitlist. El bundle queda en disco como respaldo.
// ---------------------------------------------------------------------------

const VSL_YOUTUBE_ID = '1TGY0iYZUzs';

// Params alineados con la VSL original:
//   autoplay=1 + mute=1 → autoplay sin bloqueo de browsers modernos.
//   playsinline=1       → en iOS no fuerza fullscreen al iniciar.
//   rel=0&modestbranding=1 → recomendaciones / branding minimal.
const VSL_EMBED_URL = `https://www.youtube.com/embed/${VSL_YOUTUBE_ID}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Lista de espera — DESINFLÁMATE! · Germán Roz',
  description:
    'Las inscripciones de esta edición están cerradas. Déjanos tu correo y serás de los primeros en saber cuándo abrimos cupos para la próxima edición del Reto Desinflámate.',
  openGraph: {
    title: 'Lista de espera — DESINFLÁMATE!',
    description:
      'Sé de los primeros en saber cuándo abrimos cupos para la próxima edición del Reto Desinflámate con Germán Roz.',
  },
};

export default function GermanRozListaEspera() {
  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ} />
      <style>{styles}</style>

      <div className={jakarta.className}>
        <header className="di-header">
          <a href="#top" className="di-lockup" aria-label="DESINFLAMATE Germán Roz">
            <span className="di-lockup-mark">DESINFLÁMATE!</span>
            <span className="di-lockup-sub">con Germán Roz</span>
          </a>
          <nav className="di-nav" aria-label="Navegación">
            <a href="#proof">Resultados</a>
            <a href="#about">Germán</a>
            <a href="#waitlist" className="di-nav-cta">Avísame</a>
          </nav>
        </header>

        <main id="top" className="di-main">
          {/* ── Hero ────────────────────────────────────────────────────── */}
          <section className="di-hero" aria-labelledby="hero-title">
            <div className="di-hero-copy">
              <span className="di-pill">
                <span className="di-pill-dot" aria-hidden="true" />
                Lista de espera abierta · Próxima edición pronto
              </span>

              <h1 id="hero-title" className="di-hero-title">
                Esta edición ya cerró.
                <br />
                <span className="di-accent">La próxima, primero tú.</span>
              </h1>

              <p className="di-hero-sub">
                Mira el video y déjanos tus datos. Cuando abramos cupos
                para la próxima edición del Reto Desinflámate, te avisamos
                a ti antes que a nadie.
              </p>

              <ul className="di-hero-bullets">
                <li>Aviso anticipado al correo y WhatsApp</li>
                <li>Acceso a precio early bird al abrir cupos</li>
                <li>Sin spam — solo escribimos cuando hay novedades</li>
              </ul>
            </div>

            <div className="di-hero-media">
              <div className="di-video-frame">
                <iframe
                  src={VSL_EMBED_URL}
                  title="Reto Desinflámate — Germán Roz"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
                  allowFullScreen
                  loading="eager"
                />
              </div>

              <div id="waitlist" className="di-form-card">
                <div className="di-form-header">
                  <span className="di-form-eyebrow">Lista de espera</span>
                  <h2 className="di-form-title">Avísame cuando abran cupos</h2>
                </div>
                <LeadForm
                  className="di-form"
                  ingestOrgKey="german-roz"
                  ingestBuKey="main"
                  source="landing-german-roz-waitlist-di21"
                  fields={['firstName', 'email', 'phone']}
                  placeholders={{
                    firstName: 'Tu nombre',
                    email: 'tu@correo.com',
                    phone: 'WhatsApp (opcional)',
                  }}
                  defaultCountry="pe"
                  hiddenFields={{
                    creator: 'german-roz',
                    interest: 'desinflamate-21',
                    edition: 'next',
                    list: 'waitlist',
                  }}
                  conversion={{
                    event: 'Lead',
                    data: { content_name: 'di21-waitlist' },
                  }}
                  submitLabel="Avísame cuando abran"
                  loadingLabel="Enviando..."
                  successMessage="Listo. Cuando abramos cupos para la próxima edición, te escribimos al correo (y a WhatsApp si lo dejaste)."
                />
                <p className="di-form-disclaimer">
                  Al enviar aceptas recibir un único correo de aviso cuando
                  abramos cupos. Cero spam, baja con un click.
                </p>
              </div>
            </div>
          </section>

          {/* ── Social proof — solo stats, sin testimonials reales todavía ── */}
          <section id="proof" className="di-proof" aria-label="Resultados del reto">
            <div className="di-proof-stats">
              <div className="di-stat">
                <span className="di-stat-num">+600</span>
                <span className="di-stat-label">personas han hecho el reto</span>
              </div>
              <div className="di-stat">
                <span className="di-stat-num">1</span>
                <span className="di-stat-label">edición completada</span>
              </div>
              <div className="di-stat">
                <span className="di-stat-num">21</span>
                <span className="di-stat-label">días de transformación</span>
              </div>
            </div>
          </section>

          {/* ── About Germán ────────────────────────────────────────────── */}
          <section id="about" className="di-about" aria-labelledby="about-title">
            <div className="di-about-avatar">
              <Image
                src="/german-roz/german-avatar.jpg"
                alt="Germán Roz, chef y nutricionista detrás del Reto Desinflámate"
                width={440}
                height={440}
                sizes="(min-width: 768px) 220px, 180px"
                priority={false}
              />
            </div>
            <div className="di-about-copy">
              <span className="di-eyebrow">Quien te acompaña</span>
              <h2 id="about-title" className="di-section-title">
                Germán Roz · TheNutriChef
              </h2>
              <p>
                Chef y nutricionista detrás de Desinflámate. Lleva más de
                una década ayudando a personas en LATAM y España a comer
                bien sin sufrir, con menús reales y acompañamiento diario.
              </p>
              <ul className="di-credentials">
                {/* REPLACE — credenciales verificadas reales */}
                <li>Nutricionista certificado</li>
                <li>+10 años en consulta privada</li>
                <li>+1M de seguidores en redes</li>
              </ul>
            </div>
          </section>

          {/* ── Urgencia ────────────────────────────────────────────────── */}
          <section className="di-urgency" aria-labelledby="urgency-title">
            <div className="di-urgency-card">
              <span className="di-pill di-pill-on-dark">
                <span className="di-pill-dot" aria-hidden="true" />
                Próxima edición
              </span>
              <h2 id="urgency-title" className="di-urgency-title">
                Cupos limitados. Aviso por orden de llegada.
              </h2>
              <p className="di-urgency-sub">
                Cada edición se llena en horas. Quienes están en la lista
                de espera reciben el correo de apertura primero — y acceden
                al precio early bird antes de que se publique en redes.
              </p>
              <ul className="di-urgency-bullets">
                <li>
                  <span className="di-check" aria-hidden="true">→</span>
                  Aviso anticipado por correo + WhatsApp
                </li>
                <li>
                  <span className="di-check" aria-hidden="true">→</span>
                  Acceso al precio más bajo (early bird)
                </li>
                <li>
                  <span className="di-check" aria-hidden="true">→</span>
                  Reserva tu cupo antes de la apertura pública
                </li>
              </ul>
              <a href="#waitlist" className="di-urgency-cta">
                Ir al formulario
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </section>
        </main>

        <footer className="di-footer">
          <div className="di-footer-inner">
            <div className="di-footer-brand">
              <span className="di-lockup-mark">DESINFLÁMATE!</span>
              <span className="di-footer-tag">Reto · Germán Roz · TheNutriChef</span>
            </div>
            <div className="di-footer-cols">
              <div>
                <span className="di-footer-heading">Contacto</span>
                <a href="mailto:contact@byafluence.com">contact@byafluence.com</a>
              </div>
              <div>
                <span className="di-footer-heading">Síguenos</span>
                <a href="https://www.instagram.com/germanrozz/" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
                <a href="https://www.tiktok.com/@germanrozz" target="_blank" rel="noopener noreferrer">
                  TikTok
                </a>
                <a href="https://youtube.com/@germanrozz" target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              </div>
              <div>
                <span className="di-footer-heading">Legal</span>
                <a href="/legal/privacidad">Privacidad</a>
                <a href="/legal/terminos">Términos</a>
              </div>
            </div>
          </div>
          <div className="di-footer-bottom">
            <span>© {new Date().getFullYear()} Germán Roz · Todos los derechos reservados</span>
          </div>
        </footer>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// CSS — alineado con el sistema visual del VSL antiguo:
//   #FF5722 (naranja signature) · #303841 (navy text) · blanco
//   Plus Jakarta Sans con jerarquía clara entre display y body.
// ---------------------------------------------------------------------------
const styles = `
  :root {
    --di-orange: #ff5722;
    --di-orange-dark: #e64a19;
    --di-orange-soft: #fff1ec;
    --di-orange-line: rgba(255, 87, 34, 0.18);
    --di-navy: #303841;
    --di-navy-soft: #4a5560;
    --di-bg: #ffffff;
    --di-bg-alt: #f7f8f9;
    --di-bg-dark: #1a1f24;
    --di-border: rgba(48, 56, 65, 0.08);
    --di-border-strong: rgba(48, 56, 65, 0.16);
    --di-muted: #6b7280;
    --di-radius: 14px;
    --di-radius-lg: 22px;
    --di-shadow-sm: 0 1px 2px rgba(48, 56, 65, 0.06);
    --di-shadow: 0 12px 36px rgba(48, 56, 65, 0.08);
    --di-shadow-lg: 0 24px 64px rgba(48, 56, 65, 0.12);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--di-bg);
    color: var(--di-navy);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a { color: inherit; text-decoration: none; }

  /* ── Header sticky ─────────────────────────────────────────────────── */
  .di-header {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem clamp(1rem, 4vw, 2.5rem);
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: saturate(160%) blur(12px);
    -webkit-backdrop-filter: saturate(160%) blur(12px);
    border-bottom: 1px solid var(--di-border);
  }

  .di-lockup {
    display: inline-flex;
    flex-direction: column;
    line-height: 1;
    color: var(--di-navy);
  }

  .di-lockup-mark {
    font-size: clamp(1rem, 2.4vw, 1.15rem);
    font-weight: 800;
    letter-spacing: 0.02em;
    color: var(--di-navy);
  }

  .di-lockup-sub {
    margin-top: 0.25rem;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--di-orange);
  }

  .di-nav {
    display: flex;
    align-items: center;
    gap: clamp(0.75rem, 2vw, 1.75rem);
    font-size: 0.92rem;
    font-weight: 500;
  }
  .di-nav a { color: var(--di-navy-soft); transition: color 0.2s ease; }
  .di-nav a:hover { color: var(--di-navy); }

  .di-nav-cta {
    background: var(--di-orange);
    color: #fff !important;
    padding: 0.55rem 1rem;
    border-radius: 999px;
    font-weight: 600;
    box-shadow: 0 6px 18px rgba(255, 87, 34, 0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .di-nav-cta:hover {
    background: var(--di-orange-dark);
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(255, 87, 34, 0.4);
  }

  /* Hide secondary links on small screens, keep CTA visible. */
  @media (max-width: 640px) {
    .di-nav a:not(.di-nav-cta) { display: none; }
  }

  /* ── Main ──────────────────────────────────────────────────────────── */
  .di-main { padding: 0 clamp(1rem, 4vw, 2.5rem); }

  /* ── Hero ──────────────────────────────────────────────────────────── */
  /* Layout vertical centrado: el VSL es la estrella y ocupa todo el ancho
     hasta ~960px. El copy y el form se mantienen más estrechos para que
     la jerarquía visual sea clara. */
  .di-hero {
    max-width: 960px;
    margin: 0 auto;
    padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(2rem, 5vw, 3.5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(2rem, 4vw, 3rem);
    text-align: center;
  }

  .di-hero-copy {
    max-width: 720px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .di-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    background: var(--di-orange-soft);
    color: var(--di-orange-dark);
    border: 1px solid var(--di-orange-line);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    margin-bottom: 1.5rem;
  }

  .di-pill-on-dark {
    background: rgba(255, 87, 34, 0.16);
    color: #ffd1c2;
    border-color: rgba(255, 87, 34, 0.35);
  }

  .di-pill-dot {
    width: 7px; height: 7px;
    border-radius: 999px;
    background: var(--di-orange);
    box-shadow: 0 0 0 4px rgba(255, 87, 34, 0.18);
    animation: diPulse 2.2s ease-in-out infinite;
  }

  @keyframes diPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.15); opacity: 0.85; }
  }

  .di-hero-title {
    font-size: clamp(2rem, 5.5vw, 3.4rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    font-weight: 800;
    color: var(--di-navy);
    margin-bottom: 1.25rem;
  }

  .di-accent {
    color: var(--di-orange);
    font-weight: 800;
  }

  .di-hero-sub {
    font-size: clamp(1rem, 1.8vw, 1.125rem);
    line-height: 1.55;
    color: var(--di-navy-soft);
    max-width: 580px;
    margin-bottom: 1.5rem;
  }

  /* Bullets en layout horizontal cuando hay espacio, vertical en mobile. */
  .di-hero-bullets {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem 1.25rem;
    color: var(--di-navy);
    font-size: 0.92rem;
  }
  .di-hero-bullets li {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
  }
  .di-hero-bullets li::before {
    content: '';
    flex-shrink: 0;
    width: 6px; height: 6px;
    border-radius: 999px;
    background: var(--di-orange);
  }

  /* Hero media: VSL fullwidth + form card centrado debajo. */
  .di-hero-media {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.25rem, 3vw, 2rem);
  }
  .di-hero-media .di-video-frame {
    width: 100%;
    max-width: 920px;
  }
  .di-hero-media .di-form-card {
    width: 100%;
    max-width: 520px;
    text-align: left;
  }

  .di-video-frame {
    position: relative;
    aspect-ratio: 16 / 9;
    background: #000;
    border-radius: var(--di-radius);
    overflow: hidden;
    border: 1px solid var(--di-border);
    box-shadow: var(--di-shadow);
  }
  .di-video-frame iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }

  /* ── Form card ─────────────────────────────────────────────────────── */
  .di-form-card {
    background: #fff;
    border: 1px solid var(--di-border);
    border-radius: var(--di-radius-lg);
    padding: clamp(1.25rem, 3vw, 1.75rem);
    box-shadow: var(--di-shadow-lg);
  }

  .di-form-header { margin-bottom: 1.1rem; }
  .di-form-eyebrow {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--di-orange);
    margin-bottom: 0.4rem;
  }
  .di-form-title {
    font-size: clamp(1.1rem, 2vw, 1.3rem);
    font-weight: 700;
    color: var(--di-navy);
    line-height: 1.25;
  }

  .di-form { display: flex !important; flex-direction: column !important; gap: 0.75rem !important; }

  .di-form input,
  .di-form select,
  .di-form textarea {
    background: #fff !important;
    border: 1px solid var(--di-border-strong) !important;
    border-radius: 10px !important;
    padding: 0.85rem 1rem !important;
    font-size: 0.95rem !important;
    font-family: inherit !important;
    color: var(--di-navy) !important;
    outline: none !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
    width: 100% !important;
  }
  .di-form input::placeholder,
  .di-form textarea::placeholder {
    color: var(--di-muted) !important;
  }
  .di-form input:focus,
  .di-form select:focus,
  .di-form textarea:focus {
    border-color: var(--di-orange) !important;
    box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.15) !important;
  }

  /* PhoneInput integration. */
  .di-form .lead-form-phone { width: 100% !important; position: relative !important; }
  .di-form .react-international-phone-input-container {
    display: flex !important;
    align-items: stretch !important;
  }
  .di-form .react-international-phone-country-selector-button {
    background: #fff !important;
    border: 1px solid var(--di-border-strong) !important;
    border-right: none !important;
    border-radius: 10px 0 0 10px !important;
    color: var(--di-navy) !important;
    cursor: pointer !important;
    padding: 0 0.5rem !important;
    min-width: 52px !important;
  }
  .di-form .react-international-phone-input-container .react-international-phone-input {
    border-radius: 0 10px 10px 0 !important;
    flex: 1 !important;
    min-width: 0 !important;
  }
  .di-form .react-international-phone-country-selector-dropdown {
    position: absolute !important;
    z-index: 9999 !important;
    bottom: 100% !important;
    left: 0 !important;
    margin: 0 0 4px 0 !important;
    background: #fff !important;
    border: 1px solid var(--di-border-strong) !important;
    border-radius: 10px !important;
    box-shadow: var(--di-shadow) !important;
    max-height: 280px !important;
    overflow-y: auto !important;
  }
  .di-form .react-international-phone-country-selector-dropdown__list-item {
    color: var(--di-navy) !important;
    padding: 0.5rem 0.75rem !important;
  }
  .di-form .react-international-phone-country-selector-dropdown__list-item:hover,
  .di-form .react-international-phone-country-selector-dropdown__list-item--focused {
    background: var(--di-orange-soft) !important;
  }

  .di-form button[type="submit"] {
    margin-top: 0.5rem !important;
    background: var(--di-orange) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 10px !important;
    padding: 1rem 1.25rem !important;
    font-size: 0.95rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.02em !important;
    cursor: pointer !important;
    transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease !important;
    box-shadow: 0 8px 22px rgba(255, 87, 34, 0.32) !important;
  }
  .di-form button[type="submit"]:hover:not(:disabled) {
    background: var(--di-orange-dark) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 12px 28px rgba(255, 87, 34, 0.4) !important;
  }
  .di-form button[type="submit"]:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
  }

  .di-form-disclaimer {
    margin-top: 0.85rem;
    font-size: 0.78rem;
    color: var(--di-muted);
    line-height: 1.4;
    text-align: center;
  }

  /* ── Social proof ──────────────────────────────────────────────────── */
  .di-proof {
    max-width: 1080px;
    margin: clamp(2.5rem, 6vw, 4rem) auto;
    padding: clamp(2rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem);
    background: var(--di-bg-alt);
    border-radius: var(--di-radius-lg);
    border: 1px solid var(--di-border);
  }

  .di-proof-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    text-align: center;
  }
  @media (max-width: 640px) {
    .di-proof-stats { grid-template-columns: 1fr; gap: 1.25rem; }
  }

  .di-stat { display: flex; flex-direction: column; gap: 0.35rem; }
  .di-stat-num {
    font-size: clamp(1.85rem, 4.5vw, 2.6rem);
    font-weight: 800;
    color: var(--di-orange);
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .di-stat-label {
    font-size: 0.85rem;
    color: var(--di-navy-soft);
    font-weight: 500;
  }

  .di-section-title {
    font-size: clamp(1.5rem, 3.5vw, 2rem);
    font-weight: 800;
    color: var(--di-navy);
    line-height: 1.2;
    letter-spacing: -0.015em;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  /* ── About Germán ──────────────────────────────────────────────────── */
  .di-about {
    max-width: 1080px;
    margin: clamp(2.5rem, 6vw, 4rem) auto;
    padding: 0 clamp(0.5rem, 2vw, 1rem);
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(1.5rem, 4vw, 2.5rem);
    align-items: center;
  }
  @media (min-width: 768px) {
    .di-about { grid-template-columns: auto 1fr; }
  }

  .di-about-avatar {
    position: relative;
    width: clamp(160px, 22vw, 220px);
    height: clamp(160px, 22vw, 220px);
    border-radius: 999px;
    overflow: hidden;
    border: 6px solid var(--di-orange-soft);
    box-shadow: var(--di-shadow);
    justify-self: center;
    background: var(--di-bg-alt);
  }
  .di-about-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .di-about-copy { display: flex; flex-direction: column; gap: 0.85rem; text-align: center; }
  @media (min-width: 768px) {
    .di-about-copy { text-align: left; }
  }
  .di-about-copy .di-section-title { text-align: inherit; margin-bottom: 0; }
  .di-about-copy p {
    color: var(--di-navy-soft);
    font-size: 1rem;
    line-height: 1.6;
  }

  .di-eyebrow {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--di-orange);
  }

  .di-credentials {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.25rem;
    justify-content: center;
  }
  @media (min-width: 768px) {
    .di-credentials { justify-content: flex-start; }
  }
  .di-credentials li {
    background: var(--di-bg-alt);
    border: 1px solid var(--di-border);
    color: var(--di-navy);
    font-size: 0.82rem;
    font-weight: 500;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
  }

  /* ── Urgencia ──────────────────────────────────────────────────────── */
  .di-urgency {
    max-width: 1080px;
    margin: clamp(2.5rem, 6vw, 4rem) auto clamp(3rem, 7vw, 5rem);
  }

  .di-urgency-card {
    position: relative;
    overflow: hidden;
    background: var(--di-bg-dark);
    color: #fff;
    border-radius: var(--di-radius-lg);
    padding: clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.75rem);
    text-align: center;
  }

  .di-urgency-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 50% 80% at 100% 0%, rgba(255, 87, 34, 0.32), transparent 60%),
      radial-gradient(ellipse 60% 80% at 0% 100%, rgba(255, 87, 34, 0.18), transparent 60%);
    pointer-events: none;
  }

  .di-urgency-card > * { position: relative; z-index: 1; }

  .di-urgency-card .di-pill { margin-bottom: 1.25rem; }

  .di-urgency-title {
    font-size: clamp(1.5rem, 3.8vw, 2.2rem);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.015em;
    margin-bottom: 1rem;
    color: #fff;
  }

  .di-urgency-sub {
    color: rgba(255, 255, 255, 0.78);
    font-size: 1rem;
    line-height: 1.6;
    max-width: 560px;
    margin: 0 auto 1.75rem;
  }

  .di-urgency-bullets {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    max-width: 420px;
    margin: 0 auto 2rem;
    text-align: left;
  }
  .di-urgency-bullets li {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    color: rgba(255, 255, 255, 0.92);
    font-size: 0.95rem;
  }
  .di-check {
    color: var(--di-orange);
    font-weight: 800;
    flex-shrink: 0;
  }

  .di-urgency-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    background: var(--di-orange);
    color: #fff !important;
    padding: 1rem 1.75rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.01em;
    box-shadow: 0 12px 32px rgba(255, 87, 34, 0.4);
    transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }
  .di-urgency-cta:hover {
    background: var(--di-orange-dark);
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(255, 87, 34, 0.5);
  }

  /* ── Footer ────────────────────────────────────────────────────────── */
  .di-footer {
    background: var(--di-navy);
    color: rgba(255, 255, 255, 0.78);
    padding: clamp(2.5rem, 5vw, 3.5rem) clamp(1rem, 4vw, 2.5rem) 1.5rem;
  }

  .di-footer-inner {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 768px) {
    .di-footer-inner { grid-template-columns: 1fr 1.5fr; gap: 3rem; }
  }

  .di-footer-brand .di-lockup-mark { color: #fff; font-size: 1.25rem; display: block; }
  .di-footer-tag {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 0.02em;
  }

  .di-footer-cols {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1.5rem;
  }
  .di-footer-cols > div { display: flex; flex-direction: column; gap: 0.5rem; }

  .di-footer-heading {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--di-orange);
    margin-bottom: 0.35rem;
  }

  .di-footer a {
    color: rgba(255, 255, 255, 0.78);
    font-size: 0.9rem;
    transition: color 0.2s ease;
  }
  .di-footer a:hover { color: #fff; }

  .di-footer-bottom {
    max-width: 1180px;
    margin: 2rem auto 0;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
  }
`;
