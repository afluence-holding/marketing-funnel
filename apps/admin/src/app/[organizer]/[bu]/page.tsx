import { notFound } from 'next/navigation';

// Always hit the DB — never prerender or cache a BU dashboard page.
export const dynamic = 'force-dynamic';

import {
  loadDashboard,
  type AdPerfRow,
  type AdSetRow,
  type AlertItem,
  type DashboardData,
  type FrequencyScope,
  type FunnelStep,
  type HealthBreakdown,
  type HypothesisItem,
  type KpiCell,
  type LearningPhaseCard,
  type MatchupRow,
  type PriceTier,
  type RecentPurchase,
  type RevenueTile,
  type TargetingBlock,
  type TrendPoint,
  type WatchSignalItem,
} from '@/lib/dashboard/dashboard-adapter';
import { listBuOptions, type BuOption } from '@/lib/dashboard/bu-options';
import { CtrCpmChart, SpendPurchasesChart } from '@/components/trends-chart';
import { RefreshButton } from '@/components/refresh-button';
import { BuSelector } from '@/components/bu-selector';

// ---------------------------------------------------------------------------
// Helpers & constants
// ---------------------------------------------------------------------------

const ROLE_COLOR: Record<string, string> = {
  CUS: 'var(--color-warning)',
  ASC: 'var(--color-accent)',
  RMK: 'var(--color-success)',
  CARTAB: 'var(--color-critical)',
};

const TONE_COLOR: Record<'ok' | 'warn' | 'bad' | 'neutral', string> = {
  ok: 'var(--color-success)',
  warn: 'var(--color-warning)',
  bad: 'var(--color-critical)',
  neutral: 'var(--color-text-primary)',
};

const FREQ_COLORS = {
  b1: '#22c55e',
  b23: '#84cc16',
  b45: '#eab308',
  b610: '#f97316',
  b1120: '#ef4444',
  b21plus: '#991b1b',
} as const;

const FREQ_STATUS_COLOR: Record<FrequencyScope['status'], string> = {
  HEALTHY: '#22c55e',
  WATCH: '#eab308',
  FATIGUE: '#ef4444',
};

function fmtMoney2(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtInt(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

function fmtPct(n: number, digits = 2): string {
  return `${n.toFixed(digits)}%`;
}

function addDaysYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function phaseLabel(
  phase: { label: string; day_start: number; day_end: number },
  totalDays: number
): string {
  const tail =
    phase.day_end >= totalDays
      ? `D${phase.day_start}+`
      : `D${phase.day_start}-${phase.day_end}`;
  return `${phase.label} (${tail})`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ organizer: string; bu: string }>;
}) {
  const { organizer, bu } = await params;

  let data: DashboardData;
  try {
    data = await loadDashboard({ organizerSlug: organizer, buSlug: bu });
  } catch {
    notFound();
  }

  const buOptions = await listBuOptions().catch(() => [] as BuOption[]);
  const currentPath = `/${organizer}/${bu}`;

  return (
    <>
      <Header
        data={data}
        organizerSlug={organizer}
        buSlug={bu}
        buOptions={buOptions}
        currentPath={currentPath}
      />
      <ProgressBar data={data} />
      <HealthAndConfig data={data} />
      <PriceTierSchedule tiers={data.price_tiers} />
      <RevenueSection tiles={data.revenue_tiles} footer={data.revenue_footer} />
      <KpisSection kpis={data.kpis} />
      <AdSetTableSection rows={data.ad_sets} />
      <LearningPhaseSection cards={data.learning_cards} />
      <RecentPurchasesSection rows={data.recent_purchases} />
      <TargetingSection blocks={data.targeting_blocks} />
      <CusSaturationSection data={data} />
      <TrendsSection trend={data.trend} />
      <FunnelSection steps={data.funnel} />
      <AdPerformanceSection
        rows={data.ad_performance}
        linkCtrTarget={data.bu.config.link_ctr_target}
        linkCtrWarn={data.bu.config.link_ctr_warn}
      />
      <MatchupsSection rows={data.matchups} />
      <FrequencySection scopes={data.frequency} />
      <AlertsSection alerts={data.alerts} />
      <HypothesesSection items={data.hypotheses} />
      <WatchSignalsSection items={data.watch_signals} />
      <Footer reportDate={data.header.report_date} />
    </>
  );
}

// ---------------------------------------------------------------------------
// 1. Header
// ---------------------------------------------------------------------------

