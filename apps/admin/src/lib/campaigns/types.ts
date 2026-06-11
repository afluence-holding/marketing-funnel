/**
 * Campaigns module — domain types (public contract for the renderer).
 *
 * Extracted verbatim from dashboard-adapter.ts so view components can depend
 * on the types without importing the server-side loader.
 */

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
  scope: string;              // 'TOTAL' (campaign) | ad-set role | trimmed ad-set name
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
    freshness_utc: string;               // "06-11 02:46 UTC" | "sin registro de pull"
    status_badge: string;                // "SCALING" | "ENDED" | phase label
    /**
     * True when report_date is past campaign_window.ends_on. The view can use
     * it to render a terminal state (status_badge is already 'ENDED').
     */
    campaign_ended: boolean;
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
  /**
   * Date (YYYY-MM-DD) of the daily frequency snapshot backing `frequency`.
   * It is reportDate when today's pull exists, an OLDER date when the
   * adapter fell back to the latest available row, and null when there is
   * no frequency data at all. The view should title the section with this
   * date (the data is a single-day snapshot, NOT a rolling 7d window) and
   * flag staleness when it differs from header.report_date.
   */
  frequency_snapshot_date: string | null;
  alerts: AlertItem[];
  hypotheses: HypothesisItem[];
  watch_signals: WatchSignalItem[];
  range: DashboardRange;
}
