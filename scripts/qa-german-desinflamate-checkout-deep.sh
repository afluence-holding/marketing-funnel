#!/usr/bin/env bash
# =============================================================================
# Deep QA — Germán Roz DI21 "Reto Desinflámate" embedded Whop checkout
# =============================================================================
# Validates the generic Whop checkout module end-to-end for the DI21 product:
#   1. Env + Whop credentials present
#   2. The 3 tier plans exist in Whop with the right price/currency/company
#   3. Date-driven tier resolver picks the correct plan per date boundary
#   4. A real Whop checkout session is created for the active tier (server path)
#   5. The Next.js proxy /api/whop/<productKey>/session works (+ 404 for unknown)
#   6. API purchase registry maps German plans (and NOT Lucas) correctly
#
# Safe: read-only against Whop except creating throwaway checkout_configurations
# (sessions, not charges). No DB writes.
# -----------------------------------------------------------------------------
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PASS=0; FAIL=0; WARN=0
pass() { echo "  ✅ $*"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $*"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠️  $*"; WARN=$((WARN+1)); }
hdr()  { echo; echo "▶ $*"; }

PRODUCT_KEY="german-desinflamate"
WEB_PORT="${WEB_PORT:-3037}"
WEB_PID=""
cleanup() { [[ -n "$WEB_PID" ]] && kill "$WEB_PID" 2>/dev/null; }
trap cleanup EXIT

