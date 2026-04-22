import { supabaseAdminForSchema } from '@marketing-funnel/db';
import type { BusinessUnitConfig, KpiTargets, MatchStrategy } from '@marketing-funnel/meta-ads';

export interface AggregatedMetrics {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  purchases: number;
  purchase_value: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  roas: number;
  frequency: number;
}

export interface EntityMetrics extends AggregatedMetrics {
  entity_id: string;
  name: string;
}

export interface DashboardData {
  bu: {
    organizer_slug: string;
    bu_slug: string;
    name: string;
    match_strategy: MatchStrategy;
    kpi_targets: KpiTargets;
  };
  since: string;
  until: string;
  totals: AggregatedMetrics;
  byCampaign: EntityMetrics[];
  /** true when the BU matched campaigns exist in marketing_ops.campaigns. */
  hasData: boolean;
}

function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function emptyMetrics(): AggregatedMetrics {
  return {
    spend: 0, impressions: 0, reach: 0, clicks: 0, leads: 0,
    purchases: 0, purchase_value: 0,
    ctr: 0, cpc: 0, cpm: 0, cpa: 0, roas: 0, frequency: 0,
  };
}

function computeRatios(m: AggregatedMetrics): AggregatedMetrics {
  return {
    ...m,
    ctr: m.impressions > 0 ? m.clicks / m.impressions : 0,
    cpc: m.clicks > 0 ? m.spend / m.clicks : 0,
    cpm: m.impressions > 0 ? (m.spend * 1000) / m.impressions : 0,
    cpa: m.purchases > 0 ? m.spend / m.purchases : 0,
    roas: m.spend > 0 ? m.purchase_value / m.spend : 0,
    frequency: m.reach > 0 ? m.impressions / m.reach : 0,
  };
}

function accumulate(target: AggregatedMetrics, row: { spend?: number | null; impressions?: number | null; reach?: number | null; clicks?: number | null; leads?: number | null; purchases?: number | null; purchase_value?: number | null }) {
  target.spend += Number(row.spend ?? 0);
  target.impressions += Number(row.impressions ?? 0);
  target.reach += Number(row.reach ?? 0);
  target.clicks += Number(row.clicks ?? 0);
  target.leads += Number(row.leads ?? 0);
  target.purchases += Number(row.purchases ?? 0);
  target.purchase_value += Number(row.purchase_value ?? 0);
}

/**
 * Load dashboard data for a given organizer/BU.
 *
 * Fase 1: reads marketing_ops.metrics_daily, resolves campaign IDs via
 * marketing_ops.campaigns according to the BU's match_strategy.
 * Fase 2 will switch to meta_ops.v_bu_daily_rollup.
 */
export async function loadDashboardData(params: {
  organizerSlug: string;
  buSlug: string;
  daysBack?: number;
}): Promise<DashboardData> {
  const daysBack = params.daysBack ?? 7;
  const now = new Date();
  const since = toYmd(new Date(now.getTime() - daysBack * 86_400_000));
  const until = toYmd(now);

  const metaOps = supabaseAdminForSchema('meta_ops');
  const mkt = supabaseAdminForSchema('marketing_ops');

  // 1. Load BU + config.
  const { data: orgRow } = await metaOps
    .from('organizers')
    .select('id, slug, ad_account_id')
    .eq('slug', params.organizerSlug)
    .single();
  if (!orgRow) throw new Error(`Organizer not found: ${params.organizerSlug}`);

  const { data: buRow } = await metaOps
    .from('business_units')
    .select('id, slug, name, config, kpi_targets')
    .eq('organizer_id', orgRow.id)
    .eq('slug', params.buSlug)
    .single();
  if (!buRow) throw new Error(`BU not found: ${params.organizerSlug}/${params.buSlug}`);

  const config = buRow.config as BusinessUnitConfig;
  const kpiTargets = (buRow.kpi_targets ?? {}) as KpiTargets;

  // 2. Resolve campaign IDs from marketing_ops.campaigns.
  let campaignIds: string[] = [];
  let campaignsById = new Map<string, string>();

  if (config.match_strategy === 'campaign_ids') {
    campaignIds = config.campaign_ids ?? [];
    const { data: rows } = await mkt
      .from('campaigns')
      .select('id, name')
      .in('id', campaignIds.length > 0 ? campaignIds : ['__none__']);
    for (const r of rows ?? []) campaignsById.set(r.id as string, r.name as string);
  } else if (config.match_strategy === 'prefix') {
    const prefix = config.campaign_name_prefix ?? '';
    if (prefix) {
      const { data: rows } = await mkt
        .from('campaigns')
        .select('id, name')
        .ilike('name', `${prefix}%`);
      for (const r of rows ?? []) {
        campaignsById.set(r.id as string, r.name as string);
        campaignIds.push(r.id as string);
      }
    }
  } else if (config.match_strategy === 'ad_account') {
    if (orgRow.ad_account_id) {
      const { data: rows } = await mkt
        .from('campaigns')
        .select('id, name')
        .eq('account_id', orgRow.ad_account_id);
      for (const r of rows ?? []) {
        campaignsById.set(r.id as string, r.name as string);
        campaignIds.push(r.id as string);
      }
    }
  }

  const hasData = campaignIds.length > 0;

  // 3. Aggregate metrics.
  const totals = emptyMetrics();
  const byCampaign = new Map<string, AggregatedMetrics>();

  if (hasData) {
    const { data: metrics } = await mkt
      .from('metrics_daily')
      .select('entity_id, date, spend, impressions, reach, clicks, leads, purchases, purchase_value')
      .eq('entity_type', 'campaign')
      .in('entity_id', campaignIds)
      .gte('date', since)
      .lte('date', until);

    for (const row of metrics ?? []) {
      accumulate(totals, row);
      const id = row.entity_id as string;
      if (!byCampaign.has(id)) byCampaign.set(id, emptyMetrics());
      accumulate(byCampaign.get(id)!, row);
    }
  }

  const byCampaignArr: EntityMetrics[] = Array.from(byCampaign.entries()).map(([id, m]) => ({
    entity_id: id,
    name: campaignsById.get(id) ?? id,
    ...computeRatios(m),
  })).sort((a, b) => b.spend - a.spend);

  return {
    bu: {
      organizer_slug: params.organizerSlug,
      bu_slug: params.buSlug,
      name: buRow.name as string,
      match_strategy: config.match_strategy,
      kpi_targets: kpiTargets,
    },
    since,
    until,
    totals: computeRatios(totals),
    byCampaign: byCampaignArr,
    hasData,
  };
}
