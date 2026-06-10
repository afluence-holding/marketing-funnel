# Capa de Integraciones / Fan-out — User Stories

**Estado:** 📝 Plan (rev. 2026-06-10 — análisis multi-agente + diseño SaaS modular + auditoría adversarial incorporada). Listo para revisión de negocio; implementación pendiente de go-ahead + contrato de Palti.
**Objetivo de negocio:** convertir el fan-out de integraciones (MailerLite, Palti, Hyros, Meta CAPI) en una **capa modular por organización**, de modo que **activar un creador nuevo sea aditivo** (un archivo de config + sus secretos), sin tocar el core ni a los creadores existentes — con la robustez para que **ningún registro/venta se pierda ni se duplique**.

**Brief de referencia:** [`docs/DI21-C2-DEV-Brief-Integraciones.md`](../../docs/DI21-C2-DEV-Brief-Integraciones.md) (caso DI21-C2 / German).

## Principio rector (prueba de aceptación)

> **Activar el creador N es 100% aditivo: el PR que lo agrega NO toca ni una línea de German ni del core — solo agrega su `integrations.ts` + sus env. Y ningún evento (registro/compra) se pierde ni se duplica, jamás (entrega exactamente una vez por destino, durable a reinicios).**

Si una historia no contribuye a esa frase, es un enabler técnico y vive en la DoD transversal.

**Premisa de dominio:** un evento de negocio (`registro` = lead creado · `compra` = pago confirmado) ocurre en la DB y se reparte (fan-out) a N destinos externos. Cada **creador (org/BU)** puede tener **su propia cuenta** en cada destino: su token de MailerLite, sus group IDs y field keys, su pixel/CAPI, su Hyros, su Palti. El **mapeo** (qué destinos, qué IDs) es definición → code-first; los **tokens** son secretos → env.

**Alcance:**
- ENTRA: dispatcher de fan-out por `orgKey/buKey`; connectors MailerLite / Palti / Hyros / Meta-CAPI (este último envolviendo lo existente); outbox durable con idempotencia + reintentos por cron; config code-first por creador; emisión de evento `compra` desde los webhooks y `registro` desde la ingesta.
- NO ENTRA (anti-overshoot): UI de admin para editar integraciones (es code-first, PR+deploy); connectors de proveedores no usados; cola/broker (Redis/SQS); embedded checkout (P2 del brief); webhook de asistencia al webinar (P2 opcional); motor de reglas/DSL configurable; secrets-manager dedicado (env sufijado alcanza para v0).

---

## Análisis de impacto (multi-agente, 2026-06-10)

> 4 agentes en paralelo: infra de eventos/fan-out · config per-org & secretos · APIs externas (MailerLite verificado en vivo por MCP) · diseño SaaS.

### Lo que YA existe y se reutiliza
- **Event bus + workflow engine** operativos (`core/engine/event-bus.ts`, `workflow-engine.ts`): escuchan wildcard `*`, ejecutan action handlers por tipo. Registries por BU agregados en `orgs/index.ts` (mismo patrón que `sequenceRegistry`, `whatsappGroupPoolRegistry`).
- **Ingesta de lead YA emite** `lead_created`/`lead_updated` al bus (`ingestion.service.ts:119`). Meta CAPI **Lead** ya se dispara inline en la ruta si la landing manda `tracking.meta.eventId`.
- **Webhooks de compra** (Whop/Hotmart) persisten en `marketing.purchases` con idempotencia durable (`UNIQUE(provider, external_id)` + `capi_sent_at`) y mandan Purchase CAPI — pero **NO emiten evento al bus** (gap a cerrar).
- **`meta-capi.service.ts`** ya implementado → el connector `meta-capi` es un thin wrapper, no se reescribe.
- **Cron scheduler** (`node-cron`) ya existe → el job de reintentos se registra ahí.
- **Patrón de secretos por org**: `process.env[product.pixelEnv]` con sufijo (`META_PIXEL_ID_GERMAN_ROZ` / `..._LUCAS_CON_LUCAS`) ya en uso (`whop-products.ts`, `whop-purchase.service.ts:hasCapiCredentials`).

