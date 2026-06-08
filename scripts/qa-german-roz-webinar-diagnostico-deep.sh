#!/usr/bin/env bash
# Deep QA — Germán Roz webinar diagnóstico (estrategia Caro Fitness)
# Usage: ./scripts/qa-german-roz-webinar-diagnostico-deep.sh [API_BASE] [WEB_BASE]
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="${1:-http://localhost:3000}"
WEB="${2:-http://localhost:3001}"
TS="$(date +%s)"
PASS=0
FAIL=0
WARN=0

SOURCE="landing-german-roz-webinar-2026-06-10"
WEBINAR_PATH="/german-roz/webinar"
RAW_PATH="/german-roz/webinar/raw"
HTML_FILE="$ROOT/apps/web/src/app/(landings)/german-roz/webinar/landing.html"
PAGE_FILE="$ROOT/apps/web/src/app/(landings)/german-roz/webinar/page.tsx"
RAW_FILE="$ROOT/apps/web/src/app/(landings)/german-roz/webinar/raw/route.ts"
RESOLVER="$ROOT/apps/api/src/core/services/ingestion-source-resolver.service.ts"
INDEX="$ROOT/apps/api/src/index.ts"

if [[ -f "$ROOT/.env" ]]; then set -a; source "$ROOT/.env"; set +a; fi
if [[ -f "$ROOT/.env.local" ]]; then set -a; source "$ROOT/.env.local"; set +a; fi

pass() { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN + 1)); }
section() { echo ""; echo "━━ $1 ━━"; }

