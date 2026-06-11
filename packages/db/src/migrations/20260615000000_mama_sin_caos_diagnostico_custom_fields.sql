-- Mamá Sin Caos — diagnóstico: persistir el resultado del quiz (`arquetipo`).
--
-- El landing /mama-sin-caos/diagnostico ingesta por la ruta genérica
-- (marketing.leads + custom_field_values). `saveCustomFieldValues` SÓLO persiste
-- custom fields que tengan una definición en `custom_field_definitions`; sin esta
-- fila, el `arquetipo` (el resultado del diagnóstico) se descarta silenciosamente.
--
-- Additive + idempotente: inserta la definición sólo si el org existe y no la tiene.
-- El organization_id se resuelve por nombre (no por env) para que aplique en prod.

INSERT INTO marketing.custom_field_definitions
  (organization_id, entity_type, field_key, field_label, field_type, required)
SELECT o.id, 'lead', 'arquetipo', 'Arquetipo', 'text', false
FROM marketing.organizations o
WHERE o.name = 'Mamá Sin Caos'
  AND NOT EXISTS (
    SELECT 1
    FROM marketing.custom_field_definitions d
    WHERE d.organization_id = o.id
      AND d.entity_type = 'lead'
      AND d.field_key = 'arquetipo'
  );