### Lo que FALTA (el trabajo real)
- **No hay evento de compra en el bus** ni punto único de fan-out.
- **No hay outbox / delivery-log ni reintentos** — si MailerLite/Palti fallan, el lead/venta se pierde (el webhook ya terminó; el `Set` en memoria se va al reiniciar).
- **No existe integración con MailerLite / Hyros / Palti** (grep: cero referencias fuera de docs; solo el pixel de Hyros client-side).
- **El brief asume IDs/token de UNA cuenta** (la 2219743 de German) → hay que generalizar a resolución por creador.

### Verificado en vivo (MCP MailerLite, cuenta de German)
- Cuenta `2219743` ✓; grupos `189628566065907406` (Registrantes, 0 subs) y `189880387420292276` (Compradores, 0 subs) existen con esos nombres ✓; los 6 campos (`name`, `estado`, `fuente`, `fecha_registro`=DATE, `cohorte`, `tier_compra`) existen ✓.
- **Token = cuenta = creador.** Group IDs y field keys son **por-cuenta** (otra cuenta no los tiene). Upsert `POST /api/subscribers` es por email (idempotente); asignar a grupo dispara AUTO①; quitar de grupo es `DELETE /subscribers/{subscriber_id}/groups/{group_id}` (necesita el `subscriber_id`, no el email). Rate limit ~120 req/min **por cuenta** → throttle por token. NO tocar los grupos grandes preexistentes (`Desinflama 21`=2521 subs, etc.).
- **Hyros y Palti son [CONFIRM]**: Hyros = API key por creador + eventos lead/purchase (endpoint exacto a confirmar en su panel). **Palti = DESCONOCIDO**: no hay API pública estándar documentada — hay que conseguir el contrato (endpoint/auth/payload, push vs pull) antes de implementar. **Posible bloqueante de P0.**

---

## Decisión de arquitectura

### Capas (todo en `apps/api/src/core/integrations/`, agnóstico al creador)
```
 Webhook compra / Ingesta registro
        │  emit IntegrationEvent
        ▼
 dispatcher.dispatch(event)
   1. resuelve config del creador: integrationConfigRegistry[orgKey/buKey]
   2. escribe 1 fila por destino habilitado en marketing.integration_deliveries (pending)
   3. intento inline best-effort (no bloquea el webhook)
        │                                   ▲
        ▼                                   │ cron */1: reintenta pending/failed due
 connectorRegistry[target.connector].deliver(event, target, secrets)
   mailerlite | palti | hyros | meta-capi
```

### Dos dueños por concern (separación clave)
| Concern | Dónde | Por qué |
|---|---|---|
| **MAPEO** (qué destinos, group IDs, field keys, cohortValue, qué eventos) | **Código**: `orgs/<org>/<bu>/integrations.ts`, agregado en `orgs/index.ts → integrationConfigRegistry` | Es *definición* declarativa, no estado → mismo criterio que `code_first_automations` y `@marketing-funnel/catalog`. Un group ID es un puntero (como un `planId`), no un secreto. Code review obligado sobre IDs (un ID mal = leads al grupo equivocado). Agregar creador = un archivo + una línea de spread. |
| **SECRETOS** (tokens) | **env**, referenciados por `secretRef` con sufijo por org (`MAILERLITE_TOKEN_GERMAN_ROZ`, etc.) | El brief lo exige ("NUNCA en código"). El código guarda solo el *nombre* del env (`secretRef`), nunca el valor → seguro de commitear. Resuelto en `secrets.ts` vía `@marketing-funnel/config` (zod). |

