#!/usr/bin/env bash
# Regenerate packages/db/src/types.ts from the live Supabase schema (marketing).
#
# Referenced by `npm run gen-types -w @marketing-funnel/api`. This file was
# missing from the repo for a while — restored 2026-06-10.
#
# Uses the Supabase API path (SUPABASE_ACCESS_TOKEN + project ref derived from
# SUPABASE_URL) so it works WITHOUT Docker. Run after any schema migration.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT="$ROOT/packages/db/src/types.ts"

# Load env from monorepo root (.env then .env.local overrides).
for f in "$ROOT/.env" "$ROOT/.env.local"; do
  if [ -f "$f" ]; then
    set -a; source "$f"; set +a
  fi
done

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "gen-types: SUPABASE_URL and SUPABASE_ACCESS_TOKEN are required (root .env)" >&2
  exit 1
fi

PROJECT_REF="$(echo "$SUPABASE_URL" | sed -E 's|https?://([^.]+)\.supabase\.co.*|\1|')"

echo "gen-types: generating marketing schema types for project ${PROJECT_REF}..."
TMP="$(mktemp)"
npx supabase gen types typescript --project-id "${PROJECT_REF}" --schema marketing > "$TMP"

# Refuse to clobber types.ts with a suspiciously small result (API hiccup).
if [ "$(wc -l < "$TMP")" -lt 100 ]; then
  echo "gen-types: generated file looks truncated ($(wc -l < "$TMP") lines) — aborting" >&2
  exit 1
fi

mv "$TMP" "$OUT"
echo "gen-types: wrote $OUT ($(wc -l < "$OUT") lines)"
