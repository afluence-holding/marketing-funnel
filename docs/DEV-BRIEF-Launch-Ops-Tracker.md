# DEV BRIEF — Launch-Ops Tracker (Afluence)
### MVP para Desinflámate 21 · Cohort 2 · con agente IA (Claude) que lee y actualiza vía API/MCP

> **Para:** desarrollador (Nico) · **Owner de producto:** Cris · **Fecha límite dura:** MVP usable antes del webinar (10 jun); carrito hasta 30 jun.
> **Síntesis de:** 5 agentes paralelos (arquitectura, API/MCP, user stories, UX, seguridad) validados contra prácticas 2025–2026. Confianza global: **Alta**.

---

## 0. TL;DR

Reemplazar el checklist HTML estático (que pierde el estado al compartirse y no sincroniza entre personas) por un **tracker web compartido, en vivo y multi-usuario**, donde:
- el equipo (6 personas) marca tareas y todos ven el cambio al instante,
- **un agente IA (Claude) lee y ACTUALIZA el estado vía API/MCP** (el requisito estrella),
- todo queda auditado (quién/qué/cuándo, distinguiendo humano vs Claude),
- las dependencias impiden cerrar pasos en falso.

**Stack decidido:** Supabase (Postgres + Auth + Realtime + RLS) + Next.js (App Router) en Vercel + un **MCP server delgado** para que Claude se conecte. ~$45/mes. MVP shippeable en 2–4 días.

**Lo no-negociable (los 3 que cierran el 90% del riesgo):** (1) **RLS en TODAS las tablas desde la primera migración**; (2) **Claude con identidad y token propios, con scopes mínimos — NUNCA el `service_role` de Supabase, nunca pasando por encima de RLS**; (3) **audit log de toda escritura** (incl. la del agente).

---

## 1. Objetivo + el requisito estrella

**Problema:** el checklist actual usa localStorage → al compartir el HTML nace en blanco; no hay fuente única ni sync entre el equipo; Claude no puede actualizarlo programáticamente.

**Objetivo:** una fuente única de verdad del lanzamiento que (a) el equipo ve y edita en vivo, (b) persiste, (c) **Claude consulta y actualiza por API** ("marca esta tarea como hecha", "abre una tarea de fix", "dame la foto del avance"), dejando rastro.

**El requisito estrella (lo que pidió Cris):** *"que Claude se conecte vía API para ir actualizando lo que haya que actualizar."* → Se resuelve con un **MCP server** (tools de alto nivel) sobre una **REST API**, autenticado con un **service token propio de Claude** con permisos acotados. Detalle en §7–§8.

**Dato semilla:** 58 tareas en 6 fases (F0 Setup → F1 Llenar webinar → F2 Webinar+carrito → F3 Carrito → F4 Reto+HT → F5 Monitoreo+Post-launch). Cada tarea ya tiene: fase, título, owner(s), fecha, dependencias, estado, detalle (objetivo, pasos[], criterio de aceptación). El seed sale del HTML actual (`DI21-C2-Checklist.html`).

---

## 2. Personas
- **Cris — Operador/Director.** Ve todo, dirige, NO ejecuta tareas. Home = scorecard del lanzamiento. Único que crea/borra tareas y edita estructura.
- **Owners — Nico (dev/tracking), Mau (WhatsApp/reto/Whop), Germán (contenido/webinar/HT), Tomás (paid/email), Elba (mensajes WhatsApp).** Home = "Mis tareas". Editan estado/fecha/detalle, comentan.
- **Claude — agente IA (identidad de servicio `claude:launch-ops-agent`).** Lee estado, marca progreso, comenta y (con freno) crea tareas vía API/MCP. Todo atribuido a "Claude" y reversible.

---

## 3. Stack (decidido — no re-litigar)

| Capa | Elección | Por qué |
|---|---|---|
| Backend/DB | **Supabase** (Postgres + Auth + Realtime + Storage + RLS) | Data model relacional real (fases, dependencias, audit) + realtime gestionado + RLS multi-usuario nativo. Free/Pro sobra para 6 usuarios. |
| Frontend | **Next.js 14 (App Router)** en **Vercel** | Deploy en minutos, SSR + route handlers para la API, cliente Supabase JS para realtime. |
| Integración IA | **MCP server delgado** (Node/TS) sobre la REST API | Patrón canónico para que Claude/Cowork se conecte como connector. |

