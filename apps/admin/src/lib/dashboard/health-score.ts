import type { AggregatedMetrics } from './adapter';
import type { KpiTargets } from '@marketing-funnel/meta-ads';

/**
 * Composite health score 0-100 based on 3 normalized signals.
 * Kept intentionally simple — Fase 2 will split into Economics / Signal / Creative.
 */
export function computeHealthScore(metrics: AggregatedMetrics, targets: KpiTargets): number {
  const economicsScore = economics(metrics, targets);
  const signalScore = signal(metrics);
  const creativeScore = creative(metrics);
  const weighted = economicsScore * 0.5 + signalScore * 0.25 + creativeScore * 0.25;
  return Math.round(clamp(weighted, 0, 100));
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

/** How close the BU is to hitting its target CPA / ROAS. */
function economics(m: AggregatedMetrics, t: KpiTargets): number {
  let sub = 50;
  if (t.target_roas && m.roas > 0) {
    sub = clamp((m.roas / t.target_roas) * 100, 0, 100);
  } else if (t.target_cpa && m.cpa > 0) {
    // Lower CPA is better: ratio target / actual, clamped.
    sub = clamp((t.target_cpa / m.cpa) * 100, 0, 100);
  }
  return sub;
}

/** Lead/purchase signal strength. Proxy: leads per 1000 impressions. */
function signal(m: AggregatedMetrics): number {
  if (m.impressions === 0) return 0;
  const leadsPerK = (m.leads / m.impressions) * 1000;
  // 0 leads/k → 0, 10 leads/k → 100. Tuneable.
  return clamp(leadsPerK * 10, 0, 100);
}

/** Creative freshness: CTR vs. frequency. High CTR, moderate freq is ideal. */
function creative(m: AggregatedMetrics): number {
  const ctrScore = clamp(m.ctr * 100 * 20, 0, 100); // 5% CTR → 100
  const freqPenalty = m.frequency > 3 ? clamp((m.frequency - 3) * 20, 0, 60) : 0;
  return clamp(ctrScore - freqPenalty, 0, 100);
}

export function scoreColor(score: number): string {
  if (score >= 75) return 'var(--ok)';
  if (score >= 50) return 'var(--warn)';
  return 'var(--bad)';
}
