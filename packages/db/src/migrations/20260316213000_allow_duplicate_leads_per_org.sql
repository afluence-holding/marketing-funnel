-- Allow multiple leads per organization with the same email.
-- This enables "each form submission = new lead" behavior.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leads_org_email_idx'
      AND conrelid = 'marketing.leads'::regclass
  ) THEN
    ALTER TABLE marketing.leads DROP CONSTRAINT leads_org_email_idx;
  END IF;
END $$;

DROP INDEX IF EXISTS marketing.leads_org_email_idx;
