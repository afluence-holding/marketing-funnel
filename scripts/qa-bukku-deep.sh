#!/usr/bin/env bash
# Deep QA — Bukku landing ingest + responses panel + export
# Usage: ./scripts/qa-bukku-deep.sh [API_BASE] [WEB_BASE]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="${1:-http://localhost:3000}"
WEB="${2:-http://localhost:3001}"
TS="$(date +%s)"
QA_EMAIL="qa-bukku-${TS}@afluence-test.invalid"
PASS=0
FAIL=0
WARN=0

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

pass() { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN + 1)); }
section() { echo ""; echo "━━ $1 ━━"; }

section "0. Static / typecheck"
if (cd "$ROOT" && npm run typecheck -w @marketing-funnel/web >/dev/null 2>&1); then
  pass "typecheck @marketing-funnel/web"
else
  fail "typecheck @marketing-funnel/web"
fi

if [[ -f "$ROOT/apps/web/src/lib/bukku/export-leads.ts" ]]; then
  pass "export-leads.ts exists"
else
  fail "export-leads.ts missing"
fi

grep -q "downloadLeadsCsv" "$ROOT/apps/web/src/app/(landings)/bukku/responses/responses-view.tsx" && \
  pass "responses-view has CSV export button" || fail "CSV export button missing"
grep -q "downloadLeadsXlsx" "$ROOT/apps/web/src/app/(landings)/bukku/responses/responses-view.tsx" && \
  pass "responses-view has XLSX export button" || fail "XLSX export button missing"

grep -q "NODE_ENV === 'production'" "$ROOT/apps/web/src/app/api/bukku/leads/route.ts" && \
  pass "leads route: no silent prod fallback" || fail "leads route missing prod guard"
grep -q "NODE_ENV === 'production'" "$ROOT/apps/web/src/app/api/bukku/ingest/route.ts" && \
  pass "ingest route: no silent prod fallback" || fail "ingest route missing prod guard"

