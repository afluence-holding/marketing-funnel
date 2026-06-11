# Mamá Sin Caos — Setup como Organización + Landing de Diagnóstico — User Stories

**Estado:** ✅ **CONSTRUIDO Y 100% PROBADO EN LOCAL** (2026-06-10) — sin commits; espera
aprobación para deployar. Resumen de lo hecho/probado al final de este bloque.

> ## ✅ HECHO + PROBADO EN LOCAL (2026-06-10)
> **G1 — Mamá como org real:** stub (`orgs/mama-sin-caos/main/`: config/routing→[]/sequences/
> workflows) + binding en `orgs/index.ts` + `seed.ts` (org+BU seedeados: `MAMA_SIN_CAOS_ORG_ID=
> 63e35df5-…`) + `whatsapp-groups.ts` (pool `webinar-2026-06-23`, seedea 1 grupo al boot) +
> source `landing-mama-sin-caos-diagnostico` registrado en el resolver. La tabla/ruta dedicada
> legacy NO se tocó (intacta).
> **G2 — Landing de diagnóstico:** `apps/web/.../(landings)/mama-sin-caos/diagnostico/`
> (page.tsx + landing-frame.tsx + landing.html [su quiz de 6 arquetipos, branding clay/sage/
> Fraunces] + raw/route.ts) + proxy `/api/mama-sin-caos/diagnostico/ingest` → ruta genérica.
> Integración cableada en el HTML: ingesta (→ marketing.leads) + WhatsApp assign + UTM/Meta +
> iframe-height. Pixel por `NEXT_PUBLIC_META_PIXEL_MAMA_SIN_CAOS`. Hyros universal.
> **Probado E2E (Playwright, navegador):** quiz → captura → resultado → ingesta **201** (lead en
> `marketing.leads` con org de Mamá) + WhatsApp assign **200** (inviteUrl). Backend + proxies web
> OK. Build de producción de web ✓. Leads de prueba limpiados.
> **Falta de Negocio para prod (env placeholders, no bloquean el código):** link(s) real(es) del
> grupo de WhatsApp (`MAMA_SIN_CAOS_WA_GROUP_URLS` — hoy un placeholder dev) y el ID de pixel
> (`NEXT_PUBLIC_META_PIXEL_MAMA_SIN_CAOS`). El webinar (23-jun 21:00 Santiago) ya está en su HTML.

> ## 🔄 MANDATO ACTUALIZADO (decisión de Negocio 2026-06-10)

> ## 🔄 MANDATO ACTUALIZADO (decisión de Negocio 2026-06-10)
> 1. **Perder la tabla dedicada legacy (`mama_sin_caos_leads`) NO es problema.** Tratamos
>    esto como la **PRIMERA landing de la org** → se construye a Mamá como **org de verdad**
>    (no stub cosmético). La "regla de oro" de preservar el legacy queda **levantada**.
> 2. **Usa WhatsApp groups igual que el webinar de German** → arquitectura **full org**:
>    ingesta por la ruta **genérica** (`/api/orgs/mama-sin-caos/main/ingest` → `marketing.leads`)
>    + rotación de grupos (`whatsapp-groups.ts` + assign endpoint). Esto REQUIERE seed real
>    (org + BU → `MAMA_SIN_CAOS_ORG_ID`).
> 3. **Branding y contenido salen de su HTML:** `docs/mama-sin-caos-quiz (1).html`
>    (quiz de 6 arquetipos: bombera/invisible/olla/gerente/culpa/piloto; paleta clay/sage/
>    cream/espresso; fonts Fraunces + DM Sans). Su HTML tiene los puntos de integración
>    como PLACEHOLDERS (submit sin POST, `WHATSAPP_GROUP_URL=''`, `WEBINAR_EVENT` sin fecha,
>    hooks Fbq/UTM) → se cablean al patrón German.
> 4. **`source` SIN prefijo `afluence-`** → `landing-mama-sin-caos-diagnostico` (o similar).
> 5. **G1 stub confirmado** (ya hecho) — se **amplía** a org real (seed + WhatsApp pool).
>
> **Insumos que faltan (se cablean como ENV placeholders, no bloquean el build):**
> link del grupo de WhatsApp, fecha/hora del webinar, ID(s) de pixel de Mamá.