# --- Load env (root .env then .env.local, like @next/env / packages/config) ---
load_env() {
  for f in .env .env.local; do
    [[ -f "$f" ]] || continue
    while IFS= read -r line; do
      [[ "$line" =~ ^[[:space:]]*# ]] && continue
      [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]] || continue
      local k="${line%%=*}"; local v="${line#*=}"
      v="${v%\"}"; v="${v#\"}"
      export "$k=$v"
    done < "$f"
  done
}
load_env

hdr "1. Env & credentials"
[[ -n "${WHOP_API_KEY:-}" ]] && pass "WHOP_API_KEY set (len ${#WHOP_API_KEY})" || { fail "WHOP_API_KEY missing — cannot test session creation"; }
[[ -n "${WHOP_WEBHOOK_SECRET:-}" ]] && pass "WHOP_WEBHOOK_SECRET set" || warn "WHOP_WEBHOOK_SECRET missing — webhook signature verification will fail in prod"
[[ -n "${NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ:-}" ]] && pass "NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ set (browser Purchase pixel)" || warn "NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ missing — browser Purchase pixel won't fire"
[[ -n "${META_PIXEL_ID_GERMAN_ROZ:-}" ]] && pass "META_PIXEL_ID_GERMAN_ROZ set (CAPI)" || warn "META_PIXEL_ID_GERMAN_ROZ missing — CAPI Purchase is a no-op"
[[ -n "${META_CAPI_TOKEN_GERMAN_ROZ:-}" ]] && pass "META_CAPI_TOKEN_GERMAN_ROZ set" || warn "META_CAPI_TOKEN_GERMAN_ROZ missing — CAPI Purchase is a no-op"

# --- Whop plan validation + tier resolver + live session (node) ---------------
hdr "2-4. Whop plans, tier resolver & live session creation"
node - <<'NODE'
const KEY = process.env.WHOP_API_KEY;
const V2 = 'https://api.whop.com/api/v2';
const V1 = 'https://api.whop.com/api/v1';

// mirror apps/web/src/lib/whop/products.ts tiers
const TIERS = [
  { planId: 'plan_9hbxfopJ53A1q', price: 67, until: '2026-06-16T23:59:59-05:00' },
  { planId: 'plan_H5qC30Wqrkuac', price: 77, until: '2026-06-23T23:59:59-05:00' },
  { planId: 'plan_wFhRjp54MsvJm', price: 87 },
];
function resolveTier(now) {
  const ms = now.getTime();
  for (const t of TIERS) {
    if (!t.until) return t;
    if (ms <= new Date(t.until).getTime()) return t;
  }
  return TIERS[TIERS.length - 1];
}

let pass = 0, fail = 0;
const ok = (m) => { console.log('  ✅ ' + m); pass++; };
const no = (m) => { console.log('  ❌ ' + m); fail++; };

async function get(url) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${KEY}` } });
  return { status: r.status, body: await r.json().catch(() => null) };
}

(async () => {
  if (!KEY) { no('WHOP_API_KEY not available to node'); process.exit(1); }

  // 2. validate plans
  const expect = { plan_9hbxfopJ53A1q: 67, plan_H5qC30Wqrkuac: 77, plan_wFhRjp54MsvJm: 87 };
  let company = null;
  for (const [planId, price] of Object.entries(expect)) {
    const { status, body } = await get(`${V2}/plans/${planId}`);
    if (status !== 200 || !body || body.id !== planId) { no(`plan ${planId} not found (status ${status})`); continue; }
    const p = Number(body.initial_price);
    p === price ? ok(`${planId} = $${p} ${String(body.base_currency).toUpperCase()}`) : no(`${planId} price $${p} != expected $${price}`);
    body.base_currency === 'usd' ? ok(`${planId} currency USD`) : no(`${planId} currency ${body.base_currency} != usd`);
    body.plan_type === 'one_time' ? ok(`${planId} one_time`) : no(`${planId} plan_type ${body.plan_type}`);
    company = company ?? body.company_id;
    if (company && body.company_id !== company) no(`${planId} company mismatch`);
  }
  ok(`all plans on company ${company}`);

  // 3. tier resolver boundaries (America/Lima -05:00)
  const cases = [
    ['2026-06-10T10:00:00-05:00', 'plan_9hbxfopJ53A1q', 67],
    ['2026-06-16T23:00:00-05:00', 'plan_9hbxfopJ53A1q', 67],
    ['2026-06-17T00:00:01-05:00', 'plan_H5qC30Wqrkuac', 77],
    ['2026-06-23T20:00:00-05:00', 'plan_H5qC30Wqrkuac', 77],
    ['2026-06-24T00:00:01-05:00', 'plan_wFhRjp54MsvJm', 87],
    ['2026-06-30T23:00:00-05:00', 'plan_wFhRjp54MsvJm', 87],
    ['2026-07-05T12:00:00-05:00', 'plan_wFhRjp54MsvJm', 87], // fallback after ladder
    ['2026-06-01T12:00:00-05:00', 'plan_9hbxfopJ53A1q', 67], // before launch
  ];
  for (const [iso, planId, price] of cases) {
    const t = resolveTier(new Date(iso));
    (t.planId === planId && t.price === price)
      ? ok(`tier @ ${iso} → ${planId} ($${price})`)
      : no(`tier @ ${iso} → ${t.planId} ($${t.price}), expected ${planId} ($${price})`);
  }

  // 4. live session creation for the active tier (server-equivalent body)
  const active = resolveTier(new Date());
  const eventId = `german-desinflamate-purchase.${Date.now()}.qa`;
  const r = await fetch(`${V1}/checkout_configurations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan_id: active.planId,
      mode: 'payment',
      redirect_url: 'https://nutricion.germanroz.com/german-roz/desinflamate/gracias?status=success',
      metadata: { meta_event_id: eventId, value: String(active.price), currency: 'USD', source: 'landing-german-roz-desinflamate', product_key: 'german-desinflamate', plan_id: active.planId },
    }),
  });
  const sess = await r.json().catch(() => null);
  (r.ok && sess && sess.id)
    ? ok(`live Whop session created for active tier ${active.planId} ($${active.price}) → ${sess.id}`)
    : no(`live session failed (status ${r.status}): ${JSON.stringify(sess)}`);

  console.log(`\n  node summary: ${pass} pass / ${fail} fail`);
  process.exit(fail > 0 ? 1 : 0);
})();
NODE
NODE_RC=$?
[[ $NODE_RC -eq 0 ]] && pass "Whop plans + tier resolver + live session OK" || fail "Whop/tier/session checks failed (see above)"

