/**
 * Domain types for the WhatsApp Groups admin module.
 *
 * A POOL is scoped by (orgKey, buKey, poolKey) and owns N GROUPS (invite links
 * rotated by capacity). A pool can be linked to a cohort via `launchCode`
 * (launch_ops.launch.code). The runtime rotation lives in the API; this module
 * only manages the pool config + group rows in the `marketing` schema.
 */

export type RotationMode = 'manual' | 'auto_count' | 'join_webhook';

export const ROTATION_MODES: RotationMode[] = ['auto_count', 'manual', 'join_webhook'];

export const ROTATION_MODE_LABELS: Record<RotationMode, string> = {
  auto_count: 'Automático por capacidad',
  manual: 'Manual (marcar lleno)',
  join_webhook: 'Por webhook de ingresos',
};

export interface WaGroup {
  id: string;
  poolId: string;
  label: string;
  inviteUrl: string;
  groupJid: string | null;
  position: number;
  assignedCount: number;
  memberCount: number;
  isFull: boolean;
  isActive: boolean;
}

export interface WaPool {
  id: string;
  orgKey: string;
  buKey: string;
  poolKey: string;
  label: string;
  launchCode: string | null;
  capacity: number;
  rotationMode: RotationMode;
  isActive: boolean;
  groups: WaGroup[];
  /** Sum of assigned_count across the pool's groups. */
  assignedTotal: number;
}

/** A cohort option for the pool ↔ launch linkage dropdown. */
export interface CohortOption {
  code: string;
  name: string;
}

export interface WaGroupsOverview {
  organizer: string;
  bu: string;
  /** Resolved scope actually used in the DB (bu may be aliased, e.g. di21→main). */
  orgKey: string;
  buKey: string;
  pools: WaPool[];
  cohorts: CohortOption[];
}