### Idempotencia + reintentos: OUTBOX, no cola
Tabla `marketing.integration_deliveries` con `UNIQUE(connector, dedup_key)` (mismo patrón que `purchases`: `INSERT ON CONFLICT DO NOTHING` → el reenvío at-least-once del webhook **no duplica filas**, cada destino se entrega exactamente una vez). Cron `*/1` con `FOR UPDATE SKIP LOCKED` reintenta `pending`/`failed` due, backoff exponencial (1→2→4m… cap), `max_attempts` → `dead` (alertable). Errores 4xx de validación (email inválido) → `dead` directo; 429/5xx/timeout → `failed` reintentable. **Por qué outbox y no cola:** el repo ya rechazó colas (v0) y ya resolvió idempotencia durable con este patrón; cero dependencias nuevas; sobrevive a reinicios (el `Set` en memoria no). El webhook degrada sin throw (como `purchase-persistence`), nunca tumba el 200.

### Punto de disparo: llamada IMPERATIVA, no el eventBus (resuelto)
El dispatcher se invoca **imperativamente** justo después de `persistPurchase(...)` (webhook) y de `ingestLead(...)` (ruta de ingesta), envuelto en `try/catch que nunca throwea` (igual que `purchase-persistence`). **NO se cuelga del eventBus** porque: (1) el bus es un `EventEmitter` **síncrono**, fire-and-forget, no observable — los errores del listener no se propagan; para un invariante de "ningún evento se pierde jamás" eso es contradictorio; (2) **decisivo**: `fbp/fbc/event_id` del registro **no viven en el evento del bus** ni están persistidos — solo existen en `req.body.tracking.meta` en la ruta de ingesta; el path imperativo los tiene a mano, el bus obligaría a contaminar el `PipelineEvent` con PII de marketing; (3) no mezcla el dominio CRM (workflow engine) con el fan-out externo. La durabilidad la da el outbox (DB), no el bus.

### `dedup_key` del registro: `registro:lead:<lead.id>` (resuelto)
Se usa el **UUID del lead**, no `email+cohort`. Viable: la ingesta **persiste el lead antes** de cualquier dispatch (`ingestion.service.ts` retorna `lead` con id). Razones: el CRM ya deduplica leads por email-por-org → un re-registro reutiliza el mismo lead row, así que `lead.id` es la identidad de evento correcta; `email` es PII en un índice UNIQUE (peor privacidad). El caso "re-registro legítimo en otra cohorte" se maneja en el connector (upsert por email + `fields.cohorte` actualizado = estado deseado), no en el `dedup_key`. *(Matiz documentado: re-disparar AUTO① en re-registro a otra cohorte sería una excepción de producto que requeriría incluir cohorte en el dedup_key — no es el default.)*

### `Set` en memoria del webhook Whop: se mantiene (resuelto)
Como guarda de primer nivel intra-proceso (evita trabajo redundante antes de tocar DB). El outbox es la fuente de verdad de idempotencia durable; quitar el `Set` no aporta y reintroduce riesgo en reinicios.

### Identidad del creador (evita el nudo de identidad triple)
El dispatcher opera **solo sobre `orgKey/buKey`** (la identidad estable de código que ya usan `getBusinessUnitBinding`, el catalog y los pools). El outbox guarda `org_key`/`bu_key` **text** y NO referencia `business_units.id` (nullable, como `purchases`). Compra: el webhook ya resuelve `orgKey/buKey` por el catalog. Registro: la URL `POST /api/orgs/:orgKey/bus/:buKey/ingest` ya los lleva. El mapping canónico `orgKey/buKey ↔ UUID ↔ meta_ops slug` queda como decisión heredada de cohorts, **no bloquea** esta capa.

### Escala de secretos: env v0, tabla DB como upgrade path
Env sufijado por org alcanza para v0 (decenas de creadores; matchea el patrón existente; cero infra nueva). **Promover a `backoffice.integration_credential` (tabla cifrada + admin UI con RBAC + rotación sin redeploy)** solo cuando se cumplan las 3 condiciones — mismas que el doc de cohorts puso para `cohorts` DB-first: (1) negocio necesita rotar/editar credenciales sin deploy, (2) hay UI admin con RBAC, (3) se migra todo a la vez. Hasta entonces: env + `secretRef`.

