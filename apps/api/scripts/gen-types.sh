#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$(dirname "$API_DIR")")"
OUTPUT="$API_DIR/src/db/types.ts"

# Load .env and .env.local from root (.env.local takes precedence)
if [ -f "$ROOT_DIR/.env" ]; then
  export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
fi
if [ -f "$ROOT_DIR/.env.local" ]; then
  export $(grep -v '^#' "$ROOT_DIR/.env.local" | xargs)
fi

if [ -z "$SUPABASE_URL" ]; then
  echo "Error: SUPABASE_URL not set. Create a .env file at the repo root."
  exit 1
fi

# Extract project ref from URL (https://<ref>.supabase.co)
PROJECT_REF=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')

if [ -z "$PROJECT_REF" ]; then
  echo "Error: Could not extract project ref from SUPABASE_URL=$SUPABASE_URL"
  exit 1
fi

echo "Generating types for project: $PROJECT_REF (schema: marketing)"
echo "Output: $OUTPUT"

npx supabase gen types typescript \
  --project-id "$PROJECT_REF" \
  --schema marketing \
  > "$OUTPUT"

echo "Done! Types written to src/db/types.ts"