**Descartado y por qué:** Google Sheets/Notion/Airtable → cubren "ver en vivo" pero rompen con un agente IA que escribe con audit/dependencias/permisos (frágil, sin tipos, sin RLS). Firebase/Firestore → NoSQL hace torpes las dependencias y el audit relacional. *Confianza: Alta.*

---

## 4. Data model

**Enums (Postgres nativos):**
```sql
create type task_status as enum ('pendiente','en_progreso','hecho','bloqueada');
create type dep_type    as enum ('finish_to_start','soft');
create type member_role as enum ('director','editor','viewer');
```

**Tablas MVP (7):** `launch`, `phase`, `app_user`, `task`, `task_owner`, `dependency`, `status_history` (audit). **v1.1:** `comment`. **v2:** `kpi`.

Campos clave:
- **launch** — id, name ("DI21 Cohort 2"), client ("Germán Roz"), market, starts_on, ends_on. (1 fila; modelado como entidad para reusar en cohorts futuras.)
- **phase** — id, launch_id FK, code ("F0".."F5"), name, sort_order. UNIQUE(launch_id, code).
- **app_user** — id (= `auth.users.id`), display_name, handle, role (`director`=Cris, resto `editor`).
- **task** — id, launch_id, phase_id, code ("F2-03", estable para que humanos y Claude referencien sin ambigüedad), title, status (default `pendiente`), due_date, sort_order, **objective** (text), **steps** (jsonb `[{text,done}]`), **acceptance_criteria** (text), created_by, **updated_by**, **updated_by_agent** (bool, ¿lo movió Claude?), created_at, updated_at.
- **task_owner** — (task_id, user_id) PK, is_primary. (M:N — una tarea puede tener varios owners, ej. Nico+Tomás.)
- **dependency** — id, task_id, depends_on_task_id, dep_type. UNIQUE(task_id, depends_on) + CHECK(task_id≠depends_on). El front calcula "bloqueada" si alguna dependencia no está `hecho`.
- **status_history** (append-only, vía **trigger** `AFTER UPDATE ON task`) — id, task_id, field, old_value, new_value, changed_by, **changed_by_agent**, note, created_at. *Audit infalsificable: registre el cambio que venga de la UI, un script o el MCP.*

**ERD (resumen):** `launch` 1:N `phase`, `task`, (`kpi`); `task` 1:N `task_owner`, `status_history`, `dependency` (self-ref a `task`), `comment`; `app_user` referenciada por owners/audit; `app_user.id = auth.users.id`.

> Decisión: `steps` como jsonb dentro de la tarea (no tabla aparte) — a bajo volumen es más simple y suficiente. *Confianza: Alta.*

---

## 5. Realtime
- **Supabase Realtime → Postgres Changes sobre `task`**, suscripción filtrada por `launch_id`. Cualquier cambio (humano o Claude) propaga a todos los clientes sin refresh. Cuando Claude escribe vía MCP (server-side), el `UPDATE` dispara igual el evento → no necesita "avisar".
- **No escribir websockets propios.** Supabase ya es la capa gestionada.
- Matiz de escala (no muerde a 6 usuarios): Postgres Changes re-evalúa RLS por suscriptor; si algún día se abre a decenas de clientes, migrar a **Broadcast desde la DB** sin tocar el data model. *Confianza: Alta.*

---

## 6. Seguridad (lo más importante — consolidado)

### 6.1 RLS (no-negociable)
- **RLS habilitado en TODAS las tablas del schema público desde la primera migración.** Al crear tablas por SQL, RLS NO se activa solo (CVE-2025-48757: ~10% de apps shippearon tablas públicas por este olvido).
- Permisos para este equipo (simples): **lectura: todos ven todo** (equipo chico, transparencia). **Escritura: cualquier `editor`/`director`** edita estado/steps/due. **Estructura (crear/borrar tareas y fases): solo `director` (Cris).**
- Optimizaciones (costo cero, futuro-proof): usar `(select auth.uid())` no `auth.uid()`; **nunca** basar políticas en `user_metadata` (editable por el usuario → escalación), usar `app_metadata`/tabla de roles; indexar columnas usadas en políticas y FK (`task.launch_id`, FK de `task_owner`).