### DDL (Fase B)
```sql
CREATE TABLE IF NOT EXISTS marketing.integration_deliveries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_key         text NOT NULL,
  bu_key          text NOT NULL,
  connector       text NOT NULL,                  -- mailerlite | palti | hyros | meta-capi
  event_type      text NOT NULL,                  -- registro | compra
  dedup_key       text NOT NULL,                  -- 'compra:whop:pay_123' | 'registro:lead:<uuid>'
  payload         jsonb NOT NULL,                 -- snapshot del evento
  status          text NOT NULL DEFAULT 'pending' -- pending | delivered | failed | dead
    CHECK (status IN ('pending','delivered','failed','dead')),
  attempts        int  NOT NULL DEFAULT 0,
  max_attempts    int  NOT NULL DEFAULT 8,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error      text,
  delivered_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connector, dedup_key)
);
CREATE INDEX IF NOT EXISTS idx_int_deliveries_due
  ON marketing.integration_deliveries (status, next_attempt_at)
  WHERE status IN ('pending','failed');
ALTER TABLE marketing.integration_deliveries ENABLE ROW LEVEL SECURITY;
```

---

## Convención
`Como <rol>, quiero <acción>, para <valor>` · **CE** = Criterio de Éxito · **V** = Validación.
**Roles:** Negocio (Nico) · Dev (Cristóbal) · Sistema · Comprador · Registrante · Marketing/Tracking · QA.

---

## ÉPICA A — Fan-out P0 del webinar: registrante → MailerLite + Palti (German)
**Valor:** desbloquea el camino crítico registro→email+WhatsApp.

**A1** — Como Sistema, quiero un `integration-dispatcher` que ante un evento resuelva los destinos habilitados de `orgKey/buKey` y entregue a cada connector, para tener un punto único de fan-out.
- **CE:** `dispatch(event)` lee `integrationConfigRegistry[org/bu]`, escribe una fila por destino en `integration_deliveries`, e intenta entrega inline; el webhook/ingesta **no se bloquea** por un destino lento (timeouts cortos, sin throw).
- **V:** test con config de fixture: un evento genera N filas (una por destino habilitado); un connector que tarda no demora la respuesta.

**A2** — Como Dev, quiero un connector MailerLite genérico (token+group+fields por config) con rate-limit por token, para no hardcodear IDs y no gatillar 429 en picos.
- **CE:** `mailerlite.deliver()` hace upsert `POST /api/subscribers` con `groups`/`fields` desde `target`, token desde `secretRef`; upsert por email → reenvío no duplica; un **rate-limiter por `secretRef` (token-bucket en memoria, ~120/min) compartido entre el intento inline y el cron** evita exceder el límite por cuenta; 429 → backoff respetando `Retry-After`.
- **V:** test con HTTP mockeado (200, 422, 429); simular pico (inline + cron sobre el mismo token) → no excede 120/min; grep confirma cero tokens literales.
> Hallazgo del auditor: el rate-limit es **por token/cuenta**; inline (A1) y cron (B2) comparten token → necesitan un limiter **compartido por `secretRef`**, no por call-site, o cascada de 429 en lanzamiento.

**A3** — Como Registrante, quiero entrar al grupo Registrantes al registrarme y disparar AUTO①, para recibir "¡Estás dentro!".
- **CE:** un registro de German → upsert al grupo `189628566065907406` con `fields {name, fuente, cohorte: 'di21-c2', fecha_registro}`; NO se manda `estado` (lo setea AUTO①).
- **V:** insertar 1 registrante de prueba → el grupo pasa de 0→1 y AUTO① se recibe (checklist del brief).

**A6 (nueva, 🔴 P0)** — Como Tracking, quiero que el dispatcher snapshotee `fbp/fbc/event_id` (+ utm/origen) en el `payload` del outbox en el momento del dispatch, para que el Lead/Purchase CAPI deduplique con el Pixel aun reintentado por cron.
- **CE:** el dispatch imperativo de `registro` toma `req.body.tracking.meta` (fbp, fbc, eventId) **directo del request** —no del evento del bus, que no los lleva— y los congela en `payload`; el connector `meta-capi` los usa como match keys + `event_id` compartido.
- **V:** un registro con fbp/fbc/eventId → la fila de outbox los contiene; el CAPI reintentado por cron sigue deduplicando con el Pixel (Events Manager).
> Hallazgo del auditor: hoy fbp/fbc/eventId **no se persisten** (solo viven en el request, el inline CAPI los descarta). Sin A6, el dedupe del Lead CAPI se rompe — es el hueco más serio del plan y la razón #2 para el disparo imperativo.

