-- DI21 C2: seed the real price ladder into meta_ops.price_tiers.
--
-- The table only held the April (Q2/C1) tiers, all in the past by June. The
-- dashboard adapter falls back to the LAST past tier when none is current, so
-- every C2 purchase was being valued at $87 while the live price is $67 —
-- inflating Price card, revenue tiles, daily revenue and ROAS by ~30%, and
-- showing April dates in the price strip/footer.
--
-- C2 ladder (launch DI21-C2, America/Lima): $67 until Jun 16 · $77 Jun 17-23 ·
-- $87 Jun 24-30. First tier starts on 2026-06-08 (paid start) so pixel
-- purchases from the pre-cart days also value at $67.
--
-- Idempotent via UNIQUE(business_unit_id, starts_on) + ON CONFLICT DO NOTHING.
-- Past (April) tiers are kept — past editions stay queryable.

INSERT INTO meta_ops.price_tiers
  (business_unit_id, label, price, currency, starts_on, ends_on, cutover_time, display_order)
SELECT bu.id, t.label, t.price, 'USD', t.starts_on::date, t.ends_on::date, NULL, t.display_order
FROM meta_ops.business_units bu
JOIN meta_ops.organizers o ON o.id = bu.organizer_id
CROSS JOIN (VALUES
  ('Early bird', 67.00, '2026-06-08', '2026-06-16', 4),
  ('Standard',   77.00, '2026-06-17', '2026-06-23', 5),
  ('Final',      87.00, '2026-06-24', '2026-06-30', 6)
) AS t(label, price, starts_on, ends_on, display_order)
WHERE o.slug = 'german-roz' AND bu.slug = 'di21'
ON CONFLICT (business_unit_id, starts_on) DO NOTHING;
