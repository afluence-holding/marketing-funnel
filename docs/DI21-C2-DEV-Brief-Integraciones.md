# DI21 C2 — Brief de Dev: Capa de Integraciones (fan-out)

**Para:** Nico · **De:** Cristóbal (marketing) · **Fecha:** 10 jun 2026
**Contexto:** Lanzamiento Desinflámate 21 Cohort 2 (Germán Roz). Webinar 10 jun · carrito 10–30 jun ($67→$77→$87) · reto 1 jul · HT $580.

---

## TL;DR — la idea central

**Tu base de datos es la fuente de verdad.** Tanto los **registrantes del webinar** como los **compradores (Whop)** ya llegan a tu DB. Lo único que falta es un **módulo de fan-out**: cuando ocurre un evento en la DB (`registro_creado`, `compra_confirmada`), ese módulo reparte la info a los sistemas externos por API.

```
                                   ┌─→ MailerLite (grupos + campos)
Registro / Compra → tu DB → [FAN-OUT]─→ Palti (bot WhatsApp)
                                   ├─→ Hyros (atribución)
                                   └─→ Meta Pixel + CAPI (eventos)
```

Un solo módulo, dos eventos de entrada (`registro`, `compra`), N destinos. Idempotente y con reintentos.

---

## P0 — Crítico para HOY (webinar 10 jun)

### 1. Fan-out registrante → MailerLite (grupo Registrantes)
Cuando se crea un registrante en la DB, llamar:

```
POST https://connect.mailerlite.com/api/subscribers
Authorization: Bearer {MAILERLITE_API_TOKEN}   // env, NUNCA en código
Content-Type: application/json
Accept: application/json

{
  "email": "{email}",
  "fields": {
    "name": "{nombre}",
    "fuente": "{manychat|landing|paid}",
    "cohorte": "di21-c2",
    "fecha_registro": "2026-06-10"        // YYYY-MM-DD (campo DATE)
  },
  "groups": ["189628566065907406"]         // DI21-C2-Registrantes-Jun2026
}
```
- Upsert por email (no duplica → seguro para reintentos).
- Al entrar al grupo, MailerLite dispara AUTO① "¡Estás dentro!" automáticamente.
- **Test:** insertar 1 registrante de prueba → el grupo debe pasar de 0 → 1.

### 2. Push registrante → Palti / bot de WhatsApp
Los recordatorios del webinar y el enlace de ingreso se mandan por WhatsApp (bot). El registrante necesita entrar al sistema del bot con su teléfono.
- Pasar `{telefono}` + `{nombre}` al bot/Palti al registrarse.
- Confirmar formato E.164 (+51...) para WhatsApp.

---

## P1 — Esta semana (antes / durante carrito)

### 3. Whop webhook → DB → fan-out comprador
Recibir `payment.succeeded` de Whop y, tras guardarlo en DB, hacer fan-out del comprador.

**3a. → MailerLite grupo Compradores** (misma llamada, otro grupo):
```
"groups": ["189880387420292276"],          // DI21-C2-Compradores
"fields": { "name": "...", "cohorte": "di21-c2", "tier_compra": "{67|77|87}" }
```

**3b. Supresión:** quitar al comprador del grupo Registrantes (para que no siga en S6):
```
DELETE https://connect.mailerlite.com/api/subscribers/{subscriber_id}/groups/189628566065907406
```
> Nota: la supresión de venta ya está cubierta a nivel de segmento (todos excluyen Compradores), pero quitarlo de Registrantes mantiene la data limpia.

### 4. Activar Palti al comprar
Al confirmar pago → activar el bot de WhatsApp (Palti) para ese comprador, que es el canal oficial de consultas post-compra.
- Disparar el flujo de "comprador" en Palti con `{telefono}` + datos de acceso.
- El email de onboarding/acceso lo manda tu otro sistema (no MailerLite). Asegurar que ese email **mencione estar atenta a Palti** (WhatsApp) como canal de comunicación.

### 5. `tier_compra` — detectar el precio pagado
Mapear qué precio pagó cada comprador según fecha/producto Whop:
- $67 = 10–16 jun · $77 = 17–23 jun · $87 = 24–30 jun.
- Guardar en DB + mandar a MailerLite (`tier_compra`) para reporting de mix de precio.

---

## P1 — Tracking / atribución (revenue, NO opcional)

### 6. Hyros — fuente de verdad de atribución
- Evento de **lead** al registrarse (con `email` + parámetros de origen).
- Evento de **purchase** al comprar (con valor real, `order_id`, email).
- Validar que Hyros recibe ambos antes de escalar paid.

### 7. Meta Pixel + CAPI (dual, deduplicado)
- **Lead** en registro · **Purchase** en compra.
- Server-side (CAPI) con: `value`, `currency`, `order_id`, match keys (email, phone, fbp, fbc), `event_id` compartido con el Pixel para **dedupe**.
- ⚠️ Pixel ID y CAPI token van por **env**, nunca en docs ni código.
- Whop es el checkout de esta cohorte → confirmar que el evento Purchase server-side se dispara con el valor correcto (no como el bug de Hotmart de cohorts pasadas).

---

## P2 — Más adelante (NO durante el pico)

### 8. Embedded checkout en el monorepo
- Para C2 se usa **Whop hosted** (oficial). La migración a checkout embebido en el monorepo se hace **después del pico**, no durante el lanzamiento (riesgo de romper conversión en vivo).

### 9. (Opcional) Evento de asistencia al webinar → no-show
- Si la plataforma del webinar permite webhook de asistencia, mandar `asistio=si|no` a la DB.
- Habilita la automatización de replay a no-shows (AUTO④). Si no, el replay se manda como campaña a quienes no clicaron el enlace de ingreso.

---

## IDs y referencias (rellenados)

| Recurso | Valor |
|---|---|
| MailerLite cuenta | 2219743 |
| Grupo Registrantes | `189628566065907406` (DI21-C2-Registrantes-Jun2026) |
| Grupo Compradores | `189880387420292276` (DI21-C2-Compradores) |
| Campos custom (keys) | `name`, `estado`, `fuente`, `fecha_registro` (DATE), `cohorte`, `tier_compra` |
| API MailerLite base | `https://connect.mailerlite.com/api` |
| `estado` | lo setea AUTO① al unirse a grupo — no mandar desde el fan-out |

## Secretos (env, NUNCA en código/doc)
`MAILERLITE_API_TOKEN` · `WHOP_WEBHOOK_SECRET` · `META_PIXEL_ID` · `META_CAPI_TOKEN` · `HYROS_API_KEY` · credenciales Palti.

## Requisitos no funcionales
- **Idempotencia** en todos los fan-out (upsert por email/order_id; reenvíos no duplican).
- **Reintentos** con backoff + **log de errores** (un registro perdido = un lead/venta perdida).
- **Cola/async** preferible para no bloquear el webhook de Whop.

---

## Checklist de aceptación
- [ ] Registrante de prueba → grupo Registrantes 0→1 + AUTO① recibido.
- [ ] Registrante → entra al bot WhatsApp (Palti) y recibe recordatorio.
- [ ] Compra de prueba (Whop) → grupo Compradores +1 + quitado de Registrantes.
- [ ] Compra → Palti activado para consultas.
- [ ] `tier_compra` correcto según fecha.
- [ ] Hyros recibe lead + purchase.
- [ ] Meta CAPI Purchase con valor correcto + dedupe con Pixel.