**A4** — Como Registrante, quiero llegar al bot de WhatsApp (Palti) con mi teléfono E.164, para recibir recordatorios del webinar. **🔴 FUERA DE P0 — bloqueada por el contrato de Palti (no hay API documentada). P0 se entrega sin Palti (A1/A2/A3/A5/A6).**
- **CE:** `palti.deliver()` pasa `{telefono}`+`{nombre}` al registrarse; teléfono validado E.164 (+51…); el contrato real de Palti (endpoint/auth/payload) queda definido.
- **V:** registro de prueba → entra al bot y recibe recordatorio (checklist del brief).

**A5** — Como Dev, quiero `german-roz/main/integrations.ts` con destinos+IDs+fieldKeys y `secretRef` a env, para que el mapeo viva en código y los tokens en env.
- **CE:** el archivo declara los 4 destinos con sus IDs/mapeos y `secretRef`; agregado en `orgs/index.ts`; cero secretos literales.
- **V:** boot valida la config (ver E2); `git diff` muestra solo mapeo, nunca tokens.

**Éxito A:** un registrante de prueba de German aterriza en MailerLite (0→1, AUTO①) y en Palti, vía el dispatcher genérico, sin IDs hardcodeados en el core.

---

## ÉPICA B — Idempotencia + reintentos durables
**Valor:** "un registro perdido = un lead/venta perdida"; sobrevive a reinicios y entregas at-least-once.

**B1** — Como Sistema, quiero `marketing.integration_deliveries` con `UNIQUE(connector, dedup_key)`, para idempotencia durable de fan-out.
- **CE:** DDL aplicada (aditiva/idempotente, vía `psql`), RLS, `gen-types` regenerado; reenvío del mismo evento no inserta fila nueva. **Política first-payload-wins documentada**: el `ON CONFLICT DO NOTHING` congela el primer `payload`; un reenvío del webhook con contenido corregido (p.ej. `value` ajustado) NO actualiza la fila → la corrección requiere replay manual (trade-off consciente por exactamente-una-vez).
- **V:** doble dispatch del mismo evento (igual y con contenido distinto) → una sola fila por destino, con el primer payload.

**B5 (nueva, 🟡 P2)** — Como Negocio, quiero retención/purga de filas `delivered` con PII y métricas de la cola, para no acumular PII indefinidamente ni quedar ciego ante atascos.
- **CE:** las filas `delivered` se purgan tras N días (cron); el `payload` guarda solo lo mínimo por connector (no PII de más); la RLS tiene política explícita (service-role la usa, pero documentar que `payload` lleva email/teléfono); métricas: tasa de entrega por connector/creador y edad del `pending` más viejo.
- **V:** filas `delivered` antiguas se purgan; `dead` con PII no se vuelca a logs (la DoD dice "sin PII"); query de lag funciona.
> Hallazgo del auditor: `ENABLE ROW LEVEL SECURITY` **sin políticas** no protege nada bajo service-role; el `payload jsonb` lleva email+teléfono en claro y crece para siempre.

**B2** — Como Sistema, quiero un cron `integration-delivery-retry` (`*/1`) con backoff exponencial, sin que reintente una fila que el intento inline aún está procesando.
- **CE:** filas `failed`/`pending` due se reintentan; backoff 1→2→4m… con cap; `max_attempts` → `dead`. **Anti-race inline↔cron**: al insertar, `next_attempt_at = now() + grace` (p.ej. 60s) para que el cron no tome la fila durante la ventana del intento inline; el cron usa `FOR UPDATE SKIP LOCKED` (inocuo hoy con single-instance, futureproofea multi-instancia).
- **V:** connector que falla 2 veces y luego acierta → entrega final ok; reloj simulado verifica backoff; un dispatch cuyo inline tarda no se duplica por el cron.
> Hallazgo del auditor: con "single deploy, one process", `SKIP LOCKED` no protege de nada hoy; el race real es **inline marca `delivered` mientras el cron relee la fila** → grace window en `next_attempt_at` lo resuelve.