**Estado (alcance original auditado):** reducido a lo mínimo seguro; AHORA ampliado a org real
por el mandato de arriba. Sin commits; deploy requiere aprobación.
**Objetivo:** (G1) que Mamá Sin Caos quede reconocida como **organización** en la
modularización, **sin perder JAMÁS su ingesta**; (G2) publicar el **landing de su recurso
de diagnóstico** con la filosofía modular probada y **su branding**.

**Convención:** `Como <rol>, quiero <acción>, para <valor>` · **CE** = Criterio de Éxito ·
**V** = Validación. **Roles:** Lead · Negocio · Dev · Sistema.

> ⚠️ **Regla de oro (innegociable):** la ingesta de Mamá NO se pierde. Su tabla
> `marketing.mama_sin_caos_leads` y su ruta dedicada (`/api/mama-sin-caos/ingest` →
> `upsertMamaSinCaosLead`) quedan **intactas (diff = 0)**. Todo es **ADITIVO**.

---

## Veredicto de la auditoría (lo que cambió vs el draft inicial)

1. **G1 es aditivo-seguro, CONFIRMADO.** La ruta dedicada de Mamá (`mama-sin-caos-leads.routes.ts`
   → `mama-sin-caos-leads.service.ts` → tabla dedicada) **no importa** `getBusinessUnitBinding`
   ni `resolveIngestionTargetBySource`. Registrarla como org es invisible para su ingesta.
2. **Overshoot eliminado en G1:** NO hace falta `seed.ts`, ni filas `organizations`/`business_units`,
   ni `.env` IDs, ni pipeline/stages. Nadie los lee (los leads viven en la tabla dedicada, sin FK
   a `organizations`). El admin **ya** reconoce a Mamá como org (`apps/admin/.../modules/registry.ts`
   → `'mama-sin-caos/main': ['responses']`). El stub de API es **cosmético/estructural**.
3. **Overshoot eliminado en G2:** NO clonar el webinar de German. `webinar-registration.tsx` y
   `webinar-styles.ts` son **código muerto** (no los importa nada en `german-roz/`; el render es
   iframe → `landing.html`). Se clona **la propia landing de Mamá** (`lista-secreta`): 4 archivos
   raw-HTML. Se reusa su `/api/mama-sin-caos/ingest`. Sin tabla de progreso, sin WhatsApp, sin API nueva.
4. **Único riesgo real (fragmentar ingesta):** al registrar la org existirá
   `/api/orgs/mama-sin-caos/main/ingest` (genérico → `marketing.leads`). El landing nuevo **DEBE**
   postear a la ruta **dedicada** `/api/mama-sin-caos/ingest`, NUNCA a la genérica. Invariante blindado abajo.
5. **Fixes factuales:** el facet del admin se distingue por `custom_fields.landing` (no `source`);
   pixeles Meta/GA4/TikTok vía env en `page.tsx` → `<LandingConfig>` (no por `pixels.ts`); Hyros
   universal vía `landingHtmlResponse()`; **cero** cambio de schema (sin migración/gen-types/PostgREST).

---

## Estado actual (verificado)

Mamá Sin Caos = creadora **"tabla dedicada"** (como Bukku):
- Tabla `marketing.mama_sin_caos_leads` (upsert por `lower(email)`; `custom_fields`/`utm_data` jsonb).
  Migración `20260602120000_mama_sin_caos_leads.sql` + `ensureMamaSinCaosLeadsTable()` al boot.
- Ingesta: landing `/afluence/mama-sin-caos/lista-secreta` → `/api/mama-sin-caos/ingest` (proxy Next,
  fallback a archivo local en prod) → backend `/api/mama-sin-caos/leads` → `upsertMamaSinCaosLead()`.
- Lectura: `/api/mama-sin-caos/leads` (token `MAMA_SIN_CAOS_VIEW_TOKEN`). Admin `responses` habilitado.
- **NO** registrada en `apps/api/src/orgs/index.ts`. Sin sequences/workflows/pixels/cohorts/pipeline.
- Inconsistencia: la landing vive bajo `/afluence/mama-sin-caos/...` pero el admin la trata como `mama-sin-caos/main`.

**Precedente:** `caro-fitness` está registrada como org (`routing → []`) **y** tiene tabla dedicada —
PERO su binding **sí** lo usa su landing (postea por la ruta genérica). El de Mamá será **cosmético**
(routing `[]`, nadie lo consume), porque su landing sigue por la ruta dedicada.

