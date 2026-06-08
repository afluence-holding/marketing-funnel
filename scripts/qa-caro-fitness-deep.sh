#!/usr/bin/env bash
# Deep QA — Caro Fitness diagnóstico landing + ingest
# Usage: ./scripts/qa-caro-fitness-deep.sh [API_BASE] [WEB_BASE]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="${1:-http://localhost:3000}"
WEB="${2:-http://localhost:3001}"
TS="$(date +%s)"
QA_EMAIL="qa-caro-${TS}@afluence-test.invalid"
SOURCE="landing-caro-fitness-diagnostico"
PASS=0
FAIL=0
WARN=0

LANDING_HTML="$ROOT/apps/web/src/app/(landings)/caro-fitness/diagnostico/landing.html"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env" 2>/dev/null || true
  set +a
fi
if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
fi

pass() { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN + 1)); }
section() { echo ""; echo "━━ $1 ━━"; }

section "0. Repo / static"
if (cd "$ROOT" && npm run typecheck -w @marketing-funnel/web >/dev/null 2>&1); then
  pass "typecheck @marketing-funnel/web"
else
  fail "typecheck @marketing-funnel/web"
fi
if (cd "$ROOT" && npm run typecheck -w @marketing-funnel/api >/dev/null 2>&1); then
  pass "typecheck @marketing-funnel/api"
else
  fail "typecheck @marketing-funnel/api"
fi

for f in \
  "apps/web/src/app/(landings)/caro-fitness/diagnostico/page.tsx" \
  "apps/web/src/app/(landings)/caro-fitness/diagnostico/landing-frame.tsx" \
  "apps/web/src/app/(landings)/caro-fitness/diagnostico/raw/route.ts" \
  "apps/web/src/app/(landings)/caro-fitness/diagnostico/landing.html" \
  "apps/web/src/app/api/caro-fitness/ingest/route.ts" \
  "apps/web/src/app/api/caro-fitness/progress/route.ts" \
  "apps/web/src/lib/caro-fitness/api-config.ts" \
  "apps/web/src/lib/caro-fitness/export-leads.ts" \
  "apps/web/src/app/(landings)/caro-fitness/diagnostico/responses/page.tsx" \
  "apps/web/src/app/(landings)/caro-fitness/diagnostico/responses/responses-view.tsx" \
  "apps/api/src/core/routes/caro-fitness-progress.routes.ts" \
  "apps/api/src/core/services/caro-fitness-progress.service.ts" \
  "apps/api/src/orgs/caro-fitness/main/config.ts"; do
  [[ -f "$ROOT/$f" ]] && pass "exists: $f" || fail "missing: $f"
done

grep -q "$SOURCE" "$ROOT/apps/api/src/core/services/ingestion-source-resolver.service.ts" && \
  pass "ingest source registered in API resolver" || fail "source $SOURCE not in resolver"
grep -q "await submitCaroLead" "$LANDING_HTML" && pass "landing awaits ingest before results" || fail "submitLead does not await ingest"
grep -q "iframe-height" "$LANDING_HTML" && pass "landing posts iframe-height" || fail "iframe-height missing"
grep -q "/api/caro-fitness/ingest" "$LANDING_HTML" && pass "INGEST_PATH same-origin proxy" || fail "INGEST_PATH wrong"
grep -q "buildIngestPayload" "$LANDING_HTML" && pass "buildIngestPayload with quiz fields" || fail "buildIngestPayload missing"
grep -q "proteina_meta_g" "$LANDING_HTML" && pass "customFields include protein calc" || fail "proteina_meta_g missing"
grep -q "PROGRESS_PATH" "$LANDING_HTML" && pass "landing has progress autosave path" || fail "PROGRESS_PATH missing"
grep -q "scheduleProgressSave" "$LANDING_HTML" && pass "landing schedules progress saves" || fail "scheduleProgressSave missing"
grep -q "intro-cta-bottom" "$LANDING_HTML" && pass "CTA at bottom of intro" || fail "intro-cta-bottom missing"
grep -q "cta-actions-hidden" "$LANDING_HTML" && pass "webinar/WhatsApp CTAs hidden" || fail "cta-actions-hidden missing"
grep -q "listCaroFitnessProgressForTable" "$ROOT/apps/api/src/core/services/caro-fitness-progress.service.ts" && \
  pass "progress service has listForTable" || fail "listCaroFitnessProgressForTable missing"
