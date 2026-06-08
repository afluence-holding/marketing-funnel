# 05 · Agent API (`/api/agent/v1`)

REST surface for the Launch Ops agent (Claude). Intent-shaped, not a 1:1 table
mirror. Auth is a **scoped Bearer token** — never `service_role`.

## Auth

```
Authorization: Bearer <LAUNCH_OPS_AGENT_TOKEN>
```

Resolution order:
1. Env `LAUNCH_OPS_AGENT_TOKEN` (constant-time compare) → scopes from
   `LAUNCH_OPS_AGENT_SCOPES` (default: all four read/write scopes).
2. Otherwise `sha256(token)` is matched against an active
   `backoffice.service_identity` row → scopes + tenant from that row.

Scopes: `tasks:read`, `status:write`, `notes:write`, `progress:read`.
No delete scope exists. Creation of launches/phases/tasks is **not** exposed
(human-gated for v1).

Errors: `401 missing_bearer|invalid_token`, `403 insufficient_scope`,
`404 *_not_found`, `409 version_conflict`, `422 invalid_*`, `500 internal`.

## Endpoints

### `GET /api/agent/v1/tasks`
Scope: `tasks:read`. Query: `launch, phase, status, owner, channel, blocked, q, limit`.
```json
{ "launch": {"id":"…","code":"DI21-C2"}, "count": 9, "tasks": [ /* Task[] */ ] }
```

### `GET /api/agent/v1/tasks/:id`
Scope: `tasks:read`. Response includes `ETag: "<version>"`.
```json
{ "task": { "id":"…", "version": 3, "status":"todo", "title":"…", "steps":[…] } }
```

### `PATCH /api/agent/v1/tasks/:id`
Scope: `status:write`. Body: `{ status?, progressPct?, note? }`.
Headers: `If-Match: "<version>"` (optimistic lock), `Idempotency-Key: <key>`.
- 409 `version_conflict` `{ currentVersion }` if `If-Match` is stale.
- Replays the prior response if the `Idempotency-Key` was seen.
- Writes `audit_log`; status change appends `status_history` (`actor_type=agent`).
```json
{ "task": { "id":"…", "version": 4, "status":"doing" } }
```

### `POST /api/agent/v1/tasks/:id/comments`
Scope: `notes:write`. Body: `{ body, kind? }` → `{ "ok": true }`.

### `POST /api/agent/v1/bulk-status`
Scope: `status:write`. Body: `{ updates: [{ taskId, status?, progressPct?, note?, expectedVersion? }] }` (max 50).
Supports `Idempotency-Key`. Per-item results:
```json
{ "count": 3, "results": [ {"taskId":"…","ok":true,"version":4},
                           {"taskId":"…","ok":false,"error":"version_conflict","version":2} ] }
```

### `GET /api/agent/v1/progress`
Scope: `progress:read`. Query: `launch`.
```json
{ "launch": {"id":"…","code":"DI21-C2","name":"…"},
  "progress": { "overallPct": 34, "totalTasks": 58, "doneTasks": 20, "byPhase": [...] },
  "kpis": [ {"key":"registros","label":"Registros","value":7400,"target":"~7–8K"} ] }
```

## Examples

```bash
# list blocked infra tasks
curl -s "$BASE/api/agent/v1/tasks?launch=DI21-C2&blocked=1" \
  -H "Authorization: Bearer $TOKEN"

# move a task to done with optimistic lock + idempotency
curl -s -X PATCH "$BASE/api/agent/v1/tasks/$ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'If-Match: "3"' -H "Idempotency-Key: run-42" \
  -H 'Content-Type: application/json' \
  -d '{"status":"done","note":"validado en Hyros"}'
```

## MCP mapping (for a future `packages/launch-ops-mcp`)

The brief's 7 tools wrap these endpoints 1:1 by intent:

| MCP tool | HTTP |
|----------|------|
| `list_tasks(phase?,status?,owner?,due_before?,blocked?,q?,limit?)` | `GET /tasks` |
| `get_task(id)` | `GET /tasks/:id` |
| `update_task_status(id,status,progress_pct?,note?)` | `PATCH /tasks/:id` (+If-Match/Idempotency-Key) |
| `bulk_update_status(updates[])` | `POST /bulk-status` |
| `add_comment(id,body,kind?)` | `POST /tasks/:id/comments` |
| `get_progress()` | `GET /progress` |
| `create_task(...)` | **not exposed** — requires human confirmation (v1) |

The MCP server is **built** at `packages/launch-ops-mcp` — a thin Node/TS stdio
client that injects the Bearer token, `Idempotency-Key`, and `If-Match`. It lives
outside `apps/admin` (its own `packages/*` workspace) and touches neither web nor
api. The 6 implemented tools above are registered there; `create_task` is omitted
(human-gated). See `packages/launch-ops-mcp/README.md` for build + client config.
