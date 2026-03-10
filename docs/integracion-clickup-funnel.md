# Integracion ClickUp + Nueva BU AI Factory Creators

Plan maestro para implementar la integracion con ClickUp y crear una nueva business unit (`AI Factory Creators`) respetando la estructura del monorepo.

---

## 1. Alcance y decisiones confirmadas

- Se crea una BU nueva: `afluence/ai-factory-creators`.
- La integracion ClickUp es **generica** (core/paquetes compartidos), pero la activacion y configuracion son **por BU**.
- No se usa `CLICKUP_LIST_ID` global: la configuracion se resuelve por `pipelineId`.
- El landing fuente a migrar es `docs/Landing page para Afluence/`.
- Se debe validar funcionamiento completo end-to-end.
- Estrategia confirmada para creación de task: **evento `pipeline_entry_created`** (core) + workflow por BU.
- Creación de task ClickUp: **solo inbound** y **solo BU habilitada**.
- Form parcial: **email obligatorio**. Si falta email: respuesta `200` con `skipped: true` + warning log.

---

## 2. Reglas de estructura del monorepo

Este plan sigue estas reglas del repo:

- Codigo especifico por BU vive en `apps/api/src/orgs/<org>/<bu>/`.
- Codigo reutilizable vive en `apps/api/src/core/` o `packages/`.
- Landings en `apps/web/src/app/(landings)/<org>/<bu>/<version>/page.tsx`.
- Configuracion de entorno centralizada en `packages/config/src/env.ts`.
- Cambios de schema en migraciones y luego `npm run gen-types`.

---

## 3. Arquitectura objetivo (multi-BU real)

### 3.1 Integracion generica

- `packages/clickup-client/` (nuevo)
- `apps/api/src/core/services/clickup.service.ts` (nuevo)
- `apps/api/src/core/engine/action-handlers/create-clickup-task.ts` (nuevo)
- `apps/api/src/core/engine/action-handlers/update-clickup-status.ts` (nuevo)

### 3.2 Configuracion por BU

Cada BU define en su `config.ts`:

```ts
clickup: {
  listIdEnvKey: 'PROJECT2_CLICKUP_LIST_ID',
  apiTokenEnvKey: 'PROJECT2_CLICKUP_API_TOKEN',
  stageToStatusMap: { ... },
}
```

`orgs/index.ts` construye un registry:

```ts
pipelineId -> ClickUpConfig
```

### 3.3 Resolucion de BU en runtime

El flujo usa `pipelineId` del evento:

```text
event.metadata.pipelineId
  -> clickUpConfigRegistry[pipelineId]
  -> listId/token (desde env keys de esa BU)
```

### 3.4 Responsabilidades core vs BU (ClickUp)

**Core (reutilizable):**
- Define y emite eventos del engine (incluido `pipeline_entry_created`).
- Implementa cliente/servicio ClickUp e idempotencia técnica (`clickup_task_id`, retries, logging).
- Expone action handlers (`create_clickup_task`, `update_clickup_status`).

**BU (configurable):**
- Decide si activa ClickUp o no.
- Define `stageToStatusMap` y variables `PROJECT2_*`.
- Define workflows que reaccionan a `pipeline_entry_created` y `stage_entered`.

---

## 4. Nueva BU: `AI Factory Creators`

Crear carpeta:

```text
apps/api/src/orgs/afluence/ai-factory-creators/
  config.ts
  routing.ts
  seed.ts
  sequences/
    index.ts
    llamada-agendada.ts
    agendar-llamar.ts
  workflows/
    index.ts
    auto-enroll.ts
    clickup-sync.ts
```

Registrar en:

- `apps/api/src/orgs/index.ts` (sequences + workflows + clickup registry)

---

## 5. Pipeline, stages y mapeo ClickUp

### 5.1 Estructura ClickUp

- **List** = "Sales Pipeline" (una sola lista para todos los deals).
- **Statuses** = estados del deal dentro de esa lista (no son Lists separadas).

