# Modularización de cohorts — User Stories

**Estado:** 📝 Plan (rev. 2026-06-09 — reestructurado por épicas de valor; decisiones de Negocio incorporadas)
**Objetivo de negocio:** modelar el **cohort (periodo de venta) como entidad de primera clase**, para lanzar C3, C4… sin sobrescribir ni perder la configuración del cohort anterior, sin incoherencias de precio/fecha/contentId, y pudiendo **consultar las ventas de cada edición**.

**Premisa de dominio (confirmada por Nico):** un **producto ES una Business Unit** (la organización puede tener múltiples productos = múltiples BUs), y un **cohort es el periodo de venta de ese producto/BU** (fechas + escalera de tiers + contentId). Jerarquía:
`Organization → Business Unit (= Producto) → Cohort (periodo de venta) → Tier`.
No hay entidad "producto" separada debajo de la BU: la BU **es** el producto (ej.: German Roz tiene `main` = Desinflámate y `plan-90-pro` como BUs/productos distintos, cada uno con sus cohorts).

## Principio rector (prueba de aceptación de toda la iniciativa)

> **Lanzar C3 es un cambio 100% aditivo: el PR que agrega C3 no toca ni una línea de C2, y C2 sigue siendo consultable (ventas, precios, fechas) para siempre.**

Si una user story no contribuye a esa frase, es un enabler técnico y vive en la Definition of Done transversal, no como story.

