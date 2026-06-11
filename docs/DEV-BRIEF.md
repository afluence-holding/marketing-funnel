# Story Funnel Studio — Developer Brief (feature del mini-SaaS)

> **Qué es:** productizar el skill `afluence-story-funnel` como una **feature modular y multi-tenant** del mini-SaaS Afluence. Genera secuencias de Instagram Stories (lead-magnet comment-to-DM): biblioteca de assets categorizados → compositor de permutaciones → motor de render HTML→PNG → edición de imágenes con IA → board de revisión multi-revisor con consenso.
>
> **Para quién es este doc:** el desarrollador que lo construye en el repo. Todo está **validado** (decisiones técnicas con fuentes 2025-26 y grado de certeza), es **agnóstico** (N creadores × campañas × launches × nichos) y **extiende** la arquitectura Afluence L1–L7 existente, no la contradice.
>
> Método: diseñado con 4 agentes en paralelo (research técnico validado · data model · servicios/API · composición/roadmap). Fuentes al final.

---

## 0. TL;DR para el dev

- **Bounded context:** `Story Funnel Studio (SFS)` = sub-dominio de *creative_production* (L6) dentro de Strategy=marketing → Pipeline=organic. **Agregado raíz:** `StorySequence` con una máquina de **9 estados** (draft→…→published).
- **La línea estructural que hace todo agnóstico:** **CONFIG** (templates de arquetipos + motor + 3 gates de QA → versión global de plataforma) vs **DATO** (spec + library + builds + ballots → RLS por tenant). No la cruces.
- **Dos fronteras que NO se deben cruzar** (scope creep mata la reusabilidad): hacia arriba = **Creator Asset Library** (assets compartidos con otras features creativas); hacia abajo = **Distribution/Publish** (scheduling, comment-to-DM, captura de lead). SFS termina en un *publishable bundle* (PNGs + metadata).
- **Stack validado:** Postgres + RLS (`tenant_id`) · render en **worker Chromium contenedorizado con pool de pages** (NO serverless, NO Satori) · jobs async **pg-boss** · IA **Gemini 2.5-flash (drafts) / 3-pro (final)** · object storage content-addressed.
- **MVP = Fases 0+1** (validar+renderizar specs multi-tenant). **Diferenciador = Fase 2** (review board con consenso + gates).
- **Riesgo #1 (no técnico):** la **política de contenido de Gemini sobre edición de personas reales** puede bloquear el feature "editar la foto del creador con IA". Verificar la Prohibited Use Policy oficial **antes** de comprometer roadmap (§3 y §11).

---

## 1. Dónde encaja en Afluence (L1–L7)

SFS no es un silo: cuelga de la jerarquía multi-tenant existente.

| Concepto SFS | Mapea a | FK |
|---|---|---|
| Workspace del studio | **L6 Workflow** `creative_production` (Strategy=marketing → Pipeline=organic) | `workflow_id`, `pipeline_id` |
| Creador / dueño de assets | **L2 Organization** = `tenant_id` | `organization_id` |
| Producto | **L3 Business Unit** | `business_unit_id` |
| **Launch** (el "push" del studio) | **L3 Cohort** (`launch_date`, `capacity` ya existen) | `cohort_id` |
| Revisor (persona) | **L1 User** global + **L1 Enrollment** (rol en el tenant) | `user_id`, `enrollment_id` |
| Métricas (DMs/keyword, retención) | **derivadas hacia abajo**, nunca almacenadas | join por `keyword`+`cohort_id` en analytics |

**Principios Afluence respetados:** `tenant_id = organization_id`; `User` es global (no se aísla, se referencia); `Enrollment` = fuente de verdad del rol; **costos agregan hacia arriba** (build→launch→BU→org como `cost_event` atómicos), **métricas derivan hacia abajo** (vistas, no totales persistidos).

### 1.1 Diagrama de módulos

