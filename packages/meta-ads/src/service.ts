import type { SupabaseClient } from '@supabase/supabase-js';

/** Accepts any schema-scoped client (avoids 'public' schema literal coupling). */
type AnySupabaseClient = SupabaseClient<any, string, string, any, any>;
import { metaGraphFetch, metaGraphFetchPaginated } from './client';
import { decryptToken } from './crypto';
import { classifyTier } from './tier';
import type {
  AdAccountRichRow,
  AdRichRow,
  AdSetRichRow,
  AudienceRichRow,
  BusinessUnitRow,
  CampaignRichRow,
  CreativeRichRow,
  EntityType,
  FrequencyRow,
  InsightRow,
  InsightsTier,
  MetaAction,
  OrganizerRow,
} from './types';
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
  inline_link_clicks?: string;
  unique_inline_link_clicks?: string;
  actions?: MetaAction[];
  action_values?: MetaAction[];
  video_3_sec_watched_actions?: MetaAction[];
  frequency_value?: string;
}

interface RawCampaignRow {
  id: string;
  name: string;
  status?: string;
  effective_status?: string;
  objective?: string;
  buying_type?: string;
  bid_strategy?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
  updated_time?: string;
  learning_stage_info?: Record<string, unknown>;
  account_id?: string;
}

interface RawAdSetRow {
  id: string;
  name: string;
  campaign_id?: string;
  status?: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  bid_strategy?: string;
  bid_amount?: string;
  optimization_goal?: string;
  billing_event?: string;
  destination_type?: string;
  targeting?: Record<string, unknown>;
  learning_stage_info?: Record<string, unknown>;
  updated_time?: string;
}

interface RawAdRow {
  id: string;
  name: string;
  adset_id?: string;
  status?: string;
  effective_status?: string;
  updated_time?: string;
  creative?: {
    id?: string;
    name?: string;
    object_type?: string;
    title?: string;
    body?: string;
    call_to_action_type?: string;
    image_url?: string;
    thumbnail_url?: string;
    video_id?: string;
  };
}

interface RawAudienceRow {
  id: string;
  name: string;
  subtype?: string;
  customer_file_source?: string;
  approximate_count_lower_bound?: number;
  approximate_count_upper_bound?: number;
  delivery_status?: { code: number; description?: string };
  lookalike_spec?: Record<string, unknown>;
  rule?: unknown;
  retention_days?: number;
  account_id?: string;
}

