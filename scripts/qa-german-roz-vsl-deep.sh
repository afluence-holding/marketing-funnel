#!/usr/bin/env bash
# Deep QA — Germán Roz VSL de venta (vsl-desinflamate)
# Usage: ./scripts/qa-german-roz-vsl-deep.sh [API_BASE] [WEB_BASE]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="${1:-http://localhost:3000}"
WEB="${2:-http://localhost:3001}"
TS="$(date +%s)"
PASS=0
FAIL=0
WARN=0

VSL_PATH="/german-roz/vsl-desinflamate"
LISTA_PATH="/german-roz/lista-espera"
CHECKOUT_PATH="/german-roz/desinflamate/checkout"
VSL_SOURCE="landing-german-roz-vsl-desinflamate"
WHATSAPP_E164="51973227945"
HTML_FILE="$ROOT/apps/web/src/app/(landings)/german-roz/vsl-desinflamate/vsl-desinflamate.html"
PAGE_FILE="$ROOT/apps/web/src/app/(landings)/german-roz/vsl-desinflamate/page.tsx"
TRACKER_FILE="$ROOT/apps/web/src/app/(landings)/german-roz/vsl-desinflamate/vsl-tracker.tsx"
ATTR_FILE="$ROOT/apps/web/src/app/(landings)/german-roz/vsl-desinflamate/vsl-attribution.tsx"
LINK_FILE="$ROOT/apps/web/src/app/(landings)/german-roz/vsl-desinflamate/checkout-link.ts"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
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

section "0. Repo / static checks"
if (cd "$ROOT" && npm run typecheck -w @marketing-funnel/web >/dev/null 2>&1); then
  pass "typecheck @marketing-funnel/web"
else
  fail "typecheck @marketing-funnel/web"
fi

if [[ -f "$HTML_FILE" ]]; then
  html_bytes=$(wc -c < "$HTML_FILE" | tr -d ' ')
  if [[ "$html_bytes" -gt 500000 ]]; then
    pass "vsl-desinflamate.html exists (${html_bytes} bytes)"
  else
    warn "vsl-desinflamate.html small (${html_bytes} bytes) — bundle may be truncated"
  fi
else
  fail "vsl-desinflamate.html missing"
fi

grep -q "permanentRedirect" "$PAGE_FILE" && \
  fail "page.tsx still has permanentRedirect (VSL not activated)" || \
  pass "page.tsx serves VSL (no redirect)"

grep -q "srcDoc={html}" "$PAGE_FILE" && pass "page.tsx uses srcDoc iframe" || fail "srcDoc iframe missing"
grep -q "VslTracker" "$PAGE_FILE" && pass "page.tsx mounts VslTracker" || fail "VslTracker not mounted"
grep -q "VslAttribution" "$PAGE_FILE" && pass "page.tsx mounts VslAttribution (CTA→checkout redirect)" || fail "VslAttribution not mounted"
grep -q "LandingConfig" "$PAGE_FILE" && pass "page.tsx mounts LandingConfig" || fail "LandingConfig missing"
grep -q "51973227945" "$PAGE_FILE" && pass "WhatsApp Peru number in page.tsx" || fail "WhatsApp link missing/wrong"

grep -q "vsl-milestone" "$HTML_FILE" && pass "HTML bundle has vsl-milestone postMessage" || fail "vsl-milestone script missing"
grep -q "VSLGERMANFINAL2" "$HTML_FILE" && pass "HTML bundle references VSL video asset" || warn "VSL video asset path not found in bundle"

grep -q "$VSL_SOURCE" "$TRACKER_FILE" && \
  pass "VslTracker source constant matches ingest resolver" || fail "VslTracker SOURCE mismatch"

# CTAs must drive to the embedded checkout, NOT Hotmart
[[ -f "$LINK_FILE" ]] && grep -q "$CHECKOUT_PATH" "$LINK_FILE" && \
  pass "checkout-link points at $CHECKOUT_PATH" || fail "checkout-link missing/incorrect"
grep -q "buildDesinflamateCheckoutUrl" "$TRACKER_FILE" && \
  pass "VslTracker redirects CTAs to embedded checkout" || fail "VslTracker not wired to embedded checkout"
grep -qi "pay.hotmart.com" "$TRACKER_FILE" && \
  fail "VslTracker still hardcodes a Hotmart checkout URL" || pass "VslTracker no longer hardcodes Hotmart URL"
grep -q "buildDesinflamateCheckoutUrl" "$ATTR_FILE" && \
  pass "vsl-attribution rewrites Hotmart → embedded checkout" || fail "vsl-attribution not rewriting to checkout"