```
   UPSTREAM (SFS consume)              STORY FUNNEL STUDIO (L6)                 DOWNSTREAM (SFS provee)
 ┌──────────────────┐    RLS  ┌──────────────┐   ┌────────────────────┐
 │ Identity&Tenancy │───────▶ │  Spec Service │◀─▶│ Template Registry  │      ┌──────────────────┐
 │ org/bu/user/RBAC │         │ (campaign     │   │ (8 arquetipos,     │      │ Distribution (L4)│
 └──────────────────┘         │  data)        │   │  config versionada)│─────▶│ publish/schedule │
 ┌──────────────────┐   ref   └──────┬───────┘   └────────────────────┘ pub  │ comment-to-DM    │
 │ Creator Asset    │───────▶        │                                  bundle└──────────────────┘
 │ Library (shared) │         ┌──────▼───────┐   ┌────────────────────┐      ┌──────────────────┐
 │ photos, ai-hooks │         │  Composer    │──▶│  Review / Board     │─────▶│  Object Storage  │
 │ brand tokens     │         │ (permutac.,  │   │ (manifest, ballots, │ put  │  renders/, builds│
 └──────────────────┘         │  builds)     │   │  consenso, acta,    │      └──────────────────┘
 ┌──────────────────┐  gen    └──────┬───────┘   │  rúbrica QA 11pt)    │      ┌──────────────────┐
 │ AI Gateway       │◀──────▶        │           └─────────┬──────────┘ emit │ Billing/Metering │
 │ Gemini 2.5 / 3-pro│        ┌──────▼─────────────────────▼──────────┐──────▶│ ai_cost, render  │
 └──────────────────┘         │   Render Orchestrator (pg-boss →       │      └──────────────────┘
                              │   Chromium worker)  draft + final hi-res│
                              └─────────────────────────────────────────┘
```

---

## 2. Decisiones técnicas validadas (con fuentes y certeza)

| Componente | Decisión | Por qué | Certeza |
|---|---|---|---|
| **Render HTML/CSS→PNG** | **Playwright/Puppeteer en contenedor de larga vida + pool de pages** (1 browser, N contexts). NO serverless por-request. **NO Satori.** | La estética (cajas serif con fondo multi-línea) usa `box-decoration-break: clone`, que **Satori no soporta** (subconjunto CSS sin grid/vars/calc/box-decoration-break/WOFF2). El costo de Chromium (cold start 2–4s, 300–800MB) se amortiza con worker caliente. | **Alta** |
| Gen simple futura | Satori/@vercel/og solo para plantillas sin highlight multi-línea (edge, ~0 cold start) | Limitado, pero barato para casos triviales | Media |
| **IA imagen — drafts** | `gemini-2.5-flash-image` (~$0.039/img, batch $0.0195) | Barato para variantes descartables del board | **Alta** (pricing oficial) |
| **IA imagen — final** | `gemini-3-pro-image-preview` (~$0.134/img 1-2K) solo al aprobar | Calidad alta solo cuando el usuario confirma; controla costo variable | **Alta** |
| **IA — política contenido** | Verificar Prohibited Use Policy oficial + consentimiento de edición de imagen propia + fallback ante rechazo | Restricciones (feb 2026, reportadas) sobre edición de personas reales/face-swap pueden bloquear el caso de uso | **Media — verificar** |
| **Multi-tenancy** | **Postgres shared-schema + RLS**, `tenant_id` + índices `(tenant_id, created_at)`, validación también en app (defense-in-depth) | Lo recomendado 2025 para B2B early-stage; migrable a schema-per-tenant si crece. Supabase RLS nativo | **Alta** |
| **Cola de jobs** | **pg-boss** (mínima infra sobre Postgres; `SKIP LOCKED`, ACID). Alternativa con observabilidad UI: Trigger.dev | Volumen no justifica Redis/BullMQ. Alinea con stack Postgres | **Alta** |
| **Storage** | Object storage content-addressed (key = `content_hash`) + CDN con signed URLs | Dedupe + cache-forever; binarios nunca públicos | Alta |

> **Costo variable #1 = IA por iteración.** Instrumentar gasto por tenant desde el día 1. Estrategia draft/final: ~10 iteraciones flash + 1 final pro ≈ **$0.52/story** vs ~$1.47 si todo fuera pro.

---

## 3. Arquitectura de servicios (promoción CLI → servicio)

La lógica de dominio **ya está escrita y validada** en los scripts del skill. El trabajo es extraer el dominio puro de los `main()` CLI, envolverlo en HTTP + cola + persistencia, y mover I/O (archivos locales → object storage). **Núcleo de negocio en TS; cómputo pesado (Playwright, Gemini) en workers Python** (no reescribir lógica validada a TS).

