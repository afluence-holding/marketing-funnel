import fs from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

type BundledManifestEntry = {
  mime: string;
  compressed?: boolean;
  data: string;
};

let cachedFinalHtml: string | null = null;

function extractBundlerBlock(rawHtml: string, type: string): string | null {
  const startTag = `<script type="${type}">`;
  const start = rawHtml.indexOf(startTag);
  if (start === -1) return null;

  const contentStart = start + startTag.length;
  const endTag = '\n  </script>';
  const end = rawHtml.indexOf(endTag, contentStart);
  if (end === -1) return null;

  return rawHtml.slice(contentStart, end).trim();
}

function unpackBundledLanding(rawHtml: string): string {
  const manifestRaw = extractBundlerBlock(rawHtml, '__bundler/manifest');
  const templateRaw = extractBundlerBlock(rawHtml, '__bundler/template');
  const extResourcesRaw = extractBundlerBlock(rawHtml, '__bundler/ext_resources');

  if (!manifestRaw || !templateRaw) return rawHtml;

  try {
    const manifest = JSON.parse(manifestRaw) as Record<string, BundledManifestEntry>;
    let template = JSON.parse(templateRaw) as string;

    const dataUrlsByUuid: Record<string, string> = {};
    for (const [uuid, entry] of Object.entries(manifest)) {
      let bytes = Buffer.from(entry.data, 'base64');
      if (entry.compressed) bytes = gunzipSync(bytes);
      dataUrlsByUuid[uuid] = `data:${entry.mime};base64,${bytes.toString('base64')}`;
    }

    for (const [uuid, dataUrl] of Object.entries(dataUrlsByUuid)) {
      template = template.split(uuid).join(dataUrl);
    }

    if (extResourcesRaw) {
      const extResources = JSON.parse(extResourcesRaw) as Array<{
        id: string;
        uuid: string;
      }>;
      const resourceMap: Record<string, string> = {};
      for (const resource of extResources) {
        const resolved = dataUrlsByUuid[resource.uuid];
        if (resolved) resourceMap[resource.id] = resolved;
      }

      const resourcesScript = `<script>window.__resources=${JSON.stringify(resourceMap)};</script>`;
      const headOpen = template.match(/<head[^>]*>/i);
      if (headOpen) {
        const insertAt = (headOpen.index ?? 0) + headOpen[0].length;
        template = `${template.slice(0, insertAt)}${resourcesScript}${template.slice(insertAt)}`;
      }
    }

    return template;
  } catch {
    // Fall back to raw HTML if bundle unpacking fails.
    return rawHtml;
  }
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

  if (html.includes('</body>')) return html.replace('</body>', `${emailCaptureScript}</body>`);
  return `${html}${emailCaptureScript}`;
}

export async function GET() {
  if (cachedFinalHtml) {
    return new Response(cachedFinalHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
      },
    });
  }

  const filePath = path.join(process.cwd(), 'src/app/(landings)/recetas-cami/landing.html');
  const rawHtml = await fs.readFile(filePath, 'utf-8');
  const unpackedHtml = unpackBundledLanding(rawHtml);
  const finalHtml = injectEmailCapture(unpackedHtml);
  cachedFinalHtml = finalHtml;

  return new Response(finalHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
    },
  });
}
