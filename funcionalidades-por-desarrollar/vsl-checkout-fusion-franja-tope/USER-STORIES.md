# VSL German — Fusión del checkout + Franja de testimonios tope de línea — User Stories

**Estado:** 🚧 En dev (rama `spike/german-vsl-checkout-embed-carousel`, ruta `/german-roz/vsl-lab`).
Generado + auditado con multi-agente (Workflow `vsl-fusion-stories`, 7 agentes). **NO mergeado** —
requiere aprobación + validación en dev (cumplida para G2; G1 a productizar).
**Goals:** (G1) fusionar el checkout DENTRO del VSL (modal sobre el VSL, no navegar) + terminar la
franja; (G2) dejar la franja **tope de línea** (premium + performante, mobile-first).

> Convención: `Como <rol>, quiero <acción>, para <valor>` · CE = Criterio de Éxito · V = Validación.

---

## GOAL 1 — Fusionar el checkout dentro del VSL

### Fase 1.A — Checkout en modal sobre el VSL (reusar el spike, sin overshoot)
**G1-1** — Como lead, quiero que al tocar "UNIRME A DESINFLAMARME EN 21 DÍAS" se abra el checkout
en un modal sobre el video, para comprar sin abandonar la página.
- **CE:** el CTA de compra (texto `desinflamarme` o href Hotmart) abre `VslCheckoutModal` con
  `HotmartCheckoutEmbed(productKey='german-desinflamate')` (z-index 10001); sin `window.open` ni
  navegación. Los CTAs "unirme al reto"/"quiero empezar" siguen haciendo scroll a la oferta. Cierra
  con ×, backdrop y ESC; restaura `body overflow`.
- **V:** Playwright en dev sobre `/german-roz/vsl-desinflamate`: click compra → overlay + `#inline_checkout`
  montado y URL NO cambia; click "unirme al reto" → scroll, sin modal. **[HECHO en lab; falta portar al VSL vivo].**

**G1-2** — Como dev, quiero refactorizar `vsl-tracker` con un callback `onCheckoutClick` (con `window.open`
como fallback), para portar el spike al VSL vivo con cambio mínimo y reversible.
- **CE:** `vsl-tracker.tsx` acepta `onCheckoutClick`; si está, abre el modal en vez de `window.open`.
  `vsl-attribution` (reescritura Hotmart→checkout) queda como defensa en profundidad.
- **V:** typecheck + Playwright; el flujo de compra no se rompe ni doble-dispara CAPI (Hotmart confirma
  inline, sin redirect → Purchase es CAPI-only por webhook). **[Pendiente — productización].**

### Fase 1.B — Inyectar la franja en el VSL vivo
**G1-3** — Como lead, quiero ver la franja de testimonios entre el video y los síntomas.
- **CE:** la franja se inyecta vía portal antes de la `<section>` de síntomas (ancla "Te sientes hinchada"),
  igual que en el lab, sin tocar el bundle minificado.
- **V:** Playwright: orden DOM hero → [franja] → síntomas. **[HECHO en lab; falta portar].**

---

## GOAL 2 — Franja tope de línea (premium + performante) ✅ HECHO en dev

**G2-1** — Como lead en móvil, quiero una franja de testimonios premium que cargue rápido.
- **CE:** **poster-first lazy** — 0 iframes de YouTube hasta el click (no N autoplay matando el móvil);
  máx **1 video vivo**: click monta el iframe (autoplay + audio + controls), click afuera lo desmonta.
- **V:** Playwright dev → `iframesAntesDelClick=0`, `iframesTrasClick=1`. **✅ verificado.**

**G2-2** — Como negocio, quiero que la franja se vea tope de línea y on-brand.
- **CE:** slot = poster 9:16 con gradiente + play naranja #FF5722 + badge "▶ Testimonio" + nombre/edad/
  reseña; marquesina en loop (ilusión de "muchos"), pausa al hover/touch/activo; fondo radial premium;
  hint "tocá para audio"; `prefers-reduced-motion` → strip scrollable.
- **V:** revisión visual en dev (captura). **✅ verificado.** Archivo:
  `apps/web/src/app/(landings)/german-roz/vsl-lab/testimonial-carousel.tsx` (v3).

---

## Hecho vs pendiente
- ✅ **G2 (franja tope de línea):** poster-first performante + diseño premium, validado en dev. Commiteado.
- ✅ **Checkout modal (G1-1):** funcional en el lab (HotmartCheckoutEmbed sobre el VSL).
- ⏳ **Productizar G1 al VSL vivo** (`vsl-desinflamate`): `onCheckoutClick` en `vsl-tracker` + render del modal +
  inyección de la franja en `vsl-desinflamate/page.tsx`. **Requiere tu aprobación** (toca el VSL en producción).

## Bloqueantes / insumos (de Negocio)
- **Videos embebibles reales** (Shorts) para la franja: el de Giulia (`MXugMSBXo4Y`) hoy **no permite inserción**
  (oEmbed 404); hay 2 placeholders demo. Activar "Permitir inserción" + mandar 2–3 reales.
- **Hotmart "Unknown error" en headless:** artefacto del sandbox; el embed funciona en `/checkout` real → confirmar
  en navegador.

## Riesgos
- Romper el flujo de compra al portar al VSL vivo → mitigación: cambio mínimo y reversible (`onCheckoutClick` con
  fallback), validar en dev antes de mergear.
- Doble-fire de CAPI → no aplica: Purchase es CAPI-only por webhook; el modal no dispara pixel de compra.