grep -q "_fbc" "$ATTR_FILE" && pass "vsl-attribution sets _fbc cookie (attribution)" || warn "_fbc cookie logic missing"

grep -q "$VSL_SOURCE" "$ROOT/apps/api/src/core/services/ingestion-source-resolver.service.ts" && \
  pass "API source resolver allows $VSL_SOURCE" || warn "VSL source not in resolver (ingest optional for VSL)"

grep -q "nutricion.germanroz.com" "$ROOT/apps/web/src/middleware.ts" && \
  pass "middleware maps nutricion.germanroz.com → /german-roz" || fail "domain middleware missing"

section "1. Environment"
[[ -n "${GERMAN_ROZ_ORG_ID:-}" ]] && pass "GERMAN_ROZ_ORG_ID set" || warn "GERMAN_ROZ_ORG_ID missing — ingest tests may fail"
[[ -n "${NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ:-}" ]] && pass "NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ set" || warn "NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ missing — pixel won't init"
[[ -n "${META_PIXEL_ID_GERMAN_ROZ:-}" ]] && pass "META_PIXEL_ID_GERMAN_ROZ set (API CAPI)" || warn "META_PIXEL_ID_GERMAN_ROZ missing"
[[ -n "${META_CAPI_TOKEN_GERMAN_ROZ:-}" ]] && pass "META_CAPI_TOKEN_GERMAN_ROZ set" || warn "META_CAPI_TOKEN_GERMAN_ROZ missing — live CAPI skipped"

section "2. API health + org binding"
code=$(curl -s -o /tmp/qa_gr_vsl_health.json -w "%{http_code}" "$API/api/health" 2>/dev/null || echo "000")
[[ "$code" == "200" ]] && pass "API reachable ($API)" || fail "API not reachable ($code)"

