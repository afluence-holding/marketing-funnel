#!/usr/bin/env bash
# Deep QA — Lucas con Lucas Pixel + CAPI
# Usage: ./scripts/qa-lucas-pixel-capi.sh [API_BASE] [WEB_BASE]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="${1:-http://localhost:3000}"
WEB="${2:-http://localhost:3001}"
TS="$(date +%s)"
PASS=0
FAIL=0
WARN=0

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

section "0. Environment"
[[ -n "${META_PIXEL_ID_LUCAS_CON_LUCAS:-}" ]] && pass "META_PIXEL_ID_LUCAS_CON_LUCAS set" || fail "META_PIXEL_ID_LUCAS_CON_LUCAS missing"
[[ -n "${META_CAPI_TOKEN_LUCAS_CON_LUCAS:-}" ]] && pass "META_CAPI_TOKEN_LUCAS_CON_LUCAS set" || fail "META_CAPI_TOKEN_LUCAS_CON_LUCAS missing"
[[ -n "${NEXT_PUBLIC_META_PIXEL_LUCAS_CON_LUCAS:-}" ]] && pass "NEXT_PUBLIC_META_PIXEL_LUCAS_CON_LUCAS set" || warn "NEXT_PUBLIC_META_PIXEL (web) missing — browser pixel may not init in dev"
PIXEL_ID="${META_PIXEL_ID_LUCAS_CON_LUCAS:-3904610923173158}"
CAPI_TOKEN="${META_CAPI_TOKEN_LUCAS_CON_LUCAS:-}"

section "1. API health"
code=$(curl -s -o /tmp/qa_health.json -w "%{http_code}" "$API/api/health" 2>/dev/null || echo "000")
[[ "$code" == "200" ]] && pass "API reachable ($API)" || fail "API not reachable ($code) — run npm run dev"

section "2. Web pages render"
for path in \
  "/lucas-con-lucas/webinar" \
  "/lucas-con-lucas/pre-launch-form" \
  "/lucas-con-lucas/reto" \
  "/lucas-con-lucas/reto/gracias?status=success"; do
  code=$(curl -s -o /tmp/qa_page.html -w "%{http_code}" "$WEB$path" 2>/dev/null || echo "000")
  [[ "$code" == "200" ]] && pass "GET $path → 200" || fail "GET $path → $code"
done

section "3. Web — tracking components in HTML"
html_webinar=$(curl -s "$WEB/lucas-con-lucas/webinar" 2>/dev/null || true)
echo "$html_webinar" | grep -q "webinar-registration\|WebinarRegistration\|Reservar mi cupo" && pass "Webinar page has registration UI" || warn "Webinar UI marker not found in SSR HTML (may be client-only)"

html_reto=$(curl -s "$WEB/lucas-con-lucas/reto" 2>/dev/null || true)
echo "$html_reto" | grep -q "lucas-con-lucas/reto/raw" && pass "Reto page loads iframe raw route" || fail "Reto iframe src missing"
echo "$html_reto" | grep -q "Reservar mi cupo" && pass "Reto floating CTA present" || fail "Reto floating CTA missing"

html_gracias=$(curl -s "$WEB/lucas-con-lucas/reto/gracias?status=success" 2>/dev/null || true)
echo "$html_gracias" | grep -qi "Cupo reservado\|confirmada" && pass "Gracias page content renders" || fail "Gracias page content missing"
echo "$html_gracias" | grep -q "PurchaseTracker\|gracias-content" && pass "Gracias client components bundled" || warn "Gracias tracker component not visible in SSR (client-only OK)"

html_reto_raw=$(curl -s "$WEB/lucas-con-lucas/reto/raw" 2>/dev/null || true)
echo "$html_reto_raw" | grep -q 'lucas-reto-checkout' && pass "Reto raw: checkout postMessage intercept script" || fail "Reto raw: missing checkout intercept"
echo "$html_reto_raw" | grep -q 'whop.com/checkout/plan_aKOjfecUWLzFo' && pass "Reto raw: Whop checkout URL present" || fail "Reto raw: Whop URL missing"

section "4. Webinar ingest + CAPI payload"
WEBINAR_SOURCE="landing-lucas-con-lucas-webinar-2026-06-04"
WEBINAR_EMAIL="qa-webinar-capi-${TS}@test.afluence.local"
EVENT_ID="qa-webinar-${TS}"

if [[ -z "${LUCAS_CON_LUCAS_ORG_ID:-}" ]]; then
  warn "LUCAS_CON_LUCAS_ORG_ID not set — skipping ingest tests (run seed:lucas-con-lucas)"
