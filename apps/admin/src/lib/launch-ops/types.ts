/**
 * Launch Ops — domain types (agnostic, decoupled from the DB row shape).
 *
 * These are the contracts the UI and API speak. The repository maps raw
 * launch_ops.* rows into these types so nothing downstream depends on the
 * physical schema.
 */

export type TaskStatus = 'todo' | 'doing' | 'blocked' | 'done';
export type Workstream = 'organico' | 'inorganico' | 'infra';
export type ActorType = 'human' | 'agent' | 'system';
export type ResourceStatus = 'pending' | 'ready';

export interface Phase {
  id: string;
  code: string; // F0..F5
  name: string;
  position: number;
}

export interface TaskOwner {
  ownerKey: string;
  profileId: string | null;
}

export interface TaskStep {
  id: string;
  position: number;
  body: string;
  done: boolean;
}

export interface TaskDependency {
  id: string;
  dependsOnTaskId: string | null;
  dependsOnSourceIndex: number | null;
  note: string | null;
}

export interface Task {
  id: string;
  launchId: string;
  phaseId: string;
  phaseCode: string;
  sourceIndex: number | null;
  title: string;
  objective: string | null;
  definitionOfDone: string | null;
  channel: string | null;
  workstream: Workstream | null;
  dueLabel: string | null;
  dueStart: string | null;
  dueEnd: string | null;
  status: TaskStatus;
  progressPct: number;
  position: number;
  version: number;
  owners: TaskOwner[];
  steps: TaskStep[];
  dependencies: TaskDependency[];
  updatedBy: string | null;
  updatedAt: string;
}

export interface Kpi {
  id: string;
  key: string;
  label: string;
  targetLabel: string | null;
  value: number | null;
  unit: string | null;
  isComputed: boolean;
  formula: string | null;
  position: number;
}

export interface Resource {
  id: string;
  category: string;
  key: string;
  label: string;
  ownerKey: string | null;
  url: string | null;
  status: ResourceStatus;
  position: number;
}

export type ContentKind =
  | 'reel'
  | 'story'
  | 'email'
  | 'message'
  | 'sequence'
  | 'matrix_row'
  | 'milestone';

export interface ContentItem {
  id: string;
  kind: ContentKind;
  channel: string | null;
  day: string | null;
  dayLabel: string | null;
  stageLabel: string | null;
  title: string;
  body: string | null;
  status: string;
  position: number;
}

export interface MessageAsset {
  id: string;
  key: string;
  title: string;
  channel: string | null;
  status: 'ready' | 'todo';
  filePath: string | null;
  summary: string | null;
  taskRefs: number[];
  position: number;
}

export interface Launch {
  id: string;
  code: string;
  name: string;
  brand: string | null;
  organizerSlug: string | null;
  buSlug: string | null;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
  config: Record<string, unknown>;
}

export interface PhaseProgress {
  phaseCode: string;
  total: number;
  done: number;
  pct: number;
}

export interface LaunchOverview {
  launch: Launch;
  phases: Phase[];
  tasks: Task[];
  kpis: Kpi[];
  resources: Resource[];
  content: ContentItem[];
  messages: MessageAsset[];
  progress: {
    overallPct: number;
    totalTasks: number;
    doneTasks: number;
    byPhase: PhaseProgress[];
  };
}

/** Owner display registry — agnostic fallback if no profile linked. */
export const OWNER_LABELS: Record<string, string> = {
  nico: 'Nico',
  mau: 'Mau',
  german: 'Germán',
  tomas: 'Tomás',
  elba: 'Elba',
};

export const WORKSTREAM_LABELS: Record<Workstream, string> = {
  organico: 'Orgánico',
  inorganico: 'Inorgánico',
  infra: 'Infra',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Pendiente',
  doing: 'En curso',
  blocked: 'Bloqueada',
  done: 'Lista',
};
