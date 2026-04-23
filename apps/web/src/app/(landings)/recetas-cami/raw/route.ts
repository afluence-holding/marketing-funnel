const LANDING_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Liberate del "que cocino hoy?" - Lista de espera</title>
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
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }
    .wrap {
      max-width: 430px;
      margin: 0 auto;
      padding: 14px 14px 24px;
    }
    .hero {
      width: 100%;
      aspect-ratio: 3 / 4;
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
      line-height: 1.35;
      margin-bottom: 12px;
    }
    .card {
      background: var(--card);
      border: 1px solid #eadfd0;
      border-radius: 14px;
      padding: 12px;
      box-shadow: 0 4px 14px rgba(49, 22, 10, 0.08);
    }
    .label {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #5e4338;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
    }
    input[type="email"] {
      width: 100%;
      min-height: 44px;
      border: 1px solid #dccbbb;
      border-radius: 10px;
      padding: 0 12px;
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
      min-height: 44px;
      border: none;
      border-radius: 10px;
      padding: 0 14px;
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      background: var(--accent);
      cursor: pointer;
      white-space: nowrap;
    }
    button:hover { background: var(--accent-dark); }
    .msg {
      margin-top: 8px;
      font-size: 13px;
      color: #2f7d4b;
      min-height: 18px;
    }
  </style>
</head>
<body>
  <main class="wrap">
    <img class="hero" src="/recetas-cami/hero.png" alt="Recetas saludables" loading="eager" />
    <div class="tag">PROXIMAMENTE</div>
    <h1>Liberate del <span>"que cocino hoy?"</span></h1>
    <p class="sub">Deja tu correo y te avisamos primero cuando abramos la lista.</p>

    <form id="waitlist-form" class="card">
      <p class="label">Correo electronico</p>
      <div class="row">
        <input id="email" name="email" type="email" placeholder="tu@email.com" autocomplete="email" required />
        <button id="submit-btn" type="submit">Unirme</button>
      </div>
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
          msg.textContent = ok ? 'Listo! Ya estas en lista de espera.' : 'No se pudo guardar. Intenta de nuevo.';
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
