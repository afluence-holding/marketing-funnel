import { permanentRedirect } from 'next/navigation';

// ---------------------------------------------------------------------------
// /vsl-desinflamate → /german-roz/lista-espera (308 PERMANENT)
// ---------------------------------------------------------------------------
// La VSL fue construida para cerrar venta vigente (countdown, $87 USD,
// botón a Hotmart). Cerrada la edición de abril 2026, la página queda como
// un anuncio engañoso: el countdown está expirado, el sticky button apunta
// hardcoded a un checkout cerrado y el VslTracker dispara InitiateCheckout
// sin venta posible — todo eso ensucia el pixel y daña confianza.
//
// La VSL completa vive en `vsl-desinflamate.html` (bundle compilado de 582k
// caracteres) y los componentes asociados (HotmartAttribution, VslTracker)
// quedan como artefactos en disco para resucitar la venta sin tener que
// re-buildear cuando se confirme la próxima edición.
//
// Detalles del redirect que importan:
//
//   1. `permanentRedirect()` emite **308**, no 307. `redirect()` de
//      `next/navigation` es 307 (temporal) por defecto, lo que en SEO le
//      dice a Google "este movimiento puede revertirse" — no consolida
//      la autoridad del dominio en la nueva URL. Para un cierre de venta
//      con landing nueva queremos 308.
//
//   2. Path absoluto `/german-roz/lista-espera`, NO `/lista-espera`. El
//      middleware de `nutricion.germanroz.com` reescribe `/lista-espera`
//      a `/german-roz/lista-espera` solo cuando el host coincide. En
//      previews (`*.vercel.app`, `localhost`) o cualquier deploy sin el
//      host mapeado, `/lista-espera` daría 404. El middleware tiene un
//      fallback "no rewrite si ya está prefijado", así que mandar
//      directamente la ruta canónica del repo funciona en todos lados.
//
//   3. Preservamos `?fbclid`, `?utm_*` y cualquier otro query param.
//      `permanentRedirect('/path')` no los arrastra por defecto, así que
//      los reconstruimos manualmente desde `searchParams` que Next.js
//      pasa al Server Component. Esto preserva atribución de anuncios
//      viejos que aún apunten a /vsl-desinflamate.
// ---------------------------------------------------------------------------

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VslDesinflamateRedirect({
  searchParams,
}: PageProps): Promise<never> {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v);
    } else {
      qs.append(key, value);
    }
  }
  const target = qs.toString()
    ? `/german-roz/lista-espera?${qs.toString()}`
    : '/german-roz/lista-espera';
  permanentRedirect(target);
}