function Header({
  data,
  organizerSlug,
  buSlug,
  buOptions,
  currentPath,
}: {
  data: DashboardData;
  organizerSlug: string;
  buSlug: string;
  buOptions: BuOption[];
  currentPath: string;
}) {
  const { header } = data;
  const statusClass =
    header.status_badge.toLowerCase() === 'scaling'
      ? 'badge-success'
      : 'badge-warning';
  const healthClass =
    data.health.tone === 'ok'
      ? 'badge-success'
      : data.health.tone === 'warn'
      ? 'badge-warning'
      : 'badge-critical';
  return (
    <div className="report-header">
      <div>
        <h1>
          {header.campaign_code} — {header.campaign_label}
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 4,
            flexWrap: 'wrap',
          }}
        >
          <span className="date-label">
            Report: {header.report_date} · Day {header.day_index} of{' '}
            {header.total_days} · {header.adset_summary}
          </span>
          <span className="freshness">
            <span className="freshness-dot" /> Data pulled {header.freshness_utc}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <BuSelector options={buOptions} currentPath={currentPath} />
        <RefreshButton organizerSlug={organizerSlug} buSlug={buSlug} />
        <span className={`badge ${statusClass}`}>{header.status_badge}</span>
        <span className={`badge ${healthClass}`}>{header.health_label}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Progress bar
// ---------------------------------------------------------------------------

