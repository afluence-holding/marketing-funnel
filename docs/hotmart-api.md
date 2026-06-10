# Hotmart API — Guía de uso (cuenta Afluence / German Roz)

**Fecha:** 2026-06-10 · **Fuentes:** documentación oficial (developers.hotmart.com) + verificación empírica contra la cuenta real (producer `CRISTOBAL SANTANDER`, ucode `16579423-…`).
Cada afirmación marcada **[verificado]** fue probada con llamadas reales; **[docs]** viene de la documentación oficial; **[pendiente]** no se pudo confirmar (el WAF del sitio de docs bloquea fetchers — reintentables).

---

## 1. Credenciales y autenticación (OAuth 2.0)

**[docs]** La API usa OAuth 2.0 con `access_token`. Las credenciales se crean en el panel: **Herramientas → Credenciales (Developer Tools)** → nombre → tipo **producción** o **sandbox** (checkbox al crear; el tipo NO se puede cambiar después — hay que crear otra credencial). Genera: `Client ID`, `Client Secret` y `Basic` (= base64 de `client_id:client_secret`).

**Dónde viven las nuestras:** `.env.local` raíz (NUNCA commitear):
```
HOTMART_CLIENT_ID=…
HOTMART_CLIENT_SECRET=…
HOTMART_BASIC=…                    # sin el prefijo "Basic "
HOTMART_HOTTOK_GERMAN_ROZ=…        # token del WEBHOOK (no sirve para la API REST)
```
⚠️ Para la Fase 3 (webhook) replicar `HOTMART_HOTTOK_GERMAN_ROZ` en las env vars del servicio API en Railway.

### Obtener el access token — **[verificado]**

```bash
curl -X POST "https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials&client_id=$HOTMART_CLIENT_ID&client_secret=$HOTMART_CLIENT_SECRET" \
  -H "Authorization: Basic $HOTMART_BASIC" \
  -H "Content-Type: application/json"
# → { "access_token": "...", "token_type": "bearer", "expires_in": <segundos>, ... }
```

- El token es un blob largo (~558 chars, empieza `H4sIA…`) **[verificado]**.
- **[docs]** `expires_in` indica la vida del token; al expirar, la API devuelve **401** — el cliente debe regenerar el token y reintentar. Las credenciales (ID/Secret/Basic) NO expiran.
- Patrón recomendado para nuestro cliente: cachear el token en memoria con su `expires_in` y regenerarlo ante 401 o expiración próxima.

### Autenticación de las llamadas

Todas las llamadas a `https://developers.hotmart.com/...` llevan:
```
Authorization: Bearer <access_token>
```

---

## 2. Límites y códigos de respuesta

- **Rate limit [docs]:** **500 llamadas/minuto** (lecturas+escrituras). Exceso → **HTTP 429**. Headers de control en cada respuesta: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `X-RateLimit-Limit-Minute`, `X-RateLimit-Remaining-Minute`.
- **401** → token expirado/ inválido (regenerar).
- **500 con `{"error":"internal_error"}`** → ver §4 (caso real del endpoint de offers).
- Paginación **[verificado en sales]:** respuestas con `page_info { total_results, results_per_page, next_page_token? }`; parámetro `max_results` en query. **[pendiente]** detalle oficial de `page_token`.

---

## 3. Endpoints que usamos

Base URL: `https://developers.hotmart.com`

### 3.1 Listar productos — `GET /products/api/v1/products` — **[verificado]**

```bash
curl -s "https://developers.hotmart.com/products/api/v1/products?max_results=50" \
  -H "Authorization: Bearer $TOKEN"
```
Respuesta por item: `id` (numérico), `ucode` (UUID), `name`, `status` (`ACTIVE | NOT_APPROVED | CHANGES_PENDING_ON_PRODUCT | …`), `is_subscription`, `format` (`ONLINE_COURSE | ONLINE_EVENT | …`), `created_at` (epoch ms), `warranty_period`.

### 3.2 Historial de ventas — `GET /payments/api/v1/sales/history` — **[verificado]**

```bash
curl -s "https://developers.hotmart.com/payments/api/v1/sales/history?product_id=7906260&max_results=100" \
  -H "Authorization: Bearer $TOKEN"
```
Query params útiles **[verificado]**: `product_id`, `max_results`. **[docs/pendiente]**: `start_date`/`end_date` (epoch ms), `transaction_status`, `buyer_email`.

