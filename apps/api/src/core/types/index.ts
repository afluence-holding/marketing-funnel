// ─── Routing ─────────────────────────────────────────────────────────────────

export interface RoutingDecision {
  pipelineId: string;
  initialStageId: string;
  channel: 'inbound' | 'outbound';
}

export interface SourceInfo {
  type: string;
  id?: string;
  utmData?: Record<string, string>;
}

export type RoutingEngine = (
  lead: { id: string; email: string; organizationId: string },
  customFields: Record<string, string>,
  source: SourceInfo,
) => RoutingDecision[];

// ─── Org config ──────────────────────────────────────────────────────────────

export interface OrgConfig {
  defaultLeadStatus: string;
  validStatuses: string[];
  timezone: string;
}

// ─── Sequence definitions (code-first) ───────────────────────────────────────

// All text fields support {{lead_name}}, {{lead_email}}, {{lead_phone}} interpolation at runtime.

// -- WhatsApp step variants (matches WhatsAppSender methods) ------------------

export interface WhatsAppTextStep {
  type: 'send_whatsapp';
  messageType: 'text';
  body: string;
  previewUrl?: boolean;
}

export interface WhatsAppTemplateStep {
  type: 'send_whatsapp';
  messageType: 'template';
  templateName: string;
  language: string;
  bodyParams?: string[];
  buttonParams?: Array<{ index: number; type: 'url' | 'quick_reply' | 'phone_number' | 'copy_code'; text?: string }>;
}

export interface WhatsAppImageStep {
  type: 'send_whatsapp';
  messageType: 'image';
  imageUrl: string;
  caption?: string;
}

export interface WhatsAppVideoStep {
  type: 'send_whatsapp';
  messageType: 'video';
  videoUrl: string;
  caption?: string;
}

export interface WhatsAppDocumentStep {
  type: 'send_whatsapp';
  messageType: 'document';
  documentUrl: string;
  caption?: string;
  filename?: string;
}

export interface WhatsAppButtonsStep {
  type: 'send_whatsapp';
  messageType: 'buttons';
  bodyText: string;
  buttons: Array<{ id: string; title: string }>;
  headerText?: string;
  footerText?: string;
}

export interface WhatsAppListStep {
  type: 'send_whatsapp';
  messageType: 'list';
  bodyText: string;
  buttonText: string;
  sections: Array<{
    title?: string;
    items: Array<{ id: string; title: string; description?: string }>;
  }>;
  headerText?: string;
  footerText?: string;
}

export type WhatsAppStep =
  | WhatsAppTextStep
  | WhatsAppTemplateStep
  | WhatsAppImageStep
  | WhatsAppVideoStep
  | WhatsAppDocumentStep
  | WhatsAppButtonsStep
  | WhatsAppListStep;

// -- Email step ---------------------------------------------------------------

export interface SendEmailStep {
  type: 'send_email';
  templateId: string;
  subject: string;
  data?: Record<string, string>;
}

// -- AI call step -------------------------------------------------------------

export interface AiCallStep {
  type: 'ai_call';
  agentId: string;
  firstMessage?: string;
  dynamicVariables?: Record<string, string>;
}

// -- Wait step ----------------------------------------------------------------

export interface WaitStep {
  type: 'wait';
  hours?: number;
  minutes?: number;
}

// -- Manual task step ---------------------------------------------------------

export interface ManualTaskStep {
  type: 'manual_task';
  description: string;
  assignee?: string;
}

// -- Union --------------------------------------------------------------------

export type SequenceStepDef =
  | WhatsAppStep
  | SendEmailStep
  | AiCallStep
  | WaitStep
  | ManualTaskStep;

export type SequenceStepType = SequenceStepDef['type'];

export interface SequenceDef {
  key: string;
  name: string;
  steps: SequenceStepDef[];
}

// ─── Workflow definitions (code-first) ───────────────────────────────────────

export type WorkflowEventType =
  | 'lead_created'
  | 'lead_updated'
  | 'stage_entered'
  | 'stage_exited'
  | 'status_changed'
  | 'sequence_step_completed'
  | 'sequence_completed'
  | 'call_completed'
  | 'call_failed';

export interface WorkflowTrigger {
  event: WorkflowEventType;
  conditions?: Record<string, unknown>;
}

export type WorkflowActionType =
  | 'move_stage'
  | 'update_status'
  | 'enroll_sequence'
  | 'unenroll_sequence'
  | 'log'
  | 'notify';

export interface WorkflowActionDef {
  type: WorkflowActionType;
  [key: string]: unknown;
}

export interface WorkflowDef {
  key: string;
  name: string;
  trigger: WorkflowTrigger;
  actions: WorkflowActionDef[];
}

// ─── Pipeline events (runtime) ───────────────────────────────────────────────

export interface PipelineEvent {
  type: WorkflowEventType;
  organizationId: string;
  leadId: string;
  pipelineEntryId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// ─── Step handler signature ──────────────────────────────────────────────────

export interface StepLeadContext {
  id: string;
  email: string;
  phone?: string;
  organizationId: string;
  firstName?: string;
  lastName?: string;
}

export interface StepEnrollmentContext {
  id: string;
  pipelineEntryId?: string;
}

export type StepHandler = (
  step: SequenceStepDef,
  lead: StepLeadContext,
  enrollment: StepEnrollmentContext,
) => Promise<{ delayMs?: number }>;

export type StepHandlerMap = Record<string, StepHandler>;

// ─── Action handler signature ────────────────────────────────────────────────

export type ActionHandler = (
  action: WorkflowActionDef,
  event: PipelineEvent,
) => Promise<void>;

export type ActionHandlerMap = Record<WorkflowActionType, ActionHandler>;