| Servicio | Responsabilidad | Origen (script) | Runtime |
|---|---|---|---|
| **Asset Service** | CRUD biblioteca modular (creators globales→campaigns→launches; image/text assets, tags, defaults, seed_builds). Binarios→object storage, metadata→Postgres. `warn_refs` (no bloquea) | `build_composer.py` | TS |
| **Template Registry** | Los 8 arquetipos (config inmutable versionada): `masterclass, free-guide, reto, waitlist, application, short3, belief-shift, psa`. Sirve template + `extra_fields`, `scarcity_mode`, `temario_len`, `pains_len`. Read-mostly | `templates/*.json` + `resolve()` | TS |
| **Composer Service** | Builds (combinaciones slot→{img,txt}), hidrata library para el cliente, materializa build→spec render-ready. **No** renderiza permutaciones (eso es el cliente) | `build_composer.py` | TS |
| **Validation Service** | Reglas duras+blandas: keyword `^[A-ZÁÉÍÓÚÑ0-9]{3,15}$`, escasez por `scarcity_mode` (date/cupos/urgency_hours), fecha-inventada `DATE_RX`, longitudes, colores, foto existe, regla de oro ≤5 cajas (warn). **Módulo TS compartido cliente+servidor** (un solo origen de verdad) | `render.py` (`validate`, `resolve`, `interp`) | TS (port de reglas puras) |
| **Render Service (worker)** | spec → HTML/CSS → Playwright → PNG (`scale=2`, 2160×3840), auto-fit (`_fit_stack`), face-safe, sube a storage. **Worker Chromium pool**, consume pg-boss | `render.py` (`build_css`, `page_html`, `_fit_stack`, `render`) | Python worker |
| **AI Image Service** | Gemini gen (drafts 2.5-flash / final 3-pro) + edición image-to-image (hook "antes"). Cover/crop face-safe, fallback de modelos, **costo por tenant**. Rechazo de Gemini = estado de negocio, no excepción | `edit_image_gemini.py` | Python worker |
| **Review/Board Service** | Boards (`variant_grid`/`before_after_matrix`/`sequence_only`), rúbrica QA 11 pts + 3 gates duros (hook/cta/márgenes), ballots por revisor, merge, consenso ≥60%, acta. **Server-side multi-usuario** (hoy es localStorage+base64) | `build_board.py` | TS |
| Identity/Tenant/Billing · Job/Event | Auth, roles, RLS, cuotas, costo IA por tenant, pg-boss, SSE/webhooks | nuevo | TS |

### 3.1 Cliente (en vivo) vs Server-side

- **Cliente (compone en vivo, cero render server):** el Composer renderiza en el DOM (imagen de fondo + cajas black/white/red) — itera slot×img×txt y Hook Lab sin tocar el server (= lo que ya hace `build_composer.py`). Validación blanda en vivo (mismo módulo TS). Board/scorecard/voto interactivo.
- **Server-side (autoritativo/pesado/sensible):** render final hi-res (pixel-consistente, fuentes controladas, `document.fonts.ready` + Noto emoji bundle); **toda la IA** (API key nunca toca el cliente); validación autoritativa; persistencia; cálculo de consenso; billing; RLS.
- **Preview-live sync** (`POST /specs/{id}/preview`): punto medio — 1 frame real en ~2s vía pool con prioridad alta, `scale=1`, sin persistir. Fallback fiel si el cliente no puede componer.

### 3.2 Pipeline de render asíncrono + estados del job

```
queued ──► running ──► succeeded | failed | rejected
   ▲          │ │
   │ retry◄───┘ └─ transient err (page crash/timeout/OOM) → reciclar page → retry (max 3, backoff exp)
   │
  rejected = decisión de Gemini (safety/empty image) → terminal, NO reintentable, motivo legible
  failed   = error permanente (SpecError/foto ilegible) o reintentos agotados → dead-letter queue
```

- **Idempotencia:** `idempotency_key = sha256(tenant_id + canonical_json(spec) + render_opts + sorted(asset_content_hashes))` como pg-boss `singletonKey`. Job `succeeded` con esa key → devuelve resultado sin re-encolar (assets content-addressed → PNG determinista). El cliente puede mandar `Idempotency-Key` header.
- **Reintentos:** `retryLimit:3`, `retryBackoff:true`. Clasificación: transitorios→retry (recicla page); permanentes→`failed` sin retry; rechazo IA→`rejected`. Agotados→dead-letter + evento `job.failed`.
- **Rechazo Gemini:** 404/not-found→fallback de modelo silencioso; respuesta sin imagen tras agotar cadena→`rejected` (`reason:"model_returned_no_image"`). **El costo se registra igual** (Gemini cobra por intento).

