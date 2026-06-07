CREATE TABLE IF NOT EXISTS marketing.caro_fitness_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  source text NOT NULL DEFAULT 'landing-caro-fitness-diagnostico',
  email text NOT NULL DEFAULT '',
  first_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  quiz_step text NOT NULL DEFAULT 'intro',
  status text NOT NULL DEFAULT 'in_progress',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  lead_id uuid,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS caro_fitness_progress_session_id_unique
  ON marketing.caro_fitness_progress (session_id);

CREATE INDEX IF NOT EXISTS caro_fitness_progress_created_at_idx
  ON marketing.caro_fitness_progress (created_at DESC);

CREATE INDEX IF NOT EXISTS caro_fitness_progress_email_lower_idx
  ON marketing.caro_fitness_progress (lower(email))
  WHERE email <> '';
