# Modularización de cohorts — Plan de implementación

**Estado:** ✅ IMPLEMENTADO EN WORKING TREE (2026-06-09) — **sin commitear**, pendiente QA local + decisión de commit/PRs.
Todo el plan (PR1–PR7 + fixes de 4 auditorías adversariales) está aplicado localmente:
- Validado: catalog 42/42 tests, typecheck de las 12 workspaces, `next build` web y `tsc` API en verde, lockdown grep activo.
- Migración `20260611000000_marketing_cohorts_and_purchases.sql` escrita pero **NO aplicada a Supabase** (también se auto-aplica en boot vía `ensure-purchase-tables.ts`, patrón del repo).
- Al commitear: incluir TODO junto (packages/catalog + .github/workflows/ci.yml + apps — el build remoto rompe si van separados).

**Estado original (rev. 2026-06-09):** 🚧 En ejecución
**Fuente:** `USER-STORIES.md` (mismo directorio). Este doc baja las épicas A–C a una secuencia de PRs pequeños, cada uno mergeable y reversible por sí solo.

**Reglas del plan:**
- PRs chicos, en orden; cada uno deja `main` deployable.
- Orden de deploy cuando un PR toca runtime: **API primero, web después**.
- Nada de enforcement de ventana ni redirects; Lucas no se toca (decisiones de Negocio en USER-STORIES.md).

---

## Secuencia de PRs

### ✅ PR #77 — Hotfix contentId (Épica A1) — MERGEADO 2026-06-09
Web pixel → `di21-c2`. Pendiente operativo: confirmar dedup en Meta Events Manager post-deploy (Nico/Cristóbal, checklist abajo).

---

### PR 1 — Test harness + CI (DoD transversal — prerrequisito de todo)
**Rama sugerida:** `chore/test-harness-ci`
- `packages/catalog/` esqueleto: `package.json` (`@marketing-funnel/catalog`, patrón de `packages/config`: `main: dist/index.js`, `types: dist/index.d.ts`, scripts `build`/`typecheck`/`test`), `tsconfig.json` (extiende `tsconfig.base.json`), vitest como devDependency del paquete.
- Script `test` en el `package.json` raíz (`npm run test --workspaces --if-present`).
- `.github/workflows/ci.yml`: en PR → `npm ci` + `npm run typecheck` + `npm run test` (hoy el repo NO tiene CI de código; solo backup y docs).
- Un test trivial verde para validar el pipeline.
**Done cuando:** un PR con test roto queda bloqueado por CI.

### PR 2 — `packages/catalog`: modelo + datos C2 + resolvers + validación (Épica A2 + B1 + B2, sin consumidores)
**Rama sugerida:** `feat/catalog-package`
- `src/types.ts`: `BusinessUnitProduct` (`orgKey`, `buKey`, `cohorts[]`), `Cohort` (`code`, `contentId`, `startsAt`, `endsAt`, `timezone`, `tiers[]`), `Tier` (`price`, `currency`, `until?`, `checkoutRef: { provider: 'whop'; planId } | { provider: 'hotmart'; offerCode }`).
- `src/resolvers.ts`: `resolveActiveCohort(product, now)` y `resolveTier(cohort, now)` — puros, `now` inyectable, **sin redirects**: fuera de fechas devuelve el último cohort con `resolutionSource: 'fallback_latest'` (paridad con comportamiento actual).
- `src/validate.ts`: rechaza cohorts solapados por BU, tiers desordenados, tz inválida, `contentId` vacío, `checkoutRef` duplicada. Se corre en un test (= falla en CI, no en producción).
- `src/products/german-roz-main.ts`: C2 con los valores EXACTOS de hoy ($67/$77/$87, cortes 16/23-jun, `contentId: 'di21-c2'`, `launchCode: 'DI21-C2'`). `src/products/german-roz-plan-90-pro.ts` si aplica (hoy no tiene checkout Whop — confirmar; si no, no se inventa).
- Tests: matriz de reloj (dentro de cada tier, bordes exactos `23:59:59`/`00:00:00`, post-cierre → fallback logueado, tz con DST p.ej. `Europe/Madrid`); snapshot del catálogo C2 comparado contra los valores actuales de `apps/web/.../products.ts` y `apps/api/.../whop-products.ts`.
**Done cuando:** suite verde en CI; cero consumidores aún (riesgo de regresión: nulo).

### PR 3 — API consume el catálogo (Épica A2, lado API)
**Rama sugerida:** `refactor/api-thin-wrapper`
- `apps/api/src/core/services/whop-products.ts` → thin wrapper: `planPrices`/`contentIds`/`graciasUrl` derivados de `@marketing-funnel/catalog` (los 2 consumidores — `whop-webhook.service.ts`, `whop-purchase.service.ts` — no cambian su interfaz).
- La rama de Lucas en el webhook NO se toca.
- Test de paridad: payload CAPI antes/después idéntico para una compra de cada tier.
**Done cuando:** diff del payload CAPI = vacío; deploy API sin cambios observables.