---

## 4. Modelo de datos (Postgres + RLS)

**Supuesto raíz:** `tenant_id = organization_id (L2)`; RLS aísla por Organization; `User` global no es tenant. Todo lo hijo lleva `tenant_id` **denormalizado** → policy RLS de un solo predicado sin joins. Object storage guarda binarios; las tablas guardan **keys/URLs + content_hash**.

### 4.1 Entidades (26)

- **Catálogo/config (global, `tenant_id NULL` = plataforma):** `archetype_template`, `archetype_slot`, `design_token_set`, `rubric_check` (default).
- **Biblioteca:** `creator_profile`, `image_asset` (versionado), `asset_tag` + `image_asset_tag`, `text_asset`, `gen_image_job`.
- **Spec/composer:** `story_sequence` (versionado), `sequence_slot_binding`, `seed_build`.
- **Build/render:** `build` (inmutable, `content_hash`), `build_frame` (copy ya interpolado), `render_job`, `render_output`.
- **Board:** `review_board`, `board_variant`, `board_variant_frame`, `reviewer`, `ballot`, `ballot_vote`, `ballot_rubric_result`, `decision`.
- **Transversal:** `cost_event` (atómico, rollup por `cohort_id`), `audit_log` (append-only).

> El SQL completo de cada tabla (columnas, tipos, PK/FK, índices, enums) está en **`db/schema.sql`** (anexo de implementación). Aquí van las reglas que el dev debe respetar.

### 4.2 Reglas de modelado (no negociables)

1. **Relacional vs JSONB:** normaliza lo que se filtra/ordena/cuenta/FK; **JSONB** para presentación variable que se lee entera. Van JSONB: `template.stories`, `build_frame.resolved_copy` (las **cajas** top/bottom), `sequence.funnel` (varía por arquetipo — GIN index), `copy_overrides`/`overrides`/`design_override`/`render_override`/`photos`/`hook_image`, `pains`/`temario` (arrays ordenados verbatim), listas de display del board.
2. **Versionado inmutable + version:** `archetype_template`, `image_asset`, `text_asset`, `story_sequence` usan `(parent_id, version)`. Editar **no muta**: crea fila nueva `version+1`. El **`build` congela** `sequence_version`+`template_version`+`selection`+`content_hash` → render siempre reproducible. Un build rendered no se edita; se clona.
3. **Denormalización deliberada:** `tenant_id` redundante (RLS barato); `build_frame.resolved_copy` con placeholders **ya interpolados** (snapshot histórico fiel); `build.{sequence_version,template_version}` (qué versión vio el revisor).
4. **Soft-delete** (`deleted_at`) en editables; **append-only/hard** en `render_output`, `ballot`, `decision`, `cost_event`, `audit_log`.
5. **Métricas derivadas (no almacenadas):** consenso, tally, gate-status y rollups de costo se calculan por **VIEWS** (`v_board_tally`, `v_variant_gate_status`, `v_launch_cost`). El North Star real (DMs/keyword→leads) y la retención frame-by-frame viven en el plano de eventos de analytics (post-publicación), no en el studio — se unen por `keyword`+`cohort_id`. Respeta el `_QUE-MEDIR.md` ("sin umbrales fijos").
6. **RLS:** `enable + force row level security`; policy `USING (tenant_id = current_setting('app.tenant_id')::uuid)`. Catálogo: policy de lectura permite `tenant_id IS NULL` (plataforma) + propias. El worker pg-boss setea `SET app.tenant_id` del job — **no bypassa RLS**.

---

## 5. Máquina de estados del flujo (agregado = StorySequence)

```
 DRAFT ─validate─► VALIDATED ─compose─► COMPOSED ─submit_review─► IN_REVIEW ─decide(approve)─► APPROVED
   ▲ ▲                                                  │                                        │
   │ └──── validation_fail (loop: fix spec) ────────────┤ decide(iterate/reject) → DRAFT          │ render_final
   │                                                     ▼                                        ▼
   └──────────────── (cualquier estado pre-aprobación puede volver a DRAFT) ──────────  RENDERING_HI ─►(worker)─► READY
                                                                                              │ render_error      │ publish / export
                                                                                              ▼                   ▼
                                                                                        RENDER_FAILED      PUBLISHED | EXPORTED
   ARCHIVED ◄── (terminal, desde cualquier estado)
```

