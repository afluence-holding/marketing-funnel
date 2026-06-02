-- Mamá Sin Caos (Afluence) landing leads — persistent storage for lista secreta waitlist.
-- Run in Supabase SQL Editor, then redeploy API with DATABASE_URL configured.

CREATE TABLE IF NOT EXISTS marketing.mama_sin_caos_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'landing-afluence-mama-sin-caos-lista-secreta',
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS mama_sin_caos_leads_email_lower_unique
  ON marketing.mama_sin_caos_leads (lower(email));

CREATE INDEX IF NOT EXISTS mama_sin_caos_leads_created_at_idx
  ON marketing.mama_sin_caos_leads (created_at DESC);