jget() { python3 -c "import json,sys; d=json.load(open('$1'));
import functools
v=d
for k in '$2'.split('.'):
    v=v.get(k,{}) if isinstance(v,dict) else {}
print(v if not isinstance(v,dict) else '')" 2>/dev/null; }

section "0. Archivos en disco"
[[ -f "$HTML_FILE" ]] && pass "landing.html existe" || fail "landing.html falta"
[[ -f "$PAGE_FILE" ]] && pass "page.tsx existe" || fail "page.tsx falta"
[[ -f "$RAW_FILE" ]] && pass "raw/route.ts existe" || fail "raw/route.ts falta"
[[ -f "$ROOT/apps/web/src/app/(landings)/german-roz/webinar/landing-frame.tsx" ]] && pass "landing-frame.tsx existe" || fail "landing-frame.tsx falta"
[[ -f "$ROOT/apps/web/src/lib/german-roz/api-config.ts" ]] && pass "lib/german-roz/api-config.ts existe" || fail "api-config.ts falta"
[[ -f "$ROOT/apps/web/src/app/api/german-roz/ingest/route.ts" ]] && pass "proxy ingest existe" || fail "proxy ingest falta"
[[ -f "$ROOT/apps/web/src/app/api/german-roz/progress/route.ts" ]] && pass "proxy progress existe" || fail "proxy progress falta"
[[ -f "$ROOT/apps/api/src/core/services/german-roz-progress.service.ts" ]] && pass "progress service existe" || fail "progress service falta"
[[ -f "$ROOT/apps/api/src/core/routes/german-roz-progress.routes.ts" ]] && pass "progress routes existe" || fail "progress routes falta"
[[ -f "$ROOT/apps/api/src/core/bootstrap/ensure-german-roz-progress-table.ts" ]] && pass "bootstrap table existe" || fail "bootstrap falta"
[[ -f "$ROOT/packages/db/src/migrations/20260608000000_german_roz_progress.sql" ]] && pass "migración SQL existe" || fail "migración SQL falta"

section "1. Cableado estático (grep)"
grep -q "LandingFrame" "$PAGE_FILE" && pass "page.tsx usa LandingFrame (iframe)" || fail "page.tsx no usa LandingFrame"
grep -q "$RAW_PATH" "$PAGE_FILE" && pass "page.tsx apunta a $RAW_PATH" || fail "page.tsx no apunta al raw"
grep -q "WebinarRegistration" "$PAGE_FILE" && fail "page.tsx aún monta el formulario viejo" || pass "page.tsx ya no usa el formulario viejo"
grep -q "$SOURCE" "$RESOLVER" && pass "source registrado en resolver API" || fail "source NO está en el resolver"
grep -q "germanRozProgressRoutes" "$INDEX" && pass "rutas de progreso registradas en index.ts" || fail "rutas de progreso no registradas"
grep -q "ensureGermanRozProgressTable" "$INDEX" && pass "ensure table registrado en index.ts" || fail "ensure table no registrado"
grep -q "/api/german-roz/ingest" "$HTML_FILE" && pass "HTML postea a /api/german-roz/ingest" || fail "ingest path ausente en HTML"
grep -q "/api/german-roz/progress" "$HTML_FILE" && pass "HTML postea a /api/german-roz/progress" || fail "progress path ausente en HTML"
grep -q "$SOURCE" "$HTML_FILE" && pass "HTML usa el source del webinar" || fail "source ausente en HTML"
grep -q "sendBeacon" "$HTML_FILE" && pass "HTML usa sendBeacon (progreso/abandono)" || fail "sendBeacon ausente"
grep -q "status:'abandoned'\|status:\"abandoned\"" "$HTML_FILE" && pass "HTML marca abandono en beforeunload" || fail "abandono no implementado"
grep -q "iframe-height" "$HTML_FILE" && pass "HTML emite postMessage de altura" || fail "auto-altura ausente"
grep -q "buildMetaTracking\|eventId" "$HTML_FILE" && pass "HTML envía tracking Meta (eventId/fbp/fbc)" || warn "tracking Meta no detectado"
grep -q "__WHATSAPP_GROUP_URL__\|__CALENDAR_URL__\|__WEBINAR_DATE__" "$HTML_FILE" && pass "HTML tiene placeholders para /raw" || fail "placeholders ausentes"
grep -q "__WHATSAPP_GROUP_URL__\|__CALENDAR_URL__\|__WEBINAR_DATE__" "$RAW_FILE" && pass "raw/route.ts reemplaza placeholders" || fail "raw no reemplaza placeholders"

section "2. typecheck workspaces"
if (cd "$ROOT" && npm run typecheck -w @marketing-funnel/api >/dev/null 2>&1); then pass "typecheck api"; else fail "typecheck api"; fi
if (cd "$ROOT" && npm run typecheck -w @marketing-funnel/web >/dev/null 2>&1); then pass "typecheck web"; else fail "typecheck web"; fi

section "3. API salud + binding"
code=$(curl -s -o /tmp/qa_grd_health.json -w "%{http_code}" "$API/api/health" 2>/dev/null || echo 000)
[[ "$code" == "200" ]] && pass "API reachable ($API)" || fail "API no responde /api/health ($code)"

section "4. Ingest (validaciones)"
code=$(curl -s -o /tmp/qa_grd.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" -d '{"email":"x@test.com","source":"landing-invalid"}')
[[ "$code" == "400" ]] && pass "source inválido → 400" || fail "source inválido esperaba 400, got $code"

code=$(curl -s -o /tmp/qa_grd.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" -d "{\"source\":\"$SOURCE\"}")
[[ "$code" == "400" ]] && pass "sin email → 400" || fail "sin email esperaba 400, got $code"

code=$(curl -s -o /tmp/qa_grd.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" -d "{\"email\":\"qa-grd-phone-${TS}@test.afluence.local\",\"phone\":\"abc\",\"source\":\"$SOURCE\"}")
[[ "$code" == "400" ]] && pass "teléfono inválido → 400" || fail "teléfono inválido esperaba 400, got $code"

section "5. Ingest (lead completo del diagnóstico)"
EMAIL="qa-grd-${TS}@test.afluence.local"
code=$(curl -s -o /tmp/qa_grd_lead.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" -d "{
    \"firstName\":\"QA Diagnostico\",
    \"email\":\"$EMAIL\",
    \"phone\":\"+51987654321\",
    \"source\":\"$SOURCE\",
    \"channel\":\"inbound\",
    \"customFields\":{
      \"creator\":\"german-roz\",\"interest\":\"desinflamate-21\",\"event_type\":\"webinar\",
      \"landing\":\"diagnostico-webinar\",\"webinar_date\":\"2026-06-10\",\"webinar_time\":\"20:00\",
      \"webinar_timezone\":\"America/Lima\",\"country_code\":\"+51\",\"country\":\"Perú\",
      \"whatsapp_local\":\"987654321\",\"nivel_inflamacion\":\"Altas\",\"inflamacion_score\":\"13\",
      \"etapa\":\"Fui mamá hace poco\",\"objetivo\":\"Bajar la hinchazón\",\"energia\":\"Me arrastro, vivo cansada\",
      \"hinchazon\":\"Casi todos los días\",\"antojos\":\"Todo el tiempo, sobre todo dulce\",
      \"comer\":\"Como lo que puedo, a las apuradas\",\"dietas\":\"Muchas, y siempre vuelvo a lo mismo\",
      \"frustra\":\"Vivo cansada y sin energía\",\"session_id\":\"qa-sess-$TS\"
    },
    \"tracking\":{\"meta\":{\"eventId\":\"qa-grd-$TS\"}},
    \"utmData\":{\"utm_source\":\"qa-script\"}
  }")
[[ "$code" == "201" ]] && pass "lead diagnóstico → 201" || fail "lead esperaba 201, got $code (body: $(cat /tmp/qa_grd_lead.json))"
LEAD_ID=$(python3 -c "import json;print(json.load(open('/tmp/qa_grd_lead.json')).get('lead',{}).get('id',''))" 2>/dev/null)
[[ -n "$LEAD_ID" ]] && pass "lead.id devuelto: $LEAD_ID" || fail "no se devolvió lead.id"
SRC=$(python3 -c "import json;print(json.load(open('/tmp/qa_grd_lead.json')).get('lead',{}).get('source',''))" 2>/dev/null)
[[ "$SRC" == "$SOURCE" ]] && pass "lead.source correcto" || fail "lead.source=$SRC"

code=$(curl -s -o /tmp/qa_grd_dup.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" -d "{\"firstName\":\"QA Dup\",\"email\":\"$EMAIL\",\"phone\":\"+51911111111\",\"source\":\"$SOURCE\"}")
[[ "$code" == "201" ]] && pass "email duplicado → 201 update" || fail "duplicado esperaba 201, got $code"
MSG=$(python3 -c "import json;print(json.load(open('/tmp/qa_grd_dup.json')).get('message',''))" 2>/dev/null)
[[ "$MSG" == *"updated"* ]] && pass "mensaje indica update" || warn "mensaje=$MSG"

[[ -n "$LEAD_ID" ]] && { code=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/leads/$LEAD_ID"); [[ "$code" == "200" ]] && pass "GET /api/leads/:id → 200" || fail "GET lead got $code"; }

section "6. Progress (tracking + abandono)"
SESS="qa-prog-$TS-abcdef"
code=$(curl -s -o /tmp/qa_grd_p.json -w "%{http_code}" -X POST "$API/api/german-roz/progress" \
  -H "Content-Type: application/json" -d "{\"sessionId\":\"$SESS\",\"source\":\"$SOURCE\",\"quizStep\":\"q-energia\",\"status\":\"in_progress\",\"answers\":{\"etapa\":\"Ninguna de estas\"},\"utmData\":{\"utm_source\":\"qa\"}}")
[[ "$code" == "201" ]] && pass "progress in_progress → 201" || fail "progress in_progress esperaba 201, got $code (body: $(cat /tmp/qa_grd_p.json))"

code=$(curl -s -o /tmp/qa_grd_p2.json -w "%{http_code}" -X POST "$API/api/german-roz/progress" \
  -H "Content-Type: application/json" -d "{\"sessionId\":\"$SESS\",\"email\":\"$EMAIL\",\"firstName\":\"QA Prog\",\"quizStep\":\"results\",\"status\":\"completed\"}")
[[ "$code" == "201" ]] && pass "progress completed → 201 (upsert misma sesión)" || fail "progress completed got $code"
COMPLETED_AT=$(python3 -c "import json;print(json.load(open('/tmp/qa_grd_p2.json')).get('progress',{}).get('completedAt') or '')" 2>/dev/null)
[[ -n "$COMPLETED_AT" ]] && pass "completed_at seteado al completar" || warn "completed_at vacío"

code=$(curl -s -o /tmp/qa_grd_pbad.json -w "%{http_code}" -X POST "$API/api/german-roz/progress" \
  -H "Content-Type: application/json" -d '{"quizStep":"x"}')
[[ "$code" == "400" ]] && pass "progress sin sessionId → 400" || fail "progress sin sessionId esperaba 400, got $code"

code=$(curl -s -o /tmp/qa_grd_pget.json -w "%{http_code}" "$API/api/german-roz/progress?token=${GERMAN_ROZ_VIEW_TOKEN:-}")
if [[ "$code" == "200" ]]; then
  FOUND=$(python3 -c "import json;d=json.load(open('/tmp/qa_grd_pget.json'));print(any(r.get('session_id')=='$SESS' for r in d.get('data',[])))" 2>/dev/null)
  [[ "$FOUND" == "True" ]] && pass "GET progress lista incluye la sesión de QA" || warn "GET progress 200 pero no encontró la sesión"
elif [[ "$code" == "401" ]]; then
  warn "GET progress → 401 (GERMAN_ROZ_VIEW_TOKEN requerido)"
else
  fail "GET progress got $code"
fi

section "7. Web — página y raw"
code=$(curl -s -o /tmp/qa_grd_page.html -w "%{http_code}" "$WEB$WEBINAR_PATH?utm_source=qa&fbclid=qa-$TS" 2>/dev/null || echo 000)
[[ "$code" == "200" ]] && pass "GET $WEBINAR_PATH → 200" || fail "GET $WEBINAR_PATH got $code"
grep -q "iframe" /tmp/qa_grd_page.html && pass "página renderiza iframe" || fail "iframe ausente en SSR"
grep -q "$RAW_PATH" /tmp/qa_grd_page.html && pass "iframe apunta al raw" || warn "src del raw no visible en SSR"

code=$(curl -s -o /tmp/qa_grd_raw.html -w "%{http_code}" "$WEB$RAW_PATH" 2>/dev/null || echo 000)
[[ "$code" == "200" ]] && pass "GET $RAW_PATH → 200" || fail "GET $RAW_PATH got $code"
grep -q "Diagnóstico de Inflamación" /tmp/qa_grd_raw.html && pass "raw sirve el diagnóstico" || fail "contenido del diagnóstico ausente"
grep -q "Empezar diagnóstico" /tmp/qa_grd_raw.html && pass "raw tiene CTA de inicio" || fail "CTA inicio ausente"
if grep -q "__WHATSAPP_GROUP_URL__\|__CALENDAR_URL__\|__WEBINAR_DATE__\|__WEBINAR_TZ__" /tmp/qa_grd_raw.html; then
  fail "raw NO reemplazó placeholders (siguen __...__ en el HTML servido)"
else
  pass "raw reemplazó todos los placeholders"
fi
grep -q "calendar.google.com" /tmp/qa_grd_raw.html && pass "raw inyectó URL de calendario" || warn "URL de calendario no encontrada"

section "8. Web — proxies same-origin"
code=$(curl -s -o /tmp/qa_grd_proxy.json -w "%{http_code}" -X POST "$WEB/api/german-roz/progress" \
  -H "Content-Type: application/json" -d "{\"sessionId\":\"qa-webproxy-$TS-abcdef\",\"quizStep\":\"intro\",\"status\":\"in_progress\"}")
if [[ "$code" == "201" ]]; then pass "proxy web /api/german-roz/progress → 201 (llega al API)"; 
elif [[ "$code" == "000" ]]; then warn "proxy progress sin respuesta (web no levantado o API_URL mal)"; 
else warn "proxy progress → $code: $(cat /tmp/qa_grd_proxy.json)"; fi

code=$(curl -s -o /tmp/qa_grd_proxy2.json -w "%{http_code}" -X POST "$WEB/api/german-roz/ingest" \
  -H "Content-Type: application/json" -d "{\"email\":\"qa-webproxy-${TS}@test.afluence.local\",\"firstName\":\"QA Proxy\",\"phone\":\"+51987654321\",\"source\":\"$SOURCE\",\"customFields\":{\"landing\":\"diagnostico-webinar\"}}")
if [[ "$code" == "201" ]]; then pass "proxy web /api/german-roz/ingest → 201"; 
elif [[ "$code" == "000" ]]; then warn "proxy ingest sin respuesta"; 
else warn "proxy ingest → $code: $(cat /tmp/qa_grd_proxy2.json)"; fi

section "SUMMARY"
TOTAL=$((PASS + FAIL + WARN))
echo ""
echo "PASS: $PASS | FAIL: $FAIL | WARN: $WARN | TOTAL: $TOTAL"
if [[ "$FAIL" -gt 0 ]]; then echo "RESULT: FAIL"; exit 1; fi
echo "RESULT: PASS (con $WARN warnings)"
exit 0
