# 04 · Validation & Success Criteria

How we declare the module **done and correct**. Three gates: build-time,
data-integrity, runtime. A release is "green" only when all mandatory checks pass.

## Gate 1 — Build-time (no DB)

| ID | Check | Command | Pass |
|----|-------|---------|------|
| V1.1 | Admin typechecks | `npm run typecheck -w @marketing-funnel/admin` | exit 0 |
| V1.2 | Admin builds | `npm run build -w @marketing-funnel/admin` | exit 0 |
| V1.3 | No lint errors in new files | editor/lint | 0 errors |
| V1.4 | Seed generates | `node apps/admin/scripts/gen-launch-ops-seed.mjs` | 58 tasks/6 phases |
| V1.5 | Seed integrity | `node apps/admin/scripts/validate-launch-ops-seed.mjs` | exit 0 |

## Gate 2 — Data integrity (post-migration, read-only)

Run `docs/launch-ops/validation-queries.sql`. Mandatory expectations:

| ID | Query | Expect |
|----|-------|--------|
| V2.1 | schemas present | `backoffice`, `launch_ops` |
| V2.2 | RLS enabled on all `launch_ops` tables | `rowsecurity = true` for all |
| V2.3 | seed counts | tasks=58, phases=6, kpis=6, resources=26 |
| V2.4 | tasks per phase | F0=9 F1=14 F2=14 F3=10 F4=7 F5=4 |
| V2.5 | dangling dependencies | 0 |
| V2.6 | tasks without owner | 0 |
| V2.7 | helper fns are SECURITY DEFINER | `prosecdef = true` |
| V2.8 | realtime publication includes `task` | 1 row (if Realtime on) |

## Gate 3 — Runtime (UI + API)

### UI (manual or e2e)
| ID | Scenario | Pass |
|----|----------|------|
| V3.1 | `/[org]/[bu]/launch` renders 58 tasks across 6 phases | visible |
| V3.2 | Status change persists + percents update | reload shows new state |
| V3.3 | Stale update shows version-conflict message | no silent overwrite |
| V3.4 | KPI edit persists + revenue recomputes | reload shows value |
| V3.5 | Resource URL persists + ●/○ toggles | reload shows value |
| V3.6 | Existing campaign dashboard unaffected | identical to baseline |

### Agent API (smoke)
`BASE_URL=… LAUNCH_OPS_AGENT_TOKEN=… node apps/admin/scripts/smoke-agent-api.mjs`

| ID | Scenario | Pass |
|----|----------|------|
| V3.7 | missing bearer → 401 | yes |
| V3.8 | list/get tasks → 200 + ETag | yes |
| V3.9 | stale If-Match → 409 | yes |
| V3.10 | valid update → 200, version bumps | yes |
| V3.11 | repeated Idempotency-Key → replay | yes |
| V3.12 | comment + progress → 200 | yes |
| V3.13 | token without scope → 403 | yes |

## Success criteria (acceptance)

The module is accepted when:

1. **Gates 1 & 2 pass** in CI/SQL editor.
2. **Gate 3** UI + agent smoke pass against a deployed admin.
3. **Zero impact** on `apps/web` / `apps/api`: `git diff --stat` shows changes
   only under `apps/admin/**`, `packages/db/src/migrations/**`,
   `packages/launch-ops-mcp/**`, `docs/launch-ops/**`.
4. **Seed re-run safe**: applying the seed twice does not duplicate tasks nor
   reset statuses (guarded).
5. **Isolation proof** (pre-creator): a non-staff session cannot read another
   tenant's launch through an RLS-aware client (see `06-rls-security.md`).

## Non-goals (explicitly out of scope for this MVP)

- Migrating `marketing`/`meta_ops` to tenant-scoped RLS (separate, sequenced work).
- Creator login provisioning (gated by the RLS ordering constraint).
- The Responses module (reads of bukku/caro/mama) — designed, not built here, to
  honor the "admin only, no api" constraint.
- Offline/mobile queue.
