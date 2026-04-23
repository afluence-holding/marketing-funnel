const LANDING_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Libérate del "¿qué cocino hoy?" - Lista de espera</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #f5efe6;
      --card: #f9f4ed;
      --text: #332018;
      --muted: #7a6357;
      --accent: #a06650;
      --accent-dark: #814f3d;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }
    .wrap {
      max-width: 760px;
      margin: 0 auto;
      padding: 12px 18px 24px;
    }
    .hero {
      width: 74%;
      max-width: 420px;
      margin: 0 auto;
      aspect-ratio: 4 / 5;
      object-fit: cover;
      border-radius: 18px;
      display: block;
      box-shadow: 0 8px 26px rgba(49, 22, 10, 0.12);
      background: #e8dfd3;
    }
    .tag {
      margin: 10px auto 8px;
      width: fit-content;
      font-size: 10px;
      letter-spacing: 0.2em;
      color: var(--muted);
      background: #efe5d8;
      border-radius: 999px;
      padding: 6px 10px;
    }
    h1 {
      font-family: 'Fraunces', Georgia, serif;
      text-align: center;
      font-size: clamp(33px, 7.4vw, 40px);
      line-height: 1.04;
      letter-spacing: -0.02em;
      margin-bottom: 10px;
    }
    h1 span {
      display: block;
      color: var(--accent);
      font-style: italic;
      font-weight: 700;
    }
    .sub {
      text-align: center;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.45;
      max-width: 640px;
      margin: 0 auto 16px;
    }
    .card {
      background: var(--card);
      border: 1px solid #eadfd0;
      border-radius: 28px;
      padding: 34px 36px 30px;
      box-shadow: 0 4px 14px rgba(49, 22, 10, 0.08);
      text-align: center;
    }
    .card-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.05;
      margin-bottom: 10px;
      color: #3d2a22;
    }
    .card-sub {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 16px;
    }
    input[type="email"] {
      width: 100%;
      min-height: 62px;
      border: 1px solid #dccbbb;
      border-radius: 16px;
      padding: 0 22px;
      font-size: 15px;
      color: var(--text);
      background: #fff;
      outline: none;
    }
    input[type="email"]:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(160, 102, 80, 0.16);
    }
    button {
      min-height: 62px;
      width: 100%;
      border: none;
      border-radius: 16px;
      padding: 0 16px;
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      background: var(--accent);
      cursor: pointer;
      white-space: nowrap;
      margin-top: 8px;
    }
    button:hover { background: var(--accent-dark); }
    .note {
      margin-top: 10px;
      color: var(--muted);
      font-size: 11px;
      font-style: italic;
      line-height: 1.35;
    }
    .msg {
      margin-top: 8px;
      font-size: 12px;
      color: #2f7d4b;
      min-height: 18px;
    }
    @media (max-width: 768px) {
      .wrap { max-width: 430px; padding: 12px 12px 20px; }
      .hero { width: 86%; }
      .sub { font-size: 12px; margin-bottom: 14px; }
      .card { border-radius: 14px; padding: 12px; }
      .card-title { font-size: 16px; margin-bottom: 4px; }
      .card-sub { font-size: 12px; margin-bottom: 8px; }
      input[type="email"] {
        min-height: 42px;
        border-radius: 10px;
        padding: 0 12px;
        font-size: 15px;
      }
      button {
        min-height: 44px;
        border-radius: 10px;
        font-size: 15px;
      }
      .note { font-size: 11px; }
      .msg { font-size: 12px; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <img class="hero" src="/recetas-cami/hero.png" alt="Recetas saludables" loading="eager" />
    <div class="tag">PROXIMAMENTE</div>
    <h1>Libérate del <span>"¿qué cocino hoy?"</span></h1>
    <p class="sub">Una guía mensual pensada para personas que no tienen tiempo en el día a día y están agotadas de decidir qué hacer de comer. Sé de los primeros en saber cuándo sale.</p>

    <form id="waitlist-form" class="card">
      <p class="card-title">Únete a la lista de espera</p>
      <p class="card-sub">Acceso anticipado + precio especial para los primeros 100.</p>
      <input id="email" name="email" type="email" placeholder="tu@correo.com" autocomplete="email" required />
      <button id="submit-btn" type="submit">Quiero ser de los primeros</button>
      <p class="note">Sin spam, sin promesas vacías. Solo aviso cuando salga y el descuento de lanzamiento.</p>
      <p id="msg" class="msg"></p>
    </form>
  </main>

  <script>
    (() => {
      const API_PATH = '/api/recetas-cami/emails';
      const form = document.getElementById('waitlist-form');
      const input = document.getElementById('email');
      const msg = document.getElementById('msg');
      const btn = document.getElementById('submit-btn');
      const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

      async function saveEmail(source) {
        const email = String(input.value || '').trim().toLowerCase();
        if (!EMAIL_REGEX.test(email)) return false;

        const res = await fetch(API_PATH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            source,
            path: window.location.pathname,
            submittedAt: new Date().toISOString(),
          }),
        });
        return res.ok;
      }

      input.addEventListener('blur', () => {
        saveEmail('input-blur').catch(() => {});
      });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        msg.textContent = '';
        btn.disabled = true;
        btn.textContent = 'Guardando...';
        try {
          const ok = await saveEmail('form-submit');
          msg.textContent = ok ? '¡Listo! Ya estás en lista de espera.' : 'No se pudo guardar. Intenta de nuevo.';
        } catch (_error) {
          msg.textContent = 'No se pudo guardar. Intenta de nuevo.';
        } finally {
          btn.disabled = false;
          btn.textContent = 'Unirme';
        }
      });
    })();
  </script>
</body>
</html>`;

export async function GET() {
  return new Response(LANDING_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
    },
  });
}