else
  code=$(curl -s -o /tmp/qa_webinar.json -w "%{http_code}" -X POST "$API/api/orgs/lucas-con-lucas/bus/main/ingest" \
    -H "Content-Type: application/json" \
    -H "Referer: http://localhost:3001/lucas-con-lucas/webinar" \
    -H "User-Agent: LucasQA/1.0" \
    -d "{
      \"firstName\": \"Lucas\",
      \"lastName\": \"QA\",
      \"email\": \"$WEBINAR_EMAIL\",
      \"phone\": \"+56912345678\",
      \"source\": \"$WEBINAR_SOURCE\",
      \"channel\": \"inbound\",
      \"tracking\": {
        \"meta\": {
          \"eventId\": \"$EVENT_ID\",
          \"fbp\": \"fb.1.${TS}.1234567890\",
          \"fbc\": \"fb.1.${TS}.9876543210\"
        }
      }
    }")
  [[ "$code" == "201" ]] && pass "Webinar ingest → 201" || fail "Webinar ingest → $code ($(cat /tmp/qa_webinar.json))"

  if [[ -n "$CAPI_TOKEN" ]]; then
    capi_resp=$(node -e "
      const crypto=require('crypto');
      const sha=(v)=>crypto.createHash('sha256').update(v).digest('hex');
      const eventId='$EVENT_ID';
      fetch('https://graph.facebook.com/v21.0/${PIXEL_ID}/events',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          data:[{
            event_name:'Lead',
            event_time:Math.floor(Date.now()/1000),
            event_id:eventId+'-verify-lead',
            action_source:'website',
            user_data:{
              em:[sha('$WEBINAR_EMAIL'.toLowerCase())],
              ph:[sha('56912345678')],
              fn:[sha('lucas')],
              ln:[sha('qa')],
              country:[sha('cl')],
              fbp:'fb.1.${TS}.1234567890',
              client_ip_address:'127.0.0.1',
              client_user_agent:'LucasQA/1.0'
            },
            custom_data:{
              content_ids:['webinar-lcl-jun04'],
              content_name:'Webinar Lucas con Luca\$ Jun 4',
              value:0,
              currency:'CLP'
            }
          }],
          access_token:'$CAPI_TOKEN'
        })
      }).then(r=>r.text()).then(t=>console.log(t)).catch(e=>console.log(JSON.stringify({error:e.message})));
    ")
    echo "$capi_resp" | grep -q '"events_received":1' && pass "Meta CAPI Lead payload accepted" || fail "Meta CAPI Lead rejected: $capi_resp"
  fi
fi

section "5. Pre-launch ingest (Lead only CAPI)"
PRELAUNCH_SOURCE="landing-lucas-con-lucas-pre-launch"
PRELAUNCH_EMAIL="qa-prelaunch-${TS}@test.afluence.local"
PRE_EVENT_ID="qa-prelaunch-${TS}"

if [[ -n "${LUCAS_CON_LUCAS_ORG_ID:-}" ]]; then
  code=$(curl -s -o /tmp/qa_pre.json -w "%{http_code}" -X POST "$API/api/orgs/lucas-con-lucas/bus/main/ingest" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$PRELAUNCH_EMAIL\",
      \"source\": \"$PRELAUNCH_SOURCE\",
      \"channel\": \"inbound\",
      \"tracking\": { \"meta\": { \"eventId\": \"$PRE_EVENT_ID\" } }
    }")
  [[ "$code" == "201" ]] && pass "Pre-launch ingest → 201" || fail "Pre-launch ingest → $code"
fi

section "6. Purchase endpoint + CAPI"
PURCHASE_EVENT_ID="qa-purchase-${TS}"
ORDER_ID="whop-order-${TS}"

code=$(curl -s -o /tmp/qa_purchase.json -w "%{http_code}" -X POST "$API/api/orgs/lucas-con-lucas/bus/main/purchase" \
  -H "Content-Type: application/json" \
  -H "Referer: http://localhost:3001/lucas-con-lucas/reto/gracias?status=success" \
  -H "User-Agent: LucasQA/1.0" \
  -d "{
    \"eventId\": \"$PURCHASE_EVENT_ID\",
    \"orderId\": \"$ORDER_ID\",
    \"email\": \"buyer-${TS}@test.afluence.local\",
    \"firstName\": \"Comprador\",
    \"lastName\": \"QA\",
    \"phone\": \"+56987654321\",
    \"value\": 77000,
    \"currency\": \"CLP\",
    \"tracking\": {
      \"meta\": {
        \"fbp\": \"fb.1.${TS}.1111111111\",
        \"fbc\": \"fb.1.${TS}.2222222222\"
      }
    }
  }")
[[ "$code" == "200" ]] && pass "POST /purchase → 200" || fail "POST /purchase → $code ($(cat /tmp/qa_purchase.json))"
grep -q '"ok":true' /tmp/qa_purchase.json && pass "Purchase response ok:true" || fail "Purchase response invalid"