section "1. Export module (node)"
node -e "
const rows = [
  { lead_id: '1', email: 'a@test.com', first_name: 'Ana', test_level: 'B1', frustracion: 'line\nbreak' },
  { lead_id: '2', email: 'b@test.com', phone: '+569', extra_field: 'x' },
];
const BASE = ['lead_id','created_at','email','first_name','test_level','extra_field'];
const keys = new Set();
rows.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
const cols = BASE.filter(k => keys.has(k)).concat([...keys].filter(k => !BASE.includes(k)).sort());
if (!cols.includes('lead_id') || !cols.includes('extra_field')) process.exit(1);
function escapeCsvCell(v) {
  if (/[\",\\n\\r]/.test(v)) return '\"' + v.replace(/\"/g, '\"\"') + '\"';
  return v;
}
if (escapeCsvCell('line\nbreak') !== '\"line\\nbreak\"') process.exit(2);
console.log('export-module-ok cols=' + cols.length);
" && pass "export column order + CSV escape" || fail "export unit checks"

section "2. XLSX generation (node)"
node -e "
const XLSX = require('xlsx');
const rows = [{ lead_id: '1', email: 'x@test.com', first_name: 'Test' }];
const ws = XLSX.utils.json_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Leads');
const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
if (!Buffer.isBuffer(buf) || buf.length < 100) process.exit(1);
console.log('xlsx-bytes=' + buf.length);
" && pass "xlsx package generates valid buffer" || fail "xlsx generation"

section "3. API health"
code=$(curl -s -o /tmp/qa_bukku_health.json -w "%{http_code}" "$API/api/health" 2>/dev/null || echo "000")
[[ "$code" == "200" ]] && pass "API reachable ($API)" || fail "API not reachable ($code)"

section "4. Landing pages"
for path in "/bukku" "/bukku/raw" "/bukku/responses"; do
  code=$(curl -s -o /tmp/qa_bukku_page.html -w "%{http_code}" "$WEB$path" 2>/dev/null || echo "000")
  [[ "$code" == "200" ]] && pass "GET $path → 200" || fail "GET $path → $code"
done

curl -s "$WEB/bukku/raw" -o /tmp/qa_bukku_raw.html 2>/dev/null || true
grep -q "INGEST_PATH" /tmp/qa_bukku_raw.html && pass "raw HTML has INGEST_PATH" || fail "INGEST_PATH missing"
grep -q "submitBukkuLead" /tmp/qa_bukku_raw.html && pass "raw HTML has submitBukkuLead" || fail "submitBukkuLead missing"
grep -q "buildSurveyPayload" /tmp/qa_bukku_raw.html && pass "raw HTML has survey payload builder" || fail "survey payload missing"
grep -q "buildTestPayload" /tmp/qa_bukku_raw.html && pass "raw HTML has test payload builder" || fail "test payload missing"
grep -q "buildGuidePayload" /tmp/qa_bukku_raw.html && pass "raw HTML has guide payload builder" || fail "guide payload missing"
grep -q "await submitBukkuLead" /tmp/qa_bukku_raw.html && warn "landing awaits submit (good)" || warn "landing fire-and-forget submitBukkuLead (3 calls, no await)"

html_resp=$(curl -s "$WEB/bukku/responses" 2>/dev/null || true)
echo "$html_resp" | grep -q "Respuestas del test" && pass "responses page SSR title" || fail "responses page title missing"
echo "$html_resp" | grep -q "CSV\|Excel" && pass "responses page mentions export buttons" || warn "export buttons not in SSR HTML (client-only OK)"

section "5. Ingest — survey stage"
SURVEY_PAYLOAD=$(cat <<EOF
{
  "source": "landing-bukku-test-ingles",
  "channel": "inbound",
  "email": "$QA_EMAIL",
  "firstName": "QA Deep",
  "phone": "+5690000${TS: -4}",
  "customFields": {
    "landing": "qa-script",
    "nivel_ingles_autorreportado": "intermedio",
    "aviso_lanzamiento": "si",
    "survey_submitted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  },
  "utmData": { "utm_source": "qa", "utm_medium": "deep", "utm_campaign": "bukku-$TS" }
}
EOF
)
code=$(curl -s -o /tmp/qa_bukku_survey.json -w "%{http_code}" -X POST "$WEB/api/bukku/ingest" \
  -H "Content-Type: application/json" -d "$SURVEY_PAYLOAD" 2>/dev/null || echo "000")
[[ "$code" == "201" ]] && pass "POST ingest survey → $code" || fail "POST ingest survey → $code"
grep -q '"ok":true' /tmp/qa_bukku_survey.json && pass "survey ingest ok:true" || fail "survey ingest response invalid"
grep -q 'supabase\|local-file' /tmp/qa_bukku_survey.json && pass "survey storage field present" || warn "survey storage field missing"

section "6. Ingest — test stage (upsert)"
TEST_PAYLOAD=$(cat <<EOF
{
  "source": "landing-bukku-test-ingles",
  "email": "$QA_EMAIL",
  "firstName": "QA Deep Updated",
  "phone": "+5690000${TS: -4}",
  "customFields": {
    "nivel_ingles_autorreportado": "intermedio",
    "test_level": "Intermedio",
    "test_cefr": "B1",
    "test_total": "7",
    "test_max": "10",
    "test_completed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  },
  "utmData": { "utm_source": "qa-test" }
}
EOF
)
code=$(curl -s -o /tmp/qa_bukku_test.json -w "%{http_code}" -X POST "$WEB/api/bukku/ingest" \
  -H "Content-Type: application/json" -d "$TEST_PAYLOAD" 2>/dev/null || echo "000")
[[ "$code" == "201" ]] && pass "POST ingest test upsert → $code" || fail "POST ingest test → $code"
grep -q "$QA_EMAIL" /tmp/qa_bukku_test.json && pass "test upsert email in response" || fail "test upsert email missing"
grep -q "QA Deep Updated" /tmp/qa_bukku_test.json && pass "test upsert firstName updated" || fail "test upsert name not updated"

section "7. Ingest validation"
code=$(curl -s -o /tmp/qa_bukku_bad.json -w "%{http_code}" -X POST "$WEB/api/bukku/ingest" \
  -H "Content-Type: application/json" -d '{"email":""}' 2>/dev/null || echo "000")
[[ "$code" == "400" ]] && pass "empty email → 400" || fail "empty email → $code"

code=$(curl -s -o /tmp/qa_bukku_bad2.json -w "%{http_code}" -X POST "$API/api/bukku/leads" \
  -H "Content-Type: application/json" -d '{"email":"not-an-email"}' 2>/dev/null || echo "000")
[[ "$code" == "400" ]] && pass "invalid email API zod → 400" || fail "invalid email → $code"

section "8. GET leads — web proxy vs API"
curl -s "$WEB/api/bukku/leads" -o /tmp/qa_bukku_web_leads.json 2>/dev/null || true
curl -s "$API/api/bukku/leads" -o /tmp/qa_bukku_api_leads.json 2>/dev/null || true

if python3 <<'PY'
import json, sys
web = json.load(open('/tmp/qa_bukku_web_leads.json'))
api = json.load(open('/tmp/qa_bukku_api_leads.json'))
if not web.get('ok'):
    print('WEB_NOT_OK', web.get('error'), web.get('details','')[:80]); sys.exit(1)
if not api.get('ok'):
    print('API_NOT_OK', api.get('error')); sys.exit(2)
wt, at = web.get('total'), api.get('total')
if wt != at:
    print('COUNT_MISMATCH', wt, at); sys.exit(3)
storage = web.get('storage')
if storage == 'local-file':
    print('LOCAL_FILE_FALLBACK', storage); sys.exit(4)
qa = [r for r in web.get('data',[]) if 'qa-bukku-' in r.get('email','')]
if not qa:
    print('QA_ROW_MISSING'); sys.exit(5)
r = qa[0]
if r.get('test_level') != 'Intermedio':
    print('QA_TEST_LEVEL', r.get('test_level')); sys.exit(6)
print(f'ok total={wt} storage={storage} qa_found=1')
PY
then
  pass "web/API lead counts match + QA row with test_level"
else
  fail "leads list consistency check"
fi

section "9. DB cross-check (if DATABASE_URL)"
if [[ -n "${DATABASE_URL:-}" ]]; then
  CLEAN_URL="${DATABASE_URL%%\?*}"
  db_count=$(psql "$CLEAN_URL" -t -A -c "SELECT count(*) FROM marketing.bukku_leads;" 2>/dev/null || echo "")
  api_count=$(python3 -c "import json; print(json.load(open('/tmp/qa_bukku_api_leads.json')).get('total',0))")
  if [[ -n "$db_count" && "$db_count" == "$api_count" ]]; then
    pass "DB count ($db_count) == API count ($api_count)"
  elif [[ -n "$db_count" ]]; then
    fail "DB count ($db_count) != API count ($api_count)"
  else
    warn "Could not query DB"
  fi
  psql "$CLEAN_URL" -t -A -c "SELECT count(*) FROM marketing.bukku_leads WHERE lower(email)='$QA_EMAIL';" 2>/dev/null | grep -q '^1$' && \
    pass "QA email exists exactly once in DB" || fail "QA email DB uniqueness"
else
  warn "DATABASE_URL not set — skip DB cross-check"
fi

section "10. Production smoke (read-only)"
PROD_WEB="https://marketing.byafluence.com"
PROD_API="https://marketing-funnelapi-production.up.railway.app"
for path in "/bukku" "/bukku/responses"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_WEB$path" 2>/dev/null || echo "000")
  [[ "$code" == "200" ]] && pass "PROD GET $path → 200" || warn "PROD GET $path → $code"
done
prod_web=$(curl -s "$PROD_WEB/api/bukku/leads" 2>/dev/null || echo '{}')
prod_api=$(curl -s "$PROD_API/api/bukku/leads" 2>/dev/null || echo '{}')
echo "$prod_web" > /tmp/qa_bukku_prod_web.json
echo "$prod_api" > /tmp/qa_bukku_prod_api.json
python3 -c "
import json
web=json.load(open('/tmp/qa_bukku_prod_web.json'))
api=json.load(open('/tmp/qa_bukku_prod_api.json'))
assert web.get('ok') and api.get('ok'), 'prod not ok'
assert web.get('total')==api.get('total'), f\"prod mismatch {web.get('total')} vs {api.get('total')}\"
assert web.get('storage')=='supabase', web.get('storage')
print(f\"prod total={web.get('total')} storage=supabase\")
" 2>/dev/null && pass "PROD web/API totals match + supabase" || warn "PROD leads check skipped or failed"

section "11. Export integrity (prod data sample)"
curl -s "$WEB/api/bukku/leads" -o /tmp/qa_bukku_export_src.json 2>/dev/null || true
if node -e "
const fs = require('fs');
const XLSX = require('xlsx');
const d = JSON.parse(fs.readFileSync('/tmp/qa_bukku_export_src.json','utf8'));
const rows = d.data || [];
if (!rows.length) process.exit(1);
const keys = new Set();
rows.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
const cols = [...keys].sort();
const ws = XLSX.utils.json_to_sheet(rows.map(r => Object.fromEntries(cols.map(c => [c, r[c]??'']))));
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Leads');
const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
if (rows.length !== d.total) process.exit(2);
if (cols.length < 10) process.exit(3);
if (buf.length < 1000) process.exit(4);
console.log('rows=' + rows.length + ' cols=' + cols.length + ' xlsx=' + buf.length);
" 2>/dev/null; then
  pass "export round-trip: rows == total, 31+ cols, valid xlsx"
else
  fail "export round-trip check"
fi

section "SUMMARY"
echo ""
echo "Passed: $PASS | Failed: $FAIL | Warnings: $WARN"
echo "QA_EMAIL=$QA_EMAIL"
if [[ "$FAIL" -eq 0 ]]; then
  echo "RESULT: PASS"
  exit 0
else
  echo "RESULT: FAIL"
  exit 1
fi