**B3** — Como Negocio, quiero log de errores auditable y filas `dead` visibles, para no perder un lead en silencio.
- **CE:** cada fallo escribe `last_error`; `dead` es queryable/alertable; logs estructurados (`orgKey/buKey/connector/eventType/dedupKey/status/attempts`, sin PII sensible).
- **V:** forzar `max_attempts` → fila `dead` consultable; un script/endpoint re-encola `dead` tras arreglar el connector.

**B4** — Como Comprador, quiero que un connector caído no bloquee a los demás ni al webhook, para no perder ni demorar la conversión.
- **CE:** entrega por destino aislada (un fallo de Hyros no impide MailerLite); fallo de DB del outbox degrada como `purchase-persistence` (timeouts, nunca throw que tumbe el 200).
- **V:** simular Hyros 500 + DB lenta → MailerLite entrega, webhook responde <2s, las fallidas quedan en outbox.

**Éxito B:** reenvío de Whop + reinicio del API → cada destino entregado exactamente una vez; ningún destino caído pierde el evento (lo recupera el cron).

---

## ÉPICA C — Fan-out P1 de compra: Whop → MailerLite (compradores) + Palti + supresión + tier
**Valor:** cierra el camino compra→sistemas, reusando el `payment.succeeded` que ya persiste compras.

**C1** — Como Sistema, quiero emitir `IntegrationEvent{type:'compra'}` desde el webhook tras persistir la compra, para enganchar el fan-out sin bloquear el CAPI.
- **CE:** el dispatch se dispara con `orgKey/buKey/cohortCode/tier/value/email/phone` resueltos por el catalog; `dedupBase = 'whop:'+payment.id` (y análogo Hotmart con `transaction`).
- **V:** compra de prueba → filas de outbox para los destinos de compra del creador.

**C2** — Como Comprador, quiero quedar como {en Compradores, NO en Registrantes} en MailerLite sin importar el orden de los eventos, para no seguir en la secuencia de registro.
- **CE:** modelado como **reconciliación de estado deseado** (no dos operaciones imperativas dependientes del orden): el connector de compra hace upsert al `buyerGroupId` (resolviendo `subscriber_id` por GET-by-email si el upsert no lo trae) y `DELETE …/groups/{registrantGroupId}`; ausencia del sub o 404 = éxito; idempotente ante "comprador que se registra tarde" (un registro posterior no debe dejarlo atrapado en Registrantes).
- **V:** compra de prueba → Compradores +1, quitado de Registrantes; orden invertido (compra antes que registro) → estado final correcto; reintento no rompe.
> Hallazgo del auditor: el DELETE necesita `subscriber_id` (no email) y el orden de webhooks no está garantizado; tratarlo como estado deseado (no ops secuenciales) evita que un comprador quede atrapado.

**C3** — Como Negocio, quiero `tier_compra` según el precio pagado, para reporting de mix de precio.
- **CE:** el tier se resuelve del catalog (no se recalcula) — $67/$77/$87 por ventana — y se manda a MailerLite (`tier_compra`) + se guarda.
- **V:** compras en las 3 ventanas → `tier_compra` correcto en MailerLite y DB.

**C4** — Como Comprador, quiero Palti activado post-compra, para tener el canal oficial de consultas. **🔴 FUERA DE P0 — bloqueada por el contrato de Palti. La compra entrega MailerLite+tier+CAPI (C1/C2/C3/D) sin Palti.**
- **CE:** `palti.deliver()` dispara el flujo "comprador" con teléfono+datos de acceso al confirmar pago.
- **V:** compra de prueba → flujo comprador activado en Palti.

