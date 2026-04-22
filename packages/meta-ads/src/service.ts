import type { SupabaseClient } from '@supabase/supabase-js';

/** Accepts any schema-scoped client (avoids 'public' schema literal coupling). */
type AnySupabaseClient = SupabaseClient<any, string, string, any, any>;
import { metaGraphFetchPaginated } from './client';
import { decryptToken } from './crypto';
import { classifyTier } from './tier';
import type { BusinessUnitRow, EntityType, InsightRow, InsightsTier, OrganizerRow } from './types';
import { BusinessUnitConfig, KpiTargets } from './types';

/** Raw insight row returned by Meta's /insights endpoint. Numbers are strings. */
interface RawInsightRow {
  date_start: string;
  date_stop?: string;
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id: string;
  campaign_name: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
}

interface RawCampaignRow {
  id: string;
  name: string;
  status?: string;
  effective_status?: string;
}

function toNumber(v: string | undefined): number {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sumActions(actions: Array<{ action_type: string; value: string }> | undefined, types: string[]): number {
  if (!actions) return 0;
  return actions.filter((a) => types.includes(a.action_type)).reduce((sum, a) => sum + toNumber(a.value), 0);
}

// Action types treated as leads / purchases. Kept broad because Meta's taxonomy varies.
const LEAD_ACTIONS = ['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead'];
const PURCHASE_ACTIONS = ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase'];

/** Load a BU + its organizer + decrypted token. */
export async function loadBuAndToken(
  supabase: AnySupabaseClient,
  organizerSlug: string,
  buSlug: string,
  masterKey: string,
): Promise<{ bu: BusinessUnitRow; organizer: OrganizerRow; accessToken: string }> {
  const { data: organizer, error: oErr } = await supabase
    .from('organizers')
    .select('id, slug, name, ad_account_id, encrypted_token, token_expires_at')
    .eq('slug', organizerSlug)
    .single();
  if (oErr || !organizer) throw new Error(`Organizer not found: ${organizerSlug}`);

  const { data: bu, error: bErr } = await supabase
    .from('business_units')
    .select('id, organizer_id, slug, name, config, kpi_targets')
    .eq('organizer_id', organizer.id)
    .eq('slug', buSlug)
    .single();
  if (bErr || !bu) throw new Error(`Business unit not found: ${organizerSlug}/${buSlug}`);

  if (!organizer.encrypted_token) {
    throw new Error(`Organizer ${organizerSlug} has no encrypted_token. Run encrypt-token.ts first.`);
  }
  const accessToken = decryptToken(organizer.encrypted_token, masterKey);

  return {
    bu: {
      ...bu,
      config: BusinessUnitConfig.parse(bu.config),
      kpi_targets: KpiTargets.parse(bu.kpi_targets),
    },
    organizer: organizer as OrganizerRow,
    accessToken,
  };
}

/**
 * Resolve which Meta campaign IDs belong to a BU (Case B):
 *   ad_account   → every campaign under organizer.ad_account_id
 *   prefix       → campaigns whose name starts with config.campaign_name_prefix
 *   campaign_ids → exactly the list in config.campaign_ids
 */
export async function resolveBuCampaigns(
  accessToken: string,
  bu: BusinessUnitRow,
  organizer: OrganizerRow,
): Promise<RawCampaignRow[]> {
  const { match_strategy } = bu.config;

  if (match_strategy === 'campaign_ids') {
    const ids = bu.config.campaign_ids ?? [];
    if (ids.length === 0) return [];
    const rows: RawCampaignRow[] = [];
    for (const id of ids) {
      const r = await metaGraphFetchPaginated<RawCampaignRow>(
        `${id}`,
        { fields: 'id,name,status,effective_status' },
        accessToken,
      );
      // Single-object fetch returns non-paginated; handle both shapes.
      if (r.data.length > 0) rows.push(...r.data);
    }
    return rows;
  }

  if (!organizer.ad_account_id) {
    throw new Error(`Organizer ${organizer.slug} has no ad_account_id.`);
  }

  const r = await metaGraphFetchPaginated<RawCampaignRow>(
    `${organizer.ad_account_id}/campaigns`,
    { fields: 'id,name,status,effective_status', limit: 500 },
    accessToken,
    { adAccountId: organizer.ad_account_id },
  );

  if (match_strategy === 'ad_account') return r.data;

  if (match_strategy === 'prefix') {
    const prefix = bu.config.campaign_name_prefix ?? '';
    if (!prefix) return [];
    return r.data.filter((c) => c.name.startsWith(prefix));
  }

  return [];
}

/** Fetch insights at a given level for a set of parent IDs over a date range. */
async function fetchInsightsForParents(
  accessToken: string,
  parentIds: string[],
  level: EntityType,
  since: string,
  until: string,
  adAccountId: string | null,
): Promise<RawInsightRow[]> {
  const fieldsByLevel: Record<EntityType, string> = {
    campaign: 'campaign_id,campaign_name,spend,impressions,reach,clicks,actions,action_values',
    adset: 'adset_id,adset_name,campaign_id,campaign_name,spend,impressions,reach,clicks,actions,action_values',
    ad: 'ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,reach,clicks,actions,action_values',
  };

  const rows: RawInsightRow[] = [];
  for (const parentId of parentIds) {
    const r = await metaGraphFetchPaginated<RawInsightRow>(
      `${parentId}/insights`,
      {
        level,
        fields: fieldsByLevel[level],
        time_range: JSON.stringify({ since, until }),
        time_increment: 1,
        limit: 500,
      },
      accessToken,
      { adAccountId: adAccountId ?? undefined },
    );
    rows.push(...r.data);
  }
  return rows;
}

/** Upsert entities and insights into meta_ops. Returns count of insight rows written. */
export async function upsertEntitiesAndInsights(
  supabase: AnySupabaseClient,
  businessUnitId: string,
  level: EntityType,
  rows: RawInsightRow[],
  now: Date = new Date(),
): Promise<number> {
  if (rows.length === 0) return 0;

  // 1. Collect entities at this level (one per unique meta_id).
  const entityMap = new Map<string, { meta_id: string; name: string; parent_meta_id: string | null }>();
  for (const r of rows) {
    const { meta_id, name, parent_meta_id } = extractEntity(r, level);
    if (meta_id && !entityMap.has(meta_id)) {
      entityMap.set(meta_id, { meta_id, name, parent_meta_id });
    }
  }

  // 2. Upsert entities (one round-trip).
  const entityPayload = Array.from(entityMap.values()).map((e) => ({
    business_unit_id: businessUnitId,
    entity_type: level,
    meta_id: e.meta_id,
    parent_meta_id: e.parent_meta_id,
    name: e.name,
    updated_at: now.toISOString(),
  }));
  const { data: upserted, error: entErr } = await supabase
    .from('meta_entities')
    .upsert(entityPayload, { onConflict: 'business_unit_id,entity_type,meta_id' })
    .select('id, meta_id');
  if (entErr) throw new Error(`upsert meta_entities failed: ${entErr.message}`);

  const idByMetaId = new Map<string, string>();
  for (const row of upserted ?? []) idByMetaId.set(row.meta_id as string, row.id as string);

  // 3. Map raw rows to InsightRow.
  const insights: InsightRow[] = [];
  for (const r of rows) {
    const { meta_id } = extractEntity(r, level);
    const entityId = idByMetaId.get(meta_id);
    if (!entityId) continue;
    insights.push({
      entity_id: entityId,
      date: r.date_start,
      tier: classifyTier(r.date_start, now),
      spend: toNumber(r.spend),
      impressions: Math.round(toNumber(r.impressions)),
      reach: Math.round(toNumber(r.reach)),
      clicks: Math.round(toNumber(r.clicks)),
      leads: Math.round(sumActions(r.actions, LEAD_ACTIONS)),
      purchases: Math.round(sumActions(r.actions, PURCHASE_ACTIONS)),
      purchase_value: sumActions(r.action_values, PURCHASE_ACTIONS),
    });
  }

  // 4. Upsert insights. Tier may advance but never downgrade (trigger enforces).
  // Pre-filter: drop rows whose tier would be a downgrade vs what's already stored.
  const filtered = await filterTierDowngrades(supabase, insights);

  if (filtered.length === 0) return 0;
  const { error: insErr } = await supabase
    .from('meta_insights')
    .upsert(
      filtered.map((i) => ({ ...i, updated_at: now.toISOString() })),
      { onConflict: 'entity_id,date' },
    );
  if (insErr) throw new Error(`upsert meta_insights failed: ${insErr.message}`);

  return filtered.length;
}

function extractEntity(row: RawInsightRow, level: EntityType) {
  if (level === 'ad') {
    return {
      meta_id: row.ad_id ?? '',
      name: row.ad_name ?? '',
      parent_meta_id: row.adset_id ?? null,
    };
  }
  if (level === 'adset') {
    return {
      meta_id: row.adset_id ?? '',
      name: row.adset_name ?? '',
      parent_meta_id: row.campaign_id ?? null,
    };
  }
  return {
    meta_id: row.campaign_id,
    name: row.campaign_name,
    parent_meta_id: null,
  };
}

const TIER_RANK: Record<InsightsTier, number> = { historical: 1, mid: 2, recent: 3, today: 4 };

/** Remove rows where the new tier is lower than the stored tier (trigger would reject). */
async function filterTierDowngrades(supabase: AnySupabaseClient, rows: InsightRow[]): Promise<InsightRow[]> {
  if (rows.length === 0) return rows;
  const entityIds = [...new Set(rows.map((r) => r.entity_id))];
  const dates = [...new Set(rows.map((r) => r.date))];

  const { data: existing } = await supabase
    .from('meta_insights')
    .select('entity_id, date, tier')
    .in('entity_id', entityIds)
    .in('date', dates);

  const existingMap = new Map<string, InsightsTier>();
  for (const e of existing ?? []) {
    existingMap.set(`${e.entity_id}|${e.date}`, e.tier as InsightsTier);
  }

  return rows.filter((r) => {
    const prev = existingMap.get(`${r.entity_id}|${r.date}`);
    if (!prev) return true;
    return TIER_RANK[r.tier] >= TIER_RANK[prev];
  });
}

/** High-level: pull insights for a single BU across ad/adset/campaign levels. */
export async function pullBuInsights(
  supabase: AnySupabaseClient,
  params: {
    organizerSlug: string;
    buSlug: string;
    masterKey: string;
    since: string;
    until: string;
  },
): Promise<{ rowsWritten: number }> {
  const { bu, organizer, accessToken } = await loadBuAndToken(
    supabase,
    params.organizerSlug,
    params.buSlug,
    params.masterKey,
  );

  const campaigns = await resolveBuCampaigns(accessToken, bu, organizer);
  if (campaigns.length === 0) return { rowsWritten: 0 };

  const campaignIds = campaigns.map((c) => c.id);
  let rowsWritten = 0;

  for (const level of ['ad', 'adset', 'campaign'] as EntityType[]) {
    const raw = await fetchInsightsForParents(
      accessToken,
      campaignIds,
      level,
      params.since,
      params.until,
      organizer.ad_account_id,
    );
    rowsWritten += await upsertEntitiesAndInsights(supabase, bu.id, level, raw);
  }

  return { rowsWritten };
}