**Gates no negociables:**
- **Entrada a VALIDATED:** motor falla rápido (keyword, escasez por arquetipo, no fecha inventada, rangos, foto existe). Síncrono, barato. Sin esto no hay render.
- **Entrada a APPROVED:** doble condición — **consenso humano ≥60%** **+** los **3 gates duros** de la rúbrica (hook/cta/márgenes) en verde en la variante ganadora. Una variante con gate roto es *no-publicable* aunque gane el voto.
- **Lock de build en APPROVED:** el `build_id` ganador se congela; cambiar copy/imagen después fuerza loop-back a DRAFT (versiona). Preserva trazabilidad creative→resultado.

---

## 6. API REST (`/v1`, Bearer JWT con `tenant_id`+roles; RLS del token, nunca del payload)

```
# Config
GET  /v1/archetypes                                  # 8 templates activos (key, version, campos requeridos)
GET  /v1/archetypes/{key}?version=

# Biblioteca / assets
GET  /v1/creators · POST /v1/creators
POST /v1/campaigns · POST /v1/launches
GET  /v1/launches/{id}/library                       # hidratado (images+texts+slots+defaults)
POST /v1/assets (multipart→storage) · GET /v1/assets?creator_id&category&tag · DELETE /v1/assets/{id}
PUT  /v1/launches/{id}/text-assets/{slot} · PUT /v1/launches/{id}/defaults

# Spec / builds
POST /v1/builds · GET /v1/launches/{id}/builds · PUT /v1/builds/{id}
POST /v1/builds/{id}/materialize                     # build → spec render-ready
POST /v1/specs · GET /v1/specs/{id}
POST /v1/specs/{id}/validate                         # SYNC → {errors[], warnings[]} (no encola)

# Render
POST /v1/specs/{id}/preview                          # SYNC 1 frame ≤2.5s, scale=1, no persiste
POST /v1/renders                                     # ASYNC hi-res → 202 {job_id} | 200 si idempotente
GET  /v1/renders/{job_id} · GET /v1/renders?launch_id&status

# IA (Gemini)
POST /v1/ai/images/generate {prompt,aspect,tier:draft|final,n}   # 202 {ai_job_id}
POST /v1/ai/images/edit {input_asset_id,prompt,aspect}          # hook "antes"
GET  /v1/ai/jobs/{id}   # queued|running|succeeded|rejected{reason}|failed ; succeeded→{asset_id,url,cost}
GET  /v1/ai/usage?from&to                            # costo IA por tenant (billing)

# Board
POST /v1/boards {launch_id,board_kind,variants[],fixed_sequence[],rubric[],kpis[],suggestions[]}
GET  /v1/boards/{id}
POST /v1/boards/{id}/reviewers
PUT  /v1/boards/{id}/ballots/{reviewer_id} {votes:{variant_id:{status,checks{},notes}}}
POST /v1/boards/{id}/ballots/import                  # base64 legacy (compat offline) → merge
GET  /v1/boards/{id}/consensus                       # tally + ganador ≥60% + gates + desacuerdos
POST /v1/boards/{id}/decision {variant_id}           # cierra (rol coordinator)
GET  /v1/boards/{id}/decision/act                    # acta + fixes pendientes para el editor

# Tiempo real
GET  /v1/events                                      # SSE multiplexado por tenant (job.*)
POST /v1/webhooks {url,events[],secret}              # entrega firmada HMAC-SHA256 + retries
```

**Versionado API:** versión en path; aditivo sin bump; breaking → `/v2` con `Deprecation`/`Sunset`. Payloads con `schema_version` interno (=1 hoy).

---

## 7. Roles y permisos (RBAC) — RLS aísla `org_id`; RBAC aísla la *acción*

