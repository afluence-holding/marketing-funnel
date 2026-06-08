# 08 — Operations Runbook (Launch Ops)

Production operational steps. Everything here was applied and validated against
the live Supabase project on 2026-06-08. Read this before touching the live env.

> Secrets are never committed. Tokens below are placeholders — the real agent
> token is delivered out-of-band (chat / password manager) and stored only as a
> SHA-256 hash in `backoffice.service_identity`.

---

## 1. Database migrations (DDL) — apply via session pooler

DDL must run through the **session pooler** (port `5432`), not the transaction
pooler (`6543`). Use a single atomic transaction with `ON_ERROR_STOP`.

```bash
# SESSION_URL = postgres://...@aws-...pooler.supabase.com:5432/postgres
psql "$SESSION_URL" -X -v ON_ERROR_STOP=1 \
  -f packages/db/src/migrations/20260608000000_backoffice_identity.sql \
  -f packages/db/src/migrations/20260608000100_launch_ops_schema.sql \
  -f packages/db/src/migrations/20260608000200_launch_ops_seed_di21_c2.sql
```

All three are idempotent / re-runnable. Validate with
`docs/launch-ops/validation-queries.sql`.

**Status:** applied + validated in production (2 schemas, 58 tasks, 6 KPIs, 26 resources).

---

## 2. Expose the new schemas to PostgREST  ⚠️ REQUIRED

This is the step that makes `supabase-js` (and therefore the admin UI + agent API)
able to read `backoffice` / `launch_ops`. Without it every query fails with
`PGRST106 The schema must be one of the following: ...` and the agent guard
returns `invalid_token` (the service-identity lookup itself fails).

`meta_ops` / `marketing` already work because they were exposed previously. New
schemas are **not** exposed automatically.

Two equivalent ways (we used both; the SQL one applies immediately):

```sql
-- Append the two new schemas. NEVER replace the list — keep the existing ones.
ALTER ROLE authenticator
  SET pgrst.db_schemas = 'public, graphql_public, marketing, marketing_ops, meta_ops, backoffice, launch_ops';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
```

Management API equivalent (Dashboard → Settings → API → Exposed schemas):

```bash
# GET current value first, then PATCH the full comma-separated list.
curl -s -X PATCH \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"db_schema":"public,graphql_public,marketing,marketing_ops,meta_ops,backoffice,launch_ops"}' \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/postgrest"
```

> The Management API PATCH does not always propagate to the live PostgREST GUC
> immediately. The `ALTER ROLE authenticator ... + NOTIFY` path takes effect in
> seconds. RLS still gates every row — exposing a schema only lets PostgREST route
> to it; `backoffice.service_identity` remains readable only by Afluence admins
> (and by the service role used server-side).

**Status:** applied + verified in production.

---

## 3. Agent token

The agent authenticates with a Bearer token resolved in two ways (guard order):

1. **Env fast-path** — exact match against `LAUNCH_OPS_AGENT_TOKEN` (scopes from
   `LAUNCH_OPS_AGENT_SCOPES`, defaulting to the four read/write scopes).
2. **DB-backed** — SHA-256 of the token matched against
   `backoffice.service_identity.token_hash` where `active = true` (scopes + tenant
   come from the row). Rotatable / revocable without a redeploy.

We registered the live token via path 2, so **the agent works without any Railway
env change**:

```sql
-- token_hash = sha256(<token>); slug is stable, used for rotation/revocation.
INSERT INTO backoffice.service_identity (slug, name, token_hash, scopes, active)
VALUES ('claude:launch-ops-agent', 'Claude Launch Ops Agent',
        '<sha256-hex>', ARRAY['tasks:read','status:write','notes:write','progress:read'], true)
ON CONFLICT (slug) DO UPDATE
  SET token_hash = EXCLUDED.token_hash, scopes = EXCLUDED.scopes, active = true;
```

**Rotate:** generate a new token, recompute the hash, re-run the `ON CONFLICT`
upsert. **Revoke:** `UPDATE backoffice.service_identity SET active = false WHERE slug = 'claude:launch-ops-agent';`

