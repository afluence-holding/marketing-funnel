const CHECKOUT_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Recetas Cami — Checkout</title>
  <meta name="robots" content="noindex,nofollow" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #ecebe8;
      --card: #e1d5c2;
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
      width: 54%;
      max-width: 360px;
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
      border: 1px solid #d5c4ac;
      border-radius: 28px;
      padding: 22px 22px 20px;
      max-width: 620px;
      margin: 0 auto;
      box-shadow: 0 4px 14px rgba(49, 22, 10, 0.08);
    }
    .card-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.05;
      margin-bottom: 6px;
      color: #3d2a22;
      text-align: center;
    }
    .card-sub {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 16px;
      text-align: center;
    }

    /* Order summary */
    .order {
      background: #f3eadd;
      border: 1px solid #dccbbb;
      border-radius: 16px;
      padding: 12px 14px;
      margin-bottom: 14px;
    }
    .order-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      padding: 5px 0;
    }
    .order-row + .order-row { border-top: 1px dashed #d5c4ac; }
    .order-row .label { color: var(--muted); }
    .order-row .value { font-weight: 600; }
    .order-total {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 20px;
      color: #3d2a22;
    }

    /* Country selector */
    .country-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      margin-bottom: 12px;
      background: #f3eadd;
      border: 1px solid #dccbbb;
      border-radius: 14px;
    }
    .country-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--muted);
      font-weight: 500;
      flex-shrink: 0;
    }
    .country-flag {
      font-size: 16px;
      line-height: 1;
    }
    .country-select-wrap {
      position: relative;
      flex: 1;
      min-width: 0;
    }
    .country-select {
      width: 100%;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background: #fff;
      border: 1px solid #dccbbb;
      border-radius: 10px;
      padding: 10px 36px 10px 14px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      cursor: pointer;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .country-select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(160, 102, 80, 0.16);
    }
    .country-select:disabled {
      opacity: 0.6;
      cursor: wait;
    }
    .country-chev {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted);
      pointer-events: none;
    }

    /* iframe wrapper */
    .checkout-frame-wrap {
      position: relative;
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
      background: #fff;
      border: 1px solid #dccbbb;
      min-height: 720px;
    }
    .checkout-frame {
      width: 100%;
      height: 720px;
      border: 0;
      display: block;
      background: #fff;
    }

    /* Loading state */
    .loader-overlay {
      position: absolute;
      inset: 0;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      color: var(--muted);
      font-size: 14px;
      z-index: 2;
      transition: opacity 0.3s ease;
    }
    .loader-overlay.hidden { opacity: 0; pointer-events: none; }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #efe5d8;
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Fallback button (shown if iframe fails) */
    .fallback {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 24px;
      text-align: center;
    }
    .fallback.show { display: flex; }
    .fallback p {
      color: var(--muted);
      font-size: 13px;
      max-width: 420px;
    }
    .fallback button {
      min-height: 56px;
      padding: 0 32px;
      border: none;
      border-radius: 14px;
      background: var(--accent);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .fallback button:hover { background: var(--accent-dark); }

    .secure-row {
      margin-top: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--muted);
      font-size: 12px;
    }
    .methods {
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      color: var(--muted);
      font-size: 11px;
      letter-spacing: 0.08em;
    }
    .methods .dot { width: 4px; height: 4px; border-radius: 50%; background: #c9b8a3; display: inline-block; }
    .footer {
      margin-top: 18px;
      text-align: center;
      color: #8f7c70;
      font-size: 13px;
    }

    /* Success state */
    .success {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px 24px;
      text-align: center;
    }
    .success.show { display: flex; }
    .success-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #2f7d4b;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .success h2 {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 26px;
      color: #3d2a22;
    }
    .success p {
      color: var(--muted);
      font-size: 14px;
      max-width: 380px;
    }

    @media (max-width: 768px) {
      .wrap { max-width: 430px; padding: 12px 12px 20px; }
      .hero { width: 74%; max-width: 320px; }
      .sub { font-size: 12px; margin-bottom: 14px; }
      .card { border-radius: 14px; padding: 12px; }
      .card-title { font-size: 16px; margin-bottom: 4px; }
      .card-sub { font-size: 12px; margin-bottom: 8px; }
      .order { border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; }
      .order-row { font-size: 13px; }
      .order-total { font-size: 17px; }
      .country-row { padding: 8px 10px; border-radius: 10px; gap: 8px; margin-bottom: 10px; }
      .country-label { font-size: 12px; }
      .country-select { font-size: 13px; padding: 8px 32px 8px 12px; border-radius: 8px; }
      .checkout-frame-wrap { border-radius: 10px; min-height: 640px; }
      .checkout-frame { height: 640px; }
      .footer { margin-top: 14px; font-size: 12px; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <img class="hero" src="https://marketing.byafluence.com/recetas-cami/hero.png" alt="Recetas saludables" loading="eager" />
    <div class="tag">CHECKOUT</div>
    <h1>Estás a un paso de <span>liberarte de "¿qué cocino?"</span></h1>
    <p class="sub">Acceso inmediato a la guía mensual de Recetas Cami. Pago único, sin suscripción, sin sorpresas.</p>

    <section class="card" aria-labelledby="checkout-title">
      <p id="checkout-title" class="card-title">Finalizar compra</p>
      <p class="card-sub">Pago seguro procesado por dLocal.</p>

      <div class="order" role="group" aria-label="Resumen de tu compra">
        <div class="order-row">
          <span class="label">Recetas Cami — Acceso completo</span>
          <span class="value">USD 27</span>
        </div>
        <div class="order-row">
          <span class="label">Impuestos</span>
          <span class="value">Incluidos</span>
        </div>
        <div class="order-row">
          <span class="label"><strong>Total</strong></span>
          <span class="value order-total">USD 27</span>
        </div>
      </div>

      <div class="country-row">
        <label for="country-select" class="country-label">
          <span class="country-flag" id="country-flag" aria-hidden="true">🌎</span>
          <span>País de pago</span>
        </label>
        <div class="country-select-wrap">
          <select id="country-select" class="country-select" aria-label="Selecciona tu país de pago">
            <option value="">Detectando…</option>
            <option value="AR">Argentina</option>
            <option value="BO">Bolivia</option>
            <option value="BR">Brasil</option>
            <option value="CL">Chile</option>
            <option value="CO">Colombia</option>
            <option value="CR">Costa Rica</option>
            <option value="EC">Ecuador</option>
            <option value="GT">Guatemala</option>
            <option value="ID">Indonesia</option>
            <option value="MX">México</option>
            <option value="MY">Malasia</option>
            <option value="PE">Perú</option>
            <option value="PY">Paraguay</option>
            <option value="UY">Uruguay</option>
          </select>
          <svg class="country-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      <div class="checkout-frame-wrap" id="checkout-wrap">
        <div class="loader-overlay" id="loader" aria-live="polite">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando pago seguro…</span>
        </div>

        <iframe
          id="checkout-frame"
          class="checkout-frame"
          title="Pago seguro dLocal"
          allow="payment *; clipboard-write"
          referrerpolicy="no-referrer-when-downgrade"
          src="about:blank"
          style="display:none"
        ></iframe>

        <div class="fallback" id="fallback">
          <p>El pago embebido no pudo cargarse. Continúa de forma segura en una nueva pestaña.</p>
          <button id="fallback-btn" type="button">Pagar USD 27</button>
        </div>

        <div class="success" id="success" aria-live="polite">
          <div class="success-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2>¡Pago confirmado!</h2>
          <p>Te enviaremos los accesos al correo en los próximos minutos.</p>
        </div>
      </div>

      <div class="secure-row" aria-label="Pago seguro">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>Pago cifrado · Procesado por dLocal Go</span>
      </div>
      <div class="methods" aria-hidden="true">
        <span>VISA</span><span class="dot"></span>
        <span>MASTERCARD</span><span class="dot"></span>
        <span>AMEX</span><span class="dot"></span>
        <span>PIX</span><span class="dot"></span>
        <span>OXXO</span>
      </div>
    </section>

    <p class="footer">© Cami cocina · hecho con cariño</p>
  </main>

  <script>
    (function () {
      // dLocal Go public credentials (same key as the original button snippet)
      const API_KEY = 'fMnjqHVVVbBxSTfroigYUkqZBlLBlRRn';
      const API_URL = 'https://api.dlocalgo.com/v1/checkout';

      // Path to redirect to after a successful payment.
      // Uses window.top so we escape the Next.js iframe wrapper that hosts this page.
      const SUCCESS_REDIRECT = '/recetas-cami/gracias';

      // Countries supported by dLocal Go (extracted from the SDK).
      // If the detected country isn't in this list, we fall back to letting
      // dLocal show its own selector with country="" so the user picks.
      const SUPPORTED = new Set([
        'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'EC', 'GT',
        'ID', 'MX', 'MY', 'PE', 'PY', 'UY'
      ]);

      const frame = document.getElementById('checkout-frame');
      const loader = document.getElementById('loader');
      const loaderText = loader.querySelector('span:last-child');
      const fallback = document.getElementById('fallback');
      const fallbackBtn = document.getElementById('fallback-btn');
      const successPanel = document.getElementById('success');
      const select = document.getElementById('country-select');
      const flag = document.getElementById('country-flag');

      let checkoutUrl = null;
      let frameLoaded = false;
      let activeRequestId = 0; // guards against stale responses when user changes country fast
      let successHandled = false; // prevent duplicate redirects

      // Country code → flag emoji
      function flagOf(code) {
        if (!code || !/^[A-Z]{2}$/.test(code)) return '🌎';
        return String.fromCodePoint(
          0x1F1E6 + code.charCodeAt(0) - 65,
          0x1F1E6 + code.charCodeAt(1) - 65
        );
      }

      function setLoaderText(t) { if (loaderText) loaderText.textContent = t; }

      function showFallback() {
        loader.classList.add('hidden');
        frame.style.display = 'none';
        fallback.classList.add('show');
      }

      function showSuccess() {
        if (successHandled) return;
        successHandled = true;
        loader.classList.add('hidden');
        frame.style.display = 'none';
        fallback.classList.remove('show');
        successPanel.classList.add('show');
        // Brief delay so the user sees the confirmation, then jump to /gracias.
        // window.top breaks out of the Next.js iframe wrapper.
        setTimeout(function () {
          try {
            (window.top || window).location.href = SUCCESS_REDIRECT;
          } catch (_) {
            window.location.href = SUCCESS_REDIRECT;
          }
        }, 1500);
      }

      function showLoader() {
        fallback.classList.remove('show');
        successPanel.classList.remove('show');
        loader.classList.remove('hidden');
        frame.style.display = 'none';
      }

      // --- Country detection ---
      // Try ipwho.is first (fast, no key, generous limits), then fall back
      // to Cloudflare's trace endpoint. If both fail, return '' and let
      // dLocal show its own selector.
      async function detectCountry() {
        // Cache the result for 24h so repeat visitors don't hit the API again
        try {
          const cached = JSON.parse(localStorage.getItem('dlg_country') || 'null');
          if (cached && cached.code && (Date.now() - cached.t) < 86400000) {
            return cached.code;
          }
        } catch (_) {}

        const sources = [
          async () => {
            const r = await fetch('https://ipwho.is/', { cache: 'no-store' });
            const d = await r.json();
            return (d && d.success !== false) ? (d.country_code || '').toUpperCase() : '';
          },
          async () => {
            const r = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'no-store' });
            const text = await r.text();
            const m = text.match(/loc=([A-Z]{2})/);
            return m ? m[1] : '';
          },
        ];

        for (const src of sources) {
          try {
            const code = await Promise.race([
              src(),
              new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2500)),
            ]);
            if (code && /^[A-Z]{2}$/.test(code)) {
              try {
                localStorage.setItem('dlg_country', JSON.stringify({ code, t: Date.now() }));
              } catch (_) {}
              return code;
            }
          } catch (_) { /* try next source */ }
        }
        return '';
      }

      // --- Checkout creation ---
      async function createCheckout(country) {
        // Only pre-select if the detected country is one dLocal Go supports
        const useCountry = SUPPORTED.has(country) ? country : '';

        const payload = {
          subType: 'BUTTON',
          country: useCountry,
          currency: 'USD',
          amount: '27',
          lang: 'es',
          text: 'Pagar',
        };

        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Referer': 'JSButton',
            Authorization: 'Bearer ' + API_KEY,
          },
          body: JSON.stringify(payload),
        });
        return res.json();
      }

      // Load checkout for a given country and swap iframe
      async function loadCheckout(country) {
        const myReqId = ++activeRequestId;
        frameLoaded = false;
        showLoader();
        setLoaderText('Cargando pago seguro…');

        try {
          const data = await createCheckout(country);

          // Bail if a newer request superseded this one
          if (myReqId !== activeRequestId) return;

          if (!data || !data.url) {
            console.error('dLocal returned no URL', data);
            showFallback();
            return;
          }
          checkoutUrl = data.url;
          frame.style.display = 'block';
          frame.src = checkoutUrl;

          // Safety: if it doesn't load in 10s, fall back
          setTimeout(() => {
            if (myReqId === activeRequestId && !frameLoaded) {
              console.warn('Iframe did not load in time, falling back to redirect');
              showFallback();
            }
          }, 10000);
        } catch (err) {
          if (myReqId !== activeRequestId) return;
          console.error('Error creating checkout:', err);
          showFallback();
        }
      }

      // iframe load handler — set once
      frame.addEventListener('load', () => {
        if (frame.src && frame.src !== 'about:blank') {
          frameLoaded = true;
          loader.classList.add('hidden');
        }
      });

      // User changes country — re-create checkout with new country
      select.addEventListener('change', () => {
        const code = select.value;
        flag.textContent = flagOf(code);
        if (code) {
          // Persist user's manual choice
          try { localStorage.setItem('dlg_country', JSON.stringify({ code, t: Date.now(), manual: true })); } catch (_) {}
          loadCheckout(code);
        }
      });

      // --- Initial flow ---
      (async () => {
        // Reset to placeholder while we detect
        select.disabled = true;

        const country = await detectCountry();
        if (country) {
          console.log('[checkout] detected country:', country);
        }

        // If detection landed on a supported country, pre-select it; otherwise
        // leave the placeholder visible and let the user pick.
        if (country && SUPPORTED.has(country)) {
          select.value = country;
          flag.textContent = flagOf(country);
        } else {
          // Show a generic placeholder — first option text becomes "Selecciona tu país"
          select.options[0].textContent = 'Selecciona tu país';
          flag.textContent = '🌎';
        }
        select.disabled = false;

        // Kick off checkout creation with whatever we have (may be empty)
        loadCheckout(country);
      })();

      // Fallback button — open in new tab
      fallbackBtn.addEventListener('click', () => {
        if (checkoutUrl) {
          window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        } else {
          window.location.reload();
        }
      });

      // Listen for postMessage events from the iframe (best-effort)
      window.addEventListener('message', (event) => {
        if (!event.origin || event.origin.indexOf('dlocalgo.com') === -1) return;
        const data = event.data;
        console.log('[dLocal message]', data);

        const str = typeof data === 'string' ? data.toLowerCase() : JSON.stringify(data || '').toLowerCase();
        if (str.indexOf('paid') !== -1 || str.indexOf('approved') !== -1 || str.indexOf('success') !== -1) {
          showSuccess();
        }
      });
    })();
  </script>
</body>
</html>`;

export async function GET() {
  return new Response(CHECKOUT_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // No cache: the dLocal checkout URL is generated per request and we
      // never want to hand out stale country state.
      'Cache-Control': 'no-store, max-age=0',
      // Prevent the page from being framed by anyone other than us.
      'X-Frame-Options': 'SAMEORIGIN',
    },
  });
}
