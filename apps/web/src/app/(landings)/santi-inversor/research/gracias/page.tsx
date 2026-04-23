import type { Metadata } from 'next';
import Script from 'next/script';
import { LandingConfig } from '@/components/landing-config';

export const metadata: Metadata = {
  title: '¡Gracias! — Santinversor',
  description: 'Recibimos tus respuestas. Pronto nos pondremos en contacto contigo.',
  robots: { index: false, follow: false },
  openGraph: {
    title: '¡Gracias! — Santinversor',
    description: 'Recibimos tus respuestas. Pronto nos pondremos en contacto contigo.',
  },
};

interface PageProps {
  searchParams: Promise<{ name?: string }>;
}

const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/G4bawWCK92lBumVB8vG8o7';
const INSTAGRAM_URL = 'https://www.instagram.com/santinversor/';

export default async function SantiInversorResearchGracias({ searchParams }: PageProps) {
  const { name } = await searchParams;
  const displayName = (name ?? '').trim() || 'crack';

  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_SANTI_INVERSOR} />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Geist:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <style>{styles}</style>

      <main className="ty-shell">
        <section className="success active" id="success">
          <div className="success-inner">
            <div className="success-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="success-discount" id="discount-chip">
              <span className="icon">⚡</span>
              <span id="discount-text">Descuento exclusivo asegurado · Sos el #248 / 299</span>
            </div>

            <h2>
              Gracias, <span id="success-name">{displayName}</span>.
            </h2>
            <p>
              Tu respuesta ya quedó registrada. En los próximos días te voy a mandar por mail un
              resumen de lo que encontré y qué estoy construyendo.
            </p>

            <p style={{ marginTop: 14 }}>
              <strong style={{ color: 'var(--text)' }}>Sumate al grupo de WhatsApp</strong> para
              estar primero en la fila cuando abra el cupo — ahí te aviso antes que a nadie.
            </p>

            <div className="success-signature">
              <div className="avatar">
                <img src="/santi-inversor/assets/santi-portrait.jpeg" alt="Santiago" />
              </div>
              <div className="who">
                <div className="name">Santiago Jasminoy</div>
                <div className="handle">@santinversor · 🇦🇷 × 🇨🇱</div>
              </div>
            </div>

            <div className="success-actions">
              <a
                href={WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Unirme al grupo de WhatsApp</span>
              </a>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cta"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                }}
              >
                <span>Seguirme en Instagram</span>
                <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Script id="santi-gracias-position" strategy="afterInteractive">
        {positionScript}
      </Script>
    </>
  );
}

const positionScript = `
(function() {
  var CUPOS_TOTAL = 299;
  var CUPOS_BASE = 247;
  function getPos() {
    try {
      var key = 'santi_cupos_boost';
      var stored = parseInt(localStorage.getItem(key) || '0', 10);
      var boost = Math.max(stored, Math.floor(Math.random() * 2));
      localStorage.setItem(key, String(boost));
      return CUPOS_BASE + boost;
    } catch (e) {
      return CUPOS_BASE;
    }
  }
  var pos = getPos() + 1;
  var dtext = document.getElementById('discount-text');
  if (pos <= CUPOS_TOTAL) {
    if (dtext) dtext.textContent = 'Descuento exclusivo asegurado · Sos el #' + pos + ' / ' + CUPOS_TOTAL;
  } else {
    var chip = document.getElementById('discount-chip');
    if (chip) chip.style.display = 'none';
  }
})();
`;

const styles = `
  :root {
    --bg: #05070d;
    --bg-2: #0a0e1a;
    --surface: #0d1220;
    --surface-2: #131a2c;
    --border: rgba(255, 255, 255, 0.08);
    --border-strong: rgba(255, 255, 255, 0.16);
    --text: #e8ecf5;
    --text-dim: #8a93a6;
    --text-dimmer: #566075;
    --accent: #3d7dff;
    --accent-bright: #5b95ff;
    --accent-glow: rgba(61, 125, 255, 0.35);
    --accent-dim: rgba(61, 125, 255, 0.08);
    --green: #3ecf8e;
    --red: #ff5a5f;
    --mono: 'JetBrains Mono', ui-monospace, monospace;
    --sans: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  html, body { margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
    font-feature-settings: 'ss01', 'ss02', 'cv11';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(ellipse at top, black 20%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at top, black 20%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  body::after {
    content: '';
    position: fixed;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 80vw;
    height: 50vh;
    background: radial-gradient(ellipse at center, rgba(61, 125, 255, 0.14), transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .ty-shell {
    position: relative;
    z-index: 1;
  }

  .success {
    display: none;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    padding: 60px 32px;
    text-align: center;
  }
  .success.active { display: flex; }
  .success-inner { max-width: 640px; width: 100%; }

  .success-icon {
    width: 80px; height: 80px;
    margin: 0 auto 32px;
    border-radius: 20px;
    background: linear-gradient(135deg, var(--accent), #1a4fc7);
    display: grid; place-items: center;
    box-shadow: 0 0 60px var(--accent-glow);
    position: relative;
    animation: success-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes success-pop {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  .success-icon svg { width: 36px; height: 36px; }

  .success-discount {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    background: linear-gradient(90deg, rgba(62, 207, 142, 0.12), rgba(61, 125, 255, 0.12));
    border: 1px solid rgba(62, 207, 142, 0.3);
    border-radius: 100px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--green);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .success-discount .icon { font-size: 14px; }

  .success h2 {
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 700;
    letter-spacing: -0.03em;
    margin: 0 0 16px;
    line-height: 1.1;
  }
  .success p {
    font-size: 16px;
    color: var(--text-dim);
    margin: 0 0 28px;
    line-height: 1.6;
  }

  .success-signature {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 12px 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 36px;
  }
  .success-signature .avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }
  .success-signature .avatar img {
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .success-signature .who {
    text-align: left;
    font-size: 13px; line-height: 1.3;
  }
  .success-signature .who .name { color: var(--text); font-weight: 500; }
  .success-signature .who .handle { color: var(--text-dim); font-family: var(--mono); font-size: 11px; }

  .success-actions {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 18px 32px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: var(--sans);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.15) inset,
      0 8px 24px var(--accent-glow),
      0 0 60px var(--accent-glow);
    position: relative;
    overflow: hidden;
    text-decoration: none;
  }
  .cta::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  .cta:hover::before { transform: translateX(100%); }
  .cta:hover {
    transform: translateY(-2px);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.2) inset,
      0 12px 32px var(--accent-glow),
      0 0 80px var(--accent-glow);
  }
  .cta .arrow { font-family: var(--mono); transition: transform 0.2s; }
  .cta:hover .arrow { transform: translateX(4px); }

  .wa-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 18px 32px;
    background: #25D366;
    color: white;
    border: none;
    border-radius: 10px;
    font-family: var(--sans);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.15) inset,
      0 8px 24px rgba(37, 211, 102, 0.35),
      0 0 60px rgba(37, 211, 102, 0.3);
    position: relative;
    overflow: hidden;
    text-decoration: none;
  }
  .wa-btn:hover {
    transform: translateY(-2px);
    background: #2fdd71;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.2) inset, 0 12px 32px rgba(37,211,102,0.45);
  }
  .wa-btn svg { width: 18px; height: 18px; flex-shrink: 0; }
`;