El mapeo funnel ↔ ClickUp es: stage del pipeline → status de la List.

### 5.2 Flujo de deals acordado

| Origen | Condición | Stage ClickUp (status) |
|--------|-----------|-------------------------|
| **Outbound** | Vendedor crea manual | PROSPECTING |
| **Inbound** | Form parcial con datos mínimos | PRE-QUALIFIED LEAD |
| **Inbound** | Form completo + llamada agendada | MEETING SCHEDULE |

**Datos mínimos para crear deal parcial:** email obligatorio. Si no hay email, **no crear deal**.

**Mismo deal:** cuando el usuario completa el form parcial → se actualiza el deal existente (no se crea uno nuevo).

**Orden de stages:** PROSPECTING → PRE-QUALIFIED LEAD → MEETING SCHEDULE → OPPORTUNITY → PRD → QUOTE

### 5.3 Momento de guardado (form parcial)

Para maximizar deals con datos mínimos, guardar en dos momentos:

| Momento | Cuándo | Uso |
|---------|--------|-----|
| **onBlur** | Al salir del campo email | Captura cuando el usuario ya tiene el dato mínimo |
| **beforeunload** | Al cerrar/recargar la página | Captura abandonos con `sendBeacon` |

### 5.4 Deduplicación

- **Base:** email (normalizado: lowercase, trim).
- **Secundario:** teléfono normalizado para enriquecer merge y soporte operativo.
- **Adicional (opcional):** fingerprint de dispositivo para detectar posibles duplicados por typo o navegación repetida.

### 5.5 Restricción creación outbound en PROSPECTING

**Limitación ClickUp:** con una sola List "Sales Pipeline", los permisos son por List, no por status. No se puede restringir nativamente que los deals se creen solo en PROSPECTING.

**Alternativas:**
- Default status en PROSPECTING al crear task + proceso interno.
- Automation que mueva a PROSPECTING las tasks creadas en otro status (reactivo).
- Múltiples Lists (una por stage) si se requiere control por permisos — cambia el modelo actual.

### 5.6 Stages en seed (mapeo interno)

Definir en `seed.ts` (orden alineado con ClickUp):

1. `prospecting`
2. `pre_qualified_lead`
3. `meeting_schedule`
4. `opportunity`
5. `prd`
6. `quote`

### 5.7 Env vars esperadas

```env
PROJECT2_ORG_ID=
PROJECT2_PIPELINE_ID=
PROJECT2_STAGE_PROSPECTING=
PROJECT2_STAGE_PRE_QUALIFIED_LEAD=
PROJECT2_STAGE_MEETING_SCHEDULE=
PROJECT2_STAGE_OPPORTUNITY=
PROJECT2_STAGE_PRD=
PROJECT2_STAGE_QUOTE=
PROJECT2_CLICKUP_LIST_ID=
PROJECT2_CLICKUP_API_TOKEN=
```

### 5.8 Mapeo stage -> status en ClickUp

Se define en `config.ts` de la BU. Debe usar nombres exactos de status de la lista ClickUp (ej. `PROSPECTING`, `PRE-QUALIFIED LEAD`, `MEETING SCHEDULE`).

---

## 6. Ingestion multi-BU (bloqueador principal)

Estado actual: `ingestion.routes.ts` esta amarrado a BU1 (`business-unit-1/config` + `routing`).

### 6.1 Cambios necesarios

- Crear resolver de BU por `source` (o endpoint por BU; recomendado resolver por source para mantener `/api/ingest` unico).
- Mapa recomendado:
  - `landing-ai-factory-creators-v1` -> `afluence/ai-factory-creators`
  - `landing-bu1-*` -> `afluence/business-unit-1`
- El resolver debe devolver:
  - `organizationId`
  - `routingEngine`