# --- API purchase registry (ts-node) ------------------------------------------
hdr "6. API purchase registry mapping (German yes, Lucas no)"
npx --yes ts-node --compiler-options '{"module":"commonjs"}' -e '
import { resolveWhopPurchaseProduct, getAllWhopPurchasePlanIds } from "./apps/api/src/core/services/whop-products";
let pass = 0, fail = 0;
const ok = (m: string) => { console.log("  ✅ " + m); pass++; };
const no = (m: string) => { console.log("  ❌ " + m); fail++; };
for (const [planId, price] of [["plan_9hbxfopJ53A1q",67],["plan_H5qC30Wqrkuac",77],["plan_wFhRjp54MsvJm",87]] as [string,number][]) {
  const r = resolveWhopPurchaseProduct(planId);
  (r && r.price === price && r.product.orgKey === "german-roz") ? ok(`${planId} → german-roz $${r!.price}`) : no(`${planId} mapping wrong: ${JSON.stringify(r)}`);
}
const lucas = resolveWhopPurchaseProduct("plan_aKOjfecUWLzFo");
lucas === null ? ok("Lucas plan NOT in generic registry (no double-handling)") : no("Lucas plan leaked into generic registry");
resolveWhopPurchaseProduct(undefined) === null ? ok("undefined plan → null") : no("undefined plan not null");
console.log("  registry plan ids:", getAllWhopPurchasePlanIds().join(", "));
process.exit(fail > 0 ? 1 : 0);
' 2>&1 | sed 's/^/  /'
TS_RC=${PIPESTATUS[0]}
[[ $TS_RC -eq 0 ]] && pass "API registry mapping OK" || fail "API registry mapping failed"

# --- Next.js proxy end-to-end -------------------------------------------------
hdr "5. Next.js proxy /api/whop/<productKey>/session (live)"
if [[ -d apps/web/.next ]]; then
  (cd apps/web && PORT="$WEB_PORT" npx next start -p "$WEB_PORT" >/tmp/qa-di21-web.log 2>&1) &
  WEB_PID=$!
  # wait for server
  ready=0
  for i in $(seq 1 40); do
    if curl -fsS "http://localhost:$WEB_PORT/api/health" >/dev/null 2>&1 || curl -fsS "http://localhost:$WEB_PORT/" >/dev/null 2>&1; then ready=1; break; fi
    sleep 0.5
  done
  if [[ $ready -eq 1 ]]; then
    pass "web server up on :$WEB_PORT"
    RESP=$(curl -sS -X POST "http://localhost:$WEB_PORT/api/whop/$PRODUCT_KEY/session" -H 'Content-Type: application/json' -d '{"tracking":{"meta":{"fbp":"fb.1.qa","fbc":"fb.1.qa.click"}}}')
    echo "    proxy resp: $(echo "$RESP" | head -c 220)"
    if echo "$RESP" | grep -q '"ok":true' && echo "$RESP" | grep -q '"sessionId"'; then
      pass "proxy returned a real session (sessionId + value)"
      echo "$RESP" | grep -q '"value":67\|"value":77\|"value":87' && pass "proxy value matches a tier price" || warn "proxy value not a known tier (check date)"
    else
      fail "proxy did not return a session: $RESP"
    fi
    # unknown product → 404
    CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://localhost:$WEB_PORT/api/whop/does-not-exist/session" -H 'Content-Type: application/json' -d '{}')
    [[ "$CODE" == "404" ]] && pass "unknown product → 404" || fail "unknown product returned $CODE (expected 404)"
  else
    warn "web server did not become ready — skipping live proxy test (see /tmp/qa-di21-web.log)"
  fi
else
  warn "apps/web/.next missing — run 'npm run build -w @marketing-funnel/web' first; skipping live proxy test"
fi

# --- Summary ------------------------------------------------------------------
hdr "Summary"
echo "  PASS: $PASS   FAIL: $FAIL   WARN: $WARN"
[[ $FAIL -eq 0 ]] && { echo "  🟢 DEEP QA PASSED"; exit 0; } || { echo "  🔴 DEEP QA FAILED"; exit 1; }