**Alcance:**
- ENTRA: extraer fechas + escalera de precios + `contentId` hacia un `Cohort`; resolver el cohort/tier vigente por fecha; expresar C2 como cohort sin cambiar comportamiento; **unificar la fuente de verdad entre web y API**; tabla **`marketing.cohorts` como espejo consultable** + `marketing.purchases` con FK real.
- NO ENTRA (decisiones de Negocio, 2026-06-09):
  - **Enforcement de ventana / redirects**: el funnel **vende siempre** (comportamiento actual post-#76). Las fechas del cohort sirven para resolver qué edición/precio aplica y para atribución — **no** para bloquear la venta ni redirigir. Si algún día se quiere cerrar carrito/redirigir, será una funcionalidad nueva, no parte de este refactor.
  - **Lucas con Lucas**: queda **aislado e intocado** (su config, tracking y rama de webhook dedicada siguen igual; ni adapter por ahora).
  - Cambiar de proveedor de checkout (eso es `hotmart-embedded-checkout`); este refactor es **agnóstico al proveedor**.
  - Editar precios/fechas desde el admin (ver condiciones en Decisión de arquitectura).

---

## Análisis de impacto (deep analysis multi-agente)

> Estado del repo mapeado por agentes especializados. Subagentes:
> [web](65663b9e-61e1-49d4-9913-7c7d0d0e7b4a) · [API](d85454a1-4611-4394-8425-31d9002d6300) · [base de datos](60c19f1d-aac0-4ba1-9ce7-e91ce10e4647) · [org/BU](e3aa9714-1bbb-49cf-b4f5-4a6fb0643fe3) · [revisión de user stories](fa3698ba-9faa-4777-bcaa-16dfb3522c68) · [decisión tabla cohorts](4a444f7c-5815-47ea-b611-04703991962b) · [segunda opinión tabla](81377527-d4ad-40a7-a3f0-183bb890d2d4).
> **Re-verificado 2026-06-09** con 5 agentes nuevos (web/checkout · API/webhook · DB · admin/transversal · revisor del plan).

### Estado actual — el producto ES el cohort, y está duplicado
- No existe `Cohort` ni `Product` como entidad. La config (tiers + fechas + `contentId` + `plan_id`s) vive **inline** en `apps/web/src/lib/whop/products.ts` (líneas 81-113). El objeto mezcla producto estable + edición C2.
- Hay un **registro paralelo y divergente** en `apps/api/src/core/services/whop-products.ts` (solo `planPrices` + `contentId` para el CAPI). Solo 2 consumidores en API (`whop-webhook.service.ts`, `whop-purchase.service.ts`); 6 consumidores en web.
- **Lucas** usa un tercer stack (`lucas-config.ts` ↔ `orgs/lucas-con-lucas/main/tracking.ts`) con precio plano y webhook **dedicado** (rama propia en `whop-webhook.service.ts` por `WHOP_LUCAS_RETO_PLAN_IDS`). No está en el registry de German — aislado por diseño. **Decisión: se queda así.**

### Bug en vivo — ✅ RESUELTO (2026-06-09, hotfix #77)
- `contentId` divergía: web `di21-desinflamate` vs API `di21-c2` → dedup de Meta roto. **Resuelto**: el fix de 1 línea se extrajo del PR #74 (que quedó CONFLICTING tras #76) y se mergeó como **PR #77**. Ambos lados emiten `di21-c2`. Pendiente de A1: confirmar dedup en Meta Events Manager post-deploy. El resto del bundle #74 (etiqueta USD, VSL dinámico, fechas, nav) sigue abierto pendiente de rebase — su parte C2 (VSL dinámico) se solapa con la Épica B.

### La ventana de venta es código muerto — y se queda fuera de alcance
- `getWhopWindowState`/`getWhopWindowRedirect` existen (`products.ts:145-173`) pero **ninguna página las usa**: el commit `7477906` (#76, 2026-06-08) **eliminó deliberadamente** los redirects de VSL y checkout — venden siempre.
- `resolveWhopTier` hoy hace fallback al último tier (`products.ts:138-140`). **Decisión de Negocio:** ese comportamiento se conserva — fuera de las fechas de un cohort se sigue vendiendo el último cohort/tier disponible, pero resuelto de forma **explícita y logueada** (no silenciosa), para que la atribución siga siendo correcta.

### La VSL está desacoplada del registro
- `vsl-desinflamate/*` no lee `products.ts`: precio ($67) y countdown (30-jun) están **hardcodeados** en el bundle HTML (582 KB); comentario explícito en `page.tsx:14-19`.

### Las compras NO se persisten
- El webhook solo dispara Meta CAPI: **no crea lead, no escribe en DB, no emite al eventBus, no enrolla secuencias**. No hay tabla de compras. La idempotencia es un `Set` en memoria (`whop-webhook.service.ts:58`, máx 10k, se pierde al reiniciar).

### Caches keyed por producto, no por cohort
- `whop_session:{productKey}` (sessionStorage, TTL 10 min — `checkout-session.ts:25`), `whop_checkout_ctx:{productKey}` (localStorage — `tracking.ts:13`), `whop_purchase_fired:{productKey}:{eventId}` → al pasar de C2 a C3 sin invalidar, un usuario podría comprar con `plan_id`/precio de la edición anterior. Y al **re-keyear en el deploy**, una sesión en vuelo pierde su `purchaseEventId` → pixel y CAPI dejan de dedupear esa compra (ver B4).

### No hay infraestructura de tests ni CI
- Ningún `package.json` del monorepo tiene script `test`; no hay vitest/jest; `.github/workflows/` no tiene CI de build/typecheck/test. Todo CE que diga "test" requiere el harness de la DoD transversal.

### Problema de identidad triple (clave para la FK de purchases)
- La misma BU tiene **tres identidades incompatibles**: `marketing.business_units` (UUID, **sin slug** — confirmado en `packages/db/src/types.ts:69-103`), `meta_ops.business_units` (slug `di21`), `launch_ops`/código (`bu_slug`/`buKey` = `main`). El admin ya parchea esto a mano (`POOL_BU_ALIAS: 'german-roz/di21' → 'main'` en `apps/admin/src/lib/whatsapp-groups/repository.ts:27-33`).

### `launch_ops.launch` ya es el cohort operacional
- Existe `code = 'DI21-C2'` (`starts_on`, `ends_on`, `config jsonb` con `price_ladder` como strings). El admin **ya lo consume** (`listCohorts`, dashboard de solo lectura). NO se usa para cobrar; es ops/tracking.
- La migración `20260608000100_launch_ops_schema.sql` **SÍ está versionada en el repo** (el drift de esquema reportado en una versión anterior de este doc no existe).

### Impacto en admin: BAJO (verificado)
- `listCohorts`, `launch.config` y `meta_ops.price_tiers` son lecturas agnósticas al formato del code. Puntos de contacto: `POOL_BU_ALIAS` (medio — solo si cambia la identidad de BU), smoke test con `DI21-C2` hardcodeado (`apps/admin/scripts/smoke-whatsapp-groups.mjs:61`), y añadir `@marketing-funnel/catalog` a `transpilePackages` cuando admin lo consuma.
- Viabilidad de `packages/catalog`: **alta**. Web hoy no consume ningún paquete del workspace (sería su primera dependencia interna — verificar `transpilePackages`/build en `apps/web/next.config`); el patrón de paquete ya existe (`config`, `db`, `meta-ads`).

---

## Decisión de arquitectura

### Tres capas, un dueño por dato

1. **Definición** → `packages/catalog`: datos declarativos (un archivo por BU con su array de cohorts) + resolvers puros (`resolveActiveCohort(product, now)` con reloj inyectable). Cero I/O, cero imports server-only → corre en web, API y tests.
2. **Espejo + runtime** → DB: `marketing.cohorts` (sincronizada del catálogo, read-only) y `marketing.purchases` (la memoria de ventas, con snapshots).
3. **Adapters de proveedor** → el core del cohort no sabe qué es Whop ni Hotmart; cada tier lleva una `checkoutRef` (`planId` Whop hoy, `offerCode` Hotmart mañana) y el adapter del proveedor la traduce.

### ¿Tabla `marketing.cohorts` asociada a la BU?

**VEREDICTO (decisión de Negocio, 2026-06-09): SÍ — como ESPEJO SINCRONIZADO, no como fuente de verdad.**
Un producto/BU tiene N cohorts y esa jerarquía debe ser consultable en DB (reporting, FK de compras, visibilidad en admin). La **definición** sigue siendo code-first para no crear una 4ª fuente de drift de la escalera $67/$77/$87:

| Concern | Dónde vive | Por qué |
|---|---|---|
| **DEFINICIÓN del cohort** (fechas, tiers, `checkoutRef`, contentId) | **Código** (`packages/catalog`) — única fuente editable | Es *definición*, no estado → mismo criterio que `code_first_automations`. Web y API deben leer lo mismo y `apps/web` no puede importar de `apps/api` → paquete compartido. Editar precio/fecha = PR + deploy (Negocio lo acepta explícitamente). |
| **ESPEJO consultable** (jerarquía BU → N cohorts) | **DB** → `marketing.cohorts`, **sembrada/sincronizada automáticamente desde el catálogo** en boot/deploy (mismo patrón que `seedWhatsAppGroupPools`) | Da queries, reporting por edición, FK real para `purchases` y listado en admin — **sin** riesgo de drift: el sync es unidireccional código→DB y **el checkout jamás la lee**. |
| **RUNTIME del cohort** (compras, idempotencia, ventas por edición) | **DB** → `marketing.purchases` (FK `cohort_id` + `cohort_code` denormalizado + snapshots) | Hoy no se persiste nada; es el gap real. |

**Promover `marketing.cohorts` a fuente de verdad editable (DB-first) solo se justifica SI Y SOLO SI** (las tres condiciones a la vez):
1. negocio necesita **editar precio/fecha/contentId desde el admin sin deploy**,
2. existe **UI de admin con RBAC** para esa edición, y
3. se **elimina el registro de código simultáneamente** (la DB pasa a ser SSOT y el código solo lee).
Mientras tanto la tabla es **read-only para humanos y para el checkout**; cualquier edición manual será sobrescrita por el siguiente sync.

### Reglas anti–doble fuente de verdad (un dueño por concern)
- **Checkout** (precio/plan/contentId) → `packages/catalog` (código). Único que cobra.
- **Espejo** → `marketing.cohorts`: sync unidireccional código→DB; nunca al revés; el checkout **jamás** la consulta.
- **Ops/estrategia** (tesis, fases, escalera como narrativa) → `launch_ops.config` (**display-only**, jamás leído por el checkout).
- **Valuación de revenue del dashboard** → `meta_ops.price_tiers` (reporting-only; a futuro podría derivarse del catálogo).
- **Transacciones** → `marketing.purchases` con **snapshots** (`amount`, `plan_id`, `content_id` congelados al momento de compra → inmunes a cambios futuros).
- **Una sola key de cohort:** `code` (`DI21-C2`). El catálogo (`Cohort.launchCode`), el espejo (`marketing.cohorts.code`), los pools WhatsApp (`launch_code`) y `purchases.cohort_code` apuntan todos a `launch_ops.launch.code`.

### Fuente de verdad: paquete compartido `@marketing-funnel/catalog`
`packages/catalog` (precedente: `@marketing-funnel/config`, `@marketing-funnel/email`):
- `types.ts`: `BusinessUnitProduct` (`orgKey`, `buKey`, `cohorts: Cohort[]`), `Cohort` (`code`, `contentId`, `startsAt`, `endsAt`, `timezone`, `tiers[]`), `Tier` (`price`, `currency`, `until?`, `checkoutRef`).
- `resolvers.ts`: `resolveActiveCohort`, `resolveTier` (sin imports server-only; corre client+server; `now` inyectable para tests). **Sin redirects ni enforcement**: fuera de fechas se resuelve el último cohort disponible de forma explícita (`resolutionSource: 'fallback_latest'`) — paridad con el comportamiento actual.
- `products/<org>-<bu>.ts`: un archivo por BU. Web (`WHOP_PRODUCTS`) y API (`whop-products.ts`) se vuelven thin wrappers. Secrets y URLs por entorno siguen en env. **Lucas NO entra al catálogo.**

### DDL de runtime (espejo + compras)
```sql
-- Espejo del catálogo: sembrado/sincronizado en boot. READ-ONLY para humanos y checkout.
CREATE TABLE IF NOT EXISTS marketing.cohorts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_key          text NOT NULL,                            -- 'german-roz'
  bu_key           text NOT NULL,                            -- 'main' (key de código)
  business_unit_id uuid REFERENCES marketing.business_units(id),  -- nullable hasta resolver mapping de identidad
  code             text NOT NULL UNIQUE,                     -- 'DI21-C2' (= launch_ops.launch.code)
  content_id       text NOT NULL,
  starts_at        timestamptz,
  ends_at          timestamptz,
  timezone         text NOT NULL,
  tiers            jsonb NOT NULL DEFAULT '[]',              -- espejo informativo de la escalera
  is_active        boolean NOT NULL DEFAULT true,            -- false si desaparece del catálogo (nunca DELETE)
  synced_at        timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_key, bu_key, code)
);
CREATE INDEX IF NOT EXISTS idx_cohorts_bu ON marketing.cohorts (org_key, bu_key, starts_at);
ALTER TABLE marketing.cohorts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS marketing.purchases (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES marketing.organizations(id),
  business_unit_id uuid REFERENCES marketing.business_units(id),
  cohort_id        uuid REFERENCES marketing.cohorts(id),    -- FK real al espejo
  lead_id          uuid REFERENCES marketing.leads(id),      -- match por (organization_id, lower(email))
  product_key      text NOT NULL,                            -- 'german-desinflamate'
  cohort_code      text NOT NULL,                            -- 'DI21-C2' (snapshot denormalizado)
  provider         text NOT NULL,                            -- 'whop' | 'hotmart'
  external_id      text NOT NULL,                            -- payment_id / transaction_id
  plan_or_offer_id text,                                     -- snapshot del tier
  amount           numeric(10,2) NOT NULL,                   -- snapshot del precio cobrado
  currency         text NOT NULL DEFAULT 'USD',
  content_id       text,                                     -- snapshot del contentId a Meta
  status           text NOT NULL DEFAULT 'approved',         -- approved | refunded | chargeback | canceled
  refunded_at      timestamptz,
  purchased_at     timestamptz NOT NULL DEFAULT now(),
  metadata         jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, external_id)                             -- idempotencia durable del INSERT (reemplaza el Set en memoria)
);
CREATE INDEX IF NOT EXISTS idx_purchases_cohort ON marketing.purchases (cohort_code, purchased_at);
CREATE INDEX IF NOT EXISTS idx_purchases_bu     ON marketing.purchases (business_unit_id, purchased_at);
ALTER TABLE marketing.purchases ENABLE ROW LEVEL SECURITY;
```
- `purchases` **no replica los tiers**; guarda snapshots. Refunds/chargebacks (plan Hotmart US-3.x) **no insertan fila nueva**: actualizan `status` + `refunded_at` de la fila existente (update idempotente) — el `UNIQUE(provider, external_id)` sigue siendo la clave de idempotencia del INSERT.
- `business_unit_id` y `cohort_id` nacen **nullable**: se rellenan cuando exista el mapping canónico `orgKey/buKey ↔ marketing UUID` (ver Decisiones pendientes) y el espejo (C2). `cohort_code` siempre se escribe.

---

## Convención
`Como <rol>, quiero <acción>, para <valor>` · **CE** = Criterio de Éxito · **V** = Validación.
**Roles:** Negocio (Nico) · Dev (Cristóbal) · Sistema/Tracking · Comprador · QA.
Las stories son **rebanadas verticales** demostrables; los enablers de ingeniería viven en la **DoD transversal** al final.

---

## ÉPICA A — Una sola verdad de precio/contentId
**Valor:** arreglar el dedup de Meta (bug en producción) y hacer estructuralmente imposible que web y API vuelvan a divergir.

**A1** — Como Tracking, quiero que pixel (web) y CAPI (API) emitan el **mismo** `content_ids` para la misma compra, para que Meta dedupe y la optimización no se degrade. **(✅ Hotfix mergeado: PR #77, 2026-06-09)**
- **CE:** ambos lados emiten `di21-c2`. ✅
- **V:** `grep` sin `di21-desinflamate` residual ✅; **pendiente**: confirmación en Meta Events Manager post-deploy; el test de payload web vs API queda como parte de A2 (cuando exista el harness).

**A2** — Como Dev, quiero que web y API lean precio/plan/contentId del **mismo módulo** (`@marketing-funnel/catalog`), para que no puedan divergir de nuevo.
- **CE:** existe `packages/catalog` con el modelo (`BusinessUnitProduct`, `Cohort`, `Tier`) y validación de integridad (rechaza cohorts solapados en la misma BU, tiers desordenados, `timezone` inválida, `contentId` vacío, `checkoutRef` duplicadas); `apps/web/src/lib/whop/products.ts` y `apps/api/src/core/services/whop-products.ts` quedan como **thin wrappers sin datos propios**; un grep/lint en CI falla si alguien re-añade tiers/contentIds ahí.
- **V:** fixtures de `german-roz/main` y `german-roz/plan-90-pro` compilan; fixtures inválidos fallan con mensaje claro; `typecheck`+`build` de web y API ok (web consume su primer paquete del workspace — verificar `transpilePackages`/build).

**Éxito de ÉPICA A:** un solo lugar define la escalera $67/$77/$87 y el `contentId`; el dedup de Meta funciona; borrar el dato de un lado rompe el build, no la venta.

---

## ÉPICA B — Cohort como entidad: lanzar C3 sin tocar C2
**Valor:** el principio rector. C2 queda expresado como cohort histórico-consultable y agregar C3 es aditivo.

**B1** — Como Negocio, quiero que C2 quede representado con sus valores exactos actuales, para migrar sin alterar la venta.
- **CE:** `german-roz/main` se define en el catálogo con planes $67/$77/$87, sus fechas actuales, `launchCode: 'DI21-C2'` y `contentId: 'di21-c2'`.
- **V:** snapshot del catálogo comparado contra los fixtures actuales web/API; el **único** cambio documentado es `contentId` web → `di21-c2` (A1).

**B2** — Como Sistema, quiero `resolveActiveCohort(product, now)` y `resolveTier` con resolución explícita por fecha, para que precio, tracking y atribución salgan siempre de la misma edición — **sin bloquear nunca la venta**.
- **CE:** la resolución devuelve el cohort vigente por fecha; **fuera de fechas se mantiene el comportamiento actual** (se sigue vendiendo el último cohort/tier disponible), pero de forma explícita y logueada (`resolutionSource: 'active' | 'fallback_latest'`) — nunca un fallback silencioso sin rastro; **no hay redirects ni estados no-comprables** (decisión de Negocio); inclusividad de `until` definida y documentada; bordes como ISO con offset explícito o fecha local + timezone IANA (nota: `America/Lima` no observa DST desde 1994 — el test de DST usa una tz que sí lo tenga, ej. `Europe/Madrid`, para futuros creators).
- **V:** tests con reloj simulado: dentro de C2 (tier 1/2/3), bordes exactos de corte (`2026-06-16T23:59:59-05:00` / `2026-06-17T00:00:00-05:00`), después del cierre (sigue vendiendo el último tier, logueado como fallback), gap entre C2 y C3, y un borde en tz con DST. El resultado vendible es idéntico al comportamiento actual en todos los casos.

**B3** — Como Negocio, quiero lanzar C3 agregando una entrada nueva al catálogo, para no arriesgar lo que ya vende. **(Story estrella)**
- **CE:** agregar un cohort es aditivo: nueva entrada en `cohorts[]` de la BU + fila en `launch_ops.launch` (runbook abajo); la validación de A2 impide solapamientos accidentales con C2.
- **V:** un PR de prueba que agrega un C3 ficticio **no toca ninguna línea de C2** (diff revisado); con reloj simulado en fechas de C3, checkout/tracking resuelven C3 y C2 sigue consultable.

**B4** — Como Comprador, quiero que ni el cambio de cohort ni el propio deploy me dejen comprar o trackear con datos viejos, para no pagar un precio/plan de otra edición ni perder el dedup de mi compra.
- **CE:** (a) caches (`localStorage`/`sessionStorage`) se keyean por `orgKey/buKey/cohortCode/tierId` o se invalidan al cambiar de cohort/tier; regla explícita para "sesión creada en C2, pago en C3" (conserva el cohort de la sesión o fuerza recreación, sin ambigüedad). (b) **Compatibilidad con sesiones en vuelo durante el deploy del re-keying**: el código nuevo lee la key vieja (`whop_session:{productKey}`, `whop_checkout_ctx:{productKey}`) como fallback durante una ventana definida, o el riesgo (pérdida de `purchaseEventId` → pixel y CAPI sin dedup para esa compra) se acepta por escrito.
- **V:** reloj simulado: sesión C2 cacheada al cruzar a C3 no reutiliza `plan_id`/`purchaseEventId`/`value`/`contentId` de C2; sesión creada con key vieja sigue dedupeando tras el deploy; Purchase queda atribuido según la regla.

**B5** — Como Sistema, quiero que checkout, sesión server y webhook resuelvan todo desde el cohort, para una sola fuente runtime y trazabilidad end-to-end.
- **CE:** `resolveWhopTier` (UI) y `createWhopCheckoutSessionServer` (plan_id) derivan del cohort resuelto; la sesión Whop incluye `metadata.cohort_id`; **el cliente usa el tier/value resuelto por el server (vía la sesión), nunca recalcula con su propio reloj** (en el minuto de un corte de tier, server y cliente podrían discrepar); el webhook resuelve el cohort por prioridad `metadata.cohort_id → plan_id/offerCode → paidAt` y usa el `contentId` del cohort resuelto; `InitiateCheckout` siempre lleva `value`, `currency`, `content_ids` y `eventId` (del tier resuelto por el server).
- **V:** snapshot del payload de sesión + UI price antes/después; test del borde de corte (UI, sesión e IC reportan el mismo tier); compra de prueba con y sin `cohort_id` en metadata → CAPI con el `contentId`/value del cohort correcto.

**B6** — Como Dev, quiero que `german-roz/plan-90-pro` y Lucas con Lucas queden intactos, para no arriesgar funnels en producción.
- **CE:** la resolución por `orgKey/buKey` devuelve configs separadas; `plan-90-pro` no hereda cohorts ni `di21-c2`; **Lucas no se toca**: su config, tracking, sesión y rama de webhook dedicada siguen resolviendo igual y NO entra al catálogo (decisión de Negocio).
- **V:** test/grep confirma aislamiento entre `main` y `plan-90-pro`; smoke/diff del payload Purchase e IC de Lucas; `git diff` sin cambios en archivos de Lucas.

**Éxito de ÉPICA B:** German · Desinflámate corre 100% sobre el catálogo con C2 reproducido (único cambio: `contentId` → `di21-c2`, de A1), y un PR de C3 ficticio demuestra que lanzar una edición nueva es aditivo.

---

## ÉPICA C — Memoria de ventas: compras y cohorts consultables
**Valor:** poder responder "¿cuánto vendió cada edición?" y no perder/duplicar compras nunca más.

**C1** — Como Negocio, quiero cada compra registrada con su cohort y con idempotencia durable, para saber cuánto vendió cada edición y no doble-contar compras ni CAPI.
- **CE:** `marketing.purchases` (DDL arriba); el webhook escribe la compra resuelta con snapshots (`amount`, `plan_or_offer_id`, `content_id`, `cohort_code`); la idempotencia usa el `UNIQUE(provider, external_id)` de DB (no el `Set` en memoria); reintento concurrente no duplica fila ni CAPI; refunds/chargebacks actualizan `status`+`refunded_at` sin fila nueva (alineado con plan Hotmart US-3.2/3.4).
- **V:** compra de prueba inserta una fila consultable por `cohort_code`; dos POST paralelos + reinicio simulado → una sola fila y un solo evento CAPI; refund de prueba actualiza la fila sin duplicarla; `gen-types` regenerado.
- **Nota de orden:** esta story conviene **adelantarla junto con la Épica B** — el refactor implica varios restarts del API, que es exactamente cuando el `Set` en memoria se vacía y los retries de Whop duplican CAPI. `cohort_id`/`business_unit_id` pueden quedar null hasta C2.

**C2** — Como Negocio, quiero ver los N cohorts de cada producto/BU (y sus ventas) consultables en DB y en el admin, para tener visibilidad por edición.
- **CE:** `marketing.cohorts` (DDL arriba) sincronizada automáticamente desde el catálogo en boot del API (mismo patrón que `seedWhatsAppGroupPools`): upsert idempotente por `code`, marca `is_active = false` lo que desaparezca del catálogo (**nunca** DELETE), actualiza `synced_at`; sync **unidireccional código→DB**; el checkout jamás lee esta tabla; RLS habilitado; `purchases.cohort_id` se rellena vía el espejo.
- **V:** boot con C2 en el catálogo crea/actualiza la fila `DI21-C2`; editar un tier en el catálogo y redeployar actualiza `tiers` jsonb; una edición manual en DB queda sobrescrita en el siguiente boot; query `purchases JOIN cohorts` devuelve ventas por edición; smoke script en `apps/admin/scripts/` lista cohorts por BU; `gen-types` regenerado.

**C3** — Como Negocio, quiero enlazar la compra al lead cuando exista, para habilitar automatización post-venta.
- **CE:** match por `(organization_id, lower(email))`; si no hay lead, la compra se guarda igual (`lead_id` null); existe un re-match diferido (cron o trigger en `lead_created`) que rellena `lead_id` de compras huérfanas cuando el lead aparece después.
- **V:** compra con email de lead existente enlaza; compra cold guarda sin lead sin error; lead creado después de la compra queda enlazado por el re-match.

**Éxito de ÉPICA C:** la jerarquía `BU → N cohorts` y las compras quedan en DB con idempotencia durable, habilitando reporting por edición **sin** que la DB defina jamás lo que cobra el checkout.

---

## Definition of Done transversal (enablers — no son user stories)

Exigibles como criterio de salida de cada épica:
- **Test harness:** vitest en `packages/catalog`, script `npm test` raíz, workflow de CI que corre typecheck + tests en PR. Sin esto, ningún CE de arriba es ejecutable — es lo **primero** que se construye.
- **Logs estructurados:** `orgKey`, `buKey`, `cohortCode`, `tierId`, `planId/offerCode`, `paymentId`, `resolutionSource` (sin PII sensible) en checkout y webhook; compra de prueba y webhook ignorado producen logs auditables.
- **Rollback:** los thin wrappers permiten revertir al registro anterior con un cambio pequeño/flag sin tocar Lucas ni Hotmart; checklist de rollback ejecutado en staging antes de la Épica B.
- **Orden de deploy web↔API:** definido y documentado (API con catálogo primero, luego web — o tolerancia documentada); tras cada mitad, `content_ids` verificado en Meta Events Manager.
- **Consumidores `force-dynamic`:** todo consumidor de `resolveActiveCohort(new Date())` en Next vive en rutas `force-dynamic` (un consumidor estático congelaría el precio en build).
- **DB:** migraciones aditivas e idempotentes vía `psql`; `gen-types` tras cada cambio de esquema; RLS en tablas nuevas.
- **QA con reloj inyectable:** web session, UI price, IC, resolución de webhook y Purchase corren con `now` inyectable; matriz verde antes de soltar la Épica B.

## Runbook "lanzar un cohort nuevo" (C3)
Orden y dueños (evita códigos colgantes):
1. **Nico** crea la fila en `launch_ops.launch` (admin) con el `code` nuevo (`DI21-C3`).
2. **Cristóbal** abre el PR de catálogo (`Cohort.launchCode = 'DI21-C3'`) — la validación de A2 + un smoke check verifican que el code exista en `launch_ops` antes de mergear.
3. Pools de WhatsApp del cohort se crean en el admin (Grupos WhatsApp) apuntando al mismo `launch_code`.
4. Deploy → el sync de C2 (story) materializa el cohort en `marketing.cohorts`.

## Dependencias / relación con otras funcionalidades
- **`hotmart-embedded-checkout`**: depende de este modelo. `offerCode` por tier encaja en `Tier.checkoutRef`; su webhook mapea `offer.code → cohort` y usa su `contentId`. Idealmente Épicas A–B van **antes** de su Fase 1. El manejo de refunds de `purchases` (C1) está alineado con sus US-3.2/3.4. Nota: Hotmart declara "sin estrategia de rollback" — compatible solo si el rollback de la DoD se prueba antes del switch.
- **`launch_ops` (Centro de Operaciones)**: `Cohort.launchCode` → `launch_ops.launch.code` (`DI21-C2`). No se duplica la config de checkout en `launch_ops`.
- **PR #74**: quedó CONFLICTING tras #76; su C0 (contentId) ya salió en #77. Sus C1/C3/C4 (USD, fechas, nav) requieren rebase; su **C2 (precio dinámico del VSL) se solapa con la Épica B** — decidir si se rebasea allá o se absorbe en B5 para no implementarlo dos veces.

## Decisiones pendientes
- **PR #74 (resto del bundle):** ¿rebasear C1/C3/C4 ahora y absorber C2 en la Épica B, o rehacer todo el bundle post-épica B?
- **Identidad de BU para `purchases.business_unit_id` / `cohorts.business_unit_id`:** `marketing.business_units` no tiene `slug`; hay que definir el mapping canónico `orgKey/buKey ↔ marketing UUID ↔ meta_ops slug` (hoy parcheado a mano en `POOL_BU_ALIAS`). **Prerrequisito para rellenar las FKs** (recomendado: migración aditiva `ADD COLUMN slug` + seed del mapping); ambas FKs nacen nullable para no bloquear.

## Resuelto
- **Dedup de Meta / contentId (2026-06-09):** fix de 1 línea mergeado en **PR #77** (extraído del C0 de #74). Web y API emiten `di21-c2`.
- **Modelo de dominio:** producto = BU; cohort = periodo de venta de esa BU/producto; org tiene N productos = N BUs.
- **Tabla de cohorts asociada a BU (2026-06-09, Negocio):** **SÍ — como espejo sincronizado** (`marketing.cohorts`, sync unidireccional código→DB en boot, read-only, FK target de `purchases`). La **definición** sigue code-first en `packages/catalog`; editar precio/fecha = PR + deploy, aceptado explícitamente por Negocio. Promoverla a fuente de verdad editable requiere las 3 condiciones simultáneas (editar desde admin sin deploy + UI con RBAC + eliminar el registro de código).
- **Ventana de venta (2026-06-09, Negocio):** **NO hay enforcement ni redirects.** El funnel vende siempre (comportamiento actual); las fechas del cohort sirven para resolver edición/precio y atribuir, no para bloquear. Si algún día se quiere cerrar carrito, será funcionalidad nueva.
- **Lucas con Lucas (2026-06-09, Negocio):** queda **aislado e intocado** — no entra al catálogo, ni adapter por ahora.
- **Idempotencia durable:** la rebanada mínima de C1 (tabla `purchases` + UNIQUE) se adelanta junto con la Épica B, no es opcional.
- **Drift de esquema launch_ops:** no existe — `20260608000100_launch_ops_schema.sql` está versionada en el repo (verificado 2026-06-09).
