'use client';

import Image from 'next/image';
import logoLucas from '../../pre-launch-form/logo-lucas.png';

const WHATSAPP_GROUP_URL =
  'https://chat.whatsapp.com/FrS6wqhSWM2HdepEdajz92?mode=gi_t';

export function LucasRetoGraciasContent() {
  return (
    <>
      <style>{styles}</style>
      <div className="wrap">
        <div className="logo">
          <Image
            src={logoLucas}
            alt="Lucas con Luca$"
            width={140}
            priority
            style={{ width: 140, maxWidth: '65%', height: 'auto' }}
          />
        </div>

        <div className="success-icon" aria-hidden>
          ✓
        </div>

        <h1>¡Cupo reservado!</h1>
        <p className="subtitle">
          Tu compra del <strong>Reto Lucas con Luca$</strong> está confirmada.
        </p>

        <div className="card">
          <p>
            En los <strong>próximos minutos</strong> recibirás un correo y un mensaje de WhatsApp
            con el acceso al reto y los primeros pasos.
          </p>
          <p>
            El reto arranca pronto — revisa tu bandeja de entrada (y spam) para no perderte la
            bienvenida.
          </p>
        </div>

        <div className="actions">
          {WHATSAPP_GROUP_URL && (
            <a
              className="btn-wa"
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Unirme al grupo de WhatsApp
            </a>
          )}
          <a className="btn-secondary" href="/lucas-con-lucas/reto">
            Volver al reto
          </a>
        </div>

        <p className="footnote">
          ¿Problemas con el acceso? Escríbenos a{' '}
          <a href="mailto:contact@byafluence.com">contact@byafluence.com</a>
        </p>
      </div>
    </>
  );
}

const styles = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #0a0a0a; overflow-x: hidden; min-height: 100%; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #fff;
  background:
    radial-gradient(ellipse 80% 45% at 50% 0%, rgba(232, 98, 42, 0.22) 0%, transparent 70%),
    #0a0a0a;
}

.wrap {
  min-height: 100vh;
  min-height: 100dvh;
  max-width: 520px;
  margin: 0 auto;
  padding: 32px 20px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.logo { margin-bottom: 28px; }

.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #E8622A;
  background: rgba(232, 98, 42, 0.15);
  color: #E8622A;
  font-size: 26px;
  font-weight: 700;
  line-height: 52px;
  margin-bottom: 20px;
}

h1 {
  font-size: clamp(28px, 6vw, 38px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 15px;
  color: #aaa;
  line-height: 1.55;
  max-width: 400px;
  margin-bottom: 24px;
}

.subtitle strong { color: #fff; }

.card {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 20px 18px;
  text-align: left;
  margin-bottom: 24px;
}

.card p {
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.82);
  margin-bottom: 12px;
}

.card p:last-child { margin-bottom: 0; }
.card strong { color: #fff; }

.actions {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-wa {
  display: block;
  padding: 14px 16px;
  background: linear-gradient(135deg, #29d76d 0%, #22c45f 100%);
  border-radius: 10px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
}

.btn-secondary {
  display: block;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.footnote {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
}

.footnote a { color: #E8622A; }
`;