**Éxito C:** compra de prueba (Whop) → grupo Compradores +1, quitado de Registrantes, `tier_compra` correcto, Palti activado.

---

## ÉPICA D — Atribución por creador: Hyros + Meta CAPI
**Valor:** atribución de revenue para escalar paid; CAPI ya existe, se generaliza por creador.

**D1** — Como Tracking, quiero un connector Hyros con lead (registro) y purchase (compra) por creador, para cerrar el loop de atribución. *(Hyros = [CONFIRM] endpoint/schema.)*
- **CE:** evento lead con email+origen; purchase con `value` real, `order_id`, email; `secretRef` (API key) por creador.
- **V:** registro y compra de prueba → Hyros recibe ambos (validado en su panel).

**D2** — Como Tracking, quiero el connector `meta-capi` como wrapper de `meta-capi.service.ts` con Pixel/token por creador, para no reescribir atribución.
- **CE:** Lead en registro y Purchase en compra con `value`/`currency`/`order_id`/match keys (email, phone, fbp, fbc) y `event_id` **compartido con el Pixel** (dedupe); credenciales por env del creador (`hasCapiCredentials`); sin credenciales NO se marca enviado (recupera el cron).
- **V:** Events Manager muestra Lead + Purchase server-side deduplicados con el Pixel, valor correcto.

**D3** — Como Negocio, quiero validar que Hyros y Meta reciben ambos eventos antes de escalar paid, para no quemar presupuesto a ciegas.
- **CE:** checklist firmado: Hyros lead+purchase, CAPI Purchase con valor correcto y dedupe con Pixel.
- **V:** checklist del brief completo.

**Éxito D:** registro y compra de German emiten lead+purchase a Hyros y CAPI con credenciales del creador; dedupe verificado.

---

## ÉPICA E — Activar el creador N (la prueba del diseño)
**Valor:** demostrar la modularidad — el goal real.

**E1** — Como Negocio, quiero activar un 2º creador agregando solo su `integrations.ts` + env, para escalar sin tocar lo vivo.
- **CE:** un PR de creador ficticio **no toca ninguna línea** de German ni del core; sus eventos van a *sus* cuentas (sus group IDs, su token, su pixel).
- **V:** diff del PR revisado; eventos de prueba del creador 2 caen en sus destinos, no en los de German.

**E2** — Como Dev, quiero validación del registry al boot (connector inexistente, `secretRef` sin env, mapeo incompleto para mailerlite), para que un error de config falle temprano y claro.
- **CE:** config inválida falla al boot con mensaje accionable (mismo criterio que la validación del catalog); un destino mailerlite sin groupId, o un `secretRef` sin env, se detecta.
- **V:** fixtures inválidos fallan con mensaje claro; el válido bootea.

**E3 (nueva, 🟠 P1) — Bootstrap de la cuenta de un creador.** Como Dev, quiero un script idempotente que cree/verifique en la cuenta MailerLite (y Hyros/Palti) del creador nuevo los **grupos y field keys** que su `integrations.ts` declara, para que "activar el creador N" sea realmente aditivo.
- **CE:** dado un `integrations.ts`, el script crea los grupos faltantes y los custom fields faltantes (vía `create_group`/`create_field`), idempotente (no duplica); reporta lo que ya existía.
- **V:** correr el bootstrap contra una cuenta MailerLite limpia → grupos + campos creados; segunda corrida = no-op.
> Hallazgo del auditor: las US asumían que los 6 campos y 2 grupos existen — verificado **solo** para la cuenta de German. Una cuenta nueva no los tiene → el upsert con `fields {cohorte, tier_compra}` inexistentes falla/ignora. Sin E3, "100% aditivo" no se cumple (habría trabajo manual por creador).

**Éxito E:** dos creadores corren sobre el mismo dispatcher/connectors, cada uno con sus cuentas (provisionadas por E3), sin tocar el core al añadir el segundo.

---