| Capability ↓ / Rol → | owner | estratega | media-buyer | editor | revisor | creador |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Ver specs/renders | ✓ | ✓ | ✓ | ✓ | ✓ | ✓(propios) |
| Crear/editar spec (DATO) | ✓ | ✓ | – | ✓ | – | ✓(propios) |
| Validar / componer / builds | ✓ | ✓ | – | ✓ | – | – |
| Render **draft** (baja) | ✓ | ✓ | ✓ | ✓ | – | – |
| Abrir review round | ✓ | ✓ | ✓ | ✓ | – | – |
| **Votar** (ballot/scorecard) | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| **Aprobar** (→APPROVED) | ✓ | ✓ | ✓ | – | – | – |
| Render **final** (hi-res, $) / **Publicar** | ✓ | ✓ | ✓ | – | – | – |
| Exportar bundle | ✓ | ✓ | ✓ | ✓ | ✓ | ✓(propios) |
| Editar templates (CONFIG) | **platform-admin only** | | | | | |
| Editar rúbrica (solo checks no-gate) | ✓ | ✓ | – | – | – | – |

**Principios:** separación de poderes (quien edita ≠ quien aprueba); render final + publish = únicas acciones con costo/irreversibilidad → solo owner/estratega/media-buyer (alinea con presupuesto); **templates y los 3 gates duros = invariantes de plataforma** (ningún tenant los degrada).

---

## 8. Versionado y migraciones (tres ejes independientes)

1. **Template version (config, semver):** el spec **pinea** `template_version` al validar; specs viejos renderizan con su versión pineada. Minor (placeholder opcional)=retrocompatible; major=nueva versión, upgrade explícito (no auto-migra).
2. **Spec revision (dato, append-only):** cada PATCH crea `story_sequence`/`story_spec_revision`. Render referencia `spec_json`+`template_version`+`engine_version` → reproducible bit a bit.
3. **Engine version (motor):** `render_job.engine_version` ata el PNG a la versión del worker (cambios en auto-fit/face-safe alteran pixeles → no comparar A/B entre versiones).
- **Migraciones de forma del JSON:** **lazy upcasters** en la app (`schema_version` interno; al leer transforma, persiste en el próximo write) — evita backfills masivos sobre jsonb. Columnas relacionales = DDL forward-only (Atlas/Prisma-migrate). Los 3 gates duros son invariante de schema validado en la app.

---

## 9. Roadmap MVP → v1 (con criterios de aceptación)

| Fase | Objetivo | Aceptación |
|---|---|---|
| **0 · Foundation** (must) | Motor como servicio con tenancy | Postgres+RLS, Identity adapter, 8 templates seed, Chromium worker + pg-boss, object storage. → POST spec mínimo → encola → PNG 2160×3840 en storage, content-hash, aislado por org |
| **1 · Spec+Validation+Draft** (must) → **MVP** | Loop draft→validar→render baja vía API | Spec CRUD + revisions; validador (reglas duras); state machine `DRAFT↔VALIDATED→COMPOSED` + render draft; asset refs. → inválido=422 con errores; válido=draft PNGs; revisiones auditables; `template_version` pineada |
| **2 · Review Board** (should) → **diferenciador** | Decisión multi-revisor con consenso+gates | Manifest builder, rúbrica 11pt+3 gates, ballots idempotentes, consenso ≥60%, acta. → 3 revisores votan→consenso; variante con gate roto=no-publicable aunque gane; acta con fixes; aprobar congela build |
| **3 · Composer/Permutaciones** (should) | Explorar imagen×texto sin pre-render | library.json upsert, permutaciones, builds, seed_builds, Hook Lab. → dado library.json devuelve N combos; replicable para otro creador duplicando library (cero hardcode) |
| **4 · AI Hooks** (should/later) | `hook_image.source=nb2\|edit` server-side | AI Gateway (flash/pro), `ai_provenance`+metering, flag "contenido AI". → source=edit: foto base→genera hook→enchufa→valida→render; costo en Billing |
| **5 · Publish/Export + Billing** (later) → **v1** | Cerrar loop hacia Distribution + cuotas | Bundle export, handoff event a Distribution, cuotas por org, rate-limit. → READY→PUBLISHED emite evento; render final bloqueado si excede cuota; reporte costo por launch |

---

## 10. No-funcionales

