#!/usr/bin/env bash
# QA: Lucas con Lucas webinar ingestion
# Usage: ./scripts/qa-lucas-webinar-ingest.sh [API_BASE_URL]
# Requires LUCAS_CON_LUCAS_ORG_ID in .env.local and API running.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="${1:-http://localhost:3000}"
SOURCE="landing-lucas-con-lucas-webinar-2026-06-04"
TS="$(date +%s)"
EMAIL="webinar-qa-${TS}@test.afluence.local"

if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
fi

echo "API: $API"
echo "Source: $SOURCE"
echo "Test email: $EMAIL"
echo ""

fail() { echo "FAIL: $1"; exit 1; }
pass() { echo "PASS: $1"; }

# 1. Invalid source
code=$(curl -s -o /tmp/qa.json -w "%{http_code}" -X POST "$API/api/orgs/lucas-con-lucas/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d '{"email":"x@test.com","source":"landing-invalid"}')
[[ "$code" == "400" ]] && pass "invalid source → 400" || fail "invalid source expected 400 got $code"

# 2. Missing email
code=$(curl -s -o /tmp/qa.json -w "%{http_code}" -X POST "$API/api/orgs/lucas-con-lucas/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d "{\"source\":\"$SOURCE\"}")
[[ "$code" == "400" ]] && pass "missing email → 400" || fail "missing email expected 400 got $code"

# 3. Org not configured
if [[ -z "${LUCAS_CON_LUCAS_ORG_ID:-}" ]]; then
  code=$(curl -s -o /tmp/qa.json -w "%{http_code}" -X POST "$API/api/orgs/lucas-con-lucas/bus/main/ingest" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"phone\":\"+56912345678\",\"source\":\"$SOURCE\"}")
  [[ "$code" == "503" ]] && pass "no LUCAS_CON_LUCAS_ORG_ID → 503 (configure env to continue)" || fail "expected 503 without org id, got $code"
  echo ""
  echo "Set LUCAS_CON_LUCAS_ORG_ID in .env.local (npm run seed:lucas-con-lucas -w @marketing-funnel/api) and re-run."
  exit 0
fi

# 4. Valid create
code=$(curl -s -o /tmp/qa.json -w "%{http_code}" -X POST "$API/api/orgs/lucas-con-lucas/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"QA Webinar\",
    \"email\": \"$EMAIL\",
    \"phone\": \"+56912345678\",
    \"source\": \"$SOURCE\",
    \"channel\": \"inbound\",
    \"customFields\": {
      \"event_type\": \"webinar\",
      \"webinar_date\": \"2026-06-04\",
      \"webinar_time\": \"19:00\",
      \"webinar_timezone\": \"America/Santiago\"
    },
    \"tracking\": { \"meta\": { \"eventId\": \"qa-$TS\" } }
  }")
[[ "$code" == "201" ]] && pass "valid payload → 201" || fail "valid payload expected 201 got $code (body: $(cat /tmp/qa.json))"

LEAD_ID=$(python3 -c "import json; print(json.load(open('/tmp/qa.json')).get('lead',{}).get('id',''))")
[[ -n "$LEAD_ID" ]] && pass "lead.id returned: $LEAD_ID" || fail "missing lead.id in response"

SOURCE_SAVED=$(python3 -c "import json; print(json.load(open('/tmp/qa.json')).get('lead',{}).get('source',''))")
[[ "$SOURCE_SAVED" == "$SOURCE" ]] && pass "lead.source correct" || fail "lead.source=$SOURCE_SAVED"

# 5. Duplicate update
code=$(curl -s -o /tmp/qa2.json -w "%{http_code}" -X POST "$API/api/orgs/lucas-con-lucas/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"QA Updated\",
    \"email\": \"$EMAIL\",
    \"phone\": \"+56987654321\",
    \"source\": \"$SOURCE\"
  }")
[[ "$code" == "201" ]] && pass "duplicate email → 201 update" || fail "duplicate expected 201 got $code"

MSG=$(python3 -c "import json; print(json.load(open('/tmp/qa2.json')).get('message',''))")
[[ "$MSG" == *"updated"* ]] && pass "message indicates update" || echo "WARN: message=$MSG"

# 6. Fetch lead
code=$(curl -s -o /tmp/qa_lead.json -w "%{http_code}" "$API/api/leads/$LEAD_ID")
[[ "$code" == "200" ]] && pass "GET /api/leads/:id → 200" || fail "GET lead expected 200 got $code"

echo ""
echo "All ingestion checks passed."
