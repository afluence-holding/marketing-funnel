-- Capa de integraciones / fan-out (funcionalidades-por-desarrollar/integraciones-fanout).
-- Outbox durable: una fila por (evento de negocio × destino). UNIQUE(connector,
-- dedup_key) da idempotencia exactamente-una-vez por destino (reenvío del webhook
-- at-least-once no duplica). Un cron reintenta pending/failed; el webhook nunca
-- se bloquea (intento inline best-effort, durabilidad por esta tabla).
-- Aditiva e idempotente; también asegurada en boot (ensure-integration-tables.ts).

CREATE TABLE IF NOT EXISTS marketing.integration_deliveries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_key         text NOT NULL,
  bu_key          text NOT NULL,
  connector       text NOT NULL,                  -- mailerlite | hyros | meta-capi
  event_type      text NOT NULL,                  -- registro | compra
  dedup_key       text NOT NULL,                  -- 'compra:whop:pay_123' | 'registro:lead:<uuid>'
  payload         jsonb NOT NULL DEFAULT '{}',     -- snapshot del evento (email, phone, tracking, value…)
  status          text NOT NULL DEFAULT 'pending'
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

-- Índice para el cron: filas due que reintentar.
CREATE INDEX IF NOT EXISTS idx_int_deliveries_due
  ON marketing.integration_deliveries (status, next_attempt_at)
  WHERE status IN ('pending','failed');

-- Índice para purga de PII (filas delivered viejas) y métricas por creador.
CREATE INDEX IF NOT EXISTS idx_int_deliveries_org_status
  ON marketing.integration_deliveries (org_key, bu_key, status, created_at);

-- RLS habilitada SIN políticas = deny-all para anon/authenticated (postura más
-- restrictiva). Esta tabla NO se lee por PostgREST/anon: solo el API la accede
-- con service-role (pg.Client / owner), que bypasea RLS. El `payload` contiene
-- PII (email/teléfono); por eso se purga a los 30 días (cron integration-delivery-purge).
ALTER TABLE marketing.integration_deliveries ENABLE ROW LEVEL SECURITY;