grep -q "export async function GET" "$ROOT/apps/web/src/app/api/caro-fitness/progress/route.ts" && \
  pass "progress route supports GET list" || fail "GET /api/caro-fitness/progress missing"
grep -q "downloadLeadsCsv" "$ROOT/apps/web/src/app/(landings)/caro-fitness/diagnostico/responses/responses-view.tsx" && \
  pass "responses panel supports CSV export" || fail "CSV export missing in responses panel"
grep -q "downloadLeadsXlsx" "$ROOT/apps/web/src/app/(landings)/caro-fitness/diagnostico/responses/responses-view.tsx" && \
  pass "responses panel supports Excel export" || fail "Excel export missing in responses panel"

section "1. Environment"
[[ -n "${CARO_FITNESS_ORG_ID:-}" ]] && pass "CARO_FITNESS_ORG_ID set" || fail "CARO_FITNESS_ORG_ID missing"
[[ -n "${NEXT_PUBLIC_CARO_FITNESS_WEBINAR_URL:-}" && "${NEXT_PUBLIC_CARO_FITNESS_WEBINAR_URL}" != "#" && "${NEXT_PUBLIC_CARO_FITNESS_WEBINAR_URL}" != "https://..." ]] && \
  pass "NEXT_PUBLIC_CARO_FITNESS_WEBINAR_URL configured" || warn "webinar URL placeholder/missing"
[[ -n "${NEXT_PUBLIC_CARO_FITNESS_WHATSAPP_URL:-}" && "${NEXT_PUBLIC_CARO_FITNESS_WHATSAPP_URL}" != "#" && "${NEXT_PUBLIC_CARO_FITNESS_WHATSAPP_URL}" != "https://chat.whatsapp.com/..." ]] && \
  pass "NEXT_PUBLIC_CARO_FITNESS_WHATSAPP_URL configured" || warn "WhatsApp group URL placeholder/missing"
[[ -n "${NEXT_PUBLIC_API_URL:-}" ]] && pass "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" || warn "NEXT_PUBLIC_API_URL not set"
if [[ "${NEXT_PUBLIC_API_URL:-}" == "http://localhost:3000" ]]; then
  warn "NEXT_PUBLIC_API_URL=3000 may hit wrong process locally — use marketing-funnel API port in dev"
fi
[[ -n "${NEXT_PUBLIC_META_PIXEL_CARO_FITNESS:-}" ]] && pass "NEXT_PUBLIC_META_PIXEL_CARO_FITNESS set" || warn "Meta pixel not configured"

if [[ -f "$ROOT/apps/web/public/caro-fitness/diagnostico/intro.png" ]]; then
  pass "intro.png asset present"
else
  warn "intro.png missing in public/caro-fitness/diagnostico/"
fi

section "2. API health + org binding"
code=$(curl -s -o /tmp/qa_caro_health.json -w "%{http_code}" "$API/api/health" 2>/dev/null || echo "000")
[[ "$code" == "200" ]] && pass "API reachable ($API)" || fail "API not reachable ($code)"

