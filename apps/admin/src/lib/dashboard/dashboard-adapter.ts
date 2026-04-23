/**
 * Dashboard data adapter — single source of truth = meta_ops schema.
 *
 * Generic loader parameterized by (organizer slug, BU slug). Every field the
 * operator dashboard needs is derived from meta_ops entities/insights scoped
 * to the selected BU, and returned as a typed DashboardData contract
 * consumed by the renderer. Originally mirrored desinflamate21-report-...html
 * but is BU-agnostic: add a new BU row + meta data in meta_ops and it renders.
 */

import { supabaseAdminForSchema } from '@marketing-funnel/db';

// =============================================================================
// Types (public contract for the renderer)
// =============================================================================

export interface BuConfig {
  objective: string;
  event_type: string;
  attribution: string;
  landing_url: string;
  campaign_code: string;
  campaign_label: string;
  /** IANA timezone for the BU — controls what "today" means in tiles/KPIs. Defaults to America/Lima. */
  timezone?: string;
  campaign_window: {
    starts_on: string;
    ends_on: string;
    duration_days: number;
    deadline_label: string;
  };
  phases: Array<{ key: string; label: string; day_start: number; day_end: number }>;
  total_budget: number;
  daily_budget: number;
  cus_seed_size: number;
  fatigue_thresholds: {
    cus_daily_freq_watch: number;
    cus_daily_freq_alert: number;
    rmk_daily_freq_watch: number;
    cartab_daily_freq_watch: number;
    freq_6plus_healthy_max_pct: number;
    freq_6plus_watch_max_pct: number;
  };
  link_ctr_target: number;
  link_ctr_warn: number;
  cpm_threshold: number;
  click_to_lp_target: number;
  /**
   * Explicit Meta campaign id to pin the dashboard to a specific campaign
   * entity for this BU. When present, skips the spend-based fallback and
   * guarantees operators don't accidentally see stats from a test campaign.
   */
  campaign_meta_id?: string;
}

export interface KpiTargets {
  target_cpa: number;
  breakeven_cpa: number;
  kill_cpa: number;
  kill_window_days: number;
  revenue_per_conv: number;
  target_roas: number;
  target_total_conversions: number;
  /**
   * Optional per-role breakeven overrides. Cart-abandon (CARTAB) ships at a
   * tighter BE because its audience is post-purchase intent; we want the UI
   * to reflect this without baking role-specific literals in the renderer.
   */
  breakeven_cpa_by_role?: Partial<Record<'CUS' | 'ASC' | 'RMK' | 'CARTAB' | 'INT', number>>;
}

export interface PriceTier {
  label: string;
  price: number;
  currency: string;
  starts_on: string;
  ends_on: string | null;
  cutover_time: string | null;
  status: 'past' | 'current' | 'future';
}

export interface KpiCell {
  label: string;
  value: string;
  tone: 'ok' | 'warn' | 'bad' | 'neutral';
  sub?: string;
}

export interface AdSetRow {
  id: string;
  role: string;                      // CUS / ASC / RMK / CARTAB
  name_subtitle: string;             // "Seed + Advantage+"
  temperature_label: string;
  status: 'ACTIVE' | 'PAUSED' | string;
  daily_budget: number;
  spend: number;
  purchases: number;
  cpa: number | null;
  breakeven_cpa: number;             // effective BE for this role (override-aware)
  margin_per_sale: number | null;    // BE_CPA - CPA (null when no purchases)
  roas: number | null;               // revenue_tier / spend (tier-valued revenue)
  roas_target: number;               // target ROAS from kpi_targets (for UI chip)
  link_ctr: number;
  reach: number;
  freq_daily_7d: number | null;      // avg daily freq (7d); null when no freq data
  freq_lifetime: number | null;      // cumulative freq; null when no data
}

export interface LearningPhaseCard {
  adset_id: string;
  role: string;
  label: string;                     // "${role} — ${temperature_label}"
  purchases_7d: number;
  target_exits: number;              // 50
  progress_pct: number;
  gap: number;
  eta_days: number | null;
  eta_date: string | null;
  last_edit_ago: string;             // human label
  last_edit_recent: boolean;         // <24h triggers reset badge
  spend_7d: number;
  cpa_7d: number | null;
  status: 'active' | 'paused' | 'inactive';
  early_winner: boolean;
  note: string;
  status_label: string;              // LEARNING (implícito) / LEARNING (edit reset)
}

export interface RecentPurchase {
  date: string;
  purchases: number;
  adset_role: string;
  ad_name: string;
  temperature_label: string;
  spend_day: number;
  cpa_day: number | null;
  cpa_target: number;
  cpa_breakeven: number;
  cpa_kill: number;
}

export interface TargetingBlock {
  id: string;
  role: string;
  name: string;                      // "D21_CUS_Suscriptores-NoCompradores_$25"
  temperature_label: string;
  budget_line: string;               // "$320/day · OFFSITE_CONVERSIONS · IMPRESSIONS"
  rows: Array<{ label: string; value: string }>;
}

export interface CusSaturationBlock {
  reach_vs_seed: { reach: number; seed: number; multiplier: number };
  freq_7d: { value: number | null; peak_day: number | null; lifetime: number | null; days: number };
  link_ctr: number;
  advantage_plus_status: 'EXPANDING' | 'STABLE' | 'COOLING';
}

export interface TrendPoint {
  date: string;
  spend: number;
  purchases: number;
  ctr: number;
  cpm: number;
}

export interface FunnelStep {
  label: string;
  value: number;
  conv_pct_from_prev: number | null;   // null for first step
  drop_pct_from_prev: number | null;
}

export interface AdPerfRow {
  id: string;
  name: string;
  adset_role: string;
  format: 'VID' | 'IMG';
  wave: 'W1' | 'W2' | 'W3';
  manual_status: string;                // Winner / Watch / Dead / Active / Testing
  status_dot: 'winner' | 'watch' | 'dead' | 'testing' | 'active';
  spend: number;
  impressions: number;
  reach: number;
  link_clicks: number;
  link_ctr: number;
  lp_views: number;
  purchases: number;
  cpa: number | null;
  pct_of_budget: number;
}

export interface MatchupRow {
  label: string;
  video_ctr: number;
  static_ctr: number;
  video_purchases: number;
  static_purchases: number;
  early_winner: string;
}

export interface FrequencyScope {
  scope: string;              // TOTAL / CUS / ASC / RMK / CARTAB
  reach: number;
  avg_freq: number;
  buckets: {
    b1: number;
    b23: number;
    b45: number;
    b610: number;
    b1120: number;
    b21plus: number;
  };
  pct_6plus: number;
  status: 'HEALTHY' | 'WATCH' | 'FATIGUE';
}

export interface AlertItem {
  type: string;
  severity: 'green' | 'yellow' | 'red' | 'blue';
  message: string;
}

export interface HypothesisItem {
  code: string;
  statement: string;
  current_reading: string;
  success_criteria: string;
  status: 'testing' | 'validated' | 'rejected';
}

export interface WatchSignalItem {
  label: string;
  threshold: string;
  current: string;
  status: 'ok' | 'watch' | 'breach';
  action: string;
}

export interface RevenueTile {
  label: string;
  date_range: string;
  amount: number;
  sub: string;
  color: 'ok' | 'accent' | 'warn';
}

export interface HealthBreakdown {
  label: string;
  score: number;
  tone: 'ok' | 'warn' | 'bad';
  weight?: number;                   // percentage weight in total score (0-100)
  sub?: string;                      // short human-readable detail
}

