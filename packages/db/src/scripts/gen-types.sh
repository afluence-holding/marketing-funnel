#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$(dirname "$API_DIR")")"
OUTPUT="$ROOT_DIR/packages/db/src/types.ts"

# Load .env and .env.local from root (set -a exports all vars, .env.local overrides)
set -a
[ -f "$ROOT_DIR/.env.local" ] && . "$ROOT_DIR/.env.local"
set +a

if [ -z "$SUPABASE_URL" ]; then
  echo "Error: SUPABASE_URL not set. Add it to .env.local"
  exit 1
fi

# Extract project ref from URL (https://<ref>.supabase.co)
PROJECT_REF=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')
if [ -z "$PROJECT_REF" ]; then
  echo "Error: Could not extract project ref from SUPABASE_URL"
  exit 1
fi

echo "Generating types for project: $PROJECT_REF (schema: marketing)"
echo "Output: $OUTPUT"
echo "Using Supabase Management API (requires: supabase login or SUPABASE_ACCESS_TOKEN)"

npx supabase gen types typescript \
  --project-id "$PROJECT_REF" \
  --schema marketing \
  > "$OUTPUT"

echo "Done! Types written to packages/db/src/types.ts"
