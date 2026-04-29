import type { Metadata } from 'next';
import { Cormorant_Garamond, Bebas_Neue } from 'next/font/google';
import { LandingConfig } from '@/components/landing-config';
import { LeadForm } from '@/components/lead-form';

// ---------------------------------------------------------------------------
// Waitlist DI21 — captura emails para la próxima edición del Reto Desinflamate.
// ---------------------------------------------------------------------------
// La inscripción de la edición de abril 2026 cerró; mantenemos el dominio
// nutricion.germanroz.com vivo redirigiendo /vsl-desinflamate hacia aquí
// (308 desde apps/web/src/app/(landings)/german-roz/vsl-desinflamate/page.tsx).
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
//   controls=1          → controles nativos (a diferencia del VSL viejo
//                          que los ocultaba con un player custom). Para
//                          waitlist preferimos UX estándar que volumen
//                          custom — el usuario sube volumen él mismo.
const VSL_EMBED_URL = `https://www.youtube.com/embed/${VSL_YOUTUBE_ID}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  display: 'swap',
});

const display = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lista de espera — Reto Desinflámate · Germán Roz',
  description:
    'Las inscripciones de esta edición están cerradas. Déjanos tu correo y te avisaremos cuando abramos cupos para la próxima edición del Reto Desinflámate.',
  // Indexable por si quieres mandar tráfico orgánico al waitlist; cambia a
  // robots: { index: false } si prefieres que no aparezca en SERP.
  openGraph: {
    title: 'Lista de espera — Reto Desinflámate',
    description:
      'Avísame cuando abran cupos para la próxima edición del Reto Desinflámate con Germán Roz.',
  },
};

export default function GermanRozListaEspera() {
  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ} />
      <style>{styles}</style>

      <main className="le-main">
        <div className="le-bg" aria-hidden="true" />

        <section className="le-hero">
          <div className={`le-eyebrow ${display.className}`}>Reto Desinflámate · Germán Roz</div>

          <h1 className={`le-title ${serif.className}`}>
            Las inscripciones para esta edición están cerradas.
          </h1>

          <p className="le-subtitle">
            Mira el video y déjame tu correo: te aviso apenas abramos cupos
            para la próxima edición.
          </p>
        </section>

        {/* ── VSL ── 16:9 responsive, max-width alineado con la card del form */}
        <section className="le-video" aria-label="Video de presentación del Reto Desinflámate">
          <div className="le-video-frame">
            <iframe
              src={VSL_EMBED_URL}
              title="Reto Desinflámate — Germán Roz"
              // `clipboard-write` permite que el menú "copiar URL" del player
              // de YouTube funcione desde un iframe; sin este permiso el
              // browser bloquea `navigator.clipboard.writeText` y YouTube
              // muestra el error "No se puede copiar el vínculo".
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
              allowFullScreen
              loading="eager"
            />
          </div>
        </section>

        <section className="le-card">
          <LeadForm
            className="le-form"
            ingestOrgKey="german-roz"
            ingestBuKey="main"
            source="landing-german-roz-waitlist-di21"
            fields={['firstName', 'email', 'phone']}
            placeholders={{
              firstName: 'Nombre',
              email: 'Correo',
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
            style={{ gap: '1rem' }}
          />

          <p className="le-disclaimer">
            Sin spam. Solo te escribimos cuando abran inscripciones de la siguiente edición.
          </p>
        </section>

        <footer className="le-footer">
          <p>Reto Desinflámate · TheNutriChef / Germán Roz</p>
          <a href="mailto:contact@byafluence.com">contact@byafluence.com</a>
        </footer>
      </main>
    </>
  );
}

// CSS visualmente alineado con /gracias (tarjeta sobre gradient verde sobre
// negro) en lugar de /form (form fullscreen sobre foto). El waitlist lee
// mejor en una tarjeta sobria que en un hero seductor.
const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .le-main {
    min-height: 100vh;
    min-height: 100dvh;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #0a0a0a;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 1rem;
  }

  .le-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34, 80, 60, 0.45) 0%, transparent 70%),
      #0a0a0a;
    pointer-events: none;
  }

  /* ── Hero ── */
  .le-hero {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 600px;
    padding: 3rem 0.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .le-eyebrow {
    color: #f5e6c8;
    font-size: 0.78rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 1.25rem;
    animation: fadeUp 0.6s ease-out both;
  }

  .le-title {
    font-size: clamp(1.85rem, 5.5vw, 2.8rem);
    font-weight: 300;
    color: #fff;
    letter-spacing: 0.01em;
    line-height: 1.2;
    margin-bottom: 1rem;
    max-width: 540px;
    animation: fadeUp 0.6s 0.1s ease-out both;
  }

  .le-subtitle {
    font-size: clamp(0.95rem, 2.4vw, 1.05rem);
    font-weight: 300;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.55;
    max-width: 480px;
    animation: fadeUp 0.6s 0.2s ease-out both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Video VSL (YouTube embed) ── */
  .le-video {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 760px;
    margin: 0 0 1.5rem;
    animation: fadeUp 0.6s 0.25s ease-out both;
  }

  /* Aspect-ratio en el wrapper para que el iframe llene 100% sin trucos
     de padding-bottom. Soportado en todos los browsers modernos. */
  .le-video-frame {
    position: relative;
    aspect-ratio: 16 / 9;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
  }

  .le-video-frame iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }

  /* ── Card ── */
  .le-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 460px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 2rem 1.75rem 1.5rem;
    margin: 0.5rem 0 2rem;
    animation: fadeUp 0.6s 0.3s ease-out both;
  }

  .le-form {
    display: flex !important;
    flex-direction: column !important;
  }

  .le-form input,
  .le-form select,
  .le-form textarea {
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-radius: 8px !important;
    padding: 0.85rem 1rem !important;
    font-size: 0.95rem !important;
    font-family: inherit !important;
    color: #fff !important;
    outline: none !important;
    transition: border-color 0.25s ease, background 0.25s ease !important;
    width: 100% !important;
  }

  .le-form input::placeholder,
  .le-form textarea::placeholder {
    color: rgba(255, 255, 255, 0.45) !important;
  }

  .le-form input:focus,
  .le-form select:focus,
  .le-form textarea:focus {
    border-color: rgba(245, 230, 200, 0.6) !important;
    background: rgba(255, 255, 255, 0.08) !important;
  }

  /* PhoneInput integration — match the card aesthetic. */
  .le-form .lead-form-phone { width: 100% !important; position: relative !important; }
  .le-form .react-international-phone-input-container {
    display: flex !important;
    align-items: stretch !important;
  }
  .le-form .react-international-phone-country-selector-button {
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-right: none !important;
    border-radius: 8px 0 0 8px !important;
    color: #fff !important;
    cursor: pointer !important;
    padding: 0 0.5rem !important;
    min-width: 48px !important;
  }
  .le-form .react-international-phone-input-container .react-international-phone-input {
    border-radius: 0 8px 8px 0 !important;
    flex: 1 !important;
    min-width: 0 !important;
  }
  .le-form .react-international-phone-country-selector-dropdown {
    position: absolute !important;
    z-index: 9999 !important;
    bottom: 100% !important;
    left: 0 !important;
    margin: 0 0 4px 0 !important;
    background: rgba(20, 20, 20, 0.98) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-radius: 8px !important;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5) !important;
    color: #fff !important;
  }
  .le-form .react-international-phone-country-selector-dropdown__list-item:hover,
  .le-form .react-international-phone-country-selector-dropdown__list-item--selected,
  .le-form .react-international-phone-country-selector-dropdown__list-item--focused {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
  }
  .le-form .react-international-phone-country-selector-dropdown__list-item-dial-code {
    color: rgba(255, 255, 255, 0.55) !important;
  }

  .le-form button[type="submit"] {
    background: linear-gradient(135deg, #1a5c3a 0%, #2d7a50 100%) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 100px !important;
    padding: 0.95rem 1rem !important;
    font-size: 0.85rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.08em !important;
    cursor: pointer !important;
    transition: filter 0.25s ease, transform 0.15s ease !important;
    margin-top: 0.5rem !important;
    width: 100% !important;
  }

  .le-form button[type="submit"]:hover {
    filter: brightness(1.08);
  }

  .le-form button[type="submit"]:active {
    transform: translateY(1px);
  }

  .le-form button[type="submit"]:disabled {
    background: rgba(255, 255, 255, 0.15) !important;
    color: rgba(255, 255, 255, 0.45) !important;
    cursor: not-allowed !important;
    filter: none !important;
  }

  /* Success state replaces the form. */
  .le-form[role="status"] {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    padding: 1.5rem 0.5rem !important;
  }
  .le-form[role="status"] p {
    color: #fff !important;
    font-size: 0.95rem !important;
    line-height: 1.6 !important;
    font-weight: 400 !important;
    margin: 0 !important;
  }
  .le-form[role="status"]::before {
    content: "✓";
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    margin-bottom: 1rem;
    border: 1.5px solid rgba(245, 230, 200, 0.6);
    border-radius: 50%;
    color: #f5e6c8;
    font-size: 1.1rem;
  }

  .le-disclaimer {
    margin-top: 1.25rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.78rem;
    text-align: center;
    line-height: 1.5;
  }

  /* ── Footer ── */
  .le-footer {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 1.5rem 1rem 2.5rem;
    margin-top: auto;
  }
  .le-footer p {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.35);
    letter-spacing: 0.04em;
    margin-bottom: 0.35rem;
  }
  .le-footer a {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.35);
    text-decoration: none;
  }
  .le-footer a:hover { color: rgba(255, 255, 255, 0.65); }

  @media (max-width: 480px) {
    .le-hero  { padding: 2.5rem 0.25rem 1rem; }
    .le-video { margin-bottom: 1.25rem; }
    .le-video-frame { border-radius: 10px; }
    .le-card  { padding: 1.5rem 1.25rem 1.25rem; }
  }
`;
