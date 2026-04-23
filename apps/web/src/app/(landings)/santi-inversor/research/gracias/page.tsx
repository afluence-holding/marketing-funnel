import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';

export const metadata: Metadata = {
  title: '¡Gracias! — Santi Inversor',
  description: 'Recibimos tus respuestas. Pronto nos pondremos en contacto contigo.',
  robots: { index: false, follow: false },
  openGraph: {
    title: '¡Gracias! — Santi Inversor',
    description: 'Recibimos tus respuestas. Pronto nos pondremos en contacto contigo.',
  },
};

interface PageProps {
  searchParams: Promise<{ name?: string }>;
}

export default async function SantiInversorResearchGracias({ searchParams }: PageProps) {
  const { name } = await searchParams;
  const displayName = (name ?? '').trim() || 'crack';

  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_SANTI_INVERSOR} />
      <style>{styles}</style>

      <main className="ty-main">
        <div className="ty-bg" aria-hidden="true" />

        <section className="ty-card">
          <div className="ty-check" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="ty-title">¡Gracias, {displayName}!</h1>

          <p className="ty-lead">
            Recibimos tus respuestas. Nuestro equipo las está revisando y pronto te contactaremos
            con los próximos pasos.
          </p>

          <p className="ty-note">
            Si no nos ves en tu bandeja de entrada, revisá la carpeta de spam o promociones.
          </p>
        </section>
      </main>
    </>
  );
}

const styles = `
  .ty-main {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.25rem;
    background: #0a0f14;
    color: #e8edf2;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    position: relative;
    overflow: hidden;
  }
  .ty-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 10%, rgba(34, 197, 94, 0.12), transparent 55%),
      radial-gradient(circle at 80% 90%, rgba(14, 165, 233, 0.10), transparent 55%);
    pointer-events: none;
  }
  .ty-card {
    position: relative;
    max-width: 520px;
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 2.5rem 2rem;
    text-align: center;
    backdrop-filter: blur(8px);
  }
  .ty-check {
    width: 56px;
    height: 56px;
    margin: 0 auto 1.25rem;
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ty-title {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0 0 0.75rem;
    letter-spacing: -0.02em;
  }
  .ty-lead {
    font-size: 1rem;
    line-height: 1.6;
    color: #c2ccd6;
    margin: 0 0 1rem;
  }
  .ty-note {
    font-size: 0.875rem;
    color: #8a96a3;
    margin: 0;
  }
`;
