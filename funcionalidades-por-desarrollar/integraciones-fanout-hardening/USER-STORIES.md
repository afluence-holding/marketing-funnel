# Integraciones / Fan-out — Hardening & Escala a N creadores — User Stories

**Estado:** 📝 Plan
**Objetivo de negocio:** llevar la capa de fan-out (ya en producción para German,
ver [`../integraciones-fanout/`](../integraciones-fanout/USER-STORIES.md)) de
"funciona para 1 creador" a "se activa un creador N sin trabajo manual y se opera
con confianza ante fallos". Todo lo de acá es **no bloqueante** para German hoy.
**Alcance:** bootstrap de cuentas, replay operativo, Hyros real, robustez de
reintentos, guardas de CI. **NO entra:** Palti / bot de WhatsApp (otro sistema);
migrar secretos a DB (queda como upgrade path, no se hace hasta necesitar rotación
sin deploy).

**Convención:**
`Como <rol>, quiero <acción>, para <valor>` · **CE** = Criterio de Éxito · **V** = Validación.
**Roles:** Dev · Operaciones · Sistema · Negocio.

**Disparador:** atacar cuando llegue el **segundo creador concreto** (FASE 1) o
ante el **primer incidente real** (FASE 2). Antes de eso, construirlo es overshoot.

---

## FASE 1 — Activar el creador N sin trabajo manual
**Objetivo:** que "agregar un creador" sea de verdad aditivo de punta a punta,
incluyendo provisionar su cuenta MailerLite.

**US-1.1 (E3) — Bootstrap idempotente de la cuenta del creador.** Como Dev, quiero
un script que, dado un `integrations.ts`, cree/verifique en la cuenta MailerLite del
creador los **grupos** y **custom fields** que declara, para que activar el creador
N no requiera clics manuales ni asumir que ya existen.
- **CE:** dado un `integrations.ts` + token de la cuenta, el script crea los grupos
  faltantes (`create_group`) y los fields faltantes (`create_field`, respetando el
  tipo — p.ej. `fecha_registro` DATE); es idempotente (2ª corrida = no-op) y reporta
  lo preexistente. Sin él, un upsert con `fields {cohorte, tier_compra}` inexistentes
  falla/ignora en una cuenta nueva.
- **V:** correr contra una cuenta MailerLite limpia → grupos + campos creados; 2ª
  corrida no duplica. Ubicación: `apps/admin/scripts/` o `apps/api/scripts/`.