- **Auth/roles:** JWT (tenant_id+roles); RLS con `current_setting('app.tenant_id')` fijado por el gateway por conexión (defense-in-depth). Gate de "decisión" exige estratega/owner.
- **Rate-limit:** token-bucket Redis por tenant+ruta; preview-sync (caro) más estricto; IA con **cuota dura de gasto** (no solo req/s); render async limitado por profundidad de cola por tenant.
- **Observabilidad:** OpenTelemetry traces gateway→pgboss→worker (trace_id en payload del job). Métricas: `render_job_duration`, `pool_page_inflight`, `chromium_restarts`, `ai_cost_usd{tenant,model}`, `ai_reject_rate`, `queue_depth`. Logs con `tenant_id`+`job_id`.
- **Costos IA:** `ai_cost_events` por llamada (se cobra el intento aunque sea `rejected`); pre-check de cuota antes de encolar; draft vs final separados.
- **Storage/CDN:** layout content-addressed `tenant/{id}/…/{hash}.png`; CDN con signed URLs (TTL corto, binarios privados); thumbnails al subir (el `cover_uri` 380px del composer → thumbnail server-side); lifecycle (drafts/previews efímeros, finales retenidos).
- **Concurrencia worker:** 1 Browser + pool de N pages (N≈vCPUs 4–6); page crash→descartar+recrear; reciclar Browser cada K jobs/T min (anti-leak); escala horizontal = más réplicas (pg-boss reparte con visibility timeout).

---

## 11. Riesgos y decisiones abiertas (que el dev debe resolver)

1. **🔴 Política de Gemini sobre edición de personas reales** — el bloqueante #1. Verificar la Prohibited Use Policy oficial **antes** de comprometer el feature "editar foto del creador con IA". Puede forzar rediseño (consentimiento + fallback elegante ante rechazo), no un parche.
2. **Asset Library: ¿módulo compartido o servicio aparte?** Si más features creativas (meta-ad, carousel) usarán los assets → servicio compartido desde el día 1; si SFS es el único cliente al inicio → `asset_ref` local y extraer después. Riesgo: duplicar binarios / perder dedupe.
3. **Reproducibilidad vs evolución del motor:** pinear `engine_version` y nunca auto-re-render (ofrecer re-render explícito). Riesgo: A/B inválido si no se trackea.
4. **Migración de forma JSON:** lazy upcasters centralizados en un módulo (no dispersar la lógica).
5. **Concurrencia en el board:** optimistic locking por `current_revision`/`updated_at`; definir si los ballots van online (sugerido) o se mantiene export/import.
6. **¿Quién compone el manifest del board?** Auto-generar borrador desde los builds + permitir curaduría del estratega (variantes que iteran + fixed_sequence inferida de slots comunes).
7. **Cuotas IA y degradación:** ¿bloquear, degradar a flash, o cobrar overage si el org agota cuota a mitad de un round? Definir antes de Fase 4/5.
8. **Límite Distribution (scope creep):** la tentación de meter scheduling/comment-to-DM dentro de SFS rompe la reusabilidad. El handoff es un *publishable bundle* + un contrato de evento estable. **Mantenerlo afuera es la decisión arquitectónica más importante.**

---

## 12. Fuentes validadas (research, 2024-2026)

- Render: Satori README + limitaciones de CSS (vercel/satori, deepwiki); Puppeteer/Chromium en Lambda (AWS Architecture Blog); comparativas html2img.
- IA Gemini: pricing oficial `ai.google.dev/gemini-api/docs/pricing`, image-generation docs; restricción de personas (blog tercero — **verificar en policy oficial**).
- Multi-tenancy: PlanetScale (approaches to tenancy in Postgres), debugg.ai (RLS vs schemas vs DBs 2025), AWS (RLS multi-tenant).
- Colas: starterpick (Inngest vs BullMQ vs Trigger 2026), pkgpulse (BullMQ vs pg-boss), trigger.dev/vs/bullmq.

> Grados de certeza por decisión en §2. El único dato que el research **no** pudo fijar públicamente: el RPM exacto de los modelos de imagen Gemini (Google lo da per-project en AI Studio) — leerlo en el proyecto propio.

---

*Brief generado a partir del skill `afluence-story-funnel` (motor + 8 arquetipos + composer + board + biblioteca modular) ya construido y QA-validado. Los contratos JSON (spec-schema, library-schema, board-manifest-schema) y los scripts (`render.py`, `build_composer.py`, `build_board.py`, `edit_image_gemini.py`) son la implementación de referencia 1:1 de este diseño.*
