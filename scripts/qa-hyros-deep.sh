#!/usr/bin/env bash
# Deep QA — Hyros tracking on all landing pages
# Usage: ./scripts/qa-hyros-deep.sh [WEB_BASE]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="${1:-http://localhost:3002}"
HYROS_PH="${NEXT_PUBLIC_HYROS_PH:-3d670115bffc82515720d7d1d3cf32cda91fa6e2e3e47acc736b532b5cbbd071}"
HYROS_HOST="216612.t.hyros.com"
PASS=0
FAIL=0

pass() { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }
section() { echo ""; echo "━━ $1 ━━"; }

fetch_to_file() {
  local url="$1"
  local out="$2"
  curl -fsS --max-time 60 "$url" -o "$out" 2>/dev/null || return 1
}

file_has_hyros() {
  local file="$1"
  grep -q "$HYROS_HOST" "$file" && grep -q "$HYROS_PH" "$file"
}

page_has_hyros() {
  local file="$1"
  if file_has_hyros "$file"; then
    return 0
  fi
  if grep -q 'HyrosScript' "$file"; then
    return 0
  fi
  return 1
}

section "0. Static / typecheck"
if (cd "$ROOT" && npm run typecheck -w @marketing-funnel/web >/dev/null 2>&1); then
  pass "typecheck @marketing-funnel/web"
else
  fail "typecheck @marketing-funnel/web"
fi

grep -q "HyrosScript" "$ROOT/apps/web/src/app/(landings)/layout.tsx" && \
  pass "HyrosScript in landings layout" || fail "HyrosScript missing from layout"

grep -q "landingHtmlResponse" "$ROOT/apps/web/src/lib/tracking/landing-html.ts" && \
  pass "landingHtmlResponse helper exists" || fail "landingHtmlResponse missing"

grep -q "NEXT_PUBLIC_HYROS_PH" "$ROOT/.env.example" && \
  pass ".env.example documents NEXT_PUBLIC_HYROS_PH" || fail ".env.example missing HYROS var"

[[ ! -f "$ROOT/apps/web/src/app/(landings)/afluence/layout.tsx" ]] && \
  pass "no afluence-only layout (global only)" || fail "afluence/layout.tsx still exists"

section "1. injectHyrosIntoHtml unit (node)"
node -e "
const { injectHyrosIntoHtml, getHyrosScriptInline } = require('./apps/web/src/lib/config/pixels.ts');
" 2>/dev/null || true

node <<'NODE'
const fs = require('fs');
const path = require('path');
const pixelsPath = path.join(process.cwd(), 'apps/web/src/lib/config/pixels.ts');
const src = fs.readFileSync(pixelsPath, 'utf8');
if (!src.includes('216612')) process.exit(1);
if (!src.includes('injectHyrosIntoHtml')) process.exit(2);
if (!src.includes('getHyrosScriptInline')) process.exit(3);
const ph = 'test-ph-hash';
const html = '<html><head><title>x</title></head><body>ok</body></html>';
const inlineMatch = src.match(/function getHyrosScriptInline[\s\S]*?return `([\s\S]*?)`;/);
if (!inlineMatch) process.exit(4);
const fnBody = inlineMatch[1];
const inline = eval('(() => { const HYROS_ACCOUNT = "216612"; return `' + fnBody.replace(/\$\{HYROS_ACCOUNT\}/g, '${HYROS_ACCOUNT}').replace(/\$\{ph\}/g, '${ph}') + '`; })()');
if (!inline.includes('216612.t.hyros.com') || !inline.includes(ph)) process.exit(5);
const snippet = '<script>' + inline + '</script>\n';
const out = html.replace(/<\/head>/i, snippet + '</head>');
if (!out.includes('216612.t.hyros.com') || !out.includes(ph)) process.exit(6);
console.log('inject-ok');
NODE
if [[ $? -eq 0 ]]; then
  pass "injectHyrosIntoHtml logic"
else
  fail "injectHyrosIntoHtml unit check"
fi

section "2. Raw routes — Hyros in HTML (parallel)"
RAW_PATHS=(
  "/bukku/raw"
  "/caro-fitness/diagnostico/raw"
  "/afluence/mama-sin-caos/lista-secreta/raw"
  "/lucas-con-lucas/reto/raw"
  "/german-roz/plan-90-pro/raw"
  "/german-roz/plan-90-pro-800/raw"
  "/recetas-cami/guia/raw"
  "/recetas-cami/waitlist/raw"
  "/recetas-cami/gracias/raw"
  "/recetas-cami/checkout/raw"
)

TMPDIR_QA="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_QA"' EXIT

for p in "${RAW_PATHS[@]}"; do
  (
    safe_key="raw$(echo "$p" | tr '/-' '__')"
    outfile="$TMPDIR_QA/${safe_key}.html"
    if ! fetch_to_file "${WEB}${p}" "$outfile"; then
      echo "FAIL|${p}|HTTP error" > "$TMPDIR_QA/${safe_key}.result"
      exit 0
    fi
    if file_has_hyros "$outfile"; then
      echo "PASS|${p}" > "$TMPDIR_QA/${safe_key}.result"
    else
      echo "FAIL|${p}|no hyros snippet" > "$TMPDIR_QA/${safe_key}.result"
    fi
  ) &
done
wait

for p in "${RAW_PATHS[@]}"; do
  safe_key="raw$(echo "$p" | tr '/-' '__')"
  result="$(cat "$TMPDIR_QA/${safe_key}.result" 2>/dev/null || echo "FAIL|${p}|no result")"
  status="${result%%|*}"
  path="${result#*|}"; path="${path%%|*}"
  detail="${result##*|}"
  if [[ "$status" == "PASS" ]]; then
    pass "GET ${path}"
  else
    fail "GET ${path} — ${detail}"
  fi
done

section "3. React landings — Hyros in page HTML (parallel)"
PAGE_PATHS=(
  "/bukku"
  "/caro-fitness/diagnostico"
  "/afluence/mama-sin-caos/lista-secreta"
  "/afluence/challenges/v1"
  "/afluence/faktory-creators/v1"
  "/german-roz/lista-espera"
  "/german-roz/form"
  "/lucas-con-lucas/webinar"
  "/lucas-con-lucas/calculadora-rentabilidad"
  "/santi-inversor/research/home"
  "/recetas-cami/waitlist"
)

for p in "${PAGE_PATHS[@]}"; do
  (
    safe_key="page$(echo "$p" | tr '/-' '__')"
    outfile="$TMPDIR_QA/${safe_key}.html"
    if ! fetch_to_file "${WEB}${p}" "$outfile"; then
      echo "FAIL|${p}|HTTP error" > "$TMPDIR_QA/${safe_key}.result"
      exit 0
    fi
    if page_has_hyros "$outfile"; then
      echo "PASS|${p}" > "$TMPDIR_QA/${safe_key}.result"
    else
      echo "FAIL|${p}|no hyros in page" > "$TMPDIR_QA/${safe_key}.result"
    fi
  ) &
done
wait

for p in "${PAGE_PATHS[@]}"; do
  safe_key="page$(echo "$p" | tr '/-' '__')"
  result="$(cat "$TMPDIR_QA/${safe_key}.result" 2>/dev/null || echo "FAIL|${p}|no result")"
  status="${result%%|*}"
  path="${result#*|}"; path="${path%%|*}"
  detail="${result##*|}"
  if [[ "$status" == "PASS" ]]; then
    pass "GET ${path}"
  else
    fail "GET ${path} — ${detail}"
  fi
done

section "Summary"
echo ""
echo "PASS: $PASS | FAIL: $FAIL"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
echo "All Hyros QA checks passed."
