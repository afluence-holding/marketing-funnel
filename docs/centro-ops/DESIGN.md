# Centro de Operaciones — Design & Gap Analysis

Evolves the current **Launch Ops** module (5 tabs, 58 tasks) into the full
**Centro de Operaciones** mini-SaaS shown in `docs/DI21-C2-Centro-Operaciones copy.html`:
a modular back office with a left sidebar, role-based access, and 9 modules.

> Guardrails (unchanged): only `apps/admin` + `packages/db` migrations; **never**
> touch `apps/web` / `apps/api`; migrations are **additive** and idempotent; the
> live DI21-C2 launch data (task status/progress) is **never clobbered**.

---

## 1. Target vs current — module map

| Target module (HTML) | Section | Status today | Action |
|----------------------|---------|--------------|--------|
| Resumen | Vista general | ✅ exists (thesis card, phase bars) | **Enrich**: sensitivity matrix, funnel/ladder, channel strategy, gaps |
| KPIs | Estadísticas | ✅ exists (editable + computed revenue) | Keep; minor polish |
| Tareas | Project Mgmt | ✅ exists (58 tasks, status edit) | **Re-seed → 73 tasks**; show dependency notes, steps checkboxes |
| Gantt | Project Mgmt | ✅ exists (phase bars + milestones) | Keep; channel×phase swimlanes (read-only) |
| **Calendario** | Marketing | ❌ missing | **NEW**: content plan (day-by-day reels/stories, channel matrix, sequences) |
| **Mensajes** | Marketing | ❌ missing | **NEW**: copy assets per strategy (status + file path + linked tasks) |
| Enlaces | Operaciones | ✅ exists (26 resources, editable URLs) | Keep |
| **Usuarios** | Administración | ❌ missing | **NEW**: assign role per person (backoffice) |
| **Configuración** | Administración | ❌ missing | **NEW**: role→module permission matrix |

Plus the cross-cutting change: a **role-aware sidebar** (replacing the flat
`ModuleTabBar` inside the launch view) with a "ver como rol" preview.

---

## 2. Current state (locked facts)

- **DB `launch_ops`** (12 tables): `task` already has `channel`, `workstream`
  (organico/inorganico/infra), `due_*`, `position`, `version`, `progress_pct`,
  plus child tables `task_step`, `task_owner`, `dependency`. 58 tasks seeded for
  DI21-C2 (F0=9, F1=14, F2=14, F3=10, F4=7, F5=4), 6 KPIs, 26 resources.
- **Admin launch view**: 5 internal tabs, service-role reads, server actions for
  status/kpi/resource/comment, Realtime on `task`.
- **Identity `backoffice`**: `profile` (user_kind), `afluence_membership`
  (admin/director/member), `tenant_membership` (modules jsonb), `service_identity`
  + RLS helpers (`is_afluence`, `is_afluence_admin`, `can_read_tenant`,
  `can_write_module`). **Not consumed by the admin UI yet** — no role gating; the
  module registry is a static `ENABLED` map.
- **Source HTML present** as `docs/DI21-C2-Centro-Operaciones copy.html` (660
  lines): 73 tasks (`T`), channel/type meta (`M`), 6 phases (`PH`), KPIs, links,
  9 modules (`MODULES`), roles (`ROLES`), permission matrix, team (`TEAM`).

### New tasks in the target (vs current 58)