export interface DashboardData {
  bu: {
    id: string;
    organizer_slug: string;
    bu_slug: string;
    name: string;
    config: BuConfig;
    kpi_targets: KpiTargets;
  };
  header: {
    report_date: string;                 // "2026-04-22"
    campaign_code: string;
    campaign_label: string;
    day_index: number;                   // 15
    total_days: number;                  // 19
    adset_summary: string;               // "ABO (CUS $320 ACT + ASC $30 PAUSED + ...)"
    freshness_utc: string;               // "14:11 UTC"
    status_badge: string;                // "SCALING"
    health_label: string;                // "HEALTHY (90)"
  };
  progress: {
    day_index: number;
    total_days: number;
    spend_so_far: number;
    total_budget: number;
    progress_pct: number;                // by day (matches blueprint 15/19 = 78.9%)
    progress_pct_budget: number;         // by spend vs total_budget (side metric)
    current_phase_key: string;           // scaling
    phases: BuConfig['phases'];
  };
  health: {
    score: number;
    label: string;                       // HEALTHY / WATCH / CRITICAL
    tone: 'ok' | 'warn' | 'bad';
    breakdown: HealthBreakdown[];
  };
  campaign_config: Array<{ label: string; value: string; full_row?: boolean }>;
  price_tiers: PriceTier[];
  revenue_tiles: RevenueTile[];
  revenue_footer: string;
  kpis: KpiCell[];
  ad_sets: AdSetRow[];
  learning_cards: LearningPhaseCard[];
  recent_purchases: RecentPurchase[];
  targeting_blocks: TargetingBlock[];
  cus_saturation: CusSaturationBlock;
  trend: TrendPoint[];
  funnel: FunnelStep[];
  ad_performance: AdPerfRow[];
  matchups: MatchupRow[];
  frequency: FrequencyScope[];
  alerts: AlertItem[];
  hypotheses: HypothesisItem[];
  watch_signals: WatchSignalItem[];
}

// =============================================================================
// Loader
// =============================================================================

interface Money { (n: number): string }
const money: Money = (n: number) => {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const fixed = abs < 10 ? abs.toFixed(3) : abs.toFixed(2);
  return `${sign}$${fixed}`;
};
const num = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));
const pct = (n: number, digits = 2) => `${n.toFixed(digits)}%`;

function diffDays(from: string, to: string): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1);
}

