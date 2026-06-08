# 03 · User Stories

Personas:
- **Staff (Afluence)** — internal team member (`afluence_membership`). Sees all
  tenants. Operates every module.
- **Creator** — external client user (`tenant_membership`). Sees only their
  tenant; modules limited by their membership.
- **Agent (Claude)** — `service_identity` with scopes; no UI, only `/api/agent/v1`.
- **Director/Admin** — staff with elevated role for sensitive actions.

Each story uses Given/When/Then acceptance criteria. IDs map to the QA matrix in
[`07-qa-plan.md`](./07-qa-plan.md).

---

## Epic A — Navigation & modularity

**US-A1 — Modular tabs per BU**
As staff, I want a tab strip per BU so I can jump between Campaigns, Responses and
Launch Ops.
- **Given** a BU with `['campaigns','launch']` enabled, **when** I open `/german-roz/main`, **then** I see a tab bar with "Campañas" and "Launch Ops"; the active tab is highlighted.
- **Given** a BU with a single module, **then** no tab bar renders (existing dashboards untouched).
- **Given** I switch tabs, **then** the URL changes to `/[org]/[bu]/launch` and the previous dashboard is unaffected.

**US-A2 — No regression on existing dashboards**
- **Given** any existing BU, **when** the layout mounts, **then** the campaign
  dashboard renders exactly as before (only a slim tab strip may appear above it).

---

## Epic B — Launch overview (Resumen / Gantt)

**US-B1 — See operational progress**
As staff, I want overall and per-phase progress at a glance.
- **Then** the header shows `done/total` and an overall % bar.
- **Then** "Avance por fase" lists F0–F5 with a fill bar = done/total per phase.

**US-B2 — See the thesis & milestones**
- **Then** the Resumen shows the thesis (price ladder, avg price, HT) from
  `launch.config`.
- **Then** the Gantt shows milestones (`config.dates`) and a per-phase timeline
  with the date range derived from its tasks.

---

## Epic C — Task execution (Tareas)

**US-C1 — Filter the board**
As staff, I want to filter tasks by workstream, owner, channel and status.
- **Given** I pick owner = Nico, **then** only tasks owned by Nico show.
- **Given** filters match nothing, **then** an empty state shows.

**US-C2 — Update a task status**
As staff, I want to move a task to doing/blocked/done.
- **When** I change the status select, **then** the change persists and the bar/percent update.
- **Then** a `status_history` row is written with my actor and `actor_type='human'`.
- **Given** someone else changed the task since my page loaded, **then** I get a
  visible "otro usuario actualizó esta tarea" message (version conflict) and no
  silent overwrite.

**US-C3 — Inspect a task**
- **When** I expand a task, **then** I see objective, ordered steps, "Listo cuando"
  (definition of done), owners, channel, due label, and dependency refs (`#n`).

---

## Epic D — Scorecard (KPIs)

**US-D1 — Edit KPIs**
As staff, I want to record live numbers (registros, show-up, compradores, %HT, ROAS).
- **When** I type a value and blur, **then** it persists to `launch_ops.kpi`.
- **Then** "Revenue estimado" recomputes `buyers×avg + buyers×%ht×ht`.

---

## Epic E — Resources (Enlaces)

**US-E1 — Centralize links**
As staff, I want one place for every launch link with a ready/pending indicator.
- **When** I paste a URL and blur, **then** it persists and the status flips to ●
  (ready); clearing it flips to ○ (pending).
- **Then** resources are grouped by category (landings/comms/tracking/assets/docs).

---

## Epic F — Realtime collaboration

**US-F1 — Live updates**
As staff, when a teammate changes a task, I want my board to reflect it without a
manual reload.
- **Given** Realtime is enabled, **when** another client updates a task, **then**
  my open Tareas view refreshes within ~1s.
- **Given** Realtime is disabled on the project, **then** the UI still works
  (graceful no-op) and `router.refresh()` after my own actions keeps me current.

---

## Epic G — Agent (Claude) integration

**US-G1 — Read tasks**
As the agent (scope `tasks:read`), I can `GET /api/agent/v1/tasks` with filters.
- **Given** no/invalid token, **then** 401.
- **Given** a token lacking `tasks:read`, **then** 403 `insufficient_scope`.

**US-G2 — Update status safely**
As the agent (scope `status:write`), I can `PATCH /api/agent/v1/tasks/:id`.
- **Given** `If-Match` with a stale version, **then** 409 `version_conflict` (no write).
- **Given** a repeated `Idempotency-Key`, **then** the prior response replays
  (`Idempotency-Replayed: true`) with no duplicate effect.
- **Then** an `audit_log` row records the action; `status_history.actor_type='agent'`.

**US-G3 — Comment & report**
- As the agent (`notes:write`), I can `POST /tasks/:id/comments`.
- As the agent (`progress:read`), I can `GET /progress` to feed the scorecard.

**US-G4 — Blast-radius limits**
- The agent has **no delete scope** and **cannot** create launches/phases/tasks
  via the API (creation is human-gated for v1).
- The agent **never** uses `service_role`; a leaked token is bounded by its scopes.

---

## Epic H — Multi-tenant isolation (future creators)

**US-H1 — Creator sees only their launch**
As a creator with `tenant_membership` to tenant X, I can read launch X.
- **Given** I query a launch of tenant Y via an RLS-aware client, **then** I get
  nothing (RLS denies).
- **Note:** creator logins must not be created until the RLS ordering constraint
  in [`06-rls-security.md`](./06-rls-security.md) is satisfied.