**Routing AI Factory Creators** (en `routing.ts`):
- `form_type === 'partial'` + email → stage `pre_qualified_lead`
- `form_type === 'full'` + llamada agendada → stage `meeting_schedule`
- Outbound (creación manual) → stage `prospecting`

### 6.2 Fallback y validaciones

- Si `source` no esta mapeado: 400 con mensaje claro.
- **Form parcial:** si `form_type === 'partial'` y no hay email: no crear deal y responder `200` con `skipped: true` + warning log.
- Log de auditoria del source recibido.

---

## 7. Datos y migraciones

### 7.1 Migracion necesaria

```sql
ALTER TABLE marketing.lead_pipeline_entries
ADD COLUMN IF NOT EXISTS clickup_task_id varchar(255) NULL;
```

### 7.2 Tipos

- Regenerar tipos (`packages/db/src/types.ts`) con `npm run gen-types -w @marketing-funnel/api`.

---

## 8. Custom fields necesarios para routing

Agregar en `seed.ts` de la BU:

- `form_type` (full | partial | none)
- `landing_page`
- `source`
- `nicho`
- `facturacion`
- `que_construir`
- `inversion`
- `timing`

Nota: si el field no existe en `custom_field_definitions`, hoy no se persiste en `custom_field_values`.

---

## 9. Sequences para la nueva BU

### 9.0 Cómo se triggean las sequences (monorepo)

Las sequences **no van por stages directamente**. Se disparan por **workflows** que escuchan eventos (`stage_entered`) y filtran por `conditions.stageId`. Ejemplo:

```ts
trigger: { event: 'stage_entered', conditions: { stageId: IDS.stages.meeting_schedule } },
actions: [{ type: 'enroll_sequence', sequenceKey: 'ai-factory-creators-llamada-agendada' }],
```

Esto respeta la arquitectura del monorepo sin cambios.

### 9.1 `llamada-agendada`

Se triggea al entrar en stage `meeting_schedule`. Propuesta inicial:

1. WhatsApp confirmacion + link
2. wait (X horas/dias)
3. WhatsApp casos de exito
4. wait (Y horas)
5. WhatsApp confirmacion de asistencia

### 9.2 `agendar-llamar`

Se triggea al entrar en stage `pre_qualified_lead`. Propuesta inicial:

1. WhatsApp interes
2. ai_call (ElevenLabs)
3. wait 48h
4. WhatsApp recordatorio
5. wait 72h
6. ai_call (ElevenLabs)

---

## 10. Workflows para la nueva BU

### 10.1 Core funnel

- `stage_entered(pre_qualified_lead)` -> `enroll_sequence('ai-factory-creators-agendar-llamar')`
- `stage_entered(meeting_schedule)` -> `enroll_sequence('ai-factory-creators-llamada-agendada')`

### 10.2 ClickUp sync

- `stage_entered` -> `update_clickup_status`
- `create_clickup_task` al crear entry:
  - **opción confirmada:** emitir evento `pipeline_entry_created` (core) y enganchar workflow por BU.
  - `create_clickup_task` solo aplica en eventos inbound y BUs con ClickUp habilitado.

### 10.3 Opcional

- `stage_entered(opportunity)` u otros -> `notify` / webhook según necesidad

---

## 11. Landing migration (web)

### 11.1 Origen -> destino

- Origen: `docs/Landing page para Afluence/`
- Destino: `apps/web/src/app/(landings)/afluence/ai-factory-creators/v1/page.tsx`

### 11.2 Integracion de formulario

El form debe enviar a `/api/ingest`:

- `source: 'landing-ai-factory-creators-v1'`
- campos base (`firstName`, `lastName`, `email`, `phone`)
- `customFields.form_type` (`full`, `partial`, `none`)
- custom fields de negocio

**Validación datos mínimos (form parcial):** solo crear/actualizar deal si hay `email`. Si falta, no crear.

**Momento de guardado parcial:** implementar `onBlur` en email + `beforeunload` con `sendBeacon` para capturar abandonos.