code=$(curl -s -o /tmp/qa_caro_bind.json -w "%{http_code}" -X POST "$API/api/orgs/caro-fitness/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d '{"source":"'"$SOURCE"'","email":"probe@test.com"}' 2>/dev/null || echo "000")
if [[ "$code" == "201" || "$code" == "200" ]]; then
  pass "caro-fitness/main ingest binding OK"
elif [[ "$code" == "400" ]]; then
  if grep -q "Invalid source" /tmp/qa_caro_bind.json 2>/dev/null; then
    fail "ingest rejects source $SOURCE (not in resolver)"
  else
    pass "ingest route reachable (400 validation, not unknown source)"
  fi
elif [[ "$code" == "503" ]]; then
  fail "CARO_FITNESS_ORG_ID not set on API ($code)"
elif [[ "$code" == "404" ]]; then
  fail "caro-fitness org not registered ($code)"
else
  warn "ingest probe → $code: $(cat /tmp/qa_caro_bind.json 2>/dev/null | head -c 200)"
fi

section "3. Web pages"
for path in \
  "/caro-fitness/diagnostico" \
  "/caro-fitness/diagnostico/raw" \
  "/caro-fitness/diagnostico/responses" \
  "/caro-fitness"; do
  headers=$(curl -s -D /tmp/qa_caro_hdr.txt -o /tmp/qa_caro_page.html -w "%{http_code}" "$WEB$path" 2>/dev/null || echo "000")
  if [[ "$path" == "/caro-fitness" ]]; then
    if [[ "$headers" == "307" || "$headers" == "308" ]]; then
      grep -qi "location:.*diagnostico" /tmp/qa_caro_hdr.txt && pass "GET $path → redirect to diagnostico" || fail "GET $path redirect wrong"
    elif [[ "$headers" == "200" ]]; then
      pass "GET $path → 200"
    else
      fail "GET $path → $headers"
    fi
  else
    [[ "$headers" == "200" ]] && pass "GET $path → 200" || fail "GET $path → $headers"
  fi
done

curl -s "$WEB/caro-fitness/diagnostico" -o /tmp/qa_caro_shell.html 2>/dev/null || true
grep -q "caro-fitness/diagnostico/raw" /tmp/qa_caro_shell.html && pass "shell page loads iframe raw route" || fail "iframe src missing"
grep -q "Diagnóstico de Rendimiento" /tmp/qa_caro_shell.html && pass "SSR metadata title" || fail "title missing in SSR"

curl -s "$WEB/caro-fitness/diagnostico/raw" -o /tmp/qa_caro_raw.html 2>/dev/null || true
grep -q "Caro Manrique" /tmp/qa_caro_raw.html && pass "raw HTML brand Caro Manrique" || fail "brand missing in raw"
grep -q "submitCaroLead" /tmp/qa_caro_raw.html && pass "raw HTML has submitCaroLead" || fail "submitCaroLead missing"
grep -q "computeResults" /tmp/qa_caro_raw.html && pass "raw HTML has computeResults" || fail "computeResults missing"
grep -q "goWebinar" /tmp/qa_caro_raw.html && pass "raw HTML has webinar CTA" || fail "goWebinar missing"
grep -q "joinWhatsApp" /tmp/qa_caro_raw.html && pass "raw HTML has WhatsApp CTA (hidden)" || fail "joinWhatsApp missing"
grep -q "cta-actions-hidden" /tmp/qa_caro_raw.html && pass "raw HTML hides webinar/WhatsApp CTAs" || fail "cta-actions-hidden missing in raw"
grep -q "intro-cta-bottom" /tmp/qa_caro_raw.html && pass "raw HTML has bottom intro CTA" || fail "intro-cta-bottom missing in raw"
grep -q "data-screen=\"lead\"" /tmp/qa_caro_raw.html && pass "lead capture screen present" || fail "lead screen missing"
grep -q "data-screen=\"results\"" /tmp/qa_caro_raw.html && pass "results screen present" || fail "results screen missing"

curl -s "$WEB/caro-fitness/diagnostico/responses" -o /tmp/qa_caro_responses.html 2>/dev/null || true
grep -q "Registros del diagnóstico" /tmp/qa_caro_responses.html && pass "responses panel page renders" || fail "responses panel missing title"
grep -q "CaroFitnessResponsesView\|Registros del diagnóstico" /tmp/qa_caro_responses.html && pass "responses panel SSR shell" || fail "responses panel shell missing"

img_code=$(curl -s -o /dev/null -w "%{http_code}" "$WEB/caro-fitness/diagnostico/intro.png" 2>/dev/null || echo "000")
if [[ "$img_code" == "200" ]]; then
  pass "intro.png served → 200"
else
  warn "intro.png → $img_code (broken image until asset uploaded)"
fi

section "4. Web proxy ingest"
FULL_PAYLOAD=$(cat <<EOF
{
  "source": "$SOURCE",
  "channel": "inbound",
  "email": "$QA_EMAIL",
  "firstName": "Caro QA",
  "phone": "+57300${TS: -7}",
  "customFields": {
    "landing": "diagnostico",
    "sexo": "mujer",
    "objetivo": "grasa",
    "edad": "25-35",
    "peso_kg": "62",
    "frecuencia_entrenamiento": "3",
    "tipo_entrenamiento": "fuerza",
    "proteina_autorreportada": "baja",
    "sueno": "6-7",
    "frustracion": "no-bajo-grasa",
    "proteina_meta_g": "130",
    "proteina_por_comida_g": "33",
    "hidratacion_l": "2.5",
    "factor_proteico": "2.1",
    "diagnostico_submitted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  },
  "utmData": {
    "utm_source": "qa-deep",
    "utm_medium": "script",
    "utm_campaign": "caro-$TS"
  }
}
EOF
)

code=$(curl -s -o /tmp/qa_caro_web_ingest.json -w "%{http_code}" -X POST "$WEB/api/caro-fitness/ingest" \
  -H "Content-Type: application/json" \
  -d "$FULL_PAYLOAD" 2>/dev/null || echo "000")
if [[ "$code" == "201" || "$code" == "200" ]]; then
  pass "POST /api/caro-fitness/ingest → $code"
  grep -q '"lead"' /tmp/qa_caro_web_ingest.json && pass "response includes lead object" || warn "no lead in response body"
elif grep -q "Invalid source" /tmp/qa_caro_web_ingest.json 2>/dev/null; then
  fail "web proxy ingest: invalid source — fix resolver"
else
  fail "POST /api/caro-fitness/ingest → $code: $(cat /tmp/qa_caro_web_ingest.json 2>/dev/null | head -c 300)"
fi

code=$(curl -s -o /tmp/qa_caro_web_bad.json -w "%{http_code}" -X POST "$WEB/api/caro-fitness/ingest" \
  -H "Content-Type: application/json" \
  -d '{"source":"'"$SOURCE"'","firstName":"No Email"}' 2>/dev/null || echo "000")
[[ "$code" == "400" ]] && pass "web proxy rejects missing email → 400" || fail "should reject missing email → $code"

section "4b. Progress autosave"
PROGRESS_SESSION="qa-caro-progress-${TS}"
PROGRESS_PAYLOAD=$(cat <<EOF
{
  "sessionId": "$PROGRESS_SESSION",
  "source": "$SOURCE",
  "quizStep": "q-sexo",
  "status": "in_progress",
  "answers": {"sexo": "mujer", "objetivo": "grasa"},
  "utmData": {"utm_source": "qa-deep"}
}
EOF
)
code=$(curl -s -o /tmp/qa_caro_progress_web.json -w "%{http_code}" -X POST "$WEB/api/caro-fitness/progress" \
  -H "Content-Type: application/json" \
  -d "$PROGRESS_PAYLOAD" 2>/dev/null || echo "000")
if [[ "$code" == "201" || "$code" == "200" ]]; then
  pass "POST /api/caro-fitness/progress → $code"
  grep -q '"sessionId"' /tmp/qa_caro_progress_web.json && pass "progress response includes sessionId" || warn "progress response shape unexpected"
else
  fail "POST /api/caro-fitness/progress → $code: $(cat /tmp/qa_caro_progress_web.json 2>/dev/null | head -c 300)"
fi

MERGE_PAYLOAD=$(cat <<EOF
{
  "sessionId": "$PROGRESS_SESSION",
  "source": "$SOURCE",
  "email": "qa-caro-partial-${TS}@afluence-test.invalid",
  "firstName": "Partial QA",
  "quizStep": "lead",
  "status": "in_progress",
  "answers": {"sexo": "mujer", "objetivo": "grasa", "edad": "25-35"}
}
EOF
)
code=$(curl -s -o /tmp/qa_caro_progress_merge.json -w "%{http_code}" -X POST "$WEB/api/caro-fitness/progress" \
  -H "Content-Type: application/json" \
  -d "$MERGE_PAYLOAD" 2>/dev/null || echo "000")
[[ "$code" == "201" || "$code" == "200" ]] && pass "progress upsert merges answers by sessionId" || fail "progress merge → $code"

code=$(curl -s -o /tmp/qa_caro_progress_bad.json -w "%{http_code}" -X POST "$WEB/api/caro-fitness/progress" \
  -H "Content-Type: application/json" \
  -d '{"source":"'"$SOURCE"'","answers":{"sexo":"mujer"}}' 2>/dev/null || echo "000")
[[ "$code" == "400" ]] && pass "progress rejects missing sessionId → 400" || fail "progress should reject missing sessionId → $code"

code=$(curl -s -o /tmp/qa_caro_progress_list.json -w "%{http_code}" "$WEB/api/caro-fitness/progress" 2>/dev/null || echo "000")
if [[ "$code" == "200" ]]; then
  pass "GET /api/caro-fitness/progress → 200"
  grep -q '"data"' /tmp/qa_caro_progress_list.json && pass "progress list includes data array" || fail "progress list shape unexpected"
  grep -q '"total"' /tmp/qa_caro_progress_list.json && pass "progress list includes total" || fail "progress list total missing"
elif [[ "$code" == "401" && -n "${CARO_FITNESS_VIEW_TOKEN:-}" ]]; then
  pass "GET /api/caro-fitness/progress protected → 401"
else
  fail "GET /api/caro-fitness/progress → $code: $(cat /tmp/qa_caro_progress_list.json 2>/dev/null | head -c 300)"
fi

section "5. Direct API ingest (dedup update)"
DEDUP_EMAIL="qa-caro-dedup-${TS}@afluence-test.invalid"
P1=$(cat <<EOF
{"source":"$SOURCE","channel":"inbound","email":"$DEDUP_EMAIL","firstName":"First","customFields":{"landing":"diagnostico","objetivo":"grasa"}}
EOF
)
P2=$(cat <<EOF
{"source":"$SOURCE","channel":"inbound","email":"$DEDUP_EMAIL","firstName":"Updated","customFields":{"landing":"diagnostico","objetivo":"musculo","proteina_meta_g":"140"}}
EOF
)
code1=$(curl -s -o /tmp/qa_caro_d1.json -w "%{http_code}" -X POST "$API/api/orgs/caro-fitness/bus/main/ingest" \
  -H "Content-Type: application/json" -d "$P1" 2>/dev/null || echo "000")
code2=$(curl -s -o /tmp/qa_caro_d2.json -w "%{http_code}" -X POST "$API/api/orgs/caro-fitness/bus/main/ingest" \
  -H "Content-Type: application/json" -d "$P2" 2>/dev/null || echo "000")
if [[ "$code1" == "201" ]]; then
  pass "direct ingest create → 201"
  if [[ "$code2" == "201" || "$code2" == "200" ]]; then
    grep -q "updated\|Updated\|Lead updated" /tmp/qa_caro_d2.json && pass "dedup update same email" || pass "dedup second POST → $code2"
  else
    fail "dedup update → $code2"
  fi
else
  fail "direct ingest create → $code1: $(cat /tmp/qa_caro_d1.json 2>/dev/null | head -c 200)"
fi

section "6. Invalid payloads"
code=$(curl -s -o /tmp/qa_caro_bad_src.json -w "%{http_code}" -X POST "$API/api/orgs/caro-fitness/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d '{"source":"landing-unknown-xyz","email":"bad@test.com"}' 2>/dev/null || echo "000")
[[ "$code" == "400" ]] && pass "rejects unknown source → 400" || fail "unknown source should 400 → $code"

section "SUMMARY"
TOTAL=$((PASS + FAIL + WARN))
echo ""
echo "PASS: $PASS | FAIL: $FAIL | WARN: $WARN | TOTAL: $TOTAL"
if [[ "$FAIL" -gt 0 ]]; then
  echo "RESULT: FAIL"
  exit 1
fi
echo "RESULT: PASS (with $WARN warnings)"
exit 0