### 6.2 El agente Claude (la pieza de mayor riesgo)
- **Identidad propia, separada del login humano** (`claude:launch-ops-agent`). No reusa la sesión de nadie.
- **NUNCA usa el `service_role` key de Supabase** (bypassa RLS; jamás en cliente ni en agente). El agente entra por **un endpoint propio de Next.js (`/api/agent/*`)** protegido por un **token de servicio largo y aleatorio** (env var en Vercel) que internamente usa un **rol Postgres dedicado `agent_writer`** con RLS activo. → choke point único, auditable y **revocable al instante** (rotás la env var).
- **Scopes mínimos:** `tasks:read`, `status:write`, `notes:write` (+ `tasks:write` para crear). **Sin** acceso a `app_user`/auth ni borrado destructivo. La API devuelve `403` si falta scope.
- **Idempotencia** (header `Idempotency-Key` UUID v4, patrón Stripe): timeout → reintento → no duplica el cambio ni el comentario.
- **Optimistic locking** (`If-Match: version`): dos updates concurrentes no se pisan; el segundo recibe `409` y Claude relee antes de reintentar.
- **Rate limit** por token (ej. 120 req/min, `429` con `Retry-After`).
- **Camino v1:** token corto + rotación / OAuth 2.1 client-credentials. MVP: token estático rotable (deuda técnica documentada).

### 6.3 Audit trail (incluye al agente)
- Tabla append-only con `actor_type` (human/agent), `actor_id`, `action`, `entity`, `before`/`after`, `timestamp`, `idempotency_key`. Toda escritura de Claude pasa por la API → se loggea antes de tocar la tabla.
- Triggers Postgres para escrituras humanas críticas (estado, fecha) → audit sin depender de la app.
- **Por qué importa:** con un agente escribiendo en vivo durante un lanzamiento de ~$89K, "¿quién cambió esto y cuándo?" debe responderse en segundos. UI: badge "✦ actualizado por Claude" en cada tarea con `updated_by` que empiece por `claude:`.

### 6.4 Riesgo a vigilar
- **Prompt injection vía contenido de tareas/comentarios** (los ataques a agentes superan 90% de éxito en pruebas). Mitigación: scopes mínimos, **sin `delete` para el agente**, y **confirmación humana** en `create_task`/bulk grandes.

*Confianza: Alta (validado contra docs Supabase/Vercel jun-2025 + guías de auth de agentes IA 2025-26).*

---

## 7. API REST

**Base:** `/v1` · JSON · estados `pendiente|en_progreso|hecho|bloqueada` · fases `F0–F5` · toda mutación devuelve el recurso + `audit_id`.