---

## GOAL 1 — Reconocer a Mamá como organización (cosmético, aditivo, sin tocar ingesta)

### FASE 1 — Stub code-first de la org (mínimo)
**US-G1.1** — Como Dev, quiero crear `apps/api/src/orgs/mama-sin-caos/main/` con SOLO 4 archivos
mínimos (`config.ts` con orgKey/buKey/timezone/statuses, `routing.ts` → `() => []`,
`sequences/index.ts` vacío, `workflows/index.ts` vacío) + registrar la BU en
`apps/api/src/orgs/index.ts`, para que la API la reconozca como org.
- **CE:** `getBusinessUnitBinding('mama-sin-caos','main')` resuelve; el API bootea limpio; typecheck verde.
  **Sin** `seed.ts`, **sin** filas DB, **sin** `.env` IDs, **sin** pipeline/stages (nadie los lee).
  `organizationId` puede ir vacío/diferido (solo lo usaría la ruta genérica, que Mamá no usa).
- **V:** arranque local del API OK; `getBusinessUnitBinding` retorna el binding; `git diff` NO toca
  ningún archivo de ingesta dedicada.
- **[DECISIÓN]** ¿Querés siquiera el stub? El admin ya la reconoce como org. El stub es por simetría
  code-first; cuesta ~5 archivos triviales y cero riesgo. Default: **sí, stub mínimo.**

### FASE 1 — Invariante de ingesta (no es build; es guardia)
**US-G1.2 (guardia)** — Como Sistema, quiero garantizar que registrar la org NO cambie la ingesta de
`lista-secreta` ni fragmente leads, para no perder nada.
- **CE:** (a) `lista-secreta` sigue posteando a `/api/mama-sin-caos/ingest` → tabla dedicada, idéntico;
  (b) el `source` dedicado **NO** se agrega a `resolveIngestionTargetBySource` (sigue fuera del allowlist
  genérico a propósito); (c) regresión cero en `mama-sin-caos-leads.{routes,service}.ts`,
  `ensure-mama-sin-caos-leads-table.ts`, la migración y el proxy Next.
- **V:** smoke antes/después: POST a `/api/mama-sin-caos/ingest` con email de prueba → fila en
  `mama_sin_caos_leads` (idéntico). `git diff` = 0 en esos archivos. Confirmar que NINGÚN nuevo
  consumidor lee el binding de Mamá.

**Éxito de G1:** Mamá resuelve como org en la API **y** su ingesta es imposible de perder (no se tocó).

---

## GOAL 2 — Landing del recurso de diagnóstico (clonando la propia landing de Mamá + su branding)

**Enfoque:** clonar el patrón raw-HTML que Mamá YA usa (`lista-secreta`): `page.tsx` +
`landing-frame.tsx` (verbatim) + `landing.html` (contenido nuevo) + `raw/route.ts`. Branding ya es
de ella. Ingesta por la ruta dedicada existente. **Esta es la superficie de mayor riesgo** (acá es
donde se podría fragmentar la ingesta) → blindar el destino del form.

### FASE 2 — Esqueleto del landing
**US-G2.1** — Como Dev, quiero crear `apps/web/src/app/(landings)/mama-sin-caos/diagnostico/`
copiando los 4 archivos de `lista-secreta` (NO del webinar de German), con el meta-pixel de Mamá leído
por env en `page.tsx` → `<LandingConfig>`, para reusar el patrón probado de Mamá.
- **CE:** ruta `/mama-sin-caos/diagnostico` sirve 200; `landing-frame.tsx` reusado tal cual (incl. el
  contrato postMessage de altura del iframe); `page.tsx` pasa `NEXT_PUBLIC_META_PIXEL_MAMA_SIN_CAOS`
  si existe (no-op si falta).
- **V:** dev → la ruta carga; el iframe ajusta altura; pixel carga cuando hay env.

### FASE 2 — Ingesta blindada (a la ruta dedicada, jamás la genérica)
**US-G2.2** — Como Lead, quiero completar el diagnóstico y dejar mis datos, y como Sistema, que el
lead caiga en la **tabla dedicada** de Mamá, sin fragmentarse.
- **CE:** el `<script>` del nuevo `landing.html` postea a `/api/mama-sin-caos/ingest` (proxy dedicado
  existente, sin crear proxy nuevo), con `custom_fields.landing = 'diagnostico'` (clave del facet del
  admin) y un `source` propio coherente con la convención (decidir prefijo). **Prohibido** postear a
  `/api/orgs/mama-sin-caos/main/ingest` (genérico → `marketing.leads`).
