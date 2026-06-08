-- ============================================================================
-- Migration: launch_ops seed — DI21-C2 (GENERATED — do not edit by hand)
-- ----------------------------------------------------------------------------
-- Source: docs/DI21-C2-Centro-Operaciones.html
-- Generator: apps/admin/scripts/gen-launch-ops-seed.mjs
-- Idempotent: upserts launch/phases/kpis/resources; tasks upserted by
-- (launch_id, source_index) refreshing only STATIC fields (never status/
-- progress/version); steps/owners/deps inserted only for new tasks.
-- content_item delete+reinsert (seed-owned); message_asset upsert by key.
-- ============================================================================

DO $seed$
DECLARE
  v_launch uuid;
  v_phase  jsonb := '{}'::jsonb;
  v_tasks  jsonb := '{}'::jsonb;
  v_new    jsonb := '{}'::jsonb;
  v_id     uuid;
  v_isnew  boolean;
BEGIN
  -- launch -------------------------------------------------------------------
  INSERT INTO launch_ops.launch (code, name, brand, organizer_slug, bu_slug, status, starts_on, ends_on, config)
  VALUES ('DI21-C2', 'Desinflámate 21 · Cohort 2', 'german-roz', 'german-roz', 'main', 'active', '2026-06-06', '2026-07-21', '{"thesis_target_usd":90000,"price_ladder":["$67","$77","$87"],"avg_price_usd":76,"upsell_ht_usd":580,"dates":{"announce":"2026-06-06","webinar":"2026-06-10","cart":["2026-06-10","2026-06-30"],"reto_start":"2026-07-01","upsell_ht":["2026-07-17","2026-07-21"]}}'::jsonb)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, config = EXCLUDED.config, updated_at = now()
  RETURNING id INTO v_launch;

  -- phases -------------------------------------------------------------------
  INSERT INTO launch_ops.phase (launch_id, code, name, position) VALUES (v_launch, 'F0', '⚡ F0 · Setup crítico — HOY', 0)
  ON CONFLICT (launch_id, code) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position RETURNING id INTO v_id;
  v_phase := jsonb_set(v_phase, ARRAY['F0'], to_jsonb(v_id::text));
  INSERT INTO launch_ops.phase (launch_id, code, name, position) VALUES (v_launch, 'F1', 'F1 · Llenar el webinar (6–10 jun)', 1)
  ON CONFLICT (launch_id, code) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position RETURNING id INTO v_id;
  v_phase := jsonb_set(v_phase, ARRAY['F1'], to_jsonb(v_id::text));
  INSERT INTO launch_ops.phase (launch_id, code, name, position) VALUES (v_launch, 'F2', 'F2 · Webinar + abrir carrito (9–10 jun)', 2)
  ON CONFLICT (launch_id, code) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position RETURNING id INTO v_id;
  v_phase := jsonb_set(v_phase, ARRAY['F2'], to_jsonb(v_id::text));
  INSERT INTO launch_ops.phase (launch_id, code, name, position) VALUES (v_launch, 'F3', 'F3 · Carrito · 20 días (10–30 jun)', 3)
  ON CONFLICT (launch_id, code) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position RETURNING id INTO v_id;
  v_phase := jsonb_set(v_phase, ARRAY['F3'], to_jsonb(v_id::text));
  INSERT INTO launch_ops.phase (launch_id, code, name, position) VALUES (v_launch, 'F4', 'F4 · Reto + Upsell HT (1–21 jul)', 4)
  ON CONFLICT (launch_id, code) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position RETURNING id INTO v_id;
  v_phase := jsonb_set(v_phase, ARRAY['F4'], to_jsonb(v_id::text));
  INSERT INTO launch_ops.phase (launch_id, code, name, position) VALUES (v_launch, 'F5', 'F5 · Monitoreo + Post-launch', 5)
  ON CONFLICT (launch_id, code) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position RETURNING id INTO v_id;
  v_phase := jsonb_set(v_phase, ARRAY['F5'], to_jsonb(v_id::text));

  -- tasks (upsert by source_index; new-ness via xmax=0) ----------------------
  -- #1 [F0] Whop: cuenta + KYC + producto $87 + cupones de la escale
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 1, 'Whop: cuenta + KYC + producto $87 + cupones de la escalera + métodos de pago', 'Checkout funcional con la escalera de precio lista y pagos que conviertan en Perú.', 'Producto a $87, cupones aplican y expiran, PayPal en el checkout.', 'Whop', 'infra', 'HOY', NULL, NULL, 1)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['1'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['1'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Crear/configurar la cuenta Whop y completar KYC — es lo que más demora, hacerlo primero.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Producto «Reto Desinflámate 21», pago único, USD, anclado a $87.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Cupón −$20→$67 exp 16/6, 1 por cliente, con tope.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Cupón −$10→$77 exp 23/6, 1 por cliente.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 4, 'PayPal + crypto (respaldo LATAM) + redirect post-checkout + thank-you.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
  END IF;

  -- #2 [F0] Landing de registro + diagnóstico embebido LIVE
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 2, 'Landing de registro + diagnóstico embebido LIVE', 'Puerta de registro que captura el lead y obliga a completar el diagnóstico.', 'Un registro de prueba entra a MailerLite (S6) y muestra el link de WhatsApp.', 'Landing', 'infra', 'HOY', NULL, NULL, 2)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['2'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['2'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Publicar la landing.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Embeber el diagnóstico como paso obligatorio.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Conectar el form al opt-in (MailerLite S6 + ManyChat).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Confirmación con link al grupo WhatsApp + resultado.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 4, 'QA mobile.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #3 [F0] Evento de registro Pixel + CAPI validado (anti value-bug
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 3, 'Evento de registro Pixel + CAPI validado (anti value-bug)', 'Señal de conversión limpia para que el paid optimice por registro.', 'El registro de prueba aparece como 1 evento, sin duplicar.', 'Tracking', 'infra', 'HOY', NULL, NULL, 3)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['3'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['3'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Pixel en la landing.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Complete Registration por Pixel + CAPI con event_id compartido.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Test Events.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Confirmar dedupe.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #4 [F0] Hyros 100% montado (antes de prender ads)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 4, 'Hyros 100% montado (antes de prender ads)', 'Atribución y valor real cross-device + arreglar el value bug, sin resetear learning.', 'La compra de prueba registra valor correcto en Hyros, sin doble conteo.', 'Tracking', 'infra', 'HOY', NULL, NULL, 4)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['4'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['4'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Script universal en landing + VSL.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Meta OAuth + parámetro en TODOS los adsets antes de gastar.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Whop↔Hyros + webhook final_amount.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'MailerLite he=/el= + tracked links WhatsApp; sin acortadores.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 4, 'Source-of-truth: Hyros manda Purchase a Meta, apagar Whop→Meta. Scientific Mode.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #5 [F0] Crear grupos de WhatsApp + URLs configuradas en el reto 
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 5, 'Crear grupos de WhatsApp + URLs configuradas en el reto (rotación al llenarse)', 'Palanca de comunicación lista, conforme y escalable.', 'Links funcionan, URLs editables desde el reto, hay grupo de reserva.', 'WA Grupos', 'organico', 'HOY', NULL, NULL, 5)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['5'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['5'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Grupo(s) ≤300–500 + link + modo solo-admins para el evento.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'URLs parametrizadas en el reto para rotar al llenarse.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Opt-in explícito en el registro + bienvenida.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, '1–2 grupos de reserva.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
  END IF;

  -- #6 [F0] Whop: compra de prueba desde Perú
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 6, 'Whop: compra de prueba desde Perú', 'Validar que el checkout convierte y reporta valor correcto antes de gastar.', 'Compra completa, valor correcto, comprador excluido del retargeting.', 'Whop', 'infra', 'HOY/7jun', '2026-06-07', '2026-06-07', 6)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['6'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['6'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Compra real desde IP de Perú.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Verificar métodos de pago que renderizan.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Valor correcto en Hyros + Meta.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Webhook dispara el fan-out.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #7 [F0] Autenticar email: SPF + DKIM + DMARC + unsubscribe
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 7, 'Autenticar email: SPF + DKIM + DMARC + unsubscribe', 'Deliverability para que los emails de cierre lleguen al inbox.', 'Dominio autenticado; envío de prueba no cae en spam.', 'Email', 'infra', 'HOY', NULL, NULL, 7)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['7'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['7'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Verificar SPF + DKIM (dominio «authenticated»).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'DMARC p=none.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Unsubscribe 1 clic.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #8 [F0] Construir segmentos dinámicos S1–S6 en MailerLite
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 8, 'Construir segmentos dinámicos S1–S6 en MailerLite', 'Poder enviar engaged-first y ramificar.', 'Los 6 segmentos existen; S5 aislado del blast.', 'Email', 'infra', 'HOY', NULL, NULL, 8)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['8'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['8'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Segmentos por engagement sobre Cohort-Cierre (570) + Desinflama 21 (2,524).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'S1 buyers engaged · S2 lapsed · S3 hot · S4 warm · S5 dormidos · S6 registrantes.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Verificar conteos.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #9 [F1] ManyChat: keyword RETO → DM con link + opt-in → push a M
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 9, 'ManyChat: keyword RETO → DM con link + opt-in → push a MailerLite/Meta', 'Convertir el orgánico en leads capturados en canal propio.', 'Responder RETO devuelve DM y el lead aparece en MailerLite + Meta.', 'ManyChat', 'organico', '6–7jun', '2026-06-06', '2026-06-07', 9)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['9'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['9'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Flow keyword RETO (story reply + comentario) → DM con link.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Capturar email + taggear.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Push a MailerLite S6 + Meta CA.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Probar end-to-end.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #10 [F1] ManyChat: flow de recordatorios (show-up + carrito)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 10, 'ManyChat: flow de recordatorios (show-up + carrito)', 'ManyChat como segundo riel de recordatorios (IG-native).', 'Un opted-in recibe la secuencia; compradores excluidos.', 'ManyChat', 'organico', '7jun', '2026-06-07', '2026-06-07', 10)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['10'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['10'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'DM día previo / día del webinar / 1h antes.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Carrito: link de checkout en cada flip + cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Suprimir compradores.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #11 [F1] Anuncio orgánico: story + reel con keyword RETO
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 11, 'Anuncio orgánico: story + reel con keyword RETO', 'Activar la expectativa y empezar a llenar registros hoy.', 'Publicado; entran respuestas RETO y registros.', 'IG Orgánico', 'organico', 'HOY', NULL, NULL, 11)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['11'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['11'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Story + reel revelando la masterclass.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Hook con el dolor #1 (energía), no el producto.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'CTA «responde RETO».');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Sin peso ni números.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
  END IF;

  -- #12 [F1] Subir creativos de la matriz (hooks) al ad account
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 12, 'Subir creativos de la matriz (hooks) al ad account', 'Banco de hooks listo para el test de paid.', 'Ads listos para C1.', 'Meta Ads', 'inorganico', '6–7jun', '2026-06-06', '2026-06-07', 12)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['12'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['12'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Cargar 4–6 hooks como ads.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Convención de nombres.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Parámetro Hyros + URL correcta (sin acortadores).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #13 [F1] Campaña C1 Registro (CBO · frío+warm · Complete Registra
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 13, 'Campaña C1 Registro (CBO · frío+warm · Complete Registration)', 'Máquina de registros pre-webinar.', 'Campaña activa entregando registros bien medidos.', 'Meta Ads', 'inorganico', '7jun', '2026-06-07', '2026-06-07', 13)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['13'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['13'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '1 campaña CBO, objetivo Leads.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Adset FRÍO (broad/Advantage+) + WARM (IG engagers) aparte.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Prender solo al validar tracking.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Destino: landing del diagnóstico.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #14 [F1] Warm-up email engaged-first + Email A1 (invitación)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 14, 'Warm-up email engaged-first + Email A1 (invitación)', 'Reactivar la lista sin quemar deliverability.', 'Sin pico de quejas; A1 con buen open/clic.', 'Email', 'organico', '6–8jun', '2026-06-06', '2026-06-08', 14)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['14'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['14'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Jun 6: solo Cohort-Cierre. Jun 7: +S3. Jun 8: +S4. Nunca a los 2,524 ni a S5.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Email A1: anuncia la masterclass + CTA registro.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #15 [F1] Reels diarios + stories (ángulos de la matriz)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 15, 'Reels diarios + stories (ángulos de la matriz)', 'Sostener registros y calentar audiencia para paid.', 'Publicación diaria; engagement alimentando warm.', 'IG Orgánico', 'organico', '7–10jun', '2026-06-07', '2026-06-10', 15)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['15'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['15'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '1 reel/día + stories (energía, antojos, anti-dieta, autoridad).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Encuestas/preguntas.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Toda story cierra con RETO.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
  END IF;

  -- #16 [F1] Email A2/A3 + recordatorios R1–R4 a registrantes
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 16, 'Email A2/A3 + recordatorios R1–R4 a registrantes', 'Empujar registro y maximizar show-up.', 'Secuencia programada; registrantes reciben recordatorios.', 'Email', 'organico', '7–10jun', '2026-06-07', '2026-06-10', 16)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['16'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['16'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'A2 (por qué importa) + A3 (última llamada) a S1–S4.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'R1–R4 (1 día / mañana / 1h / en vivo) solo a S6.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #17 [F1] Elba: envío de mensajes en los grupos (pre-webinar)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 17, 'Elba: envío de mensajes en los grupos (pre-webinar)', 'Subir show-up con comunicación humana. Paralelo al bot.', 'Grupos activos, sin salidas masivas.', 'WA Grupos', 'organico', '7–10jun', '2026-06-07', '2026-06-10', 17)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['17'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['17'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Bienvenida + 1 tip/día (máx 1–3/día), tono cálido.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Recordatorios día previo y día del webinar.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Teaser de valor + prueba social.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Coordinar con el bot para no duplicar.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;
  END IF;

  -- #18 [F1] Lectura de hooks (matar <25%, escalar 30%+)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 18, 'Lectura de hooks (matar <25%, escalar 30%+)', 'Encontrar ángulos ganadores antes de meter budget.', '2–4 hooks ganadores; perdedores pausados.', 'Meta Ads', 'inorganico', '8–9jun', '2026-06-08', '2026-06-09', 18)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['18'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['18'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Leer hook rate + hold + CTR; el costo aún miente.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Matar <25%; consolidar 30%+.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Preparar ganadores para Fase 2.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #19 [F2] Guion del pitch del webinar (70/20, vender reto $67)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 19, 'Guion del pitch del webinar (70/20, vender reto $67)', 'Una clase que entrega valor y convierte sin agredir.', 'Guion aprobado y ensayado.', 'Webinar', 'organico', '9jun', '2026-06-09', '2026-06-09', 19)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['19'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['19'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'hook → historia → enseñanza (3 cambios) → transición → oferta → stack → urgencia → cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, '70–80% valor / 20–30% oferta. Abre carrito a $67.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'HT NO se pitchea aquí.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Anti-dieta, sin números.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #20 [F2] Plataforma del webinar + sala + prueba técnica
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 20, 'Plataforma del webinar + sala + prueba técnica', 'Que el evento corra sin fallas el día 10.', 'Prueba técnica OK; link funciona.', 'Webinar', 'infra', '9jun', '2026-06-09', '2026-06-09', 20)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['20'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['20'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Plataforma + sala.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Prueba técnica (audio/video/pantalla).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Link de ingreso para ManyChat/email/WhatsApp.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
  END IF;

  -- #21 [F2] Recetario antiinflamatorio listo (premio por asistir)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 21, 'Recetario antiinflamatorio listo (premio por asistir)', 'Incentivo de show-up + entrega de valor post-webinar.', 'Recetario terminado y con vía de entrega.', 'Webinar', 'organico', '9jun', '2026-06-09', '2026-06-09', 21)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['21'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['21'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Armar el recetario (recetas de chef).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Mecanismo de entrega a quienes se conecten.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Sin números; lenguaje de bienestar.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
  END IF;

  -- #22 [F2] VSL de venta + página de checkout Whop + thank-you
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 22, 'VSL de venta + página de checkout Whop + thank-you', 'Destino de conversión del carrito.', 'VSL → checkout → thank-you end-to-end.', 'Landing', 'infra', '9jun', '2026-06-09', '2026-06-09', 22)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['22'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['22'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Página de venta con la VSL.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Botón al checkout Whop (producto + cupón vigente).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Thank-you + redirect al grupo del reto.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
  END IF;

  -- #23 [F2] Webhook fan-out post-compra
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 23, 'Webhook fan-out post-compra', 'Automatizar todo lo que pasa al comprar.', 'Una compra de prueba dispara los 4 efectos.', 'Tracking', 'infra', '9jun', '2026-06-09', '2026-06-09', 23)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['23'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['23'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Whop payment.succeeded → MailerLite buyers + Hyros order + Meta exclude + link al grupo del reto.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #24 [F2] Cargar Secuencia B de carrito (C1–C12, ramificada)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 24, 'Cargar Secuencia B de carrito (C1–C12, ramificada)', 'Maquinaria de venta del carrito lista.', 'Secuencia programada; ramas por comportamiento.', 'Email', 'organico', '9–10jun', '2026-06-09', '2026-06-10', 24)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['24'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['24'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'C1–C12 ramificada por asistente/no-show.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Emails ancla en cada flip + cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Supresión de compradores.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #25 [F2] Masterclass en vivo + abrir carrito $67
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 25, 'Masterclass en vivo + abrir carrito $67', 'El evento de conversión.', 'Webinar hecho, carrito abierto, primeras ventas.', 'Webinar', 'organico', '10jun', '2026-06-10', '2026-06-10', 25)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['25'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['25'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Conducir la clase (70/20).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Abrir carrito a $67.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Testimonios + link en WhatsApp durante el pitch.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
  END IF;

  -- #26 [F2] Pasar paid a C3 Carrito (retargeting + escalar)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 26, 'Pasar paid a C3 Carrito (retargeting + escalar)', 'Monetizar registrantes/asistentes que no compraron.', 'C3 activa con CPA razonable.', 'Meta Ads', 'inorganico', '10jun', '2026-06-10', '2026-06-10', 26)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['26'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['26'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'C3 (Purchase): hot registrantes + visitantes VSL + warm no-reg.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Cargar hooks ganadores.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Excluir compradores.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #27 [F2] Lista hasheada de registrantes como Custom Audience
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 27, 'Lista hasheada de registrantes como Custom Audience', 'Retargeting confiable (no depender de pixel→CA).', 'CA de registrantes con tamaño, lista para C3.', 'Meta Ads', 'inorganico', '10jun', '2026-06-10', '2026-06-10', 27)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['27'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['27'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Exportar registrantes hasheados.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Subir como CA primaria para C3.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Engagement (IG/video) como fallback.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #28 [F2] Validar primeras 3–5 ventas en Hyros ($67/$77/$87)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 28, 'Validar primeras 3–5 ventas en Hyros ($67/$77/$87)', 'Confirmar tracking de valor antes de escalar.', 'Ventas con valor correcto y atribución limpia.', 'Tracking', 'infra', '10–11jun', '2026-06-10', '2026-06-11', 28)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['28'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['28'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Ventas registran el precio correcto.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Atribución al ad correcto.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Si falla → CAPI propio desde webhook.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #29 [F3] Elba: envío de mensajes en los grupos (carrito)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 29, 'Elba: envío de mensajes en los grupos (carrito)', 'Sostener urgencia y prueba social humana 20 días.', 'Cadencia con spikes en cada flip y cierre.', 'WA Grupos', 'organico', '10–30jun', '2026-06-10', '2026-06-30', 29)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['29'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['29'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Testimonios diarios + 1 objeción.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Anclar cada flip (17 y 24).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Pitch: testimonios + link.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Cierre 3x.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;
  END IF;

  -- #30 [F3] Stories de carrito + olas de precio
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 30, 'Stories de carrito + olas de precio', 'El orgánico sostiene la urgencia de la escalera.', 'Stories diarias; cada flip con aviso.', 'IG Orgánico', 'organico', '10–30jun', '2026-06-10', '2026-06-30', 30)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['30'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['30'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Testimonios (energía/digestión/bienestar).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Story de aviso en cada subida.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Countdown al cierre.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
  END IF;

  -- #31 [F3] Flip a $77 (operativo)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 31, 'Flip a $77 (operativo)', 'Ejecutar la primera subida sin fricción.', 'Checkout cobra $77 y salió la comunicación.', 'Carrito/Precio', 'infra', '17jun', '2026-06-17', '2026-06-17', 31)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['31'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['31'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Whop: cupón $67 expira → $77.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Email C5 a no-compradores.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Story + WhatsApp.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #32 [F3] Flip a $87 (operativo)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 32, 'Flip a $87 (operativo)', 'Ejecutar la última subida.', 'Checkout cobra $87 y salió la comunicación.', 'Carrito/Precio', 'infra', '24jun', '2026-06-24', '2026-06-24', 32)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['32'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['32'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Whop: cupón $77 expira → $87.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Email C8 + story + WhatsApp.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Avisar cierre el 30.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #33 [F3] Track de reactivación S5 (sunset) — baja prioridad, en p
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 33, 'Track de reactivación S5 (sunset) — baja prioridad, en paralelo', 'Recuperar lista dormida sin arriesgar deliverability.', 'Serie enviada; reactivados a S4.', 'Email', 'organico', '7jun', '2026-06-07', '2026-06-07', 33)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['33'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['33'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '3–4 emails de reactivación a S5.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Quien reabre → sube a S4.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'El resto se aparca.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #34 [F3] Cierre de carrito 30 jun 23:59 + suprimir compradores
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 34, 'Cierre de carrito 30 jun 23:59 + suprimir compradores', 'Cerrar limpio y exprimir el último día.', 'Carrito cerrado a horario; comunicación ejecutada.', 'Carrito/Precio', 'organico', '30jun', '2026-06-30', '2026-06-30', 34)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['34'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['34'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Emails C10–C12 escalando.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'WhatsApp 3x.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Cerrar 23:59 PET; suprimir compradores.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #35 [F4] Plataforma del reto + acceso para compradores
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F4')::uuid, 35, 'Plataforma del reto + acceso para compradores', 'Acceso al reto sin fricción el 1 jul.', 'Un comprador de prueba accede.', 'Reto', 'infra', '≤29jun', NULL, '2026-06-29', 35)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['35'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['35'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Configurar plataforma/acceso.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Sincronizar compradores Whop → acceso.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Probar con cuenta de prueba.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
  END IF;

  -- #36 [F4] Onboarding + grupos del reto en WhatsApp
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F4')::uuid, 36, 'Onboarding + grupos del reto en WhatsApp', 'Arrancar el reto con comunidad lista.', 'Grupos del reto con los compradores dentro.', 'WA Grupos', 'organico', '≤1jul', NULL, '2026-07-01', 36)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['36'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['36'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Grupo(s) del reto.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Onboarding + reglas.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Calendario de acompañamiento diario.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
  END IF;

  -- #37 [F4] Material del reto (plan 21 días + recetas)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F4')::uuid, 37, 'Material del reto (plan 21 días + recetas)', 'Contenido del reto listo.', 'Material completo y cargado.', 'Reto', 'organico', '≤1jul', NULL, '2026-07-01', 37)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['37'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['37'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Plan 21 días + recetas de chef.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Tips diarios.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Sin números; hábitos y bienestar.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
  END IF;

  -- #38 [F4] Proceso de cierre del HT (clase + secuencia + closer) — 
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F4')::uuid, 38, 'Proceso de cierre del HT (clase + secuencia + closer) — palanca $90K', 'Montar el cierre del high-ticket: mayor retorno de la campaña.', 'Cierre listo y agendado antes del Día 17.', 'HT/Backend', 'organico', '≤16jul', NULL, '2026-07-16', 38)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['38'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['38'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Clase/sesión de cierre en el grupo del reto.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Secuencia 3–4 msj presentando el Acompañamiento ($580).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Closer 1:1 + guion.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Enmarcar como continuidad.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #39 [F4] Segmentar compradores más activos del reto para el HT
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F4')::uuid, 39, 'Segmentar compradores más activos del reto para el HT', 'Priorizar a quienes más convierten al HT.', 'Lista priorizada para el cierre.', 'HT/Backend', 'infra', '14jul', '2026-07-14', '2026-07-14', 39)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['39'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['39'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Identificar los más activos (WhatsApp + avance).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Lista prioritaria para el closer.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Personalizar la oferta.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #40 [F4] Upsell HT en vivo (Día 17–21)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F4')::uuid, 40, 'Upsell HT en vivo (Día 17–21)', 'El cierre del HT — donde se decide si tocamos los $90K.', 'Ofertas enviadas, cierres en marcha, conversión medida.', 'HT/Backend', 'organico', '17–21jul', '2026-07-17', '2026-07-21', 40)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['40'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['40'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Correr la clase de cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Secuencia + closer 1:1.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Medir conversión a HT (6%).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #41 [F1] Configurar el BOT de WhatsApp (sistema de challenges) + 
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 41, 'Configurar el BOT de WhatsApp (sistema de challenges) + inscripción de registrantes', 'Canal automatizado paralelo a los grupos.', 'Un registrante de prueba queda inscrito y recibe la secuencia.', 'WA Bot', 'organico', '7jun', '2026-06-07', '2026-06-07', 41)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['41'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['41'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Conectar el bot al sistema de challenges + inscribir registrantes.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Cadencia: 2 días · 48h · 24h · 2h · 30min antes.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Anuncios puntuales (carrito/flips/cierre).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Contenido de Tomás; tracked links Hyros.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #42 [F3] BOT WhatsApp: anuncios de carrito (olas de precio + cier
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 42, 'BOT WhatsApp: anuncios de carrito (olas de precio + cierre)', 'Riel automatizado de urgencia, paralelo a Elba.', 'Anuncios en cada hito; compradores excluidos.', 'WA Bot', 'organico', '10–30jun', '2026-06-10', '2026-06-30', 42)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['42'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['42'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Anuncio en cada flip (17 y 24) + cierre (30).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Link de checkout con tracked link.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Suprimir compradores.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #43 [F2] Guion de la masterclass sobre estructura de 15 partes
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 43, 'Guion de la masterclass sobre estructura de 15 partes', 'La masterclass es la palanca #1.', 'Guion con el primer CTA antes del cierre.', 'Webinar', 'organico', '9jun', '2026-06-09', '2026-06-09', 43)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['43'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['43'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '15 bloques: hook → historia → problema → dolores → epifanía → solución → cambio de paradigma → resultados → transición → producto → anclaje de VALOR → 1er CTA → bonus → urgencia → prueba social + CTA final.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Primer CTA al 10–20%, no al final.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Anclaje de VALOR, nunca precio futuro.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #44 [F2] Stack del día D (toques en vivo + mini-VSL post + bonus 
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 44, 'Stack del día D (toques en vivo + mini-VSL post + bonus + replay)', 'Subir retención y capturar el ~40% del valor del replay.', 'Toques guionados, mini-VSL, bonus, replay programado.', 'Webinar', 'organico', '9–10jun', '2026-06-09', '2026-06-10', 44)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['44'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['44'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Vivo: 4 anchors (dolores → método → testimonios → ''momento importante'').');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Post: mini-VSL + stories en vivo + grabación.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Bonus por asistir → +22% show-up.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Replay a no-shows con deadline.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;
  END IF;

  -- #45 [F2] Checklist técnico pre-evento end-to-end
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 45, 'Checklist técnico pre-evento end-to-end', 'Evitar un fallo el día D que tire semanas de captación.', 'Flujo probado de punta a punta.', 'Webinar', 'infra', '8–9jun', '2026-06-08', '2026-06-09', 45)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['45'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['45'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Stream + internet de respaldo.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'ManyChat con usuario real + grupos con admin.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Landing + pixel + replay grabándose.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Checkout Whop end-to-end (compra desde Perú).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #46 [F2] Q&A post-evento (~12–13 jun) con objeciones reales del g
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 46, 'Q&A post-evento (~12–13 jun) con objeciones reales del grupo', 'Recuperar 20–25% de no-shows/indecisos.', 'Q&A hecho; indecisos reactivados.', 'Webinar', 'organico', '12–13jun', '2026-06-12', '2026-06-13', 46)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['46'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['46'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Recolectar objeciones top de DMs/grupo.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Q&A respondiéndolas + empuje a indecisos.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Dentro de la ventana $67.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;
  END IF;

  -- #47 [F3] Loop Ventas→Contenido lite (quiz + DMs + grupo → emails 
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 47, 'Loop Ventas→Contenido lite (quiz + DMs + grupo → emails + hooks)', 'El quiz es una mina de lenguaje del avatar sin explotar.', 'Doc vivo; 1 insight/día al copy.', 'Contenido', 'organico', '10–30jun', '2026-06-10', '2026-06-30', 47)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['47'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['47'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Doc vivo actualizado diario.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Capturar objeciones + frases del quiz/ManyChat/grupo.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Top del día → email/WhatsApp + hooks.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;
  END IF;

  -- #48 [F3] Script de las 6 objeciones (para grupo y DM)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 48, 'Script de las 6 objeciones (para grupo y DM)', 'Convertir indecisos con preguntas, no defensas.', 'Script en manos de Elba/Mau.', 'WA Grupos', 'organico', '9jun', '2026-06-09', '2026-06-09', 48)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['48'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['48'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Precio / tiempo / duda / pareja / ''lo pienso'' / otro programa.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Reframe salud-energía, tuteo empático.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Sirve para carrito y HT.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #49 [F3] Whop: order bump + upsell post-checkout
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 49, 'Whop: order bump + upsell post-checkout', 'Subir AOV + plantar el HT automatizado.', 'Order bump + upsell configurados y testeados.', 'Whop', 'infra', '9jun', '2026-06-09', '2026-06-09', 49)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['49'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['49'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Order bump brand-safe (ej. recetario premium).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Upsell post-compra con video/copy.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Tracked links; sin claims de peso.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
  END IF;

  -- #50 [F4] HT sales system (VSL post-agenda + llamada 6 pasos + cha
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F4')::uuid, 50, 'HT sales system (VSL post-agenda + llamada 6 pasos + chat pre-agenda + 3 toques)', 'Sin sistema, el HT $580 vende por suerte.', 'Sistema HT listo antes del Día 17.', 'HT/Backend', 'organico', '≤16jul', NULL, '2026-07-16', 50)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['50'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['50'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'VSL post-agenda ~17 secciones (reutilizable).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Llamada 6 pasos: hielo → objetivo → cualificación → resumen → oferta → cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Chat pre-agenda + 3 toques 12h/30h/48h.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Garantía + resultado-en-21-días (Hormozi).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #51 [F0] Completar el checklist de tracking Hyros (35 ítems · doc
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 51, 'Completar el checklist de tracking Hyros (35 ítems · doc aparte)', 'Medir absolutamente todos los canales.', 'Checklist Hyros al 100%; todos los canales atribuyen.', 'Tracking', 'infra', 'HOY–7jun', '2026-06-07', '2026-06-07', 51)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['51'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['51'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Ejecutar los 10 bloques (A–J) del checklist Hyros.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Source-of-truth + validación de valor con compra de prueba.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Dashboards: CPA real por canal, ROAS, mix paid/orgánico.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #52 [F1] Germán graba los bloques modulares (hooks + problema + s
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 52, 'Germán graba los bloques modulares (hooks + problema + solución + mecánica + cierre) + B-roll', 'Materia prima de los anuncios.', 'Bloques + B-roll grabados y subidos.', 'Creativo', 'organico', '7–8jun', '2026-06-07', '2026-06-08', 52)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['52'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['52'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Grabar por bloques (2–3 tomas c/u).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Mismo outfit/luz/encuadre/mic.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'B-roll: cocina, ingredientes, platos, WhatsApp.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Sin números corporales.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
  END IF;

  -- #53 [F1] Editar los anuncios de la matriz de permutaciones (frío/
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 53, 'Editar los anuncios de la matriz de permutaciones (frío/warm)', 'Convertir los bloques en los anuncios de C1/C3.', '8–12 anuncios listos para paid.', 'Creativo', 'inorganico', '7–9jun', '2026-06-07', '2026-06-09', 53)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['53'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['53'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Ola 1 de frío (test de hooks) + warm.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'B-roll cada 2–3s, CTA a mitad, subtítulos.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'NO mezclar formatos.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Fecha/precio solo en overlay, no en audio.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #54 [F1] QA de marca + compliance en TODOS los assets (gate antes
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 54, 'QA de marca + compliance en TODOS los assets (gate antes de publicar)', 'Que nada salga off-brand ni con riesgo de Meta.', 'Todos los assets pasan el gate; Cris aprueba.', 'QA', 'infra', '7–9jun', '2026-06-07', '2026-06-09', 54)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['54'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['54'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Anti-dieta: sin peso/calorías/IMC/antes-después.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Sin condiciones médicas, sin IA, tuteo, ''pacientes'', chef.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'NO anclar precio futuro.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Sin claims de ingresos ni garantías agresivas.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #55 [F5] Configurar reportes diarios / scorecard del lanzamiento
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F5')::uuid, 55, 'Configurar reportes diarios / scorecard del lanzamiento', 'Ver el lanzamiento en números cada día.', 'Reporte diario corriendo desde el webinar.', 'Ops', 'infra', '10jun', '2026-06-10', '2026-06-10', 55)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['55'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['55'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Scorecard: registros, show-up, CPA por canal, ventas por tramo, ROAS, % HT.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Reporte diario automatizado.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Umbrales de alarma.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #56 [F5] Daily de números + decisión (árbol de optimización)
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F5')::uuid, 56, 'Daily de números + decisión (árbol de optimización)', 'No volar a ciegas: leer métricas en orden.', 'Decisión diaria documentada.', 'Ops', 'infra', 'diario carrito', NULL, NULL, 56)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['56'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['56'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'hook→hold→CTR→CPL→CPA→freq.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'CPA alto con CTR sano → revisar funnel.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Escalar ganadores +20%/48h.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #57 [F5] Capturar testimonios de pacientes durante el reto
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F5')::uuid, 57, 'Capturar testimonios de pacientes durante el reto', 'Munición para HT, carrito de C3 y prueba social.', 'Banco de testimonios creciendo.', 'Reto', 'organico', '1–21jul', '2026-07-01', '2026-07-21', 57)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['57'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['57'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Pedir testimonios en el grupo (energía/digestión/bienestar).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Video + texto, con permiso.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Etiquetar por dolor/objeción.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;
  END IF;

  -- #58 [F5] Post-mortem del lanzamiento + handoff a C3
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F5')::uuid, 58, 'Post-mortem del lanzamiento + handoff a C3', 'Capturar aprendizajes y alimentar la máquina mensual.', 'Post-mortem documentado; C3 actualizado.', 'Ops', 'infra', '≤5jul', NULL, '2026-07-05', 58)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['58'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['58'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Números finales vs target.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Qué funcionó/qué no por canal.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Learnings C3 + memoria + loop.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #59 [F0] DECISIÓN checkout: Whop hosted = oficial para C2; embedd
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 59, 'DECISIÓN checkout: Whop hosted = oficial para C2; embedded NO entra a producción antes del pico', 'Evitar el SPOF #1: cambiar la infra de cobro durante un lanzamiento de ~$90K.', 'Decisión comunicada; prod corre 100% en hosted para el webinar.', 'Checkout', 'infra', 'HOY', NULL, NULL, 59)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['59'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['59'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Confirmar con dirección (Cris): hosted es el checkout de C2.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Si hay migración a medias, revertir a hosted antes del 10 jun.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'El embedded se construye en branch y hace cutover post-pico / C3.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #60 [F0] Confirmar checkout hosted listo: links $67/$77/$87 + mét
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 60, 'Confirmar checkout hosted listo: links $67/$77/$87 + métodos LATAM + cuotas', 'Que el checkout convierta en Perú desde el día 1.', 'Hosted cobra los 3 precios con métodos locales activos.', 'Checkout', 'infra', '8-9jun', '2026-06-08', '2026-06-09', 60)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['60'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['60'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Verificar los 3 precios/cupones de la escalera en hosted.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Activar tarjeta en cuotas + evaluar Mercado Pago/Yape/PSE.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Confirmar moneda y descriptor de tarjeta claro.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
  END IF;

  -- #61 [F3] Construir embedded checkout en branch del monorepo (sin 
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 61, 'Construir embedded checkout en branch del monorepo (sin tocar prod)', 'Dejar listo el checkout en dominio propio para cutover post-pico.', 'Embed funcional en sandbox, en branch, sin tocar producción.', 'Checkout', 'infra', '11-16jun', '2026-06-11', '2026-06-16', 61)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['61'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['61'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '@whop/checkout: embed + pricing.ts (fecha→plan $67/$77/$87, muestra SOLO precio actual).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'onComplete → Pixel+CAPI+Hyros (1 event_id, dedup) + webhook payment.succeeded server-side.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Apple/Google Pay + domain verification + returnUrl/3DS.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #62 [F3] Test E2E del embedded (sandbox): 3DS + métodos LATAM + H
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 62, 'Test E2E del embedded (sandbox): 3DS + métodos LATAM + Hyros/CAPI sin doble conteo', 'No migrar nada sin validar valor y atribución.', 'Tracking del embed validado, valor correcto, sin doble conteo.', 'Tracking', 'infra', '15-16jun', '2026-06-15', '2026-06-16', 62)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['62'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['62'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Compra de prueba sandbox end-to-end (3DS + métodos LATAM).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Validar Purchase con valor correcto en Hyros + Meta, 1 solo conteo.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Webhook dispara fan-out idéntico para tarjeta/PayPal/crypto.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #63 [F3] Cutover controlado a embedded post-pico (~18 jun) con fa
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 63, 'Cutover controlado a embedded post-pico (~18 jun) con fallback 1-click a hosted', 'Capturar la mejora de atribución sin arriesgar el pico del webinar.', 'Embed en prod estable o rollback ejecutado sin pérdida de ventas.', 'Checkout', 'infra', '~18jun', '2026-06-18', '2026-06-18', 63)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['63'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['63'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Compra real de prueba en prod (monto bajo + refund).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Flip de tráfico a embed manteniendo hosted como fallback inmediato.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Monitorear CR/CPA/atribución 48h; si cae, rollback a hosted.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #64 [F1] Programar el calendario de contenido orgánico (reels + s
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 64, 'Programar el calendario de contenido orgánico (reels + stories, 6–30 jun)', 'Sostener registros y la urgencia de la escalera con contenido diario.', 'Calendario programado; cada día tiene reel + stories asignados.', 'IG Orgánico', 'organico', '6-30jun', '2026-06-06', '2026-06-30', 64)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['64'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['64'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Cargar el calendario día-a-día (doc Calendario de Contenido).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Reels por ángulo de la matriz; stories por secuencia y fase.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Picos en webinar (10), flips (16/23) y cierre (30).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #65 [F1] Cargar las 6 secuencias de stories (keyword RETO) conect
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 65, 'Cargar las 6 secuencias de stories (keyword RETO) conectadas a ManyChat', 'Que cada secuencia capture el lead automáticamente.', 'Las 6 secuencias listas y disparan ManyChat al responder RETO.', 'ManyChat', 'organico', '7-9jun', '2026-06-07', '2026-06-09', 65)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['65'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['65'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Secuencias: registro, show-up, día del evento, $67, flip $77, flip $87+cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Keyword RETO en slide 1 y último; sticker/CTA por slide.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Probar el flujo story→DM→opt-in.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #66 [F0] Publicar T&C + Política de Reembolso + Privacidad + disc
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 66, 'Publicar T&C + Política de Reembolso + Privacidad + disclaimer de salud (visibles en checkout)', 'Compliance Meta + protección en disputas/chargebacks + riesgo salud.', 'Las 3 páginas + disclaimer live y enlazadas antes de prender ads.', 'Legal', 'infra', '8-9jun', '2026-06-08', '2026-06-09', 66)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['66'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['66'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '3 páginas legales públicas y enlazadas en el checkout.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Disclaimer ''no sustituye consejo médico'' en landing/reto/grupo.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Datos del vendedor visibles antes de pagar.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #67 [F0] Consentimiento Habeas Data Perú para el dato de salud de
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 67, 'Consentimiento Habeas Data Perú para el dato de salud del diagnóstico', 'El quiz recolecta dato sensible de salud (Ley 29733).', 'El registro no avanza sin consentimiento explícito del dato de salud.', 'Legal', 'infra', '8-9jun', '2026-06-08', '2026-06-09', 67)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['67'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['67'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Checkbox de consentimiento explícito para tratar el resultado del diagnóstico.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Declarar finalidad + link a política de privacidad en el registro.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Guardar registro del consentimiento.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #68 [F2] Asignar soporte de pago + DMs con SLA <1h durante el car
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F2')::uuid, 68, 'Asignar soporte de pago + DMs con SLA <1h durante el carrito', 'Cada minuto sin responder un problema de pago = venta perdida o refund.', 'Canal de soporte con responsable y SLA para todo el carrito.', 'Soporte', 'infra', '10-30jun', '2026-06-10', '2026-06-30', 68)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['68'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['68'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Humano de guardia en horas de carrito (email + 1 WhatsApp).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Refuerzo en webinar (10), flips (17/24) y cierre (30).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Macros para los 8–10 problemas típicos de checkout.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
  END IF;

  -- #69 [F0] Higiene anti-chargeback: descriptor claro + email confir
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 69, 'Higiene anti-chargeback: descriptor claro + email confirmación inmediato + acceso instantáneo', 'Un launch a frío en LATAM con ticket bajo es zona de chargeback; protege la pasarela.', 'Confirmación + acceso instantáneos; descriptor claro; refund con dueño.', 'Checkout', 'infra', '9jun', '2026-06-09', '2026-06-09', 69)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['69'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['69'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Descriptor de tarjeta legible (''DESINFLAMATE21'').');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Email de confirmación inmediato con qué compró + acceso.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Política de refund definida (días + quién la ejecuta).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
  END IF;

  -- #70 [F3] Secuencia onboarding anti-refund (puente compra 10–30 ju
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F3')::uuid, 70, 'Secuencia onboarding anti-refund (puente compra 10–30 jun → inicio 1 jul)', 'Evitar arrepentimiento/refund en la espera previa al reto.', 'Compradores reciben nurture entre la compra y el 1 jul.', 'Email', 'organico', '10-30jun', '2026-06-10', '2026-06-30', 70)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['70'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['70'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Bienvenida inmediata + ''qué hacer mientras empieza''.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Micro-valor + refuerzo de la decisión + recordatorio de la fecha.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Suprimir a esta gente del retargeting de venta.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #71 [F0] Backups & SPOF: 2FA app (IG/Meta/Whop) + admins respaldo
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 71, 'Backups & SPOF: 2FA app (IG/Meta/Whop) + admins respaldo + cuenta ads respaldo + Stripe link emergencia + export lista/grabación ×2', 'Que un baneo o caída de una cuenta no mate el lanzamiento.', '2FA activo, respaldos listos, exports automatizados.', 'Ops', 'infra', '8-9jun', '2026-06-08', '2026-06-09', 71)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['71'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['71'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '2FA por app (no SMS) + admins de respaldo en IG/Meta/Whop.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Cuenta de ads de respaldo verificada + Stripe Payment Link de emergencia.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Export periódico de lista + registrantes + grabación del webinar (×2).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #72 [F5] Medir split real paid/orgánico ('¿cómo te enteraste?') +
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F5')::uuid, 72, 'Medir split real paid/orgánico (''¿cómo te enteraste?'') + funnel intermedio del webinar', 'En C1 ~60% fue orgánico y solo se vio el 40% atribuido. No sub/sobre-invertir.', 'Scorecard muestra mix paid/orgánico real + drop por etapa.', 'Tracking', 'infra', '10jun+', '2026-06-10', '2026-06-10', 72)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['72'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['72'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '''¿Cómo te enteraste?'' en checkout o post-compra.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Instrumentar registro→show→pitch→clic-checkout→compra.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Cruzar con Hyros para el mix real.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- #73 [F0] Confirmar que el bot de WhatsApp corre sobre API oficial
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F0')::uuid, 73, 'Confirmar que el bot de WhatsApp corre sobre API oficial (no wrapper gris)', 'Un ban de WhatsApp el día del webinar mata el canal de mayor conversión.', 'Bot sobre API oficial confirmado; riesgo de ban mitigado.', 'WA Bot', 'infra', '7jun', '2026-06-07', '2026-06-07', 73)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['73'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['73'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Verificar que inscripción + broadcasts usan WhatsApp Business API oficial.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Si usa número personal/wrapper, mitigar o migrar.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Plan B de comunicación si WA cae.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
  END IF;

  -- #74 [F1] Retargeting de quiz-abandoners (empezaron el diagnóstico
  INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
  VALUES (v_launch, (v_phase->>'F1')::uuid, 74, 'Retargeting de quiz-abandoners (empezaron el diagnóstico y no terminaron)', 'Recuperar leads de altísima intención que hoy se pierden.', 'Abandoners reciben un toque dedicado para completar el registro.', 'Meta Ads', 'inorganico', '8-30jun', '2026-06-08', '2026-06-30', 74)
  ON CONFLICT (launch_id, source_index) WHERE source_index IS NOT NULL DO UPDATE SET
    phase_id = EXCLUDED.phase_id, title = EXCLUDED.title, objective = EXCLUDED.objective,
    definition_of_done = EXCLUDED.definition_of_done, channel = EXCLUDED.channel,
    workstream = EXCLUDED.workstream, due_label = EXCLUDED.due_label,
    due_start = EXCLUDED.due_start, due_end = EXCLUDED.due_end, position = EXCLUDED.position
  RETURNING id, (xmax = 0) INTO v_id, v_isnew;
  v_tasks := jsonb_set(v_tasks, ARRAY['74'], to_jsonb(v_id::text));
  v_new  := jsonb_set(v_new,  ARRAY['74'], to_jsonb(v_isnew));
  IF v_isnew THEN
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Capturar evento ''inició diagnóstico'' sin completar.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Audiencia/segmento de abandoners.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Anuncio/email/DM específico para que terminen y se registren.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
  END IF;

  -- dependencies (only for newly created tasks) ------------------------------
  IF (v_new->>'3')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'3')::uuid, (v_tasks->>'2')::uuid); END IF;
  IF (v_new->>'4')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'4')::uuid, (v_tasks->>'1')::uuid); END IF;
  IF (v_new->>'4')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'4')::uuid, (v_tasks->>'2')::uuid); END IF;
  IF (v_new->>'6')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'6')::uuid, (v_tasks->>'1')::uuid); END IF;
  IF (v_new->>'6')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'6')::uuid, (v_tasks->>'4')::uuid); END IF;
  IF (v_new->>'9')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'9')::uuid, (v_tasks->>'2')::uuid); END IF;
  IF (v_new->>'10')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'10')::uuid, (v_tasks->>'9')::uuid); END IF;
  IF (v_new->>'11')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'11')::uuid, (v_tasks->>'2')::uuid); END IF;
  IF (v_new->>'11')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'11')::uuid, (v_tasks->>'9')::uuid); END IF;
  IF (v_new->>'13')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'13')::uuid, (v_tasks->>'3')::uuid); END IF;
  IF (v_new->>'13')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'13')::uuid, (v_tasks->>'4')::uuid); END IF;
  IF (v_new->>'13')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'13')::uuid, (v_tasks->>'12')::uuid); END IF;
  IF (v_new->>'14')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'14')::uuid, (v_tasks->>'7')::uuid); END IF;
  IF (v_new->>'14')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'14')::uuid, (v_tasks->>'8')::uuid); END IF;
  IF (v_new->>'15')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'15')::uuid, (v_tasks->>'11')::uuid); END IF;
  IF (v_new->>'16')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'16')::uuid, (v_tasks->>'14')::uuid); END IF;
  IF (v_new->>'17')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'17')::uuid, 'Tras: grupos creados'); END IF;
  IF (v_new->>'18')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'18')::uuid, (v_tasks->>'13')::uuid); END IF;
  IF (v_new->>'22')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'22')::uuid, (v_tasks->>'1')::uuid); END IF;
  IF (v_new->>'23')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'23')::uuid, (v_tasks->>'1')::uuid); END IF;
  IF (v_new->>'23')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'23')::uuid, (v_tasks->>'4')::uuid); END IF;
  IF (v_new->>'24')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'24')::uuid, (v_tasks->>'8')::uuid); END IF;
  IF (v_new->>'25')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'25')::uuid, (v_tasks->>'19')::uuid); END IF;
  IF (v_new->>'25')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'25')::uuid, (v_tasks->>'20')::uuid); END IF;
  IF (v_new->>'25')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'25')::uuid, (v_tasks->>'21')::uuid); END IF;
  IF (v_new->>'26')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'26')::uuid, (v_tasks->>'13')::uuid); END IF;
  IF (v_new->>'26')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'26')::uuid, (v_tasks->>'25')::uuid); END IF;
  IF (v_new->>'27')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'27')::uuid, (v_tasks->>'6')::uuid); END IF;
  IF (v_new->>'27')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'27')::uuid, (v_tasks->>'25')::uuid); END IF;
  IF (v_new->>'28')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'28')::uuid, (v_tasks->>'25')::uuid); END IF;
  IF (v_new->>'36')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'36')::uuid, (v_tasks->>'36')::uuid); END IF;
  IF (v_new->>'39')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'39')::uuid, (v_tasks->>'39')::uuid); END IF;
  IF (v_new->>'40')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'40')::uuid, 'Tras: proceso HT + segmentación'); END IF;
  IF (v_new->>'41')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'41')::uuid, 'Tras: landing + registro'); END IF;
  IF (v_new->>'42')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'42')::uuid, 'Tras: bot configurado'); END IF;
  IF (v_new->>'43')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'43')::uuid, 'Rescatado del playbook'); END IF;
  IF (v_new->>'44')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'44')::uuid, 'Tras: guion'); END IF;
  IF (v_new->>'46')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'46')::uuid, 'Tras: webinar'); END IF;
  IF (v_new->>'49')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'49')::uuid, 'Tras: checkout Whop'); END IF;
  IF (v_new->>'50')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'50')::uuid, 'Tras: proceso HT'); END IF;
  IF (v_new->>'53')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'53')::uuid, 'Tras: grabación'); END IF;
  IF (v_new->>'56')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'56')::uuid, 'Tras: scorecard'); END IF;
  IF (v_new->>'58')::boolean THEN INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'58')::uuid, 'Tras: cierre'); END IF;
  IF (v_new->>'61')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'61')::uuid, (v_tasks->>'59')::uuid); END IF;
  IF (v_new->>'62')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'62')::uuid, (v_tasks->>'60')::uuid); END IF;
  IF (v_new->>'63')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'63')::uuid, (v_tasks->>'61')::uuid); END IF;
  IF (v_new->>'65')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'65')::uuid, (v_tasks->>'9')::uuid); END IF;
  IF (v_new->>'67')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'67')::uuid, (v_tasks->>'2')::uuid); END IF;
  IF (v_new->>'73')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'73')::uuid, (v_tasks->>'41')::uuid); END IF;
  IF (v_new->>'74')::boolean THEN INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'74')::uuid, (v_tasks->>'2')::uuid); END IF;

  -- kpis ----------------------------------------------------------------------
  INSERT INTO launch_ops.kpi (launch_id, key, label, target_label, unit, is_computed, formula, position) VALUES (v_launch, 'registros', 'Registros', '~7–8K', '#', false, NULL, 0) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.kpi (launch_id, key, label, target_label, unit, is_computed, formula, position) VALUES (v_launch, 'show_up', 'Show-up %', '25–40%', '%', false, NULL, 1) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.kpi (launch_id, key, label, target_label, unit, is_computed, formula, position) VALUES (v_launch, 'compradores', 'Compradores reto', '800', '#', false, NULL, 2) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.kpi (launch_id, key, label, target_label, unit, is_computed, formula, position) VALUES (v_launch, 'conv_ht', '% Conversión a HT', '6%', '%', false, NULL, 3) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.kpi (launch_id, key, label, target_label, unit, is_computed, formula, position) VALUES (v_launch, 'roas', 'ROAS real (Hyros)', 'source of truth', 'x', false, NULL, 4) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.kpi (launch_id, key, label, target_label, unit, is_computed, formula, position) VALUES (v_launch, 'revenue', 'Revenue estimado C2', '~$90K', '$', true, 'compradores*76 + compradores*(conv_ht/100)*580', 5) ON CONFLICT (launch_id, key) DO NOTHING;

  -- resources ------------------------------------------------------------------
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'landings', 'l_reg', 'Landing registro + diagnóstico', 'nico', 0) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'landings', 'l_vsl', 'VSL / página de venta', 'mau', 1) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'landings', 'l_ty', 'Thank-you page', 'nico', 2) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'landings', 'l_checkout', 'Checkout Whop (producto $87)', 'mau', 3) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'landings', 'l_coupons', 'Cupones de precio ($67 / $77)', 'mau', 4) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'comms', 'l_wa1', 'Grupo WhatsApp — activo', 'mau', 5) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'comms', 'l_wa2', 'Grupo WhatsApp — reserva', 'mau', 6) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'comms', 'l_bot', 'Bot WhatsApp (panel/challenges)', 'nico', 7) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'comms', 'l_manychat', 'ManyChat (flow RETO)', 'nico', 8) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'comms', 'l_webinar', 'Sala del webinar (link en vivo)', 'nico', 9) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'comms', 'l_replay', 'Replay del webinar', 'german', 10) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'tracking', 'l_hyros', 'Hyros (dashboard)', 'nico', 11) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'tracking', 'l_meta', 'Meta Ads Manager', 'tomas', 12) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'tracking', 'l_ml', 'MailerLite', 'tomas', 13) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'tracking', 'l_whop', 'Whop (dashboard)', 'mau', 14) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'tracking', 'l_ig', 'Instagram de Germán', 'german', 15) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'assets', 'l_drive', 'Drive de creativos', 'tomas', 16) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'assets', 'l_recetario', 'Recetario (entrega)', 'german', 17) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'assets', 'l_quiz', 'Diagnóstico / Quiz', 'nico', 18) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'docs', 'l_d1', 'Brief AISLADO (maestro)', NULL, 19) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'docs', 'l_d2', 'Secuencias de Email (16)', NULL, 20) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'docs', 'l_d3', 'Estructura de Grabación', NULL, 21) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'docs', 'l_d4', 'Matriz de Permutaciones', NULL, 22) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'docs', 'l_d5', 'Checklist de Tracking (Hyros)', NULL, 23) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'docs', 'l_d6', 'Dev-brief del tracker', NULL, 24) ON CONFLICT (launch_id, key) DO NOTHING;
  INSERT INTO launch_ops.resource (launch_id, category, key, label, owner_key, position) VALUES (v_launch, 'docs', 'l_d7', 'Análisis playbooks', NULL, 25) ON CONFLICT (launch_id, key) DO NOTHING;

  -- content_item (Calendario): seed-owned, read-first -> delete + reinsert ----
  DELETE FROM launch_ops.content_item WHERE launch_id = v_launch;
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'matrix_row', 'IG orgánico', NULL, NULL, NULL, 'IG orgánico', 'Pre · 6–9: Reels+stories (registro) · Webinar · 10: Stack día D + abre $67 · $67 · 10–16: Olas testimonio · $77 · 17–23: Valor+social · $87/cierre · 24–30: Escasez+cierre · Reto+HT · jul: Testimonios→HT', 0);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'matrix_row', 'Email', NULL, NULL, NULL, 'Email', 'Pre · 6–9: Warm-up + A1–A3 + R1–R4 · Webinar · 10: R en vivo + C1 · $67 · 10–16: C2–C5 · $77 · 17–23: C6–C8 · $87/cierre · 24–30: C9–C12 cierre · Reto+HT · jul: Onboarding→HT', 1);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'matrix_row', 'WA grupos (Elba)', NULL, NULL, NULL, 'WA grupos (Elba)', 'Pre · 6–9: Bienvenida + tips · Webinar · 10: Recordatorios + en vivo · $67 · 10–16: Testimonios + ancla flip · $77 · 17–23: Testimonios · $87/cierre · 24–30: Cierre 3× · Reto+HT · jul: Reto + HT', 2);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'matrix_row', 'WA bot', NULL, NULL, NULL, 'WA bot', 'Pre · 6–9: 2d/48h/24h antes · Webinar · 10: 2h/30min + en vivo · $67 · 10–16: — · $77 · 17–23: Flip $77 · $87/cierre · 24–30: Flip $87 + cierre · Reto+HT · jul: Onboarding', 3);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'matrix_row', 'ManyChat', NULL, NULL, NULL, 'ManyChat', 'Pre · 6–9: Keyword RETO + opt-in · Webinar · 10: Recordatorio + link · $67 · 10–16: Link checkout · $77 · 17–23: Link + flip · $87/cierre · 24–30: Link + cierre · Reto+HT · jul: —', 4);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'matrix_row', 'Paid (Meta)', NULL, NULL, NULL, 'Paid (Meta)', 'Pre · 6–9: C1 Registro frío+warm · Webinar · 10: → C3 Carrito hot · $67 · 10–16: C3 retargeting · $77 · 17–23: C3 · $87/cierre · 24–30: C3 push cierre · Reto+HT · jul: (off)', 5);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'matrix_row', 'Webinar', NULL, NULL, NULL, 'Webinar', 'Pre · 6–9: — · Webinar · 10: MASTERCLASS 8pm · $67 · 10–16: Replay + Q&A 12–13 · $77 · 17–23: — · $87/cierre · 24–30: — · Reto+HT · jul: —', 6);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-06', 'Sáb 6', 'PRE', 'Energía: "Te levantas cansado aunque dormiste 8h, no es normal — ni tu edad."', 'Sec. (a) registro. Anuncia masterclass 10 jun + RETO.', 7);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-07', 'Dom 7', 'PRE', 'Antojos: "Los antojos de las 5pm no son falta de voluntad. Es inflamación."', 'Re-anuncio + sticker "¿tu peor hora de antojos?"', 8);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-08', 'Lun 8', 'PRE', 'Autoridad chef: "Soy chef y nutricionista. La ''comida sana'' que ves te inflama más."', 'BTS cocinando + (a) comprimida. Pico de captación.', 9);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-09', 'Mar 9', 'PRE', 'Momento: "Siempre dices ''el lunes empiezo''. Mañana te muestro por qué es AHORA."', 'Sec. (b) show-up. "Mañana 8pm" + countdown.', 10);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-10', 'Mié 10', 'EVENTO $67', 'Ya-me-conoces: "Hoy 8pm en vivo. Apagar la inflamación sin dietas locas. ¿Vienes?"', 'Sec. (c) día del evento en olas. Post-webinar abre $67 → sec. (d).', 11);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-11', 'Jue 11', '$67', 'Energía/oferta: "Anoche abrí el reto. Esto cambia en 21 días al bajar la inflamación."', 'Sec. (d) carrito $67. "Mejor precio que va a tener."', 12);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-12', 'Vie 12', '$67', 'Prueba: "Una paciente: ''3 días sin antojos de noche.''"', 'Mini-FAQ: "¿paso hambre?" no · "¿es keto?" no.', 13);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-13', 'Sáb 13', '$67', 'Anti-dieta: "Esto NO es dieta. No cuentas nada. Comes rico y te desinflamas."', 'BTS + recordatorio precio vigente.', 14);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-14', 'Dom 14', '$67', 'Momento: "Empieza 1 jul. Si entras esta semana, mejor precio. Después sube."', 'Ventana $67 cerca del final. Testimonio + sticker.', 15);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-15', 'Lun 15', '$67', 'Autoridad+prueba: "No es lo que comes de más, es lo que te inflama."', '"El precio de entrada cierra mañana." (sin anclar siguiente)', 16);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-16', 'Mar 16', 'ÚLT. $67', 'Urgencia: "Hoy último día al precio de entrada. Mañana sube."', 'Sec. (e) "última llamada $67", 3 micro-olas. Cierra 23:59.', 17);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-17', 'Mié 17', '$77', 'Energía/reset: "El reto arranca 1 jul. Todavía estás a tiempo de entrar."', 'Sec. (e) "ya cambió, sigue abierto". Foco cupo.', 18);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-18', 'Jue 18', '$77', 'Antojos/mecanismo: "¿Por qué se te antoja dulce tras almorzar? El ciclo de inflamación."', 'Educación + 1 testimonio.', 19);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-19', 'Vie 19', '$77', 'Anti-dieta+social: "La gente del reto no está ''a dieta''. Come y se siente mejor."', 'Carrusel de capturas de comunidad.', 20);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-20', 'Sáb 20', '$77', 'Momento: "En 11 días empieza. ¿Llegas a julio igual o distinto?"', 'BTS cocina + recordatorio precio vigente.', 21);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-21', 'Dom 21', '$77', 'Ya-me-conoces: "Si me sigues hace tiempo y nunca diste el paso, este es el reto."', 'Q&A en vivo con sticker de preguntas.', 22);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-22', 'Lun 22', '$77', 'Autoridad+antojos: testimonio de claridad mental/energía.', '"El precio vuelve a subir pronto." (sin número futuro)', 23);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-23', 'Mar 23', 'ÚLT. $77', 'Urgencia: "Hoy cierra este precio. Mañana sube por última vez antes del reto."', 'Sec. (f) "última subida", 3 micro-olas. Cierra 23:59.', 24);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-24', 'Mié 24', '$87', 'Escasez: "Última semana. Arranca 1 jul y los cupos no son infinitos."', 'Sec. (f) "último tramo abierto". Motor = deadline carrito.', 25);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-25', 'Jue 25', '$87', 'Transformación: "Imagina llegar a julio sin hinchazón ni bajón de las 4pm."', 'Testimonio + "quedan días para entrar".', 26);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-26', 'Vie 26', '$87', 'Objeción: "''No tengo tiempo de cocinar.'' Por eso el reto te da el plan hecho."', 'Demolición de objeciones (tiempo, dudas, garantía).', 27);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-27', 'Sáb 27', '$87', 'Escasez tiempo: "Quedan días para esta cohorte. La próxima… no sé cuándo."', 'Prueba social + countdown al cierre.', 28);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-28', 'Dom 28', '$87', 'Urgencia: "En 2 días cierro el carrito. Si lo piensas, es el momento real."', 'Cierre suave + Q&A express. 3 micro-olas.', 29);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-29', 'Lun 29', 'VÍSPERA', 'Urgencia: "Mañana cierro el carrito. Después no hay forma de entrar a esta cohorte."', 'Modo cierre: testimonios + countdown. Micro-olas.', 30);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'reel', 'IG Orgánico', '2026-06-30', 'Mar 30', 'CIERRE 🔒', 'Urgencia total: "HOY cierra. 11:59pm se acaba. El reto arranca mañana."', 'Sec. (f) cierre en olas cada pocas horas ("menos de X horas"). 23:59 PET.', 31);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'message', '✉️ Email (MailerLite) — secuencia', NULL, NULL, NULL, '✉️ Email (MailerLite) — secuencia', '16 emails segmentados S1–S6. Supresión de compradores siempre. — Pre-webinar: 6 jun warm-up engaged-first (solo Cohort-Cierre) + A1 invitación · 7 jun +S3, A2 · 8 jun +S4, A3 última llamada · 9 jun R1 (1 día antes) · 10 jun R2 mañana + R3 1h + R4 "en vivo" (a S6). — Carrito (Secuencia B, ramificada): 10 jun C1 carrito abierto $67 → C2–C4 valor/urgencia · 16 jun C5 "último día precio de entrada" · 17 jun C6 sigue abierto · 18–22 C7 valor+social · 23 jun C8 última subida · 24–29 C9–C11 último tramo · 30 jun C10–C12 cierre escalando. — Paralelo: S5 reactivación (sunset) desde el 7 · Post-compra: onboarding anti-refund (puente 10 jun→1 jul).', 32);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'message', '💬 WhatsApp grupos (Elba)', NULL, NULL, NULL, '💬 WhatsApp grupos (Elba)', 'Pre (7–10): bienvenida + 1 tip/día (máx 1–3), recordatorio día previo y día del webinar. Coordinar con el bot para no duplicar. — Carrito (10–30): testimonio diario + 1 objeción/día; anclar cada flip (17 y 24); pitch con link; cierre 3× el 30. — Reto (jul): onboarding + acompañamiento diario.', 33);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'message', '🤖 WhatsApp bot (sistema de challenges)', NULL, NULL, NULL, '🤖 WhatsApp bot (sistema de challenges)', 'Recordatorios webinar: 2 días antes (8 jun) · 48h · 24h (9 jun) · 2h · 30 min antes (10 jun). — Carrito: anuncio en cada flip (17, 24) + cierre (30) con tracked links. Suprime compradores. Paralelo a los grupos.', 34);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'message', '📲 ManyChat', NULL, NULL, NULL, '📲 ManyChat', 'Always-on: keyword RETO → DM con link + opt-in → MailerLite S6 + Meta CA. — Recordatorios: día previo / día del webinar / 1h antes. Carrito: link de checkout en cada flip + cierre. Suprime compradores.', 35);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'message', '🎯 Paid (Meta)', NULL, NULL, NULL, '🎯 Paid (Meta)', '7–10 jun: C1 Registro (CBO, objetivo Complete Registration) — adset FRÍO (broad/Advantage+) + WARM (IG engagers). Lectura de hooks 8–9 (matar <25%, escalar 30%+). — 10 jun: pasar a C3 Carrito (Purchase) — hot registrantes + visitantes VSL + warm no-reg, con listas hasheadas. 16/23: alinear creatives a cada flip. 30: push cierre. Bid Highest Volume, adsets consolidados, excluir compradores.', 36);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'message', '🎥 Webinar — día D (10 jun)', NULL, NULL, NULL, '🎥 Webinar — día D (10 jun)', 'AM: reels/stories show-up + bot 2h/30min + email R2/R3. 8pm: masterclass (15 partes, 1er CTA al 10–20%) → abre carrito $67; testimonios + link en WhatsApp durante el pitch. — Post: mini-VSL + replay a no-shows (con deadline). 12–13 jun: Q&A post-evento con objeciones reales.', 37);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'sequence', '📖 Secuencias de stories (resumen)', NULL, NULL, NULL, '(a) Registro / lead-magnet — 6–9 jun', 'Que escriban RETO y entren al embudo. — Cansancio → masterclass gratis 10 jun → autoridad chef → "Escríbeme RETO , cupos limitados".', 38);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'sequence', '📖 Secuencias de stories (resumen)', NULL, NULL, NULL, '(b) Recordatorio / show-up — 9 jun', 'Confirmar asistencia, bajar no-shows. — "MAÑANA 8pm" → qué van a aprender → "no es magia, es bajar la inflamación" → RETO + countdown → "pon la alarma".', 39);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'sequence', '📖 Secuencias de stories (resumen)', NULL, NULL, NULL, '(c) Día del evento — 10 jun (en olas)', 'Show-up final + transición a carrito. — AM "HOY es el día" → mediodía qué aprenden → tarde "¿no tienes acceso? RETO" → 7pm "última llamada 8pm" → al cerrar abre (d).', 40);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'sequence', '📖 Secuencias de stories (resumen)', NULL, NULL, NULL, '(d) Carrito $67 — 10–11 jun', 'Convertir en caliente al mejor precio. — "Está abierto, arranca 1 jul" → qué incluye → "mejor precio que va a tener" → " RETO y te paso el link" → "los rápidos pagan menos".', 41);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'sequence', '📖 Secuencias de stories (resumen)', NULL, NULL, NULL, '(e) Flip a $77 — 16–17 jun', 'Exprimir el deadline sin anclar el número nuevo. — 16 (última llamada $67, 3 micro-olas): "hoy cierra el precio de entrada, mañana sube". 17 (ya subió): "sigue abierto, todavía estás a tiempo, el cupo importa".', 42);
  INSERT INTO launch_ops.content_item (launch_id, kind, channel, day, day_label, stage_label, title, body, position) VALUES (v_launch, 'sequence', '📖 Secuencias de stories (resumen)', NULL, NULL, NULL, '(f) Flip a $87 + cierre — 23–24 + 30 jun', 'Último empuje de precio + cierre absoluto. — 23 (última subida): "hoy cierra, mañana sube por última vez". 30 (cierre, olas/horas): AM "hoy cierra" → "<12h" → 6pm "<6h, últimos cupos" → 9–10pm "<3h, no reabre 🔒".', 43);

  -- message_asset (Mensajes): upsert by key on static fields ------------------
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_1', '🎥 Guion de la masterclass (15 partes)', NULL, 'ready', '03-launch/cohort-2/DI21-C2-Webinar-Guion.md', '15 bloques + 4 anchors + guion de replay + 5 preguntas sembradas. 1er CTA ~min 52–56 (abre $67). Enseña el QUÉ (3 pilares), nunca precio futuro.', '{18,42,24}', 0) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_2', '🎯 Meta Ads — copy por ángulo', NULL, 'ready', 'DI21-C2-Paid-Reels-ManyChat-Copy.md', '7 ángulos × (2 primary text + 3 headlines + description + CTA). Objetivo registro. Copy sin número de precio (blindado para flips).', '{11,12,25,26,73}', 1) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_3', '🎬 Reels — scripts', NULL, 'ready', 'DI21-C2-Paid-Reels-ManyChat-Copy.md', '7 reels pre-webinar (hook 2s → beats → "responde RETO") + 3 reels de carrito (testimonio/oferta/cierre) + paquete de B-roll.', '{51,52,63,14}', 2) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_4', '📖 Stories — 6 secuencias', NULL, 'ready', 'DI21-C2-Calendario-Contenido.html', 'Registro · show-up · día del evento · $67 · flip $77 · flip $87+cierre. Slide-by-slide, keyword RETO, foto-del-creador.', '{64}', 3) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_5', '✉️ Email — secuencia (16)', NULL, 'ready', 'DI21-C2-Secuencias-Email.html', 'Warm-up + A1–A3 + R1–R4 pre · C1–C12 carrito (anclas en flips y cierre) · S5 reactivación · onboarding anti-refund. Segmentos S1–S6.', '{13,15,23,32}', 4) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_6', '💬 WhatsApp grupos (Elba)', NULL, 'ready', 'DI21-C2-WhatsApp-Mensajes.md', 'Bienvenida · 4 tips pre · recordatorios · apertura/prueba social/objeción/anclas de flip · cierre 3× · onboarding + plantilla diaria del reto.', '{16,28,35}', 5) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_7', '🤖 WhatsApp bot', NULL, 'ready', 'DI21-C2-WhatsApp-Mensajes.md', 'Inscripción · 5 recordatorios (2d/24h/mismo día/2h/30min) · en vivo · replay · anuncios de carrito · onboarding. Suprime compradores.', '{40,41}', 6) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_8', '🗣️ Script de 6 objeciones', NULL, 'ready', 'DI21-C2-WhatsApp-Mensajes.md', 'Precio · tiempo · "lo pienso" · pareja/familia · "ya intenté" · "dudo que funcione" + marco de upsell HT. Para grupo, DM y cierre.', '{47,49}', 7) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_9', '📲 ManyChat — flujos DM', NULL, 'ready', 'DI21-C2-Paid-Reels-ManyChat-Copy.md', 'Keyword RETO → DM+opt-in · confirmación · recordatorios · carrito (link en flips + cierre). Cortos, con {{LINK}}.', '{8,9,64}', 8) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_10', '🧩 Diagnóstico / quiz', NULL, 'ready', '02-creative/cohort-2/DI21-Diagnostico-German-v1.html', 'Diagnóstico obligatorio para registrarse (embebido en landing). Genera el lead + dato para retargeting de abandoners.', '{1,73}', 9) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_11', '📐 Matriz de hooks / permutaciones', NULL, 'ready', '02-creative/cohort-2/DI21-C2-Matriz-Permutaciones.html', 'Ángulos × bloques (hook/problema/solución/mecánica/cierre) para producir los anuncios de la matriz.', '{51,52}', 10) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;
  INSERT INTO launch_ops.message_asset (launch_id, key, title, channel, status, file_path, summary, task_refs, position) VALUES (v_launch, 'm_12', '⭐ HT sales system', NULL, 'todo', NULL, 'VSL post-agenda + llamada 6 pasos + chat pre-agenda + 3 toques. Se monta antes del Día 17. Copy base en WhatsApp-Mensajes (marco HT).', '{37,49,39}', 11) ON CONFLICT (launch_id, key) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, file_path = EXCLUDED.file_path, summary = EXCLUDED.summary, task_refs = EXCLUDED.task_refs, position = EXCLUDED.position;

END $seed$;