The target adds ~15 tasks (#59–#73): embedded checkout build/test/cutover (#59–62),
content calendar scheduling (#63), story sequences→ManyChat (#64), legal/T&C +
Habeas Data consent (#65–66), payment support SLA (#67), anti-chargeback hygiene
(#68), onboarding anti-refund (#69), backups/SPOF + 2FA (#70), paid/organic split
measurement (#71), WhatsApp official-API confirmation (#72), quiz-abandoner
retargeting (#73).

---

## 3. Data model additions (additive migrations only)

### 3.1 `launch_ops.content_item` — Calendario (NEW)

Generic, creator-agnostic content plan. One row = one planned content unit.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| launch_id | uuid FK→launch | cascade |
| phase_id | uuid FK→phase | nullable |
| day | date | nullable (some rows are ranges/narratives) |
| day_label | text | e.g. "Sáb 6" |
| channel | text | "IG Orgánico","Email","WA Grupos","WA Bot","ManyChat","Paid","Webinar" |
| kind | text CHECK | `reel \| story \| email \| message \| sequence \| matrix_row \| milestone` |
| stage_label | text | e.g. "PRE","$67","$77","$87","CIERRE" |
| title | text | hook / angle / sequence name |
| body | text | stories note / narrative / matrix cell |
| status | text | default `planned` (`planned\|ready\|published`) |
| position | int | ordering |

RLS via `can_read_launch` / `can_write_launch`. Models the day-by-day IG table,
the master channel×phase matrix (`kind=matrix_row`), the email/WA/ManyChat/Paid/
Webinar narratives (`kind=message`), and the 6 story sequences (`kind=sequence`).

### 3.2 `launch_ops.message_asset` — Mensajes (NEW)

Copy assets per strategy with production status + where they live + linked tasks.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| launch_id | uuid FK→launch | cascade |
| key | text | stable id; UNIQUE(launch_id,key) |
| title | text | e.g. "Guion de la masterclass (15 partes)" |
| channel | text | grouping |
| status | text CHECK | `ready \| todo` (✅ listo / ⏳) |
| file_path | text | e.g. `03-launch/cohort-2/DI21-C2-Webinar-Guion.md` |
| summary | text | one-paragraph description |
| task_refs | int[] | source_index references into tasks |
| position | int | |

RLS via launch helpers.

### 3.3 RBAC additions in `backoffice` (NEW, additive)

- `backoffice.afluence_membership` → add column `ops_role text` (nullable;
  fallback derived: admin/director→`admin`, member→`viewer`). CHECK in
  (`agnostico`,`admin`,`organico`,`paid`,`support`,`comunidad`,`creator`,`viewer`).
- `backoffice.role_module_grant(role text, module_id text, primary key(role,module_id))`
  — which modules each ops role can view. Seeded from the HTML `ROLES` map.
- `backoffice.tenant` → add column `enabled_modules jsonb default '["campaigns"]'`
  — per-tenant module catalog (migrates the static `ENABLED` map into data).
- Helper fns: `backoffice.current_ops_role()` (resolves the caller's ops_role),
  `backoffice.can_see_module(p_role, p_module)`.

> All additive: new columns are nullable/defaulted; existing RLS + `is_afluence*`
> semantics are untouched (admin/director still satisfy `is_afluence_admin`).

---

## 4. RBAC architecture (Usuarios + Configuración)

Replaces the HTML's localStorage role logic with a backoffice-backed model.

```
auth.users → backoffice.profile (user_kind=afluence)
                 └─ afluence_membership.ops_role ∈ {agnostico,admin,organico,paid,support,comunidad,creator,viewer}
backoffice.role_module_grant(role, module_id)  → which modules a role sees
backoffice.tenant.enabled_modules              → which modules exist for a tenant
```

**Resolution (server-side, new `lib/backoffice/session.ts`):**
1. `getSupabaseServer().auth.getUser()` → user id.
2. Read own `profile` + `afluence_membership.ops_role` (RLS allows self-read).
3. `visibleModules(tenant) = enabled_modules(tenant) ∩ role_module_grant(ops_role)`;
   `agnostico`/`admin` ⇒ all enabled modules.
4. Sidebar + page guards use this. "Ver como rol" = staff preview (admin only),
   never escalates real permissions (server enforces real `ops_role`).

**Usuarios module**: admin assigns `ops_role` per `afluence_membership` row.
**Configuración module**: admin edits `role_module_grant` (the matrix). Reset =
re-seed defaults.

Backwards-compatible: until staff rows exist, default behavior = current (all
logged-in users are treated as `agnostico` ⇒ see everything). No regression.

---

## 5. Re-seed strategy (58 → 73, no clobber)

The current seed guard skips ALL task inserts if any task exists (protects live
status). To add #59–73 without clobbering #1–58:

1. Repoint `gen-launch-ops-seed.mjs` to the present file
   (`DI21-C2-Centro-Operaciones copy.html`) and regenerate.
2. Change task insertion to **per-row upsert by `(launch_id, source_index)`**:
   - INSERT new source_indexes (59–73) with steps/owners/deps.
   - For existing rows: `ON CONFLICT (launch_id, source_index) DO UPDATE` only the
     **static** fields (title, objective, definition_of_done, channel, workstream,
     due_*) — **never** status/progress/version/updated_by. Steps/owners rebuilt
     only for newly inserted tasks.
3. Extend the generator to also emit `content_item` + `message_asset` seeds parsed
   from the HTML's Calendario + Mensajes sections.
4. Phases: names refreshed via existing ON CONFLICT (already safe).

Validation: task count 58→73; F-phase counts match; status/progress of #1–58
unchanged (snapshot before/after).

---

## 6. Phased execution plan (modular, each phase shippable)

| Phase | Scope | Risk | Ship |
|-------|-------|------|------|
| **P1 — Data + reseed** | Migrations (`content_item`, `message_asset`, RBAC cols/tables) + reseed to 73 + seed calendar/messages | Low (additive) | DB only, no UI change |
| **P2 — Centro UI** | Sidebar layout; add Calendario + Mensajes tabs; enrich Resumen (matrix) + Tareas (deps, steps) | Med (UI) | `/launch` becomes Centro de Operaciones |
| **P3 — RBAC UI** | `getBackofficeSession`; role-aware sidebar; Usuarios + Configuración modules; page guards | Med | Real per-role access |
| **P4 — Polish + agent + docs** | Agent API for content/messages (optional), deep QA, deploy | Low | Production |

Each phase: typecheck + build + (where relevant) authenticated SSR render +
prod read validation, then commit/PR/merge to main.

---

## 7. Validation & success criteria

**Build gates:** `typecheck` + `build` green after every phase.

**Data gates (P1):**
- `launch_ops.task` count = 73 for DI21-C2; phase distribution matches HTML.
- `content_item` ≥ (IG day rows + matrix rows + narratives + 6 sequences).
- `message_asset` = 12 (the HTML's Mensajes blocks).
- Snapshot diff: status/progress of pre-existing tasks unchanged.
- RLS: `authenticated` can SELECT, only service_role/`can_write_launch` can write.

**Runtime gates:**
- Authenticated SSR 200 for `/german-roz/main/launch` with all modules.
- Calendario renders the day-by-day plan; Mensajes renders 12 assets with status.
- Role preview: `organico`/`paid` hide Usuarios/Configuración/Enlaces but see
  Calendario+Mensajes; `support` swaps Calendario for Enlaces; `comunidad`/`creator`
  see Resumen/Tareas/Calendario/Mensajes; `viewer` sees only Resumen/KPIs;
  `agnostico`/`admin` see all.
- Regression: `/german-roz/di21` campaigns + `/bukku/main/responses` still 200.

**Non-goals (for now):** editing calendar/messages from the UI (read-first;
mutations can come later), creator self-signup, full audit UI.

---

## 8. Hypotheses validated (no-code phase)

| Hypothesis | Verdict |
|------------|---------|
| `task` already supports channel/type/deps → no task schema change needed | ✅ confirmed (only re-seed) |
| Calendar + Messages need their own tables (not shoehorned into resource/task) | ✅ confirmed — distinct shapes |
| RBAC can reuse `backoffice` without breaking RLS | ✅ additive cols + grant table |
| Reseed can be additive without clobbering live status | ✅ via upsert-by-source_index |
| `marketing` schema already exposed to PostgREST; `launch_ops`/`backoffice` too | ✅ (done earlier) |
| Sidebar can replace ModuleTabBar inside the launch view without touching campaigns/responses | ✅ scoped to launch view |

---

## 9. Taxonomy refresh — DI21-C2 v2 (owners + roles)

The DI21-C2 doc evolved the team model from a generic split into launch-specific
roles. Applied additively (`20260609000200_centro_ops_roles.sql`) + re-seed.

**Ops roles** (`afluence_membership.ops_role` + `role_module_grant`):

| Role | Modules (besides Resumen) |
|------|---------------------------|
| `agnostico` / `admin` | all (`*`) |
| `organico` | KPIs, Tareas, Gantt, Calendario, Mensajes |
| `paid` | KPIs, Tareas, Gantt, Calendario, Mensajes |
| `support` | Tareas, Gantt, Enlaces, Mensajes |
| `comunidad` | Tareas, Calendario, Mensajes |
| `creator` | Tareas, Calendario, Mensajes |
| `viewer` | KPIs |

**Owner keys** (`task_owner.owner_key`, `OWNER_LABELS`): the old `mau` split into
`maua` (Mau A. · Paid) and `maus` (Mau S. · Support); `nico→Nico J.`,
`tomas→Tomás H.`; `german`/`elba` unchanged. Owners are seed-derived metadata and
are rebuilt on every re-seed (delete+reinsert) so reassignments propagate without
touching task `status`/`progress`/`version`.

**Staff roster** (`backoffice.profile` + `afluence_membership`): Cristóbal (admin),
Nico J. (admin), Tomás Hanna (organico), Mau A. (paid), Mau S. (support),
Germán (creator), Elba (comunidad).

---

## 10. UI refactor — sectioned sidebar (DEV-BRIEF §4.A)

Replaced the flat tab strip inside the launch view with a **sectioned sidebar**
that mirrors the validated reference design (`docs/DI21-C2-Centro-Operaciones.html`)
using the admin's dark design tokens (no light-theme leakage). Strangler-fig:
only the launch view's navigation/shell changed; panes, RBAC, repository, page
props and the BU-level `ModuleTabBar` are untouched.

**New files:**
- `apps/admin/src/lib/launch-ops/navigation.ts` — `SECTION_ORDER` (6 sections),
  `MODULE_SECTION`, `MODULE_ICON`, and `groupModulesBySection(visible)` (drops
  empty sections, preserves `MODULE_IDS` order). Agnostic; no launch-specific copy.
- `apps/admin/src/components/launch-ops/launch-ops-sidebar.tsx` — sidebar
  (brand + "Ver como rol" selector + grouped nav items) and the mobile drawer
  backdrop.

**Sections → modules** (icons): Vista general (resumen 🏠) · Estadísticas
(kpis 📊) · Project Management (tareas ✅, gantt 📆) · Marketing (calendario 🗓️,
mensajes 💬) · Operaciones (enlaces 🔗) · Administración (usuarios 👤, config ⚙️).

**Role-aware:** sidebar renders `modulesForRole(effectiveRole, grants)` grouped by
section; a section appears only if it has visible modules. `active` module falls
back to the first visible one when the selected one is filtered out (e.g. after a
preview-role change).

**Responsive:** desktop `grid: 248px | 1fr` sticky sidebar; ≤860px off-canvas
drawer (`.launch-sidebar.open`) toggled by `☰ Módulos`, with a backdrop that is
`display:none` by default and shown via `.show` (reference bug fix — never
occupies a grid column). Styles live in `globals.css` under `.launch-*`.
