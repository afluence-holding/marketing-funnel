#!/usr/bin/env bash
# Deep QA for the generic multi-tenant WhatsApp group rotation module.
# Uses an isolated throwaway pool (qa-rotation-test) on german-roz/main so it
# never touches the real webinar pool. Cleans up at the end.
#
# Usage: API_BASE=http://localhost:3100 WEB_BASE=http://localhost:3101 \
#        bash scripts/qa-whatsapp-group-rotation-deep.sh

set -uo pipefail

API_BASE="${API_BASE:-http://localhost:3100}"
WEB_BASE="${WEB_BASE:-http://localhost:3101}"
ORG="german-roz"; BU="main"; POOL="qa-rotation-test"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

PASS=0; FAIL=0
ok(){ echo "  PASS: $1"; PASS=$((PASS+1)); }
ko(){ echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
hr(){ echo; echo "── $1 ──"; }

DATABASE_URL="$(grep -m1 '^DATABASE_URL=' "$ROOT/.env" | cut -d= -f2- | tr -d '"')"
if [ -z "$DATABASE_URL" ]; then echo "FATAL: DATABASE_URL not found in .env"; exit 1; fi
# libpq (psql) rejects the pgbouncer=true query param the node pg driver tolerates.
PSQL_URL="${DATABASE_URL%%\?*}?sslmode=require"
PSQL(){ psql "$PSQL_URL" -X -v ON_ERROR_STOP=1 -tA -c "$1"; }

cleanup(){
  PSQL "DELETE FROM marketing.whatsapp_group_pools WHERE org_key='$ORG' AND bu_key='$BU' AND pool_key='$POOL';" >/dev/null 2>&1
}
trap cleanup EXIT

# ── 0. Static wiring ────────────────────────────────────────────────────────
hr "Static wiring"
test -f "$ROOT/packages/db/src/migrations/20260610000000_whatsapp_group_rotation.sql" && ok "migration exists" || ko "migration missing"
test -f "$ROOT/apps/api/src/core/bootstrap/ensure-whatsapp-group-tables.ts" && ok "ensure bootstrap exists" || ko "ensure bootstrap missing"
test -f "$ROOT/apps/api/src/core/services/whatsapp-group-rotation.service.ts" && ok "service exists" || ko "service missing"
test -f "$ROOT/apps/api/src/core/routes/whatsapp-groups.routes.ts" && ok "routes exist" || ko "routes missing"
test -f "$ROOT/apps/api/src/orgs/german-roz/main/whatsapp-groups.ts" && ok "org config exists" || ko "org config missing"
test -f "$ROOT/apps/web/src/app/api/whatsapp-group/[orgKey]/[buKey]/assign/route.ts" && ok "web proxy exists" || ko "web proxy missing"
grep -q "whatsappGroupsRoutes" "$ROOT/apps/api/src/index.ts" && ok "routes registered in index.ts" || ko "routes not registered"
grep -q "whatsapp_group_joined" "$ROOT/apps/api/src/core/types/index.ts" && ok "event type added" || ko "event type missing"
grep -q "whatsappGroupPoolRegistry" "$ROOT/apps/api/src/orgs/index.ts" && ok "pool registry exported" || ko "pool registry missing"
grep -q "WA_ASSIGN_PATH" "$ROOT/apps/web/src/app/(landings)/german-roz/webinar/landing.html" && ok "landing calls assign" || ko "landing missing assign"

# ── 1. Seed isolated test pool (capacity 2, auto_count) ──────────────────────
hr "Setup isolated pool"
PSQL "INSERT INTO marketing.whatsapp_group_pools (org_key,bu_key,pool_key,capacity,rotation_mode)
      VALUES ('$ORG','$BU','$POOL',2,'auto_count')
      ON CONFLICT (org_key,bu_key,pool_key) DO UPDATE SET capacity=2,rotation_mode='auto_count';" >/dev/null \
  && ok "test pool created" || ko "test pool create failed"

addgrp(){ # label url position
  curl -s -X POST "$API_BASE/api/orgs/$ORG/bus/$BU/whatsapp-group/groups" \
    -H 'Content-Type: application/json' \
    -d "{\"poolKey\":\"$POOL\",\"label\":\"$1\",\"inviteUrl\":\"$2\",\"position\":$3}"; }
G1=$(addgrp "QA G1" "https://chat.whatsapp.com/QATEST1" 1)
G2=$(addgrp "QA G2" "https://chat.whatsapp.com/QATEST2" 2)
echo "$G1" | grep -q '"ok":true' && ok "group 1 added" || ko "group 1 add: $G1"
echo "$G2" | grep -q '"ok":true' && ok "group 2 added" || ko "group 2 add: $G2"

assign(){ # phone
  curl -s -X POST "$API_BASE/api/orgs/$ORG/bus/$BU/whatsapp-group/assign" \
    -H 'Content-Type: application/json' \
    -d "{\"poolKey\":\"$POOL\",\"phone\":\"$1\"}"; }

# ── 2. Rotation logic ────────────────────────────────────────────────────────
hr "Rotation (auto_count, capacity 2)"
A=$(assign "+51900000001")
echo "$A" | grep -q 'QATEST1' && ok "phone A → group 1" || ko "A: $A"

B=$(assign "+51900000002")
echo "$B" | grep -q 'QATEST1' && ok "phone B → group 1 (fills it)" || ko "B: $B"

C=$(assign "+51900000003")
echo "$C" | grep -q 'QATEST2' && ok "phone C → group 2 (rotated)" || ko "C: $C"

A2=$(assign "+51900000001")
echo "$A2" | grep -q 'QATEST1' && echo "$A2" | grep -q '"reused":true' && ok "phone A re-assign idempotent → group 1 reused" || ko "A2: $A2"

# ── 3. Pool state ────────────────────────────────────────────────────────────
hr "Pool state"
ST=$(curl -s "$API_BASE/api/orgs/$ORG/bus/$BU/whatsapp-group/state?poolKey=$POOL")
echo "$ST" | grep -q '"is_full":true' && ok "group 1 marked full at capacity" || ko "state full flag: $ST"
echo "$ST" | grep -q 'QATEST2' && ok "state lists group 2" || ko "state groups: $ST"

# ── 4. Manual lever + exhaustion fallback ────────────────────────────────────
hr "Manual lever + exhaustion"
GID2=$(PSQL "SELECT g.id FROM marketing.whatsapp_groups g JOIN marketing.whatsapp_group_pools p ON p.id=g.pool_id WHERE p.pool_key='$POOL' AND g.position=2;")
MF=$(curl -s -X POST "$API_BASE/api/orgs/$ORG/bus/$BU/whatsapp-group/groups/$GID2/full" -H 'Content-Type: application/json' -d '{"isFull":true}')
echo "$MF" | grep -q '"is_full":true' && ok "manual mark-full works" || ko "mark-full: $MF"
EX=$(assign "+51900000004")
echo "$EX" | grep -q '"poolExhausted":true' && ok "exhausted pool returns fallback link + flag" || ko "exhaustion: $EX"

# ── 5. Validation / error paths ──────────────────────────────────────────────
hr "Validation"
V1=$(curl -s -X POST "$API_BASE/api/orgs/$ORG/bus/$BU/whatsapp-group/assign" -H 'Content-Type: application/json' -d '{}')
echo "$V1" | grep -qi 'Validation failed' && ok "missing poolKey → 400 validation" || ko "V1: $V1"
V2=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API_BASE/api/orgs/nope/bus/nope/whatsapp-group/assign" -H 'Content-Type: application/json' -d "{\"poolKey\":\"$POOL\"}")
[ "$V2" = "404" ] && ok "unknown org/bu → 404" || ko "unknown org code=$V2"
V3=$(curl -s -X POST "$API_BASE/api/orgs/$ORG/bus/$BU/whatsapp-group/assign" -H 'Content-Type: application/json' -d '{"poolKey":"does-not-exist"}')
echo "$V3" | grep -q 'pool_not_found' && ok "unknown pool → pool_not_found" || ko "V3: $V3"

# ── 6. Same-origin web proxy ─────────────────────────────────────────────────
hr "Web proxy (same-origin)"
P=$(curl -s -X POST "$WEB_BASE/api/whatsapp-group/$ORG/$BU/assign" -H 'Content-Type: application/json' -d "{\"poolKey\":\"$POOL\",\"phone\":\"+51900000005\"}")
echo "$P" | grep -q 'QATEST' && ok "web proxy forwards to API and returns link" || ko "proxy: $P"

echo; echo "════════════════════════════════════"
echo "PASS=$PASS  FAIL=$FAIL"
[ "$FAIL" -eq 0 ] && echo "ALL GREEN" || echo "HAS FAILURES"
exit 0