Estructura del item **[verificado, payload real]**:
```jsonc
{
  "producer": { "name", "ucode" },
  "product":  { "id", "name" },
  "purchase": {
    "transaction": "HP3873005991",          // idempotency key (= webhook)
    "status": "COMPLETE",                    // APPROVED | COMPLETE | …
    "order_date": 1778541810000,
    "approved_date": 1778541814000,
    "warranty_expire_date": …,
    "offer": { "code": "r5j8ewpj", "payment_mode": "PAY_IN_FULL" },  // ← OFFER CODE
    "price": { "value": 32130, "currency_code": "CLP" },             // lo COBRADO (moneda local)
    "payment": { "method": "CREDIT_CARD_VISA", "type": "CREDIT_CARD", "installments_number": 1 },
    "hotmart_fee": { "base", "total", "fixed", "percentage", "currency_code" },
    "commission_as": "PRODUCER"
  },
  "buyer": { "name", "email", "ucode" }
}
```

**Uso clave para nosotros:** es la única vía API confirmada para descubrir **offer codes** (vía `purchase.offer.code`) — pero solo de ofertas **con ventas**.

### 3.3 Ofertas de un producto — `GET /products/api/v1/products/{ucode}/offers` — **[verificado]**

⚠️ **GOTCHA CRÍTICO:** el path acepta el **`ucode` (UUID) del producto, NO el `id` numérico**. Con el id numérico devuelve un engañoso **HTTP 500** `"It was not possible to get the offers for this product"` (no un 400/404) — perdimos horas con eso. Con el ucode funciona perfecto:

```bash
curl -s "https://developers.hotmart.com/products/api/v1/products/420bbfb9-6d32-4d2e-bdb7-1da89d6c10e6/offers" \
  -H "Authorization: Bearer $TOKEN"
```
Campos por offer **[verificado]**: `code` (8 chars — lo que usa el embed y vuelve en el webhook), `name`, `description`, `payment_mode` (`PAY_IN_FULL`…), `price { value, currency_code }` (moneda ANCLA de la oferta), `is_main_offer`, `is_currency_conversion_enabled`, `is_smart_recovery_enabled`.

### 3.4 Otros endpoints disponibles **[docs, sin probar]**
`/payments/api/v1/sales/summary`, `/sales/users`, `/sales/commissions`, `/sales/price/details`, refund de venta, API de suscripciones (`/payments/api/v1/subscriptions…`), API de Club (módulos/alumnos), cupones.

---

## 4. Hallazgos de NUESTRA cuenta (2026-06-10) — **[verificado]**

| Producto | ID | ucode | Estado | Offers |
|---|---|---|---|---|
| **Desinflama 21 días** (German DI21) | `7906260` | `420bbfb9-6d32-4d2e-bdb7-1da89d6c10e6` | ACTIVE | **escalera de 3** (ver abajo) |
| **Plan 90 Pro — Germán Roz** | `7759275` | `ab7878be-a778-4aeb-91b7-b669b72456f9` | ACTIVE | `dg18f02s` · 650 USD (principal) |
| Liberate del qué cocino — Cami | `7717869` | `943d42d1-…` | ACTIVE | `r5j8ewpj` · 32.130 CLP (ventas también en USD 38.08) |
| Cami Recetas (versión vieja) | `7704369` | `798c875c-…` | NOT_APPROVED | `trwelpdu` · 32.130 CLP (+MXN/CAD/SEK) |
| Video viral — Santiago Del Río | `7823593` | `37ee941d-…` | ACTIVE | `5182dywp` · 19.092 CLP |
| Afluence Membership (suscripción) | `5597983` | `b90c7b38-…` | ACTIVE | sin ventas; consultar offers por ucode |

**Escalera DEFINITIVA de Desinflama 21 días (USD, verificada por API 2026-06-10) — lista para el catálogo:**

| Offer code | Nombre | Precio ancla | Tier del catálogo |
|---|---|---|---|
| `ymzf5qdj` | Early Bird | **67 USD** | tier 1 — `{ provider: 'hotmart', offerCode: 'ymzf5qdj' }` |
| `5kh9auq4` | Lanzamiento | **77 USD** | tier 2 — `{ provider: 'hotmart', offerCode: '5kh9auq4' }` |
| `3m2koch3` | Precio Normal | **87 USD** | tier 3 (final) — `{ provider: 'hotmart', offerCode: '3m2koch3' }` |

