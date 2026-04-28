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
  // Semantic bucket used by the UI to pick colour. Keeps the render layer
  // dumb: the adapter owns the rules, the card just maps bucket → badge.
  // Precedence when computing the bucket:
  //   paused          → status === 'paused'
  //   inactive        → status === 'inactive'   (spent nothing in 7d)
  //   early_winner    → ≥5 purchases 7d AND CPA ≤ breakeven
  //   edit_reset      → recent edit (<24h) AND delivering
  //   learning        → default, still below the 50/7d exit target
  state: 'paused' | 'inactive' | 'early_winner' | 'edit_reset' | 'learning';
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

/**
 * One row in the "Recent Budget Bumps" table — a single change to an ACTIVE
 * ad set's daily_budget, projected with the human-readable ad-set name and
 * role for display. `direction` lets the UI render an arrow + colour without
 * recomputing the sign on the client.
 */
export interface BudgetBumpRow {
  ad_set_id: string;
  ad_set_name: string;
  role: string;
  prev_budget: number | null;
  new_budget: number;
  delta_amount: number;            // new - (prev ?? 0)
  delta_pct: number | null;        // null for INITIAL or prev=0
  direction: 'UP' | 'DOWN' | 'INITIAL';
  changed_at: string;              // ISO timestamp
  detected_via: 'pull' | 'manual_refresh' | 'backfill';
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
  adset_name: string;
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

export type RangePreset = '7d' | '30d' | '90d' | 'campaign' | 'custom';

export interface DashboardRange {
  start: string;                     // YYYY-MM-DD (inclusive)
  end: string;                       // YYYY-MM-DD (inclusive)
  preset: RangePreset;
  label: string;                     // UI-friendly label (e.g. "Últimos 30 días")
  days: number;                      // number of days in the range (inclusive)
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
  /**
   * Last 5 calendar days immediately prior to the report date. Ordered from
   * most recent (index 0) to oldest (index 4). Each tile mirrors the HOY
   * card styling so operators can spot day-over-day momentum at a glance.
   */
  recent_daily_tiles: RevenueTile[];
  revenue_footer: string;
  kpis: KpiCell[];
  ad_sets: AdSetRow[];
  learning_cards: LearningPhaseCard[];
  recent_purchases: RecentPurchase[];
  /**
   * Last 30 days of daily_budget changes on ACTIVE ad sets, newest first.
   * Sourced from `meta_ops.ad_set_budget_history` (populated by the pull job
   * diff and a one-shot Activity Log backfill). Operators use this to spot
   * recent pacing decisions when explaining day-over-day swings.
   */
  budget_bumps: BudgetBumpRow[];
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
  range: DashboardRange;
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

/**
 * Current hour-of-day (0-23.999) in the given IANA timezone. We return a
 * float so pacing can be normalised mid-hour (e.g. 10:30 → 10.5).
 */
function hourInTimezone(timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find(p => p.type === 'hour')?.value ?? '0');
  const m = Number(parts.find(p => p.type === 'minute')?.value ?? '0');
  return h + m / 60;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isValidIsoDate(s: string | undefined | null): s is string {
  return !!s && ISO_DATE_RE.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
}

function rangeLabelFor(preset: RangePreset, start: string, end: string, days: number): string {
  switch (preset) {
    case '7d':       return 'Últimos 7 días';
    case '30d':      return 'Últimos 30 días';
    case '90d':      return 'Últimos 90 días';
    case 'campaign': return 'Total campaña';
    case 'custom':
    default:         return `${start} → ${end} · ${days}d`;
  }
}

function resolveRange(
  input: { from?: string; to?: string; preset?: string } | undefined,
  timezone: string,
  campaignStart: string,
  campaignEnd: string | null,
): DashboardRange {
  const today = todayInTimezone(timezone);
  const campaignEffectiveEnd = campaignEnd && campaignEnd < today ? campaignEnd : today;

  const rawPreset = input?.preset;
  let preset: RangePreset;
  if (rawPreset === '7d' || rawPreset === '30d' || rawPreset === '90d' || rawPreset === 'campaign' || rawPreset === 'custom') {
    preset = rawPreset;
  } else if (isValidIsoDate(input?.from) || isValidIsoDate(input?.to)) {
    preset = 'custom';
  } else {
    preset = '30d';
  }

  let end: string;
  let start: string;

  if (preset === 'custom') {
    // User-specified bounds (either from / to or both). Anything missing
    // falls back to today / 30d-ago as a safety net.
    end = isValidIsoDate(input?.to) ? (input!.to as string) : today;
    if (end > today) end = today;
    if (isValidIsoDate(input?.from)) {
      start = input!.from as string;
    } else {
      const endMs = new Date(`${end}T00:00:00Z`).getTime();
      start = toYmd(new Date(endMs - 29 * 86_400_000));
    }
  } else if (preset === 'campaign') {
    start = campaignStart;
    end   = campaignEffectiveEnd;
  } else {
    end = today;
    const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;
    const endMs = new Date(`${end}T00:00:00Z`).getTime();
    start = toYmd(new Date(endMs - (days - 1) * 86_400_000));
  }

  if (start > end) start = end;
  const days = diffDays(start, end);
  return { start, end, preset, label: rangeLabelFor(preset, start, end, days), days };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

export async function loadDashboard(params: {
  organizerSlug: string;
  buSlug: string;
  /**
   * Report "corte" (anchor date). Defaults to today in the BU's timezone.
   * If `range` is provided, its `end` takes precedence over this field.
   */
  reportDate?: string;
  /**
   * User-selected date range. All range-aware sections (KPIs, trend, ad
   * sets, ad performance, funnel, tile central) will respect this window.
   * Lifetime-scoped sections (progress, Total campaña tile, Health Score,
   * Learning cards) remain fixed regardless of this input.
   */
  range?: { from?: string; to?: string; preset?: string };
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

  // Resolve the user-selected date range. Defaults to "Últimos 30 días".
  // Range applies to: KPIs, trend chart, tile central (range tile), ad sets,
  // ad performance, funnel. Fixed (lifetime-scoped) sections: progress bar /
  // Day N of D, Total campaña tile, Health Score, Learning cards (7d), Recent
  // purchases, Alerts, Watch signals, Frequency snapshot.
  const range = resolveRange(
    params.range,
    timezone,
    config.campaign_window.starts_on,
    config.campaign_window.ends_on ?? null,
  );
  const rangeStart = range.start;
  const rangeEnd = range.end;

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

  // Totals: two parallel accumulators over campaign-daily rows.
  //   • `totalMetrics`  — scoped to the BU's declared campaign_window. Drives
  //     the "Total campaña" tile, Health Score (economics / creative / funnel),
  //     and anything else that must stay lifetime-constant.
  //   • `windowMetrics` — scoped to the user-selected range. Drives KPI grid,
  //     trend chart, range revenue tile, funnel, and (downstream) ad sets /
  //     ad performance insights.
  // A single pass over campInsights fills both so we never fetch twice.
  const lifetimeWindowStart = config.campaign_window.starts_on;
  const lifetimeWindowEnd   = config.campaign_window.ends_on && config.campaign_window.ends_on < reportDate
    ? config.campaign_window.ends_on
    : reportDate;
  const emptyMetrics = () => ({
    spend: 0, impressions: 0, reach: 0, clicks: 0, link_clicks: 0,
    lp_views: 0, initiate_checkout: 0, purchases: 0, purchase_value: 0,
    revenue_tier: 0,
  });
  const totalMetrics  = emptyMetrics();
  const windowMetrics = emptyMetrics();
  let totalReachMax = 0;
  let windowReachMax = 0;
  for (const r of (campInsights ?? []) as AnyRow[]) {
    const d = (r.date as string) ?? '';
    const spend       = Number(r.spend) || 0;
    const impressions = Number(r.impressions) || 0;
    const reach       = Number(r.reach) || 0;
    const clicks      = Number(r.clicks) || 0;
    const linkClicks  = Number(r.link_clicks) || 0;
    const lpViews     = Number(r.landing_page_views) || 0;
    const ic          = Number(r.initiate_checkout) || 0;
    const purchases   = Number(r.purchases) || 0;
    const purchaseVal = Number(r.purchase_value) || 0;
    const price       = priceForDate(d);
    if (d >= lifetimeWindowStart && d <= lifetimeWindowEnd) {
      totalMetrics.spend             += spend;
      totalMetrics.impressions       += impressions;
      totalMetrics.clicks            += clicks;
      totalMetrics.link_clicks       += linkClicks;
      totalMetrics.lp_views          += lpViews;
      totalMetrics.initiate_checkout += ic;
      totalMetrics.purchases         += purchases;
      totalMetrics.purchase_value    += purchaseVal;
      totalMetrics.revenue_tier      += purchases * price;
      // Fix A4: Total Reach lifetime = MAX(daily reach) across the window.
      // Summing would triple-count users; picking the last-non-zero row was a
      // stale proxy and tended to under-report. MAX approximates Ads Manager's
      // "daily unique reach max" within the window.
      if (reach > totalReachMax) totalReachMax = reach;
    }
    if (d >= rangeStart && d <= rangeEnd) {
      windowMetrics.spend             += spend;
      windowMetrics.impressions       += impressions;
      windowMetrics.clicks            += clicks;
      windowMetrics.link_clicks       += linkClicks;
      windowMetrics.lp_views          += lpViews;
      windowMetrics.initiate_checkout += ic;
      windowMetrics.purchases         += purchases;
      windowMetrics.purchase_value    += purchaseVal;
      windowMetrics.revenue_tier      += purchases * price;
      if (reach > windowReachMax) windowReachMax = reach;
    }
  }
  totalMetrics.reach  = totalReachMax;
  windowMetrics.reach = windowReachMax;

  // Fix #10: guard every Number(r.field) with || 0 so that NULLs from the
  // DB don't poison the charts with NaN.
  // Trend chart follows the user-selected range. Falls back to the lifetime
  // window only when the range is exactly the campaign ("Total campaña"
  // preset), so the chart always matches the tiles the operator is reading.
  const trend: TrendPoint[] = ((campInsights ?? []) as AnyRow[])
    .filter(r => {
      const d = (r.date as string) ?? '';
      return d >= rangeStart && d <= rangeEnd;
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
      // The ad-set roll-up (`sum`) respects the user range so the table
      // matches the KPI grid and trend. Daily rows (`daily`) remain global
      // because Learning cards always compute over a rolling 7d window and
      // per-role frequency needs every sample to weight correctly.
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

        const list = daily.get(id) ?? [];
        list.push({ date, spend, purchases, impressions, link_clicks: linkClicks, frequency });
        daily.set(id, list);

        if (date < rangeStart || date > rangeEnd) continue;

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
  // Lifetime is derived from the full `daily` series (unaffected by the
  // user-selected range), so the KPI sub-label "Lifetime: X" stays stable
  // no matter which date window the operator picks.
  const sevenAgoStr = toYmd(new Date(new Date(reportDate).getTime() - 6 * 86_400_000));
  const adsetFreq7dById = new Map<string, number | null>();
  const adsetFreqLifetimeById = new Map<string, number | null>();
  for (const [adsetId, daily] of adsetDailyByAdsetId.entries()) {
    let numLife = 0, denLife = 0;
    let num = 0, den = 0;
    for (const d of daily) {
      if (d.impressions > 0 && d.frequency > 0) {
        numLife += d.impressions * d.frequency;
        denLife += d.impressions;
      }
      if (d.date >= sevenAgoStr && d.date <= reportDate && d.impressions > 0 && d.frequency > 0) {
        num += d.impressions * d.frequency;
        den += d.impressions;
      }
    }
    adsetFreqLifetimeById.set(adsetId, denLife > 0 ? numLife / denLife : null);
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

  const ad_setsUnsorted: AdSetRow[] = ((adsetRows ?? []) as AnyRow[]).map(s => {
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

  // Default order: ACTIVE first, everything else (PAUSED / INACTIVE / unknown)
  // sunk to the bottom, both groups sorted by spend descending so the heaviest
  // spenders surface first. Mirrors the `ad_performance` policy. The client
  // table respects this ordering when no explicit sort is applied.
  const ad_sets: AdSetRow[] = [...ad_setsUnsorted].sort((a, b) => {
    const aActive = a.status === 'ACTIVE' ? 0 : 1;
    const bActive = b.status === 'ACTIVE' ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return b.spend - a.spend;
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

    // Status precedence: hard delivery state (PAUSED/INACTIVE) wins over the
    // edit-reset hint, otherwise pausing an ad set with a recent edit would
    // still render as "LEARNING (edit reset)" — misleading the operator into
    // thinking it's still spending and resetting learning. Winner overrides
    // the edit-reset hint because breaking CPA is the meaningful signal even
    // if the ad set was just tweaked.
    let state: LearningPhaseCard['state'];
    let statusLabel: string;
    if (status === 'paused') {
      state = 'paused';
      statusLabel = 'PAUSED';
    } else if (status === 'inactive') {
      state = 'inactive';
      statusLabel = 'INACTIVE';
    } else if (early_winner) {
      state = 'early_winner';
      statusLabel = 'EARLY WINNER';
    } else if (edit.recent) {
      state = 'edit_reset';
      statusLabel = 'LEARNING (edit reset)';
    } else {
      state = 'learning';
      statusLabel = 'LEARNING (implícito)';
    }

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
      state,
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
    // Audiences come from Meta as `{ id, name }` objects (not raw strings).
    // We render the friendly `name` and fall back to `id` for any audience
    // missing a name. Anything else becomes `<unknown>` so we never leak
    // the literal "[object Object]" into the UI.
    const fmtAudience = (a: unknown): string => {
      if (typeof a === 'string') return a;
      if (a && typeof a === 'object') {
        const o = a as { name?: unknown; id?: unknown };
        if (typeof o.name === 'string' && o.name.trim()) return o.name;
        if (o.id != null) return String(o.id);
      }
      return '<unknown>';
    };
    if (Array.isArray(t.custom_audiences) && t.custom_audiences.length) {
      rows.push({ label: 'Custom Audiences', value: (t.custom_audiences as unknown[]).map(fmtAudience).join(', ') });
    }
    if (Array.isArray(t.excluded_custom_audiences) && t.excluded_custom_audiences.length) {
      rows.push({ label: 'Excluded', value: (t.excluded_custom_audiences as unknown[]).map(fmtAudience).join(', ') });
    }
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

  // ---------- 8. Ad set lookup maps (used by 8.5 and section 9) ----------
  // map ad_set_id → role / name / daily_budget / status. Role is shown in
  // the table; name populates the new "Ad Set" column; daily budget feeds
  // the auto-classification thresholds in section 9 (e.g. an ad with spend
  // ≥ 1× ad_set daily_budget and zero purchases enters "watch"); status
  // scopes the budget-bumps table to ACTIVE in section 8.5.
  const adsetRoleById   = new Map<string, string>();
  const adsetNameById   = new Map<string, string>();
  const adsetBudgetById = new Map<string, number>();
  // Track ACTIVE status by id so we can scope downstream views (e.g. the
  // budget-bumps table) without re-querying the ad_sets table.
  const adsetStatusById = new Map<string, string>();
  for (const s of (adsetRows ?? []) as AnyRow[]) {
    adsetRoleById.set(s.id as string, (s.role as string) ?? '—');
    adsetNameById.set(s.id as string, (s.name as string) ?? '—');
    adsetBudgetById.set(s.id as string, Number(s.daily_budget) || 0);
    adsetStatusById.set(s.id as string, (s.status as string) ?? 'UNKNOWN');
  }

  // ---------- 8.5 Recent budget bumps (last 30d, ACTIVE only) ----------
  // Sourced from `meta_ops.ad_set_budget_history` (forward-pull diff +
  // optional Activity Log backfill). The history table's UNIQUE index
  // dedupes the two writers WHEN they truncate `changed_at` to the minute
  // (see service.ts/budget-history.ts). We add a second-line read-time
  // dedup below to be defensive in case the contract is ever broken.
  //
  // ACTIVE filter goes in SQL via a list of ad set ids — the previous
  // client-side filter combined with `LIMIT 200` could return zero rows
  // for a BU with many paused historical bumps even though there were
  // recent ACTIVE ones in the table.
  const activeAdSetIds: string[] = [];
  for (const [id, status] of adsetStatusById) {
    if (status === 'ACTIVE') activeAdSetIds.push(id);
  }

  let budget_bumps: BudgetBumpRow[] = [];
  if (activeAdSetIds.length > 0) {
    const bumpsCutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const { data: bumpRows } = await meta
      .from('ad_set_budget_history')
      .select(
        'ad_set_id, prev_budget, new_budget, delta_amount, delta_pct, direction, changed_at, detected_via',
      )
      .eq('business_unit_id', buId)
      .in('ad_set_id', activeAdSetIds)
      .gte('changed_at', bumpsCutoff)
      .order('changed_at', { ascending: false })
      .limit(200);

    // Defensive read-time dedup keyed on the same tuple as the unique index,
    // in case any historical rows pre-date the minute-truncation contract.
    const seen = new Set<string>();
    for (const b of (bumpRows ?? []) as AnyRow[]) {
      const id = b.ad_set_id as string;
      const name = adsetNameById.get(id);
      if (!name) continue; // ad set since deleted from meta_ops.ad_sets
      const ts = b.changed_at as string;
      // Truncate to minute for the dedup key — mirrors the writer contract.
      const minute = ts ? ts.slice(0, 16) : '';
      const key = `${id}|${minute}|${Number(b.new_budget ?? 0)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      budget_bumps.push({
        ad_set_id: id,
        ad_set_name: name,
        role: adsetRoleById.get(id) ?? '—',
        prev_budget: b.prev_budget != null ? Number(b.prev_budget) : null,
        new_budget: Number(b.new_budget ?? 0),
        delta_amount: Number(b.delta_amount ?? 0),
        delta_pct: b.delta_pct != null ? Number(b.delta_pct) : null,
        direction: (b.direction as 'UP' | 'DOWN' | 'INITIAL') ?? 'UP',
        changed_at: ts,
        detected_via:
          (b.detected_via as 'pull' | 'manual_refresh' | 'backfill') ?? 'pull',
      });
    }
  }

  // ---------- 9. Ad performance + matchups + frequency + alerts ----------
  // Ad-level performance must respect the user range as well. The
  // `v_ad_performance` view aggregates lifetime so we reconstruct the rows
  // directly from `ads` + `meta_entities` + `meta_insights` filtered by
  // [rangeStart, rangeEnd]. Ads with zero rows in the window still surface
  // (with zeros) so operators can see an ad is paused / not delivering.
  // NOTE: `meta_ops.ads.id` is text and is itself the Meta ad id (the table
  // does not expose a separate `meta_id` column, unlike ad_sets / campaigns).
  // We therefore project `id` and use it as both the row key and the join
  // value against `meta_entities.meta_id` below.
  const { data: adMeta } = await meta
    .from('ads')
    .select('id, name, ad_set_id, manual_status, wave, format, status, effective_status')
    .eq('business_unit_id', buId);

  const { data: adEntities } = await meta
    .from('meta_entities')
    .select('id, meta_id')
    .eq('business_unit_id', buId)
    .eq('entity_type', 'ad');
  const adEntityMetaToId = new Map<string, string>();
  const adEntityIds: string[] = [];
  for (const e of (adEntities ?? []) as AnyRow[]) {
    adEntityMetaToId.set(e.meta_id as string, e.id as string);
    adEntityIds.push(e.id as string);
  }

  interface AdAgg {
    spend: number;
    impressions: number;
    reach: number;
    link_clicks: number;
    lp_views: number;
    purchases: number;
    purchase_value: number;
  }
  const adAggByEntityId = new Map<string, AdAgg>();
  if (adEntityIds.length) {
    const { data: adInsRows } = await meta
      .from('meta_insights')
      .select('entity_id, date, spend, impressions, reach, link_clicks, landing_page_views, purchases, purchase_value')
      .in('entity_id', adEntityIds)
      .gte('date', rangeStart)
      .lte('date', rangeEnd);
    for (const r of (adInsRows ?? []) as AnyRow[]) {
      const id = r.entity_id as string;
      const acc = adAggByEntityId.get(id) ?? {
        spend: 0, impressions: 0, reach: 0, link_clicks: 0, lp_views: 0,
        purchases: 0, purchase_value: 0,
      };
      acc.spend       += Number(r.spend) || 0;
      acc.impressions += Number(r.impressions) || 0;
      const reach = Number(r.reach) || 0;
      if (reach > acc.reach) acc.reach = reach;         // MAX daily reach
      acc.link_clicks += Number(r.link_clicks) || 0;
      acc.lp_views    += Number(r.landing_page_views) || 0;
      acc.purchases   += Number(r.purchases) || 0;
      acc.purchase_value += Number(r.purchase_value) || 0;
      adAggByEntityId.set(id, acc);
    }
  }

  // -----------------------------------------------------------------------
  // Auto-classification: derive a status_dot from live metrics so the table
  // is meaningful even when nobody has touched `manual_status`. The bootstrap
  // seed leaves every ad as 'Testing', which made the column useless.
  //
  // Precedence:
  //   1. Hard delivery state from Meta (PAUSED / DELETED) → 'dead'.
  //   2. Explicit operator override (manual_status set to something other
  //      than the bootstrap 'Testing') → respect it. This keeps an escape
  //      hatch for humans without changing the schema.
  //   3. Auto rules from spend / purchases / CPA vs the BU's breakeven_cpa,
  //      kill_cpa and the ad set's daily_budget (used as a "delivery unit"
  //      to decide when an ad has had a fair chance).
  //
  // Rules (evaluated top-down, first match wins):
  //   • winner : purchases ≥ 3 AND cpa ≤ breakeven
  //   • active : purchases ≥ 1 AND cpa ≤ kill_cpa
  //   • dead   : (cpa > kill_cpa)  OR  (spend ≥ 3× daily_budget AND zero purchases)
  //   • watch  : spend ≥ 1× daily_budget AND zero purchases (warming, no signal yet)
  //   • testing: anything below those thresholds — typically too little spend
  //              to judge.
  // -----------------------------------------------------------------------
  const beForRole = (role: string): number => {
    const overrides = kpi.breakeven_cpa_by_role ?? {};
    const r = role as keyof typeof overrides;
    return overrides[r] ?? kpi.breakeven_cpa;
  };
  const PAUSED_RE = /^(PAUSED|ARCHIVED|DELETED|DISAPPROVED)$/i;

  const classifyAd = (params: {
    purchases: number;
    spend: number;
    cpa: number | null;
    role: string;
    adsetBudget: number;
    effectiveStatus: string | null;
    metaStatus: string | null;
  }): AdPerfRow['status_dot'] => {
    const { purchases, spend, cpa, role, adsetBudget, effectiveStatus, metaStatus } = params;
    if (effectiveStatus && PAUSED_RE.test(effectiveStatus)) return 'dead';
    if (metaStatus && PAUSED_RE.test(metaStatus))           return 'dead';
    const be   = beForRole(role);
    const kill = kpi.kill_cpa;
    if (purchases >= 3 && cpa != null && cpa <= be)   return 'winner';
    if (purchases >= 1 && cpa != null && cpa <= kill) return 'active';
    if (cpa != null && cpa > kill)                    return 'dead';
    if (adsetBudget > 0 && spend >= adsetBudget * 3 && purchases === 0) return 'dead';
    if (adsetBudget > 0 && spend >= adsetBudget       && purchases === 0) return 'watch';
    return 'testing';
  };

  // Map dot back to a human label so the badge text matches the colour.
  const labelForDot: Record<AdPerfRow['status_dot'], string> = {
    winner:  'Winner',
    active:  'Active',
    watch:   'Watch',
    dead:    'Dead',
    testing: 'Testing',
  };

  const adPerfRows: AdPerfRow[] = [];
  for (const a of (adMeta ?? []) as AnyRow[]) {
    // `ads.id` IS the Meta ad id, so we look up the entity row by it.
    const entityId = adEntityMetaToId.get(a.id as string);
    const agg = entityId ? adAggByEntityId.get(entityId) : undefined;
    const spend       = agg?.spend ?? 0;
    const impressions = agg?.impressions ?? 0;
    const purchases   = agg?.purchases ?? 0;
    const linkClicks  = agg?.link_clicks ?? 0;
    const linkCtr     = impressions > 0 ? (linkClicks * 100) / impressions : 0;
    const cpa         = purchases > 0 ? spend / purchases : null;
    const role        = adsetRoleById.get(a.ad_set_id as string) ?? '—';
    const adsetBudget = adsetBudgetById.get(a.ad_set_id as string) ?? 0;

    // Auto-derived classification.
    const autoDot = classifyAd({
      purchases,
      spend,
      cpa,
      role,
      adsetBudget,
      effectiveStatus: (a.effective_status as string | null) ?? null,
      metaStatus:      (a.status as string | null)           ?? null,
    });

    // Operator override: only respected when manual_status is one of the
    // recognised tokens AND not the bootstrap default 'Testing'. A literal
    // 'Testing' value is treated as "no opinion" → fall back to auto.
    const manualRaw  = ((a.manual_status as string) ?? '').trim();
    const manualNorm = manualRaw.toLowerCase();
    const overrideDot: AdPerfRow['status_dot'] | null =
      manualNorm === 'winner' ? 'winner' :
      manualNorm === 'active' ? 'active' :
      manualNorm === 'watch'  ? 'watch'  :
      manualNorm === 'dead'   ? 'dead'   :
      null;
    const dot   = overrideDot ?? autoDot;
    const label = overrideDot
      ? labelForDot[overrideDot]
      : `${labelForDot[autoDot]} (auto)`;

    adPerfRows.push({
      id: a.id as string,
      name: a.name as string,
      adset_role: role,
      adset_name: adsetNameById.get(a.ad_set_id as string) ?? '—',
      format: ((a.format as string) ?? 'IMG') as 'VID' | 'IMG',
      wave: ((a.wave as string) ?? 'W1') as 'W1' | 'W2' | 'W3',
      manual_status: label,
      status_dot: dot,
      spend,
      impressions,
      reach: agg?.reach ?? 0,
      link_clicks: linkClicks,
      link_ctr: linkCtr,
      lp_views: agg?.lp_views ?? 0,
      purchases,
      cpa,
      pct_of_budget: 0,   // filled below once we know total spend in range
    });
  }
  const totalSpendAds = adPerfRows.reduce((s, r) => s + r.spend, 0);
  for (const r of adPerfRows) {
    r.pct_of_budget = totalSpendAds > 0 ? (r.spend * 100) / totalSpendAds : 0;
  }
  // Default order: active ads first (sorted by spend desc), then dead ads
  // pushed to the bottom (also spend desc among themselves). This keeps the
  // operator's eye on what's actually delivering without losing historical
  // context. The client table respects this ordering when no explicit sort
  // is applied.
  adPerfRows.sort((a, b) => {
    const aDead = a.status_dot === 'dead' ? 1 : 0;
    const bDead = b.status_dot === 'dead' ? 1 : 0;
    if (aDead !== bDead) return aDead - bDead;
    return b.spend - a.spend;
  });
  const ad_performance: AdPerfRow[] = adPerfRows;

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
  const todaySpend = Number(todayRow?.spend ?? 0);

  // Convenience aliases: the "range" tile + KPI grid read from windowMetrics.
  const rangePurchases = windowMetrics.purchases;
  const rangeSpend     = windowMetrics.spend;
  const rangeRevenue   = windowMetrics.revenue_tier;

  // Total campaña (lifetime-scoped, unaffected by the user range).
  const totalPurchases       = totalMetrics.purchases;
  const totalSpendCampaign   = totalMetrics.spend;
  const totalRevenue         = totalMetrics.revenue_tier;

  const revenue_tiles: RevenueTile[] = [
    {
      label: `Hoy · ${reportDate}`, date_range: '', amount: todayRevenue,
      sub: `${todayPurchases} compras × $${priceForDate(reportDate)} (tier actual)`,
      color: 'ok',
    },
    {
      label: range.label,
      date_range: `${range.start} → ${range.end}`,
      amount: rangeRevenue,
      sub: `${rangePurchases} compras · spend ${money(rangeSpend)} · ROAS ${rangeSpend > 0 ? (rangeRevenue / rangeSpend).toFixed(2) : '0'}x`,
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

  // ---------- Recent 5 days (per-day revenue tiles, mirrors HOY card) ----------
  // Anchor = reportDate - 1 (yesterday) so the HOY tile above stays the sole
  // "today" reference. Rows are lookup by date against the full campInsights
  // set (not filtered by the user range) because these are context tiles.
  const insightsByDate = new Map<string, AnyRow>();
  for (const r of (campInsights ?? []) as AnyRow[]) {
    insightsByDate.set(r.date as string, r);
  }
  const recent_daily_tiles: RevenueTile[] = [];
  const reportMs = new Date(`${reportDate}T00:00:00Z`).getTime();
  for (let i = 1; i <= 5; i += 1) {
    const iso = toYmd(new Date(reportMs - i * 86_400_000));
    const row = insightsByDate.get(iso);
    const purchases = Number(row?.purchases ?? 0);
    const spend     = Number(row?.spend ?? 0);
    const price     = priceForDate(iso);
    const revenue   = purchases * price;
    const roas      = spend > 0 ? revenue / spend : 0;
    recent_daily_tiles.push({
      label: `${iso}`,
      date_range: iso,
      amount: revenue,
      sub: `${purchases} compras × $${price} · spend ${money(spend)}${spend > 0 ? ` · ROAS ${roas.toFixed(2)}x` : ''}`,
      color: 'ok',
    });
  }

  // ---------- KPI grid ----------
  // KPI cells read from `windowMetrics` so the grid reflects the range the
  // user selected. Sub-labels that reference "today" still use the single
  // `todayRow` because they are explicitly time-anchored.
  const cpa        = windowMetrics.purchases > 0    ? windowMetrics.spend / windowMetrics.purchases   : 0;
  const cpc        = windowMetrics.link_clicks > 0  ? windowMetrics.spend / windowMetrics.link_clicks : 0;
  const cpm        = windowMetrics.impressions > 0  ? (windowMetrics.spend * 1000) / windowMetrics.impressions : 0;
  const linkCtrPct = windowMetrics.impressions > 0  ? (windowMetrics.link_clicks * 100) / windowMetrics.impressions : 0;
  const clickToLp  = windowMetrics.link_clicks > 0  ? (windowMetrics.lp_views * 100)  / windowMetrics.link_clicks : 0;
  const roasEst    = windowMetrics.spend > 0        ? windowMetrics.revenue_tier / windowMetrics.spend : 0;
  // Health-Score inputs (always lifetime-scoped — they describe the whole
  // campaign, not the currently visible window).
  const totalCpa          = totalMetrics.purchases > 0    ? totalMetrics.spend / totalMetrics.purchases : 0;
  const totalLinkCtrPct   = totalMetrics.impressions > 0  ? (totalMetrics.link_clicks * 100) / totalMetrics.impressions : 0;
  const totalClickToLp    = totalMetrics.link_clicks > 0  ? (totalMetrics.lp_views * 100) / totalMetrics.link_clicks : 0;
  // Fix #6 + #12: Meta does not expose rolling unique reach via daily
  // campaign insights; summing daily reach double-counts users across days.
  // We surface max(reach) within the user-selected range as "reach pico".
  const rangeReach = windowMetrics.reach;
  const pacingTone = (n: number, warn: number, bad: number): KpiCell['tone'] => n <= warn ? 'ok' : n <= bad ? 'warn' : 'bad';

  // Short label used inside KPI sub-lines to hint at the active window.
  const rangeShort =
    range.preset === 'campaign' ? 'lifetime'
    : range.preset === 'custom' ? `${range.days}d`
    : range.preset;

  const kpis: KpiCell[] = [
    {
      label: 'Total Spend', value: money(windowMetrics.spend), tone: 'neutral',
      sub: `${money(todaySpend)} today · ${rangeShort}`,
    },
    {
      label: 'CPA (Purchase)', value: money(cpa), tone: cpa <= kpi.target_cpa ? 'ok' : cpa <= kpi.breakeven_cpa ? 'warn' : 'bad',
      sub: `Breakeven tier $${priceNow}: $${kpi.breakeven_cpa} | Kill: >$${kpi.kill_cpa}`,
    },
    {
      label: `Reach (${rangeShort})`, value: num(rangeReach), tone: 'neutral',
      sub: ad_sets.map(s => `${s.role}: ${num(s.reach)}`).join(' · '),
    },
    {
      label: 'Reach 7d', value: num(((campInsights ?? []) as AnyRow[])
        .filter(r => (r.date as string) >= sevenAgoStr && (r.date as string) <= reportDate)
        .reduce((m, r) => Math.max(m, Number(r.reach) || 0), 0)), tone: 'neutral',
      sub: cusRow?.freq_daily_7d != null ? `Freq 7d (CUS): ${cusRow.freq_daily_7d.toFixed(2)}` : 'Freq 7d: —',
    },
    {
      label: 'ROAS (Est.)', value: `${roasEst.toFixed(1)}x`, tone: roasEst >= kpi.target_roas ? 'ok' : 'warn',
      sub: `${rangePurchases}p blended @ ${money(rangeRevenue / Math.max(1, rangePurchases))} = ${money(rangeRevenue)}`,
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
      label: 'Purchases', value: String(rangePurchases), tone: 'ok',
      sub: `${todayPurchases} today · ${rangeShort}`,
    },
    {
      label: 'LP Views', value: num(windowMetrics.lp_views), tone: 'neutral',
      sub: `${clickToLp.toFixed(0)}% click-to-LP`,
    },
    {
      label: 'Click-to-LP%', value: pct(clickToLp, 1), tone: clickToLp >= config.click_to_lp_target ? 'ok' : 'warn',
      sub: `Target >${config.click_to_lp_target}%`,
    },
    {
      label: 'Impressions', value: num(windowMetrics.impressions), tone: 'neutral',
      sub: `${num(Number(todayRow?.impressions ?? 0))} today`,
    },
    {
      label: 'CPC', value: money(cpc), tone: 'ok',
      sub: 'Link CPC',
    },
  ];

  const funnel_raw = [
    { label: 'Impressions',   value: windowMetrics.impressions },
    { label: 'Link Clicks',   value: windowMetrics.link_clicks },
    { label: 'LP Views',      value: windowMetrics.lp_views },
    { label: 'Init Checkout', value: windowMetrics.initiate_checkout },
    { label: 'Purchase',      value: windowMetrics.purchases },
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
  // than rewarding an absence of cost. Uses lifetime CPA so the score does
  // not swing with the user-selected range.
  let economicsScore: number;
  let economicsSub: string;
  if (totalMetrics.purchases === 0) {
    economicsScore = 50;
    economicsSub = 'no purchases yet';
  } else if (totalCpa <= kpi.target_cpa) {
    economicsScore = 100;
    economicsSub = `CPA ${money(totalCpa)} ≤ target ${money(kpi.target_cpa)}`;
  } else if (totalCpa <= kpi.breakeven_cpa) {
    // Interpolate 100 → 50 between target and breakeven.
    const span = Math.max(1, kpi.breakeven_cpa - kpi.target_cpa);
    economicsScore = Math.round(100 - 50 * ((totalCpa - kpi.target_cpa) / span));
    economicsSub = `CPA ${money(totalCpa)} ∈ (target ${money(kpi.target_cpa)}, BE ${money(kpi.breakeven_cpa)}]`;
  } else if (totalCpa <= kpi.kill_cpa) {
    const span = Math.max(1, kpi.kill_cpa - kpi.breakeven_cpa);
    economicsScore = Math.round(50 - 50 * ((totalCpa - kpi.breakeven_cpa) / span));
    economicsSub = `CPA ${money(totalCpa)} ∈ (BE ${money(kpi.breakeven_cpa)}, kill ${money(kpi.kill_cpa)}]`;
  } else {
    economicsScore = 0;
    economicsSub = `CPA ${money(totalCpa)} > kill ${money(kpi.kill_cpa)}`;
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

  // Creative (20%): link CTR vs configured target / warn. Lifetime-scoped so
  // the dial doesn't move when the user picks a noisy short range.
  let creativeScore: number;
  if (totalLinkCtrPct >= config.link_ctr_target) creativeScore = 100;
  else if (totalLinkCtrPct >= config.link_ctr_warn) creativeScore = 50;
  else creativeScore = 0;
  const creativeSub = `Link CTR ${totalLinkCtrPct.toFixed(2)}% (target ${config.link_ctr_target}% / warn ${config.link_ctr_warn}%)`;

  // Funnel (15%): click-to-LP vs target. Soft floor at 70% of target.
  let funnelScore: number;
  if (totalClickToLp >= config.click_to_lp_target) funnelScore = 100;
  else if (totalClickToLp >= config.click_to_lp_target * 0.7) funnelScore = 50;
  else funnelScore = 0;
  const funnelSub = `Click→LP ${totalClickToLp.toFixed(1)}% (target ${config.click_to_lp_target}%)`;

  // Pacing (15%): spend vs daily budget. Measures whether the campaign is
  // actually consuming the allocated budget — a proxy for "Meta is delivering
  // what we asked for and nothing is mis-paused".
  //
  // Two historical issues drove this logic:
  //
  //   1. At 02:00 AM in the BU's tz the day has barely started and Meta also
  //      delays reporting by 1-3h, so `todaySpend` is near zero. The old
  //      formula collapsed the score to 0 even though yesterday's pacing was
  //      perfectly healthy.
  //   2. `config.daily_budget` is a static number that drifts out of sync
  //      when ad sets are paused (e.g. DI21 has $595 configured but only
  //      $490 in active ad set budgets). That inflates the denominator and
  //      under-scores pacing.
  //
  // Fixes:
  //   • Prefer the real-time sum of ACTIVE ad sets as the denominator; fall
  //     back to the configured number when none are active (or data is
  //     missing). This mirrors operator reality.
  //   • Before 06:00 local time, or between 06:00-12:00 when Meta still
  //     hasn't reported anything, fall back to **yesterday** (the last full
  //     day). After 12:00, normalise `todaySpend` by the fraction of the
  //     day elapsed so "10:00 AM with ~42% of budget spent" scores near 100.
  const activeAdsetBudget = ad_setsUnsorted
    .filter(s => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + (s.daily_budget || 0), 0);
  const pacingBudget = activeAdsetBudget > 0 ? activeAdsetBudget : config.daily_budget;

  const yesterdayDate = toYmd(new Date(new Date(reportDate).getTime() - 86_400_000));
  const yesterdayRow = ((campInsights ?? []) as AnyRow[]).find(r => r.date === yesterdayDate);
  const yesterdaySpend = Number(yesterdayRow?.spend ?? 0);

  const hourLocal = hourInTimezone(timezone);

  let pacingScore: number;
  let pacingSub: string;
  if (pacingBudget <= 0) {
    pacingScore = 50;
    pacingSub = 'no daily budget set';
  } else {
    let ratio: number;
    let basis: string;
    if (hourLocal < 6) {
      // Too early for today's data to be meaningful. Use yesterday.
      ratio = yesterdaySpend / pacingBudget;
      basis = `yesterday ${money(yesterdaySpend)} / budget ${money(pacingBudget)}`;
    } else if (hourLocal < 12 && todaySpend === 0) {
      // Morning but Meta still hasn't reported for today → yesterday proxy.
      ratio = yesterdaySpend / pacingBudget;
      basis = `yesterday ${money(yesterdaySpend)} / budget ${money(pacingBudget)} (today not reported yet)`;
    } else {
      // Normalise today's spend by fraction of day elapsed, so 42% of budget
      // spent at 10:00 AM (10/24 = 0.417) scores as "on pace" (~1.0).
      const expectedSoFar = (pacingBudget * hourLocal) / 24;
      ratio = expectedSoFar > 0 ? todaySpend / expectedSoFar : 0;
      basis = `today ${money(todaySpend)} vs expected ${money(expectedSoFar)} at ${hourLocal.toFixed(1)}h`;
    }

    if (ratio >= 0.6 && ratio <= 1.3) {
      const dist = Math.abs(ratio - 1);
      pacingScore = Math.round(100 - 30 * (dist / 0.3));
    } else {
      const bandMiss = ratio < 0.6 ? 0.6 - ratio : ratio - 1.3;
      pacingScore = Math.round(clamp(50 - (bandMiss / 0.6) * 50));
    }
    pacingScore = clamp(pacingScore);
    pacingSub = `${(ratio * 100).toFixed(0)}% of expected · ${basis}`;
  }

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
    recent_daily_tiles,
    revenue_footer,
    kpis,
    ad_sets,
    learning_cards,
    recent_purchases,
    budget_bumps,
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
    range,
  };
}
