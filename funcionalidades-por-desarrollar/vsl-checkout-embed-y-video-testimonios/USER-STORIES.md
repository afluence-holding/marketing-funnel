# VSL Desinflámate — Checkout embebido + Franja de video-testimonios — User Stories

**Estado:** 🧊 SPIKE HECHO Y PAUSADO (2026-06-10). Prototipo funcional validado con
Playwright en la rama `spike/german-vsl-checkout-embed-carousel`, ruta de prueba
`/german-roz/vsl-lab`. **NO está en producción ni en `main`** — es 100% aditivo
(ruta nueva, no toca el VSL en vivo). Se pausa para priorizar un landing urgente.
**Objetivo de negocio:** subir la conversión del VSL Desinflámate (DI21-C2) con
(1) un checkout que no saca al lead del VSL y (2) prueba social en video que
parezca abundante con pocos clips.
**Alcance:** dos features sobre el VSL de German (`/german-roz/vsl-desinflamate`).
NO entra: cambiar el bundle compilado del VSL, ni el checkout de otros creadores.

**Convención:** `Como <rol>, quiero <acción>, para <valor>` · **CE** = Criterio de
Éxito · **V** = Validación. **Roles:** Lead · Negocio · Dev.

---

## Contexto técnico imprescindible (no perder)

- **El VSL es una SPA React compilada y minificada** (`vsl-desinflamate/vsl-desinflamate.html`,
  ~5.700 líneas, todo el contenido en una línea minificada). Se sirve vía
  `<iframe srcDoc={html}>` desde `vsl-desinflamate/page.tsx`. **No se edita a mano**;
  los cambios de texto se hacen por reemplazo quirúrgico de literales.
