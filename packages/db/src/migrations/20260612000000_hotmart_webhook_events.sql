-- SPIKE Fase 0 de hotmart-embedded-checkout: captura cruda de postbacks de
-- Hotmart para validar el contrato (transaction, offer.code, origin.sck/src/xcod)
-- antes de construir el webhook real de Fase 3. Aditiva e idempotente; también
-- asegurada en boot (apps/api/src/core/bootstrap/ensure-hotmart-events-table.ts).

CREATE TABLE IF NOT EXISTS marketing.hotmart_webhook_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event          text,
  transaction_id text,
  offer_code     text,
  payload        jsonb NOT NULL,
  received_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hotmart_events_received
  ON marketing.hotmart_webhook_events (received_at);

ALTER TABLE marketing.hotmart_webhook_events ENABLE ROW LEVEL SECURITY;