interface RawAdAccountRow {
  id: string;
  account_id?: string;
  name?: string;
  currency?: string;
  timezone_name?: string;
  account_status?: number;
  spend_cap?: string;
  amount_spent?: string;
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

// Meta reports the same event under multiple action_type "lenses" (purchase, omni_purchase,
// offsite_conversion.fb_pixel_purchase, onsite_web_purchase, …) all with the same value.
// Summing them triple-counts. We pick the FIRST lens that is present in priority order,
// which matches what Meta Ads Manager displays by default. `omni_*` is the canonical
// cross-platform bucket and is preferred.
function pickActions(
  actions: Array<{ action_type: string; value: string }> | undefined,
  priorityTypes: string[],
): number {
  if (!actions || actions.length === 0) return 0;
  for (const type of priorityTypes) {
    const matches = actions.filter((a) => a.action_type === type);
    if (matches.length > 0) {
      return matches.reduce((sum, a) => sum + toNumber(a.value), 0);
    }
  }
  return 0;
}

const LEAD_ACTIONS = ['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead'];
// Priority order matters — `pickActions` picks the first lens that is present.
// `offsite_conversion.fb_pixel_purchase` is the canonical Pixel purchase bucket and
// lines up with what Ads Manager shows by default, so we prefer it over plain
// `purchase` (which can include off-Pixel events and drift vs Ads Manager).
const PURCHASE_ACTIONS = ['omni_purchase', 'offsite_conversion.fb_pixel_purchase', 'purchase'];
const LANDING_PAGE_VIEW_ACTIONS = ['omni_landing_page_view', 'landing_page_view', 'offsite_conversion.fb_pixel_view_content'];
const INITIATE_CHECKOUT_ACTIONS = [
  'omni_initiated_checkout',
  'initiate_checkout',
  'offsite_conversion.fb_pixel_initiate_checkout',
];

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
  // NOTE: video_3_sec_watched_actions is rejected by v21 Ads Insights on accounts without
  // pure-video delivery. video_3s_views is derived from actions[action_type=video_view]
  // instead (works across ad formats).
  const extraFields = 'inline_link_clicks,unique_inline_link_clicks';
  const fieldsByLevel: Record<EntityType, string> = {
    campaign: `campaign_id,campaign_name,spend,impressions,reach,clicks,actions,action_values,${extraFields}`,
    adset: `adset_id,adset_name,campaign_id,campaign_name,spend,impressions,reach,clicks,actions,action_values,${extraFields}`,
    ad: `ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,reach,clicks,actions,action_values,${extraFields}`,
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

/** Default timezone for local-date comparisons. Matches DI21's operating region. */
const DEFAULT_TIME_ZONE = 'America/Lima';

/** Upsert entities and insights into meta_ops. Returns count of insight rows written.
 *
 *  `timeZone` controls the local date used by `classifyTier` and by the past-date
 *  reconciliation logic inside `filterTierDowngrades`. */
export async function upsertEntitiesAndInsights(
  supabase: AnySupabaseClient,
  businessUnitId: string,
  level: EntityType,
  rows: RawInsightRow[],
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE,
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

    const impressions = Math.round(toNumber(r.impressions));
    // Prefer explicit field, fall back to action bucket for accounts where inline_link_clicks is not exposed.
    const linkClicksRaw = r.inline_link_clicks !== undefined
      ? toNumber(r.inline_link_clicks)
      : sumActions(r.actions, ['link_click']);
    const link_clicks = Math.round(linkClicksRaw);
    const unique_link_clicks = Math.round(toNumber(r.unique_inline_link_clicks));
    // Derive 3-second views from the `actions` bucket (action_type=video_view ≈ 3s in Meta's taxonomy).
    // If Meta ever re-enables video_3_sec_watched_actions for this account, prefer that signal.
    // Using pickActions for lens consistency, even though video_view typically has a single lens.
    const video_3s_views = r.video_3_sec_watched_actions
      ? Math.round(pickActions(r.video_3_sec_watched_actions, ['video_view']))
      : Math.round(pickActions(r.actions, ['video_view']));
    const landing_page_views = Math.round(pickActions(r.actions, LANDING_PAGE_VIEW_ACTIONS));
    const initiate_checkout = Math.round(pickActions(r.actions, INITIATE_CHECKOUT_ACTIONS));
    const hook_rate = impressions > 0
      ? Math.round((video_3s_views / impressions) * 10_000) / 10_000
      : 0;

    insights.push({
      entity_id: entityId,
      date: r.date_start,
      tier: classifyTier(r.date_start, now, timeZone),
      spend: toNumber(r.spend),
      impressions,
      reach: Math.round(toNumber(r.reach)),
      clicks: Math.round(toNumber(r.clicks)),
      leads: Math.round(pickActions(r.actions, LEAD_ACTIONS)),
      purchases: Math.round(pickActions(r.actions, PURCHASE_ACTIONS)),
      purchase_value: pickActions(r.action_values, PURCHASE_ACTIONS),
      link_clicks,
      landing_page_views,
      initiate_checkout,
      unique_link_clicks,
      video_3s_views,
      hook_rate,
      actions: r.actions ?? [],
    });
  }

  // 4. Upsert insights. The DB trigger `prevent_tier_downgrade` rejects tier downgrades,
  // so we adjust rows in-place: for past-date rows we always reconcile metrics and clamp
  // the tier to the stored value; for today's rows we drop would-be downgrades entirely.
  const filtered = await filterTierDowngrades(supabase, insights, timeZone);

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

/**
 * Reconcile stored tiers with newly-computed ones while respecting the
 * `prevent_tier_downgrade` DB trigger.
 *
 *   - No stored row yet   → pass through as-is.
 *   - Past date (< today) → always include, but clamp tier to max(new, stored)
 *                           so metrics reconcile without tripping the trigger.
 *                           (Tier is a cache hint; past rows naturally slide
 *                            4→3→2→1 as they age and must not block upserts.)
 *   - Today's row         → drop if the new tier would be a downgrade.
 *
 * "Today" is computed in `timeZone` local time.
 */
async function filterTierDowngrades(
  supabase: AnySupabaseClient,
  rows: InsightRow[],
  timeZone: string,
): Promise<InsightRow[]> {
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

  const localToday = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const out: InsightRow[] = [];
  for (const r of rows) {
    const prev = existingMap.get(`${r.entity_id}|${r.date}`);
    if (!prev) {
      out.push(r);
      continue;
    }
    if (r.date < localToday) {
      // Past date: always reconcile metrics. If the recomputed tier is lower than
      // the stored tier (e.g. today → recent as the day rolls over), keep the
      // stored tier so the trigger doesn't reject the UPDATE.
      if (TIER_RANK[r.tier] < TIER_RANK[prev]) {
        out.push({ ...r, tier: prev });
      } else {
        out.push(r);
      }
      continue;
    }
    // Today's row: strict no-downgrade guard.
    if (TIER_RANK[r.tier] >= TIER_RANK[prev]) {
      out.push(r);
    }
  }
  return out;
}

// =============================================================================
// Frequency breakdown — writes to meta_ops.meta_insights_frequency
// =============================================================================

/** Bucket a frequency_value into one of the 6 columns in meta_insights_frequency. */
function bucketOf(freq: number): keyof Omit<FrequencyRow, 'entity_id' | 'date' | 'reach' | 'avg_frequency' | 'raw'> {
  if (freq <= 1) return 'bucket_1';
  if (freq <= 3) return 'bucket_2_3';
  if (freq <= 5) return 'bucket_4_5';
  if (freq <= 10) return 'bucket_6_10';
  if (freq <= 20) return 'bucket_11_20';
  return 'bucket_21_plus';
}

interface RawFreqRow {
  date_start: string;
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  frequency_value?: string;
  reach?: string;
  impressions?: string;
}

/** Pull frequency-value breakdown for a set of parent IDs at a given level. */
async function fetchFrequencyForParents(
  accessToken: string,
  parentIds: string[],
  level: EntityType,
  since: string,
  until: string,
  adAccountId: string | null,
): Promise<RawFreqRow[]> {
  // `frequency_value` is a breakdown, not a field — Meta injects it automatically into each row
  // when breakdowns=frequency_value is set, so it must NOT be in fields.
  const fieldsByLevel: Record<EntityType, string> = {
    campaign: 'campaign_id,reach,impressions',
    adset: 'adset_id,campaign_id,reach,impressions',
    ad: 'ad_id,adset_id,campaign_id,reach,impressions',
  };

  const rows: RawFreqRow[] = [];
  for (const parentId of parentIds) {
    const r = await metaGraphFetchPaginated<RawFreqRow>(
      `${parentId}/insights`,
      {
        level,
        fields: fieldsByLevel[level],
        breakdowns: 'frequency_value',
        time_range: JSON.stringify({ since, until }),
        // time_increment=1 → daily buckets; matches meta_insights_frequency PK (entity, date).
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

/** Aggregate raw freq rows into one FrequencyRow per (entity, date) and upsert. */
export async function upsertFrequencyBreakdown(
  supabase: AnySupabaseClient,
  businessUnitId: string,
  level: EntityType,
  rows: RawFreqRow[],
  now: Date = new Date(),
): Promise<number> {
  if (rows.length === 0) return 0;

  // Collect parent metaIds to resolve entity_id via meta_entities.
  const metaIds = new Set<string>();
  for (const r of rows) {
    const id = level === 'ad' ? r.ad_id : level === 'adset' ? r.adset_id : r.campaign_id;
    if (id) metaIds.add(id);
  }
  if (metaIds.size === 0) return 0;

  const { data: entities, error: entErr } = await supabase
    .from('meta_entities')
    .select('id, meta_id')
    .eq('business_unit_id', businessUnitId)
    .eq('entity_type', level)
    .in('meta_id', Array.from(metaIds));
  if (entErr) throw new Error(`resolve meta_entities for freq failed: ${entErr.message}`);

  const idByMetaId = new Map<string, string>();
  for (const e of entities ?? []) idByMetaId.set(e.meta_id as string, e.id as string);

  // key = entity_id|date
  const grouped = new Map<string, FrequencyRow>();
  for (const r of rows) {
    const metaId = level === 'ad' ? r.ad_id : level === 'adset' ? r.adset_id : r.campaign_id;
    if (!metaId) continue;
    const entityId = idByMetaId.get(metaId);
    if (!entityId) continue;

    const key = `${entityId}|${r.date_start}`;
    let row = grouped.get(key);
    if (!row) {
      row = {
        entity_id: entityId,
        date: r.date_start,
        reach: 0,
        avg_frequency: 0,
        bucket_1: 0,
        bucket_2_3: 0,
        bucket_4_5: 0,
        bucket_6_10: 0,
        bucket_11_20: 0,
        bucket_21_plus: 0,
        raw: [],
      };
      grouped.set(key, row);
    }
    const freq = toNumber(r.frequency_value);
    const reach = Math.round(toNumber(r.reach));
    const impressions = Math.round(toNumber(r.impressions));
    row.reach += reach;
    row[bucketOf(freq)] += reach;
    row.raw.push({ frequency_value: freq, reach, impressions });
  }

  // Compute weighted avg frequency: sum(freq * reach) / sum(reach).
  for (const row of grouped.values()) {
    const totalReach = row.reach;
    if (totalReach > 0) {
      const weighted = row.raw.reduce((sum, b) => sum + b.frequency_value * b.reach, 0);
      row.avg_frequency = Math.round((weighted / totalReach) * 1000) / 1000;
    }
  }

  if (grouped.size === 0) return 0;
  const payload = Array.from(grouped.values()).map((r) => ({
    ...r,
    updated_at: now.toISOString(),
  }));
  const { error: upErr } = await supabase
    .from('meta_insights_frequency')
    .upsert(payload, { onConflict: 'entity_id,date' });
  if (upErr) throw new Error(`upsert meta_insights_frequency failed: ${upErr.message}`);
  return payload.length;
}

// =============================================================================
// Rich entity pulls — ad_accounts, campaigns, ad_sets, ads, creatives, audiences
// =============================================================================

function toOptNumber(v: string | number | undefined | null): number | null {
  if (v === undefined || v === null) return null;
  // Trim strings before number-coercion: `Number('  ')` is `0`, which would
  // turn a missing-value sentinel into a real zero amount and silently
  // emit fake INITIAL/DOWN events in budget history.
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return Number.isFinite(v) ? v : null;
}

function toOptTimestamp(v: string | undefined | null): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Meta returns daily_budget / lifetime_budget / spend_cap as currency minor
 * units (cents) and our DB columns are major units (dollars). We `Math.round`
 * before dividing so both writers (`service.ts` for the live pull and
 * `budget-history.ts` for the backfill) produce IDENTICAL major-unit values
 * for the same minor-unit input. The unique index on
 * (ad_set_id, changed_at, new_budget) only dedupes when the two writers
 * agree to the cent — the earlier draft did `n/100` here vs
 * `Math.round(n)/100` in the backfill, which produced two distinct rows
 * for the same logical event whenever Meta sent a non-integer cents value.
 */
export function minorToMajor(v: string | number | undefined | null): number | null {
  const n = toOptNumber(v);
  return n === null ? null : Math.round(n) / 100;
}

/** Fetch the ad account's rich record and upsert into meta_ops.ad_accounts. */
export async function upsertAdAccountRich(
  supabase: AnySupabaseClient,
  accessToken: string,
  organizer: OrganizerRow,
  now: Date = new Date(),
): Promise<number> {
  if (!organizer.ad_account_id) return 0;
  const r = await metaGraphFetch<RawAdAccountRow>(
    organizer.ad_account_id,
    { fields: 'id,account_id,name,currency,timezone_name,account_status,spend_cap,amount_spent' },
    accessToken,
    { adAccountId: organizer.ad_account_id },
  );
  const a = r.data;
  // Graph returns account_status as an int (1=ACTIVE, 2=DISABLED, 3=UNSETTLED, …).
  const row: AdAccountRichRow & { updated_at: string } = {
    meta_account_id: organizer.ad_account_id,
    organizer_id: organizer.id,
    name: a.name ?? null,
    currency: a.currency ?? null,
    timezone: a.timezone_name ?? null,
    account_status: a.account_status !== undefined ? String(a.account_status) : null,
    spending_cap: minorToMajor(a.spend_cap ?? null),
    amount_spent: minorToMajor(a.amount_spent ?? null),
    updated_at: now.toISOString(),
  };
  const { error } = await supabase.from('ad_accounts').upsert(row, { onConflict: 'meta_account_id' });
  if (error) throw new Error(`upsert ad_accounts failed: ${error.message}`);
  return 1;
}

/** Pull rich metadata for a set of campaigns and upsert to meta_ops.campaigns. */
export async function upsertCampaignsRich(
  supabase: AnySupabaseClient,
  accessToken: string,
  bu: BusinessUnitRow,
  organizer: OrganizerRow,
  campaignIds: string[],
  now: Date = new Date(),
): Promise<number> {
  if (campaignIds.length === 0) return 0;
  // learning_stage_info is not valid at the campaign level in Meta v21 — only on ad_sets.
  const fields =
    'id,name,objective,status,effective_status,buying_type,bid_strategy,daily_budget,lifetime_budget,start_time,stop_time,updated_time,account_id';
  const rows: RawCampaignRow[] = [];
  for (const id of campaignIds) {
    const r = await metaGraphFetch<RawCampaignRow>(
      id,
      { fields },
      accessToken,
      { adAccountId: organizer.ad_account_id ?? undefined },
    );
    rows.push(r.data);
  }

  const payload: Array<CampaignRichRow & { updated_at: string }> = rows.map((c) => ({
    id: c.id,
    account_id: c.account_id ? `act_${c.account_id}` : organizer.ad_account_id,
    business_unit_id: bu.id,
    name: c.name,
    objective: c.objective ?? null,
    status: c.status ?? null,
    effective_status: c.effective_status ?? null,
    buying_type: c.buying_type ?? null,
    bid_strategy: c.bid_strategy ?? null,
    daily_budget: minorToMajor(c.daily_budget),
    lifetime_budget: minorToMajor(c.lifetime_budget),
    start_time: toOptTimestamp(c.start_time),
    stop_time: toOptTimestamp(c.stop_time),
    updated_time: toOptTimestamp(c.updated_time),
    learning_stage_info: c.learning_stage_info ?? null,
    updated_at: now.toISOString(),
  }));
  const { error } = await supabase.from('campaigns').upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(`upsert campaigns failed: ${error.message}`);
  return payload.length;
}

/** Pull ad sets under each campaign and upsert to meta_ops.ad_sets. */
export async function upsertAdSetsRich(
  supabase: AnySupabaseClient,
  accessToken: string,
  bu: BusinessUnitRow,
  organizer: OrganizerRow,
  campaignIds: string[],
  now: Date = new Date(),
  /**
   * Tags any ad_set_budget_history rows produced by this call. Defaults to
   * 'pull' (the scheduled cron). The /api/refresh route can override to
   * 'manual_refresh' so we can later distinguish operator-driven changes from
   * background pulls in the audit log.
   */
  detectedVia: 'pull' | 'manual_refresh' = 'pull',
): Promise<number> {
  if (campaignIds.length === 0) return 0;
  const fields =
    'id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,bid_strategy,bid_amount,optimization_goal,billing_event,destination_type,targeting,learning_stage_info,updated_time';
  const all: RawAdSetRow[] = [];
  for (const campaignId of campaignIds) {
    const r = await metaGraphFetchPaginated<RawAdSetRow>(
      `${campaignId}/adsets`,
      { fields, limit: 500 },
      accessToken,
      { adAccountId: organizer.ad_account_id ?? undefined },
    );
    all.push(...r.data);
  }

  const payload: Array<AdSetRichRow & { updated_at: string }> = all.map((s) => ({
    id: s.id,
    campaign_id: s.campaign_id ?? null,
    business_unit_id: bu.id,
    name: s.name,
    status: s.status ?? null,
    effective_status: s.effective_status ?? null,
    daily_budget: minorToMajor(s.daily_budget),
    lifetime_budget: minorToMajor(s.lifetime_budget),
    bid_strategy: s.bid_strategy ?? null,
    bid_amount: minorToMajor(s.bid_amount),
    optimization_goal: s.optimization_goal ?? null,
    billing_event: s.billing_event ?? null,
    destination_type: s.destination_type ?? null,
    targeting: s.targeting ?? null,
    learning_stage_info: s.learning_stage_info ?? null,
    updated_time: toOptTimestamp(s.updated_time),
    updated_at: now.toISOString(),
  }));
  if (payload.length === 0) return 0;

  // -------------------------------------------------------------------------
  // Capture daily_budget diffs into ad_set_budget_history *before* the upsert
  // overwrites the prior value.
  //
  // Dedup contract with the backfill writer
  // ----------------------------------------
  // The backfill computes `changed_at` from Meta's Activity Log `event_time`,
  // while we use `updated_time` (or `now` as fallback). Those two values
  // never align at second resolution for the same logical bump, so the SQL
  // UNIQUE on (ad_set_id, changed_at, new_budget) would NOT dedupe naturally.
  //
  // Both writers MUST therefore truncate `changed_at` to the minute. With
  // that contract a forward-pull captured at 19:14:55 and a backfill
  // captured at 19:14:32 collapse into the SAME row. The trade-off is that
  // two distinct bumps on the same ad set to the same `new_budget` within
  // the same 60s window will be merged into one history row — acceptable
  // because no sane operator double-bumps to the same value within seconds.
  //
  // Failures here are logged but never block the upsert — the budget
  // history is best-effort, the live `ad_sets` row is the source of truth.
  // -------------------------------------------------------------------------
  try {
    const ids = payload.map((p) => p.id);
    const { data: prevRows, error: prevErr } = await supabase
      .from('ad_sets')
      .select('id, daily_budget')
      .in('id', ids);
    // CRITICAL: bail out cleanly on read error. Without this, prevRows is
    // null, every ad set looks "never seen", and we'd flood the history
    // with bogus INITIAL rows on a transient Supabase blip.
    if (prevErr) {
      console.warn(
        '[meta-ads] ad_set_budget_history diff skipped (prev fetch failed):',
        prevErr.message,
      );
    } else {
      const prevBudgetById = new Map<string, number | null>(
        ((prevRows ?? []) as Array<{ id: string; daily_budget: number | null }>).map((r) => [
          r.id,
          r.daily_budget == null ? null : Number(r.daily_budget),
        ]),
      );

      type HistoryInsert = {
        ad_set_id: string;
        business_unit_id: string;
        prev_budget: number | null;
        new_budget: number;
        delta_pct: number | null;
        direction: 'UP' | 'DOWN' | 'INITIAL';
        changed_at: string;
        detected_via: 'pull' | 'manual_refresh';
      };
      const historyRows: HistoryInsert[] = [];
      for (const p of payload) {
        if (p.daily_budget == null) continue; // CBO ad sets don't own a daily_budget
        const prev = prevBudgetById.get(p.id);
        const next = Number(p.daily_budget);
        // Treat "no record" and "record with NULL daily_budget" identically:
        // both are first-observation-of-a-budget. The latter happens when an
        // ad set switches from CBO (campaign-level budget) to ABO (ad-set
        // level budget); we want an INITIAL row in both cases, not silence.
        const noPrior = prev === undefined || prev === null;
        const ts = truncateToMinute(p.updated_time ?? now.toISOString());

        if (noPrior) {
          historyRows.push({
            ad_set_id: p.id,
            business_unit_id: bu.id,
            prev_budget: null,
            new_budget: next,
            delta_pct: null,
            direction: 'INITIAL',
            changed_at: ts,
            detected_via: detectedVia,
          });
          continue;
        }
        if (prev === next) continue; // no real change

        const direction: 'UP' | 'DOWN' = next > prev ? 'UP' : 'DOWN';
        // 2 decimals matches the NUMERIC(8,2) column and keeps the JSON small.
        const deltaPct = prev === 0 ? null : Math.round(((next - prev) / prev) * 10000) / 100;
        historyRows.push({
          ad_set_id: p.id,
          business_unit_id: bu.id,
          prev_budget: prev,
          new_budget: next,
          delta_pct: deltaPct,
          direction,
          changed_at: ts,
          detected_via: detectedVia,
        });
      }

      // Chunk the upsert to stay under PostgREST/Supabase payload caps when a
      // big bulk operation lands many ad sets at once. 500 mirrors the
      // backfill chunk size so the two writers behave consistently.
      //
      // We `continue` past chunk failures rather than `break`. A transient
      // failure on chunk 1 (e.g. Postgres connection blip) shouldn't lose
      // chunks 2..N — `ignoreDuplicates: true` makes a later retry safe and
      // the next pull cycle will simply observe the still-pending diffs.
      const CHUNK = 500;
      for (let i = 0; i < historyRows.length; i += CHUNK) {
        const slice = historyRows.slice(i, i + CHUNK);
        const { error: histErr } = await supabase
          .from('ad_set_budget_history')
          .upsert(slice, {
            onConflict: 'ad_set_id,changed_at,new_budget',
            ignoreDuplicates: true,
          });
        if (histErr) {
          console.warn(
            `[meta-ads] ad_set_budget_history chunk ${i / CHUNK} insert failed (non-fatal):`,
            histErr.message,
          );
        }
      }
    }
  } catch (err) {
    console.warn(
      '[meta-ads] ad_set_budget_history diff capture skipped:',
      err instanceof Error ? err.message : err,
    );
  }

  const { error } = await supabase.from('ad_sets').upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(`upsert ad_sets failed: ${error.message}`);
  return payload.length;
}

/**
 * Truncate an ISO-8601 timestamp to minute resolution and re-encode as ISO.
 * Both the pull diff and the Activity Log backfill MUST use this so the
 * UNIQUE on `(ad_set_id, changed_at, new_budget)` actually deduplicates the
 * same logical bump observed by both writers within a 60s window.
 *
 * Exported so the backfill module can import the same function and the
 * contract lives in exactly one place.
 */
export function truncateToMinute(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setUTCSeconds(0, 0);
  return d.toISOString();
}

function mapCreativeStub(
  businessUnitId: string,
  raw: NonNullable<RawAdRow['creative']>,
  adFormat: string | null,
): CreativeRichRow | null {
  if (!raw.id) return null;
  const type = raw.video_id ? 'VID' : raw.image_url ? 'IMG' : adFormat ?? null;
  return {
    meta_creative_id: raw.id,
    business_unit_id: businessUnitId,
    type,
    format: adFormat ?? type,
    headline: raw.title ?? null,
    body_text: raw.body ?? null,
    cta: raw.call_to_action_type ?? null,
    media_url: raw.image_url ?? null,
    thumbnail_url: raw.thumbnail_url ?? null,
  };
}

/** Pull ads under each ad set and upsert to meta_ops.ads + creative stubs to meta_ops.creatives. */
export async function upsertAdsAndCreativesRich(
  supabase: AnySupabaseClient,
  accessToken: string,
  bu: BusinessUnitRow,
  organizer: OrganizerRow,
  adSetIds: string[],
  now: Date = new Date(),
): Promise<{ ads: number; creatives: number }> {
  if (adSetIds.length === 0) return { ads: 0, creatives: 0 };
  const adFields =
    'id,name,adset_id,status,effective_status,updated_time,creative{id,name,object_type,title,body,call_to_action_type,image_url,thumbnail_url,video_id}';
  const all: RawAdRow[] = [];
  for (const adSetId of adSetIds) {
    const r = await metaGraphFetchPaginated<RawAdRow>(
      `${adSetId}/ads`,
      { fields: adFields, limit: 500 },
      accessToken,
      { adAccountId: organizer.ad_account_id ?? undefined },
    );
    all.push(...r.data);
  }

  if (all.length === 0) return { ads: 0, creatives: 0 };

  // 1. Upsert creatives first. We identify them by meta_creative_id (UNIQUE).
  const creativesByMetaId = new Map<string, CreativeRichRow>();
  for (const ad of all) {
    if (!ad.creative?.id) continue;
    const raw = ad.creative;
    const videoLike = Boolean(raw.video_id);
    const format = videoLike ? 'VID' : 'IMG';
    const stub = mapCreativeStub(bu.id, raw, format);
    if (stub && !creativesByMetaId.has(stub.meta_creative_id)) {
      creativesByMetaId.set(stub.meta_creative_id, stub);
    }
  }
  let creativesWritten = 0;
  let idByMetaCreativeId = new Map<string, string>();
  if (creativesByMetaId.size > 0) {
    // Operator-owned columns (format, type) are intentionally EXCLUDED from the upsert payload
    // so pulls don't overwrite taxonomy set by the operator seed (see
    // 20260422120200_meta_ops_seed_di21_operator.sql). New creatives will land with NULL for
    // these columns and the operator seed backfills them afterwards. Mirrors the same
    // convention used below for `ads` (manual_status, wave, format, test_group).
    const creativePayload = Array.from(creativesByMetaId.values()).map((c) => {
      const { format: _format, type: _type, ...rest } = c;
      return { ...rest, updated_at: now.toISOString() };
    });
    const { data: cUp, error: cErr } = await supabase
      .from('creatives')
      .upsert(creativePayload, { onConflict: 'meta_creative_id' })
      .select('id, meta_creative_id');
    if (cErr) throw new Error(`upsert creatives failed: ${cErr.message}`);
    creativesWritten = (cUp ?? []).length;
    for (const row of cUp ?? []) {
      idByMetaCreativeId.set(row.meta_creative_id as string, row.id as string);
    }
  }

  // 2. Upsert ads, linking creative FK by UUID we just got.
  //    Operator-assigned columns (manual_status, wave, format, test_group) are intentionally
  //    NOT set from the pull: they are seeded and maintained by the operator. The pull only
  //    refreshes Meta-sourced fields so on-conflict updates don't wipe operator values.
  const adPayload = all.map((a) => {
    const creativeUuid = a.creative?.id ? idByMetaCreativeId.get(a.creative.id) ?? null : null;
    return {
      id: a.id,
      ad_set_id: a.adset_id ?? null,
      business_unit_id: bu.id,
      name: a.name,
      status: a.status ?? null,
      effective_status: a.effective_status ?? null,
      updated_time: toOptTimestamp(a.updated_time),
      creative_id: creativeUuid,
      updated_at: now.toISOString(),
    };
  });
  const { error: adErr } = await supabase.from('ads').upsert(adPayload, { onConflict: 'id' });
  if (adErr) throw new Error(`upsert ads failed: ${adErr.message}`);

  return { ads: adPayload.length, creatives: creativesWritten };
}

/** Pull custom audiences for the ad account and upsert to meta_ops.audiences. */
export async function upsertAudiencesRich(
  supabase: AnySupabaseClient,
  accessToken: string,
  bu: BusinessUnitRow,
  organizer: OrganizerRow,
  now: Date = new Date(),
): Promise<number> {
  if (!organizer.ad_account_id) return 0;
  // Meta v21 replaced `approximate_count` with lower/upper bounds for privacy. Use the midpoint.
  const fields =
    'id,name,subtype,customer_file_source,approximate_count_lower_bound,approximate_count_upper_bound,delivery_status,lookalike_spec,retention_days,account_id';
  const r = await metaGraphFetchPaginated<RawAudienceRow>(
    `${organizer.ad_account_id}/customaudiences`,
    { fields, limit: 500 },
    accessToken,
    { adAccountId: organizer.ad_account_id },
  );

  const payload: Array<AudienceRichRow & { updated_at: string }> = r.data.map((a) => {
    const lo = a.approximate_count_lower_bound;
    const hi = a.approximate_count_upper_bound;
    const approximate_count =
      typeof lo === 'number' && typeof hi === 'number'
        ? Math.round((lo + hi) / 2)
        : typeof lo === 'number'
        ? lo
        : typeof hi === 'number'
        ? hi
        : null;
    return {
      id: a.id,
      account_id: organizer.ad_account_id,
      business_unit_id: bu.id,
      name: a.name,
      type: a.customer_file_source ?? (a.subtype === 'LOOKALIKE' ? 'LAL' : a.subtype ?? null),
      subtype: a.subtype ?? null,
      source_audience_id: null, // Meta does not expose this on the list endpoint for LAL sources.
      lookalike_spec: a.lookalike_spec ?? null,
      approximate_count,
      status: a.delivery_status?.description ?? null,
      retention_days: a.retention_days ?? null,
      updated_at: now.toISOString(),
    };
  });

  if (payload.length === 0) return 0;
  const { error } = await supabase.from('audiences').upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(`upsert audiences failed: ${error.message}`);
  return payload.length;
}

// =============================================================================
// High-level orchestrator
// =============================================================================

/** High-level: pull insights for a single BU across ad/adset/campaign levels.
 *  When includeRich=true, also refreshes ad_accounts/campaigns/ad_sets/ads/creatives/audiences
 *  and frequency breakdown. Defaults to true; pass false for bulk historical backfills where
 *  entity metadata refresh is redundant. */
export async function pullBuInsights(
  supabase: AnySupabaseClient,
  params: {
    organizerSlug: string;
    buSlug: string;
    masterKey: string;
    since: string;
    until: string;
    includeRich?: boolean;
    /** Local timezone for tier classification. Defaults to America/Lima. */
    timeZone?: string;
    /**
     * Tag for any ad_set_budget_history rows produced by this run. The
     * scheduled cron leaves it as the default 'pull'; the manual
     * /api/refresh route should pass 'manual_refresh' so operators can
     * trace which bumps were captured by user action vs background sync.
     */
    detectedVia?: 'pull' | 'manual_refresh';
  },
): Promise<{
  rowsWritten: number;
  freqRows: number;
  richCounts: {
    ad_account: number;
    campaigns: number;
    ad_sets: number;
    ads: number;
    creatives: number;
    audiences: number;
  };
}> {
  const { bu, organizer, accessToken } = await loadBuAndToken(
    supabase,
    params.organizerSlug,
    params.buSlug,
    params.masterKey,
  );

  const campaigns = await resolveBuCampaigns(accessToken, bu, organizer);
  if (campaigns.length === 0) {
    return {
      rowsWritten: 0,
      freqRows: 0,
      richCounts: { ad_account: 0, campaigns: 0, ad_sets: 0, ads: 0, creatives: 0, audiences: 0 },
    };
  }

  const campaignIds = campaigns.map((c) => c.id);
  let rowsWritten = 0;

  // 1. Insights across all 3 levels — this also seeds meta_entities.
  for (const level of ['ad', 'adset', 'campaign'] as EntityType[]) {
    const raw = await fetchInsightsForParents(
      accessToken,
      campaignIds,
      level,
      params.since,
      params.until,
      organizer.ad_account_id,
    );
    rowsWritten += await upsertEntitiesAndInsights(
      supabase,
      bu.id,
      level,
      raw,
      new Date(),
      params.timeZone ?? DEFAULT_TIME_ZONE,
    );
  }

  const richCounts = { ad_account: 0, campaigns: 0, ad_sets: 0, ads: 0, creatives: 0, audiences: 0 };
  let freqRows = 0;

  if (params.includeRich !== false) {
    // 2. Ad account (cheap, 1 call).
    try {
      richCounts.ad_account = await upsertAdAccountRich(supabase, accessToken, organizer);
    } catch (err) {
      // Non-fatal: log via metadata and continue. Caller can inspect health_snapshot.
      richCounts.ad_account = 0;
    }

    // 3. Rich campaigns + ad sets + ads/creatives + audiences.
    try {
      richCounts.campaigns = await upsertCampaignsRich(supabase, accessToken, bu, organizer, campaignIds);
      richCounts.ad_sets = await upsertAdSetsRich(
        supabase,
        accessToken,
        bu,
        organizer,
        campaignIds,
        new Date(),
        params.detectedVia ?? 'pull',
      );

      // Ads live under ad_sets — resolve the ad set ids we just wrote.
      const { data: adSets } = await supabase
        .from('ad_sets')
        .select('id')
        .in('campaign_id', campaignIds);
      const adSetIds = (adSets ?? []).map((r) => r.id as string);
      const adsAndCreatives = await upsertAdsAndCreativesRich(
        supabase,
        accessToken,
        bu,
        organizer,
        adSetIds,
      );
      richCounts.ads = adsAndCreatives.ads;
      richCounts.creatives = adsAndCreatives.creatives;

      richCounts.audiences = await upsertAudiencesRich(supabase, accessToken, bu, organizer);
    } catch (err) {
      // Surface but don't block insight writes.
      throw err;
    }

    // 4. Frequency breakdown — write one row per (entity,date) at ad-set + campaign level.
    //    We skip ad-level frequency by default to keep quota usage bounded.
    for (const level of ['adset', 'campaign'] as EntityType[]) {
      const freq = await fetchFrequencyForParents(
        accessToken,
        campaignIds,
        level,
        params.since,
        params.until,
        organizer.ad_account_id,
      );
      freqRows += await upsertFrequencyBreakdown(supabase, bu.id, level, freq);
    }
  }

  return { rowsWritten, freqRows, richCounts };
}