- **El bundle tiene `<section>` reales (11)** → se puede anclar/inyectar por sección.
- **CTAs del VSL**: interceptados en runtime por `vsl-tracker.tsx` (fase de captura).
  Hoy en vivo: el botón "UNIRME A DESINFLAMARME EN 21 DÍAS" (y enlaces Hotmart) →
  checkout; los "UNIRME AL RETO" → scroll a la oferta (ya mergeado, PR #101).
- **Checkout**: `HotmartCheckoutEmbed` (`@/components/hotmart/hotmart-checkout-embed`)
  es un componente `'use client'` **autocontenido y reutilizable**: monta el
  `inlineCheckout` de Hotmart en `<div id="inline_checkout">`, resuelve la oferta
  del catálogo, maneja `sck`/atribución/InitiateCheckout. Hotmart confirma la compra
  **inline (sin redirect)** → todo el flujo cabe en un modal.
- **Provider activo de German**: Hotmart (cohort DI21-C2H). Catálogo en
  `packages/catalog/src/products/german-roz-main.ts`.

### Archivos del spike (rama `spike/german-vsl-checkout-embed-carousel`)
```
apps/web/src/app/(landings)/german-roz/vsl-lab/
  page.tsx                 ← server: carga el HTML del VSL en vivo y monta el frame
  vsl-lab-frame.tsx        ← client: iframe + intercepción de CTAs (checkout→modal,
                              "unirme al reto"→scroll) + inyección de la franja
                              (portal) antes de la sección de síntomas
  testimonial-carousel.tsx ← la franja v2: slots (video+texto), autoplay muteado,
                              click→desmutea+reinicia, click-afuera→pausa+mutea
  checkout-modal.tsx       ← modal que envuelve HotmartCheckoutEmbed
  playwright-check.mjs     ← script de verificación (placement, slot, comportamiento)
```
Ruta de prueba: **`/german-roz/vsl-lab`** (no indexable). Reusa el MISMO bundle del
VSL en vivo (no lo duplica). El VSL en vivo NO se toca.

---

## FASE 1 — Checkout embebido dentro del VSL
**Objetivo:** que el botón de compra abra el checkout en un modal sobre el VSL, sin
navegar a `/german-roz/desinflamate/checkout`. **Factibilidad: 🟢 alta** (probado).

**US-1.1** — Como Lead, quiero pagar sin salir del VSL, para no perder el contexto
de la oferta y no abandonar.
- **CE:** click en "UNIRME A DESINFLAMARME EN 21 DÍAS" abre un modal con el
  `HotmartCheckoutEmbed`; el resto de CTAs siguen su comportamiento (scroll). El
  flujo de compra (incl. confirmación inline de Hotmart) ocurre en el modal.
- **V:** Playwright — el modal abre y monta `#inline_checkout` ✓ (validado). Falta
  confirmar el render real de Hotmart en navegador (ver Bloqueante #2).

**US-1.2** — Como Negocio, quiero decidir si el modal lleva solo el formulario o
también la card CRO (precio/urgencia/valor/garantía), para no perder persuasión.
- **CE:** decisión tomada y reflejada en el modal.
- **V:** revisión visual. *(Pendiente de decisión — el `/checkout` actual tiene esa
  card; el VSL ya tiene la sección de oferta.)*

**Productización (lab → vivo):** añadir un `onCheckoutClick` a `vsl-tracker.tsx` (el
de producción) que abra el modal en vez de `window.open(buildDesinflamateCheckoutUrl())`,
y renderizar el modal en `vsl-desinflamate/page.tsx`. ~30–50 líneas, bajo riesgo.
`vsl-attribution.tsx` queda como defensa en profundidad.

---

## FASE 2 — Franja-carrusel de video-testimonios
**Objetivo:** una franja entre la sección del VSL (hero/video) y la sección de
síntomas, que parezca tener muchos testimonios con solo 2–3 videos.
**Ubicación CONFIRMADA por el usuario:** entre el VSL y la sección de síntomas
("¿Te sientes hinchada e inflamada…?"). **Factibilidad: 🟢 alta** (probado).

**US-2.1** — Como Lead, quiero ver varios video-testimonios, para confiar antes de
comprar.
- **CE:** franja horizontal en loop (marquesina) con los videos repetidos → "muchos"
  con pocos. Se pausa al hover/touch.
- **V:** Playwright — franja inyectada con 12 slots, marquesina en loop ✓.

**US-2.2 (diseño del SLOT)** — Como Negocio, quiero que cada slot tenga video +
nombre y apellido + edad + reseña, alineados, para que el testimonio sea creíble.
- **CE:** cada slot = video vertical 9:16 ARRIBA + bloque de texto ALINEADO debajo
  (nombre y apellido · edad · reseña corta), mismo ancho, como una unidad.
- **V:** Playwright + captura — composición confirmada ✓.

**US-2.3 (comportamiento de audio)** — Como Lead, quiero que los videos estén
muteados y al tocar uno suene, para una experiencia tipo "muro de reels".
- **CE:** todos en **autoplay muteado** (loop). Al **seleccionar** un slot: la cinta
  se detiene, el video **reinicia** (seek 0) y se **desmutea** (audio on). Al hacer
  **click fuera** del slot: el video se **pausa y mutea**, y la cinta reanuda.
- **V:** Playwright — al seleccionar: 1 slot "Con audio"; al click-afuera: 0 ✓.
  Control del player por **postMessage** a la IFrame API de YouTube (`enablejsapi=1`).

**US-2.4 (inyección sin tocar el bundle)** — Como Dev, quiero inyectar la franja en
el flujo del VSL sin editar el bundle minificado.
- **CE:** la franja se inserta vía **portal de React** en un slot DOM puesto antes
  del `<section>` de síntomas (se ancla por el texto "Te sientes hinchada"). Estilos
  **inline** + `<style>` propio (viajan al iframe, que no tiene el Tailwind del parent).
- **V:** Playwright — orden DOM: `hero → [franja] → síntomas` (`nextIsSymptoms: true`) ✓.

**Productización (lab → vivo):** replicar la inyección por portal en
`vsl-desinflamate/page.tsx` (un client component que, al cargar el iframe, inserta el
slot antes de la sección de síntomas y portea la franja). Mismo patrón que `vsl-tracker`.

---

## 🔴 Bloqueantes (no de código)

1. **Videos de YouTube no embebibles.** El de Giulia (`MXugMSBXo4Y`) da `oEmbed 404`
   (el thumbnail sí carga). El player muestra "Video no disponible". **Acción:** en
   YouTube Studio, cada testimonio debe estar **Público o No listado** y con
   **"Permitir inserción" activado**. Sin esto, no reproduce.
2. **Hotmart "Unknown error" en el sandbox headless** (chunks `pay.hotmart.com/_nuxt/*.js`
   dan 404). Muy probable artefacto del entorno headless — el MISMO embed funciona en
   `/checkout` de producción. **Acción:** confirmar el modal en navegador real.
3. **Performance de la franja:** hoy hay **12 iframes de YouTube en autoplay** (3
   videos × repeticiones). Varios players vivos es pesado y móvil puede bloquear
   autoplays. **Decisión pendiente:** (a) bajar repeticiones, o (b) usar **poster/preview
   liviano** que se vuelve player al tocar (en vez de 12 players vivos).

## Datos / decisiones pendientes (de Negocio)
- **Giulia:** edad + reseña real + cómo mostrar el nombre ("Giulia Chiappe" vs
  "Giulia Chiappe De Salazar"). Email de referencia: `giuliach18@icloud.com` (NO se
  muestra; es PII, no va en el código).
- **2 video-testimonios más** (Shorts), embebibles, para que la ilusión de "muchos"
  funcione (con 1 solo se repite y se nota).
- **Checkout:** modal (como el spike) vs sección inline; y si el modal lleva card CRO.
- **Performance:** 12 players vivos vs preview-liviano-al-tocar.

## Placeholders en el código (a reemplazar)
- `testimonial-carousel.tsx → TESTIMONIAL_VIDEOS`: hoy tiene a Giulia (real, pendiente
  de embedding) + 2 placeholders embebibles (`aqz-KE-bpKQ`, `ScMzIvxBSi4`) SOLO para
  validar diseño/comportamiento. Reemplazar por testimonios reales.

## Cómo retomar
1. `git checkout spike/german-vsl-checkout-embed-carousel`
2. `npm run dev:web` → abrir `http://localhost:3001/german-roz/vsl-lab`
3. Re-validar: `node apps/web/src/app/(landings)/german-roz/vsl-lab/playwright-check.mjs`
   (requiere `npm install --no-save playwright && npx playwright install chromium`).
4. Conseguir los insumos (videos embebibles + datos), decidir performance y checkout,
   y productizar (FASE 1 y 2 "lab → vivo").

## Estado de validación (Playwright, móvil 390×844, 2026-06-10)
- Placement franja entre hero y síntomas ✓
- Slot = video + texto (nombre/edad/reseña) alineado ✓
- Autoplay muteado ✓ · seleccionar → 1 "Con audio" ✓ · click-afuera → 0 ✓
- Checkout modal abre + monta `#inline_checkout` ✓ (render Hotmart a confirmar en navegador)
- Tap-to-pause en móvil ✓ (cards clickeables sin hover)
