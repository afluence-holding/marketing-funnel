# Migración checkout Whop → Hotmart (German Roz) — User Stories

**Estado:** ✅ HECHO — German vende por Hotmart en producción 2026-06-10. Fases 0–4 ejecutadas: spike → embed provider-aware → webhook + CAPI + refunds → switch C2 (#89) → compra real validada en Meta. Plan conservado abajo como registro.
**Objetivo de negocio:** reemplazar el checkout embebido de Whop por el de Hotmart en la página de checkout de German Roz (DI21), manteniendo atribución de paid media, tracking deduplicado y entrega de acceso.

**Alcance:**
- ENTRA: embed Hotmart en German, webhook + CAPI server-side, adapter Hotmart sobre el catálogo de cohorts.
- NO ENTRA — **entrega de acceso**: la maneja un **sistema independiente** fuera de este repo (decisión de Negocio 2026-06-09). El webhook de este repo solo trackea y persiste; única obligación: verificar en el go-live que ese sistema esté conectado a Hotmart (checklist Fase 4).
- **PRECONDICIÓN DURA:** `modularizacion-cohorts` está **implementado en working tree pero sin mergear**. Antes de la Fase 1 de este plan: commitear, QA, mergear y deployar cohorts (API primero, web después) con su migración `20260611000000` aplicada. No se construye Hotmart sobre código sin mergear.
- NO ENTRA: cambiar el funnel de Lucas con Lucas (se mantiene en Whop, aislado estructuralmente — no está en el catálogo y tiene rama dedicada en el webhook).
- **Reemplazo vía catálogo:** el switch de provider es **un PR de catálogo** (cambiar `checkoutRef` de los tiers, o lanzar el siguiente cohort ya en Hotmart). **Rollback = `git revert` de ese PR + deploy** — sin flag runtime (el modelo `Tier.checkoutRef` es un provider por tier; un flag exigiría duplicar refs, exactamente la complejidad que cohorts eliminó). La rama Whop del webhook sigue viva tras el switch (pagos en vuelo + refunds rezagados).

**Brief de referencia:** [`docs/hotmart-embedded-checkout-brief.md`](../../docs/hotmart-embedded-checkout-brief.md)

**Convención:**
`Como <rol>, quiero <acción>, para <valor>` · **CE** = Criterio de Éxito · **V** = Validación.
**Roles:** Comprador · Negocio (Nico) · Dev (Cristóbal) · Sistema/Tracking · Marketing (atribución) · QA.

---

## Análisis de impacto (re-verificado 2026-06-09, multi-agente, repo post-cohorts)

### Lo que la implementación de cohorts YA resolvió de este plan
- **`Tier.checkoutRef = {provider:'whop',planId} | {provider:'hotmart',offerCode}`** existe en `packages/catalog/src/types.ts` — el "registro unificado con provider" (ex US-1.2) está hecho, a nivel tier.
- **Resolvers agnósticos**: `getCohortByCheckoutId` resuelve por `offerCode` por diseño; `resolveActiveCohort`/`resolveTier` con reloj inyectable y 42 tests (ex US-1.1: no hay nada que extraer a `lib/checkout/*`; `getWindowState` fue **eliminada** por decisión de Negocio — sin ventana/redirects).
- **Idempotencia durable** (ex US-3.2, ~80%): `marketing.purchases` ya tipa `provider: 'hotmart'`, con `UNIQUE(provider, external_id)`, `status` (approved/refunded/chargeback/canceled), `refunded_at`, `capi_sent_at` y `persistPurchase()` con degradación si la DB falla.
- **Atribución de cohort en webhook** ya implementada para Whop (metadata → plan → fecha) — para Hotmart la prioridad real será `offer.code → fecha` (no hay metadata).
- **Rotación WhatsApp** (`assignGroup`, atómica e idempotente por phone) lista para usarse como mecanismo de entrega.
- **Lucas**: aislado estructuralmente (fuera del catálogo + rama propia en webhook).

### Lo que NO existe y el plan original no abordaba (huecos críticos)
1. **Dedup Purchase pixel↔CAPI sin metadata custom.** Todo el dedup actual cuelga del `meta_event_id` que viaja en la metadata de la sesión Whop. Hotmart no tiene session creation ni metadata custom → el canal desaparece. Candidato: transportar el `purchaseEventId` en `sck` (vuelve en `origin.sck`). Además PIX/boleto confirman horas después y a veces en otro dispositivo → sin ctx local en gracias → **CAPI-only para esos casos, nunca un event_id aleatorio**.
2. **Entrega de acceso** — ✅ resuelto por decisión de Negocio: la entrega la realiza un **sistema independiente** fuera de este repo (no la membresía de Whop ni este webhook). En el repo, sequences/workflows de German están vacíos y el webhook no entrega nada — y así se queda. Riesgo residual (cubierto en Fase 4): confirmar que ese sistema independiente reciba las compras de Hotmart igual que recibía las de Whop.
3. **Moneda LatAm.** Catálogo = USD $67/$77/$87; Hotmart LatAm cobra en moneda local (PIX/BRL, MXN…). Sin política: pixel (USD) vs CAPI (local) divergen y `purchases` suma monedas mixtas.
4. **Adapter web descarta tiers Hotmart**: `toWhopTier` en `apps/web/src/lib/whop/products.ts` devuelve `null` para `provider:'hotmart'` — declarar un `offerCode` en el catálogo HOY rompería el checkout silenciosamente. Es el único trabajo real que queda de la antigua Fase 1.
5. **Página de gracias**: Whop redirige con `?status=success&receipt_id=...` que nosotros controlamos; el redirect de Hotmart se configura en su panel y no sabemos qué params trae (CONFIRM #3 del brief — ninguna US lo probaba).
6. **No hay colas** (v0 explícito) — el CE de US-3.5 que pedía "cola/async" era irreal; el patrón vigente es awaits con timeouts cortos.

### Correcciones de estado
- **PR #74**: su C0 (contentId) ya salió mergeado como **PR #77**; C1/C3/C4 siguen en #74 (CONFLICTING tras #76); el C2 (VSL dinámico) está propuesto para absorberse en el runtime de cohorts.
- US-3.3 original decía "Purchase dedup **con el IC**" — error: Meta dedupea por `event_name`+`event_id`; Purchase dedupea contra el **pixel Purchase** del gracias, nunca contra InitiateCheckout.

---

## Decisiones (de Negocio — resueltas 2026-06-09 con Nico/Cristóbal)

1. **Switch en C3** ✅ — Hotmart se estrena con el cohort C3 (cambio 100% aditivo: C2 termina su vida en Whop intocado; el PR de catálogo de C3 nace con `checkoutRef: {provider:'hotmart', offerCode}`). Riesgo ≈ 0; es el caso de uso estrella del modelo aditivo. Implicación de calendario: la Fase 4 ocurre al lanzar C3, no antes; las Fases 0–3 se construyen y validan en staging durante C2.
2. **Moneda: base USD + checkout localizado de Hotmart, snapshot normalizado en datos** ✅ (dirección decidida; los datos finos los confirma US-0.7) — el offer se ancla en USD (paridad con la escalera/ads/VSL), se deja a Hotmart mostrar moneda local + métodos locales (es el upside de conversión de migrar), y los datos se normalizan: `purchases` guarda `amount`/`currency` **cobrados** + `amount_usd` snapshot del tier; CAPI reporta lo cobrado (Meta convierte solo); el dashboard reporta en `amount_usd`. Detalle de UX y validación en US-0.7/US-2.2.
3. **Entrega: FUERA DE ALCANCE** ✅ — la maneja un sistema independiente que el negocio ya opera fuera de este repo. El webhook de este repo NO entrega acceso (solo tracking + persistencia + refund status). Obligación residual en Fase 4: verificar que el sistema independiente esté conectado a las compras de Hotmart antes del switch.
4. **PR #74: cerrado, sin rebase** ✅ — C0 ya salió (#77); C1/C4 se portan en US-2.6; C2 lo absorbe cohorts (Épica B); **C3 (fechas "27 de abril" obsoletas en el VSL) queda huérfano** → fix menor de 1 línea pendiente, anotado aquí para no perderlo.

---

## FASE 0 — Spike de viabilidad — ✅ EJECUTADA (2026-06-10, compra real HP0999901990)

**Resultados de los [CONFIRM] (payloads completos en `marketing.hotmart_webhook_events`):**
- **US-0.2/0.3 ✅** Compra real `PURCHASE_APPROVED` (transaction `HP0999901990`, offer `ymzf5qdj`, cupón `TEST` → $0.71 USD cobrados como **2.44 PEN**) recibida en `POST /api/webhooks/hotmart` con HOTTOK válido; contrato v2.0.0 = brief §5.3 + extras útiles: `original_offer_price`, `offer.coupon_code`, `buyer.address.country_iso` (→ campo country del CAPI), `commissions[]` en USD.
- **US-0.4 ✅✅ (el crítico)** Round-trip de atribución EXACTO: `sck` volvió con el UUID de 36 chars intacto (`29cf0c6a-…`), `src`/`xcod` idénticos → **`sck` ES el portador viable del `purchaseEventId`** para el dedup pixel/CAPI de Fase 2/3.
- **US-0.7 ✅** Moneda confirmada en compra real: offer ancla USD → cobro en moneda local (PEN). CAPI debe reportar lo cobrado; `amount_usd` snapshot para reporting.
- **Bonus**: el test de webhook del panel disparó TODOS los tipos de evento (`REFUNDED`, `CHARGEBACK`, `CANCELED`, `EXPIRED`, `PROTEST`, `BILLET_PRINTED`, `COMPLETE`, `ORDER_FULFILLMENT`) — contrato de refunds para Fase 3 capturado.
- **Nota Fase 2**: el campo de cupón estaba visible (se usó `TEST`) → confirmar `hideCouponOption: '1'` en el embed de producción.
- **US-0.5 ✅** iOS: el embed montó y scrolleó bien en iPhone real → **go**.
- **US-0.1 ~resuelta por diseño**: el panel de diagnóstico no mostró el init usado (se vio en blanco), pero la compra completó → el código con fallback `'inlineCheckout' → 'inline'` funciona tal cual. Decisión: **Fase 2 conserva el mismo try-in-order + log** del init que dispare (la telemetría lo responderá en producción).
- **US-0.6 ⚠️ HALLAZGO CLAVE**: tras pagar **NO hubo redirect** — el comprador se queda en el embed (confirmación inline de Hotmart). Implicación: la página de gracias NO se alcanza por defecto → el pixel Purchase del navegador no dispararía. Resolución en dos vías: (a) intentar configurar la "página de gracias" del producto en el panel Hotmart (ajustes de confirmación de compra por método de pago) y re-probar; (b) si no existe/no funciona → **Purchase CAPI-only** (diseño ya previsto): sin pixel no hay nada que dedupear, y el CAPI va con user_data fuerte (Hotmart entrega email+nombre+documento+país del comprador) + `event_id` del `sck`. La Fase 2 implementa gracias tolerante a ambos mundos.
- **Pendiente operativo**: refund de la compra de prueba `HP0999901990` desde el panel (validará de paso el evento `REFUNDED` real).

**GO/NO-GO de FASE 0: ✅ GO** — iOS funciona, atribución sobrevive front→back con `sck` como portador del event_id, webhook autenticado con contrato completo (incl. refunds), moneda localizada confirmada. Único ajuste de diseño derivado: Purchase posiblemente CAPI-only (ver US-0.6).

### Stories originales (referencia)
**Objetivo:** resolver los `[CONFIRM]` del brief con la librería y el panel reales antes de invertir en arquitectura. (Código desechable, ½–1 día.) **Esta fase no depende de nada — puede arrancar ya, en paralelo al merge de cohorts.**

**US-0.1** — Como Dev, quiero montar `inlineCheckout` con un offer real en una página throwaway, para confirmar el identificador y script correctos.
- **CE:** el checkout renderiza inline; queda documentado el string de init (`inlineCheckout` vs `inline`) y la URL exacta del script.
- **V:** la página carga el embed en Chrome desktop sin errores de consola; se anota init+script verificados.

**US-0.2** — Como Comprador, quiero completar una compra de prueba, para confirmar que el flujo de pago funciona end-to-end.
- **CE:** una transacción de prueba (sandbox o monto bajo con refund) llega a estado `APPROVED`.
- **V:** la compra aparece en el panel Hotmart con su `transaction` id.

**US-0.3** — Como Sistema, quiero recibir el webhook de esa compra, para confirmar el contrato de Postback v2.0.0.
- **CE:** llega `POST` con `X-HOTMART-HOTTOK` válido y `event = PURCHASE_APPROVED`; se capturan `transaction`, `offer.code`, `full_price`, `origin.{src,sck,xcod}`.
- **V:** payload crudo logueado en endpoint temporal y comparado contra el brief §5.3.

**US-0.4** — Como Marketing, quiero pasar `sck/src/xcod` en el embed y verlos volver en el webhook, para confirmar que la atribución sobrevive front→back **y que `sck` puede portar nuestro `purchaseEventId`**.
- **CE:** los 3 params enviados en `init()` reaparecen idénticos en `data.purchase.origin`, **incluyendo un `sck` que porta un UUID de 36 chars** (candidato a portador del event_id de dedup); documentados longitud máxima y charset tolerados; decidido el esquema si `sck` también lleva campaña (componer `<campaign>|<eventId>` o repartir con `xcod`/`src`).
- **V:** diff exacto entre lo enviado y lo recibido, con el UUID intacto.

**US-0.5** — Como Comprador iOS, quiero que el embed funcione en Safari iPhone, para no perder el ~50% de tráfico móvil LatAM.
- **CE:** el iframe monta, scrollea y permite pagar en iPhone real (Safari + Chrome).
- **V:** prueba en dispositivo físico (no simulador), incl. modo privado.

**US-0.6 (nueva)** — Como Sistema, quiero documentar el redirect post-compra real, para diseñar la página de gracias y el dedup.
- **CE:** queda respondido: ¿el redirect es configurable en el panel? ¿a qué URL va? ¿con qué query params (transaction, status, otros)? Tabla de params observados en compra desktop + iOS, **incluyendo pago PIX/boleto (confirmación diferida — ¿hay redirect siquiera?)**. Evaluar de paso si Hotmart Club resuelve la entrega (decisión pendiente #3a).
- **V:** captura de la URL de aterrizaje real de cada caso.

**US-0.7 (nueva)** — Como Negocio, quiero ver qué moneda muestra y cobra Hotmart desde IPs/medios LatAm, para decidir la política de moneda.
- **CE:** `full_price.{value,currency_value}` documentados para ≥2 países (ej. PE y MX); verificado si el offer puede fijarse USD-only y qué métodos de pago se pierden; decisión pendiente #2 tomada con estos datos.
- **V:** capturas del checkout + payloads de webhook con las monedas observadas.

**Validación de FASE 0:** los `[CONFIRM]` del brief (init/script, redirect de gracias + params, callback JS sí/no, atribución round-trip + `sck` como portador, sandbox, iOS, moneda) quedan resueltos **por escrito**.
**Éxito de FASE 0 (go/no-go):** una compra de prueba en una página nuestra dispara un webhook verificado con atribución correcta en iOS y desktop. Si falla iOS o la atribución → **no-go**, se reevalúa (overlay/hosted). Si `sck` no porta el eventId **y** el redirect no trae `transaction` → decidir explícitamente "CAPI-only sin pixel Purchase" antes de continuar.

---

## FASE 1 — Adapter Hotmart sobre el catálogo — ✅ IMPLEMENTADA (2026-06-10)
**Objetivo:** que el catálogo pueda declarar tiers Hotmart sin romper nada. (La antigua Fase 1 quedó obsoleta: la abstracción provider ya existe en `packages/catalog`; esto era lo único que faltaba.)

> **Precondición:** ✅ cumplida — `modularizacion-cohorts` mergeado (PR #78) y desplegado; migración aplicada; checkout verificado en producción ($67, HTTP 200). `gen-types` diferido (script ausente en el repo + requiere Docker; nada consume el cliente tipado aún).
> **Implementación:** rama `feat/hotmart-tier-adapter` — `CheckoutTier` neutral, validación de providers mezclados, `getHotmartOfferCodes`/`getCohortProvider`, sesión Whop falla cerrada para tiers no-whop. 49/49 tests; auditoría adversarial GO (paridad Whop/C2 exacta).

**US-1.1** — Como Dev, quiero que el adapter web soporte tiers con `checkoutRef.provider === 'hotmart'`, para que el catálogo pueda declarar offers sin romper el checkout.
- **CE:** un tipo de tier neutral reemplaza el filtro `toWhopTier` que hoy **descarta** tiers hotmart (`apps/web/src/lib/whop/products.ts`); un cohort de fixture con tiers hotmart resuelve tier/precio/contentId igual que uno whop; `validate.ts` del catálogo **rechaza** providers mezclados dentro de un mismo cohort (un cohort vende por UN provider — simplifica embed y webhook); helper `getHotmartOfferCodes()` análogo a `getWhopPlanIds()`.
- **V:** tests nuevos en `packages/catalog` (fixture hotmart + mixto rechazado); typecheck+build web/api; el funnel Whop actual sin cambio de comportamiento (paridad).

**Validación de FASE 1:** build+typecheck limpios; tests del catálogo verdes; checkout Whop de German idéntico.
**Éxito de FASE 1:** declarar un cohort/tier Hotmart en el catálogo es posible y seguro; Whop sigue siendo el provider activo.

---

## FASE 2 — Embed Hotmart en web (German Roz) — ✅ IMPLEMENTADA (2026-06-10, PR #83)
Provider-routed embed inerte hasta el flip de catálogo. `sck`=purchaseEventId estable por visitante+cohort, cupón oculto, retry sin recarga, textos provider-aware, C1/C4 aplicados. Verificado post-deploy: funnel Whop intacto ($67, textos nuevos).

### Stories (referencia)
**Objetivo:** renderizar el checkout Hotmart inline en la ruta de German (staging/preview), con atribución, tiers y dedup resuelto.

**US-2.1** — Como Comprador, quiero ver el checkout Hotmart dentro de la página de German, para pagar sin salir del dominio.
- **CE:** la ruta monta un `HotmartCheckoutEmbed` (paralelo a `GenericWhopCheckoutEmbed`; el shell visual card/badges se reutiliza — es ~70% genérico) con el offer del tier activo resuelto del catálogo; script de Hotmart vía `next/script` + preconnect a `checkout.hotmart.com`; sin sesión server (Hotmart hace init directo en cliente — el patrón `checkout-embed-loader` de Whop no aplica).
- **V:** QA en desktop+iOS; el embed corresponde al offer correcto por fecha.

**US-2.2** — Como Negocio, quiero que el precio mostrado coincida con el offer que cobra Hotmart, para no tener "precio trampa".
- **CE:** el tier del cohort activo selecciona el `offerCode` correcto y el número en pantalla = lo que cobra Hotmart, **en la moneda decidida** (decisión pendiente #2, con datos de US-0.7); la moneda visible es inequívoca.
- **V:** prueba con relojes simulados en los rangos de fecha del cohort; el offer montado coincide con el precio visible.

**US-2.3** — Como Marketing, quiero que `sck/src/xcod` + prefill se lean del query string y entren al embed, para conservar atribución de paid media **y transportar el event_id de dedup**.
- **CE:** los UTM/attribution de la URL llegan a `init()` (añadir `src/sck/xcod` a `ATTRIBUTION_PARAM_KEYS` — hoy no existen en el repo); **`sck` porta el `purchaseEventId`** según el esquema validado en US-0.4; el mismo id se persiste en el ctx local (patrón `persistCheckoutSession` existente).
- **V:** inspección del config de `init()`; round-trip confirmado vía webhook (Fase 3).

**US-2.4** — Como Sistema, quiero disparar `InitiateCheckout` (pixel + CAPI) al montar, para alimentar optimización de Meta.
- **CE:** **reusar el patrón existente** (`trackWhopInitiateCheckout` es 100% agnóstico del provider): una sola vez, con `value/currency/content_ids` del tier del catálogo, dedup por `eventId`.
- **V:** Meta Events Manager (Test Events) muestra IC con value correcto y sin duplicados.

**US-2.5** — Como Dev, quiero un guard contra doble-montaje (StrictMode/SPA), para evitar embeds duplicados.
- **CE:** navegación repetida y dev StrictMode no duplican el iframe; un solo `#inline_checkout`.
- **V:** QA navegando in/out de la ruta.

**US-2.6** — Como Negocio, quiero portar las fixes de coherencia C1/C4 (PR #74) al nuevo checkout, para no reintroducir incoherencias de moneda/navegación.
- **CE:** la tarjeta muestra la moneda inequívoca y "acceso al reto de 21 días" (no "de por vida"); "Volver" → VSL.
- **V:** revisión visual del checkout Hotmart contra el checklist del PR #74.

**US-2.7 (nueva)** — Como Sistema, quiero que `/gracias` dispare el pixel Purchase con el **mismo** `event_id` que usará el webhook, para dedup en Meta.
- **CE:** eventId desde el ctx local o derivado del param del redirect (según lo documentado en US-0.6); adaptar `purchase-tracker` a los params reales de Hotmart (hoy exige `status=success` de Whop); si no hay ctx ni param (otro dispositivo / PIX diferido) → **no se dispara pixel** (CAPI-only documentado), **nunca un id aleatorio**.
- **V:** Meta Test Events muestra Purchase browser+server deduplicados; el caso sin-ctx no emite pixel.

**Validación de FASE 2:** QA funcional desktop + iOS; los tiers montan el offer correcto; IC visible en Meta; C1/C4 portadas; dedup de gracias diseñado y probado.
**Éxito de FASE 2:** un comprador puede pagar vía el embed Hotmart **en una ruta/preview de staging**, con el cohort de catálogo aún en Whop en producción. (Sin flag runtime — el switch real es la Fase 4.)

---

## FASE 3 — Webhook + confirmación server-side (api) — ✅ IMPLEMENTADA (2026-06-10, PR #83)
`PURCHASE_APPROVED/COMPLETE` → catálogo por offer.code → `persistPurchase` → CAPI con `event_id`=`origin.sck` (CAPI-only, user_data con país/teléfono reales del comprador); refunds → UPDATE de status. Guard: sin credenciales Meta NO se estampa `capi_sent_at`. Smoke verificado post-deploy: refund de tx inexistente → 200 sin side-effects (0 filas en purchases).

### Stories (referencia)
**Objetivo:** confirmar la venta y disparar acceso + CAPI Purchase desde el webhook, reusando la infraestructura de purchases.

**US-3.1** — Como Sistema, quiero `POST /api/webhooks/hotmart` validando `X-HOTMART-HOTTOK`, para rechazar payloads no auténticos.
- **CE:** token inválido → 401; válido → 200; secreto en env (`HOTMART_HOTTOK_GERMAN_ROZ`); comparación timing-safe; body JSON estándar (no raw — a diferencia del HMAC de Whop); HOTTOK es por cuenta Hotmart → un endpoint único, el producto se resuelve por `offer.code`.
- **V:** prueba con token correcto/incorrecto; logs muestran el rechazo.

**US-3.2** — Como Sistema, quiero que el webhook Hotmart use la idempotencia durable **existente**, para no duplicar fila ni CAPI.
- **CE:** `persistPurchase` con `provider:'hotmart'`, `externalId = data.purchase.transaction`, snapshots (`amount`/`currency` de `full_price`, `plan_or_offer_id = offer.code`, `content_id` del cohort) y la semántica `capi_sent_at` (misma garantía que Whop); eventos de estado posteriores (`REFUNDED/CHARGEBACK/CANCELED`) hacen **UPDATE** de `status`/`refunded_at` sobre la fila existente, nunca INSERT (handler nuevo — hoy no existe ni para Whop).
- **V:** doble POST + reinicio simulado → 1 fila, 1 CAPI; evento REFUNDED de prueba actualiza la fila sin duplicarla.

**US-3.3** — Como Sistema, quiero mapear `offer.code → producto/cohort` y disparar **Meta CAPI Purchase** en `APPROVED/COMPLETE`, para registrar la conversión con atribución y el `contentId` del cohort.
- **CE:** resolución vía `getCohortByCheckoutId` del catálogo (ya soporta offerCode) con prioridad `offer.code → paidAt` (no hay metadata en Hotmart); `event_id` = el `purchaseEventId` recibido en `origin.sck` (US-2.3) o, si falta, determinístico `german-desinflamate-purchase.{transaction}`; CAPI con `value/currency` de `full_price` según la política de moneda (+ `amount_usd` en metadata si se eligió local); dedup contra el **pixel Purchase del gracias** (mismo `event_id` — no contra el IC); `src/xcod` quedan en `purchases.metadata` para reporting (no van a Meta).
- **V:** Meta Events Manager muestra Purchase server-side deduplicado con el pixel; valores correctos; fila en `purchases` consultable por `cohort_code`.

**US-3.4** — Como Negocio, quiero que los refunds/chargebacks queden registrados y notificados, para que el equipo y el sistema de entrega independiente actúen. *(La entrega de acceso NO es de este repo — decisión #3.)*
- **CE:** `REFUNDED/CHARGEBACK/CANCELED` → update de `purchases.status`/`refunded_at` + `notify` al equipo con `transaction`, `cohort_code` y email del comprador; el webhook NO entrega ni revoca acceso (eso lo hace el sistema independiente).
- **V:** refund de prueba → fila actualizada + notificación recibida.

**US-3.5** — Como Sistema, quiero responder 200 rápido, para no gatillar reintentos de Hotmart.
- **CE:** respuesta <2s **sin colas** (v0): persistencia con timeouts cortos (patrón `purchase-persistence`: connect 4s / query 5s); CAPI awaited — su retry son los reintentos de Hotmart con el mismo `event_id` (patrón `capi_sent_at`); entrega/notificaciones fire-and-forget logueadas.
- **V:** medición de latencia del endpoint; sin reintentos en el panel.

**Validación de FASE 3:** compra de prueba end-to-end (embed → webhook → CAPI Purchase + fila en `purchases`), idempotente y autenticada; refund actualiza estado y notifica.
**Éxito de FASE 3:** una compra real en German genera webhook verificado, Purchase CAPI deduplicado con atribución correcta y fila en `purchases` — con dedup persistente a reinicios. (La entrega corre por el sistema independiente.)

---

## FASE 4 — Switch a Hotmart y go-live
**Objetivo:** activar Hotmart en German de forma controlada y validar el funnel real.
**Rollback:** `git revert` del PR de catálogo + deploy (sin flag runtime). Si la página se cae, US-4.3 avisa.

**US-4.1** — Como Negocio, quiero activar Hotmart en German mediante **un PR de catálogo**, para que el switch sea auditable y reversible.
- **CE:** según la decisión pendiente #1: (recomendado) **lanzar C3 ya con tiers Hotmart** (cambio 100% aditivo, C2 intocado) o cambiar los `checkoutRef` del cohort vigente; el PR no toca Lucas ni `core/`; la rama Whop del webhook sigue viva (pagos en vuelo + refunds Whop rezagados se procesan); revert ensayado en staging antes del switch.
- **V:** toggle en staging; ambas rutas correctas; `git diff` sin archivos de Lucas; revert aplicado y verificado en staging.

**US-4.2** — Como Negocio, quiero validar con una compra real de bajo monto en producción, para confirmar el funnel completo antes de escalar tráfico.
- **CE:** 1 compra real → embed + webhook + CAPI Purchase + fila en `purchases` correctos; **el sistema de entrega independiente recibe la compra y entrega el acceso** (verificación operativa pre-switch: ese sistema está conectado a Hotmart igual que lo estaba a Whop); refund posterior actualiza `status` limpio.
- **V:** checklist end-to-end firmado en producción, incluida la entrega confirmada por el sistema independiente.

**US-4.3** — Como Negocio, quiero una alerta de uptime del checkout, para enterarme rápido si la página/embed se cae. *(Crítica: Hotmart declara que si nuestra página cae, el checkout cae — somos dueños del uptime del funnel.)*
- **CE:** alerta si la ruta responde `!=200` o el embed no monta (monitoreo + aviso).
- **V:** simulacro tumbando la ruta en staging dispara la alerta.

**Validación de FASE 4:** 1 compra real verificada end-to-end + alerta de uptime activa + revert ensayado.
**Éxito de FASE 4 (Definition of Done global):** German vende por Hotmart en producción con atribución y entrega correctas, tracking (IC + Purchase CAPI) deduplicado en Meta, compras persistidas por cohort, y Lucas intacto.

---

## Definition of Done transversal (todas las fases)
- `git diff` sin archivos de Lucas (`lib/lucas/*`, `(landings)/lucas-con-lucas/*`, rama Lucas del webhook) en todos los PRs.
- Tests del catálogo verdes + typecheck/build de web y API en cada PR (CI ya existente).
- Logs estructurados en el webhook: `transaction`, `offerCode`, `cohortCode`, `resolutionSource`, `event_id`, `status`.
- Migraciones aditivas/idempotentes; `gen-types` tras cambios de esquema.

## Dependencias / relación con otras funcionalidades
- **`modularizacion-cohorts`**: implementado en working tree (ver su `IMPLEMENTATION-PLAN.md`). **Precondición de la Fase 1**: mergeado + desplegado + migración aplicada. Este plan consume: `Tier.checkoutRef`, `getCohortByCheckoutId`, `persistPurchase`/`capi_sent_at`, espejo `marketing.cohorts`, rotación WhatsApp.
- **PR #74**: C0 mergeado como #77; C1/C4 se portan en US-2.6; C3 (fechas VSL) independiente; C2 (VSL dinámico) propuesto absorber en cohorts.

## Resuelto
- **Abstracción provider (ex Fase 1 original):** ya existe vía `packages/catalog` (`Tier.checkoutRef`) — las antiguas US-1.1/1.2 quedaron obsoletas; US-1.3 (Lucas) pasó a DoD transversal.
- **Idempotencia (ex US-3.2):** resuelta por `marketing.purchases` + `persistPurchase` — la US quedó reescrita como consumo de esa pieza + handler de refunds.
- **Ventana de venta:** fuera de alcance (decisión de cohorts 2026-06-09: el funnel vende siempre; sin `getWindowState`).
- **Flag runtime Whop/Hotmart:** descartado — el switch es un PR de catálogo y el rollback es `git revert` (resuelve la contradicción "flag con Whop default" vs "sin rollback" del plan original).