Generate a token + hash:

```bash
TOKEN=$(openssl rand -hex 32)
HASH=$(printf '%s' "$TOKEN" | shasum -a 256 | awk '{print $1}')   # matches guard's sha256
```

**Status:** `claude:launch-ops-agent` registered + active in production.

### Optional Railway fast-path

Setting the env var on the admin service avoids a DB lookup per request. Not
required (DB-backed already works), but valid:

```
LAUNCH_OPS_AGENT_TOKEN=<token>
LAUNCH_OPS_AGENT_SCOPES=tasks:read,status:write,notes:write,progress:read   # optional
```

---

## 4. MCP client config

The MCP server (`packages/launch-ops-mcp`) is a stdio process. Point it at the
deployed admin and give it the token:

```jsonc
{
  "mcpServers": {
    "launch-ops": {
      "command": "node",
      "args": ["packages/launch-ops-mcp/dist/index.js"],
      "env": {
        "LAUNCH_OPS_API_URL": "<ADMIN_BASE_URL>",   // e.g. https://<admin-domain>
        "LAUNCH_OPS_AGENT_TOKEN": "<token>",
        "LAUNCH_OPS_LAUNCH": "DI21-C2"
      }
    }
  }
}
```

Build first: `npm run build -w @marketing-funnel/launch-ops-mcp`.

---

## 5. Smoke test (Gate 3)

```bash
BASE_URL=<ADMIN_BASE_URL> \
LAUNCH_OPS_AGENT_TOKEN=<token> \
LAUNCH_CODE=DI21-C2 \
node apps/admin/scripts/smoke-agent-api.mjs
```

The script mutates `tasks[0]` (status → `doing`, version bump, one note + one
comment) to exercise the optimistic-lock (409) and idempotency paths. If you run
it against the live launch, revert afterwards:

```sql
BEGIN;
WITH t AS (SELECT id FROM launch_ops.task
           WHERE launch_id = (SELECT id FROM launch_ops.launch WHERE code='DI21-C2')
             AND source_index = 1)
UPDATE launch_ops.task x SET status='todo', progress_pct=0, updated_by=NULL, version=1
FROM t WHERE x.id = t.id;
DELETE FROM launch_ops.comment        WHERE task_id        IN (SELECT id FROM launch_ops.task WHERE launch_id=(SELECT id FROM launch_ops.launch WHERE code='DI21-C2') AND source_index=1);
DELETE FROM launch_ops.status_history WHERE task_id        IN (SELECT id FROM launch_ops.task WHERE launch_id=(SELECT id FROM launch_ops.launch WHERE code='DI21-C2') AND source_index=1);
DELETE FROM launch_ops.audit_log      WHERE entity_id      IN (SELECT id FROM launch_ops.task WHERE launch_id=(SELECT id FROM launch_ops.launch WHERE code='DI21-C2') AND source_index=1);
DELETE FROM launch_ops.idempotency_key WHERE key LIKE 'smoke-%';
COMMIT;
```

**Status (2026-06-08, run against local admin → prod DB, then reverted):**
all 12 checks passed — 401 (missing/invalid bearer), list, get + ETag,
409 optimistic lock, update + version bump (1→2), idempotency replay, comment,
progress. Launch left identical to seed (0 comments / 0 history / 0 audit / 0 done).

---

## 6. Production status snapshot

| Gate | Item | Status |
|------|------|--------|
| 1 | Admin typecheck / build | green |
| 2 | Migrations applied + validated (prod) | green |
| 2 | Schemas exposed to PostgREST | green |
| 3 | Agent token registered (`service_identity`) | green |
| 3 | Agent API smoke (12/12) | green |
| — | Admin redeploy from `main` (so `/[org]/[bu]/launch` serves the routes) | pending (Railway) |

The only remaining step is the admin service picking up `main` (redeploy). The DB,
schemas, token, and code are all live and validated.