code=$(curl -s -o /tmp/qa_gr_vsl_bind.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/video-events" \
  -H "Content-Type: application/json" \
  -d '{"eventName":"VSL_25","source":"qa-probe"}' 2>/dev/null || echo "000")
if [[ "$code" == "400" ]]; then
  pass "video-events route exists (400 without eventId)"
elif [[ "$code" == "404" ]]; then
  fail "german-roz/main binding not found (404)"
else
  warn "video-events probe → $code (expected 400)"
fi

section "3. Web — VSL must NOT redirect"
headers=$(curl -s -D /tmp/qa_gr_vsl_headers.txt -o /tmp/qa_gr_vsl_page.html -w "%{http_code}" \
  "$WEB$VSL_PATH?utm_source=qa&fbclid=qa-fbclid-$TS" 2>/dev/null || echo "000")
[[ "$headers" == "200" ]] && pass "GET $VSL_PATH → 200" || fail "GET $VSL_PATH → $headers (expected 200, not 308)"

grep -qi "location:.*lista-espera" /tmp/qa_gr_vsl_headers.txt && \
  fail "VSL still redirects to lista-espera" || pass "No redirect to lista-espera"

grep -q "srcDoc" /tmp/qa_gr_vsl_page.html && pass "SSR HTML contains srcDoc iframe" || fail "srcDoc iframe missing in SSR"
grep -q "DESINFLAMATE" /tmp/qa_gr_vsl_page.html && pass "SSR title/content DESINFLAMATE present" || fail "DESINFLAMATE content missing"
grep -q "wa.me/${WHATSAPP_E164}" /tmp/qa_gr_vsl_page.html && pass "WhatsApp float button in SSR" || fail "WhatsApp button missing"
grep -q "iframe" /tmp/qa_gr_vsl_page.html && pass "iframe element rendered" || fail "iframe missing"

# Extract srcDoc snippet length (React may escape; grep failure is OK)
srcdoc_len=$(grep -o 'srcDoc="[^"]*"' /tmp/qa_gr_vsl_page.html 2>/dev/null | head -1 | wc -c | tr -d ' ' || true)
srcdoc_len=${srcdoc_len:-0}
if [[ "$srcdoc_len" -gt 1000 ]]; then
  pass "srcDoc payload embedded in SSR (${srcdoc_len} chars in first attr)"
elif grep -q 'srcDoc' /tmp/qa_gr_vsl_page.html 2>/dev/null; then
  pass "srcDoc present in SSR (escaped/minified — length not measured)"
else
  fail "srcDoc missing from SSR HTML"
fi

section "4. Web — related routes"
for path in "$LISTA_PATH" "/german-roz/webinar" "/german-roz/form"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$WEB$path" 2>/dev/null || echo "000")
  [[ "$code" == "200" ]] && pass "GET $path → 200" || warn "GET $path → $code"
done

section "5. HTML bundle content (from disk)"
grep -q "DESINFLAMATE" "$HTML_FILE" && pass "bundle title DESINFLAMATE" || fail "DESINFLAMATE missing in bundle"
grep -q "German Roz\|German" "$HTML_FILE" && pass "bundle mentions German Roz" || warn "German Roz name not found in minified bundle"

section "6. video-events API (VSL milestones)"
for milestone in 25 50 75 100; do
  EVENT_ID="qa-gr-vsl-${milestone}-${TS}"
  code=$(curl -s -o /tmp/qa_gr_vsl_ve.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/video-events" \
    -H "Content-Type: application/json" \
    -d "{\"eventName\":\"VSL_${milestone}\",\"source\":\"$VSL_SOURCE\",\"contentName\":\"german-roz-vsl-desinflamate\",\"milestone\":${milestone},\"tracking\":{\"meta\":{\"eventId\":\"${EVENT_ID}\",\"fbp\":\"fb.1.qa.${TS}\",\"fbc\":\"fb.1.qa.${TS}\"}}}")
  if [[ "$code" == "200" || "$code" == "202" || "$code" == "204" ]]; then
    pass "POST video-events VSL_${milestone} → $code"
  elif [[ "$code" == "503" || "$code" == "502" ]]; then
    warn "POST video-events VSL_${milestone} → $code (CAPI creds may be missing): $(cat /tmp/qa_gr_vsl_ve.json)"
  else
    fail "POST video-events VSL_${milestone} → $code: $(cat /tmp/qa_gr_vsl_ve.json)"
  fi
done

code=$(curl -s -o /tmp/qa_gr_vsl_ve_bad.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/video-events" \
  -H "Content-Type: application/json" \
  -d '{"eventName":"VSL_25","source":"qa","tracking":{"meta":{}}}')
[[ "$code" == "400" ]] && pass "video-events rejects missing eventId → 400" || fail "video-events should reject missing eventId → $code"

section "7. Embedded checkout reachable"
checkout_code=$(curl -s -o /tmp/qa_gr_checkout.html -w "%{http_code}" "$WEB$CHECKOUT_PATH" 2>/dev/null || echo "000")
if [[ "$checkout_code" == "200" ]]; then
  pass "GET $CHECKOUT_PATH → 200 (embedded checkout serves)"
  grep -qi "Desinfl" /tmp/qa_gr_checkout.html && pass "checkout page renders DI21 content" || warn "checkout content marker not found"
else
  warn "GET $CHECKOUT_PATH → $checkout_code (web server may be down)"
fi

section "8. Live Meta CAPI probe (optional)"
PIXEL_ID="${META_PIXEL_ID_GERMAN_ROZ:-}"
CAPI_TOKEN="${META_CAPI_TOKEN_GERMAN_ROZ:-}"
if [[ -n "$PIXEL_ID" && -n "$CAPI_TOKEN" ]]; then
  EVENT_ID="qa-gr-capi-${TS}"
  capi_resp=$(curl -s -X POST "https://graph.facebook.com/v21.0/${PIXEL_ID}/events" \
    -H "Content-Type: application/json" \
    -d "{\"data\":[{\"event_name\":\"PageView\",\"event_time\":$(date +%s),\"event_id\":\"${EVENT_ID}\",\"action_source\":\"website\",\"user_data\":{\"client_ip_address\":\"1.1.1.1\",\"client_user_agent\":\"qa-script\"}}],\"access_token\":\"${CAPI_TOKEN}\"}")
  echo "$capi_resp" | grep -q '"events_received":1' && pass "Meta CAPI test event accepted" || \
    warn "Meta CAPI test failed: $capi_resp"
else
  warn "Skipping live Meta CAPI (META_PIXEL_ID_GERMAN_ROZ or META_CAPI_TOKEN_GERMAN_ROZ missing)"
fi

section "9. Query params preserved on VSL (not stripped)"
curl -s "$WEB$VSL_PATH?utm_source=qa-deep&utm_campaign=vsl-$TS" -o /tmp/qa_gr_vsl_utm.html 2>/dev/null || true
# Page should render (not redirect); UTM stay in browser URL — we only verify page loads with params
grep -q "srcDoc" /tmp/qa_gr_vsl_utm.html && pass "VSL loads with UTM query params" || fail "VSL broken with UTM params"

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
