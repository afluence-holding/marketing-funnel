# Centro de Operaciones — Validation Results

Deep QA evidence for the P1–P3 build (data + content modules + RBAC). All gates
green against the **live Supabase** + **authenticated dev render**.

## P1 — Data + reseed (additive, no clobber)

| Check | Result |
|-------|--------|
| Migrations applied (`content_item`, `message_asset`, RBAC) | ✅ transactional, idempotent |
| Tasks 58 → **74** (F0=16,F1=17,F2=15,F3=14,F4=7,F5=5) | ✅ |
| No-clobber: status/progress hash of #1–58 identical before/after | ✅ `9f88c53c…` == `9f88c53c…` |
| `content_item` = 44 (7 matrix_row, 25 reel, 6 sequence, 6 message) | ✅ |
| `message_asset` = 12 (status + file_path + task_refs) | ✅ |
| dependencies = 50, steps = 241 | ✅ |
| `role_module_grant` seeded; `can_see_module` matches doc matrix | ✅ marketing/calendario=t, marketing/enlaces=f, viewer/tareas=f |
| Team directory seeded (6 staff w/ ops_role) | ✅ |

## P2 — Centro UI (Calendario, Mensajes, matrix)

| Check | Result |
|-------|--------|
| `typecheck` + `build` | ✅ green |
| Data path via **PostgREST** (real client): content/messages/staff embed | ✅ all PASS (`smoke-centro-data.mjs`) |

## P3 — RBAC (sidebar role-aware, Usuarios, Configuración)

| Check | Result |
|-------|--------|
| `typecheck` + `build` | ✅ green |
| Authenticated SSR render `/german-roz/main/launch` | ✅ HTTP 200 |
| Tabs Calendario / Mensajes / Usuarios / Configuración present | ✅ |
| Sensitivity matrix + "Ver como rol" selector present | ✅ |
| Server-side admin guard on role/grant mutations | ✅ (`requireManage`) |

## Regression (authenticated)

| Route | Status |
|-------|--------|
| `/german-roz/main/launch` | 200 |
| `/german-roz/di21/launch` | 200 |
| `/bukku/main/responses` | 200 |
| `/mama-sin-caos/main/responses` | 200 |
| `/german-roz/main` (campaigns) | 404 — pre-existing (no meta_ops data; page untouched) |

## QA tooling (kept)

- `apps/admin/scripts/smoke-centro-data.mjs` — data path through PostgREST.
- `apps/admin/scripts/smoke-centro-render.mjs` — authenticated SSR render assertions.

## Not yet done (by design / out of P1–P3 scope)

- Editing Calendario/Mensajes from the UI (read-first; mutations later).
- Top-level BU switcher role-gating (the 9 modules live inside the launch view,
  which is the HTML's "sidebar"; campaigns/responses gating is a later step).
- Agent API v2 for content/KPI ingestion.
- Commit/PR/deploy to main — **pending explicit go**.
