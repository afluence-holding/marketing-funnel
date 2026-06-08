-- ============================================================================
-- Migration: launch_ops seed — DI21-C2 (GENERATED — do not edit by hand)
-- ----------------------------------------------------------------------------
-- Source: docs/DI21-C2-Centro-Operaciones.html
-- Generator: apps/admin/scripts/gen-launch-ops-seed.mjs
-- Idempotent: upserts launch/phases/kpis/resources; seeds tasks only when
-- the launch has zero tasks (never clobbers live status/progress on re-run).
-- ============================================================================

DO $seed$
DECLARE
  v_launch uuid;
  v_phase  jsonb := '{}'::jsonb;
  v_tasks  jsonb := '{}'::jsonb;
  v_id     uuid;
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

  -- guard: only seed tasks if none exist for this launch ---------------------
  IF (SELECT count(*) FROM launch_ops.task WHERE launch_id = v_launch) = 0 THEN

    -- #1 [F0] Whop: cuenta + KYC + producto $87 + cupones de la escalera +
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F0')::uuid, 1, 'Whop: cuenta + KYC + producto $87 + cupones de la escalera + métodos de pago', 'Checkout funcional con la escalera de precio lista y pagos que conviertan en Perú.', 'Producto a $87, cupones aplican y expiran, PayPal en el checkout.', 'Whop', 'infra', 'HOY', NULL, NULL, 1)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['1'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Crear/configurar la cuenta Whop y completar KYC — es lo que más demora, hacerlo primero.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Producto «Reto Desinflámate 21», pago único, USD, anclado a $87.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Cupón −$20→$67 exp 16/6, 1 por cliente, con tope.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Cupón −$10→$77 exp 23/6, 1 por cliente.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 4, 'PayPal + crypto (respaldo LATAM) + redirect post-checkout + thank-you.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;

    -- #2 [F0] Landing de registro + diagnóstico embebido LIVE
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F0')::uuid, 2, 'Landing de registro + diagnóstico embebido LIVE', 'Puerta de registro que captura el lead y obliga a completar el diagnóstico.', 'Un registro de prueba entra a MailerLite (S6) y muestra el link de WhatsApp.', 'Landing', 'infra', 'HOY', NULL, NULL, 2)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['2'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Publicar la landing.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Embeber el diagnóstico como paso obligatorio.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Conectar el form al opt-in (MailerLite S6 + ManyChat).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Confirmación con link al grupo WhatsApp + resultado.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 4, 'QA mobile.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #3 [F0] Evento de registro Pixel + CAPI validado (anti value-bug)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F0')::uuid, 3, 'Evento de registro Pixel + CAPI validado (anti value-bug)', 'Señal de conversión limpia para que el paid optimice por registro.', 'El registro de prueba aparece como 1 evento, sin duplicar.', 'Tracking', 'infra', 'HOY', NULL, NULL, 3)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['3'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Pixel en la landing.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Complete Registration por Pixel + CAPI con event_id compartido.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Test Events.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Confirmar dedupe.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #4 [F0] Hyros 100% montado (antes de prender ads)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F0')::uuid, 4, 'Hyros 100% montado (antes de prender ads)', 'Atribución y valor real cross-device + arreglar el value bug, sin resetear learning.', 'La compra de prueba registra valor correcto en Hyros, sin doble conteo.', 'Tracking', 'infra', 'HOY', NULL, NULL, 4)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['4'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Script universal en landing + VSL.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Meta OAuth + parámetro en TODOS los adsets antes de gastar.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Whop↔Hyros + webhook final_amount.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'MailerLite he=/el= + tracked links WhatsApp; sin acortadores.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 4, 'Source-of-truth: Hyros manda Purchase a Meta, apagar Whop→Meta. Scientific Mode.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #5 [F0] Crear grupos de WhatsApp + URLs configuradas en el reto (rot
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F0')::uuid, 5, 'Crear grupos de WhatsApp + URLs configuradas en el reto (rotación al llenarse)', 'Palanca de comunicación lista, conforme y escalable.', 'Links funcionan, URLs editables desde el reto, hay grupo de reserva.', 'WA Grupos', 'organico', 'HOY', NULL, NULL, 5)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['5'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Grupo(s) ≤300–500 + link + modo solo-admins para el evento.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'URLs parametrizadas en el reto para rotar al llenarse.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Opt-in explícito en el registro + bienvenida.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, '1–2 grupos de reserva.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;

    -- #6 [F0] Whop: compra de prueba desde Perú
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F0')::uuid, 6, 'Whop: compra de prueba desde Perú', 'Validar que el checkout convierte y reporta valor correcto antes de gastar.', 'Compra completa, valor correcto, comprador excluido del retargeting.', 'Whop', 'infra', 'HOY/7jun', '2026-06-07', '2026-06-07', 6)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['6'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Compra real desde IP de Perú.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Verificar métodos de pago que renderizan.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Valor correcto en Hyros + Meta.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Webhook dispara el fan-out.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #7 [F0] Autenticar email: SPF + DKIM + DMARC + unsubscribe
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F0')::uuid, 7, 'Autenticar email: SPF + DKIM + DMARC + unsubscribe', 'Deliverability para que los emails de cierre lleguen al inbox.', 'Dominio autenticado; envío de prueba no cae en spam.', 'Email', 'infra', 'HOY', NULL, NULL, 7)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['7'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Verificar SPF + DKIM (dominio «authenticated»).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'DMARC p=none.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Unsubscribe 1 clic.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #8 [F0] Construir segmentos dinámicos S1–S6 en MailerLite
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F0')::uuid, 8, 'Construir segmentos dinámicos S1–S6 en MailerLite', 'Poder enviar engaged-first y ramificar.', 'Los 6 segmentos existen; S5 aislado del blast.', 'Email', 'infra', 'HOY', NULL, NULL, 8)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['8'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Segmentos por engagement sobre Cohort-Cierre (570) + Desinflama 21 (2,524).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'S1 buyers engaged · S2 lapsed · S3 hot · S4 warm · S5 dormidos · S6 registrantes.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Verificar conteos.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #9 [F1] ManyChat: keyword RETO → DM con link + opt-in → push a Maile
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 9, 'ManyChat: keyword RETO → DM con link + opt-in → push a MailerLite/Meta', 'Convertir el orgánico en leads capturados en canal propio.', 'Responder RETO devuelve DM y el lead aparece en MailerLite + Meta.', 'ManyChat', 'organico', '6–7jun', '2026-06-06', '2026-06-07', 9)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['9'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Flow keyword RETO (story reply + comentario) → DM con link.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Capturar email + taggear.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Push a MailerLite S6 + Meta CA.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Probar end-to-end.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #10 [F1] ManyChat: flow de recordatorios (show-up + carrito)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 10, 'ManyChat: flow de recordatorios (show-up + carrito)', 'ManyChat como segundo riel de recordatorios (IG-native).', 'Un opted-in recibe la secuencia; compradores excluidos.', 'ManyChat', 'organico', '7jun', '2026-06-07', '2026-06-07', 10)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['10'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'DM día previo / día del webinar / 1h antes.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Carrito: link de checkout en cada flip + cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Suprimir compradores.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #11 [F1] Anuncio orgánico: story + reel con keyword RETO
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 11, 'Anuncio orgánico: story + reel con keyword RETO', 'Activar la expectativa y empezar a llenar registros hoy.', 'Publicado; entran respuestas RETO y registros.', 'IG Orgánico', 'organico', 'HOY', NULL, NULL, 11)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['11'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Story + reel revelando la masterclass.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Hook con el dolor #1 (energía), no el producto.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'CTA «responde RETO».');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Sin peso ni números.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;

    -- #12 [F1] Subir creativos de la matriz (hooks) al ad account
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 12, 'Subir creativos de la matriz (hooks) al ad account', 'Banco de hooks listo para el test de paid.', 'Ads listos para C1.', 'Meta Ads', 'inorganico', '6–7jun', '2026-06-06', '2026-06-07', 12)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['12'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Cargar 4–6 hooks como ads.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Convención de nombres.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Parámetro Hyros + URL correcta (sin acortadores).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #13 [F1] Campaña C1 Registro (CBO · frío+warm · Complete Registration
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 13, 'Campaña C1 Registro (CBO · frío+warm · Complete Registration)', 'Máquina de registros pre-webinar.', 'Campaña activa entregando registros bien medidos.', 'Meta Ads', 'inorganico', '7jun', '2026-06-07', '2026-06-07', 13)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['13'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '1 campaña CBO, objetivo Leads.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Adset FRÍO (broad/Advantage+) + WARM (IG engagers) aparte.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Prender solo al validar tracking.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Destino: landing del diagnóstico.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #14 [F1] Warm-up email engaged-first + Email A1 (invitación)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 14, 'Warm-up email engaged-first + Email A1 (invitación)', 'Reactivar la lista sin quemar deliverability.', 'Sin pico de quejas; A1 con buen open/clic.', 'Email', 'organico', '6–8jun', '2026-06-06', '2026-06-08', 14)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['14'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Jun 6: solo Cohort-Cierre. Jun 7: +S3. Jun 8: +S4. Nunca a los 2,524 ni a S5.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Email A1: anuncia la masterclass + CTA registro.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #15 [F1] Reels diarios + stories (ángulos de la matriz)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 15, 'Reels diarios + stories (ángulos de la matriz)', 'Sostener registros y calentar audiencia para paid.', 'Publicación diaria; engagement alimentando warm.', 'IG Orgánico', 'organico', '7–10jun', '2026-06-07', '2026-06-10', 15)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['15'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '1 reel/día + stories (energía, antojos, anti-dieta, autoridad).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Encuestas/preguntas.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Toda story cierra con RETO.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;

    -- #16 [F1] Email A2/A3 + recordatorios R1–R4 a registrantes
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 16, 'Email A2/A3 + recordatorios R1–R4 a registrantes', 'Empujar registro y maximizar show-up.', 'Secuencia programada; registrantes reciben recordatorios.', 'Email', 'organico', '7–10jun', '2026-06-07', '2026-06-10', 16)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['16'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'A2 (por qué importa) + A3 (última llamada) a S1–S4.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'R1–R4 (1 día / mañana / 1h / en vivo) solo a S6.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #17 [F1] Elba: envío de mensajes en los grupos (pre-webinar)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 17, 'Elba: envío de mensajes en los grupos (pre-webinar)', 'Subir show-up con comunicación humana. Paralelo al bot.', 'Grupos activos, sin salidas masivas.', 'WA Grupos', 'organico', '7–10jun', '2026-06-07', '2026-06-10', 17)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['17'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Bienvenida + 1 tip/día (máx 1–3/día), tono cálido.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Recordatorios día previo y día del webinar.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Teaser de valor + prueba social.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Coordinar con el bot para no duplicar.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;

    -- #18 [F1] Lectura de hooks (matar <25%, escalar 30%+)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 18, 'Lectura de hooks (matar <25%, escalar 30%+)', 'Encontrar ángulos ganadores antes de meter budget.', '2–4 hooks ganadores; perdedores pausados.', 'Meta Ads', 'inorganico', '8–9jun', '2026-06-08', '2026-06-09', 18)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['18'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Leer hook rate + hold + CTR; el costo aún miente.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Matar <25%; consolidar 30%+.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Preparar ganadores para Fase 2.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #19 [F2] Guion del pitch del webinar (70/20, vender reto $67)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 19, 'Guion del pitch del webinar (70/20, vender reto $67)', 'Una clase que entrega valor y convierte sin agredir.', 'Guion aprobado y ensayado.', 'Webinar', 'organico', '9jun', '2026-06-09', '2026-06-09', 19)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['19'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'hook → historia → enseñanza (3 cambios) → transición → oferta → stack → urgencia → cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, '70–80% valor / 20–30% oferta. Abre carrito a $67.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'HT NO se pitchea aquí.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Anti-dieta, sin números.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #20 [F2] Plataforma del webinar + sala + prueba técnica
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 20, 'Plataforma del webinar + sala + prueba técnica', 'Que el evento corra sin fallas el día 10.', 'Prueba técnica OK; link funciona.', 'Webinar', 'infra', '9jun', '2026-06-09', '2026-06-09', 20)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['20'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Plataforma + sala.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Prueba técnica (audio/video/pantalla).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Link de ingreso para ManyChat/email/WhatsApp.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;

    -- #21 [F2] Recetario antiinflamatorio listo (premio por asistir)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 21, 'Recetario antiinflamatorio listo (premio por asistir)', 'Incentivo de show-up + entrega de valor post-webinar.', 'Recetario terminado y con vía de entrega.', 'Webinar', 'organico', '9jun', '2026-06-09', '2026-06-09', 21)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['21'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Armar el recetario (recetas de chef).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Mecanismo de entrega a quienes se conecten.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Sin números; lenguaje de bienestar.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;

    -- #22 [F2] VSL de venta + página de checkout Whop + thank-you
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 22, 'VSL de venta + página de checkout Whop + thank-you', 'Destino de conversión del carrito.', 'VSL → checkout → thank-you end-to-end.', 'Landing', 'infra', '9jun', '2026-06-09', '2026-06-09', 22)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['22'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Página de venta con la VSL.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Botón al checkout Whop (producto + cupón vigente).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Thank-you + redirect al grupo del reto.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;

    -- #23 [F2] Webhook fan-out post-compra
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 23, 'Webhook fan-out post-compra', 'Automatizar todo lo que pasa al comprar.', 'Una compra de prueba dispara los 4 efectos.', 'Tracking', 'infra', '9jun', '2026-06-09', '2026-06-09', 23)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['23'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Whop payment.succeeded → MailerLite buyers + Hyros order + Meta exclude + link al grupo del reto.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #24 [F2] Cargar Secuencia B de carrito (C1–C12, ramificada)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 24, 'Cargar Secuencia B de carrito (C1–C12, ramificada)', 'Maquinaria de venta del carrito lista.', 'Secuencia programada; ramas por comportamiento.', 'Email', 'organico', '9–10jun', '2026-06-09', '2026-06-10', 24)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['24'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'C1–C12 ramificada por asistente/no-show.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Emails ancla en cada flip + cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Supresión de compradores.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #25 [F2] Masterclass en vivo + abrir carrito $67
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 25, 'Masterclass en vivo + abrir carrito $67', 'El evento de conversión.', 'Webinar hecho, carrito abierto, primeras ventas.', 'Webinar', 'organico', '10jun', '2026-06-10', '2026-06-10', 25)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['25'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Conducir la clase (70/20).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Abrir carrito a $67.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Testimonios + link en WhatsApp durante el pitch.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;

    -- #26 [F2] Pasar paid a C3 Carrito (retargeting + escalar)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 26, 'Pasar paid a C3 Carrito (retargeting + escalar)', 'Monetizar registrantes/asistentes que no compraron.', 'C3 activa con CPA razonable.', 'Meta Ads', 'inorganico', '10jun', '2026-06-10', '2026-06-10', 26)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['26'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'C3 (Purchase): hot registrantes + visitantes VSL + warm no-reg.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Cargar hooks ganadores.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Excluir compradores.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #27 [F2] Lista hasheada de registrantes como Custom Audience
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 27, 'Lista hasheada de registrantes como Custom Audience', 'Retargeting confiable (no depender de pixel→CA).', 'CA de registrantes con tamaño, lista para C3.', 'Meta Ads', 'inorganico', '10jun', '2026-06-10', '2026-06-10', 27)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['27'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Exportar registrantes hasheados.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Subir como CA primaria para C3.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Engagement (IG/video) como fallback.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #28 [F2] Validar primeras 3–5 ventas en Hyros ($67/$77/$87)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 28, 'Validar primeras 3–5 ventas en Hyros ($67/$77/$87)', 'Confirmar tracking de valor antes de escalar.', 'Ventas con valor correcto y atribución limpia.', 'Tracking', 'infra', '10–11jun', '2026-06-10', '2026-06-11', 28)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['28'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Ventas registran el precio correcto.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Atribución al ad correcto.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Si falla → CAPI propio desde webhook.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #29 [F3] Elba: envío de mensajes en los grupos (carrito)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F3')::uuid, 29, 'Elba: envío de mensajes en los grupos (carrito)', 'Sostener urgencia y prueba social humana 20 días.', 'Cadencia con spikes en cada flip y cierre.', 'WA Grupos', 'organico', '10–30jun', '2026-06-10', '2026-06-30', 29)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['29'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Testimonios diarios + 1 objeción.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Anclar cada flip (17 y 24).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Pitch: testimonios + link.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Cierre 3x.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;

    -- #30 [F3] Stories de carrito + olas de precio
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F3')::uuid, 30, 'Stories de carrito + olas de precio', 'El orgánico sostiene la urgencia de la escalera.', 'Stories diarias; cada flip con aviso.', 'IG Orgánico', 'organico', '10–30jun', '2026-06-10', '2026-06-30', 30)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['30'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Testimonios (energía/digestión/bienestar).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Story de aviso en cada subida.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Countdown al cierre.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;

    -- #31 [F3] Flip a $77 (operativo)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F3')::uuid, 31, 'Flip a $77 (operativo)', 'Ejecutar la primera subida sin fricción.', 'Checkout cobra $77 y salió la comunicación.', 'Carrito/Precio', 'infra', '17jun', '2026-06-17', '2026-06-17', 31)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['31'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Whop: cupón $67 expira → $77.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Email C5 a no-compradores.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Story + WhatsApp.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #32 [F3] Flip a $87 (operativo)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F3')::uuid, 32, 'Flip a $87 (operativo)', 'Ejecutar la última subida.', 'Checkout cobra $87 y salió la comunicación.', 'Carrito/Precio', 'infra', '24jun', '2026-06-24', '2026-06-24', 32)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['32'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Whop: cupón $77 expira → $87.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Email C8 + story + WhatsApp.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Avisar cierre el 30.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #33 [F3] Track de reactivación S5 (sunset) — baja prioridad, en paral
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F3')::uuid, 33, 'Track de reactivación S5 (sunset) — baja prioridad, en paralelo', 'Recuperar lista dormida sin arriesgar deliverability.', 'Serie enviada; reactivados a S4.', 'Email', 'organico', '7jun', '2026-06-07', '2026-06-07', 33)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['33'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '3–4 emails de reactivación a S5.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Quien reabre → sube a S4.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'El resto se aparca.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #34 [F3] Cierre de carrito 30 jun 23:59 + suprimir compradores
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F3')::uuid, 34, 'Cierre de carrito 30 jun 23:59 + suprimir compradores', 'Cerrar limpio y exprimir el último día.', 'Carrito cerrado a horario; comunicación ejecutada.', 'Carrito/Precio', 'organico', '30jun', '2026-06-30', '2026-06-30', 34)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['34'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Emails C10–C12 escalando.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'WhatsApp 3x.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Cerrar 23:59 PET; suprimir compradores.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #35 [F4] Plataforma del reto + acceso para compradores
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F4')::uuid, 35, 'Plataforma del reto + acceso para compradores', 'Acceso al reto sin fricción el 1 jul.', 'Un comprador de prueba accede.', 'Reto', 'infra', '≤29jun', NULL, '2026-06-29', 35)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['35'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Configurar plataforma/acceso.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Sincronizar compradores Whop → acceso.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Probar con cuenta de prueba.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;

    -- #36 [F4] Onboarding + grupos del reto en WhatsApp
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F4')::uuid, 36, 'Onboarding + grupos del reto en WhatsApp', 'Arrancar el reto con comunidad lista.', 'Grupos del reto con los compradores dentro.', 'WA Grupos', 'organico', '≤1jul', NULL, '2026-07-01', 36)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['36'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Grupo(s) del reto.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Onboarding + reglas.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Calendario de acompañamiento diario.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;

    -- #37 [F4] Material del reto (plan 21 días + recetas)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F4')::uuid, 37, 'Material del reto (plan 21 días + recetas)', 'Contenido del reto listo.', 'Material completo y cargado.', 'Reto', 'organico', '≤1jul', NULL, '2026-07-01', 37)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['37'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Plan 21 días + recetas de chef.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Tips diarios.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Sin números; hábitos y bienestar.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;

    -- #38 [F4] Proceso de cierre del HT (clase + secuencia + closer) — pala
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F4')::uuid, 38, 'Proceso de cierre del HT (clase + secuencia + closer) — palanca $90K', 'Montar el cierre del high-ticket: mayor retorno de la campaña.', 'Cierre listo y agendado antes del Día 17.', 'HT/Backend', 'organico', '≤16jul', NULL, '2026-07-16', 38)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['38'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Clase/sesión de cierre en el grupo del reto.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Secuencia 3–4 msj presentando el Acompañamiento ($580).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Closer 1:1 + guion.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Enmarcar como continuidad.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #39 [F4] Segmentar compradores más activos del reto para el HT
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F4')::uuid, 39, 'Segmentar compradores más activos del reto para el HT', 'Priorizar a quienes más convierten al HT.', 'Lista priorizada para el cierre.', 'HT/Backend', 'infra', '14jul', '2026-07-14', '2026-07-14', 39)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['39'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Identificar los más activos (WhatsApp + avance).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Lista prioritaria para el closer.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Personalizar la oferta.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #40 [F4] Upsell HT en vivo (Día 17–21)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F4')::uuid, 40, 'Upsell HT en vivo (Día 17–21)', 'El cierre del HT — donde se decide si tocamos los $90K.', 'Ofertas enviadas, cierres en marcha, conversión medida.', 'HT/Backend', 'organico', '17–21jul', '2026-07-17', '2026-07-21', 40)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['40'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Correr la clase de cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Secuencia + closer 1:1.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Medir conversión a HT (6%).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #41 [F1] Configurar el BOT de WhatsApp (sistema de challenges) + insc
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 41, 'Configurar el BOT de WhatsApp (sistema de challenges) + inscripción de registrantes', 'Canal automatizado paralelo a los grupos.', 'Un registrante de prueba queda inscrito y recibe la secuencia.', 'WA Bot', 'organico', '7jun', '2026-06-07', '2026-06-07', 41)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['41'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Conectar el bot al sistema de challenges + inscribir registrantes.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Cadencia: 2 días · 48h · 24h · 2h · 30min antes.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Anuncios puntuales (carrito/flips/cierre).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Contenido de Tomás; tracked links Hyros.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #42 [F3] BOT WhatsApp: anuncios de carrito (olas de precio + cierre)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F3')::uuid, 42, 'BOT WhatsApp: anuncios de carrito (olas de precio + cierre)', 'Riel automatizado de urgencia, paralelo a Elba.', 'Anuncios en cada hito; compradores excluidos.', 'WA Bot', 'organico', '10–30jun', '2026-06-10', '2026-06-30', 42)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['42'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Anuncio en cada flip (17 y 24) + cierre (30).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Link de checkout con tracked link.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Suprimir compradores.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #43 [F2] Guion de la masterclass sobre estructura de 15 partes
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 43, 'Guion de la masterclass sobre estructura de 15 partes', 'La masterclass es la palanca #1.', 'Guion con el primer CTA antes del cierre.', 'Webinar', 'organico', '9jun', '2026-06-09', '2026-06-09', 43)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['43'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, '15 bloques: hook → historia → problema → dolores → epifanía → solución → cambio de paradigma → resultados → transición → producto → anclaje de VALOR → 1er CTA → bonus → urgencia → prueba social + CTA final.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Primer CTA al 10–20%, no al final.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Anclaje de VALOR, nunca precio futuro.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #44 [F2] Stack del día D (toques en vivo + mini-VSL post + bonus + re
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 44, 'Stack del día D (toques en vivo + mini-VSL post + bonus + replay)', 'Subir retención y capturar el ~40% del valor del replay.', 'Toques guionados, mini-VSL, bonus, replay programado.', 'Webinar', 'organico', '9–10jun', '2026-06-09', '2026-06-10', 44)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['44'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Vivo: 4 anchors (dolores → método → testimonios → ''momento importante'').');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Post: mini-VSL + stories en vivo + grabación.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Bonus por asistir → +22% show-up.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Replay a no-shows con deadline.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;

    -- #45 [F2] Checklist técnico pre-evento end-to-end
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 45, 'Checklist técnico pre-evento end-to-end', 'Evitar un fallo el día D que tire semanas de captación.', 'Flujo probado de punta a punta.', 'Webinar', 'infra', '8–9jun', '2026-06-08', '2026-06-09', 45)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['45'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Stream + internet de respaldo.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'ManyChat con usuario real + grupos con admin.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Landing + pixel + replay grabándose.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Checkout Whop end-to-end (compra desde Perú).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #46 [F2] Q&A post-evento (~12–13 jun) con objeciones reales del grupo
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F2')::uuid, 46, 'Q&A post-evento (~12–13 jun) con objeciones reales del grupo', 'Recuperar 20–25% de no-shows/indecisos.', 'Q&A hecho; indecisos reactivados.', 'Webinar', 'organico', '12–13jun', '2026-06-12', '2026-06-13', 46)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['46'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Recolectar objeciones top de DMs/grupo.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Q&A respondiéndolas + empuje a indecisos.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Dentro de la ventana $67.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;

    -- #47 [F3] Loop Ventas→Contenido lite (quiz + DMs + grupo → emails + ho
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F3')::uuid, 47, 'Loop Ventas→Contenido lite (quiz + DMs + grupo → emails + hooks)', 'El quiz es una mina de lenguaje del avatar sin explotar.', 'Doc vivo; 1 insight/día al copy.', 'Contenido', 'organico', '10–30jun', '2026-06-10', '2026-06-30', 47)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['47'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Doc vivo actualizado diario.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Capturar objeciones + frases del quiz/ManyChat/grupo.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Top del día → email/WhatsApp + hooks.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;

    -- #48 [F3] Script de las 6 objeciones (para grupo y DM)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F3')::uuid, 48, 'Script de las 6 objeciones (para grupo y DM)', 'Convertir indecisos con preguntas, no defensas.', 'Script en manos de Elba/Mau.', 'WA Grupos', 'organico', '9jun', '2026-06-09', '2026-06-09', 48)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['48'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Precio / tiempo / duda / pareja / ''lo pienso'' / otro programa.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Reframe salud-energía, tuteo empático.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Sirve para carrito y HT.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #49 [F3] Whop: order bump + upsell post-checkout
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F3')::uuid, 49, 'Whop: order bump + upsell post-checkout', 'Subir AOV + plantar el HT automatizado.', 'Order bump + upsell configurados y testeados.', 'Whop', 'infra', '9jun', '2026-06-09', '2026-06-09', 49)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['49'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Order bump brand-safe (ej. recetario premium).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Upsell post-compra con video/copy.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Tracked links; sin claims de peso.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'mau') ON CONFLICT DO NOTHING;

    -- #50 [F4] HT sales system (VSL post-agenda + llamada 6 pasos + chat pr
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F4')::uuid, 50, 'HT sales system (VSL post-agenda + llamada 6 pasos + chat pre-agenda + 3 toques)', 'Sin sistema, el HT $580 vende por suerte.', 'Sistema HT listo antes del Día 17.', 'HT/Backend', 'organico', '≤16jul', NULL, '2026-07-16', 50)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['50'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'VSL post-agenda ~17 secciones (reutilizable).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Llamada 6 pasos: hielo → objetivo → cualificación → resumen → oferta → cierre.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Chat pre-agenda + 3 toques 12h/30h/48h.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Garantía + resultado-en-21-días (Hormozi).');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #51 [F0] Completar el checklist de tracking Hyros (35 ítems · doc apa
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F0')::uuid, 51, 'Completar el checklist de tracking Hyros (35 ítems · doc aparte)', 'Medir absolutamente todos los canales.', 'Checklist Hyros al 100%; todos los canales atribuyen.', 'Tracking', 'infra', 'HOY–7jun', '2026-06-07', '2026-06-07', 51)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['51'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Ejecutar los 10 bloques (A–J) del checklist Hyros.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Source-of-truth + validación de valor con compra de prueba.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Dashboards: CPA real por canal, ROAS, mix paid/orgánico.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;

    -- #52 [F1] Germán graba los bloques modulares (hooks + problema + soluc
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 52, 'Germán graba los bloques modulares (hooks + problema + solución + mecánica + cierre) + B-roll', 'Materia prima de los anuncios.', 'Bloques + B-roll grabados y subidos.', 'Creativo', 'organico', '7–8jun', '2026-06-07', '2026-06-08', 52)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['52'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Grabar por bloques (2–3 tomas c/u).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Mismo outfit/luz/encuadre/mic.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'B-roll: cocina, ingredientes, platos, WhatsApp.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Sin números corporales.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;

    -- #53 [F1] Editar los anuncios de la matriz de permutaciones (frío/warm
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 53, 'Editar los anuncios de la matriz de permutaciones (frío/warm)', 'Convertir los bloques en los anuncios de C1/C3.', '8–12 anuncios listos para paid.', 'Creativo', 'inorganico', '7–9jun', '2026-06-07', '2026-06-09', 53)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['53'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Ola 1 de frío (test de hooks) + warm.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'B-roll cada 2–3s, CTA a mitad, subtítulos.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'NO mezclar formatos.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Fecha/precio solo en overlay, no en audio.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #54 [F1] QA de marca + compliance en TODOS los assets (gate antes de 
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F1')::uuid, 54, 'QA de marca + compliance en TODOS los assets (gate antes de publicar)', 'Que nada salga off-brand ni con riesgo de Meta.', 'Todos los assets pasan el gate; Cris aprueba.', 'QA', 'infra', '7–9jun', '2026-06-07', '2026-06-09', 54)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['54'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Anti-dieta: sin peso/calorías/IMC/antes-después.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Sin condiciones médicas, sin IA, tuteo, ''pacientes'', chef.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'NO anclar precio futuro.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 3, 'Sin claims de ingresos ni garantías agresivas.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #55 [F5] Configurar reportes diarios / scorecard del lanzamiento
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F5')::uuid, 55, 'Configurar reportes diarios / scorecard del lanzamiento', 'Ver el lanzamiento en números cada día.', 'Reporte diario corriendo desde el webinar.', 'Ops', 'infra', '10jun', '2026-06-10', '2026-06-10', 55)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['55'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Scorecard: registros, show-up, CPA por canal, ventas por tramo, ROAS, % HT.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Reporte diario automatizado.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Umbrales de alarma.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'nico') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #56 [F5] Daily de números + decisión (árbol de optimización)
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F5')::uuid, 56, 'Daily de números + decisión (árbol de optimización)', 'No volar a ciegas: leer métricas en orden.', 'Decisión diaria documentada.', 'Ops', 'infra', 'diario carrito', NULL, NULL, 56)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['56'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'hook→hold→CTR→CPL→CPA→freq.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'CPA alto con CTR sano → revisar funnel.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Escalar ganadores +20%/48h.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- #57 [F5] Capturar testimonios de pacientes durante el reto
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F5')::uuid, 57, 'Capturar testimonios de pacientes durante el reto', 'Munición para HT, carrito de C3 y prueba social.', 'Banco de testimonios creciendo.', 'Reto', 'organico', '1–21jul', '2026-07-01', '2026-07-21', 57)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['57'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Pedir testimonios en el grupo (energía/digestión/bienestar).');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Video + texto, con permiso.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Etiquetar por dolor/objeción.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'german') ON CONFLICT DO NOTHING;
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'elba') ON CONFLICT DO NOTHING;

    -- #58 [F5] Post-mortem del lanzamiento + handoff a C3
    INSERT INTO launch_ops.task (launch_id, phase_id, source_index, title, objective, definition_of_done, channel, workstream, due_label, due_start, due_end, position)
    VALUES (v_launch, (v_phase->>'F5')::uuid, 58, 'Post-mortem del lanzamiento + handoff a C3', 'Capturar aprendizajes y alimentar la máquina mensual.', 'Post-mortem documentado; C3 actualizado.', 'Ops', 'infra', '≤5jul', NULL, '2026-07-05', 58)
    RETURNING id INTO v_id;
    v_tasks := jsonb_set(v_tasks, ARRAY['58'], to_jsonb(v_id::text));
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 0, 'Números finales vs target.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 1, 'Qué funcionó/qué no por canal.');
    INSERT INTO launch_ops.task_step (task_id, position, body) VALUES (v_id, 2, 'Learnings C3 + memoria + loop.');
    INSERT INTO launch_ops.task_owner (task_id, owner_key) VALUES (v_id, 'tomas') ON CONFLICT DO NOTHING;

    -- dependencies -----------------------------------------------------------
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'3')::uuid, (v_tasks->>'2')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'4')::uuid, (v_tasks->>'1')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'4')::uuid, (v_tasks->>'2')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'6')::uuid, (v_tasks->>'1')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'6')::uuid, (v_tasks->>'4')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'9')::uuid, (v_tasks->>'2')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'10')::uuid, (v_tasks->>'9')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'11')::uuid, (v_tasks->>'2')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'11')::uuid, (v_tasks->>'9')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'13')::uuid, (v_tasks->>'3')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'13')::uuid, (v_tasks->>'4')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'13')::uuid, (v_tasks->>'12')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'14')::uuid, (v_tasks->>'7')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'14')::uuid, (v_tasks->>'8')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'15')::uuid, (v_tasks->>'11')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'16')::uuid, (v_tasks->>'14')::uuid);
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'17')::uuid, 'Tras: grupos creados');
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'18')::uuid, (v_tasks->>'13')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'22')::uuid, (v_tasks->>'1')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'23')::uuid, (v_tasks->>'1')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'23')::uuid, (v_tasks->>'4')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'24')::uuid, (v_tasks->>'8')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'25')::uuid, (v_tasks->>'19')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'25')::uuid, (v_tasks->>'20')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'25')::uuid, (v_tasks->>'21')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'26')::uuid, (v_tasks->>'13')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'26')::uuid, (v_tasks->>'25')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'27')::uuid, (v_tasks->>'6')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'27')::uuid, (v_tasks->>'25')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'28')::uuid, (v_tasks->>'25')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'36')::uuid, (v_tasks->>'36')::uuid);
    INSERT INTO launch_ops.dependency (task_id, depends_on_task_id) VALUES ((v_tasks->>'39')::uuid, (v_tasks->>'39')::uuid);
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'40')::uuid, 'Tras: proceso HT + segmentación');
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'41')::uuid, 'Tras: landing + registro');
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'42')::uuid, 'Tras: bot configurado');
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'43')::uuid, 'Rescatado del playbook');
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'44')::uuid, 'Tras: guion');
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'46')::uuid, 'Tras: webinar');
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'49')::uuid, 'Tras: checkout Whop');
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'50')::uuid, 'Tras: proceso HT');
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'53')::uuid, 'Tras: grabación');
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'56')::uuid, 'Tras: scorecard');
    INSERT INTO launch_ops.dependency (task_id, note) VALUES ((v_tasks->>'58')::uuid, 'Tras: cierre');
  END IF;

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

END $seed$;