**Respuesta cuando falta email en parcial:** `200` con `{ skipped: true, reason: 'missing_minimum_data' }` y warning log.

### 11.3 Dependencias a evaluar en `apps/web`

- `motion`
- `lucide-react`
- `@radix-ui/*`
- `tailwind-merge`, `clsx`
- `date-fns`, `react-day-picker`
- `embla-carousel-react`

---

## 12. Riesgos y controles

- **Idempotencia**: no crear task duplicada si ya existe `clickup_task_id`.
- **Deduplicación**: normalizar email (lowercase, trim) como llave principal; teléfono como apoyo y opcional fingerprint.
- **Reenvío parcial**: mismo email reutiliza entry activa en el mismo pipeline (no crear entry duplicada).
- **Errores ClickUp**: estrategia 429/5xx (retry) y 4xx (log + skip controlado).
- **Desalineacion funnel/status**: plan de reconciliacion manual/script.
- **Config invalida**: validar `stageToStatusMap` al boot.

---

## 13. Pruebas E2E obligatorias

1. Submit del landing creators (form completo).
2. Submit form parcial con solo email → deal creado en PRE-QUALIFIED LEAD.
3. Submit form parcial sin email → no crear deal y responder `200` con `skipped: true` + warning log.
4. Completar form parcial (mismo lead) → actualizar deal existente, no crear nuevo.
5. Reenvío parcial mismo email + pipeline → reutiliza entry activa (sin duplicado).
6. Resolver BU correcto por `source`.
7. Routing por `form_type` al stage correcto (partial → pre_qualified_lead, full + meeting → meeting_schedule).
8. Creación de task en lista ClickUp "Sales Pipeline" solo para inbound + BU habilitada.
9. Cambio de stage y update de status en ClickUp.
10. Enroll de sequence correcto segun stage.
11. Verificar que BU1 no recibe el lead (aislamiento multi-BU).

---

## 14. Plan de ejecucion

### Orden final de fases

0. Integración ClickUp base (obligatoria antes de crear la BU).
1. Nueva BU AI Factory Creators (API).
2. Landing creators (WEB).
3. Ingestion multi-BU + dedupe estable.
4. Hardening + salida a producción.

### Fase 0 - Integración ClickUp base (API core)

**Objetivo:** dejar el core preparado para crear/actualizar tasks de forma confiable e idempotente.

**Tareas:**
1. Crear `packages/clickup-client/` (wrapper API ClickUp).
2. Crear `apps/api/src/core/services/clickup.service.ts`.
3. Extender tipos del engine con evento `pipeline_entry_created`.
4. Emitir `pipeline_entry_created` al crear `lead_pipeline_entry`.
5. Crear action handlers:
   - `apps/api/src/core/engine/action-handlers/create-clickup-task.ts`
   - `apps/api/src/core/engine/action-handlers/update-clickup-status.ts`
6. Agregar migración `clickup_task_id` en `lead_pipeline_entries`.
7. Implementar estrategia confirmada de creación de task:
   - evento `pipeline_entry_created` en core + workflow en BU.
   - condicionar `create_clickup_task` a inbound + BU habilitada.
8. Implementar idempotencia:
   - si existe `clickup_task_id`, no crear task duplicada;
   - reintento controlado en 429/5xx;
   - log + skip en 4xx.

**Criterio de salida (DoD):**
- Se crea task en ClickUp para un entry nuevo.
- No se crean tasks duplicadas al reintentar.
- Cambio de stage actualiza status en ClickUp.

### Fase 1 - Nueva BU AI Factory Creators (API)

**Objetivo:** tener la BU funcional dentro de la arquitectura code-first del monorepo.

**Tareas:**
1. Crear carpeta BU: `config.ts`, `routing.ts`, `seed.ts`, `sequences/`, `workflows/`.
2. Definir y seedear 6 stages:
   `prospecting`, `pre_qualified_lead`, `meeting_schedule`, `opportunity`, `prd`, `quote`.