### PR 4 — Web consume el catálogo (Épica A2, lado web + lockdown)
**Rama sugerida:** `refactor/web-thin-wrapper`
- `apps/web/src/lib/whop/products.ts` → thin wrapper de `@marketing-funnel/catalog` (los 6 consumidores no cambian). Es la **primera dependencia workspace de web**: agregar `@marketing-funnel/catalog` a `dependencies` + `transpilePackages` en `next.config`; verificar build standalone/`outputFileTracingRoot`.
- Borrar el código muerto de ventana (`getWhopWindowState`/`getWhopWindowRedirect`, `beforeOpenPath`/`afterClosePath`) — decisión: no hay enforcement.
- **Lockdown (A2):** check en CI (grep/lint) que falla si `apps/web/.../products.ts` o `apps/api/.../whop-products.ts` re-declaran tiers/contentIds/planIds.
- Verificar que todo consumidor de `resolveActiveCohort(new Date())` está en rutas `force-dynamic`.
**Done cuando:** QA manual del funnel (VSL → checkout → gracias) idéntico; precio correcto en las 3 ventanas con reloj simulado en tests.
**Fin de Épica A** — una sola fuente define precio/contentId.

### PR 5 — Runtime por cohort: sesión, cachés y webhook (Épica B4 + B5)
**Rama sugerida:** `feat/cohort-runtime`
- Sesión Whop incluye `metadata.cohort_id` (= `cohort.code`); el cliente usa el tier/value resuelto por el server (nunca recalcula con su reloj).
- Cachés re-keyeadas: `whop_session:{org}/{bu}/{cohortCode}` etc., **con lectura fallback de la key vieja** (`whop_session:{productKey}`) durante la transición para no perder `purchaseEventId` de sesiones en vuelo.
- Webhook resuelve cohort por prioridad `metadata.cohort_id → planId → paidAt` y usa el `contentId` del cohort resuelto; logs estructurados (`cohortCode`, `tierId`, `resolutionSource`, `paymentId`).
- IC siempre completo (`value`/`currency`/`content_ids`/`eventId` del tier del server).
**Done cuando:** compra de prueba con y sin `cohort_id` en metadata atribuye al cohort correcto; sesión vieja sigue dedupeando.

### PR 6 — `marketing.purchases` + idempotencia durable (Épica C1)
**Rama sugerida:** `feat/purchases-table`
- Migración `2026MMDDxxxxxx_marketing_purchases.sql` (DDL en USER-STORIES.md: snapshots, `status`/`refunded_at`, `UNIQUE(provider, external_id)`, RLS). Aplicar vía `psql`; `gen-types`.
- Webhook: INSERT ... ON CONFLICT DO NOTHING **antes** de disparar CAPI → reemplaza el `Set` en memoria; si la fila ya existía, no re-dispara CAPI. `cohort_id`/`business_unit_id` quedan null por ahora; `cohort_code` siempre.
- Smoke: dos POST paralelos + reinicio → 1 fila, 1 CAPI.
**Done cuando:** compras de prueba Whop persistidas e idempotentes a través de reinicios.

### PR 7 — Espejo `marketing.cohorts` + sync en boot (Épica C2)
**Rama sugerida:** `feat/cohorts-mirror`
- Migración `..._marketing_cohorts.sql` (DDL en USER-STORIES.md) + `gen-types`.
- `syncCohortsFromCatalog()` en el boot del API (junto a `seedWhatsAppGroupPools`): upsert por `code`, `is_active=false` para lo que desaparezca (nunca DELETE), `synced_at`.
- Webhook rellena `purchases.cohort_id` vía el espejo (lookup por `cohort_code`).
- Smoke script `apps/admin/scripts/smoke-cohorts.mjs`: lista cohorts por BU + ventas por cohort (`purchases JOIN cohorts`).
**Done cuando:** boot materializa `DI21-C2`; edición manual en DB se sobrescribe al siguiente boot; query de ventas por edición funciona.

### PR 8 — Compra → lead + re-match (Épica C3)
**Rama sugerida:** `feat/purchase-lead-link`
- Match en el webhook por `(organization_id, lower(email))`; cron de re-match (en `core/cron/jobs/`) para compras huérfanas cuando el lead aparece después.
**Done cuando:** los 3 casos de la V de C3 pasan (lead existente, cold, lead posterior).

### PR 9 — Demostración del principio rector (Épica B3, story estrella)
**Rama sugerida:** `test/c3-additive-proof` (draft, no se mergea o se mergea con cohort dummy desactivado)
- PR de prueba que agrega un C3 ficticio: el diff **no toca ninguna línea de C2**; con reloj simulado en fechas C3, checkout/tracking/espejo resuelven C3.
**Done cuando:** Negocio (Nico) ve el diff y valida que lanzar una edición = agregar una entrada.

---

## Paralelizable / dependencias

```
PR1 (harness) ──► PR2 (catalog) ──► PR3 (API) ──► PR4 (web) ──► PR5 (runtime) ──► PR9 (prueba C3)
                                          │
PR6 (purchases) ◄─ puede ir en paralelo desde PR3 ──► PR7 (espejo) ──► PR8 (lead link)
```
- PR6 no depende del catálogo (solo del webhook) — puede adelantarse si se quiere idempotencia durable cuanto antes (recomendado: antes de PR5, que reinicia el API varias veces).
- PR7 sí necesita PR2 (lee el catálogo para sembrar).

## Checklist operativo (no-código)
- [ ] Meta Events Manager: confirmar dedup pixel/CAPI post-deploy de #77 (buscar Purchase con `content_ids: di21-c2` deduplicado).
- [ ] Decidir destino del resto del PR #74 (C1/C3/C4 rebase; C2 absorber en PR5 — recomendado).
- [ ] Mapping identidad BU (`marketing.business_units.slug`): decidir antes de rellenar FKs (no bloquea PR6/PR7, nacen nullable).
- [ ] Crear `DI21-C3` en `launch_ops.launch` cuando Negocio defina la próxima edición (runbook en USER-STORIES.md).
