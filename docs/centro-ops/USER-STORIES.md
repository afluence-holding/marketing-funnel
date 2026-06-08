# Centro de Operaciones — User Stories

Personas (ops roles): **Agnóstico** (superuser, all), **Admin**, **Marketing**,
**Operaciones**, **Viewer**. Plus the **Agent** (Claude via MCP, already built).
Acceptance criteria use Given/When/Then.

---

## Identity & access

**US-01 — Role-scoped sidebar** · *As any staff member, I see only the modules my
role allows.*
- Given I am logged in with `ops_role = organico` (or `paid`),
- When I open `/german-roz/main/launch`,
- Then the sidebar shows Resumen, KPIs, Tareas, Gantt, Calendario, Mensajes (per
  `role_module_grant`) and hides Enlaces, Usuarios, Configuración.

**US-02 — Agnóstico/Admin see everything** · *As an admin, no module is hidden.*
- Given `ops_role ∈ {agnostico, admin}`,
- Then every enabled module for the tenant is visible and the permission matrix is
  editable.

**US-03 — Preview as role** · *As an admin, I can preview another role's view.*
- Given I pick "Ver como rol = viewer",
- Then the sidebar re-renders to the viewer's modules **for preview only**; server
  routes still enforce my real role (no privilege escalation).

**US-04 — Assign roles (Usuarios)** · *As an admin, I assign an ops_role to each
team member.*
- Given the Usuarios module,
- When I change Tomás to `organico`,
- Then `afluence_membership.ops_role` persists and Tomás's next session reflects it.

**US-05 — Edit permission matrix (Configuración)** · *As an admin, I toggle which
modules a role sees.*
- Given the matrix role×module,
- When I uncheck Calendario for `comunidad`,
- Then `role_module_grant` updates and comunidad users lose the Calendario tab;
  "Restablecer" restores defaults.

**US-06 — No regression for un-onboarded staff** · *As an existing logged-in user
with no membership row, I still see everything (current behavior).*
- Given no `afluence_membership` row,
- Then I am treated as `agnostico` and nothing breaks.

---

## Tareas (Project Management)

**US-10 — Full 73-task board** · *As any role with Tareas, I see all 73 tasks
grouped by phase (F0–F5) with progress per phase.*
- Then each task shows #, title, workstream pill, channel, owners, due, and
  dependency note when present.

**US-11 — Filter** · filter by workstream / owner / channel / status (client-side).

**US-12 — Update status** · *As Admin/Marketing/Operaciones (write), I change a
task status with optimistic locking.*
- Given task version N, when I set `done`, then progress→100 and a
  `status_history` row is written; a stale version yields a conflict, not a
  silent overwrite.

**US-13 — Step checkboxes** · *As a writer, I tick individual steps* (writes
`task_step.done`). *(P2+)*

**US-14 — Read-only for Viewer** · viewer sees the board but status controls are
disabled.

---

## Calendario (Marketing) — NEW

**US-20 — Master channel matrix** · *As Marketing, I see the channel × phase grid*
(IG, Email, WA grupos, WA bot, ManyChat, Paid, Webinar) from `content_item`
(`kind=matrix_row`).

**US-21 — IG day-by-day** · *I see the daily reels/stories plan 6–30 jun* with the
hook angle, stories note, and stage chip (PRE/$67/$77/$87/CIERRE).

**US-22 — Channel narratives & sequences** · *I read the Email/WA/ManyChat/Paid/
Webinar narratives and the 6 story sequences* (`kind=message`/`sequence`).

**US-23 — Filter by channel / stage** · narrow the calendar to one channel or one
price stage.

---

## Mensajes (Marketing) — NEW

**US-30 — Copy assets with status** · *As Marketing, I see the 12 strategy assets*
each with ✅ listo / ⏳ por producir, file path, summary, and the tasks that
execute it (`task_refs`).

**US-31 — Jump to task** · clicking a `task_ref` chip scrolls/links to that task in
the Tareas board.

---

## Resumen / KPIs / Gantt / Enlaces

**US-40 — Thesis & sensitivity** · *As any role, Resumen shows the +$90K thesis,
the buyers×%HT sensitivity matrix, the funnel/ladder, the channel strategy table,
and the gaps note.*

**US-41 — Editable scorecard** · *As a writer, I edit KPI values; revenue is
computed (`buyers×$76 + buyers×%HT×$580`) and read-only.*

**US-42 — Gantt swimlanes** · *I see channel/workstream bars across the 8 phase
columns + milestone markers* (read-only).

**US-43 — Enlaces** · *As Operaciones/Admin, I paste resource URLs; the ● / ○
indicator flips and the value persists.*

---

## Agent (already built, extend later)

**US-50 — Agent reads tasks/progress** · unchanged (MCP tools live).

**US-51 — Agent feeds KPIs / calendar (future)** · optional `/api/agent/v2`
endpoints for KPI ingestion + content status; out of scope for P1–P3.

---

## Acceptance summary (definition of done per phase)

- **P1**: 73 tasks + calendar + messages seeded; no live status clobbered; RLS ok.
- **P2**: Centro UI renders all content modules (SSR 200, authenticated).
- **P3**: role gating works end-to-end (sidebar + server guards); Usuarios +
  Configuración persist to backoffice; preview works; no regression elsewhere.
- **P4**: docs complete, deep QA green, deployed to main.
