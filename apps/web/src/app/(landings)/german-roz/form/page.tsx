import Image from 'next/image';
import { LeadForm } from '@/components/lead-form';
import { Cormorant_Garamond } from 'next/font/google';
import type { Metadata } from 'next';
import germanBg from './german.webp';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'German Roz',
  description: 'Conecta con German Roz — Déjanos tus datos.',
  openGraph: {
    title: 'German Roz',
    description: 'Conecta con German Roz — Déjanos tus datos.',
  },
};

export default function GermanRozForm() {
  return (
    <>
      <style>{luxuryOverrides}</style>

      <main className="gr-main">
        <div className="gr-bg" aria-hidden="true">
          <Image
            src={germanBg}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
            placeholder="blur"
          />
          <div className="gr-overlay" />
        </div>

        <div className="gr-content">
          <h1 className={`gr-heading ${serif.className}`}>German Roz</h1>

          <LeadForm
            className="gr-form"
            source="landing-german-roz-form"
            fields={['firstName', 'email', 'phone']}
            hiddenFields={{ creator: 'german-roz' }}
            conversion={{ event: 'Lead', data: { content_name: 'german-roz-form' } }}
            submitLabel="Enviar"
            successMessage="Gracias. Te contactaremos pronto."
            style={{ gap: '1.5rem' }}
          />
        </div>
      </main>
    </>
  );
}

const luxuryOverrides = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .gr-main {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .gr-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .gr-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.05) 35%,
      rgba(0, 0, 0, 0.50) 65%,
      rgba(0, 0, 0, 0.82) 100%
    );
  }

  .gr-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 380px;
    padding: 0 1.5rem 3.5rem;
  }

  .gr-heading {
    font-size: clamp(2.8rem, 7vw, 4.5rem);
    font-weight: 300;
    color: #fff;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    margin-bottom: 2.5rem;
    line-height: 1.1;
  }

  /* --- Form: no card, floats on the image --- */

  .gr-form {
    width: 100%;
  }

  .gr-form input,
  .gr-form select,
  .gr-form textarea {
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.35) !important;
    border-radius: 0 !important;
    padding: 0.85rem 0 !important;
    font-size: 0.85rem !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
    font-weight: 300 !important;
    letter-spacing: 0.05em !important;
    color: #fff !important;
    outline: none !important;
    transition: border-color 0.4s ease !important;
    width: 100% !important;
  }

  .gr-form input::placeholder,
  .gr-form textarea::placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
    font-weight: 300 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.12em !important;
    font-size: 0.7rem !important;
  }

  .gr-form input:focus,
  .gr-form select:focus,
  .gr-form textarea:focus {
    border-bottom-color: #fff !important;
  }

  .gr-form button[type="submit"] {
    background: #fff !important;
    color: #0a0a0a !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 1rem !important;
    font-size: 0.7rem !important;
    font-weight: 500 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.25em !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    margin-top: 0.75rem !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
    width: 100% !important;
  }

  .gr-form button[type="submit"]:hover {
    background: rgba(255, 255, 255, 0.85) !important;
  }

  .gr-form button[type="submit"]:disabled {
    background: rgba(255, 255, 255, 0.4) !important;
    color: rgba(0, 0, 0, 0.4) !important;
    cursor: not-allowed !important;
  }

  .gr-form p[role="status"] {
    color: #fff !important;
    font-weight: 300 !important;
    letter-spacing: 0.08em !important;
    text-align: center !important;
  }

  @media (max-width: 480px) {
    .gr-content {
      padding: 0 1.25rem 2.5rem;
      max-width: 340px;
    }
    .gr-heading {
      margin-bottom: 2rem;
    }
  }
`;
