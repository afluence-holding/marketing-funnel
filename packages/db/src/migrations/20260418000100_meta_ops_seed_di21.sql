-- =============================================================================
-- Seed: Germán Roz organizer + DI21 business unit.
-- Idempotent via ON CONFLICT. ad_account_id is TBD — update after seed:
--   UPDATE meta_ops.organizers SET ad_account_id='act_<real>' WHERE slug='german-roz';
-- =============================================================================

INSERT INTO meta_ops.organizers (slug, name, ad_account_id)
VALUES ('german-roz', 'Germán Roz', 'act_TBD')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO meta_ops.business_units (organizer_id, slug, name, config, kpi_targets)
SELECT
  o.id,
  'di21',
  'Desinflámate 21',
  jsonb_build_object(
    'match_strategy',        'prefix',
    'campaign_name_prefix',  'DI21'
  ),
  jsonb_build_object(
    'target_cpa',          16,
    'target_roas',         4.0,
    'revenue_per_conv',    77
  )
FROM meta_ops.organizers o
WHERE o.slug = 'german-roz'
ON CONFLICT (organizer_id, slug) DO NOTHING;