## Definition of Done transversal (enablers — no son US)
- **Tests:** vitest sobre dispatcher, connectors (HTTP mockeado), resolución de config y validación; corren en CI (`.github/workflows/ci.yml`).
- **Logs estructurados** y filas `dead` alertables; sin PII sensible.
- **DB:** migración aditiva/idempotente vía `psql`, RLS, expuesta a PostgREST, `gen-types`.
- **Secrets:** `secretRef→env` validado por zod; grep en CI falla si hay un token literal en código.
- **No bloquear el webhook:** outbox degrada como `purchase-persistence`.
- **Replay:** script en `apps/admin/scripts/` o endpoint admin-token para re-encolar `dead` tras arreglar un connector.

## Decisiones pendientes (para el equipo — las del negocio/externas)
1. **Contrato de Palti** (🔴 BLOQUEANTE de A4/C4, ya sacadas de P0): el brief solo dice "credenciales Palti" — no hay API pública documentada. Conseguir endpoint/auth/payload y si es push (llamamos) o pull (consumen nuestro webhook). **P0 y el resto se entregan sin Palti.**
2. **Hyros** [CONFIRM]: endpoint/schema reales del panel del creador (para D1).
3. **fbp/fbc/event_id en la landing:** confirmar que la landing los captura y los manda en `tracking.meta` del request de ingesta (A6 los snapshotea ahí — pero la landing debe enviarlos).
4. **Matriz de errores reintentables vs permanentes** por connector; `max_attempts`/backoff cap; SLA para alertar `dead`.
5. **Horizonte de creadores para env v0:** confirmar que env sufijado alcanza (decenas), con `backoffice.integration_credential` como upgrade path (3 condiciones) cuando se necesite rotar/editar sin deploy.

## Resuelto (rev. 2026-06-10, auditoría adversarial)
- **Punto de disparo:** llamada **imperativa** desde webhook/ingesta (no eventBus) — el bus es síncrono no-observable y no carga fbp/fbc/event_id. Ver Decisión de arquitectura.
- **`dedup_key` del registro:** `registro:lead:<lead.id>` (el lead se persiste antes del dispatch).
- **`Set` en memoria de Whop:** se mantiene como guarda de primer nivel; el outbox es la verdad durable.
- **Palti fuera de P0:** A4/C4 ya no bloquean el lanzamiento.
- **5 huecos del auditor → US/CE nuevos:** A6 (persistir tracking), C2 (reconciliación de estado), A2 (rate-limit compartido), B2 (anti-race inline↔cron), B1 (first-payload-wins), B5 (PII/retención/métricas), E3 (bootstrap de cuenta).

## Referencias
| Recurso | Valor |
|---|---|
| MailerLite cuenta German | `2219743` |
| Grupo Registrantes | `189628566065907406` (DI21-C2-Registrantes-Jun2026) |
| Grupo Compradores | `189880387420292276` (DI21-C2-Compradores) |
| Campos custom | `name`, `estado` (lo setea AUTO①), `fuente`, `fecha_registro` (DATE), `cohorte`, `tier_compra` |
| API base | `https://connect.mailerlite.com/api` |
| Secretos (env, sufijo por org) | `MAILERLITE_TOKEN_*`, `HYROS_API_KEY_*`, `PALTI_*`, `META_PIXEL_ID_*`, `META_CAPI_TOKEN_*` |

## Archivos clave (al implementar)
- `apps/api/src/core/integrations/` (dispatcher, secrets, delivery-repository, connectors/) — NUEVO core agnóstico.
- `apps/api/src/orgs/<org>/<bu>/integrations.ts` + `orgs/index.ts` → `integrationConfigRegistry` — config por creador.
- `apps/api/src/core/services/whop-webhook.service.ts` / `hotmart-webhook.service.ts` — emitir evento `compra`.
- `apps/api/src/core/services/ingestion.service.ts` — punto del evento `registro`.
- `apps/api/src/core/services/meta-capi.service.ts` — a envolver por el connector `meta-capi` (no reescribir).
- `apps/api/src/core/cron/jobs/` — cron de reintentos.
- `packages/db/src/migrations/` — `integration_deliveries`.
