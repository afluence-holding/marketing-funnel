# Funcionalidades por desarrollar

Carpeta viva donde documentamos **cada funcionalidad antes y durante su desarrollo**,
como **user stories por fase** con criterios de éxito y validación. Se mantiene
actualizada a medida que avanzamos (cambia el estado, se marcan historias hechas,
se anotan decisiones).

Toda funcionalidad, antes de codear, debe tener:

1. **Fases** con objetivo, criterios de validación y criterios de éxito propios.
2. **User stories** dentro de cada fase, cada una con:
   - **Historia**: `Como <rol>, quiero <acción>, para <valor>`.
   - **CE (Criterio de Éxito)**: qué debe ser verdad cuando la historia está lista.
   - **V (Validación)**: cómo se comprueba ese criterio (prueba concreta).

## Convención de carpetas

Una carpeta por funcionalidad, en `kebab-case`:

```
funcionalidades-por-desarrollar/
  README.md                      ← este archivo (índice + convención)
  _template/
    USER-STORIES.md              ← plantilla a copiar para cada funcionalidad
  <nombre-funcionalidad>/
    USER-STORIES.md              ← fases + historias + CE + V (obligatorio)
    DESIGN.md                    ← diseño técnico / módulos (opcional)
    VALIDATION.md                ← checklist de QA / resultados (opcional)
```

Mínimo obligatorio por funcionalidad: `USER-STORIES.md`.

## Cómo crear una funcionalidad nueva

1. Copia `_template/USER-STORIES.md` a `funcionalidades-por-desarrollar/<nombre>/USER-STORIES.md`.
2. Rellena fases, historias, CE y V.
3. Agrega la fila al índice de abajo.
4. No empieces a codear hasta que las fases tengan criterios de éxito y validación claros.

## Cómo mantenerla

- Actualiza el **estado** de la funcionalidad y de cada historia conforme avanzas.
- Marca historias hechas (p.ej. `✅`) y anota la evidencia de validación.
- Registra decisiones en "Decisiones pendientes" → muévelas a resueltas cuando se cierren.

## Estados

`📝 Plan` · `🚧 En curso` · `✅ Hecho` · `🧊 Hold` · `❌ Descartado`

## Índice de funcionalidades

| Funcionalidad | Carpeta | Estado | Notas |
|---|---|---|---|
| Modularización de cohorts | [`modularizacion-cohorts/`](./modularizacion-cohorts/USER-STORIES.md) | ✅ Hecho | `packages/catalog` + `marketing.cohorts`/`purchases` en producción (PRs #77–#92). Cohort como entidad de primera clase. |
| Migración checkout Whop → Hotmart (German Roz) | [`hotmart-embedded-checkout/`](./hotmart-embedded-checkout/USER-STORIES.md) | ✅ Hecho | German vende por Hotmart en producción (C2→Hotmart switch, #89); embed + webhook + CAPI verificados con compra real. Lucas en Whop. |
| Capa de integraciones / fan-out (modular por creador) | [`integraciones-fanout/`](./integraciones-fanout/USER-STORIES.md) | 📝 Plan | Fan-out registro/compra → MailerLite, Palti, Hyros, Meta CAPI. Modular por org (cada creador con sus cuentas). Outbox durable + reintentos. Bloqueante: contrato API de Palti. |

> Pendientes de negocio (no de código): fechas/escalera de C3, Watch Paths del servicio web en Railway, UptimeRobot, refund de la compra de prueba. Ver el final de cada `USER-STORIES.md`.
