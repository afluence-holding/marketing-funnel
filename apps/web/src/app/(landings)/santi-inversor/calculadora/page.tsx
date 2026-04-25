import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';

const CALCULATOR_URL = 'https://frabjous-treacle-316d4f.netlify.app/';
const COMMUNITY_URL = 'https://t2m.io/tnbLP79';
const COMMUNITY_TEXT = '¡Únete a mi comunidad para obtener más noticias!';

export const metadata: Metadata = {
  title: 'Santi Inversor / Calculadora',
  description:
    'Calculadora de libertad financiera para estimar en cuántos años puedes dejar de depender de tu sueldo.',
  openGraph: {
    title: 'Santi Inversor / Calculadora',
    description:
      'Calculadora de libertad financiera para estimar en cuántos años puedes dejar de depender de tu sueldo.',
  },
};

function injectBaseTag(html: string): string {
  if (/<base\s/i.test(html)) return html;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(
      /<head([^>]*)>/i,
      `<head$1><base href="${CALCULATOR_URL}" />`,
    );
  }
  return `<base href="${CALCULATOR_URL}" />${html}`;
}

function patchCalculatorCtas(rawHtml: string): string {
  let html = injectBaseTag(rawHtml);

  // Remove the primary WhatsApp button while keeping the CTA box intact.
  html = html.replace(
    /<a\b[^>]*>\s*(?:<[^>]+>\s*)*Únete a mi grupo de WhatsApp(?:\s*<\/[^>]+>)*\s*<\/a>/i,
    '',
  );

  html = html.replace(
    /Quiero mejorar mi estrategia\s*→\s*únete al grupo/gi,
    COMMUNITY_TEXT,
  );
  html = html.replace(/Unirme al grupo de WhatsApp/gi, COMMUNITY_TEXT);
  html = html.replace(/Sumate al grupo de WhatsApp/gi, COMMUNITY_TEXT);
  html = html.replace(
    /https:\/\/chat\.whatsapp\.com\/[^\s"'<>]+/gi,
    COMMUNITY_URL,
  );

  return html;
}

async function loadCalculatorHtml(): Promise<string | null> {
  try {
    const response = await fetch(CALCULATOR_URL, { cache: 'no-store' });
    if (!response.ok) return null;
    const rawHtml = await response.text();
    return patchCalculatorCtas(rawHtml);
  } catch {
    return null;
  }
}

export default async function SantinversorCalculadoraLanding() {
  const html = await loadCalculatorHtml();

  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_SANTI_INVERSOR} />
      <iframe
        src={html ? undefined : CALCULATOR_URL}
        srcDoc={html ?? undefined}
        title="Santi Inversor / Calculadora"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          display: 'block',
        }}
      />
    </>
  );
}
