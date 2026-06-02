#!/usr/bin/env bash
# QA: German Roz webinar ingestion
# Usage: ./scripts/qa-german-roz-webinar-ingest.sh [API_BASE_URL]
# Requires API running with landing-german-roz-webinar-2026-06-10 in source resolver.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="${1:-http://localhost:3000}"
SOURCE="landing-german-roz-webinar-2026-06-10"
TS="$(date +%s)"
EMAIL="german-webinar-qa-${TS}@test.afluence.local"

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
code=$(curl -s -o /tmp/qa-gr.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d '{"email":"x@test.com","source":"landing-invalid"}')
[[ "$code" == "400" ]] && pass "invalid source → 400" || fail "invalid source expected 400 got $code"

# 2. Missing email
code=$(curl -s -o /tmp/qa-gr.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d "{\"source\":\"$SOURCE\"}")
[[ "$code" == "400" ]] && pass "missing email → 400" || fail "missing email expected 400 got $code"

# 3. Unknown webinar source (stale API)
code=$(curl -s -o /tmp/qa-gr.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"phone\":\"+51987654321\",\"source\":\"$SOURCE\"}")
if [[ "$code" == "400" ]] && grep -q 'Unknown source' /tmp/qa-gr.json 2>/dev/null; then
  echo "FAIL: API does not recognize $SOURCE — restart API (npm run dev:api) after pulling latest code"
  exit 1
fi

# 4. Invalid phone
code=$(curl -s -o /tmp/qa-gr.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"qa-phone-${TS}@test.afluence.local\",\"phone\":\"abc\",\"source\":\"$SOURCE\"}")
[[ "$code" == "400" ]] && pass "invalid phone → 400" || fail "invalid phone expected 400 got $code"

# 5. Valid create (matches landing payload)
code=$(curl -s -o /tmp/qa-gr.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"QA Webinar\",
    \"email\": \"$EMAIL\",
    \"phone\": \"+51987654321\",
    \"source\": \"$SOURCE\",
    \"channel\": \"inbound\",
    \"customFields\": {
      \"creator\": \"german-roz\",
      \"interest\": \"desinflamate-21\",
      \"event_type\": \"webinar\",
      \"webinar_date\": \"2026-06-10\",
      \"webinar_time\": \"20:00\",
      \"webinar_timezone\": \"America/Lima\"
    },
    \"tracking\": { \"meta\": { \"eventId\": \"qa-$TS\" } },
    \"utmData\": { \"utm_source\": \"qa-script\" }
  }")
[[ "$code" == "201" ]] && pass "valid payload → 201" || fail "valid payload expected 201 got $code (body: $(cat /tmp/qa-gr.json))"

LEAD_ID=$(python3 -c "import json; print(json.load(open('/tmp/qa-gr.json')).get('lead',{}).get('id',''))")
[[ -n "$LEAD_ID" ]] && pass "lead.id returned: $LEAD_ID" || fail "missing lead.id in response"

SOURCE_SAVED=$(python3 -c "import json; print(json.load(open('/tmp/qa-gr.json')).get('lead',{}).get('source',''))")
[[ "$SOURCE_SAVED" == "$SOURCE" ]] && pass "lead.source correct" || fail "lead.source=$SOURCE_SAVED"

# 6. Duplicate update
code=$(curl -s -o /tmp/qa-gr2.json -w "%{http_code}" -X POST "$API/api/orgs/german-roz/bus/main/ingest" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"QA Updated\",
    \"email\": \"$EMAIL\",
    \"phone\": \"+51911111111\",
    \"source\": \"$SOURCE\"
  }")
[[ "$code" == "201" ]] && pass "duplicate email → 201 update" || fail "duplicate expected 201 got $code"

MSG=$(python3 -c "import json; print(json.load(open('/tmp/qa-gr2.json')).get('message',''))")
[[ "$MSG" == *"updated"* ]] && pass "message indicates update" || echo "WARN: message=$MSG"

# 7. Fetch lead
code=$(curl -s -o /tmp/qa_gr_lead.json -w "%{http_code}" "$API/api/leads/$LEAD_ID")
[[ "$code" == "200" ]] && pass "GET /api/leads/:id → 200" || fail "GET lead expected 200 got $code"

echo ""
echo "All German Roz webinar ingestion checks passed."
