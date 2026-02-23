export interface RoutingDecision {
  funnelId: string;
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

export interface StepHandlerMap {
  [stepType: string]: (
    step: { id: string; config: Record<string, unknown> },
    lead: { id: string; email: string },
  ) => Promise<void>;
}

export interface OrgConfig {
  defaultLeadStatus: string;
  validStatuses: string[];
  timezone: string;
}