**US-1.2 — Verificación de token ↔ cuenta correcta.** Como Dev, quiero que el
bootstrap (o un `--check`) confirme que el token apunta a la cuenta esperada antes
de escribir, para no crear grupos en la cuenta equivocada.
- **CE:** el script lista los grupos del token y exige confirmación/*match* con lo
  declarado antes de crear nada (el `sub` del JWT es user id, no account id — no
  sirve para validar cuenta).
- **V:** con un token de otra cuenta, el script aborta sin escribir.

**Validación de FASE 1:** activar un creador 2 de prueba end-to-end usando solo el
runbook + bootstrap, sin tocar código de German ni del core.
**Éxito de FASE 1:** dos creadores corriendo sobre el mismo dispatcher/connectors,
cada uno con sus cuentas, alta 100% aditiva.

---

## FASE 2 — Operar con confianza ante fallos
**Objetivo:** recuperarse de entregas muertas y de connectors caídos sin perder datos.

**US-2.1 (B3) — Replay de entregas `dead`.** Como Operaciones, quiero re-encolar
filas `dead` tras arreglar un connector, para no perder un registro/venta por una
caída transitoria que agotó los reintentos.
- **CE:** un script (`apps/admin/scripts/`) o endpoint admin-token re-pone a
  `pending` (con `attempts=0`, `next_attempt_at=now`) las filas `dead` filtradas por
  `(org, bu, connector, rango de fechas)`; idempotente; loguea cuántas reencoló.
- **V:** marcar una fila `dead` a mano → correr replay → el cron la entrega → queda
  `delivered`.

**US-2.2 (alertas) — Visibilidad de `dead`.** Como Operaciones, quiero enterarme
cuando una entrega llega a `dead`, para actuar antes de que el creador lo note.
- **CE:** una fila `dead` dispara una señal accionable (log estructurado alertable o
  notificación); definir SLA de revisión.
- **V:** forzar un `dead` → llega la señal.

**Validación de FASE 2:** un connector caído + recuperado no pierde ningún evento
tras el replay.
**Éxito de FASE 2:** cero pérdidas silenciosas; toda `dead` es visible y recuperable.

---

## FASE 3 — Robustez de connectors
**Objetivo:** afinar el comportamiento ante límites/errores de cada proveedor.

**US-3.1 (A2) — Respetar `Retry-After` en 429.** Como Sistema, quiero que un 429 de
MailerLite/Hyros use el `Retry-After` del proveedor en vez del backoff genérico,
para no martillar ni esperar de más.
- **CE:** ante 429 con `Retry-After`, `next_attempt_at` honra ese valor; sin header,
  cae al backoff exponencial actual.
- **V:** mock de 429 con `Retry-After: 30` → la fila se reprograma ~30s.

**US-3.2 (D1) — Hyros endpoint real [CONFIRM].** Como Dev, quiero el endpoint/schema
reales de Hyros del panel del creador, para que el connector `hyros` (hoy stub)
entregue de verdad.
- **CE:** el connector `hyros` postea registro/compra al endpoint confirmado con el
  schema correcto; errores reintetables vs permanentes mapeados.
- **V:** evento de prueba aparece en el panel de Hyros del creador.
- ⚠️ **Backfill al activar:** los no-op previos (sin token/stub) quedaron `delivered`
  en el outbox; activar Hyros requiere un backfill para esos registros/ventas.

**Validación de FASE 3:** suite de connectors cubre 429-con-Retry-After y el happy
path real de Hyros.
**Éxito de FASE 3:** connectors resilientes a rate-limits y Hyros entregando.

---

## FASE 4 — Guardas de CI / seguridad
**Objetivo:** que el repo impida regresiones de seguridad de la capa.

**US-4.1 — Grep de token-literal en CI.** Como Dev, quiero que CI falle si alguien
mete un token de integración literal en código (en vez de `secretRef`), para que el
patrón secreto-en-env no se rompa por descuido.
- **CE:** un patrón de token (p.ej. JWT/clave larga) en `apps/**` o `packages/**`
  rompe el build, igual que el lockdown grep del catalog.
- **V:** PR con un token de prueba hardcodeado → CI rojo.

**Validación de FASE 4:** intento de hardcodear un secreto → bloqueado por CI.
**Éxito de FASE 4:** imposible mergear un secreto literal.

---

## Decisiones pendientes (negocio/externas)
1. **Hyros** [CONFIRM]: endpoint/schema reales del panel del creador (US-3.2).
2. **Matriz de errores** reintentables vs permanentes por connector; `max_attempts`,
   cap de backoff, SLA para alertar `dead` (US-2.2).
3. **Horizonte de creadores para env v0:** confirmar que el env sufijado alcanza
   (decenas) antes de considerar `backoffice.integration_credential` como upgrade
   path (rotación/edición sin deploy).
4. **fbp/fbc/event_id en la landing:** confirmar que la landing los manda en
   `tracking.meta` del request de ingesta (relevante si se activa `meta-capi` en el
   fan-out de un creador sin CAPI inline).

## Referencia
Feature base (ya en producción): [`../integraciones-fanout/USER-STORIES.md`](../integraciones-fanout/USER-STORIES.md) ·
Runbook de alta: [`../integraciones-fanout/ONBOARDING-CREADOR.md`](../integraciones-fanout/ONBOARDING-CREADOR.md)
