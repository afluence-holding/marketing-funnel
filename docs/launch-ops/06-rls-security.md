# 06 · RLS & Security

## Model

Every `launch_ops` table has RLS **from migration 1**. Access is gated through
the launch's tenant, using `SECURITY DEFINER` helper functions in `backoffice`:

- **Read**: `can_read_launch(launch_id)` → tenant-null launches readable by staff
  (`is_afluence()`), tenant launches readable by `can_read_tenant()`.
- **Write**: `can_write_launch(launch_id)` → staff admins, or members with the
  `launch` module enabled and an `owner`/`editor` role.
- Grand-children (steps/owners/deps/history/comments) gate through their task →
  launch.
- `audit_log` / `idempotency_key` are staff-readable only.

`service_role` bypasses RLS (Supabase default) — that's how the admin reads today.
RLS therefore protects two future/secondary planes: the **agent** and any
**creator** logins.

## Why SECURITY DEFINER

If a policy on `launch_ops.task` queried `tenant_membership` directly and that
table also has RLS, you'd get recursive RLS / "no rows → deny". The helper
functions run `SECURITY DEFINER` with a pinned `search_path` so membership checks
are evaluated with controlled privileges and consistent results. They are
`REVOKE … FROM PUBLIC` + `GRANT EXECUTE TO authenticated, service_role`.

Best-practices honored (Supabase 2025–2026):
- `auth.uid()` based checks (no `user_metadata`, which is user-editable).
- roles/permissions live in tables (`afluence_membership`, `tenant_membership`),
  not JWT metadata.
- columns used in policies are indexed (`tenant_membership(user_id,tenant_id)`).

## The ordering constraint (do not open a leak window)

The wider repo's `meta_ops` RLS is permissive (`USING (true)`) and the admin reads
with `service_role`. **Launch Ops does not change that** — but it means:

> **Never create a Creator login until `meta_ops` RLS is tightened and all staff
> are seeded into `backoffice`.** Otherwise a creator session could read other
> clients' campaigns via the anon Supabase client.

Launch Ops itself is safe to ship now because:
- it has correct tenant RLS from day 1, and
- no creator logins exist yet, and staff use `service_role`.

When creators are introduced, follow the sequence in the consolidated plan
(tighten `meta_ops`, seed staff, add guards) **before** `inviteUserByEmail`.

## Agent blast radius

- Authenticates with a **scoped Bearer token**, never `service_role`.
- Scope-checked per route; a leaked token can only do what its scopes allow.
- **No delete** scope; **no create** of launches/phases/tasks via API.
- All mutations are audited (`audit_log`) and status changes are historized
  (`status_history`, `actor_type='agent'`).
- Optimistic locking (`If-Match`) prevents lost updates; idempotency prevents
  duplicate effects on retry.

### v1 hardening (documented, not required for MVP)
1. Replace the env bootstrap token with `service_identity` rows (hashed, rotatable).
2. Give the agent a dedicated Postgres role `agent_writer` with `GRANT`s limited
   to `launch_ops`, and a separate connection (`AGENT_DATABASE_URL`) — so the DB,
   not just the app, enforces least privilege.
3. Move human reads to a session/RLS-aware client.
4. Add a lint rule forbidding `service_role`/`DATABASE_URL` imports in agent modules.

## PII / share links (future)
If creator share links (no login) are added, reads must go through a
`SECURITY DEFINER` RPC with a column allowlist + `hide_pii`, validated by token
hash + expiry + revoke — never by handing the anon key a token. (Not in this MVP.)

## Threat checklist

| Vector | Mitigation (this MVP) |
|--------|------------------------|
| Stolen agent token | scopes limit blast radius; rotate via env or `service_identity.active=false` |
| Lost update race | `version` + `If-Match` → 409 |
| Duplicate retry | `Idempotency-Key` store |
| Prompt injection → destructive action | no delete/create scope; status enum validated |
| Creator cross-tenant read | RLS via `can_read_launch`; **gated** by the ordering constraint above |
| Seed re-run clobber | guarded: tasks seeded only when launch has none |
