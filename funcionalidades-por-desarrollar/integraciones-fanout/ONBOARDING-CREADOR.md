# Activar un creador N en la capa de integraciones (fan-out)

Runbook operativo. Activar un creador = **1 archivo + 1 import + 1 token de env**.
No se toca runtime, ni la DB, ni los webhooks. La capa ya es modular por
`(orgKey, buKey)` vía `apps/api/src/core/integrations/registry.ts`.

> Alcance: MailerLite (registro → grupo Registrantes; compra → mueve a
> Compradores + `tier_compra` + saca de Registrantes) y, opcional, Hyros.
> **Meta CAPI**: solo se habilita en el fan-out para creadores que **NO**
> disparen CAPI inline (ver paso 4). **Palti / entrega de acceso**: fuera de
> este repo (sistema independiente).

## Pre-requisitos (cuenta MailerLite del creador)

Cada creador tiene **su propia cuenta** MailerLite (su propio token). En esa
cuenta, crear/identificar:

1. **Grupo Registrantes** (lo que llena el registro de la landing) → anotar su `id`.
2. **Grupo Compradores** → anotar su `id`.
3. **Campos** (custom fields) que vas a escribir. Por convención usamos:
   `name`, `fuente` (source), `cohorte`, `tier_compra`, `fecha_registro` (tipo
   **DATE**). Anotar la `key` real de cada uno (MailerLite las normaliza).
4. (Opcional) La automatización AUTO① que dispara al entrar al grupo — el
   connector **no** setea `estado`; deja que la automatización lo haga.

> Cómo obtener los IDs: consola MailerLite, o el MCP de MailerLite
> (`list_groups` / `list_fields`) con el token del creador. Verificar **siempre**
> que el token lista los grupos esperados (confirma que es la cuenta correcta —
> el `sub` del JWT es un user id, no el account id).

## Pasos

### 1. Crear el archivo de config del BU

`apps/api/src/orgs/<org>/<bu>/integrations.ts`. Copiar de German como plantilla
(`apps/api/src/orgs/german-roz/main/integrations.ts`):

```ts
import type { BuIntegrationConfig } from '../../../core/integrations/types';

export const <ORG>_<BU>_INTEGRATIONS: BuIntegrationConfig = {
  orgKey: '<org>',
  buKey: '<bu>',
  targets: [
    {
      connector: 'mailerlite',
      enabledFor: ['registro', 'compra'],
      secretRef: 'MAILERLITE_TOKEN_<ORG_UPPER>',   // nombre del env, NO el token
      registrantGroupId: '<id grupo Registrantes>',
      buyerGroupId: '<id grupo Compradores>',
      fieldKeys: {
        name: 'name',
        source: 'fuente',
        cohort: 'cohorte',
        tier: 'tier_compra',
        regDate: 'fecha_registro',
      },
      cohortValue: '<slug-cohorte>',               // ej. 'di21-c2'
    },
    // Hyros opcional — solo si el creador lo usa y su contrato está confirmado:
    // { connector: 'hyros', enabledFor: ['registro','compra'], secretRef: 'HYROS_API_KEY_<ORG_UPPER>' },
  ],
};
```

**Tokens nunca en código** — solo el `secretRef` (nombre del env var).

### 2. Registrar en el registry

`apps/api/src/core/integrations/registry.ts`: importar y agregar a `CONFIGS`.

```ts
import { <ORG>_<BU>_INTEGRATIONS } from '../../orgs/<org>/<bu>/integrations';
const CONFIGS: BuIntegrationConfig[] = [GERMAN_ROZ_MAIN_INTEGRATIONS, <ORG>_<BU>_INTEGRATIONS];
```

### 3. Setear el/los token(s) en env

- **Local** (`.env` y `.env.local`, ambos gitignored): `MAILERLITE_TOKEN_<ORG_UPPER>=...`
- **Producción**: el mismo var en **Railway** (servicio API). Sin el token, el
  connector hace **no-op** (no rompe, no entrega) — útil para deploy antes de
  tener el token, pero el fan-out de ese creador no corre hasta setearlo.

### 4. ¿Meta CAPI?

- Si el creador **ya dispara CAPI inline** (Lead en ingesta + Purchase en
  webhook, como German) → **NO** agregar `meta-capi` al fan-out (doble-conteo).
- Si **no** tiene CAPI inline → agregar
  `{ connector: 'meta-capi', enabledFor: ['registro','compra'], secretRef: ... }`
  con sus env `META_PIXEL_ID_<ORG>` + `META_CAPI_TOKEN_<ORG>` (ambos, el pixel id
  solo no basta).

### 5. Verificar y desplegar

```bash
npm run typecheck -w @marketing-funnel/api      # tipos
npm test -w @marketing-funnel/api               # 28+ tests del fan-out
npm run build -w @marketing-funnel/api          # build deploy
```

En boot, `validateIntegrationConfigs` loguea problemas de config (grupos
faltantes, conectores sin secretRef, etc.) **sin** tumbar el arranque — revisar
los logs de Railway tras el deploy.

### 6. Smoke en producción (cuidado con contaminar datos)

- **Registro**: seguro de probar — un POST de registro de prueba mueve un email
  de prueba al grupo Registrantes. Usar un `source` del allowlist de la landing.
- **Compra**: **NO** dispares una compra sintética en prod (escribe una fila
  falsa en `marketing.purchases` y mueve un subscriber real a Compradores).
  Validar con una compra real o en staging.

## Garantías de la capa (por qué es robusto)

- **Idempotencia exactamente-una-vez por destino**: outbox
  `marketing.integration_deliveries` con `UNIQUE(connector, dedup_key)` +
  `ON CONFLICT DO NOTHING`. Un retry at-least-once del webhook **no** re-entrega.
- **No bloquea la venta**: el dispatch es `void ... .catch()`; nunca afecta la
  respuesta HTTP del webhook ni del registro.
- **Reintentos**: cron `integration-delivery-retry` (cada minuto, backoff
  exponencial). Filas que agotan intentos → `dead` (replay manual, follow-up B3).
- **PII**: `payload` se purga a 30 días (cron `integration-delivery-purge`); la
  tabla es RLS deny-all (solo service-role la lee).

## Checklist de alta

- [ ] Cuenta MailerLite del creador con grupos Registrantes/Compradores + campos
- [ ] `orgs/<org>/<bu>/integrations.ts` creado (sin tokens, solo secretRef)
- [ ] Entrada agregada a `CONFIGS` en `registry.ts`
- [ ] `MAILERLITE_TOKEN_<ORG_UPPER>` en `.env`, `.env.local` y Railway
- [ ] Decisión Meta CAPI (inline existente → excluir; si no → habilitar con sus env)
- [ ] typecheck + tests + build deploy en verde
- [ ] Logs de boot sin errores de `validateIntegrationConfigs`
- [ ] Smoke de registro en prod OK (compra: real/staging, no sintética)