Todas: `PAY_IN_FULL`, conversión de moneda ON (el comprador ve su moneda local; el ancla y reporting quedan en USD — decisión #2 ratificada). Las ofertas PEN viejas `jmpqchzj`/`2vjeget6` fueron eliminadas.

⚠️ **Residuo conocido (aceptado por Negocio, no bloqueante):** la oferta vieja `b4bltfyo` (299 PEN) sigue activa y es la **PRINCIPAL** — Hotmart no permitió desactivarla/cambiarla. Implicación: el link base `pay.hotmart.com/<ucode>` (sin `?off=`) vendería a 299 PEN. **Mitigación:** nuestro embed SIEMPRE pasa un offer code explícito, y ese link base jamás se publica. Revisar de nuevo cuando Hotmart lo permita.

**Aprendizajes:**
1. **Hotmart cobra en la moneda local del comprador** con la MISMA oferta (`r5j8ewpj`: 74 ventas CLP + 3 ventas USD) — evidencia directa para la política de moneda del plan Hotmart (offer ancla + cobro localizado + `amount_usd` normalizado).
2. El checkout público `pay.hotmart.com/<ucode>` SIN `?off=<code>` devuelve **error 008** aunque el producto venda — los links de venta siempre llevan el offer code.
3. `purchase.transaction` (`HP…`) es la idempotency key del webhook y de `marketing.purchases.external_id`.

## 5. Integración con este repo

- **Hoy:** consultas ad-hoc con curl (este doc). Credenciales en `.env.local`.
- **Fase 3 del plan Hotmart** (`funcionalidades-por-desarrollar/hotmart-embedded-checkout/`): el webhook NO usa esta API — usa el Postback v2.0.0 (header `X-HOTMART-HOTTOK`, ver brief §5). Esta API REST sirve para: validar offers/productos, reconciliación de ventas (sales/history vs `marketing.purchases`), y QA del spike.
- **Futuro opcional:** `packages/hotmart-client` siguiendo el patrón de `packages/meta-ads` (token cacheado + retry en 401/429) si la reconciliación se vuelve recurrente.

## 5b. Checkout Elements — personalización (verificado A/B headless, 2026-06-10)

⚠️ **Los parámetros `hide*` NO funcionan en el checkout embebido.** Probado empíricamente: `pay.hotmart.com/elements?off=...` renderiza IDÉNTICO con y sin `hideCouponOption/hidePayPal/hidePix/hideBillet/hideTransf/hidewallet/hideMultipleCards/split` (esos params son del checkout clásico por URL, no de Elements). La lib SÍ reenvía los params al iframe (verificado en la URL del iframe) — es Hotmart quien los ignora en `/elements`.

**Lo que SÍ controla la lib** (leído del source): `offer`, `locale`, `countryIsoCode` (fuerza país/moneda del render), `prefilledInfo` (email/nombre/doc/tel/sck — el `sck` validado round-trip), `visibilityOptions→query params` (solo honra src/xcod a efectos prácticos).

**El checkout embebido se personaliza desde el PANEL** (por producto): métodos de pago por país (Mercado Pago, etc.), permitir cupones, cuotas/meses (parcelamiento), campos del comprador. El render además se geolocaliza: desde México muestra MXN+IVA+RFC+meses; desde Perú, soles. `countryIsoCode` permitiría fijar el país si algún día se quiere.

## 6. Pendientes
- [x] ~~Resolver el 500 de Get Offers~~ → resuelto: el path requiere el **ucode**, no el id numérico (§3.3).
- [ ] Confirmar params oficiales de sales/history y paginación cuando el WAF de docs lo permita.
- [x] ~~Offer codes de Desinflama~~ → escalera de 3 ofertas verificada (§4). Para la compra de prueba del spike: usar `jmpqchzj` (231 PEN) con refund posterior, o crear una oferta de prueba de monto mínimo.
- [x] ~~Ratificar moneda ancla~~ → **USD ratificado y ejecutado** (2026-06-10): escalera $67/$77/$87 USD creada (`ymzf5qdj`/`5kh9auq4`/`3m2koch3`). Residuo: principal sigue siendo la PEN vieja (ver ⚠️ §4 — aceptado, no bloqueante).
