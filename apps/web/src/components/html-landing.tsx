'use client';

/**
 * Wrapper for raw HTML landings (exported from Lovable, Webflow, etc.).
 *
 * Renders the HTML string via dangerouslySetInnerHTML inside a container div.
 * The tracking scripts from the (landings) layout still wrap this component,
 * so pixels fire normally.
 *
 * Usage:
 *   import { HtmlLanding } from '@/components/html-landing';
 *   // Option A: import raw HTML file (requires ?raw query in bundler)
 *   // import html from './landing.html?raw';
 *   // Option B: inline string
 *   const html = `<div>...</div>`;
 *   export default function MyLanding() {
 *     return <HtmlLanding html={html} />;
 *   }
 *
 * IMPORTANT: Only use with trusted HTML content — this renders unescaped HTML.
 */
export function HtmlLanding({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ width: '100%' }}
    />
  );
}
