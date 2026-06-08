/**
 * Backoffice session resolver (server-only).
 *
 * Resolves the current logged-in user's ops role and the role→module grant
 * matrix. Reuses the existing backoffice schema; un-onboarded users default to
 * `agnostico` (sees everything) so nothing regresses before staff are seeded.
 */
import 'server-only';
import { getSupabaseServer, getSupabaseBackoffice } from '@/lib/supabase/server';
import { type OpsRole, isSuperRole } from './rbac';

export interface OpsSession {
  userId: string;
  email: string | null;
  opsRole: OpsRole;
  /** sees everything + can manage roles/permissions */
  canManage: boolean;
  /** role -> module ids (e.g. { marketing: ['resumen','kpis',...], admin: ['*'] }) */
  grants: Record<string, string[]>;
}

const VALID_ROLES = new Set<OpsRole>([
  'agnostico',
  'admin',
  'organico',
  'paid',
  'support',
  'comunidad',
  'creator',
  'viewer',
]);

function deriveRole(row: { role?: string | null; ops_role?: string | null } | null): OpsRole {
  if (row?.ops_role && VALID_ROLES.has(row.ops_role as OpsRole)) return row.ops_role as OpsRole;
  if (row?.role) return row.role === 'admin' || row.role === 'director' ? 'admin' : 'viewer';
  return 'agnostico';
}

export async function getOpsSession(): Promise<OpsSession | null> {
  const supa = await getSupabaseServer();
  const { data } = await supa.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const bo = getSupabaseBackoffice();
  const [memRes, grantRes] = await Promise.all([
    bo.from('afluence_membership').select('role, ops_role').eq('user_id', user.id).maybeSingle(),
    bo.from('role_module_grant').select('role, module_id'),
  ]);

  const opsRole = deriveRole((memRes.data as { role?: string; ops_role?: string } | null) ?? null);

  const grants: Record<string, string[]> = {};
  for (const g of (grantRes.data ?? []) as Array<{ role: string; module_id: string }>) {
    (grants[g.role] ??= []).push(g.module_id);
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    opsRole,
    canManage: isSuperRole(opsRole),
    grants,
  };
}