function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** YYYY-MM-DD "today" for the given IANA timezone (e.g. America/Lima). */
function todayInTimezone(timeZone: string): string {
  // en-CA formats as YYYY-MM-DD which happens to match ISO day format.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

export async function loadDashboard(params: {
  organizerSlug: string;
  buSlug: string;
  reportDate?: string;          // defaults to today
}): Promise<DashboardData> {
  const meta = supabaseAdminForSchema('meta_ops');

  // ---------- 1. Organizer + BU ----------
  const { data: org } = await meta
    .from('organizers')
    .select('id, slug')
    .eq('slug', params.organizerSlug)
    .maybeSingle();
  if (!org) throw new Error(`Organizer not found: ${params.organizerSlug}`);

  const { data: bu } = await meta
    .from('business_units')
    .select('id, slug, name, config, kpi_targets')
    .eq('organizer_id', org.id)
    .eq('slug', params.buSlug)
    .maybeSingle();
  if (!bu) throw new Error(`BU not found: ${params.buSlug}`);

  const config = bu.config as BuConfig;
  const kpi = bu.kpi_targets as KpiTargets;

  // "Today" must be evaluated in the BU's timezone. The server runs UTC, so a
  // pure toISOString() would flip to the next day after ~7pm Lima time.
  const timezone = config.timezone ?? 'America/Lima';
  const reportDate = params.reportDate ?? todayInTimezone(timezone);
  const buId = bu.id as string;

  // ---------- 2. price_tiers ----------
  const { data: tiers } = await meta
    .from('price_tiers')
    .select('label, price, currency, starts_on, ends_on, cutover_time, display_order')
    .eq('business_unit_id', buId)
    .order('display_order', { ascending: true });
  const price_tiers: PriceTier[] = (tiers ?? []).map((t: AnyRow) => {
    const start = new Date(t.starts_on as string);
    const end   = t.ends_on ? new Date(t.ends_on as string) : null;
    const today = new Date(reportDate);
    let status: PriceTier['status'] = 'future';
    if (end && end < today) status = 'past';
    else if (start <= today && (!end || end >= today)) status = 'current';
    return { ...(t as Omit<PriceTier, 'status'>), status };
  });
  const currentTier = price_tiers.find(t => t.status === 'current') ?? price_tiers[price_tiers.length - 1];

  // Tier-based price for any ISO date (for revenue valuation downstream).
  // Declared early so adset ROAS (Fix #1) and learning card math can reuse it.
  const priceForDate = (isoDate: string): number => {
    const t = price_tiers.find(tt => isoDate >= tt.starts_on && (!tt.ends_on || isoDate <= tt.ends_on));
    return t?.price ?? kpi.revenue_per_conv;
  };

  // ---------- 3. Campaign entity + daily trend ----------
  // Fix C1: resolve the campaign to render in this order:
  //   1) `config.campaign_meta_id` pinning (explicit override, single source
  //      of truth when operators want to lock a campaign for the BU).
  //   2) Otherwise, among all campaigns for this BU, pick the one with the
  //      highest lifetime `spend` sum in meta_insights. This beats the old
  //      "most recent" heuristic, which would latch onto empty test campaigns
  //      as soon as they were created.
  //   3) If nothing has spend (or only one candidate), fall back to the most
  //      recent by created_at to preserve prior behaviour for fresh BUs.
  let campEntity: { id: string; meta_id: string; name: string } | null = null;
  if (config.campaign_meta_id) {
    const { data: pinned } = await meta
      .from('meta_entities')
      .select('id, meta_id, name')
      .eq('business_unit_id', buId)
      .eq('entity_type', 'campaign')
      .eq('meta_id', config.campaign_meta_id)
      .maybeSingle();
    if (pinned) {
      campEntity = pinned as { id: string; meta_id: string; name: string };
      console.info(
        `[dashboard] campaign resolved via config.campaign_meta_id=${config.campaign_meta_id} (${campEntity.name})`,
      );
    } else {
      console.warn(
        `[dashboard] campaign_meta_id=${config.campaign_meta_id} not found in meta_entities for BU ${buId}; falling back to spend heuristic`,
      );
    }
  }

  if (!campEntity) {
    const { data: candidates } = await meta
      .from('meta_entities')
      .select('id, meta_id, name, created_at')
      .eq('business_unit_id', buId)
      .eq('entity_type', 'campaign')
      .order('created_at', { ascending: false });
    const candList = (candidates ?? []) as AnyRow[];
    if (candList.length === 1) {
      campEntity = {
        id: candList[0].id as string,
        meta_id: candList[0].meta_id as string,
        name: candList[0].name as string,
      };
      console.info(`[dashboard] campaign resolved (sole candidate): ${campEntity.name}`);
    } else if (candList.length > 1) {
      const candidateIds = candList.map(c => c.id as string);
      const { data: spendRows } = await meta
        .from('meta_insights')
        .select('entity_id, spend')
        .in('entity_id', candidateIds);
      const spendByEntity = new Map<string, number>();
      for (const r of (spendRows ?? []) as AnyRow[]) {
        const id = r.entity_id as string;
        spendByEntity.set(id, (spendByEntity.get(id) ?? 0) + (Number(r.spend) || 0));
      }
      const sorted = [...candList].sort((a, b) => {
        const sa = spendByEntity.get(a.id as string) ?? 0;
        const sb = spendByEntity.get(b.id as string) ?? 0;
        if (sb !== sa) return sb - sa;
        // Tie-break: most recent created_at (stable with prior behaviour).
        return (b.created_at as string).localeCompare(a.created_at as string);
      });
      const chosen = sorted[0];
      campEntity = {
        id: chosen.id as string,
        meta_id: chosen.meta_id as string,
        name: chosen.name as string,
      };
      console.info(
        `[dashboard] campaign resolved via spend heuristic: ${campEntity.name} ` +
          `(spend=${(spendByEntity.get(chosen.id as string) ?? 0).toFixed(2)}, ` +
          `${candList.length} candidates)`,
      );
    }
  }
  const campaignEntityId = campEntity?.id as string | undefined;

  const { data: campInsights } = campaignEntityId
    ? await meta
        .from('meta_insights')
        .select('date, spend, impressions, reach, clicks, link_clicks, landing_page_views, initiate_checkout, purchases, purchase_value, frequency')
        .eq('entity_id', campaignEntityId)
        .order('date', { ascending: true })
    : { data: [] as AnyRow[] };

  // Lifetime totals from campaign-daily rows, scoped to the campaign window
  // so they stay consistent with `totalPurchases` / `totalRevenue` further
  // below. Using the declared window prevents pre-launch or future rows in
  // the DB from polluting "so far" aggregates and keeps KPIs (CPA, Funnel,
  // etc.) aligned with the revenue tiles.
  const lifetimeWindowStart = config.campaign_window.starts_on;
  const lifetimeWindowEnd   = config.campaign_window.ends_on && config.campaign_window.ends_on < reportDate
    ? config.campaign_window.ends_on
    : reportDate;
  const lifetime = {
    spend: 0, impressions: 0, reach: 0, clicks: 0, link_clicks: 0,
    lp_views: 0, initiate_checkout: 0, purchases: 0, purchase_value: 0,
  };
  let reachMax = 0;
  for (const r of (campInsights ?? []) as AnyRow[]) {
    const d = (r.date as string) ?? '';
    if (d < lifetimeWindowStart || d > lifetimeWindowEnd) continue;
    lifetime.spend          += Number(r.spend) || 0;
    lifetime.impressions    += Number(r.impressions) || 0;
    lifetime.clicks         += Number(r.clicks) || 0;
    lifetime.link_clicks    += Number(r.link_clicks) || 0;
    lifetime.lp_views       += Number(r.landing_page_views) || 0;
    lifetime.initiate_checkout += Number(r.initiate_checkout) || 0;
    lifetime.purchases      += Number(r.purchases) || 0;
    lifetime.purchase_value += Number(r.purchase_value) || 0;
    // Fix A4: Total Reach lifetime = MAX(daily reach) across the window.
    // Summing would triple-count users; picking the last-non-zero row was a
    // stale proxy and tended to under-report. MAX approximates Ads Manager's
    // "daily unique reach max" within the window, which is what operators
    // compare against.
    const reachDaily = Number(r.reach) || 0;
    if (reachDaily > reachMax) reachMax = reachDaily;
  }
  lifetime.reach = reachMax;

  // Fix #10: guard every Number(r.field) with || 0 so that NULLs from the
  // DB don't poison the charts with NaN.
  // Fix A8: scope the trend chart to the declared campaign_window so pre-
  // launch / post-end rows don't drag the chart (flat zero days before
  // launch tricked operators into thinking CTR crashed).
  const trend: TrendPoint[] = ((campInsights ?? []) as AnyRow[])
    .filter(r => {
      const d = (r.date as string) ?? '';
      return d >= lifetimeWindowStart && d <= lifetimeWindowEnd;
    })
    .map(r => {
      const spend       = Number(r.spend) || 0;
      const purchases   = Number(r.purchases) || 0;
      const impressions = Number(r.impressions) || 0;
      const linkClicks  = Number(r.link_clicks) || 0;
      return {
        date: (r.date as string).slice(5),     // MM-DD
        spend,
        purchases,
        ctr: impressions > 0 ? (linkClicks * 100) / impressions : 0,
        cpm: impressions > 0 ? (spend * 1000) / impressions : 0,
      };
    });

  // ---------- 4. Ad sets + lifetime metrics ----------
  const { data: adsetRows } = await meta
    .from('ad_sets')
    .select('id, name, status, daily_budget, role, temperature_label, updated_time')
    .eq('business_unit_id', buId)
    .order('daily_budget', { ascending: false });

  interface AdsetAgg {
    spend: number;
    impressions: number;
    reach: number;                   // peak daily reach
    link_clicks: number;
    lp_views: number;
    purchases: number;
    purchase_value: number;
    revenue_tier: number;            // Fix #1: purchases × priceForDate(date) accumulated
    freq_weighted_num: number;       // Σ (impressions × frequency)
    freq_weighted_den: number;       // Σ impressions
    freq_samples: number;            // # of daily rows with impressions > 0 & reach > 0
  }
  interface AdsetDaily {
    date: string;
    spend: number;
    purchases: number;
    impressions: number;
    link_clicks: number;
    frequency: number;   // daily avg frequency (impressions / reach); 0 when no signal
  }
  const adsetInsightsById = new Map<string, AdsetAgg>();
  const adsetDailyByAdsetId = new Map<string, AdsetDaily[]>();
  const adsetEntityByAdsetId = new Map<string, string>();
  const reverseAdsetEntityById = new Map<string, string>();   // entity_id → adset_id
  {
    const { data: adsetEntities } = await meta
      .from('meta_entities')
      .select('id, meta_id')
      .eq('business_unit_id', buId)
      .eq('entity_type', 'adset');
    for (const e of (adsetEntities ?? []) as AnyRow[]) {
      adsetEntityByAdsetId.set(e.meta_id as string, e.id as string);
      reverseAdsetEntityById.set(e.id as string, e.meta_id as string);
    }
    const entityIds = Array.from(adsetEntityByAdsetId.values());
    if (entityIds.length) {
      // Fix #1: keep per-day rows so we can value purchases at the daily tier
      // price and also build a 7d learning-phase window (Fix #2) further down.
      const { data: ins } = await meta
        .from('meta_insights')
        .select('entity_id, date, spend, impressions, reach, link_clicks, landing_page_views, purchases, purchase_value, frequency')
        .in('entity_id', entityIds)
        .order('date', { ascending: true });
      const sum = new Map<string, AdsetAgg>();
      const daily = new Map<string, AdsetDaily[]>();
      for (const r of (ins ?? []) as AnyRow[]) {
        const id = r.entity_id as string;
        const date = r.date as string;
        const spend       = Number(r.spend) || 0;
        const impressions = Number(r.impressions) || 0;
        const reach       = Number(r.reach) || 0;
        const linkClicks  = Number(r.link_clicks) || 0;
        const lpViews     = Number(r.landing_page_views) || 0;
        const purchases   = Number(r.purchases) || 0;
        const purchaseVal = Number(r.purchase_value) || 0;
        const frequency   = Number(r.frequency) || 0;

        const acc = sum.get(id) ?? {
          spend: 0, impressions: 0, reach: 0, link_clicks: 0, lp_views: 0,
          purchases: 0, purchase_value: 0, revenue_tier: 0,
          freq_weighted_num: 0, freq_weighted_den: 0, freq_samples: 0,
        };
        acc.spend          += spend;
        acc.impressions    += impressions;
        acc.link_clicks    += linkClicks;
        acc.lp_views       += lpViews;
        acc.purchases      += purchases;
        acc.purchase_value += purchaseVal;
        acc.revenue_tier   += purchases * priceForDate(date);
        if (reach > acc.reach) acc.reach = reach;
        if (impressions > 0 && frequency > 0) {
          acc.freq_weighted_num += impressions * frequency;
          acc.freq_weighted_den += impressions;
          acc.freq_samples += 1;
        }
        sum.set(id, acc);

        const list = daily.get(id) ?? [];
        list.push({ date, spend, purchases, impressions, link_clicks: linkClicks, frequency });
        daily.set(id, list);
      }
      for (const [adsetId, entityId] of adsetEntityByAdsetId.entries()) {
        const s = sum.get(entityId);
        if (s) adsetInsightsById.set(adsetId, s);
        const d = daily.get(entityId);
        if (d) adsetDailyByAdsetId.set(adsetId, d);
      }
    }
  }

  // Role → short subtitle (HTML header copy)
  const roleSubtitle: Record<string, string> = {
    CUS:    'Seed + Advantage+',
    ASC:    'Advantage+ Shopping (Cold)',
    RMK:    'Retargeting Warm',
    CARTAB: 'Cart-Abandon 180d (Hottest)',
  };

  // Fix C5: compute 7d freq per adset from real per-day frequency values
  // (impressions-weighted avg of meta_insights.frequency restricted to the
  // 7d window). The previous implementation collapsed the 7d value to the
  // lifetime ratio, making `freq_daily_7d` and `freq_lifetime` identical.
  // If a BU has no frequency signal at all, both values stay null.
  const sevenAgoStr = toYmd(new Date(new Date(reportDate).getTime() - 6 * 86_400_000));
  const adsetFreq7dById = new Map<string, number | null>();
  const adsetFreqLifetimeById = new Map<string, number | null>();
  for (const [adsetId, daily] of adsetDailyByAdsetId.entries()) {
    const agg = adsetInsightsById.get(adsetId);
    if (agg && agg.freq_weighted_den > 0) {
      adsetFreqLifetimeById.set(adsetId, agg.freq_weighted_num / agg.freq_weighted_den);
    } else {
      adsetFreqLifetimeById.set(adsetId, null);
    }

    let num = 0, den = 0;
    for (const d of daily) {
      if (d.date < sevenAgoStr || d.date > reportDate) continue;
      if (d.impressions <= 0 || d.frequency <= 0) continue;
      num += d.impressions * d.frequency;
      den += d.impressions;
    }
    adsetFreq7dById.set(adsetId, den > 0 ? num / den : null);
  }

  // Fix A7: per-role breakeven override (CARTAB in particular ships a tighter
  // BE — ~$22 vs the campaign default). Resolve once per ad set so the UI
  // can render BE CPA and margin directly from the row without re-hashing
  // role-specific constants.
  const resolveBreakevenForRole = (role: string): number => {
    const override = kpi.breakeven_cpa_by_role?.[role as keyof NonNullable<KpiTargets['breakeven_cpa_by_role']>];
    return typeof override === 'number' ? override : kpi.breakeven_cpa;
  };

  const ad_sets: AdSetRow[] = ((adsetRows ?? []) as AnyRow[]).map(s => {
    const m = adsetInsightsById.get(s.id as string);
    const spend = m?.spend ?? 0;
    const purchases = m?.purchases ?? 0;
    const impressions = m?.impressions ?? 0;
    const linkClicks = m?.link_clicks ?? 0;
    const cpa = purchases > 0 ? spend / purchases : null;
    const linkCtr = impressions > 0 ? (linkClicks * 100) / impressions : 0;
    // Fix #1: ROAS must be tier-valued (what we actually charge) — not the
    // purchase_value Meta echoes back, which subreports vs our own DB.
    const revenueTier = m?.revenue_tier ?? 0;
    const roas = spend > 0 && revenueTier > 0 ? revenueTier / spend : null;
    const role = (s.role as string) ?? '—';
    const be = resolveBreakevenForRole(role);
    return {
      id: s.id as string,
      role,
      name_subtitle: roleSubtitle[role] ?? (s.name as string),
      temperature_label: (s.temperature_label as string) ?? '',
      status: (s.status as string) ?? '—',
      daily_budget: Number(s.daily_budget ?? 0),
      spend,
      purchases,
      cpa,
      breakeven_cpa: be,
      margin_per_sale: cpa != null ? be - cpa : null,
      roas,
      roas_target: kpi.target_roas,
      link_ctr: linkCtr,
      reach: m?.reach ?? 0,
      freq_daily_7d: adsetFreq7dById.get(s.id as string) ?? null,
      freq_lifetime: adsetFreqLifetimeById.get(s.id as string) ?? null,
    };
  });

  // ---------- 5. learning cards (real 7d window per adset) ----------
  // Fix #2: for every ad set, aggregate purchases/spend from meta_insights
  // rows within [reportDate-6d, reportDate]. We no longer hardcode by role;
  // every ad set appears with its real numbers.
  const adsetUpdatedTimeById = new Map<string, string | null>();
  for (const s of (adsetRows ?? []) as AnyRow[]) {
    adsetUpdatedTimeById.set(s.id as string, (s.updated_time as string) ?? null);
  }

  function humanizeEditAgo(updated: string | null): { label: string; recent: boolean } {
    if (!updated) return { label: '—', recent: false };
    const deltaMs = Date.now() - new Date(updated).getTime();
    if (!Number.isFinite(deltaMs) || deltaMs < 0) return { label: '—', recent: false };
    const hours = deltaMs / 3_600_000;
    if (hours < 24) {
      return { label: `${hours.toFixed(1)}h atrás ⚠`, recent: true };
    }
    const days = hours / 24;
    return { label: `${days.toFixed(1)}d atrás`, recent: false };
  }

  const learning_cards: LearningPhaseCard[] = ad_sets.map(s => {
    const daily = adsetDailyByAdsetId.get(s.id) ?? [];
    let p7 = 0, spend7 = 0;
    for (const d of daily) {
      if (d.date < sevenAgoStr || d.date > reportDate) continue;
      p7    += d.purchases;
      spend7 += d.spend;
    }
    const cpa7 = p7 > 0 ? spend7 / p7 : null;
    const gap = Math.max(0, 50 - p7);
    const dailyRate = p7 / 7;
    const eta_days = dailyRate > 0 && gap > 0 ? Math.round((gap / dailyRate) * 10) / 10 : null;
    const eta_date = eta_days != null
      ? toYmd(new Date(new Date(reportDate).getTime() + eta_days * 86_400_000))
      : null;

    const edit = humanizeEditAgo(adsetUpdatedTimeById.get(s.id) ?? null);
    const statusRaw = (s.status ?? '').toString().toUpperCase();
    let status: LearningPhaseCard['status'];
    if (statusRaw === 'PAUSED') status = 'paused';
    else if (p7 > 0) status = 'active';
    else if (spend7 <= 0) status = 'inactive';
    else status = 'active'; // has spend but no purchases yet — still delivering

    const early_winner = p7 >= 5 && cpa7 != null && cpa7 <= s.breakeven_cpa;
    const budgetLabel = s.daily_budget > 0 ? `$${Math.round(s.daily_budget)}/day` : '—';
    const note = `${budgetLabel} · BE CPA $${s.breakeven_cpa}${edit.recent ? ' · edit reciente (reset probable)' : ''}`;

    const statusLabel = edit.recent
      ? 'LEARNING (edit reset)'
      : status === 'paused'
      ? 'PAUSED'
      : status === 'inactive'
      ? 'INACTIVE'
      : 'LEARNING (implícito)';

    return {
      adset_id: s.id,
      role: s.role,
      label: `${s.role}${s.temperature_label ? ` — ${s.temperature_label}` : ''}`,
      purchases_7d: p7,
      target_exits: 50,
      progress_pct: (p7 / 50) * 100,
      gap,
      eta_days,
      eta_date,
      last_edit_ago: edit.label,
      last_edit_recent: edit.recent,
      spend_7d: spend7,
      cpa_7d: cpa7,
      status,
      early_winner,
      note,
      status_label: statusLabel,
    };
  });

  // ---------- 6. Recent purchases (top 10 desc) ----------
  // Fix #4: explicit ordering so "Últimas 10" truly means most recent first
  // (tie-break on purchases to favour high-signal rows on the same date).
  const { data: recent } = await meta
    .from('v_recent_purchases')
    .select('date, ad_id, ad_name, ad_set_role, temperature_label, purchases, spend, cpa_day')
    .eq('business_unit_id', buId)
    .order('date', { ascending: false })
    .order('purchases', { ascending: false })
    .limit(10);
  const recent_purchases: RecentPurchase[] = ((recent ?? []) as AnyRow[]).map(r => {
    const role = (r.ad_set_role as string) ?? '—';
    return {
      date: r.date as string,
      purchases: Number(r.purchases ?? 0),
      adset_role: role,
      ad_name: r.ad_name as string,
      temperature_label: (r.temperature_label as string) ?? '',
      spend_day: Number(r.spend ?? 0),
      cpa_day: r.cpa_day != null ? Number(r.cpa_day) : null,
      // Fix A6/A7: carry CPA thresholds from kpi_targets into each row. BE
      // respects the per-role override (e.g. CARTAB $22 tgt) via the same
      // resolver used for ad sets, so UI tone stays consistent across tables.
      cpa_target: kpi.target_cpa,
      cpa_breakeven: resolveBreakevenForRole(role),
      cpa_kill: kpi.kill_cpa,
    };
  });

  // ---------- 7. Targeting blocks ----------
  const { data: adsetFull } = await meta
    .from('ad_sets')
    .select('id, name, status, daily_budget, optimization_goal, billing_event, targeting, role, temperature_label')
    .eq('business_unit_id', buId)
    .order('daily_budget', { ascending: false });
  const targeting_blocks: TargetingBlock[] = ((adsetFull ?? []) as AnyRow[]).map(s => {
    const t = (s.targeting ?? {}) as AnyRow;
    const demo = t.demographics ?? {};
    const geo  = t.geo ?? {};
    const rows: TargetingBlock['rows'] = [];
    if (geo.countries?.length) rows.push({ label: 'Geo', value: `Countries: ${geo.countries.join(', ')}` });
    if (demo.age_min || demo.age_max) {
      const gender = typeof demo.genders === 'string'
        ? demo.genders.charAt(0).toUpperCase() + demo.genders.slice(1)
        : 'All';
      rows.push({ label: 'Demographics', value: `Age ${demo.age_min}-${demo.age_max} · Gender: ${gender}` });
    }
    if (t.custom_audiences?.length) rows.push({ label: 'Custom Audiences', value: (t.custom_audiences as string[]).join(', ') });
    if (t.excluded_custom_audiences?.length) rows.push({ label: 'Excluded', value: (t.excluded_custom_audiences as string[]).join(', ') });
    if (t.advantage_plus_audience != null) rows.push({
      label: 'Audience Expansion',
      value: t.advantage_plus_audience
        ? 'Advantage+ Audience ON (algorithm expands beyond seed)'
        : 'Advantage+ Audience OFF (hard-gated to seed)'
    });
    if (t.placements?.length) rows.push({ label: 'Placements', value: (t.placements as string[]).join(', ') });
    if (t.devices?.length) rows.push({ label: 'Devices', value: (t.devices as string[]).join(', ') });
    return {
      id: s.id as string,
      role: (s.role as string) ?? '—',
      name: s.name as string,
      temperature_label: (s.temperature_label as string) ?? '',
      budget_line: `$${s.daily_budget}/day · ${s.optimization_goal ?? ''} · ${s.billing_event ?? ''}`.trim(),
      rows,
    };
  });

  // ---------- 8. CUS saturation ----------
  // Fix #13: derive CUS freq from real per-day freq samples when available,
  // otherwise return null so the UI shows "—". Peak day = max daily freq in
  // the 7d window. `days` = total days of data we have for the CUS adset.
  const cusRow = ad_sets.find(a => a.role === 'CUS');
  const cusAdsetId = cusRow?.id;
  const cusDaily = cusAdsetId ? adsetDailyByAdsetId.get(cusAdsetId) ?? [] : [];
  const cusAgg = cusAdsetId ? adsetInsightsById.get(cusAdsetId) : undefined;
  let cusPeakDay: number | null = null;
  for (const d of cusDaily) {
    if (d.date < sevenAgoStr || d.date > reportDate) continue;
    if (d.frequency > (cusPeakDay ?? 0)) cusPeakDay = d.frequency;
  }
  if (cusPeakDay == null && cusAgg && cusAgg.freq_weighted_den > 0) {
    cusPeakDay = cusAgg.freq_weighted_num / cusAgg.freq_weighted_den;
  }
  const cus_saturation: CusSaturationBlock = {
    reach_vs_seed: {
      reach: cusRow?.reach ?? 0,
      seed:  config.cus_seed_size,
      multiplier: cusRow?.reach ? cusRow.reach / config.cus_seed_size : 0,
    },
    freq_7d: {
      value:    cusRow?.freq_daily_7d ?? null,
      peak_day: cusPeakDay,
      lifetime: cusRow?.freq_lifetime ?? null,
      days:     cusDaily.length,
    },
    link_ctr: cusRow?.link_ctr ?? 0,
    advantage_plus_status: 'EXPANDING',
  };

  // ---------- 9. Ad performance + matchups + frequency + alerts ----------
  const { data: adPerfRaw } = await meta
    .from('v_ad_performance')
    .select('ad_id, ad_name, ad_set_id, manual_status, wave, format, spend, impressions, reach, clicks, link_clicks, landing_page_views, purchases, purchase_value, link_ctr, cpa')
    .eq('business_unit_id', buId)
    .order('spend', { ascending: false });
  // map ad_set_id → role via adsetRows
  const adsetRoleById = new Map<string, string>();
  for (const s of (adsetRows ?? []) as AnyRow[]) {
    adsetRoleById.set(s.id as string, (s.role as string) ?? '—');
  }
  const totalSpendAds = ((adPerfRaw ?? []) as AnyRow[]).reduce((s, r) => s + (Number(r.spend) || 0), 0);
  const ad_performance: AdPerfRow[] = ((adPerfRaw ?? []) as AnyRow[]).map(r => {
    const status = ((r.manual_status as string) ?? 'Testing');
    let dot: AdPerfRow['status_dot'] = 'testing';
    if (/^winner$/i.test(status))  dot = 'winner';
    else if (/^watch$/i.test(status)) dot = 'watch';
    else if (/^dead$/i.test(status))  dot = 'dead';
    else if (/^active$/i.test(status)) dot = 'active';
    const spend = Number(r.spend) || 0;
    return {
      id: r.ad_id as string,
      name: r.ad_name as string,
      adset_role: adsetRoleById.get(r.ad_set_id as string) ?? '—',
      format: ((r.format as string) ?? 'IMG') as 'VID' | 'IMG',
      wave: ((r.wave as string) ?? 'W1') as 'W1' | 'W2' | 'W3',
      manual_status: status,
      status_dot: dot,
      spend,
      impressions: Number(r.impressions) || 0,
      reach: Number(r.reach) || 0,
      link_clicks: Number(r.link_clicks) || 0,
      link_ctr: Number(r.link_ctr) || 0,
      lp_views: Number(r.landing_page_views) || 0,
      purchases: Number(r.purchases) || 0,
      cpa: r.cpa != null ? Number(r.cpa) : null,
      pct_of_budget: totalSpendAds > 0 ? (spend * 100) / totalSpendAds : 0,
    };
  });

  const { data: matchupRows } = await meta
    .from('ad_matchups')
    .select('label, video_ctr, static_ctr, video_purchases, static_purchases, early_winner, display_order')
    .eq('business_unit_id', buId)
    .order('display_order', { ascending: true });
  const matchups: MatchupRow[] = ((matchupRows ?? []) as AnyRow[]).map(r => ({
    label: r.label as string,
    video_ctr: Number(r.video_ctr ?? 0),
    static_ctr: Number(r.static_ctr ?? 0),
    video_purchases: Number(r.video_purchases ?? 0),
    static_purchases: Number(r.static_purchases ?? 0),
    early_winner: (r.early_winner as string) ?? '—',
  }));

  // Fix #11: pre-compute the BU's entity id list so the frequency query is
  // scoped to this BU (the table has FK to meta_entities which is
  // organization-spanning). Fix #5: the date is report-driven and falls back
  // to the latest available date in the table when no row exists for today.
  const entityMetaMap = new Map<string, string>();
  const buEntityIds: string[] = [];
  {
    const { data: entAll } = await meta
      .from('meta_entities')
      .select('id, meta_id')
      .eq('business_unit_id', buId);
    for (const e of (entAll ?? []) as AnyRow[]) {
      entityMetaMap.set(e.id as string, e.meta_id as string);
      buEntityIds.push(e.id as string);
    }
  }

  let freqDate: string | null = reportDate;
  {
    // Probe: does reportDate have any freq rows for this BU?
    if (buEntityIds.length) {
      const { data: probe } = await meta
        .from('meta_insights_frequency')
        .select('date')
        .in('entity_id', buEntityIds)
        .eq('date', reportDate)
        .limit(1);
      if (!probe || probe.length === 0) {
        // Fallback to the most recent date available for this BU.
        const { data: latest } = await meta
          .from('meta_insights_frequency')
          .select('date')
          .in('entity_id', buEntityIds)
          .order('date', { ascending: false })
          .limit(1);
        freqDate = (latest && latest.length > 0) ? (latest[0].date as string) : null;
      }
    } else {
      freqDate = null;
    }
  }

  const { data: freqRowsRaw } = freqDate && buEntityIds.length
    ? await meta
        .from('meta_insights_frequency')
        .select('entity_id, reach, avg_frequency, bucket_1, bucket_2_3, bucket_4_5, bucket_6_10, bucket_11_20, bucket_21_plus, date')
        .eq('date', freqDate)
        .in('entity_id', buEntityIds)
    : { data: [] as AnyRow[] };
  const scopeLabel: Record<string, string> = {
    'DI21-2026-Q2': 'TOTAL', 'di21_cus': 'CUS', 'di21_asc': 'ASC', 'di21_rmk': 'RMK', 'di21_cartab': 'CARTAB',
  };
  const scopeOrder = ['TOTAL', 'CUS', 'ASC', 'RMK', 'CARTAB'];
  const frequency: FrequencyScope[] = ((freqRowsRaw ?? []) as AnyRow[])
    .map(r => {
      const b1  = Number(r.bucket_1) || 0;
      const b23 = Number(r.bucket_2_3) || 0;
      const b45 = Number(r.bucket_4_5) || 0;
      const b610 = Number(r.bucket_6_10) || 0;
      const b1120 = Number(r.bucket_11_20) || 0;
      const b21p = Number(r.bucket_21_plus) || 0;
      const total = b1 + b23 + b45 + b610 + b1120 + b21p;
      const sixPlus = b610 + b1120 + b21p;
      const pct6 = total > 0 ? (sixPlus * 100) / total : 0;
      let st: FrequencyScope['status'] = 'HEALTHY';
      if (pct6 > config.fatigue_thresholds.freq_6plus_watch_max_pct) st = 'FATIGUE';
      else if (pct6 > config.fatigue_thresholds.freq_6plus_healthy_max_pct) st = 'WATCH';
      return {
        scope: scopeLabel[entityMetaMap.get(r.entity_id as string) ?? ''] ?? '—',
        reach: Number(r.reach) || 0,
        avg_freq: Number(r.avg_frequency) || 0,
        buckets: {
          b1:       total > 0 ? (b1 * 100) / total : 0,
          b23:      total > 0 ? (b23 * 100) / total : 0,
          b45:      total > 0 ? (b45 * 100) / total : 0,
          b610:     total > 0 ? (b610 * 100) / total : 0,
          b1120:    total > 0 ? (b1120 * 100) / total : 0,
          b21plus:  total > 0 ? (b21p * 100) / total : 0,
        },
        pct_6plus: pct6,
        status: st,
      };
    })
    .sort((a, b) => scopeOrder.indexOf(a.scope) - scopeOrder.indexOf(b.scope));

  const { data: alertRows } = await meta
    .from('alerts')
    .select('alert_type, severity, message, created_at')
    .eq('business_unit_id', buId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });
  const alerts: AlertItem[] = ((alertRows ?? []) as AnyRow[]).map(r => ({
    type: r.alert_type as string,
    severity: ((r.severity as string) ?? 'blue') as AlertItem['severity'],
    message: r.message as string,
  }));

  const { data: hypRows } = await meta
    .from('hypotheses')
    .select('code, statement, current_reading, success_criteria, status, display_order')
    .eq('business_unit_id', buId)
    .order('display_order', { ascending: true });
  const hypotheses: HypothesisItem[] = ((hypRows ?? []) as AnyRow[]).map(r => ({
    code: r.code as string,
    statement: r.statement as string,
    current_reading: (r.current_reading as string) ?? '',
    success_criteria: (r.success_criteria as string) ?? '',
    status: (r.status as string) as HypothesisItem['status'],
  }));

  const { data: sigRows } = await meta
    .from('watch_signals')
    .select('signal_label, threshold_display, current_display, status, action_if_breached, display_order')
    .eq('business_unit_id', buId)
    .order('display_order', { ascending: true });
  const watch_signals: WatchSignalItem[] = ((sigRows ?? []) as AnyRow[]).map(r => ({
    label: r.signal_label as string,
    threshold: r.threshold_display as string,
    current: (r.current_display as string) ?? '—',
    status: (r.status as string) as WatchSignalItem['status'],
    action: (r.action_if_breached as string) ?? '',
  }));

  // ---------- 10. Header + progress + health ----------
  const dayIndex = diffDays(config.campaign_window.starts_on, reportDate);
  const currentPhase = config.phases.find(p => dayIndex >= p.day_start && dayIndex <= p.day_end)
    ?? config.phases[config.phases.length - 1];

  const adsetSummary = ad_sets
    .map(s => {
      const st = s.status === 'ACTIVE' ? 'ACT' : s.status === 'PAUSED' ? 'PAU' : s.status;
      return `${s.role} $${Math.round(s.daily_budget)} ${st}`;
    })
    .join(' + ');

  // ---------- Campaign config strip ----------
  const priceNow = currentTier?.price ?? kpi.revenue_per_conv;
  const campaign_config: DashboardData['campaign_config'] = [
    { label: 'Objective',   value: config.objective },
    { label: 'Event',       value: config.event_type },
    { label: 'Budget',      value: `$${config.daily_budget}/day` },
    { label: 'Target CPA',  value: `<$${kpi.target_cpa}` },
    { label: 'Breakeven',   value: `$${kpi.breakeven_cpa}` },
    { label: 'Kill CPA',    value: `$${kpi.kill_cpa} (${kpi.kill_window_days}d)` },
    { label: 'Attribution', value: config.attribution === '7d_click' ? '7d Click' : config.attribution },
    { label: 'Price',       value: `$${priceNow}` },
    { label: 'Landing',     value: config.landing_url, full_row: true },
  ];

  // ---------- Revenue tiles ----------
  const todayRow = ((campInsights ?? []) as AnyRow[]).find(r => r.date === reportDate);
  const todayPurchases = Number(todayRow?.purchases ?? 0);
  const todayRevenue = todayPurchases * priceForDate(reportDate);

  const sevenAgo = toYmd(new Date(new Date(reportDate).getTime() - 6 * 86_400_000));
  let last7Purchases = 0, last7Spend = 0, last7Revenue = 0;
  for (const r of (campInsights ?? []) as AnyRow[]) {
    if ((r.date as string) >= sevenAgo && (r.date as string) <= reportDate) {
      last7Purchases += Number(r.purchases) || 0;
      last7Spend += Number(r.spend) || 0;
      last7Revenue += (Number(r.purchases) || 0) * priceForDate(r.date as string);
    }
  }
  // Fix #9: totals are scoped to the campaign window declared on the BU
  // config (starts_on..ends_on). We clamp ends_on to reportDate so future
  // rows (if any leaked in) don't contaminate "so far" totals.
  const windowStart = config.campaign_window.starts_on;
  const windowEnd   = config.campaign_window.ends_on && config.campaign_window.ends_on < reportDate
    ? config.campaign_window.ends_on
    : reportDate;
  let totalPurchases = 0, totalSpendCampaign = 0, totalRevenue = 0;
  for (const r of (campInsights ?? []) as AnyRow[]) {
    const d = r.date as string;
    if (d < windowStart || d > windowEnd) continue;
    totalPurchases += Number(r.purchases) || 0;
    totalSpendCampaign += Number(r.spend) || 0;
    totalRevenue += (Number(r.purchases) || 0) * priceForDate(d);
  }
  const revenue_tiles: RevenueTile[] = [
    {
      label: `Hoy · ${reportDate}`, date_range: '', amount: todayRevenue,
      sub: `${todayPurchases} compras × $${priceForDate(reportDate)} (tier actual)`,
      color: 'ok',
    },
    {
      label: 'Últimos 7 días (rolling)', date_range: '', amount: last7Revenue,
      sub: `${last7Purchases} compras · spend ${money(last7Spend)} · ROAS ${last7Spend > 0 ? (last7Revenue / last7Spend).toFixed(2) : '0'}x`,
      color: 'accent',
    },
    {
      label: `Total campaña (desde ${config.campaign_window.starts_on.slice(5).replace('-', '/')})`,
      date_range: '', amount: totalRevenue,
      sub: `${totalPurchases} compras · spend ${money(totalSpendCampaign)} · ROAS ${totalSpendCampaign > 0 ? (totalRevenue / totalSpendCampaign).toFixed(2) : '0'}x`,
      color: 'warn',
    },
  ];
  const revenue_footer =
    `Cada compra se valoriza al precio del día en que ocurrió: ${price_tiers.map((t, i) => {
      const range = t.ends_on ? `${t.starts_on.slice(5)}${i === price_tiers.length - 1 ? '' : ''}` : t.starts_on.slice(5);
      return `$${t.price} ${i === 0 ? 'hasta' : 'del'} ${range}${t.ends_on ? '–' + t.ends_on.slice(5) : ''}`;
    }).join(', ')}.`;

  // ---------- KPI grid ----------
  const cpa = totalPurchases > 0 ? lifetime.spend / totalPurchases : 0;
  const cpc = lifetime.link_clicks > 0 ? lifetime.spend / lifetime.link_clicks : 0;
  const cpm = lifetime.impressions > 0 ? (lifetime.spend * 1000) / lifetime.impressions : 0;
  const linkCtrPct = lifetime.impressions > 0 ? (lifetime.link_clicks * 100) / lifetime.impressions : 0;
  const clickToLp = lifetime.link_clicks > 0 ? (lifetime.lp_views * 100) / lifetime.link_clicks : 0;
  // Fix #6 + #12: Meta does not expose rolling unique reach via daily
  // campaign insights; summing daily reach double-counts users across days.
  // Use max(reach) in the 7d window as a conservative approximation
  // ("reach pico 7d"). Any hardcoded fallback has been removed — a 0 means
  // "no reach data in window" and the UI must render it as-is or "—".
  const last7Reach = ((campInsights ?? []) as AnyRow[])
    .filter(r => (r.date as string) >= sevenAgo && (r.date as string) <= reportDate)
    .reduce((m, r) => Math.max(m, Number(r.reach) || 0), 0);
  const roasEst = totalSpendCampaign > 0 ? totalRevenue / totalSpendCampaign : 0;
  const pacingTone = (n: number, warn: number, bad: number): KpiCell['tone'] => n <= warn ? 'ok' : n <= bad ? 'warn' : 'bad';

  const todaySpend = Number(todayRow?.spend ?? 0);

  const kpis: KpiCell[] = [
    {
      label: 'Total Spend', value: money(lifetime.spend), tone: 'neutral',
      sub: `${money(todaySpend)} today`,
    },
    {
      label: 'CPA (Purchase)', value: money(cpa), tone: cpa <= kpi.target_cpa ? 'ok' : cpa <= kpi.breakeven_cpa ? 'warn' : 'bad',
      sub: `Breakeven tier $${priceNow}: $${kpi.breakeven_cpa} | Kill: >$${kpi.kill_cpa}`,
    },
    {
      label: 'Total Reach', value: num(lifetime.reach), tone: 'neutral',
      sub: ad_sets.map(s => `${s.role}: ${num(s.reach)}`).join(' · '),
    },
    {
      label: 'Reach 7d', value: num(last7Reach), tone: 'neutral',
      sub: cusRow?.freq_daily_7d != null ? `Freq 7d (CUS): ${cusRow.freq_daily_7d.toFixed(2)}` : 'Freq 7d: —',
    },
    {
      label: 'ROAS (Est.)', value: `${roasEst.toFixed(1)}x`, tone: roasEst >= kpi.target_roas ? 'ok' : 'warn',
      sub: `${totalPurchases}p blended @ ${money(totalRevenue / Math.max(1, totalPurchases))} = ${money(totalRevenue)}`,
    },
    {
      label: 'Link CTR', value: pct(linkCtrPct, 2), tone: linkCtrPct >= config.link_ctr_target ? 'ok' : linkCtrPct >= config.link_ctr_warn ? 'warn' : 'bad',
      sub: `Target >${config.link_ctr_target}%`,
    },
    {
      label: 'CPM', value: money(cpm), tone: cpm < config.cpm_threshold ? 'ok' : 'warn',
      sub: `Threshold <${money(config.cpm_threshold)}`,
    },
    // Fix #13: freq comes from real per-adset data (CUS). If no freq signal
    // (e.g. early campaign days without reach samples), show "—" instead of
    // baked-in fixture numbers.
    (() => {
      const f7 = cusRow?.freq_daily_7d ?? null;
      const fL = cusRow?.freq_lifetime ?? null;
      return {
        label: 'Freq Daily (7d avg)',
        value: f7 != null ? f7.toFixed(2) : '—',
        tone: f7 != null
          ? pacingTone(f7, config.fatigue_thresholds.cus_daily_freq_watch, config.fatigue_thresholds.cus_daily_freq_alert)
          : ('neutral' as KpiCell['tone']),
        sub: `Watch >${config.fatigue_thresholds.cus_daily_freq_watch.toFixed(1)} | Lifetime: ${fL != null ? fL.toFixed(2) : '—'}`,
      };
    })(),
    {
      label: 'Purchases', value: String(totalPurchases), tone: 'ok',
      sub: `${todayPurchases} today`,
    },
    {
      label: 'LP Views', value: num(lifetime.lp_views), tone: 'neutral',
      sub: `${clickToLp.toFixed(0)}% click-to-LP`,
    },
    {
      label: 'Click-to-LP%', value: pct(clickToLp, 1), tone: clickToLp >= config.click_to_lp_target ? 'ok' : 'warn',
      sub: `Target >${config.click_to_lp_target}%`,
    },
    {
      label: 'Impressions', value: num(lifetime.impressions), tone: 'neutral',
      sub: `${num(Number(todayRow?.impressions ?? 0))} today`,
    },
    {
      label: 'CPC', value: money(cpc), tone: 'ok',
      sub: 'Link CPC',
    },
  ];

  const funnel_raw = [
    { label: 'Impressions',   value: lifetime.impressions },
    { label: 'Link Clicks',   value: lifetime.link_clicks },
    { label: 'LP Views',      value: lifetime.lp_views },
    { label: 'Init Checkout', value: lifetime.initiate_checkout },
    { label: 'Purchase',      value: totalPurchases },
  ];
  const funnel: FunnelStep[] = funnel_raw.map((s, i, arr) => {
    if (i === 0) return { ...s, conv_pct_from_prev: null, drop_pct_from_prev: null };
    const prev = arr[i - 1].value;
    const conv = prev > 0 ? (s.value * 100) / prev : 0;
    return { ...s, conv_pct_from_prev: conv, drop_pct_from_prev: 100 - conv };
  });

  // ---------- Health score (Fix C4) ----------
  // Blueprint weights: Economics 30% · Signal 20% · Creative 20% · Funnel 15%
  // · Pacing 15%. Each sub-score is bounded to [0,100]. We no longer surface
  // Learning / Frequency in the breakdown (they were dominated by the
  // placeholder Frequency=80, which masked real economic problems).
  const toneFromScore = (s: number): HealthBreakdown['tone'] =>
    s >= 80 ? 'ok' : s >= 50 ? 'warn' : 'bad';
  const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

  // Economics (30%): CPA vs target / breakeven / kill. Piecewise-linear so
  // the dial degrades smoothly as CPA drifts above target. When we have no
  // purchases (cpa=0), we keep the slot at 50 (insufficient signal) rather
  // than rewarding an absence of cost.
  let economicsScore: number;
  let economicsSub: string;
  if (totalPurchases === 0) {
    economicsScore = 50;
    economicsSub = 'no purchases yet';
  } else if (cpa <= kpi.target_cpa) {
    economicsScore = 100;
    economicsSub = `CPA ${money(cpa)} ≤ target ${money(kpi.target_cpa)}`;
  } else if (cpa <= kpi.breakeven_cpa) {
    // Interpolate 100 → 50 between target and breakeven.
    const span = Math.max(1, kpi.breakeven_cpa - kpi.target_cpa);
    economicsScore = Math.round(100 - 50 * ((cpa - kpi.target_cpa) / span));
    economicsSub = `CPA ${money(cpa)} ∈ (target ${money(kpi.target_cpa)}, BE ${money(kpi.breakeven_cpa)}]`;
  } else if (cpa <= kpi.kill_cpa) {
    const span = Math.max(1, kpi.kill_cpa - kpi.breakeven_cpa);
    economicsScore = Math.round(50 - 50 * ((cpa - kpi.breakeven_cpa) / span));
    economicsSub = `CPA ${money(cpa)} ∈ (BE ${money(kpi.breakeven_cpa)}, kill ${money(kpi.kill_cpa)}]`;
  } else {
    economicsScore = 0;
    economicsSub = `CPA ${money(cpa)} > kill ${money(kpi.kill_cpa)}`;
  }
  economicsScore = clamp(economicsScore);

  // Signal (20%): # of days with purchases > 0 in the last 7d window
  // (proxy for conversion signal density feeding the optimiser).
  let daysWithPurchases7d = 0;
  for (const r of (campInsights ?? []) as AnyRow[]) {
    const d = r.date as string;
    if (d < sevenAgoStr || d > reportDate) continue;
    if ((Number(r.purchases) || 0) > 0) daysWithPurchases7d += 1;
  }
  const signalScore = daysWithPurchases7d >= 5 ? 100 : daysWithPurchases7d >= 2 ? 50 : 0;
  const signalSub = `${daysWithPurchases7d}/7 days with purchases`;

  // Creative (20%): link CTR vs configured target / warn.
  let creativeScore: number;
  if (linkCtrPct >= config.link_ctr_target) creativeScore = 100;
  else if (linkCtrPct >= config.link_ctr_warn) creativeScore = 50;
  else creativeScore = 0;
  const creativeSub = `Link CTR ${linkCtrPct.toFixed(2)}% (target ${config.link_ctr_target}% / warn ${config.link_ctr_warn}%)`;

  // Funnel (15%): click-to-LP vs target. Soft floor at 70% of target.
  let funnelScore: number;
  if (clickToLp >= config.click_to_lp_target) funnelScore = 100;
  else if (clickToLp >= config.click_to_lp_target * 0.7) funnelScore = 50;
  else funnelScore = 0;
  const funnelSub = `Click→LP ${clickToLp.toFixed(1)}% (target ${config.click_to_lp_target}%)`;

  // Pacing (15%): today's spend vs daily budget. Continuous around 1.0 so a
  // campaign at 0.61x doesn't score identically to one at 1.29x. Outside
  // [0.6, 1.3] the score drops linearly toward 0.
  const pacingRatio = config.daily_budget > 0 ? todaySpend / config.daily_budget : 0;
  let pacingScore: number;
  if (config.daily_budget <= 0) {
    pacingScore = 50;
  } else if (pacingRatio >= 0.6 && pacingRatio <= 1.3) {
    // Inside the healthy band: peak at 1.0, mild penalty at edges.
    const dist = Math.abs(pacingRatio - 1);
    pacingScore = Math.round(100 - 30 * (dist / 0.3));
  } else {
    // Outside the band: fall off to 0 over the same distance again.
    const bandMiss = pacingRatio < 0.6 ? 0.6 - pacingRatio : pacingRatio - 1.3;
    pacingScore = Math.round(clamp(50 - (bandMiss / 0.6) * 50));
  }
  pacingScore = clamp(pacingScore);
  const pacingSub = config.daily_budget > 0
    ? `${(pacingRatio * 100).toFixed(0)}% of daily budget`
    : 'no daily budget set';

  const healthBreakdown: HealthBreakdown[] = [
    { label: 'Economics', score: economicsScore, tone: toneFromScore(economicsScore), weight: 30, sub: economicsSub },
    { label: 'Signal',    score: signalScore,    tone: toneFromScore(signalScore),    weight: 20, sub: signalSub },
    { label: 'Creative',  score: creativeScore,  tone: toneFromScore(creativeScore),  weight: 20, sub: creativeSub },
    { label: 'Funnel',    score: funnelScore,    tone: toneFromScore(funnelScore),    weight: 15, sub: funnelSub },
    { label: 'Pacing',    score: pacingScore,    tone: toneFromScore(pacingScore),    weight: 15, sub: pacingSub },
  ];
  const healthScore = Math.round(
    healthBreakdown.reduce((sum, b) => sum + (b.weight ?? 0) * b.score, 0) / 100,
  );
  const healthTone: 'ok' | 'warn' | 'bad' =
    healthScore >= 80 ? 'ok' : healthScore >= 50 ? 'warn' : 'bad';
  const healthLabel =
    healthTone === 'ok' ? 'HEALTHY' : healthTone === 'warn' ? 'WATCH' : 'CRITICAL';
  const health = {
    score: healthScore,
    label: healthLabel,
    tone: healthTone,
    breakdown: healthBreakdown,
  };

  // ---------- freshness_utc (Fix #7) ----------
  // Surface the last time /api/refresh was triggered for this BU. We read the
  // most recent row across users (the table is keyed by user_id + bu). If no
  // row exists yet (fresh BU), fall back to "now" so the badge still renders.
  let freshnessUtc = '—';
  {
    const { data: refresh } = await meta
      .from('refresh_rate_limit')
      .select('last_refresh_at')
      .eq('business_unit_id', buId)
      .order('last_refresh_at', { ascending: false })
      .limit(1);
    const last = refresh && refresh.length > 0 ? (refresh[0].last_refresh_at as string) : null;
    if (last) {
      freshnessUtc = `${new Date(last).toISOString().slice(11, 16)} UTC`;
    } else {
      freshnessUtc = `${new Date().toISOString().slice(11, 16)} UTC`;
    }
  }

  return {
    bu: {
      id: buId,
      organizer_slug: params.organizerSlug,
      bu_slug: params.buSlug,
      name: bu.name as string,
      config,
      kpi_targets: kpi,
    },
    header: {
      report_date: reportDate,
      campaign_code: config.campaign_code,
      campaign_label: config.campaign_label,
      day_index: dayIndex,
      total_days: config.campaign_window.duration_days,
      adset_summary: `ABO (${adsetSummary})`,
      freshness_utc: freshnessUtc,
      status_badge: currentPhase.key === 'scaling' ? 'SCALING' : currentPhase.label.toUpperCase(),
      health_label: `${health.label} (${health.score})`,
    },
    progress: {
      day_index: dayIndex,
      total_days: config.campaign_window.duration_days,
      spend_so_far: totalSpendCampaign,
      total_budget: config.total_budget,
      // Fix A3: progress bar reflects calendar progress (day N of D_total),
      // matching the blueprint's 15/19 = 78.9% rather than spend / budget
      // (which under-reads when we're pacing below plan). The spend-based
      // figure is still exposed for any ancillary UI that needs it.
      progress_pct: config.campaign_window.duration_days > 0
        ? (dayIndex / config.campaign_window.duration_days) * 100
        : 0,
      progress_pct_budget: config.total_budget > 0
        ? (totalSpendCampaign / config.total_budget) * 100
        : 0,
      current_phase_key: currentPhase.key,
      phases: config.phases,
    },
    health,
    campaign_config,
    price_tiers,
    revenue_tiles,
    revenue_footer,
    kpis,
    ad_sets,
    learning_cards,
    recent_purchases,
    targeting_blocks,
    cus_saturation,
    trend,
    funnel,
    ad_performance,
    matchups,
    frequency,
    alerts,
    hypotheses,
    watch_signals,
  };
}