3. Definir custom fields necesarios para routing.
4. Configurar `PROJECT2_*` en `config.ts` + `stageToStatusMap`.
5. Registrar sequences/workflows en `apps/api/src/orgs/index.ts`.
6. Definir triggers de BU:
   - `pipeline_entry_created` -> `create_clickup_task`
   - `stage_entered` -> `update_clickup_status`
7. Definir triggers:
   - `stage_entered(pre_qualified_lead)` -> `enroll_sequence('ai-factory-creators-agendar-llamar')`
   - `stage_entered(meeting_schedule)` -> `enroll_sequence('ai-factory-creators-llamada-agendada')`

**Criterio de salida (DoD):**
- BU registrada y visible en runtime.
- Seed crea org/pipeline/stages/campos correctamente.
- Workflows y sequences de la BU cargan sin afectar BU1.

### Fase 2 - Landing creators (WEB)

**Objetivo:** capturar partial/full con contrato correcto hacia `/api/ingest`.

**Tareas:**
1. Migrar landing a `apps/web/src/app/(landings)/afluence/ai-factory-creators/v1/page.tsx`.
2. Conectar submit con:
   - `source: 'landing-ai-factory-creators-v1'`
   - `customFields.form_type` (`partial`/`full`)
   - custom fields de negocio.
3. Forzar email como mínimo para parcial (UI y submit).
4. Implementar guardado parcial:
   - `onBlur(email)`
   - `beforeunload` con `sendBeacon`.

**Criterio de salida (DoD):**
- Parcial con email guarda.
- Parcial sin email no crea deal.
- Full + llamada agendada llega con payload completo.

### Fase 3 - Ingestion multi-BU + dedupe estable

**Objetivo:** enrutar por BU sin romper BU1 y controlar duplicidad de leads/deals.

**Tareas:**
1. Implementar resolver BU por `source` en `/api/ingest`.
2. Validar/fallar explícito cuando `source` no esté mapeado.
3. Mantener email normalizado como llave de dedupe principal.
4. Si `partial` sin email: responder `200` con `skipped: true` + warning log.
5. Definir y aplicar regla anti-duplicado de `lead_pipeline_entries` por lead/pipeline (reusar entry activa).
6. Validar reglas de routing:
   - partial -> `pre_qualified_lead`
   - full + meeting -> `meeting_schedule`
   - outbound manual -> `prospecting`

**Criterio de salida (DoD):**
- Lead creators nunca cae en BU1.
- Reenvíos parciales no crean deals duplicados.
- El mismo lead evoluciona de parcial a completo sin duplicarse.

### Fase 4 - Hardening + salida a producción

**Objetivo:** asegurar operación estable y trazable en producción.

**Tareas:**
1. Ejecutar checklist E2E completo.
2. Reconciliación API ↔ ClickUp (muestreo de tasks/stages/status).
3. Instrumentar logs operativos de errores de sync.
4. Definir playbook operativo (reintentos, recuperación manual, soporte comercial).

**Criterio de salida (DoD):**
- E2E verde.
- Sync ClickUp estable por 3-5 días de pruebas.
- Equipo operativo con procedimiento de contingencia.

### Dependencias entre fases

- Fase 1 depende de Fase 0.
- Fase 2 puede avanzar en paralelo parcial, pero no cerrar sin Fase 3.
- Fase 3 depende de Fase 1 y de contrato de datos de Fase 2.
- Fase 4 depende de Fase 0-3 completas.

---

## 15. Criterios de aceptacion

- Nueva BU operativa sin afectar BU1.
- Leads de creators en pipeline creators.
- Tasks en ClickUp list de creators.
- Status sincronizados por stage.
- Sequences/workflows de creators ejecutando en cron/eventBus.
- Landing migrado y funcionando end-to-end.
