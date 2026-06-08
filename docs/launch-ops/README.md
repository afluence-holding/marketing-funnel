# Launch Ops — Back Office Module

Modular launch operations tracker living **entirely in `apps/admin`** plus two
additive Postgres schemas. It turns the per-device `DI21-C2-Centro-Operaciones.html`
checklist into a multi-user, real-time, agent-operable back-office module — without
touching `apps/web` or `apps/api`.

## What this delivers

| Layer | What | Where |
|------|------|-------|
| DB | `backoffice` (identity/tenancy) + `launch_ops` (tracker) schemas, RLS from migration 1 | `packages/db/src/migrations/2026060800*.sql` |
| Seed | DI21-C2 launch: 58 tasks · 6 phases · 6 KPIs · 26 resources | `...000200_launch_ops_seed_di21_c2.sql` (generated) |
| Data layer | Agnostic types + repository + module registry | `apps/admin/src/lib/launch-ops`, `lib/modules` |
| UI | BU tab shell + Launch view (Resumen/Gantt/Tareas/KPIs/Enlaces) + Realtime | `apps/admin/src/app/[organizer]/[bu]/launch`, `components/launch-ops` |
| Agent API | `/api/agent/v1` — Bearer + scopes + If-Match + Idempotency-Key + audit | `apps/admin/src/app/api/agent/v1` |
| MCP server | stdio MCP exposing 6 tools over the agent API (Claude/Cursor) | `packages/launch-ops-mcp` |
| Tooling | seed generator + integrity validator + API smoke test | `apps/admin/scripts` |

## Docs index

1. [`01-architecture.md`](./01-architecture.md) — system shape, modularity, data flow
2. [`02-data-model.md`](./02-data-model.md) — ERD + table-by-table spec
3. [`03-user-stories.md`](./03-user-stories.md) — personas + stories + acceptance criteria
4. [`04-validation-success-criteria.md`](./04-validation-success-criteria.md) — how we declare "done & correct"
5. [`05-agent-api.md`](./05-agent-api.md) — endpoint reference + examples + MCP mapping
6. [`06-rls-security.md`](./06-rls-security.md) — RLS model, ordering constraint, threat notes
7. [`07-qa-plan.md`](./07-qa-plan.md) — test matrix + commands + sign-off checklist
8. [`08-operations.md`](./08-operations.md) — prod runbook: migrations, exposed schemas, token, MCP config, smoke test

## Apply order

```bash
# 1. (Optional) regenerate the seed from the source doc
node apps/admin/scripts/gen-launch-ops-seed.mjs

# 2. Validate the seed statically (no DB)
node apps/admin/scripts/validate-launch-ops-seed.mjs

# 3. Apply in Supabase SQL Editor, IN THIS ORDER:
#    20260608000000_backoffice_identity.sql
#    20260608000100_launch_ops_schema.sql
#    20260608000200_launch_ops_seed_di21_c2.sql

# 4. Run docs/launch-ops/validation-queries.sql in the SQL Editor

# 5. Typecheck the admin app
npm run typecheck -w @marketing-funnel/admin

# 6. (After deploy) smoke-test the agent API
BASE_URL=<ADMIN_BASE_URL> \
LAUNCH_OPS_AGENT_TOKEN=*** node apps/admin/scripts/smoke-agent-api.mjs
# See 08-operations.md for the full runbook (exposed schemas, token, env).
```

## Guardrails honored

- **No writes to `apps/web` or `apps/api`.** Launch Ops reads/writes its own
  schema directly from admin via the existing `supabaseAdminForSchema` pattern.
- **Additive migrations only.** New schemas; zero `ALTER` on `marketing`/`meta_ops`;
  zero cross-schema FKs into existing tables. Idempotent + re-runnable.
- **Seed never clobbers live state** (guarded: only seeds tasks when the launch
  has none).
- **Agent never uses `service_role`** at the trust boundary: it authenticates
  with a scoped Bearer token and is constrained to `launch_ops` operations.

## Environment variables (admin)

| Var | Required | Purpose |
|-----|----------|---------|
| `LAUNCH_OPS_AGENT_TOKEN` | for agent API | Bootstrap Bearer token for the Claude agent |
| `LAUNCH_OPS_AGENT_SCOPES` | optional | csv override, default `tasks:read,status:write,notes:write,progress:read` |
| `LAUNCH_OPS_AGENT_SLUG` | optional | actor label, default `claude:launch-ops-agent` |

(Existing admin vars — `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`,
`DATABASE_URL` — are reused; nothing new is required for the human UI.)
