import { Cormorant_Garamond, Bebas_Neue } from 'next/font/google';
import type { Metadata } from 'next';

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
  title: 'Gracias por unirte — Reto Desinflámate',
  description:
    'Tu compra está confirmada. Pronto recibirás toda la información del Reto Desinflámate por WhatsApp.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Gracias por unirte — Reto Desinflámate',
    description: 'Tu compra está confirmada. Nos vemos el 27 de abril.',
  },
};

export default function GermanRozGracias() {
  return (
    <>
      <style>{styles}</style>

      <main className="ty-main">
        {/* ── Background gradient ── */}
        <div className="ty-bg" aria-hidden="true" />

        {/* ── Hero ── */}
        <section className="ty-hero">
          <div className="ty-check" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className={`ty-title ${serif.className}`}>¡Muchas gracias por unirte!</h1>

          <p className="ty-subtitle">Reto Desinflámate</p>
          <p className="ty-tagline">
            21 días · Comida real, sin dietas restrictivas — con Germán Roz
          </p>

          <div className={`ty-badge ${display.className}`}>Inicio oficial: lunes 27 de abril</div>
        </section>

        {/* ── Body ── */}
        <section className="ty-body">
          <p>
            Queremos darte las <strong>gracias de corazón</strong> por confiar en este proceso. Tu
            compra está confirmada.
          </p>

          <p>
            <strong>El reto arranca el lunes 27 de abril.</strong> Mientras tanto, no necesitas hacer
            nada más.
          </p>

          <p>
            En los <strong>próximos días</strong> vas a recibir un mensaje de{' '}
            <strong>nuestro WhatsApp oficial</strong> al número que registraste en la compra, con{' '}
            <strong>toda</strong> la información del reto.{' '}
            <strong>No te preocupes: el equipo del reto se pondrá en contacto contigo.</strong>
          </p>

          <p>Por ese canal te compartiremos, entre otras cosas:</p>

          <ul className="ty-list">
            <li>
              <span className="ty-icon" aria-hidden="true">💬</span>
              El enlace al <strong>grupo privado de WhatsApp</strong> de la comunidad
            </li>
            <li>
              <span className="ty-icon" aria-hidden="true">📅</span>
              Las <strong>fechas</strong> y el calendario del reto
            </li>
            <li>
              <span className="ty-icon" aria-hidden="true">🎬</span>
              Acceso a los <strong>videos</strong> y el contenido educativo
            </li>
            <li>
              <span className="ty-icon" aria-hidden="true">📋</span>
              <strong>Instrucciones</strong> paso a paso y lo que sigue cada día
            </li>
          </ul>

          <div className="ty-note">
            <p>
              <strong>P.D.</strong> Si tienes una urgencia mientras activamos todo el flujo por
              WhatsApp, puedes escribirnos a{' '}
              <a href="mailto:contact@byafluence.com">contact@byafluence.com</a> y te ayudamos.
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="ty-footer">
          <p>Reto Desinflámate · TheNutriChef / Germán Roz</p>
          <a href="mailto:contact@byafluence.com">contact@byafluence.com</a>
        </footer>
      </main>
    </>
  );
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ty-main {
    min-height: 100vh;
    min-height: 100dvh;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #0a0a0a;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ── Ambient gradient ── */
  .ty-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34, 80, 60, 0.45) 0%, transparent 70%),
      #0a0a0a;
    pointer-events: none;
  }

  /* ── Hero ── */
  .ty-hero {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 600px;
    padding: 3.5rem 1.5rem 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .ty-check {
    width: 3.5rem;
    height: 3.5rem;
    border: 1.5px solid rgba(245, 230, 200, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f5e6c8;
    margin-bottom: 1.5rem;
    animation: fadeScale 0.6s ease-out both;
  }

  @keyframes fadeScale {
    from { opacity: 0; transform: scale(0.6); }
    to   { opacity: 1; transform: scale(1); }
  }

  .ty-title {
    font-size: clamp(2rem, 6vw, 3.2rem);
    font-weight: 300;
    color: #fff;
    letter-spacing: 0.02em;
    line-height: 1.15;
    margin-bottom: 1rem;
    animation: fadeUp 0.6s 0.15s ease-out both;
  }

  .ty-subtitle {
    font-size: 1rem;
    font-weight: 500;
    color: #f5e6c8;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
    animation: fadeUp 0.6s 0.25s ease-out both;
  }

  .ty-tagline {
    font-size: 0.85rem;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.65);
    letter-spacing: 0.04em;
    margin-bottom: 1.75rem;
    animation: fadeUp 0.6s 0.3s ease-out both;
  }

  .ty-badge {
    display: inline-block;
    background: linear-gradient(135deg, #1a5c3a 0%, #2d7a50 100%);
    color: #fff;
    font-size: clamp(0.85rem, 2.5vw, 1.05rem);
    letter-spacing: 0.08em;
    padding: 0.65rem 1.8rem;
    border-radius: 100px;
    animation: fadeUp 0.6s 0.4s ease-out both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Body ── */
  .ty-body {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 560px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 2.5rem 2rem;
    margin: 0 1rem;
    animation: fadeUp 0.6s 0.5s ease-out both;
  }

  .ty-body p {
    font-size: 0.95rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 1.25rem;
  }

  .ty-body strong {
    color: #fff;
    font-weight: 600;
  }

  /* ── List ── */
  .ty-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .ty-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.92rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
  }

  .ty-list li strong {
    color: #fff;
  }

  .ty-icon {
    flex-shrink: 0;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  /* ── Note (P.D.) ── */
  .ty-note {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 1.25rem;
    margin-top: 0.25rem;
  }

  .ty-note p {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 0;
  }

  .ty-note a {
    color: #f5e6c8;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .ty-note a:hover {
    color: #fff;
  }

  /* ── Footer ── */
  .ty-footer {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 2.5rem 1rem 3rem;
    animation: fadeUp 0.6s 0.6s ease-out both;
  }

  .ty-footer p {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.35);
    letter-spacing: 0.04em;
    margin-bottom: 0.35rem;
  }

  .ty-footer a {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.35);
    text-decoration: none;
  }

  .ty-footer a:hover {
    color: rgba(255, 255, 255, 0.6);
  }

  /* ── Responsive ── */
  @media (max-width: 480px) {
    .ty-hero {
      padding: 2.5rem 1.25rem 2rem;
    }
    .ty-body {
      padding: 2rem 1.5rem;
      margin: 0 0.75rem;
      border-radius: 10px;
    }
  }
`;
