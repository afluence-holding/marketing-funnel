-- Bukku landing leads — simple persistent storage for apps/web (no API org required).
-- Run in Supabase SQL Editor, then redeploy marketing-funnel/web with SUPABASE_SERVICE_ROLE_KEY.

CREATE TABLE IF NOT EXISTS marketing.bukku_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'landing-bukku-test-ingles',
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS bukku_leads_email_lower_unique
  ON marketing.bukku_leads (lower(email));

CREATE INDEX IF NOT EXISTS bukku_leads_created_at_idx
  ON marketing.bukku_leads (created_at DESC);
