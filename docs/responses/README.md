# Responses module (`apps/admin` → Respuestas)

Back-office module that surfaces landing **responses** (waitlists, quizzes,
surveys, diagnostics) for creators whose intake lives **outside** the main CRM
(`marketing.leads`). It unifies the per-creator panels that previously only
existed in `apps/web` into the modular admin.

## Design (surgical, zero new tables)

The data already exists in the `marketing` schema, written by the live web/api
intake. This module is **read-only** over those tables — it never alters them,
never touches `apps/web` or `apps/api`, and adds **no migrations**.

```
/[organizer]/[bu]/responses (RSC, force-dynamic)
  → getResponsesForTenant(organizer, bu)        // lib/responses/repository.ts
      → sourcesForTenant()                       // lib/responses/sources.ts
      → getSupabaseMarketing() (service-role)    // reads marketing.<table>
      → generic flatten (top-level + jsonb + utm_)
  → <ResponsesView/>  (client: tabs, stats, search, status filter, CSV, detail)
```

### Files

| File | Role |
|------|------|
| `apps/admin/src/lib/responses/types.ts` | Domain types (`ResponseRecord`, `ResponseSource`, …) — DB-agnostic |
| `apps/admin/src/lib/responses/sources.ts` | **Only creator-specific code**: source registry + `TENANT_SOURCES` map |
| `apps/admin/src/lib/responses/repository.ts` | Read + generic flatten + stats |
| `apps/admin/src/app/[organizer]/[bu]/responses/page.tsx` | Server page |
| `apps/admin/src/components/responses/responses-view.tsx` | Client view |
| `apps/admin/src/lib/supabase/server.ts` | `getSupabaseMarketing()` (service-role, schema `marketing`) |
| `apps/admin/src/lib/modules/registry.ts` | Enables `responses` per tenant + `primaryPath()` |
| `apps/admin/src/lib/dashboard/bu-options.ts` | Merges responses-only tenants into the BU switcher |

## Configured sources (today)

| Tenant (`organizer/bu`) | Source | Table (`marketing`) | Rows (2026-06-08) |
|-------------------------|--------|---------------------|-------------------|
| `bukku/main` | Test de inglés | `bukku_leads` | ~876 |
| `mama-sin-caos/main` | Lista secreta | `mama_sin_caos_leads` | ~459 |
| `caro-fitness/main` | Diagnóstico | `caro_fitness_progress` | ~2061 (status: completed / in_progress / abandoned) |

These creators are **not** in `meta_ops` (no Meta campaigns dashboard); the
module resolves sources from its own config, independent of `meta_ops`.

## Capability contract (how a source varies)

A creator varies along three orthogonal axes, each an explicit descriptor on
`ResponseSource` (no loose optional flags). The engine switches on `kind` and
the compiler enforces every case.

| Axis | Type | Variants |
|------|------|----------|
| `storage` | where rows live | `{ kind: 'crm', table, orgId }` (shared `leads`, org-scoped) · `{ kind: 'dedicated', table }` |
| `progress` | what "progress" means | `{ kind: 'status', column, values }` (lifecycle, e.g. Caro) · `{ kind: 'landing', column, labels? }` (breakdown by landing) · `{ kind: 'none' }` |
| `shape` | how the row flattens | `{ jsonbColumns, utmColumn?, columns }` |

`progress` drives the stat cards (`buildResponseStats` is an exhaustive switch)
and the filter chips; `landing` also powers the sidebar "Campañas" selector.

## How the generic flatten works (`shape`)

Every row is normalized into `ResponseRecord`:
- top-level scalar columns → `fields[key]`
- `shape.jsonbColumns` (e.g. `custom_fields`, `answers`) → spread into `fields`
- `shape.utmColumn` (`utm_data`) → spread with `utm_` prefix
- `name`/`email`/`phone` lifted to first-class fields; `status` comes from
  `progress.column` when `progress.kind === 'status'`

The view shows `shape.columns` (ordered, labelled) and exposes every remaining
field in the per-row "Ver más" detail. No per-source mapping code. The
repository pages through with `range()` (PostgREST caps each response at ~1000
rows) so landing breakdowns reflect the full set, not just the latest 1000.

## Onboarding a new creator

1. Add a `ResponseSource` to `RESPONSE_SOURCES` in `lib/responses/sources.ts` —
   a pure declaration of `storage` + `progress` + `shape`.
2. Map its tenant in `TENANT_SOURCES`.
3. Enable `responses` for that tenant in `lib/modules/registry.ts` (`ENABLED`).

No migration, no DB change, no web/api change, no engine change. The tenant then
appears in the BU switcher and `/[organizer]/[bu]/responses` renders.

## Access / security

- Reads use the **service-role** client (RLS bypassed at the data layer); the
  route is protected by the admin session middleware (login required).
- The `marketing` schema is exposed to PostgREST (see
  `docs/launch-ops/08-operations.md`).
- Future: scope per-tenant visibility via `backoffice.tenant_membership` (the
  registry already anticipates a data-driven enablement source).

## Validation (2026-06-08)

- `npm run typecheck -w @marketing-funnel/admin` — green.
- `npm run build -w @marketing-funnel/admin` — green (`/[organizer]/[bu]/responses` compiled).
- Generic flatten verified against live rows for all three tables.
- Authenticated SSR render (real Supabase session) → **200** for
  `/bukku/main/responses`, `/caro-fitness/main/responses`,
  `/mama-sin-caos/main/responses`; rows + creator label + CSV export present.
- Regression check: `/german-roz/di21` campaigns dashboard still **200** after
  the `bu-options` merge.

## Non-goals (for now)

- No write-back / editing of responses (read-only surfacing).
- No server-side pagination (full set rendered; fine for current volumes).
- No XLSX export (CSV only; web panels keep their XLSX path).
