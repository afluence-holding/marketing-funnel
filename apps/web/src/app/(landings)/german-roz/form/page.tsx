import Image from 'next/image';
import { LeadForm } from '@/components/lead-form';
import { Cormorant_Garamond, Bebas_Neue } from 'next/font/google';
import type { Metadata } from 'next';
import germanBg from './german.webp';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
});

const display = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
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

        <h1 className={`gr-heading ${serif.className}`}>German Roz</h1>

        <div className="gr-form-wrap">
          <div className={`gr-titles ${display.className}`}>
            <h2 className="gr-titles-main">EXCLUSIVA DE ABRIL</h2>
            <p className="gr-titles-sub">SOLO PARA EL CÍRCULO INTERNO</p>
          </div>
          <LeadForm
            className="gr-form"
            ingestOrgKey="german-roz"
            ingestBuKey="main"
            source="landing-german-roz-form"
            fields={['firstName', 'email', 'phone']}
            placeholders={{
              firstName: 'Nombre',
              email: 'Correo',
              phone: 'WhatsApp',
            }}
            defaultValues={{ phone: '+51 ' }}
            hiddenFields={{ creator: 'german-roz' }}
            conversion={{ event: 'Lead', data: { content_name: 'german-roz-form' } }}
            submitLabel="¡Quiero mi cupo!"
            loadingLabel="Enviando..."
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
      rgba(0, 0, 0, 0.45) 0%,
      rgba(0, 0, 0, 0) 20%,
      rgba(0, 0, 0, 0) 45%,
      rgba(0, 0, 0, 0.55) 70%,
      rgba(0, 0, 0, 0.82) 100%
    );
  }

  .gr-heading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    font-size: clamp(2.8rem, 7vw, 4.5rem);
    font-weight: 300;
    color: #fff;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    line-height: 1.1;
    padding: 2.5rem 1rem 0;
  }

  .gr-form-wrap {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 0 1.5rem 3.5rem;
    overflow: visible;
  }

  .gr-titles {
    text-align: center;
    margin-bottom: 1.75rem;
  }

  .gr-titles-main {
    font-size: clamp(2.5rem, 7vw, 4rem);
    font-weight: 400;
    color: #f5e6c8;
    letter-spacing: 0.08em;
    line-height: 1.05;
    margin: 0 0 0.15em;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
  }

  .gr-titles-sub {
    font-size: clamp(1.1rem, 3vw, 1.5rem);
    font-weight: 400;
    color: #fff;
    letter-spacing: 0.25em;
    margin: 0;
    text-shadow: 0 1px 12px rgba(0, 0, 0, 0.35);
  }

  .gr-form {
    width: 100%;
    max-width: 380px;
    overflow: visible;
  }

  .gr-form input,
  .gr-form select,
  .gr-form textarea {
    background: rgba(255, 255, 255, 0.12) !important;
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
    border-radius: 4px !important;
    padding: 0.85rem 1rem !important;
    font-size: 0.9rem !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
    font-weight: 300 !important;
    letter-spacing: 0.05em !important;
    color: #fff !important;
    outline: none !important;
    transition: border-color 0.4s ease, background 0.4s ease !important;
    width: 100% !important;
  }

  .gr-form input::placeholder,
  .gr-form textarea::placeholder {
    color: rgba(255, 255, 255, 0.9) !important;
    font-weight: 300 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.12em !important;
    font-size: 0.7rem !important;
  }

  .gr-form input:focus,
  .gr-form select:focus,
  .gr-form textarea:focus {
    border-color: rgba(255, 255, 255, 0.9) !important;
    background: rgba(255, 255, 255, 0.18) !important;
  }

  /* Phone input — compact flag on left, input matches other fields */
  .gr-form .lead-form-phone {
    width: 100% !important;
    position: relative !important;
  }
  /* Dropdown overlays instead of pushing content — no layout shift */
  .gr-form .react-international-phone-country-selector {
    position: relative !important;
  }
  .gr-form .react-international-phone-country-selector-dropdown {
    position: absolute !important;
    z-index: 9999 !important;
    top: auto !important;
    bottom: 100% !important;
    left: 0 !important;
    margin: 0 0 4px 0 !important;
    background: rgba(20, 20, 20, 0.98) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 4px !important;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5) !important;
    color: #fff !important;
  }
  .gr-form .react-international-phone-country-selector-dropdown__list-item {
    color: inherit !important;
  }
  .gr-form .react-international-phone-country-selector-dropdown__list-item:hover,
  .gr-form .react-international-phone-country-selector-dropdown__list-item--selected,
  .gr-form .react-international-phone-country-selector-dropdown__list-item--focused {
    background: rgba(255, 255, 255, 0.15) !important;
    color: #fff !important;
  }
  .gr-form .react-international-phone-country-selector-dropdown__list-item-dial-code {
    color: rgba(255, 255, 255, 0.7) !important;
  }
  .gr-form .react-international-phone-input-container {
    display: flex !important;
    align-items: stretch !important;
  }
  .gr-form .react-international-phone-country-selector-button {
    background: rgba(255, 255, 255, 0.12) !important;
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
    border-right: none !important;
    border-radius: 4px 0 0 4px !important;
    color: #fff !important;
    cursor: pointer !important;
    padding: 0 0.5rem !important;
    min-width: 48px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .gr-form .react-international-phone-country-selector-button:hover {
    background: rgba(255, 255, 255, 0.18) !important;
  }
  .gr-form .react-international-phone-input-container .react-international-phone-input {
    border-radius: 0 4px 4px 0 !important;
    flex: 1 !important;
    min-width: 0 !important;
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

  /* Success state — replaces form with centered message */
  .gr-form[role="status"] {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    padding: 2.5rem 1rem !important;
    width: 100% !important;
  }

  .gr-form[role="status"] p {
    color: #fff !important;
    font-size: 0.95rem !important;
    font-weight: 300 !important;
    letter-spacing: 0.15em !important;
    text-transform: uppercase !important;
    line-height: 1.6 !important;
    margin: 0 !important;
  }

  .gr-form[role="status"]::before {
    content: "✓";
    display: block;
    width: 2.5rem;
    height: 2.5rem;
    margin: 0 auto 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    font-size: 1rem;
    font-weight: 300;
    color: #fff;
    line-height: 2.5rem;
    letter-spacing: 0;
  }

  @media (max-width: 480px) {
    .gr-heading {
      padding-top: 2rem;
    }
    .gr-form-wrap {
      padding: 0 1.25rem 2.5rem;
    }
    .gr-titles {
      margin-bottom: 1.25rem;
    }
    .gr-form {
      max-width: 340px;
    }
  }
`;