function ProgressBar({ data }: { data: DashboardData }) {
  const { progress } = data;
  return (
    <div className="section">
      <div className="card" style={{ padding: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Campaign Progress
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Day {progress.day_index} / {progress.total_days} · $
            {progress.spend_so_far.toFixed(2)} / ${fmtInt(progress.total_budget)}
          </span>
        </div>
        <div className="phase-bar">
          <div
            className="phase-fill"
            style={{
              width: `${Math.min(100, Math.max(0, progress.progress_pct)).toFixed(1)}%`,
              background: 'var(--color-accent)',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.65rem',
            color: 'var(--color-text-secondary)',
            marginTop: 4,
          }}
        >
          {progress.phases.map(p => {
            const active = p.key === progress.current_phase_key;
            return (
              <span
                key={p.key}
                style={
                  active
                    ? { fontWeight: 700, color: 'var(--color-accent)' }
                    : undefined
                }
              >
                {phaseLabel(p, progress.total_days)}
                {active ? ' ◄' : ''}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Health gauge + Campaign config
// ---------------------------------------------------------------------------

function HealthAndConfig({ data }: { data: DashboardData }) {
  return (
    <div className="grid-2" style={{ marginBottom: 24 }}>
      <HealthGaugeCard health={data.health} />
      <CampaignConfigCard config={data.campaign_config} />
    </div>
  );
}

function HealthGaugeCard({
  health,
}: {
  health: DashboardData['health'];
}) {
  const dasharray = 188.5;
  const offset = dasharray * (1 - health.score / 100);
  const strokeColor = TONE_COLOR[health.tone];
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width="120" height="75" viewBox="0 0 160 100">
          <path
            d="M 20 90 A 60 60 0 0 1 140 90"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 20 90 A 60 60 0 0 1 140 90"
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={dasharray}
            strokeDashoffset={offset}
          />
          <text
            x="80"
            y="80"
            textAnchor="middle"
            fill="var(--color-text-primary)"
            fontSize="28"
            fontWeight="bold"
          >
            {health.score}
          </text>
        </svg>
        <span className="gauge-label" style={{ color: strokeColor }}>
          {health.label}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 8 }}>
          Health Score Breakdown{' '}
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
            }}
          >
            (Economics 30% · Signal 20% · Creative 20% · Funnel 15% · Pacing 15%)
          </span>
        </p>
        <div className="health-breakdown">
          {health.breakdown.map((b: HealthBreakdown) => (
            <div className="health-item" key={b.label}>
              <span style={{ color: 'var(--color-text-secondary)' }}>{b.label}</span>
              <span style={{ fontWeight: 600, color: TONE_COLOR[b.tone] }}>
                {b.score}/100
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CampaignConfigCard({
  config,
}: {
  config: DashboardData['campaign_config'];
}) {
  return (
    <div className="card">
      <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>
        Campaign Config
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          fontSize: '0.8rem',
        }}
      >
        {config.map(row => (
          <div
            key={row.label}
            style={row.full_row ? { gridColumn: 'span 2' } : undefined}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>{row.label}:</span>{' '}
            {row.value}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Price tier schedule
// ---------------------------------------------------------------------------

function PriceTierSchedule({ tiers }: { tiers: PriceTier[] }) {
  return (
    <div className="section">
      <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 8 }}>
          Price Tier Schedule
        </p>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {tiers.map((t, i) => (
            <TierAndArrow key={`${t.label}-${i}`} tier={t} isLast={i === tiers.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TierAndArrow({ tier, isLast }: { tier: PriceTier; isLast: boolean }) {
  const isCurrent = tier.status === 'current';
  const color = isCurrent ? 'var(--color-success)' : 'var(--color-text-secondary)';
  const borderColor = isCurrent ? 'var(--color-success)' : 'var(--color-text-secondary)';
  const dateRange = tier.ends_on
    ? `${tier.starts_on.slice(5)}-${tier.ends_on.slice(5)}`
    : tier.starts_on.slice(5);
  return (
    <>
      <div
        style={{
          textAlign: 'center',
          padding: '12px 20px',
          background: 'var(--color-bg-hover)',
          borderRadius: 8,
          border: `2px solid ${borderColor}`,
        }}
      >
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
          {tier.status.toUpperCase()}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>
          ${tier.price}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
          {formatTierDateRange(tier)}
        </div>
      </div>
      {!isLast && (
        <div style={{ color: 'var(--color-text-secondary)' }}>→</div>
      )}
    </>
  );
}

function formatTierDateRange(tier: PriceTier): string {
  const start = formatMonthDay(tier.starts_on);
  if (!tier.ends_on) return start;
  return `${start}-${formatMonthDay(tier.ends_on)}`;
}

function formatMonthDay(ymd: string): string {
  const [, m, d] = ymd.split('-');
  const month = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ][Number(m) - 1];
  return `${month} ${d}`;
}

// ---------------------------------------------------------------------------
// 5. Revenue
// ---------------------------------------------------------------------------

function RevenueSection({
  tiles,
  footer,
}: {
  tiles: RevenueTile[];
  footer: string;
}) {
  return (
    <div className="section">
      <div className="section-title">Revenue (priced por tier de precio del día)</div>
      <div className="card">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {tiles.map((tile, i) => (
            <RevenueTileView key={i} tile={tile} />
          ))}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: '0.7rem',
            color: 'var(--color-text-secondary)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 10,
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}

function RevenueTileView({ tile }: { tile: RevenueTile }) {
  const color =
    tile.color === 'ok'
      ? 'var(--color-success)'
      : tile.color === 'accent'
      ? 'var(--color-accent)'
      : 'var(--color-warning)';
  return (
    <div
      style={{
        padding: 16,
        background: 'var(--color-bg-hover)',
        borderRadius: 8,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {tile.label}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color, marginTop: 4 }}>
        {fmtMoney2(tile.amount)}
      </div>
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
          marginTop: 4,
        }}
      >
        {tile.sub}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. KPIs
// ---------------------------------------------------------------------------

function KpisSection({ kpis }: { kpis: KpiCell[] }) {
  return (
    <div className="section">
      <div className="section-title">KPIs</div>
      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div className="card" key={i}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: TONE_COLOR[k.tone] }}>
              {k.value}
            </div>
            {k.sub ? (
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: 4,
                }}
              >
                {k.sub}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. Ad Set Performance
// ---------------------------------------------------------------------------

function AdSetTableSection({ rows }: { rows: AdSetRow[] }) {
  return (
    <div className="section">
      <div className="section-title">Ad Set Performance</div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Ad Set</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Spend</th>
              <th>Purchases</th>
              <th>CPA</th>
              <th>BE CPA</th>
              <th>Margin/sale</th>
              <th>ROAS (Est.)</th>
              <th>Link CTR</th>
              <th>Reach</th>
              <th>
                Freq Daily
                <br />
                <span style={{ fontWeight: 400, fontSize: '0.65rem' }}>
                  (7d avg · Lifetime)
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <AdSetRowView key={r.id} row={r} />
            ))}
          </tbody>
        </table>
        <div
          style={{
            marginTop: 12,
            fontSize: '0.7rem',
            color: 'var(--color-text-secondary)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 8,
          }}
        >
          Freq daily = avg 7d impressions-weighted (real signal). Lifetime =
          acumulado desde launch. BE CPA tier actual = breakeven usado para
          juzgar margen. CARTAB con &lt;$300 spend se considera en learning.
        </div>
      </div>
    </div>
  );
}

function AdSetRowView({ row }: { row: AdSetRow }) {
  const statusBadge =
    row.status === 'ACTIVE'
      ? 'badge-green'
      : row.status === 'PAUSED'
      ? 'badge-yellow'
      : 'badge-red';

  const cpaColor =
    row.cpa == null
      ? 'var(--color-text-secondary)'
      : row.cpa <= row.breakeven_cpa
      ? 'var(--color-success)'
      : 'var(--color-warning)';

  const marginColor =
    row.margin_per_sale == null
      ? 'var(--color-text-secondary)'
      : row.margin_per_sale >= 0
      ? 'var(--color-success)'
      : 'var(--color-critical)';

  const roasValue = row.roas ?? 0;
  const roasColor = roasValue >= 2 ? 'var(--color-success)' : 'var(--color-warning)';

  const freqWatchColor =
    row.freq_daily_7d == null || row.freq_daily_7d < 3
      ? 'var(--color-success)'
      : 'var(--color-warning)';

  return (
    <tr>
      <td>
        <strong>{row.role}</strong>{' '}
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
          {row.name_subtitle}
        </span>
      </td>
      <td>
        <span className={`badge ${statusBadge}`}>{row.status}</span>
      </td>
      <td>${row.daily_budget}/day</td>
      <td>${row.spend.toFixed(2)}</td>
      <td>{row.purchases}</td>
      <td style={{ color: cpaColor }}>
        {row.cpa == null ? '—' : fmtMoney2(row.cpa)}
      </td>
      <td style={{ color: 'var(--color-text-secondary)' }}>
        ${row.breakeven_cpa}
      </td>
      <td style={{ color: marginColor }}>
        {row.margin_per_sale == null
          ? '—'
          : `${row.margin_per_sale >= 0 ? '+' : ''}${fmtMoney2(row.margin_per_sale)}`}
      </td>
      <td style={{ color: roasColor }}>{roasValue.toFixed(1)}x</td>
      <td>{fmtPct(row.link_ctr, 2)}</td>
      <td>{fmtInt(row.reach)}</td>
      <td>
        <strong style={{ color: freqWatchColor }}>
          {row.freq_daily_7d == null ? '—' : row.freq_daily_7d.toFixed(2)}
        </strong>{' '}
        ·{' '}
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {row.freq_lifetime == null ? '—' : row.freq_lifetime.toFixed(2)}
        </span>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// 8. Learning phase status
// ---------------------------------------------------------------------------

function LearningPhaseSection({ cards }: { cards: LearningPhaseCard[] }) {
  return (
    <div className="section">
      <div className="section-title">
        Learning Phase Status{' '}
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 400,
            color: 'var(--color-text-secondary)',
            textTransform: 'none',
            letterSpacing: 0,
          }}
        >
          — señal de salida del algoritmo de Meta
        </span>
      </div>
      <div
        className="grid-2"
        style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 8 }}
      >
        {cards.map(c => (
          <LearningCard key={c.adset_id} card={c} />
        ))}
      </div>
      <div
        className="card"
        style={{
          padding: '10px 14px',
          fontSize: '0.7rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        Meta exige 50 eventos de conversión / 7d para salir de learning. Si un
        adset está en LEARNING LIMITED explícito = hay un problema
        (budget/señal/audience). Edits significativos reinician learning (regla
        1-edit-por-24h para conservar ciclo). Signals: <code>learning_stage_info</code>{' '}
        + purchases 7d + <code>updated_time</code>.
      </div>
    </div>
  );
}

function LearningCard({ card }: { card: LearningPhaseCard }) {
  const roleColor = ROLE_COLOR[card.role] ?? 'var(--color-text-secondary)';
  const pct = Math.min(100, Math.max(0, card.progress_pct));
  const etaLine = card.eta_days != null && card.eta_date
    ? `Gap ${card.gap} compras · ~${card.eta_days}d al ritmo actual (${(card.purchases_7d / 7).toFixed(1)}/d) → sale ~${card.eta_date}`
    : `Gap ${card.gap} compras · sin compras 7d → timeline no calculable`;
  return (
    <div className="card" style={{ borderTop: `3px solid ${roleColor}` }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: roleColor }}>
            {card.role}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
            Adset learning phase
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-yellow">{card.status_label}</span>
        </div>
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
        Progreso hacia exit ({card.target_exits} compras / 7d)
      </div>
      <div className="pacing-bar">
        <div
          className="pacing-fill"
          style={{ width: `${pct.toFixed(1)}%`, background: 'var(--color-warning)' }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: 'var(--color-text-secondary)',
          marginTop: 4,
        }}
      >
        <span>
          {card.purchases_7d}/{card.target_exits} compras 7d
        </span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: '0.78rem',
          color: 'var(--color-text-primary)',
        }}
      >
        {etaLine}
      </div>
      <div
        style={{
          marginTop: 8,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          fontSize: '0.7rem',
        }}
      >
        <div>
          <span style={{ color: 'var(--color-text-secondary)' }}>Último edit:</span>{' '}
          {card.last_edit_ago}
        </div>
        <div>
          <span style={{ color: 'var(--color-text-secondary)' }}>Spend 7d:</span>{' '}
          ${card.spend_7d}
        </div>
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: '0.72rem',
          color: 'var(--color-text-secondary)',
          fontStyle: 'italic',
        }}
      >
        {card.note}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. Recent purchases
// ---------------------------------------------------------------------------

function RecentPurchasesSection({ rows }: { rows: RecentPurchase[] }) {
  return (
    <div className="section">
      <div className="section-title">Últimas 10 Compras (incluye hoy)</div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            marginBottom: 12,
          }}
        >
          Meta API no expone eventos de compra individuales. Esta tabla muestra
          las combinaciones ad × día con compras ordenadas por fecha
          descendente (granularidad máxima disponible). Incluye compras del día
          de hoy.
        </div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Compras</th>
              <th>Ad Set</th>
              <th>Ad</th>
              <th>Temperatura</th>
              <th>Spend día</th>
              <th>CPA día</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <RecentPurchaseRow key={i} row={r} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentPurchaseRow({ row }: { row: RecentPurchase }) {
  const roleColor = ROLE_COLOR[row.adset_role] ?? 'var(--color-text-secondary)';
  const cpa = row.cpa_day;
  const cpaColor =
    cpa == null
      ? 'var(--color-text-secondary)'
      : cpa <= 40
      ? 'var(--color-success)'
      : cpa <= 58
      ? 'var(--color-warning)'
      : 'var(--color-critical)';
  return (
    <tr>
      <td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>
      <td style={{ fontWeight: 600 }}>{row.purchases}</td>
      <td>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: 4,
            border: `1px solid ${roleColor}`,
            color: roleColor,
            fontWeight: 700,
          }}
        >
          {row.adset_role}
        </span>
      </td>
      <td style={{ fontSize: '0.8rem' }}>{row.ad_name}</td>
      <td style={{ fontSize: '0.7rem', color: roleColor, fontWeight: 600 }}>
        {row.temperature_label}
      </td>
      <td>${row.spend_day.toFixed(2)}</td>
      <td style={{ color: cpaColor }}>
        {cpa == null ? '—' : fmtMoney2(cpa)}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// 10. Targeting blocks
// ---------------------------------------------------------------------------

function TargetingSection({ blocks }: { blocks: TargetingBlock[] }) {
  return (
    <div className="section">
      <div className="section-title">Audiencias Configuradas por Ad Set</div>
      <div className="grid-3">
        {blocks.map(b => (
          <TargetingCard key={b.id} block={b} />
        ))}
      </div>
    </div>
  );
}

function TargetingCard({ block }: { block: TargetingBlock }) {
  const roleColor = ROLE_COLOR[block.role] ?? 'var(--color-text-secondary)';
  return (
    <div className="card" style={{ borderTop: `3px solid ${roleColor}` }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: roleColor }}>
            {block.role}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
            {block.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: roleColor, fontWeight: 700 }}>
            {block.temperature_label}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
            {block.budget_line}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        {block.rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',
              gap: 8,
              padding: '6px 0',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '0.78rem',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>{row.label}</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 11. CUS Saturation
// ---------------------------------------------------------------------------

function CusSaturationSection({ data }: { data: DashboardData }) {
  const s = data.cus_saturation;
  const thresholds = data.bu.config.fatigue_thresholds;
  const ctrColor =
    s.link_ctr >= data.bu.config.link_ctr_target
      ? 'var(--color-success)'
      : s.link_ctr >= data.bu.config.link_ctr_warn
      ? 'var(--color-warning)'
      : 'var(--color-critical)';
  const freqColor =
    s.freq_7d.value == null || s.freq_7d.value < thresholds.cus_daily_freq_watch
      ? 'var(--color-success)'
      : s.freq_7d.value < thresholds.cus_daily_freq_alert
      ? 'var(--color-warning)'
      : 'var(--color-critical)';

  return (
    <div className="section">
      <div className="section-title">CUS Saturation Monitor</div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
          <div>
            <div className="kpi-label">Reach vs Seed</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-success)' }}>
              {fmtInt(s.reach_vs_seed.reach)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
              {s.reach_vs_seed.multiplier.toFixed(1)}x of{' '}
              {fmtInt(s.reach_vs_seed.seed)} seed
            </div>
            <div className="pacing-bar">
              <div
                className="pacing-fill"
                style={{ width: '100%', background: 'var(--color-success)' }}
              />
            </div>
          </div>
          <div>
            <div className="kpi-label">CUS Daily Freq (7d avg)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: freqColor }}>
              {s.freq_7d.value == null ? '—' : s.freq_7d.value.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
              Peak día: {s.freq_7d.peak_day == null ? '—' : s.freq_7d.peak_day.toFixed(2)} · Lifetime:{' '}
              {s.freq_7d.lifetime == null ? '—' : s.freq_7d.lifetime.toFixed(2)} ({s.freq_7d.days}d)
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                color: 'var(--color-text-secondary)',
                marginTop: 2,
              }}
            >
              Watch &gt;{thresholds.cus_daily_freq_watch.toFixed(1)} · Alert &gt;
              {thresholds.cus_daily_freq_alert.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="kpi-label">CUS Link CTR</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: ctrColor }}>
              {fmtPct(s.link_ctr, 2)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
              Stable = healthy expansion
            </div>
          </div>
          <div>
            <div className="kpi-label">Advantage+ Status</div>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--color-success)',
              }}
            >
              {s.advantage_plus_status}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
              Algorithm finding quality lookalikes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 12. Trends
// ---------------------------------------------------------------------------

function TrendsSection({ trend }: { trend: TrendPoint[] }) {
  return (
    <div className="section">
      <div className="section-title">Trends</div>
      <div className="grid-2">
        <div className="card">
          <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 12 }}>
            Spend + Purchases
          </p>
          <div className="chart-container">
            <SpendPurchasesChart trend={trend} />
          </div>
        </div>
        <div className="card">
          <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 12 }}>
            CTR + CPM
          </p>
          <div className="chart-container">
            <CtrCpmChart trend={trend} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 13. Funnel
// ---------------------------------------------------------------------------

function FunnelSection({ steps }: { steps: FunnelStep[] }) {
  const firstValue = steps[0]?.value ?? 0;
  const last = steps[steps.length - 1];
  const lpToCheckout = steps.length >= 4 ? steps[3].conv_pct_from_prev : null;
  const checkoutToPurchase = last?.conv_pct_from_prev ?? null;
  return (
    <div className="section">
      <div className="section-title">Funnel Analysis</div>
      <div className="card">
        <div className="funnel">
          {steps.map((step, i) => {
            const widthPct =
              i === 0
                ? 100
                : firstValue > 0
                ? Math.max(5, (step.value / firstValue) * 100)
                : 0;
            const opacity = 1 - (i * 0.6) / Math.max(1, steps.length - 1);
            const showDrop =
              step.conv_pct_from_prev != null && step.value > 0;
            return (
              <div className="funnel-step" key={step.label}>
                <span className="funnel-label">{step.label}</span>
                <div className="funnel-bar-bg">
                  <div
                    className="funnel-bar"
                    style={{
                      width: `${widthPct.toFixed(1)}%`,
                      background: 'var(--color-accent)',
                      opacity,
                    }}
                  >
                    {fmtInt(step.value)}
                  </div>
                </div>
                <span className="funnel-value">{fmtInt(step.value)}</span>
                <span className="funnel-drop">
                  {showDrop
                    ? `${fmtPct(step.conv_pct_from_prev!, 1)} conv | ${fmtPct(
                        step.drop_pct_from_prev ?? 0,
                        1
                      )} drop`
                    : ''}
                </span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--color-text-primary)' }}>Key Rates:</strong>{' '}
          LP Views to Checkout: {lpToCheckout != null ? fmtPct(lpToCheckout, 1) : '—'}{' '}
          conversion. Checkout to Purchase:{' '}
          {checkoutToPurchase != null ? fmtPct(checkoutToPurchase, 1) : '—'}.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 14. Ad Performance
// ---------------------------------------------------------------------------

function AdPerformanceSection({
  rows,
  linkCtrTarget,
  linkCtrWarn,
}: {
  rows: AdPerfRow[];
  linkCtrTarget: number;
  linkCtrWarn: number;
}) {
  return (
    <div className="section">
      <div className="section-title">Ad Performance ({rows.length} ads)</div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Spend</th>
              <th>Imp</th>
              <th>Reach</th>
              <th>Link Clicks</th>
              <th>Link CTR</th>
              <th>LP Views</th>
              <th>Purchases</th>
              <th>CPA</th>
              <th>%Budget</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <AdPerfRowView
                key={r.id}
                row={r}
                linkCtrTarget={linkCtrTarget}
                linkCtrWarn={linkCtrWarn}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdPerfRowView({
  row,
  linkCtrTarget,
  linkCtrWarn,
}: {
  row: AdPerfRow;
  linkCtrTarget: number;
  linkCtrWarn: number;
}) {
  const ctrColor =
    row.link_ctr >= linkCtrTarget
      ? 'var(--color-success)'
      : row.link_ctr >= linkCtrWarn
      ? 'var(--color-warning)'
      : 'var(--color-critical)';

  const statusColor =
    row.status_dot === 'winner'
      ? 'var(--color-success)'
      : row.status_dot === 'watch'
      ? 'var(--color-text-secondary)'
      : row.status_dot === 'dead'
      ? 'var(--color-text-secondary)'
      : 'var(--color-accent)';

  const waveBorder =
    row.wave === 'W1'
      ? '1px solid var(--color-text-secondary)'
      : '1px solid var(--color-accent)';
  const waveColor =
    row.wave === 'W1' ? 'var(--color-text-secondary)' : 'var(--color-accent)';

  return (
    <tr>
      <td>
        <span className={`status-dot status-${row.status_dot}`} />
        <span
          style={{
            fontSize: '0.65rem',
            padding: '1px 4px',
            borderRadius: 3,
            background: 'var(--color-bg-hover)',
            marginRight: 4,
          }}
        >
          {row.format}
        </span>
        <span
          style={{
            fontSize: '0.6rem',
            padding: '1px 3px',
            borderRadius: 3,
            border: waveBorder,
            color: waveColor,
            marginRight: 4,
          }}
        >
          {row.wave}
        </span>
        {row.name}{' '}
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.7rem' }}>
          ({row.adset_role})
        </span>
      </td>
      <td>${row.spend.toFixed(2)}</td>
      <td>{fmtInt(row.impressions)}</td>
      <td>{fmtInt(row.reach)}</td>
      <td>{fmtInt(row.link_clicks)}</td>
      <td style={{ color: ctrColor }}>{fmtPct(row.link_ctr, 2)}</td>
      <td>{fmtInt(row.lp_views)}</td>
      <td>{row.purchases}</td>
      <td>{row.cpa == null ? '—' : fmtMoney2(row.cpa)}</td>
      <td>{fmtPct(row.pct_of_budget, 1)}</td>
      <td>
        <span style={{ fontSize: '0.75rem', color: statusColor }}>
          {row.manual_status}
        </span>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// 15. Matchups
// ---------------------------------------------------------------------------

function MatchupsSection({ rows }: { rows: MatchupRow[] }) {
  return (
    <div className="section">
      <div className="section-title">Format Test: Video vs Static</div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Matchup</th>
              <th>Video CTR</th>
              <th>Static CTR</th>
              <th>Video Purchases</th>
              <th>Static Purchases</th>
              <th>Early Winner</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.label}</td>
                <td>{fmtPct(r.video_ctr, 2)}</td>
                <td>{fmtPct(r.static_ctr, 2)}</td>
                <td>{r.video_purchases}</td>
                <td>{r.static_purchases}</td>
                <td>{r.early_winner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 16. Frequency distribution
// ---------------------------------------------------------------------------

function FrequencySection({ scopes }: { scopes: FrequencyScope[] }) {
  return (
    <div className="section">
      <div className="section-title">Frequency Distribution (last 7d)</div>
      <div className="card">
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            marginBottom: 14,
          }}
        >
          % del reach por cantidad de impressions vistas. Zona saludable:
          mayoría en 1-3. Zona de fatigue: reach acumulado en 6+ impressions
          supera ~15-25%.
        </div>
        {scopes.map(scope => (
          <FrequencyBar key={scope.scope} scope={scope} />
        ))}
        <div style={{ overflowX: 'auto', marginTop: 18 }}>
          <table>
            <thead>
              <tr>
                <th>Scope</th>
                <th>Reach</th>
                <th>Avg Freq</th>
                <th>1x</th>
                <th>2-3x</th>
                <th>4-5x</th>
                <th>6-10x</th>
                <th>11-20x</th>
                <th>21+x</th>
              </tr>
            </thead>
            <tbody>
              {scopes.map(scope => (
                <tr key={scope.scope}>
                  <td style={{ fontWeight: 700 }}>{scope.scope}</td>
                  <td>{fmtInt(scope.reach)}</td>
                  <td>{scope.avg_freq.toFixed(2)}</td>
                  <td style={{ color: FREQ_COLORS.b1, fontWeight: 600 }}>
                    {fmtPct(scope.buckets.b1, 1)}
                  </td>
                  <td style={{ color: FREQ_COLORS.b23, fontWeight: 600 }}>
                    {fmtPct(scope.buckets.b23, 1)}
                  </td>
                  <td style={{ color: FREQ_COLORS.b45, fontWeight: 600 }}>
                    {fmtPct(scope.buckets.b45, 1)}
                  </td>
                  <td style={{ color: FREQ_COLORS.b610, fontWeight: 600 }}>
                    {fmtPct(scope.buckets.b610, 1)}
                  </td>
                  <td style={{ color: FREQ_COLORS.b1120, fontWeight: 600 }}>
                    {fmtPct(scope.buckets.b1120, 1)}
                  </td>
                  <td style={{ color: FREQ_COLORS.b21plus, fontWeight: 600 }}>
                    {fmtPct(scope.buckets.b21plus, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FrequencyBar({ scope }: { scope: FrequencyScope }) {
  const statusColor = FREQ_STATUS_COLOR[scope.status];
  const segments: Array<{
    key: keyof typeof FREQ_COLORS;
    label: string;
    pct: number;
  }> = [
    { key: 'b1', label: '1', pct: scope.buckets.b1 },
    { key: 'b23', label: '2-3', pct: scope.buckets.b23 },
    { key: 'b45', label: '4-5', pct: scope.buckets.b45 },
    { key: 'b610', label: '6-10', pct: scope.buckets.b610 },
    { key: 'b1120', label: '11-20', pct: scope.buckets.b1120 },
    { key: 'b21plus', label: '21+', pct: scope.buckets.b21plus },
  ];
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {scope.scope}{' '}
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>
            · reach {fmtInt(scope.reach)} · avg freq {scope.avg_freq.toFixed(2)}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>6+ impressions:</span>{' '}
          <span style={{ color: statusColor, fontWeight: 700 }}>
            {fmtPct(scope.pct_6plus, 1)} · {scope.status}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          height: 26,
          borderRadius: 4,
          overflow: 'hidden',
          background: '#1e293b',
        }}
      >
        {segments
          .filter(seg => seg.pct > 0)
          .map(seg => (
            <div
              key={seg.key}
              style={{
                width: `${seg.pct}%`,
                background: FREQ_COLORS[seg.key],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0a0a1a',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
              title={`${seg.label} imp: ${seg.pct.toFixed(1)}%`}
            >
              {seg.pct >= 7 ? seg.label : ''}
            </div>
          ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 17. Threshold alerts
// ---------------------------------------------------------------------------

function AlertsSection({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="section">
      <div className="section-title">Threshold Alerts</div>
      <div className="alerts-list">
        {alerts.map((a, i) => (
          <div key={i} className={`card card-alert card-alert-${a.severity}`}>
            <span className="alert-type">{a.type}</span>
            <span className="alert-msg">{a.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 18. Hypotheses
// ---------------------------------------------------------------------------

function HypothesesSection({ items }: { items: HypothesisItem[] }) {
  return (
    <div className="section">
      <div className="section-title">Hypothesis Tracking</div>
      <div className="grid-3">
        {items.map(h => {
          const style =
            h.status === 'validated'
              ? { background: 'rgba(34,197,94,0.15)', color: 'var(--color-success)' }
              : h.status === 'rejected'
              ? { background: 'rgba(239,68,68,0.15)', color: 'var(--color-critical)' }
              : { background: 'rgba(59,130,246,0.15)', color: 'var(--color-accent)' };
          return (
            <div key={h.code} className="card hypothesis-card">
              <div className="hyp-id">{h.code}</div>
              <div className="hyp-statement">{h.statement}</div>
              <div className="hyp-meta">
                <strong>Current:</strong> {h.current_reading}
              </div>
              <div className="hyp-meta">
                <strong>Success:</strong> {h.success_criteria}
              </div>
              <div className="hyp-status" style={style}>
                {h.status.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 19. Watch signals
// ---------------------------------------------------------------------------

function WatchSignalsSection({ items }: { items: WatchSignalItem[] }) {
  return (
    <div className="section">
      <div className="section-title">What to Watch Next</div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Signal</th>
              <th>Threshold</th>
              <th>Current</th>
              <th>Status</th>
              <th>Action if Breached</th>
            </tr>
          </thead>
          <tbody>
            {items.map((sig, i) => {
              const badgeClass =
                sig.status === 'ok'
                  ? 'badge-green'
                  : sig.status === 'watch'
                  ? 'badge-yellow'
                  : 'badge-red';
              const badgeLabel =
                sig.status === 'ok'
                  ? 'OK'
                  : sig.status === 'watch'
                  ? 'WATCH'
                  : 'BREACH';
              return (
                <tr key={i}>
                  <td>{sig.label}</td>
                  <td>{sig.threshold}</td>
                  <td>{sig.current}</td>
                  <td>
                    <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                  </td>
                  <td
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {sig.action}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 20. Footer
// ---------------------------------------------------------------------------

function Footer({ reportDate }: { reportDate: string }) {
  return (
    <div className="footer">
      <span>Generated by Afluence Campaign Monitor · Data: Meta API + Supabase</span>
      <span>Next report: {addDaysYmd(reportDate, 1)}</span>
    </div>
  );
}