- **V:** dev → completar el form → fila nueva en `mama_sin_caos_leads` con `landing='diagnostico'`;
  aparece como facet propio en el admin `responses`; `lista-secreta` sigue igual. Grep/check: el nuevo
  `landing.html` NO referencia la ruta genérica.

### FASE 2 — Branding de Mamá (HTML/CSS only)
**US-G2.3** — Como Negocio, quiero el landing con el branding de Mamá (colores, tipografía, logo,
copy del diagnóstico), respetando la regla de raw-HTML.
- **CE:** el re-skin es **solo HTML/CSS** dentro del nuevo `landing.html`; NO se alteran IDs de campos
  de formulario ni la lógica del `<script>` de ingesta heredada del patrón; copy/recurso de Mamá.
- **V:** revisión visual en dev contra el brand kit de Mamá; ingesta sigue funcionando tras el re-skin.
- **[INSUMO NEGOCIO]:** colores hex, tipografía, logo/imagen, copy + preguntas del diagnóstico, recurso
  ofrecido, nombre exacto, IDs de pixel (Meta/GA4/TikTok), slug y convención de `source`.

**Éxito de G2:** landing en dev con marca de Mamá, diagnóstico funcional, lead a su tabla dedicada
(facet `diagnostico`), pixeles cargando; `lista-secreta` intacta.

---

## Definition of Done transversal
- **NO commits hasta probar todo en dev.** Deploy requiere **aprobación explícita** del usuario.
- `typecheck` verde (api + web) y build de deploy verde.
- Ingesta de `lista-secreta` verificada **idéntica** antes/después (regresión cero; `git diff` = 0 en
  ruta/servicio/tabla/bootstrap/proxy dedicados).
- **Cero cambio de schema** (sin migración, sin `gen-types`, sin PostgREST). G1 y G2 reusan lo existente.
- El nuevo landing postea SOLO a la ruta dedicada; el `source` dedicado sigue fuera del resolver genérico.

## Decisiones / insumos pendientes
1. **[DECISIÓN]** ¿Stub de API para G1 (recomendado, mínimo) o basta el reconocimiento del admin?
2. **[NEGOCIO]** Branding de Mamá + copy/preguntas del diagnóstico + recurso ofrecido.
3. **[NEGOCIO]** IDs de pixel (Meta/GA4/TikTok). ¿WhatsApp group? (si sí, cambia la arquitectura a la
   híbrida tipo caro-fitness — hoy default NO).
4. **[DECISIÓN]** Slug del landing (`/mama-sin-caos/diagnostico`?) y convención de `source`
   (¿con prefijo `afluence-` como `lista-secreta`, o sin él?).
5. **[DECISIÓN]** No mover/renombrar `lista-secreta` (default: dejar la vieja bajo `/afluence/`).

## Riesgos y mitigación
- **R1 (fragmentar ingesta):** el nuevo landing postea a la ruta genérica → leads en `marketing.leads`.
  **Mitigación:** US-G2.2 fija la ruta dedicada + check de que no se referencie la genérica.
- **R2 (tocar ingesta dedicada):** **Mitigación:** `git diff` = 0 en esos archivos + smoke antes/después.
- **R3 (facet invisible en admin):** usar `source` y no `custom_fields.landing`. **Mitigación:** setear
  `custom_fields.landing='diagnostico'`.
- **R4 (regla raw-HTML):** romper IDs de campos/`<script>` al re-skinnear. **Mitigación:** branding = HTML/CSS only.

## Fasing de desarrollo (en dev, sin commits)
- **Fase 1 (G1):** stub mínimo de org + registro → smoke de ingesta de `lista-secreta` idéntico.
- **Fase 2 (G2 esqueleto):** clonar el patrón de `lista-secreta` → `/mama-sin-caos/diagnostico` sirve 200.
- **Fase 3 (G2 ingesta):** form → ruta dedicada + `custom_fields.landing='diagnostico'` → smoke en dev.
- **Fase 4 (G2 branding):** re-skin con marca de Mamá (requiere insumos de Negocio).
- **Checkpoint:** aprobación del usuario para deployar.
