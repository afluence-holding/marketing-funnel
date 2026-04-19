import { z } from 'zod';

export const MatchStrategy = z.enum(['ad_account', 'prefix', 'campaign_ids']);
export type MatchStrategy = z.infer<typeof MatchStrategy>;

export const EntityType = z.enum(['campaign', 'adset', 'ad']);
export type EntityType = z.infer<typeof EntityType>;

export const InsightsTier = z.enum(['today', 'recent', 'mid', 'historical']);
export type InsightsTier = z.infer<typeof InsightsTier>;

export const JobType = z.enum(['today', 'recent', 'mid', 'historical', 'token-health']);
export type JobType = z.infer<typeof JobType>;

export const AttributionWindow = z.enum(['1d_click', '7d_click', '1d_view', '7d_click_1d_view']);
export type AttributionWindow = z.infer<typeof AttributionWindow>;

export const BusinessUnitConfig = z.object({
  match_strategy: MatchStrategy,
  campaign_name_prefix: z.string().optional(),
  campaign_ids: z.array(z.string()).optional(),
  attribution_window: AttributionWindow.default('7d_click_1d_view'),
});
export type BusinessUnitConfig = z.infer<typeof BusinessUnitConfig>;

export const KpiTargets = z.object({
  target_cpa: z.number().nonnegative().optional(),
  target_roas: z.number().nonnegative().optional(),
  revenue_per_conv: z.number().nonnegative().optional(),
});
export type KpiTargets = z.infer<typeof KpiTargets>;

/** Shape of rows we read from meta_ops.business_units. */
export interface BusinessUnitRow {
  id: string;
  organizer_id: string;
  slug: string;
  name: string;
  config: BusinessUnitConfig;
  kpi_targets: KpiTargets;
}

export interface OrganizerRow {
  id: string;
  slug: string;
  name: string;
  ad_account_id: string | null;
  encrypted_token: string | null;
  token_expires_at: string | null;
}

/** One insight row ready for upsert into meta_ops.meta_insights. */
export interface InsightRow {
  entity_id: string;
  date: string;
  tier: InsightsTier;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  purchases: number;
  purchase_value: number;
}
