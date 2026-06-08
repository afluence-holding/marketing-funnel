# 07 · QA Plan

A repeatable test loop. Run gates in order; stop at the first red.

## Commands

```bash
# Gate 1 — build-time (no DB)
node apps/admin/scripts/gen-launch-ops-seed.mjs          # regenerate seed
node apps/admin/scripts/validate-launch-ops-seed.mjs     # integrity (exit 0)
npm run typecheck -w @marketing-funnel/admin             # tsc (exit 0)
npm run build -w @marketing-funnel/admin                 # next build (needs envs)

# Gate 2 — data integrity (Supabase SQL Editor)
#   paste docs/launch-ops/validation-queries.sql, compare to EXPECT comments

# Gate 3 — runtime (deployed admin)
BASE_URL=<ADMIN_BASE_URL> \
LAUNCH_OPS_AGENT_TOKEN=*** \
node apps/admin/scripts/smoke-agent-api.mjs
```

## Test matrix

| # | Area | Type | Ref | Status field |
|---|------|------|-----|--------------|
| 1 | typecheck | auto | V1.1 | ☐ |
| 2 | build | auto | V1.2 | ☐ |
| 3 | lint | auto | V1.3 | ☐ |
| 4 | seed generate | auto | V1.4 | ☐ |
| 5 | seed integrity | auto | V1.5 | ☐ |
| 6 | schemas/RLS present | sql | V2.1–2.2 | ☐ |
| 7 | seed counts/distribution | sql | V2.3–2.4 | ☐ |
| 8 | dependency/owner integrity | sql | V2.5–2.6 | ☐ |
| 9 | SECURITY DEFINER fns | sql | V2.7 | ☐ |
| 10 | realtime publication | sql | V2.8 | ☐ |
| 11 | launch page renders | manual | V3.1 | ☐ |
| 12 | status persist + percents | manual | V3.2 | ☐ |
| 13 | version-conflict UX | manual | V3.3 | ☐ |
| 14 | KPI persist + revenue | manual | V3.4 | ☐ |
| 15 | resource persist + ●/○ | manual | V3.5 | ☐ |
| 16 | dashboard unaffected | manual | V3.6 | ☐ |
| 17 | agent auth/scope | smoke | V3.7,V3.13 | ☐ |
| 18 | agent list/get/ETag | smoke | V3.8 | ☐ |
| 19 | optimistic lock 409 | smoke | V3.9 | ☐ |
| 20 | update + version bump | smoke | V3.10 | ☐ |
| 21 | idempotency replay | smoke | V3.11 | ☐ |
| 22 | comment + progress | smoke | V3.12 | ☐ |

## Idempotency / safety drills

- **Re-run seed**: apply the seed migration twice → task count stays 58, no
  status reset (guard verified by V2.3 after a manual status change).
- **Concurrent edit**: two browser tabs; change a task in tab A, then try the
  stale value in tab B → conflict message (V3.3).
- **Agent retry storm**: send the same `PATCH` with one `Idempotency-Key` 5× →
  one effect, 4 replays (V3.11).

## Blast-radius / isolation drills (pre-creator)

In a **staging** project only:
1. Create a non-staff `auth.users` row + `profile(user_kind='creator')` with a
   `tenant_membership` to tenant A.
2. With that session (RLS-aware client), `select * from launch_ops.launch` for a
   tenant-B launch → **0 rows**.
3. `GET /api/agent/v1/*` without the agent token → 401.

> Do **not** run isolation drills with real creator logins in prod until the
> `meta_ops` RLS ordering constraint (06-rls-security) is satisfied.

## Sign-off

A release is signed off when rows 1–10 and 17–22 are green and 11–16 are verified
on the deployed admin, and `git diff --stat` touches only
`apps/admin/**`, `packages/db/src/migrations/**`, `docs/launch-ops/**`.

## Current run (this delivery)

| Gate | Result |
|------|--------|
| V1.1 typecheck | ✅ exit 0 |
| V1.3 lint | ✅ 0 errors |
| V1.4 seed generate | ✅ 58 tasks / 6 phases / 6 kpis / 26 resources |
| V1.5 seed integrity | ✅ exit 0 (12 free-text deps captured as notes) |
| V1.2 build (admin) | ✅ `next build` exit 0 — launch + 5 agent routes compiled, dashboard unaffected |
| MCP build | ✅ `tsc` exit 0 — 6 tools register; client shapes If-Match/Idempotency-Key/Authorization (runtime-verified) |
| Gate 2 (SQL) | ⏳ run after applying migrations in Supabase |
| Gate 3 (runtime/smoke) | ⏳ run after deploy with agent token |