if [[ -n "$CAPI_TOKEN" ]]; then
  capi_purchase=$(node -e "
    const crypto=require('crypto');
    const sha=(v)=>crypto.createHash('sha256').update(v).digest('hex');
    fetch('https://graph.facebook.com/v21.0/${PIXEL_ID}/events',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        data:[{
          event_name:'Purchase',
          event_time:Math.floor(Date.now()/1000),
          event_id:'$PURCHASE_EVENT_ID-verify',
          action_source:'website',
          event_source_url:'https://marketing.byafluence.com/lucas-con-lucas/reto/gracias',
          user_data:{
            em:[sha('buyer-${TS}@test.afluence.local')],
            ph:[sha('56987654321')],
            fn:[sha('comprador')],
            ln:[sha('qa')],
            country:[sha('cl')],
            fbp:'fb.1.${TS}.1111111111',
            client_ip_address:'127.0.0.1',
            client_user_agent:'LucasQA/1.0'
          },
          custom_data:{
            content_ids:['reto-lcl-jun29'],
            content_name:'Reto Lucas con Luca\$ 15 días',
            content_type:'product',
            value:77000,
            currency:'CLP',
            order_id:'$ORDER_ID',
            num_items:1
          }
        }],
        access_token:'$CAPI_TOKEN'
      })
    }).then(r=>r.text()).then(t=>console.log(t)).catch(e=>console.log(JSON.stringify({error:e.message})));
  ")
  echo "$capi_purchase" | grep -q '"events_received":1' && pass "Meta CAPI Purchase payload accepted" || fail "Meta CAPI Purchase rejected: $capi_purchase"
fi

section "7. Purchase validation errors"
code=$(curl -s -o /tmp/qa_purchase_bad.json -w "%{http_code}" -X POST "$API/api/orgs/lucas-con-lucas/bus/main/purchase" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"x","value":-1,"currency":"CLP","orderId":"bad"}')
[[ "$code" == "400" ]] && pass "Invalid purchase value → 400" || fail "Invalid purchase expected 400 got $code"

code=$(curl -s -o /tmp/qa_purchase_bad2.json -w "%{http_code}" -X POST "$API/api/orgs/lucas-con-lucas/bus/main/purchase" \
  -H "Content-Type: application/json" \
  -d '{"value":77000,"currency":"CLP","orderId":"no-event-id"}')
[[ "$code" == "400" ]] && pass "Missing eventId → 400" || fail "Missing eventId expected 400 got $code"

section "8. Static — lucas-meta event shapes"
node - <<'NODE'
const fs = require('fs');
const path = require('path');
const cfgPath = path.join(process.cwd(), 'apps/web/src/app/(landings)/lucas-con-lucas/lucas-config.ts');
const metaPath = path.join(process.cwd(), 'apps/web/src/lib/tracking/lucas-meta.ts');
const cfg = fs.readFileSync(cfgPath, 'utf8');
const meta = fs.readFileSync(metaPath, 'utf8');
let ok = true;
const checks = [
  ['webinar-lcl-jun04', cfg.includes('webinar-lcl-jun04')],
  ['reto-lcl-jun29', cfg.includes('reto-lcl-jun29')],
  ['77000 default price', cfg.includes('77000')],
  ['gracias path', cfg.includes('/lucas-con-lucas/reto/gracias')],
  ['InitiateCheckout handler', meta.includes('InitiateCheckout')],
  ['localStorage checkout ctx', meta.includes('localStorage')],
  ['Lead + CompleteRegistration webinar helpers', meta.includes('lucasWebinarLead') && meta.includes('lucasWebinarCompleteRegistration')],
];
for (const [label, result] of checks) {
  if (result) console.log('  ✅ static: ' + label);
  else { console.log('  ❌ static: ' + label); ok = false; }
}
process.exit(ok ? 0 : 1);
NODE
[[ $? -eq 0 ]] && PASS=$((PASS + 7)) || FAIL=$((FAIL + 1))

section "9. Typecheck"
if npm run typecheck -w @marketing-funnel/web -w @marketing-funnel/api >/tmp/qa_typecheck.log 2>&1; then
  pass "Typecheck web + api"
else
  fail "Typecheck failed — see /tmp/qa_typecheck.log"
  tail -5 /tmp/qa_typecheck.log
fi

section "SUMMARY"
TOTAL=$((PASS + FAIL))
echo ""
echo "Passed: $PASS | Failed: $FAIL | Warnings: $WARN"
if [[ "$FAIL" -gt 0 ]]; then
  echo "RESULT: FAIL"
  exit 1
fi
echo "RESULT: PASS"
exit 0
