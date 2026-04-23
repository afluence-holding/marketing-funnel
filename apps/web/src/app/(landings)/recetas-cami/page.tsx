import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liberate del "que cocino hoy?" - Lista de espera',
  description: 'Landing de lista de espera para Recetas Cami.',
  openGraph: {
    title: 'Liberate del "que cocino hoy?" - Lista de espera',
    description: 'Landing de lista de espera para Recetas Cami.',
  },
};

async function loadHtml(): Promise<string> {
  const filePath = path.join(process.cwd(), 'src/app/(landings)/recetas-cami/landing.html');
  return fs.readFile(filePath, 'utf-8');
}

function injectEmailCapture(html: string): string {
  const emailCaptureScript = `
<script>
(() => {
  const API_PATH = '/api/recetas-cami/emails';
  const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  const sentEmails = new Set();

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  async function sendEmail(rawEmail, source) {
    const email = normalizeEmail(rawEmail);
    if (!email || !EMAIL_REGEX.test(email) || sentEmails.has(email)) return;
    sentEmails.add(email);

    try {
      await fetch(API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
          path: window.location.pathname,
          submittedAt: new Date().toISOString(),
        }),
      });
    } catch (_error) {
      // Ignore transient tracking errors to avoid breaking UX.
    }
  }

  function bindInput(input) {
    if (!input || input.dataset.emailCaptureBound === 'true') return;
    input.dataset.emailCaptureBound = 'true';

    input.addEventListener('blur', () => sendEmail(input.value, 'input-blur'));
    input.addEventListener('change', () => sendEmail(input.value, 'input-change'));
  }

  function bindForm(form) {
    if (!form || form.dataset.emailCaptureBound === 'true') return;
    form.dataset.emailCaptureBound = 'true';

    form.addEventListener('submit', () => {
      const input = form.querySelector('input[type="email"], input[name*="mail" i], input[id*="mail" i]');
      if (input) sendEmail(input.value, 'form-submit');
    });
  }

  function attachListeners() {
    document
      .querySelectorAll('input[type="email"], input[name*="mail" i], input[id*="mail" i]')
      .forEach(bindInput);
    document.querySelectorAll('form').forEach(bindForm);
  }

  attachListeners();
  const observer = new MutationObserver(attachListeners);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${emailCaptureScript}</body>`);
  }

  return `${html}${emailCaptureScript}`;
}

export default async function RecetasCamiLandingPage() {
  const html = injectEmailCapture(await loadHtml());

  return (
    <iframe
      srcDoc={html}
      title='Liberate del "que cocino hoy?" - Lista de espera'
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