| Método | Path | Para |
|---|---|---|
| GET | `/tasks?phase=&status=&owner=&due_before=&blocked=&q=&cursor=` | Listar con filtros combinables (AND), paginado por cursor |
| GET | `/tasks/{id}` | Detalle + comentarios + audit recientes |
| PATCH | `/tasks/{id}` (`Idempotency-Key`, `If-Match`) | **Actualizar estado/campos** (caso #1 de Claude). PATCH parcial. `409` si version no coincide |
| PATCH | `/tasks:bulk` | Bulk update → `207 Multi-Status` (por-ítem, un fallo no tumba el lote) |
| POST | `/tasks` (`Idempotency-Key`) | Crear tarea (valida dependencias) |
| GET | `/phases` · `/progress` | Agregados: % global, % por fase, bloqueadas, atrasadas, critical-path |
| POST | `/tasks/{id}/comments` | Comentar (`kind`: note/blocker/decision) |
| GET | `/tasks/{id}/audit` · `/audit?actor=&since=` | Historial |

Errores: `400/401/403/404/409/422/429` con `{error:{code,message,...}}`. `422` p.ej. si se intenta `hecho` con dependencia abierta.

Ejemplo PATCH (Claude marca hecho con nota auditable):
```http
PATCH /v1/tasks/tsk_0F2A19
Idempotency-Key: 5f3c8a2e-...
If-Match: 7
{ "status": "hecho", "note": "Pixel server-side validado: Purchase con value+order_id (compra #239442)." }
```

---

## 8. Integración Claude = MCP server delgado

**Principio (consenso 2025):** el MCP NO espeja 1:1 los endpoints (eso infla el contexto y rompe al agente). Es un **adapter delgado con tools por intención**; la lógica vive en la REST API.

**Flujo:** Usuario en Cowork → Claude elige tool → MCP server (inyecta `Authorization: Bearer <service token>`, genera `Idempotency-Key`, añade `If-Match`) → `HTTPS` a la REST API → Postgres `UPDATE` + `INSERT audit` → Realtime propaga a todos → respuesta resumida sube a Claude.

**7 MCP tools (con JSON schema en el repo):**
- `list_tasks(phase?, status?, owner?, due_before?, blocked?, q?, limit?)` — lista filtrada.
- `get_task(id)` — detalle + comentarios + dependencias.
- `update_task_status(id, status, progress_pct?, note?)` — el caso #1. Idempotente, audit.
- `bulk_update_status(updates[])` — varias de golpe (máx 50).
- `add_comment(id, body, kind?)`.
- `create_task(phase, title, owners?, due_date?, depends_on?, detail?)` — **pide confirmación humana** (acción sensible).
- `get_progress()` — foto agregada en 1 sola llamada (lo que Claude usa para un standup sin barrer 58 tareas).

> **No** exponer `delete_task` al agente — borrar es humano. *Confianza: Alta.*

---

## 9. Frontend / UX

**Marca:** fondo blanco/claro, acento `#FF5E2B`, Urbanist, look app limpio. **Mobile-first obligatorio** (el equipo opera desde el cel).

**Vistas MVP:**
- **V1 · Checklist por fase (home):** header sticky con progreso total + countdown a hito; 6 fases colapsables (mini-barra `x/y`); fila de tarea = checkbox (update optimista) + título + chip de owner + fecha relativa (roja si vencida) + candado si bloqueada (no checkeable hasta cerrar dependencia) + **badge IA si Claude la tocó** + chevron a detalle. Done se atenúa, no se oculta.
- **V2 · Filtro por responsable:** chips `Míos` (default) · `Todos` · [persona]. Persiste.
- **V3 · Detalle de tarea** (bottom sheet en mobile): objetivo/pasos/criterio + dependencias + mini-timeline de actividad (con entradas de Claude marcadas) + acciones (marcar, reasignar, comentar).
- **V4 · Scorecard del lanzamiento** (tab 2, home de Cris): cards grandes — registros, show-up, ventas por tramo ($67/$77/$87), ROAS/MER, % HT, avance operativo. En MVP los KPIs son **input manual o feed de Claude** (campo editable + "actualizado por Claude hace 5min"); integraciones de datos = post-MVP.

**Realtime UX:** update optimista + snapshot para rollback + toast en error ("No se pudo guardar. [Reintentar]"); highlight suave (naranja para humano, color IA para Claude) en cambios entrantes; toast discreto si el cambio es en otra fase; **avatar stack + status dot** (presencia "3 en línea", sin live cursors en MVP); conflicto mismo-campo = **last-write-wins + aviso** al perdedor; **cola offline** (no perder cambios en mala señal — crítico en mobile).

**Por rol:** Owner entra a "Mis tareas" ("Tienes 3 hoy · 1 vencida"); Cris entra al Scorecard con toggle a "Todos".

**Estados:** skeleton en carga (no spinner); empties con CTA; banner "sin conexión, se guardará al reconectar".

**Post-MVP:** Kanban por estado (V5), timeline/calendario (V6), live cursors.

---

## 10. User stories (backlog)

**MVP (20 stories — el tracker vivo, multi-owner, con Claude con rastro y sin cerrar pasos en falso):**
- **Datos:** seed de 6 fases + 58 tareas con campos estructurados; 4 estados estándar.
- **Auth/roles:** login (magic link); 2 roles (Operador/Owner); **identidad de servicio de Claude** (todo lo suyo atribuido a "Claude").
- **Tareas:** tablero por fase; marcar estado (1 tap, optimista); editar fecha/owner/detalle; **"Mis tareas"**.
- **Filtros:** por owner/fase/estado combinables.
- **Dependencias:** declarar "depende de / bloquea a"; **bloquear el cierre si hay dependencias abiertas** (override solo Operador, queda en audit).
- **Avance:** % por fase y total en vivo.
- **Comentarios:** comentar por tarea (incl. Claude).
- **Audit:** log por tarea (antes→después, autor, hora); **distinguir acciones de Claude** con nota de contexto.
- **Claude API:** Claude **lee** estado; Claude **actualiza** estado (mismas reglas de bloqueo que un humano, queda como "Claude" + nota).
- **Notificaciones:** aviso de asignación/cambio de fecha.
- **Mobile:** tablero + marcar + comentar usable desde el cel.

**v1 (16):** crear/borrar tareas ad-hoc; filtros rápidos (bloqueadas/vencidas/hoy) + búsqueda; aviso al desbloquear + marcar bloqueada manual; scorecard avanzado + fechas críticas; @menciones; feed de actividad global; Claude crea tareas / comenta-reporta / **límites de acciones sensibles (aprobación humana para borrar/forzar/crear)**; alertas al Operador + recordatorios de vencimiento + push móvil.

**v2 (8):** invitado read-only (Germán socio); alerta de dependencia en riesgo; estado por owner; resolver hilos; export CSV; resumen diario de Claude; preferencias/digest; dashboard móvil del Operador.

> Decisión de PM (tomada por defecto): los **límites de acciones sensibles de Claude** (US-8.5) son prioridad alta aunque sean v1 — dejar a un agente borrar/forzar dependencias sin freno en un lanzamiento con dinero en juego es el error que no quieres descubrir en producción. **MVP: Claude lee, marca progreso y comenta; borrar/forzar entra con freno de mano.**

*(El backlog completo con criterios Given/When/Then por story está en el anexo del repo.)*

---

## 11. NFR + Deploy + Costo
- **Performance:** 6 usuarios, bajo volumen → el cuello nunca es carga, es RLS mal indexado. Targets: lecturas <300ms, escrituras del agente <1s.
- **Backups:** Supabase **Pro** = backups diarios (7d) + PITR. Para un sistema vivo durante un lanzamiento de ~$89K, el upgrade ($25/mes) se justifica solo por esto. (Free tier = `pg_dump` manual diario 10–30 jun.)
- **Observabilidad:** logs Supabase + Vercel + el `audit_log` como observabilidad de negocio (vista "últimas 50 acciones"). v1: alerta si el agente falla N escrituras.
- **Ambientes:** 2 proyectos/keys (dev/prod), 2 deploys Vercel, **migraciones versionadas** (RLS vive en migraciones — prod reproducible).
- **Costo realista:** **Vercel Pro $20 + Supabase Pro $25 + dominio ~$2 ≈ $45–47/mes.** (Vercel Hobby es no-comercial → requiere Pro.) Recomendación: arrancar en Pro desde día 1; el ahorro de $45 no vale perder estado el día del webinar.

---

## 12. Roadmap

**MVP (2–4 días, usable para ESTE lanzamiento):**
1. Supabase: tablas core + **RLS en todas** + rol `agent_writer` + seed de las 58 tareas (~0.5d).
2. Auth: magic link + allowlist de 6 emails (~0.5d).
3. Next.js UI: tablero por fase + "Mis tareas" + detalle + edición + realtime optimista (~1.5d).
4. API `/api/agent/*` + REST core + token + scope + audit (~0.5d).
5. Deploy prod (Vercel + Supabase Pro + env vars) (~0.5d).
6. MCP server delgado (7 tools) conectado a la API (~0.5d).

**Cortes de emergencia si aprieta:** solo magic link (sin OAuth); UI read-only para humanos + escritura del agente; backups manuales el día 1. **Nunca cortable:** RLS, separación del agent token, audit log.

**v1 (durante el carrito 11–30 jun):** rotación/expiración del token; rate limiting + alertas; roles refinados + vista de audit en UI; dependencias avanzadas; scorecard avanzado; notificaciones completas.

**v2 (post 30 jun):** identidad de máquina sin secreto estático (workload identity / token exchange); MCP server con OAuth 2.1 (spec MCP 2025-11-05); templatizar para multi-launch (reusar en cada cohort y otros clientes).

---

## 13. Definición de "listo" (MVP)
- [ ] Las 58 tareas/6 fases cargadas, visibles y editables en vivo por los 6.
- [ ] RLS activo en todas las tablas; `service_role` jamás expuesto.
- [ ] Claude lee (`get_progress`/`list_tasks`) y actualiza estado (`update_task_status`) vía MCP, con audit que lo marca como "Claude".
- [ ] No se puede cerrar una tarea con dependencias abiertas (salvo override de Cris, auditado).
- [ ] Mobile usable; cambios sobreviven mala señal (cola offline).
- [ ] Deploy en prod con env vars separadas y backups activos.

---

*Brief sintetizado de 5 agentes paralelos con validación 2025–2026 (Supabase RLS/Realtime, MCP server patterns, auth de agentes IA, idempotencia Stripe, optimistic UI). Fuentes completas en los reportes de cada agente. Confianza: Alta en stack/seguridad/API; Media en estimaciones de esfuerzo (dependen de la velocidad del dev con Next/Supabase).*
