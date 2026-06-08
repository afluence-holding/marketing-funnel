# @marketing-funnel/launch-ops-mcp

MCP server (stdio) that exposes the **Launch Ops agent API**
(`apps/admin/api/agent/v1`) to MCP clients like Claude Desktop, Claude Code, or
Cursor. It is a **thin client** — auth, optimistic locking and idempotency are
enforced server-side by the admin API; this package just maps tools → HTTP.

## Design

- **No `service_role`, no DB access.** The server only knows a base URL and a
  scoped Bearer token. A leaked config is bounded by the token's scopes.
- **Safe writes.** `update_task_status` forwards `expected_version` as
  `If-Match` (optimistic lock) and `idempotency_key` as `Idempotency-Key`.
- **Read-only by default capability set.** No delete; no create of
  launches/phases/tasks (creation is human-gated in the API).

## Tools

| Tool | API | Scope needed |
|------|-----|--------------|
| `list_tasks` | `GET /tasks` | `tasks:read` |
| `get_task` | `GET /tasks/:id` | `tasks:read` |
| `update_task_status` | `PATCH /tasks/:id` | `status:write` |
| `bulk_update_status` | `POST /bulk-status` | `status:write` |
| `add_comment` | `POST /tasks/:id/comments` | `notes:write` |
| `get_progress` | `GET /progress` | `progress:read` |

(`create_task` is intentionally not exposed — it requires human confirmation.)

## Build

```bash
npm run build -w @marketing-funnel/launch-ops-mcp
```

## Run

```bash
LAUNCH_OPS_API_URL=https://afluence-admin.up.railway.app \
LAUNCH_OPS_AGENT_TOKEN=*** \
LAUNCH_OPS_LAUNCH=DI21-C2 \
node packages/launch-ops-mcp/dist/index.js
```

| Env | Required | Purpose |
|-----|----------|---------|
| `LAUNCH_OPS_API_URL` | yes | Base URL of the admin app |
| `LAUNCH_OPS_AGENT_TOKEN` | yes | Scoped Bearer token (matches admin's `LAUNCH_OPS_AGENT_TOKEN` or a `service_identity`) |
| `LAUNCH_OPS_LAUNCH` | no | Default launch code (e.g. `DI21-C2`) |

## Client config

### Claude Desktop / Claude Code (`claude_desktop_config.json` / `.mcp.json`)

```json
{
  "mcpServers": {
    "launch-ops": {
      "command": "node",
      "args": ["/abs/path/marketing-funnel/packages/launch-ops-mcp/dist/index.js"],
      "env": {
        "LAUNCH_OPS_API_URL": "https://afluence-admin.up.railway.app",
        "LAUNCH_OPS_AGENT_TOKEN": "***",
        "LAUNCH_OPS_LAUNCH": "DI21-C2"
      }
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "launch-ops": {
      "command": "node",
      "args": ["packages/launch-ops-mcp/dist/index.js"],
      "env": {
        "LAUNCH_OPS_API_URL": "https://afluence-admin.up.railway.app",
        "LAUNCH_OPS_AGENT_TOKEN": "***",
        "LAUNCH_OPS_LAUNCH": "DI21-C2"
      }
    }
  }
}
```

## Notes

- stdout is reserved for JSON-RPC; logs go to stderr.
- Recommended agent loop: `get_task` → read `version` → `update_task_status`
  with `expected_version` + a stable `idempotency_key`. On a `409
  version_conflict`, re-`get_task` and retry.
- See `docs/launch-ops/05-agent-api.md` for the full endpoint reference.
